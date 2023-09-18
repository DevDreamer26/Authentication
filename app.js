require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 =require("md5");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});






const User = mongoose.model('User', userSchema);

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

  const newUser = new User({
    email: username,
    password: md5(password),
  });

  newUser.save()
    .then(() => {
      res.render('secrets');
    })
    .catch((err) => {
      console.error(err);
      const alertMessage = 'An error occurred during registration.';
      res.send(`<script>alert("${alertMessage}"); window.location.href="/register";</script>`);
    });
});

app.post('/login', function (req, res) {
    const username = req.body.username;
    const password = md5(req.body.password);
  
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
  
        if (foundUser.password !== password) {
          const alertMessage = 'Incorrect password.';
          return res.send(`<script>alert("${alertMessage}"); window.location.href="/login";</script>`);
        }
  
        res.render('secrets');
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
