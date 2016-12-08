var express = require('express');
var router = express.Router();
var https = require('https');
var parsed = "";
var parsed2 = "";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET Tracking Page */
router.get('/tracking', ensureAuthenticated, function(req, res, next) {
    res.render('tracking',{lala: parsed});
});

/* GET Stats Page */
router.get('/stats', ensureAuthenticated, function(req, res, next) {
    res.render('stats');
});
/* GET Profile Page */
router.get('/profile', ensureAuthenticated, function(req, res, next) {
    res.render('profile');
});

router.get('/login', function(req, res, next) {
   res.render('login');
});

router.get('/register', function(req, res, next) {
    res.render('register');
});

/* POST Handle Search */
router.post('/tracking/search', function(req, res2) {
    var searchTerm = req.body.foodItem.replace(/ /g,"_");

    var optionsget = {
        host: 'api.nal.usda.gov',
        port: 443,
        path: '/ndb/search/?format=json&q='+searchTerm+'&sort=n&max=1000&offset=0&api_key=7XhK56O1MAYp6Q3pNJjcDIduBCrHu2oI7usOw4ll',
        method: 'GET'
    };

    var reqGet = https.request(optionsget, function(res) {
        var data ="";
        var display = "";
        res.on('data', function(chunk) {
        data+=chunk;
        });

        res.on('end', function() {

            parsed = JSON.parse(data);
            var optionsget2 = {
                host: 'api.nal.usda.gov',
                port: 443,
                path: '/ndb/reports/?ndbno='+parsed.list.item[1].ndbno+'&type=f&format=json&api_key=7XhK56O1MAYp6Q3pNJjcDIduBCrHu2oI7usOw4ll',
                method: 'GET'
            };

            var reqGet = https.request(optionsget2, function(res) {
                var nutrition ="";
                var display = "";
                res.on('data', function(chunk) {
                    nutrition+=chunk;
                });

                res.on('end', function() {
                    parsed2 = JSON.parse(nutrition);
                    console.log(parsed2.report.food.nutrients[1]);
                    res2.render
                    (
                        'tracking', {lala: parsed2.report.food.nutrients}
                    );
                });
            });
            reqGet.end();
            reqGet.on('error', function(e) {
                console.error(e);
            });

        });
    });

    reqGet.end();
    reqGet.on('error', function(e) {
       console.error(e);
    });



});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'Please login or register to access this page');
        res.redirect('/login');
    }
}


module.exports = router;
