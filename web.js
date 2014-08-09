var express = require('express');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var app = express();

app.use(logfmt.requestLogger());
app.use(bodyParser.json());

var shopStatus = false;

app.get('/', function(req, res) {
  res.send(shopStatus);
});

app.post('/', function(req, res) {
  console.log('received a PoSt');
  console.log(req.body);
  try {
    var r = req.body;
    console.log(r.shopStatus);
    switch (r.shopStatus) {
      case true:
        shopStatus = true;
        res.send(true);
        break;
      case false:
        shopStatus = false;
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
