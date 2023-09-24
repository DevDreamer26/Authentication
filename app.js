require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

console.log(process.env.API_KEY);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
  secret:"Bidyasagar Hazarika",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.set("useCreateIndex",true);

// Define the user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', function (req, res) {
  res.render('home');
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    const alertMessage = 'Both username and password are required.';
    return res.send(`<script>alert("${alertMessage}"); window.location.href="/register";</script>`);
  }

  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      console.error(err);
      const alertMessage = 'An error occurred during registration.';
      return res.send(`<script>alert("${alertMessage}"); window.location.href="/register";</script>`);
    }

    const newUser = new User({
      email: username,
      password: hash,
    });

    newUser
      .save()
      .then(() => {
        res.render('secrets');
      })
      .catch((err) => {
        console.error(err);
        const alertMessage = 'An error occurred during registration.';
        res.send(`<script>alert("${alertMessage}"); window.location.href="/register";</script>`);
      });
  });
});

app.post('/login', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    const alertMessage = 'Both username and password are required.';
    return res.send(`<script>alert("${alertMessage}"); window.location.href="/login";</script>`);
  }

  User.findOne({ email: username })
    .then((foundUser) => {
      if (!foundUser) {
        const alertMessage = 'User not found.';
        return res.send(`<script>alert("${alertMessage}"); window.location.href="/login";</script>`);
      }

      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (err || !result) {
          const alertMessage = 'Incorrect password.';
          return res.send(`<script>alert("${alertMessage}"); window.location.href="/login";</script>`);
        }

        res.render('secrets');
      });
    })
    .catch((err) => {
      console.error(err);
      const alertMessage = 'An error occurred during login.';
      res.send(`<script>alert("${alertMessage}"); window.location.href="/login";</script>`);
    });
});


app.listen(3000, function () {
  console.log('Server is running.....');
});
