//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');
const encrypt=require('mongoose-encryption'); 

const homeStartingContent = "A blog (a shortened version of “weblog”) is an online journal or informational website displaying information in reverse chronological order, with the latest posts appearing first, at the top. A blog may be the work of a single person or jointly operated by a group of people, and bloggers tend to use content managament systems or blog software such as WordPress, Blogger, or Joomla.Blogging enables you to reach the billions of people that use the Internet. Blogging can help you promote yourself or your business. Blogging works as a method for attracting an audience because it provides something of value to them before asking for anything in return.";

const aboutContent="";
const contactContent="";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


var conn1  = mongoose.createConnection('mongodb+srv://admin:admin@cluster0.70pjlgu.mongodb.net/userDB',{ useUnifiedTopology: true });
var conn2  = mongoose.createConnection('mongodb+srv://admin:admin@cluster0.70pjlgu.mongodb.net/BlogsDb',{ useUnifiedTopology: true });

// const User    = conn1.model('Model', new mongoose.Schema({
//   email:String,
//   password:String
// }));

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

const User = conn1.model("User", userSchema);


const Post    = conn2.model('Model', new mongoose.Schema({
  title: String,
  content: String
}));

const secret="ThisisourSecret.";
userSchema.plugin(encrypt,{ secret : secret, encryptedFields: ["password"] });

//
// mongoose.connect("mongodb://localhost:27017/BlogsDb", {useNewUrlParser: true,
// useUnifiedTopology: true,
// useCreateIndex: true,
// useFindAndModify:true});
//
//
// const userSchema = {
//   email:String,
//   password:String
// };
//
// const User = new mongoose.model("User", userSchema);
//
//
//
//
// const postSchema = {
//   title: String,
//   content: String
// };
//
// const Post = mongoose.model("Post", postSchema);

// app.get("/", function(req, res){
//
  // Post.find({}, function(err, posts){
  //   res.render("home", {
  //     startingContent: homeStartingContent,
  //     posts: posts
  //     });
  // });
// });

app.get("/",function(req,res){
  res.render("welcome");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/hm",function(req,res){
  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});


app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      Post.find({}, function(err, posts){
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts
          });
      });
    }
  });
});



app.post("/login",function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email:username},function(err,foundUser){
    if(err){
      console.log(err);

    }else{
      if(foundUser){
        if(foundUser.password === password){
          Post.find({}, function(err, posts){
            res.render("home", {
              startingContent: homeStartingContent,
              posts: posts
              });
          });
                }
      }else{
     

        res.render("wrongpass");

}
    }
  });
});



app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post_title = _.capitalize(req.body.postTitle);
  const post = new Post({
    title: post_title,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
      Post.find({}, function(err, posts){
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts
          });
      });
    }else if(err){
      console.log(err);
    }
  });
});









app.post("/delete",function(req,res){
  const checkedPostId= req.body.checkbox;
const titleName = req.body.titleName;


  Post.findByIdAndRemove(checkedPostId,function(err){
    if(!err){
      Post.find({}, function(err, posts){
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts
          });
      });
    }
  });



});













app.get("/posts/:postId", function(req, res){
const requestedPostId = _.capitalize(req.params.postId);


  Post.findOne({title: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
