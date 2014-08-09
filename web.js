var express = require('express');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var app = express();

app.use(logfmt.requestLogger());
app.use(bodyParser.json());

var shopStatus = false;
var lastUpdated = new Date().getTime();

app.get('/', function(req, res) {
  var diff = parseInt((new Date().getTime() - lastUpdated)/1000);
  var days = 0,
      hours = 0,
      mins = 0,
      secs = diff;
  if (diff > 60) {
    mins = parseInt(diff/60);
    secs = diff%60;
    if (mins > 60) {
      hours = parseInt(mins/60);
      mins = mins%60;
      if (hours > 24) {
        days = parseInt(hours/24);
        hours = hours%24;
      }
    }
  }
  var updated = days + ' days ' + hours + ' hours ' + mins + ' minutes '
                + secs + ' seconds ago';
  var data = {
    stat: shopStatus,
    lastUpdate: updated
  };
  res.send(data);
});

app.post('/', function(req, res) {
  console.log('received a PoSt');
  console.log('before change: ' + shopStatus);
  console.log('last updated: ' + lastUpdated);
  console.log(req.body);
  try {
    var r = req.body;
    console.log(r.shopStatus);
    switch (r.shopStatus) {
      case true:
        shopStatus = true;
        lastUpdated = new Date().getTime();
        res.send(true);
        break;
      case false:
        shopStatus = false;
        lastUpdated = new Date().getTime();
        res.send(true);
        break
      default:
        res.send(false);
    }
  }
  catch(e) {
    console.log('Error: ' + e);
    res.send('Error: ' + e);
  }
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('Listening on ' + port);
});
