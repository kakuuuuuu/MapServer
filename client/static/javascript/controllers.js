'use strict';

market_module.controller('registerController', function($scope, userFactory, $localStorage, $location, $window){
  userFactory.getUser(function(data){
    $scope.user=data;
    localStorage.currentuser = JSON.stringify($scope.user)
  })
})
market_module.controller('streamsController', function($scope, userFactory, streamFactory, $routeParams){
  var element = angular.element(document.querySelector('#stream'));


  // element.html("<iframe src="+$scope.topStream+" height='400' width='680' frameborder='0' scrolling='no' allowfullscreen='true'></iframe>")
  $scope.gameSearch = function(data){
    $scope.options=[];
    streamFactory.gameSearch($scope.newSearch, function(games){
      $scope.games = games;
      })
    $scope.newSearch = '';
  }
  $scope.search = function(game){
    $scope.games = {games:[game]}

    streamFactory.amazon(game, function(data){
      $scope.options=data;
    })
    streamFactory.search(game, function(streamer,game){
      if(streamer!='nothing'){
        $scope.streamer = streamer;
        element.html("<iframe src='http://player.twitch.tv?channel={"+$scope.streamer+"}' height='400' width='100%'  frameborder='0' scrolling='no' allowfullscreen='true'></iframe>")
        $scope.streamgame = game.name
      }
    })

  }

})
market_module.controller('roomsController', function($scope, socket, roomFactory, userFactory, $location, $http){
  socket.emit('leaverooms')
  $scope.user = JSON.parse(localStorage.currentuser)
  roomFactory.getRooms(function(data){
    $scope.rooms=data;
  })
  $scope.addRoom = function(){
    roomFactory.addRoom($scope.newRoom, $scope.user, function(data){
      $scope.newRoom = {};
      $location.url('/room/'+data._id)
    })
  }
})

market_module.controller('mapsController', function($scope, userFactory, roomFactory, socket, $routeParams, $location, $http, uiGmapGoogleMapApi, $anchorScroll){
  // market_module.factory('socketFactory', function($http){
  //   var factory = {};
  //   var socket = io.connect();
  //   factory.joinRoom = function(roomid){
  //     socket.emit('joinRoom', roomid)
  //   }
  //   socket.on('roomJoined', function(data){
  //     console.log(data)
  //   })
  //   factory.sendMessage = function(user, roomid, message){
  //     socket.emit('sendMessage', {user, room: roomid, message: message})
  //   }
  var id = $routeParams.id;


  $scope.loading = true
  roomFactory.getRoom(id, function(data){
    $scope.room = data
    console.log($scope.room._comments)
    console.log($scope.room._users)
    roomFactory.getLocation(function(data){
      $scope.map = {
        latitude: data.location.lat,
        longitude: data.location.lng
      }
      $scope.markers.push({
        id:"currentlocation",
        coords: {
          latitude: data.location.lat,
          longitude: data.location.lng
        },
        icon: 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png',
        title: "Current Location"
      })
        if($scope.room.latitude && $scope.room.longitude){
          $scope.addPoint({lat: $scope.room.latitude, lng: $scope.room.longitude}, $scope.room.destination)
        }
        else{
          $scope.loading = false;
        }
    })
  })

  $scope.user = JSON.parse(localStorage.currentuser)

  socket.emit('joinRoom', id)
  socket.on('roomJoined', function(data){
    console.log(data)
  })

  $location.hash('bottom');
  $scope.addComment = function(){
    roomFactory.addComment(id, $scope.newComment, $scope.user, function(data){
      data._user = $scope.user
      socket.emit('sendMessage', {room: id, user:$scope.user, message: $scope.newComment.text})

      $anchorScroll()
      $scope.newComment = {};
    })
  }
  socket.on('broadcastMessage', function(data){
    console.log(data)
    $scope.room._comments.push({_room: data.room, _user: data.user, text:data.message});
    console.log($scope.room._comments)
  })
  $scope.addUser = function(){
    roomFactory.addUser(id, $scope.newUser, function(data){
      if(data.error){
        console.log(data.error)
      }
      else{
        $scope.room._users.push(data);
      }
      $scope.newUser = {};
    })
  }
  $scope.$watch(function() {
        return $scope.markers;
    }, function(newValue, oldValue) {
        console.log('markers changed in $watch');
        console.log($scope.markers);
    },
    true
);
  $scope.map = {
  	center: {
  		latitude: 39.8282,
  		longitude: -98.5795
  	},
  	zoom: 4,
    pan: true
  };
   $scope.markers = [];
   $scope.polylines = [{
     id:'route',
     path: [],
     stroke: {
                 color: '#6060FB',
                 weight: 5
             },
     fit: true,
     visible: true
   }];
  //  var onSuccess = function(position) {
  //   $scope.map = {
  //       latitude: position.coords.latitude,
  //       longitude: position.coords.longitude
  //   };
  //
  //
  //
  //   $scope.$apply();
  //   if($scope.room.latitude && $scope.room.longitude){
  //     $scope.addPoint({lat: $scope.room.latitude, lng: $scope.room.longitude}, $scope.room.destination)
  //   }
  //   else{
  //     $scope.loading = false;
  //   }
  // }
  // function onError(error) {
  //     console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
  // }
  // navigator.geolocation.getCurrentPosition(onSuccess, onError);
  $scope.map.control = {};
  uiGmapGoogleMapApi.then(function(maps){

    console.log(maps)
    $scope.addPoint = function(location, name){
      if($scope.markers.length==2){
        $scope.markers.pop()
        $scope.polylines[0].path=[];
      }
      var newMarker = {
        id: 'dest',
        coords: {latitude: location.lat, longitude: location.lng},
        title: "Destination: \n"+name
      }
      $scope.markers.push(newMarker)

      $scope.getDirections()
      console.log($scope.markers)
    }
    $scope.getDirections = function(){
      var directionsService = new maps.DirectionsService();
      var request = {
    		origin: ""+$scope.markers[0].coords.latitude+","+$scope.markers[0].coords.longitude+"",
    		destination: ""+$scope.markers[1].coords.latitude+","+$scope.markers[1].coords.longitude+"",
    		travelMode: maps.TravelMode['DRIVING'],
    	};

      directionsService.route(request, function(response, status) {

        $scope.polylines[0].path = response.routes[0].overview_path

        $scope.loading=false;
      });
    }
  });
  socket.on('changeCoords', function(data){
    console.log('changing coords')
    var location = {lat: data.lat, lng: data.lng}
    console.log(data)
    console.log(location)
    $scope.addPoint({lat: data.lat, lng: data.lng}, data.name)
  })
  $scope.chooseLocation = function(){
    $scope.loading=true
    $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+$scope.location.name+'&key=AIzaSyC3SQ3ovU47it6DB23_yZTfCbWTOT3r_1E').success(function($http){
      console.log($http)
      if($http.results.length>0){
        roomFactory.changeCoords(id, $http.results[0].geometry.location, $scope.location.name, function(){
          console.log("LOCATION")
          console.log($http.results[0].geometry.location)
          socket.emit('coords', {room: id, lat: $http.results[0].geometry.location.lat, lng: $http.results[0].geometry.location.lng, name: $scope.location.name})
          // $scope.addPoint($http.results[0].geometry.location, $scope.location.name)
          $scope.location = {};
        })
      }
      else{
        $scope.loading=false;
        $scope.location = {};
      }
    })
}
})
