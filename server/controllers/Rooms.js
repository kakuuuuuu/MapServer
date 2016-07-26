var mongoose = require('mongoose');
var User = mongoose.model('User');
var Room = mongoose.model('Room');
var Comment = mongoose.model('Comment');

module.exports = {
  getAll: function(req, res){
    Room.find({_users: req.params.id}, function(err, rooms){
      if(err){
        console.log(err)
      }
      else{
        res.json(rooms);
      }
    })
  },
  getOne: function(req, res){
    Room.findOne({_id:req.params.id})
    .deepPopulate('_comments._user _users')
    .exec(function(err, room){
      if(err){
        console.log(err)
      }
      else{
        res.json(room)
      }
    })
  },
  create: function(req, res){
    User.findOne({_id:req.body.user._id}, function(err, user){
      if(err){
        console.log(err)
      }
      else{
        var room = new Room({_owner: req.body.user._id, _users:[req.body.user._id],_comments:[], name:req.body.room.name, namespace:req.body.room.name})
        user._rooms.push(room);
        user.save(function(err){
          if(err){
            console.log(err)
          }
          else{
            room.save(function(err){
              if(err){
                console.log(err)
              }
              else{
                res.json(room)
              }
            })
          }
        })
      }
    })
  },
  createComment: function(req, res){
    Room.findOne({_id: req.params.id}, function(err, room){
      if(err){
        console.log(err)
      }
      else{
        User.findOne({_id: req.body.user._id}, function(err, user){
          if(err){
            console.log(err)
          }
          else{
            var comment = new Comment({text: req.body.comment.text, _user: req.body.user._id, _room: req.params.id})
            room._comments.push(comment)
            room.save(function(err){
              if(err){
                console.log(err)
              }
              else{
                user._comments.push(comment)
                user.save(function(err){
                  if(err){
                    console.log(err)
                  }
                  else{
                    comment.save(function(err){
                      if(err){
                        console.log(err)
                      }
                      else{
                        res.json(comment)
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  coords: function(req, res){
    Room.findByIdAndUpdate(req.params.id, {latitude: req.body.coords.lat, longitude: req.body.coords.lng, destination: req.body.destination}, function(err, room){
      if(err){
        console.log(err)
      }
      else{
        console.log('here')
        res.json(room)
      }
    })
  },
  addUser: function(req, res){
    Room.findOne({_id: req.params.id}, function(err, room){
      if(err){
        console.log(err)
      }
      else{
        User.findOne({'local.email': req.body.user.email}, function(err, user){
          console.log(user)
          if(err){
            res.json({error: 'User does not exist'})
          }
          else if(user === null){
            res.json({error: 'User does not exist'})
          }
          else if(room._users.indexOf(user._id)!=-1){
            console.log('already in')
            res.json({error: 'User already in the room'})
          }
          else{
            room._users.push(user)
            room.save(function(err){
              if(err){
                console.log(err)
              }
              else{
                user._rooms.push(room)
                user.save(function(err){
                  if(err){
                    console.log(err)
                  }
                  else{
                    res.json(user)
                  }
                })
              }
            })
          }
        })
      }
    })
  }
}
