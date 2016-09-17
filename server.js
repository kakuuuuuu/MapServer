// server.js

// set up ======================================================================
// get all the tools we need
var compression  = require('compression');
var express      = require('express');
var app          = express();
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var path         = require('path');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var cors         = require('cors')
require('./server/config/mongoose.js');


// configuration ===============================================================
require('./server/config/passport')(passport); // pass passport for configuration

// set up our express application
// app.use(morgan('dev')); // log every request to the console
app.use(compression());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded()); // get information from html forms
app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs'); // set up ejs for templating
var oneYear = 1 * 365 * 24 * 60 * 60 * 1000
app.use(express.static(__dirname + "/client/static",{ maxAge: oneYear }))
app.set('views', path.join(__dirname,'./client/views'));
// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./server/config/routes.js')(app, passport, path);

var server = app.listen(7000,function(){
  console.log('MapServer on port 7000')
})


var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
  var rooms = []
  console.log(socket.id);
  socket.on('joinRoom', function(data){
    console.log('here')
    socket.join(data)
    console.log(data)
    rooms.push(data)
    socket.emit('roomJoined', 'You are in room '+data)
  })
  socket.on('location_sumbitted', function(data){
    console.log(data)
    io.emit('location_recieved', data)
  })
  socket.on('sendMessage', function(data){
    console.log(data)
    io.to(data.room).emit('broadcastMessage', data)
  })
  socket.on('leaverooms', function(){
    for(var x in rooms){
      socket.leave(rooms[x])
    }
  })
  socket.on('coords', function(data){
    console.log(data)
    io.to(data.room).emit('changeCoords', data)
  })
})
