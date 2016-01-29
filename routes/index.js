var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var Timing  = require('../models/timing.js');
var Url  = require('../models/url.js');
var autoTiming = require('../fn/autoTiming');
var getTime = require('../fn/getTime.js');
var getInfo = require('../fn/getInfo.js');
//test
var urlArr = ['http://www.baidu.com'];

module.exports = function (app) {
    app.get('/', function (req, res) {
        Url.getAll(function (err, docs) {
            res.render('index', {
                title: '主页',
                urlArr: docs
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
}
