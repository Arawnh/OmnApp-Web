var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../Models/user');

/* GET users listing. */
router.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;


    //validation
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    } else {
        var newUser = new User({
            username: username,
            password: password
        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/login');
    }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
           if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Your username does not exist'});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid Password'});
                }
            });
        });
    }));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});



router.post('/login', passport.authenticate('local', {successRedirect:'/', failureRedirect:'/register', failureFlash: true}),
    function(req, res) {

        res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();

    res.redirect('/');
});


module.exports = router;
