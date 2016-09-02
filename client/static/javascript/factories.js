///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SOCKETS FACTORY
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
market_module.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    // prototyping response behavior
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    // prototyping request behavior
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// USER FACTORY
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
market_module.factory('userFactory', function($http, $location, $window){
  var factory = {};
  var user = {};
  var error = [];
  // Requests user data from server stored in session
  factory.getUser = function(callback){
    $http.get('/getuser').success(function(output){
      user = output;
      callback(user)
    })
  }
  return factory;
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STREAM FACTORY
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
market_module.factory('streamFactory', function($http, $location){
  var streams = [];
  var factory = {};
  // Requests game data from Twitch API
  factory.gameSearch = function(search, callback){
    $http.get('https://api.twitch.tv/kraken/search/games?q=' + search + '&type=suggest').success(function(http){
      callback(http)
    })
  }
  // Requests streamers data from Twitch API
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
  // Requests server to retrieve data from Amazon Product Advertisement API
  factory.amazon = function(game, callback){
    info={name:game.name}
    $http.post('/searchgames',info).success(function($http){
      callback($http)
    })
  }
  return factory;
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ROOM/MAP FACTORY
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
market_module.factory('roomFactory', function($http, $location){

  var rooms = [];
  var room = {};
  var factory = {};
  // Requests list of rooms user is invited to from server
  factory.getRooms = function(callback){
    $http.get('/getuser').success(function(output){
      user = output;
      $http.get('/getrooms/'+user._id).success(function(results){
        rooms = results;
        callback(rooms);
      })
    })
  }
  // Requests room data from server by room id
  factory.getRoom = function(id, callback){
    $http.get('/getroom/'+id).success(function(result){
      room = result;
      callback(room);
    })
  }
  // Requests server to add room to database
  factory.addRoom = function(newRoom, user, callback){
    info = {room: newRoom.name, user: user}
    $http.post('/createRoom', info).success(function($http){
      callback($http)
    })
  }
  // Requests current location from Google Geocoder
  factory.getLocation = function(callback){
    $http.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyC3SQ3ovU47it6DB23_yZTfCbWTOT3r_1E',{}).success(function(result){
      callback(result)
    })
  }
  // Requests server to add comment to database
  factory.addComment = function(id, newComment, user, callback){
    info = {comment: newComment, user: user}
    $http.post('/createComment/'+id, info).success(function($http){
      callback($http)
    })
  }
  // Requests server to add user to room
  factory.addUser = function(id, newUser, callback){
    info = {user: newUser}
    $http.post('/roomUser/'+id, info).success(function($http){
      callback($http)
    })
  }
  // Requests server to update current coordinates in database
  factory.changeCoords = function(id, coords, name, callback){
    info = {coords: coords, destination: name}
    console.log(info)
    $http.post('/changeCoords/'+id, info).success(function($http){
      callback($http)
    })
  }
  return factory;
})
