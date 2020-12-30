const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var mongoose    = require("mongoose");
var User = require("./models/user");
var Event = require("./models/events");
var moment        = require('moment');
var     passport    = require("passport"),
        cookieParser = require("cookie-parser"),
        session = require("express-session"),
        methodOverride	= require("method-override"),
        flash = require("connect-flash"),
        LocalStrategy = require("passport-local");

mongoose.connect("mongodb://localhost/eventfox",{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});
app.use(methodOverride("_method"));
app.locals.moment = require('moment');
app.use(flash());
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

// PASSPORT CONFIGURATION
//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret:"I am the best",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
    next();
})

app.get("/",function(req,res){
    res.render("index");
})
app.get("/login_signup",function(req,res){
    res.render("login_signup");
})

//handle sign up logic
app.post("/signup", function(req, res){
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        usn:req.body.usn,
        phoneNo:req.body.phone
      });

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
          // return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "welcome to eventFox " + user.username + " !");
           res.redirect("/home"); 
        });
    });
});

//handling login logic
app.post("/login", function(req,res,next){ 
    passport.authenticate("local",
    {
    successRedirect:"/home",
    failureRedirect:"/login_signup",
    failureFlash: true,
    successFlash: "Welcome back, " + req.body.username + " !"
    })(req, res);
});
	

// logout route
app.get("/logout", function(req, res){
   req.logout();
  // req.flash("success", "See you later!");
   res.redirect("/");
});

//Home page route
app.get("/home",async function(req,res){
    await Event.find({},function(err,allEvent){
        User.findById(req.user._id,function(err,user){
            res.render("home",{allEvent,currentuser:user});
        })
       
    })
})

//Event routes
app.get("/createEvent",function(req,res){
    res.render("event");
});

//created event route
app.get("/createdEvent",function(req,res){
    User.findById(req.user._id).populate("createdEvent joinedEvent").exec(function(err,user){
        User.find({},function(err,allUser){
        res.render("createdEvent",{user,allUser})
    })
    })
});

//delete event route
app.post("/event/:id/delete",function(req,res){
    Event.findByIdAndRemove(req.params.id,function(err,event){
        if(err){
            console.log("whyy",err)
            return res.redirect("back");
        }
        console.log(event)
        User.findById(req.user._id,function(err,user){
            if(err){
                console.log("whyy",err)
                return res.redirect("back");
            }
            user.createdEvent.pull(req.params.id);
            user.save();
            res.redirect("/createdEvent")
        })
    })
})


app.post("/createEvent",async function(req,res){
    var newEvent={
        name:req.body.name,
        date:req.body.date,
        time:req.body.time,
        venue:req.body.venue,
        image:req.body.image,
        description:req.body.description
        };
        console.log("new evnt",newEvent)
    await Event.create(newEvent,function(err,event){
        if(err){
            console.log("whyy",err)
            return res.redirect("back");
        }
        User.findById(req.user._id,function(err,user){
            if(err){
                console.log("user not found",err)
            }
        user.createdEvent.push(event._id);
        user.save();
        event.createdBy.id=req.user._id;
        event.createdBy.name=req.user.username;
        console.log("new event",event)
        event.save();
        res.redirect("/home");
        })
    })
})

//Event Join route
app.post("/event/:id/join",function(req,res){
    Event.findById(req.params.id,function(err,event){
        if(err){
            req.flash('error', err.message);;
            res.redirect("back");
        }
        var foundUser=event.users.some(function(user){
            return user.equals(req.user._id);
        });
        if(foundUser){
            event.users.pull(req.user._id);
            var check=false;
            event.save();
        }
        else{
            event.users.push(req.user._id);
            var check=true;
            event.save();
        }
        if(check){
            req.flash('success', "You have successfully joined "+event.name + " and a message has been sent to the organizers !");
            }
            if(!check){
                req.flash('error', "you have marked out of "+event.name);
                }
        return res.redirect("/home");
    });
})

app.listen(3007,function(){
    console.log("Server started at port 3007")
});