var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'),
    db = require('orchestrate')(config.db);

exports.localReg = function(username, password) {
  var deferred = Q.defer();
  var hash = bcrypt.hashSync(password, 8);
  var user = {
    'username': username,
    'password': hash
  };

  db.get('users', username)
    .then(function(result) {
      console.log('username already exists');
      deferred.resolve(false);
    })
    .fail(function(result) {
      if (result.body.message == 'The requested items could not be found.') {
        console.log('Username is free for use');
        db.put('users', username, user)
        .then(function() {
          console.log('User: ' + user);
          deferred.resolve(user);
        })
        .fail(function(err) {
          console.log('PUT FAIL: ' + err.body);
          deferred.reject(new Error(err.body));
        });
      } else {
        deferred.reject(new Error(result.body));
      }
    });

  return deferred.promise;
};

exports.localAuth = function(username, password) {
  var deferred = Q.defer();

  db.get('users', username)
    .then(function(result) {
      console.log('FOUND USER');
      var hash = result.body.password;
      if (bcrypt.compareSync(password, hash)) {
        deferred.resolve(result.body);
      } else {
        console.log('PASSWORDS NOT MATCH');
        deferred.resolve(false);
      }
    }).fail(function (err) {
      if (err.body.message = 'The requested items could not be found.') {
        console.log('COULD not find user in db');
        deferred.resolve(false);
      } else {
        deferred.reject(new Error(err));
      }
    });

  return deferred.promise;
}
