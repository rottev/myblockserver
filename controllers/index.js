var versions = [];
var fs = require('fs');
var express = require('express');
var sw = require("swagger-node-express");
var _ = require('lodash');




fs.readdirSync(__dirname + '/').forEach(function (file) {
     var name = "./" + file;
    console.log("checking: " + name);
    var stat = fs.statSync( __dirname + "/" + file);
    if (stat && stat.isDirectory()) {
        console.log("adding version: " + file);
        exports[file] = require(name);
        versions.push({a: exports[file], b: file});

    }
});

module.exports.register = function (app) {
    for (var version in versions) {
        var versionpath = express();
        console.log("loading: " + versions[version].b);
        var swagger = sw.createNew();
        var versionpath = express.Router();
        swagger.setAppHandler(versionpath);

        //swagger.configure("http://localhost:8080", "0.0" );

        versions[version].a.register(versionpath, swagger);
        swagger.configureSwaggerPaths("", "/api-docs", "");
        swagger.configure("http://localhost:8080/" + versions[version].b, "0." + versions[version].b.match( /\d+/g ));


     //   console.log("wtf " + versions[version].b);

        // app.use( "/" + versions[version].b, router2);
        app.use("/" + versions[version].b, versionpath);
    }
}
