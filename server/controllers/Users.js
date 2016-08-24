var mongoose = require('mongoose');
var User = mongoose.model('User');
module.exports = {
  getuser: function(req, res){
    res.json(req.user)
  },
  amazonsearch: function(req, res, client){
    console.log('searching')
    console.log(req.body)
    client.itemSearch({
      searchIndex: 'VideoGames',
      keywords: req.body.name,
      responseGroup: 'ItemAttributes,Offers,Images'
    }).then(function(results){
      console.log(results);
      res.json(results)
    }).catch(function(err){
      console.log(err);
      res.json({error:err})
    });
  }
}
