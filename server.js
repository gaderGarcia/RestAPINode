var express = require('express'),
mysql       = require('mysql'),
bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var jwt = require('jsonwebtoken');


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var port = process.env.PORT || 9000;
app.set('superSecret',config.secret);
app.use(morgan('dev'));

var router = express.Router();

router.get('/',function(req,res){
  res.json({message: 'Hello API is at http://'});
});
router.use(function(req, res, next){
  console.log(req.headers);
  console.log(req.url);
  var url = req.url;
  var UnAuthenticatedURL = ['/','/login'];

  if(UnAuthenticatedURL.indexOf(url)!=-1){
    next();
    return;
  }
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token){
    jwt.verify(token,app.get('superSecret'),function(error, decoded){
      if(error)
        return res.json({success: false, message: 'Failed Authenticated token'});
      else{
        req.decoded =decoded;
        next();
      }
    });
  }else {
    return res.json({message:'No token provided', success : false});
  }
});

router

router.post('/login',function(req, res){
  console.log(req.body);
  var user = {
    username : req.body.username,
    password : req.body.password,
    roleID : 1
  };
  var token = jwt.sign(user, app.get('superSecret'));
  res.json({message: 'login process', token: token,success: true});
});

app.use('/api',router);

app.listen(port);
console.log('Server started 9000');
