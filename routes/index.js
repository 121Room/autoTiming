var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var phantomas = require('phantomas');

module.exports = function (app) {
	app.get('/', function (req, res) {
		res.render('index', {
			title: 'autoTiming'
		});
	});
	app.post('/report', function (req, res) {
		var url = req.url;
		var domComplete = 0;
		var task = phantomas(url, function (err, json, results) {});
		task.on('results', function (results) {
			domComplete = parseInt(results.getMetrics().domComplete);
			req.session.domComplete = domComplete;
			// console.log(domComplete);
			res.redirect('getTime');
		})
	})
	app.get('/getTime', function (req, res) {
		res.render('getTime', {
			domComplete: req.session.domComplete
		})
	})
}
