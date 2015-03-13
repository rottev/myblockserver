var express = require('express');
var config = require("./config");
var bodyParser = require('body-parser');
var controllers = require('./controllers');
var swagger = require("swagger-node-express");
var bitcoin = require("bitcoinjs-lib");

//var stylus = require('stylus');
//var nib = require('nib');
//var api = require('./api');



var app = express();
/*
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
*/
app.use(bodyParser());
app.use(function (err, req, res, next) {
    if (err) {
        console.log(err);
        res.send(400,"not valid json");
    }
});

       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies

//app.set('views', __dirname + '/views')
//app.set('view engine', 'jade')
//app.use(express.logger('dev'))
/*
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))


app.get('/', function(req, res){
   res.render('index',
        { title : 'Home', servers: config.accounts }
  );
});
*/
//swagger.setAppHandler(app);
controllers.register(app);
//swagger.setAppHandler(app);




var docs_handler = express.static(__dirname + '/node_modules/swagger-node-express/swagger-ui');
app.get(/^\/docs(\/.*)?$/, function (req, res, next) {
    if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
        res.redirect('/docs/');
        return;
    }
    // take off leading /docs so that connect locates file correctly
    req.url = req.url.substr('/docs'.length);
    console.log("barf 2");
    return docs_handler(req, res, next);
});


var options = {
    setHeaders: function (res, path, stat) {
        res.set('Content-Type', 'application/json; charset=utf-8');
    }
};


app.use('/metadata', express.static(__dirname + '/static/metadata', options));
app.use('/doc',express.static(__dirname + '/doc'))

app.listen(process.env.PORT || 8080);