var Url = require('../models/url.js');
var ImgConfig = require('../models/img-config.js');
var phantom = require('phantom');
var Promise = require('es6-promise').Promise;
var utils = require('../util/utils.js');
var fs = require('fs');
var path = require('path');
var request = require('request');
var exec = require('child_process').exec;
var nodemailer = require('nodemailer');
var settingConfig = require('../settings.js');
var template      = require('art-template');

var imgFileBasePath = utils.getImgFilePath();

var transporter = nodemailer.createTransport({
    service: settingConfig.emailService,
    auth: {
        user: settingConfig.emailUser,
        pass: settingConfig.emailPass
    }
});

//static
function getPackageInfo() {
    return new Promise(function(resolve, reject) {
        // var URL_LIST = ['http://www.showjoy.com', 'http://m.showjoy.com'];
        var urlPromise = new Promise (function (resolve, reject) {
            Url.getAll(function (err, arr) {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(arr);
                }
            })
        })
        var imgConfigPromise = new Promise (function (resolve, reject) {
            ImgConfig.getAll(function (err, docs) {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(docs[docs.length - 1])
                }
            })
        })
        
        Promise.all([urlPromise, imgConfigPromise]).then(function (result) {
            var urlArr = [];
            result[0].forEach(function (item) {
                urlArr.push(item.url);
            })
            var MAX_SIZE = {
                h5: parseInt(result[1].configJson.h5size),
                pc: parseInt(result[1].configJson.pcsize)
            };
            var MAIL_OPTION = {
                from: settingConfig.emailFrom, // sender address
                to: result[1].configJson.emailList.toString(), // list of receivers
                subject: '有图片尺寸超标啦 ✔', // Subject line
                text: '有图片尺寸超标啦 ✔', // plaintext body
                html: '<b>Hello world ✔</b>' // html body
            };
            resolve({
                URL_LIST: urlArr,
                MAX_SIZE: MAX_SIZE,
                MAIL_OPTION: MAIL_OPTION
            });
        });
        
        
    })
}

// 将线上图片写入本地
function getImg(item, filename) {
    return new Promise(function(resolve, reject) {
        request(item, {
            encoding: 'binary'
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                fs.writeFile(path.join(imgFileBasePath, filename), body, 'binary', function(err) {
                    if (err) {
                        console.log(err)
                        reject(new Error(err))
                    } else {
                        resolve();
                    }
                });
            } else {
                reject(new Error(error))
            }
        })
    })
}

// 由线下文件得到图片大小
function getImgValue(item) {
    return new Promise(function (resolve, reject) {
      request.head(item, function(err, res, body){
        if (err) {
          reject(new Error(err));
        } else {
          resolve(res.headers['content-length']);
        }
      })
    })
}

function removeImg() {
    return new Promise(function(resolve, reject) {
        exec('rm -r ' + imgFileBasePath, function(err, stdout, stderr) {
            if (err) {
                reject(new Error(err));
            } else {
                resolve();
            }
        });
    })
}

// 处理html
// 遍历图片得到size
function handleHtml(content) {
    return new Promise(function(resolve, reject) {
        var imgArr = [];
        var index = 0;
        var imgUrlList = utils.getImgUrlist(content);

        function checkLast() {
            return index === imgUrlList.length;
        }
        imgUrlList.forEach(function(item, i) {

            var filename = 'img' + parseInt(Math.random() * 100000);
            getImgValue(item)
            .
            catch (function(error) {
                console.log(error)
            })
            .then(function(size) {
                index++;
                imgArr.push({
                    url: item,
                    size: size.slice(0, -3)
                })
                if (checkLast()) {
                    resolve(imgArr);
                }
            })
            .
            catch (function(error) {
                console(error);
            })
        })
    })
}

function autoGettingImg() {
    function loadOnce() {
        phantom.create().then(function(ph) {
            function openPage(url) {
                return new Promise(function(resolve, reject) {
                    ph.createPage().then(function(page) {
                        page.open(url).then(function(status) {
                            if (status == 'success') {
                                page.evaluate(function() {
                                    return document.getElementsByTagName('body')[0].innerHTML;
                                }).then(function(content) {
                                    ph.exit();
                                    resolve(content);
                                })
                            } else {
                                reject(new Error('open ' + url + ' failed'));
                            }
                        })
                    });
                })
            }
            var urlInfo = [];
            var index = 0;

            getPackageInfo()
            .then(function (infoObj) {
                

                function checkLast() {
                    return index === arrList.length;
                }
                var arrList = infoObj.URL_LIST;
                var maxSizeObj = infoObj.MAX_SIZE;
                var mailOptions = infoObj.MAIL_OPTION;
                // url 数组遍历
                arrList.forEach(function(item, i) {
                    openPage(item)
                    .then(function(content) {

                        // 由url 得到的html Content 
                        // 匹配图片地址
                        return handleHtml(content);
                    })
                    .
                    catch (function(err) {
                        console.log(err);
                    })
                    .then(function(imgArr) {
                        index++;
                        urlInfo.push({
                            url: item,
                            imageCount: utils.filterImg(imgArr, item, maxSizeObj),
                            length: imgArr.length,
                            maxSize: maxSizeObj[utils.judgeRequestType(item)],
                            urlType: utils.judgeRequestType(item)
                        })
                        console.log(urlInfo)
                        if (checkLast()) {
                            if (utils.hasOverSize(urlInfo)) {
                                var data = {};
                                data.list = urlInfo;
                                var html = template(path.join(__dirname, '..', 'views/email-img/html'), data);
                                mailOptions.html = html;
                                console.log(data)
                                transporter.sendMail(mailOptions, function(error, info){
                                    if(error){
                                        console.log(error);
                                    }else{
                                        console.log('Message sent: ' + info.response);
                                    }
                                });
                            } else {
                                console.log('you got a wonderful page!');
                            }
                        }
                    })
                })
            })
            .catch(function (err) {
                console.log(err);
            })
        })
    }
    loadOnce();
    setInterval(loadOnce, 1000 * 60 * 60 * 5);
}

// express test
module.exports = autoGettingImg;

// node test
// autoGettingImg();