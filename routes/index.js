var express = require('express');
var router = express.Router();
var crypto = require('crypto');
// var phantomas = require('phantomas');
var phantom = require('phantom');
var Promise = require('es6-promise').Promise;

module.exports = function (app) {
	app.get('/', function (req, res) {
		res.render('index', {
			title: 'autoTiming'
		});
	});
	app.post('/report', function (req, res) {
		var url = req.body.url;
		var isSuccess = false;
		var objTimeCollection = null;

        phantom.create(function (ph) {
            function openAgain() {
                ph.createPage(function (page) {
                    var t = new Date().getTime();
                    var tDomCompleteTime = 0;
                    page.open(url, function (status) {
                        function checkReadyState() {
                            setTimeout(function () {
                                page.evaluate(function () {
                                    return document.readyState;
                                }, function (readyState) {
                                    if (readyState === 'complete') {
                                        console.log(readyState);
                                        tDomCompleteTime = new Date().getTime() - t;
                                        isSuccess = true;
                                        res.json({
                                            "isSuccess": isSuccess,
                                            "domCompleteTime": tDomCompleteTime
                                        })
                                        ph.exit();
                                    } else {
                                        checkReadyState();
                                    }
                                })
                                
                            })
                        };
                        checkReadyState();
                    });
                });
            }
            openAgain();
        });
	})
	app.get('/getTime', function (req, res) {
		res.render('getTime', {
			domComplete: req.session.domComplete
		})
	})
}
