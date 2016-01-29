var phantom = require('phantom');

// 监控第三方
var Promise = require('es6-promise').Promise;
var Timing  = require('../models/timing.js');
// var urlArr = require('../models/url.js');
var TIMEINTERVAL = 1000*60*1;
module.exports = function (urlArr, callback) {
    phantom.create(function (ph) {
        var index = 0;
        var objArr = [];
        function checkLast () {
            return index === urlArr.length;
        }
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
                                    console.log(url + ": " + tDomCompleteTime);
                                    objTime.domComplete = tDomCompleteTime;
                                    objArr.push({
                                        url: url,
                                        domComplete: tDomCompleteTime
                                    });
                                    index++;
                                    console.log('index： ' + index);
                                    if (checkLast()) {
                                        return callback(objArr);
                                    }
                                    var timing = new Timing(url, objTime);
                                    timing.save(function () {
                                        console.log(url + ": " + tDomCompleteTime);
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
}