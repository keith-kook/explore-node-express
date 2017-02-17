var express = require('express');
var router = express.Router();
var multer=require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {
    'title': 'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    'title': 'Login'
  });
});

router.post('/register', function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  
  //console.log(req.body.name);
  // Handle file upload
  
  /*
  var upload = multer({ dest: './uploads' })
  var profileImg = upload.single('profileimage');
  // console.log(typeof req.files.profileimage);
  // Check for image field
  if(profileImg.image != 'undefined') {
    console.log('Uploading file ...');

    var profileImageOriginalName  = profileImg.originalname;
    var profileImageName          = profileImg.name;
    var profileImageMime          = profileImg.mimetype;
    var profileImagePath          = profileImg.path;
    var profileImageExt           = profileImg.extenstion;
    var profileImageSize          = profileImg.size;
    
    return;
  } else { 
    var profileImageName = 'noimage.png';
  }
  */
  
  // Form validataion
  req.checkBody("name",'Name is required').notEmpty();
  req.checkBody("email",'Email is required').notEmpty();
  req.checkBody("email",'Email is not valid').isEmail();
  req.checkBody("username",'Username is required').notEmpty();
  req.checkBody("password",'Password is required').notEmpty();
  req.checkBody("password2",'Password do not match').equals(req.body.password);

  // check for errors
  var errors = req.validationErrors();
  
  if(errors) {
    res.render('register', {errors: errors });
    return;
  } else {   
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
      //profileimage: profileImageName
    });
    
    // Create User
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);    
    });
    
    req.flash('success', 'You are now registered and may login');
    res.location('/');
    res.redirect('/');
  }
});

//===============PASSPORT=================
// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done){
     
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        console.log('Unknown User');
        return done(null, false, {message: 'Unknown User'});
      }
      
      User.comparePassword(password, user.password, function(err, isMatch){
        console.log(username);
        if(err) throw err;
        if(isMatch){
            return done(null, user);
        } else {
          console.log('Invalid password');
          return done(null, false, {message: 'Invalid password'});
        }
      });
      
    });
  }
));

router.post('/login', passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid username and password'}), function(req, res){
  console.log('Authentication Successful');
  req.flash('success','You are logged in');
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You have logged out!');
  res.redirect('/users/login');
});
module.exports = router;

