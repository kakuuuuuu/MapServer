var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = mongoose.Schema({
    local            : {
        name         : String,
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        picture      : String,
        url          : String,
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String,
        picture      : String,
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        picture      : String,
        url          : String,
    },
    _rooms: [{type: Schema.Types.ObjectId, ref: 'Room'}],
    _comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
mongoose.model('User', userSchema);
