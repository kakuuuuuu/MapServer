var mongoose = require('mongoose');
var User = mongoose.model('User');
module.exports = {
  getuser: function(req, res){
    res.json(req.user)
  },

}
