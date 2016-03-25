var phantom = require('phantom');
var Promise = require('es6-promise').Promise;
var utils = require('../util/utils.js');
var fs = require('fs');
var path = require('path');
var request = require('request');
var exec = require('child_process').exec;

// utils.createImgFile();
var imgFileBasePath = utils.getImgFilePath();
//static
var static = {
  TIME_DIFF: 1000*60*60*3
};


function getUrlList () {
  return new Promise(function (resolve, reject) {
    var urlList = ['http://www.showjoy.com', 'http://m.showjoy.com'];
    resolve(urlList);
  })
}

// 将线上图片写入本地
function getImg (item, filename) {
  return new Promise(function (resolve, reject) {
    request(item, {encoding: 'binary'}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        fs.writeFile(path.join(imgFileBasePath, filename), body, 'binary', function (err) {
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
function getImgValue (filename) {
  return new Promise(function (resolve, reject) {
    fs.stat(path.join(imgFileBasePath, filename), function (err, stats) {
        if (err) {
          reject(new Error(err))
        } else {
          resolve(stats.size);
        }
    })
  })
}

function removeImg () {
  return new Promise(function (resolve, reject) {
      exec('rm -r ' + imgFileBasePath, function (err, stdout, stderr) {
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
function handleHtml (content) {
  return new Promise(function (resolve, reject) {
    utils.createImgFile();
    var imgArr = [];
    var index = 0;
    var imgUrlList = utils.getImgUrlist(content);
    function checkLast () {
      return index === imgUrlList.length;
    }
    imgUrlList.forEach(function(item, i) {
      
      var filename = 'img' + parseInt(Math.random()*100000);
      getImg(item, filename)
      .then(function (i) {
        return getImgValue(filename);
      })
      .catch(function (error) {
        console.log(error)
      })
      .then(function (size) {
        index++;
        imgArr.push({
          url: item,
          size: size
        })
        if (checkLast()) {
          resolve(imgArr);
        }
      })
      .catch(function (error) {
        console(error);
      })
    })
  })
}

function autoGettingImg () {
  function loadOnce () {
    phantom.create().then(function (ph) {
      function openPage (url) {
        return new Promise(function (resolve, reject) {
          ph.createPage().then(function(page) {
            page.open(url).then(function (status) {
              if (status == 'success') {
                page.evaluate(function () {
                  return document.getElementById('layout').innerHTML;
                }).then(function (content) {
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

      getUrlList().then(function (arrList) {
        function checkLast () {
          return index === arrList.length;
        }
        // url 数组遍历
        arrList.forEach(function (item, i) {
          openPage(item)
          .then(function (content) {

            // 由url 得到的html Content 
            // 匹配图片地址
            return handleHtml(content);
          })
          .catch(function (err) {
            console.log(err);
          })
          .then(function (imgArr) {
            index++;
            urlInfo.push({
              url: item,
              imgCount: imgArr
            })
            if (checkLast()) {
              console.log(urlInfo);
              return removeImg();
            }
          })
        })
      })
    })
  }
  loadOnce();
  setInterval(loadOnce, static.TIME_DIFF);
}

// express test
// module.exports = autoGettingImg;

// node test
autoGettingImg();

