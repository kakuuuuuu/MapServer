'use strict';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Login Controller
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
market_module.controller('registerController', function($scope, userFactory, $localStorage, $location, $window){
  // Immediately asks server for session data on logged in user
  userFactory.getUser(function(data){
    $scope.user=data;
    // Stores user data in HTML5 local storage
    localStorage.currentuser = JSON.stringify($scope.user)
  })
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAP SHARE
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Room Controller
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
market_module.controller('roomsController', function($scope, socket, roomFactory, userFactory, $location, $http){
  // leaves all rooms when returned to lobby
  socket.emit('leaverooms')
  // grabs current user from local storage
  if(localStorage.currentuser){
    $scope.user = JSON.parse(localStorage.currentuser)
  }
  // calls factory to return rooms user is invited to
  roomFactory.getRooms(function(data){
    $scope.rooms=data;
  })
  $scope.addRoom = function(){
    // calls factory to add room to database
    roomFactory.addRoom($scope.newRoom, $scope.user, function(data){
      // empties new room field
      $scope.newRoom = {};
      // changes page to new room
      $location.url('/room/'+data._id)
    })
  }
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Map Controller
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
market_module.controller('mapsController', function($scope, userFactory, roomFactory, socket, $routeParams, $location, $http, uiGmapGoogleMapApi, $anchorScroll){
  // grabs room id from url parameters
  var id = $routeParams.id;
  // initializes loading gif
  $scope.loading = true
  // calls factory to return room data corresponding to room id
  roomFactory.getRoom(id, function(data){
    $scope.room = data
    // calls factory to grab current location
    // Note: cannot use HTML5 geolocation due to chrome requiring secure server to use
    roomFactory.getLocation(function(data){
      // assigns current latitude and longitude to object for reference in Angular-Google Maps module
      $scope.map = {
        latitude: data.location.lat,
        longitude: data.location.lng
      }
      // adds current location marker
      $scope.markers.push({
        id:"currentlocation",
        coords: {
          latitude: data.location.lat,
          longitude: data.location.lng
        },
        icon: 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png',
        title: "Current Location"
      })
      // plots saved destination if room has one
        if($scope.room.latitude && $scope.room.longitude){
          $scope.addPoint({lat: $scope.room.latitude, lng: $scope.room.longitude}, $scope.room.destination)
        }
        else{
          // stops loading gif
          $scope.loading = false;
        }
    })
  })
  // grabs current user from local storage
  $scope.user = JSON.parse(localStorage.currentuser)
  // joins room
  socket.emit('joinRoom', id)
  // confirms user has joined room
  socket.on('roomJoined', function(data){
    console.log(data)
  })
  // adds comment
  $scope.addComment = function(){
    // calls factory to save comment to database
    roomFactory.addComment(id, $scope.newComment, $scope.user, function(data){
      data._user = $scope.user
      // emits comment to all connected users
      socket.emit('sendMessage', {room: id, user:$scope.user, message: $scope.newComment.text})
      $anchorScroll()
      // empties comment field
      $scope.newComment = {};
    })
  }
  // adds comment to page
  socket.on('broadcastMessage', function(data){
    $scope.room._comments.push({_room: data.room, _user: data.user, text:data.message});
  })
  // invite user to room
  $scope.addUser = function(){
    // calls factory to add user to room in database
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
// initializing map parameters for Angular-Google Maps
  $scope.map = {
  	center: {
  		latitude: 39.8282,
  		longitude: -98.5795
  	},
  	zoom: 4,
    pan: true
  };
  // initializing markers for Angular-Google Maps
   $scope.markers = [];
   // initializing polyline parameters for Angular-Google Maps
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
  $scope.map.control = {};
  // Initializes map when ready
  uiGmapGoogleMapApi.then(function(maps){
    // Adds new destination to map
    $scope.addPoint = function(location, name){
      if($scope.markers.length==2){
        // Pops previous destination from list if there is one
        $scope.markers.pop()
        // Empties polyline list if there is a previous destination
        $scope.polylines[0].path=[];
      }
      // initializes new marker
      var newMarker = {
        id: 'dest',
        coords: {latitude: location.lat, longitude: location.lng},
        title: "Destination: \n"+name
      }
      // adds new marker to map
      $scope.markers.push(newMarker)
      $scope.getDirections()
    }
    // calculates and plots polyline to display route
    $scope.getDirections = function(){
      // calls google maps directions api service
      var directionsService = new maps.DirectionsService();
      // requests polyline data from current location to destination coordinates
      var request = {
    		origin: ""+$scope.markers[0].coords.latitude+","+$scope.markers[0].coords.longitude+"",
    		destination: ""+$scope.markers[1].coords.latitude+","+$scope.markers[1].coords.longitude+"",
    		travelMode: maps.TravelMode['DRIVING'],
    	};
      // calculates polyline from polyline data
      directionsService.route(request, function(response, status) {
        $scope.polylines[0].path = response.routes[0].overview_path
        $scope.loading=false;
      });
    }
  });
  // changes coordiantes for all connected users
  socket.on('changeCoords', function(data){
    var location = {lat: data.lat, lng: data.lng}
    $scope.addPoint({lat: data.lat, lng: data.lng}, data.name)
  })
  // changes current destination
  $scope.chooseLocation = function(){
    // starts loading gif
    $scope.loading=true
    // requests data from google places api
    $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+$scope.location.name+'&key=AIzaSyC3SQ3ovU47it6DB23_yZTfCbWTOT3r_1E').then(function($http){
      // executes if results are returned
      if($http.results.length>0){
        roomFactory.changeCoords(id, $http.results[0].geometry.location, $scope.location.name, function(){
          // tells server to change coordiantes for all connected users
          socket.emit('coords', {room: id, lat: $http.results[0].geometry.location.lat, lng: $http.results[0].geometry.location.lng, name: $scope.location.name})
          // empties location field
          $scope.location = {};
        })
      }
      else{
        // stops loading gif
        $scope.loading=false;
        // empties location field
        $scope.location = {};
      }
    })
}
})
