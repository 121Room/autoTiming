var express = require('express');
var router = express.Router();
var crypto = require('crypto');
// var phantomas = require('phantomas');
// var phantom = require('phantom');
// var Promise = require('es6-promise').Promise;
var Timing  = require('../models/timing.js');
var urlArr  = require('../models/url.js');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('url', {
            title: 'url页面',
            url: urlArr
        })
    })
	app.get('/getTime', function (req, res) {
        var url = req.query.url;
        Timing.getAll(url, function (err, docs) {
            res.render('getTime', {
                title: '具体页面的测量数据',
                time: docs
            })
        })
	})
}
