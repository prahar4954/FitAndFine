const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/key");
const auth = require("../middleware/auth");
// Load input validation
const validateRegisterInput = require("../validations/registration");
const validateLoginInput = require("../validations/login");
// Load User model
const User = require("../models/Users");

// @route GET api/users/register
// @desc Register user
// @access Public
router.get('/register', function(req, res, next) { 
  var cookie = req.cookies;
  const name = cookie.name;
  res.render('register', { title: 'Register Page',name:name }); 
});

// @route GET api/users/login
// @desc Register user
// @access Public
router.get('/login', function(req, res, next) { 
  var cookie = req.cookies;
    const name = cookie.name;
  res.render('login', { title: 'Login Page',name:name }); 
});

router.get('/logout', function(req, res, next) { 
  res.clearCookie("token");
  res.clearCookie("name");
  res.render('login', { name:"" }); 
});

router.get('/profile',  auth, async (req, res) => {
  try{
  const user = await User.findById(req.user.id).select('-password');
  const cookie = req.cookies;
  const name = cookie.name;
  if(!name){
    res.cookie('name',user.name, { maxAge: 360000, httpOnly: true });
  }
  res.render('profile', { name : user.name, email:user.email});
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
const { errors, isValid } = validateRegisterInput(req.body);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      try{
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                const payload = {
                  user:{
                    id:user.id
                  }
                }
                jwt.sign(
                  payload,
                  keys.secretOrKey,
                  {expiresIn: 360000},
                  (err,token)=> {
                    if(err) throw err;
                    // res.cookie('token',token, { maxAge: 360000, httpOnly: true });
                    res.redirect('http://localhost:3000/login');
                  })
                })
              .catch(err => console.log(err));
          });
        });
      }catch(err){
        console.log(err.message);
        res.status(500).send('Server error!');
      }
    }
  });
});


// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
const { errors, isValid } = validateLoginInput(req.body);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
const email = req.body.email;
  const password = req.body.password;
// Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
// Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id
        };
// Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {expiresIn: 360000},
          (err, token) => {
            if(err) throw err;
            res.cookie('token',token, { maxAge: 360000, httpOnly: true });
            res.redirect('http://localhost:3000/profile');
            // res.json({
            //   success: true,
            //   token: "Bearer " + token
            // });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;
