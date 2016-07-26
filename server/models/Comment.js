var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commentSchema = new mongoose.Schema({
  text: {type: String, required: [true, 'Comment field cannot be empty']},
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
  _room: {type: Schema.Types.ObjectId, ref: 'Room'}
})
mongoose.model('Comment', commentSchema);
