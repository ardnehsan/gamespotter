var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");
const exphbs = require('express-handlebars');
var axios = require("axios");
var cheerio = require("cheerio");

//Capturing models
var ArticleMod = require("./models/Article");
var CommentMod = require("./models/Comment");



var PORT = process.env.PORT || 3000;

var app = express();

app.engine('handlebars', exphbs({
    defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
	res.render('index')
})
app.use(logger("dev"));

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static("public"));


var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongo-scrape';
mongoose.Promise = Promise;

mongoose.connect(MONGODB_URI);


//ROUTES

app.get("/scrape", function(req,res){
    
    axios.get("https://www.reddit.com/r/gaming/").then(function(response){

    var $ = cheerio.load(response.data);

    $("p.title").each(function(i, element) {
        var result = {};    
    
        result.title = $(this).children("a").text();
        result.link = $(this).children("a").attr("href");


        ArticleMod.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });
    res.send("Complete");

    });
});

app.get("/articles", function(req,res){

        ArticleMod.find({})
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        })
});


app.get("/articles/:id", function(req, res) {
    ArticleMod.findOne({ _id: req.params.id })
      .populate("Comment")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  
    // Create a new Comment and pass the req.body to the entry
      app.post("/articles/:id", function(req, res) {
        CommentMod.create(req.body)
        .then(function(dbComment) {
            return ArticleMod.findOneAndUpdate({ _id: req.params.id }, { Comment: dbComment._id }, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
    });


  // Route for grabbing a specific Article by id
app.delete("/articles/remove/:id", function (req, res) {
    ArticleMod.remove({ _id: req.params.id })
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });


  // Using the id passed in the id parameter, remove it from our db...
  app.delete("/articles/removeComment/:id", function (req, res) {
    ArticleMod.findOne({ _id: req.params.id })
      .then(function (dbArticle) {
        var newComment = dbArticle.Comment
      }).then(function () {
        CommentMod.remove({ _id: newComment})
      })
      .catch(function (err) {
        res.json(err);
      });
  });
  
app.listen(PORT, function(){
    console.log("App running at " + PORT);
});