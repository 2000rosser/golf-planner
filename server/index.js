var express = require('express'); 
var app = express(); 
const mongoose = require("mongoose"); 

const PORT = process.env.PORT || 3001;

const bodyParser = require("body-parser"); 
 
const session = require("express-session"); 
const passport = require("passport"); 
const passportLocalMongoose =  
       require("passport-local-mongoose"); 
 
app.use(bodyParser.urlencoded({ extended: true })); 
   
app.use(session({ 
    secret: "long secret key", 
    resave: false, 
    saveUninitialized: false
})); 

app.use(passport.initialize()); 
 
app.use(passport.session()); 
 
mongoose.connect( 
'mongodb://localhost:27017/userDatabase', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});  
   
const userSchema = new mongoose.Schema({ 
    email: String, 
    password: String 
}); 

userSchema.plugin(passportLocalMongoose); 

const User = new mongoose.model("User", userSchema); 

passport.use(User.createStrategy()); 
 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 
   

app.get("/", function (req, res) { 
  
    if (req.isAuthenticated()) { 

        res.send( 
"You have already logged in. No need to login again"); 
    } 
   
    else { 

        res.sendFile(__dirname + "/index.html"); 
    } 
}) 
   
   
app.get("/login", function (req, res) { 
    if (req.isAuthenticated()) { 

        res.send( 
"You have already logged in. No need to login again"); 
    } 
    else { 

        res.sendFile(__dirname + "/login.html"); 
    } 
}) 

app.post("/register", function (req, res) { 
    console.log(req.body); 
    var email = req.body.username; 
    var password = req.body.password; 
    User.register({ username: email }, 
        req.body.password, function (err, user) { 
            if (err) { 
                console.log(err); 
            } 
            else { 
                passport.authenticate("local") 
                 (req, res, function () { 
                    res.send("successfully saved!"); 
                }) 
            } 
        }) 
}) 

app.post("/login", function (req, res) { 
    console.log(req.body); 
  
    const userToBeChecked = new User({ 
        username: req.body.username, 
        password: req.body.password 
    }); 

    req.login(userToBeChecked, function (err) { 
        if (err) { 
            console.log(err); 
            res.redirect("/login"); 
        } 
        else { 
            passport.authenticate("local") 
                (req, res,function () { 
                User.find({ email: req.user.username }, 
                    function (err, docs) { 
                      if (err) { 
                         console.log(err); 
                      } 
                     else { 
  
                       console.log("credentials are correct"); 
                     res.send("login successful"); 
                        } 
                    }); 
            }); 
        } 
    }) 
})

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});