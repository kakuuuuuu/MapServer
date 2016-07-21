var express = require('express');
var app = express();
var bodyParser =require('body-parser');
var path = require('path');



require('./server/config/mongoose.js');

app.use(bodyParser.json());
app.use(express.static(__dirname + "/client/static"))


var routes_setter = require('./server/config/routes.js');
routes_setter(app);

var server = app.listen(8000,function(){
  console.log('Mean Belt on port 8000')
})


var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
  console.log(socket.id);
  socket.on('location_sumbitted', function(data){
    console.log(data)
    io.emit('location_recieved', data)
  })
})
