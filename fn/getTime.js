var phantom = require('phantom');
var Promise = require('es6-promise').Promise;
var Timing  = require('../models/timing.js');
var urlArr = require('../models/url.js');
var TIMEINTERVAL = 1000*60*1;
module.exports = function () {
    setInterval(function () {
        var isSuccess = false;
        var objTimeCollection = null;

        phantom.create(function (ph) {
            function openAgain(url) {
                ph.createPage(function (page) {
                    var t = new Date().getTime();
                    var tDomCompleteTime = 0;
                    var objTime = {};
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
                                        console.log(url + ": " + tDomCompleteTime);
                                        objTime.domComplete = tDomCompleteTime;
                                        
                                        var timing = new Timing(url, objTime);
                                        timing.save(function () {
                                            console.log(url + ": " + tDomCompleteTime)
                                        })
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
            for (var i = 0; i < urlArr.length; i++) {
              openAgain(urlArr[i]);
            };
        });
    }, TIMEINTERVAL)
}