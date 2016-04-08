var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var Timing  = require('../models/timing.js');
var Url  = require('../models/url.js');
var ImgConfig = require('../models/img-config.js');
var Performance = require('../models/performance.js');
var autoTiming = require('../fn/autoTiming');
var getTime = require('../fn/getTime.js');
var getInfo = require('../fn/getImg.js');
var Promise = require('es6-promise').Promise;

module.exports = function (app) {
    app.get('/', function (req, res) {
        Url.getAll(function (err, docs) {
            res.render('index', {
                title: '主页',
                urlArr: docs,
                pageName: 'homePage'
            })
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

    app.get('/monitorImg', function (req, res) {
        var getUrl = new Promise(function (resolve, reject) {
            Url.getAll(function (err, docs) {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(docs);
                }
            })
        })
        var getImgConfig = new Promise(function (resolve, reject) {
            ImgConfig.getAll(function (err, docs) {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(docs[docs.length - 1]);
                }
            })
        })
        Promise.all([getUrl, getImgConfig]).then(function (result) {
            res.render('monitor-img', {
                title: '图片尺寸监控',
                urlArr: result[0],
                configJson: result[1],
                pageName: 'monitorImg'
            })
        })
    })
    app.post('/api/saveUrl', function (req, res) {
        var url = req.body.url;
        var urlObj = new Url(url);
        urlObj.save(function (err, url) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    isSuccess: true,
                    data: url
                })
            }
        });
    })

    app.post('/api/delUrl', function (req, res) {
        var url = req.body.url;
        Url.del(url, function () {
            res.json({
                isSuccess: true
            })
        });
    })

    app.post('/api/checkAll', function (req, res) {
        var urlArrToString = req.body.url;
        var url = urlArrToString.split(',');
        getTime(url, function (arr) {
            res.json({
                isSuccess: true,
                data: arr
            })
        });
    })

    app.post('/api/checkAllInfo', function (req, res) {
        var urlArrToString = req.body.url;
        var url = urlArrToString.split(',');
        getInfo(url, function (arr) {
            res.json({
                isSuccess: true,
                data: arr
            })
        });
    })

    app.post('/startWatch', function (req, res) {
        var timeValue = req.body.timeValue;
        autoTiming(timeValue);
    })

    app.post('/api/saveImgConfig', function (req, res) {
        var json = req.body;
        var config = new ImgConfig(json);
        config.save(function (err, json) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    isSuccess: true
                })
            }
        })
    })
    app.get('/api/report', function (req, res) {
        var query = req.query;
        var json = {
            url: query.url,
            device: query.device,
            browser: query.browser,
            engine: query.engine,
            os: query.os,
            loadTime: query.timing.loadEventStart - query.timing.navigationStart,
            resolution: query.resolution
        }
        var performance = new Performance(json);
        performance.save(function (err, json) {
            if (err) {
                console.log(err);
            } else {
                res.send(query.callback+'('+ json +')');
            }
        })
    })
    app.get('/performance', function (req, res) {
        Performance.getAll(function (err, arr) {
            res.render('performance', {
                title: '用户真实性能',
                performanceArr: arr,
                pageName: 'performance'
            })
        })
    })
}
