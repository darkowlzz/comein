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
  res.session.notice = 'Logged out!';
});


// Config server
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
