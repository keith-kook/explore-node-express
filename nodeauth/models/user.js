var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

// User schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  }, 
  password: {
    type: String, required: true, bcrypt:true
  },
  email: {
    type: String
  },
  name: {
    type: String
  }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) return callback(err);
    callback(null, isMatch);
  });
}

module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}
module.exports.createUser = function(newUser, callback){
  var hash = bcrypt.hashSync(newUser.password, 8);
  newUser.password = hash;
  newUser.save(callback);
}