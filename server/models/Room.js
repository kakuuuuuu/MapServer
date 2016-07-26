var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Schema = mongoose.Schema;

// define the schema for our user model
var roomSchema = mongoose.Schema({
  _owner: {type: Schema.Types.ObjectId, ref: 'User'},
  _users: [{type: Schema.Types.ObjectId, ref: 'User'}],
  _comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
  latitude: {type: Number},
  longitude: {type: Number},
  destination: {type: String},
  namespace: {type: String},
  name: {type: String}
})
roomSchema.plugin(deepPopulate, {
  whitelist: [
    '_users',
    '_comments._user'
  ]
})
mongoose.model('Room', roomSchema);
