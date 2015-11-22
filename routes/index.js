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
		var url = req.body.url;
		var domComplete = 0;
		var isSuccess = false;
		var domComplete = '';
		var domContentLoaded = '';
		var domContentLoadedEnd = '';
		var timeToFirstByte = '';
		var objTimeCollection = null;
		var task = phantomas(url, function (err, json, results) {});
		task.on('results', function (results) {

			// TODO 数据库


			domComplete = parseInt(results.getMetrics().domComplete);
			domContentLoaded = parseInt(results.getMetrics().domContentLoaded);
			domContentLoadedEnd = parseInt(results.getMetrics().domContentLoadedEnd);
			timeToFirstByte = parseInt(results.getMetrics().timeToFirstByte);
			var firstCSS = parseInt(results.getMetrics().timeToFirstCss);
			var firstJS = parseInt(results.getMetrics().timeToFirstJs);
			objTimeCollection = {
				"firstCSS": firstCSS,
				"firstJS": firstJS,
				"domComplete": domComplete,
				"domContentLoaded": domContentLoaded,
				"domContentLoadedEnd": domContentLoadedEnd,
				"timeToFirstByte": timeToFirstByte
			}
			isSuccess = true;
			res.json({
				"isSuccess": isSuccess,
				"data": objTimeCollection
			});
		})
	})
	app.get('/getTime', function (req, res) {
		res.render('getTime', {
			domComplete: req.session.domComplete
		})
	})
}
