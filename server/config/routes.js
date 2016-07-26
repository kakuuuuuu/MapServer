var users = require('../controllers/Users.js');
var rooms = require('../controllers/Rooms')
module.exports = function(app, passport, path, client) {
// ===============================================================================================================
// API ROUTES ===============================================================================================
// ===============================================================================================================
    app.get('/getuser', isLoggedIn, function(req, res){
        users.getuser(req, res)
    })
    app.post('/searchgames', isLoggedIn, function(req, res){
        users.amazonsearch(req, res, client)
    })
    app.get('/getrooms/:id', isLoggedIn, function(req, res){
        rooms.getAll(req, res)
    })
    app.post('/createRoom', isLoggedIn, function(req, res){
        rooms.create(req, res)
    })
    app.get('/getroom/:id', isLoggedIn, function(req, res){
        rooms.getOne(req, res)
    })
    app.post('/createComment/:id', isLoggedIn, function(req, res){
        rooms.createComment(req, res)
    })
    app.post('/changeCoords/:id', isLoggedIn, function(req, res){
        rooms.coords(req, res)
    })
    app.post('/roomUser/:id', isLoggedIn, function(req, res){
        rooms.addUser(req, res)
    })
// ===============================================================================================================
// HOMEPAGE ROUTES ===============================================================================================
// ===============================================================================================================
    app.get('/', function(req, res) {
        res.render('index'); // load the index.ejs file
    });
    app.post('/user', passport.authenticate('local-signup'), function(req, res){
      res.json('/')
    })
// ===============================================================================================================
// FACEBOOK ROUTES ===============================================================================================
// ===============================================================================================================
    app.get('/auth/facebook/', passport.authenticate('facebook', { scope : 'email' }));
    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
// ===============================================================================================================
// TWITTER ROUTES ================================================================================================
// ===============================================================================================================
    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));
    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
// ===============================================================================================================
// GOOGLE ROUTES =================================================================================================
// ===============================================================================================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
    }));
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // process the login form
    // app.post('/login', do all our passport stuff here);
// ===============================================================================================================
// LOCAL ROUTES ==================================================================================================
// ===============================================================================================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('register', { message: req.flash('signupMessage') });
    });
    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login', { message: req.flash('loginMessage') });
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
// ===============================================================================================================
// START ANGULAR =================================================================================================
// ===============================================================================================================
    // Upon successful log in with any methods will send angular app
    // Will prevent angular app from sending if not logged in
    app.get('/profile', isLoggedIn, function(req, res) {
      res.sendFile('dashboard.html', {root: './client/static'})
    });
// ===============================================================================================================
// UNLINKING ACCOUNTS ============================================================================================
// ===============================================================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });
// ===============================================================================================================
// LOGOUT ========================================================================================================
// ===============================================================================================================
    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/')
    });
};

// ===============================================================================================================
// LOGIN STATUS ==================================================================================================
// ===============================================================================================================
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
