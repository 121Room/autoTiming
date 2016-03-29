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
  TIME_DIFF: 1000*60*60*3,
  H5_MAXSIZE: 150,
  PC_MAXSIZE: 250
};

// 拿到url
function getUrlList () {
  return new Promise(function (resolve, reject) {
    var urlList = ['http://m.showjoy.com','http://www.showjoy.com'];
    resolve(urlList);
  })
}

// 拿到配置信息
function getConfig () {
  return new Promise(function (resolve, reject) {
    var config = {
      H5_MAXSIZE: 150,
      PC_MAXSIZE: 250
    }
    resolve(config);
  })
}


// 将线上图片写入本地
// 暂时未使用
function getImg (item, filename, name) {
  return new Promise(function (resolve, reject) {
    request.head(item, function(err, res, body){
      request(item).pipe(fs.createWriteStream(path.join(imgFileBasePath+name, filename))).on('close', function () {
        resolve(res.headers['content-length']);
      });
    })
    
  })
}

// 由线下文件得到图片大小
function getImgValue (item) {
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

// 删除下载的图片
function removeImg (name) {
  return new Promise(function (resolve, reject) {
      exec('rm -r ' + imgFileBasePath+name, function (err, stdout, stderr) {
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
function handleHtml (content, ii) {
  return new Promise(function (resolve, reject) {
    var imgArr = [];
    var index = 0;
    var imgUrlList = utils.getImgUrlist(content);
    console.log('图片地址个数 '+imgUrlList.length)
    function checkLast () {
      return index === imgUrlList.length;
    }
    imgUrlList.forEach(function(item, i) {
      getImgValue(item)
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
    })
  })
}

function getOverSizeImg (arr, url) {
  var requestType = utils.judgeRequestType(url);
  var arrResult = [];
  var limitSize = requestType == 'h5' ? static.H5_MAXSIZE : static.PC_MAXSIZE;
  arr.forEach(function (item, i) {
    if (item.size > limitSize) {
      arrResult.push(item);
    }
  })
  return arrResult;
}

// main function
function autoGettingImg () {
  function loadOnce () {
    getUrlList().then(function (arrList) {
      var urlInfoArr = [];
      var promiseIndex = 0;
      var phantomIndex = 0;
      phantom.create().then(function (ph) {
        function openPage (url) {
          console.log(url)
          return new Promise(function (resolve, reject) {
            ph.createPage().then(function(page) {
              page.open(url).then(function (status) {
                if (status == 'success') {
                  console.log(status)
                  function checkReadyState () {
                    setTimeout(function () {
                      page.evaluate(function () {
                        return document.readyState;
                      }).then(function (readyState) {
                        if (readyState === 'complete') {
                          
                          // setTimeout(function () {
                            console.log(readyState)
                            page.evaluate(function () {
                              return document.getElementById('layout').innerHTML;
                            }).then(function (content) {
                              ph.exit();
                              resolve(content);
                              var length = arrList.length-1;
                              if (phantomIndex < length) {
                                phantomIndex++
                                setTimeout(openPageWrap, 1000) 
                              }
                            })
                          // }, 8000)
                        } else {
                          checkReadyState();
                        }
                      })
                    })
                  }
                  checkReadyState();
                } else {
                  reject(new Error('open ' + url + ' failed'));
                }
              })    
            });
          })
        }
        function openPageWrap () {

          function checkLast () {
            return promiseIndex == arrList.length;
          }
            
          // 得到url数组后
          openPage(arrList[phantomIndex])
          .then(function (content) {

            // 由url 得到的html Content 
            // 匹配图片地址
            return handleHtml(content);
          })
          .then(function (imgArr) {
            
            urlInfoArr.push({
              url: arrList[promiseIndex],
              imgCount: imgArr.length,
              imgInfo: imgArr
            })
            // console.log(urlInfoArr[index]);
            promiseIndex++;
            if (checkLast()) {
              console.log(urlInfoArr[0]);
              console.log(urlInfoArr[1]);
            }
          })
          .catch(function (err) {
            console.log(err);
          })
        }
        openPageWrap();
      })
      
    })
  }
  loadOnce();
  setInterval(loadOnce, static.TIME_DIFF);
}



// express test
module.exports = autoGettingImg;

// node test
// autoGettingImg();

