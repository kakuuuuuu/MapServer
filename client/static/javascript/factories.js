//////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////Socket Factory/////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
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
//
//
//   return factory
// })
market_module.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});


market_module.factory('userFactory', function($http, $location, $window){
  var factory = {};
  var user = {};
  var error = [];
  factory.getUser = function(callback){
    $http.get('/getuser').success(function(output){
      user = output;
      callback(user)
    })
  }
  return factory;
})
market_module.factory('streamFactory', function($http, $location){
  var streams = [];
  var factory = {};
  factory.gameSearch = function(search, callback){
    $http.get('https://api.twitch.tv/kraken/search/games?q=' + search + '&type=suggest').success(function(http){
      callback(http)
    })
  }
  factory.search = function(game, callback){
    $http.get('https://api.twitch.tv/kraken/streams?game=' + game.name).success(function(http){
      if(http.streams.length>0){
        callback(http.streams[0].channel.name, game)
      }
      else{
        callback('nothing', game)
      }
    })
  }
  factory.amazon = function(game, callback){
    info={name:game.name}
    $http.post('/searchgames',info).success(function($http){
      callback($http)
    })
  }
  return factory;
})
market_module.factory('roomFactory', function($http, $location){

  var rooms = [];
  var room = {};
  var factory = {};
  factory.getRooms = function(callback){
    $http.get('/getuser').success(function(output){
      user = output;
      $http.get('/getrooms/'+user._id).success(function(results){
        rooms = results;
        callback(rooms);
      })
    })
  }
  factory.getRoom = function(id, callback){
    $http.get('/getroom/'+id).success(function(result){
      room = result;
      callback(room);
    })
  }
  factory.addRoom = function(newRoom, user, callback){
    info = {room: newRoom, user: user}
    $http.post('/createRoom', info).success(function($http){
      callback($http)
    })
  }
  factory.getLocation = function(callback){
    $http.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyC3SQ3ovU47it6DB23_yZTfCbWTOT3r_1E',{}).success(function(result){
      callback(result)
    })
  }
  factory.addComment = function(id, newComment, user, callback){
    info = {comment: newComment, user: user}
    $http.post('/createComment/'+id, info).success(function($http){
      callback($http)
    })
  }
  factory.addUser = function(id, newUser, callback){
    info = {user: newUser}
    $http.post('/roomUser/'+id, info).success(function($http){
      callback($http)
    })
  }
  factory.changeCoords = function(id, coords, name, callback){
    info = {coords: coords, destination: name}
    console.log(info)
    $http.post('/changeCoords/'+id, info).success(function($http){
      callback($http)
    })
  }

  return factory;
})
