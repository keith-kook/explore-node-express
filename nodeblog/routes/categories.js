var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:category', function(req, res, next){
  var db = req.db;
  var posts = db.get('posts');
  posts.find({category: req.params.category},{}, function(err, posts){
    res.render('index', {
      "title":req.params.category,
      "posts":posts
    });

  });
});

/* Homepage Blog Posts */
router.get('/add', function(req, res, next) {
  res.render('addcategory',{
    "title": "Add Category"
  });
});


router.post('/add', function(req, res, next) {
  //get form values
  var title = req.body.title;
  console.log(title);
  // form validation
  req.checkBody('title', 'Title field is required').notEmpty();

  //check error
  var errors = req.validationErrors();

  if(errors){
    res.render('addcategory',{
      "errors": errors,
      "title": title
    });
  } else {
    var categories = db.get('categories');

    // submit to db
    categories.insert ({
      "title": title
    }, function(err,categories){
      if(err){
        res.send("There was an issue submitting the post");
      } else {
          req.flash("succss","category submitted");
          res.location('/');
          res.redirect('/');
      }
    });
  }
});


module.exports = router;
