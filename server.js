var express = require('express'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local');

var config = require('./config.js'),
    funct = require('./functions.js');

var app = express();

// ==== Passport config ====
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use('local-signin', new LocalStrategy(
  {passReqToCallback: true},
  function(req, username, password, done) {
    funct.localAuth(username, password)
      .then(function(user) {
        if (user) {
          console.log('Logged in as: ' + user.username);
          return done(null, user, {message: 'You are successfully logged in'});
        }
        if (!user) {
          console.log('Could not log in');
          return done(null, user, {message: 'Cound not login'});
        }
      })
      .fail(function(err) {
        console.log(err.body);
        return done(null, false, {message: 'Could not login'});
      });
  }
));

passport.use('local-signup', new LocalStrategy(
  {passReqToCallBack: true},
  function(username, password, done) {
    funct.localReg(username, password)
      .then(function(user) {
        if (user) {
          console.log('REGISTERED: ' + user.username);
          return done(null, user, {message: 'You are successfully registered'});
        }
        if (!user) {
          console.log('could not register');
          return done(null, user, {message: 'That username is already in use.'});
        }
      })
      .fail(function(err) {
        console.log(err);
        return done(null, false, {message: 'Could not signup'});
      });
  }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please sign in!';
  res.redirect('/signin');
}

// ==== Express config ====
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'supernova'
}));
app.use(passport.initialize());
app.use(passport.session());


// Session-persisted message middleware
app.use(function(req, res, next) {
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});


// Set template engine
app.set('views', './views');
app.set('view engine', 'jade');


app.get('/', function(req, res) {
  res.render('home', { user: req.user });
});

app.get('/signin', function(req, res) {
  res.render('signin');
});

app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

app.post('/login', passport.authenticate('local-signin', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

app.get('/logout', function(req, res) {
  var name = req.user.username;
  console.log('Logging out ' + name);
  req.logout();
  res.redirect('/');
  //res.session.notice = 'Logged out!';
});


// Config server
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
