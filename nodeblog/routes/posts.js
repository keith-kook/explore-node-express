var express = require('express');
var router = express.Router();
var body = require('body-parser');
var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');

router.get('/show/:id', function(req, res, next){
    var posts = db.get('posts');
    posts.findById(req.params.id, function(err,post){
        res.render('show',{
          "post": post
        });
    });
});

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images/uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname);
  }
});

var upload = multer({ storage : storage}).single('mainimage');



/* Homepage Blog Posts */
router.get('/add', function(req, res, next) {
  var categories = db.get('categories');

  categories.find({}, {},function(err, categories){
    res.render('addpost',{
      "title": "Add Post",
      "categories": categories
    });
  });

});

router.post('/add', upload, function(req, res, next) {
  //get form values
  var formTitle = req.body.formTitle;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  //console.log(req.body, req.file); //form files

  if(req.file){
    var mainImageOriginalName = req.file.originalname;
    var mainImageName = req.file.name;
    var mainImageMime = req.file.mimetype;
    var mainImagePath = req.file.path;
    var mainImageExt = req.file.extension;
    var mainImageSize = req.file.size;
    var mainImageName = req.file.filename;
  } else {
    var mainImageName = 'noimage.jpg';
  }

  // form validation
  req.checkBody('formTitle', 'Title field is required').notEmpty();
  req.checkBody('body', 'Boby field is required').notEmpty();

  //check error
  var errors = req.validationErrors();

  if(errors){
    var categories = db.get('categories');
    categories.find({}, {},function(err, categories){
      res.render('addpost',{
        "errors": errors,
        "title": "Add Post",
        "formTitle": formTitle,
        "body": body,
        "categories": categories
      });
    });
  } else {


    var posts = db.get('posts');

    // submit to db
    posts.insert ({
      "formTitle": formTitle,
      "body": body,
      "category": category,
      "date": date,
      "author": author,
      "mainimage": mainImageName
    }, function(err,post){
      if(err){
        res.send("There was an issue submitting the post");
      } else {
          req.flash("succss","post submitted");
          res.location('/');
          res.redirect('/');
      }

    });

    return;
  }
});

router.post('/addcomment', upload, function(req, res, next) {
  //get form values
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var commentdate = new Date();

  //console.log(req.body, req.file); //form files

  // form validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not formatted correctly').notEmpty();
  req.checkBody('body', 'Boby field is required').notEmpty();

  //check error
  var errors = req.validationErrors();

  if(errors){
    var posts = db.get('posts');
    posts.findById(postid, function(err, post){
      res.render('show',{
        "errors": errors,
        "post": post
      });

    });
  } else {
    var comment = {"name": name, "email": email, "body": body, "commentdate": commentdate}
    var posts = db.get('posts');

    // submit to db
    posts.update({
      "_id": postid
    },
    {
      $push: {
        "comments":comment
      }
    },
    function(err, doc){
      if(err){
        throw err;
      } else {
          req.flash('success', "Comment Added");
          res.location('/posts/show/'+postid);
          res.redirect('/posts/show/'+postid);
      }
    });

  }
});


module.exports = router;
