var fs = require('fs');
var path = require('path');
var utils = {
	getImgUrlist: function (content) {
    var rawArr = content.match(/http:\/\/(\w+)\.showjoy\.com\/images\/(\w+)\/(\w+)(\.(png|jpg)\.\w+)?\.(png|jpg)/gi);
    return this.removeRepeatImg(rawArr);
	},
  removeRepeatImg: function (array) {
      var n = []; //一个新的临时数组
      //遍历当前数组
      for(var i = 0; i < array.length; i++){
        //如果当前数组的第i已经保存进了临时数组，那么跳过，
        //否则把当前项push到临时数组里面
        if (n.indexOf(array[i]) == -1) n.push(array[i]);
      }
      return n;
  },
  getImgFilePath: function(name){
    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var name = (name == undefined) ? 'test' : name;
    var imgBaseRoot = path.join(home, name);
    // var imgBase = path.join(imgBaseRoot, 'file')
    return imgBaseRoot;
  },
  createImgFile: function (name) {
    if(!fs.existsSync(this.getImgFilePath(name))){
      fs.mkdirSync(this.getImgFilePath(name));
    }
  },
  judgeRequestType: function (url) {
    if (url.search(/m\.showjoy/) > -1) {
      return 'h5';
    } else {
      return 'pc';
    }
  },
  filterImg: function (imgArr, url, maxSizeObj) {
    var maxSize = maxSizeObj[this.judgeRequestType(url)];
    var newArr = imgArr.filter(function (item) {
      return item.size > maxSize;
    })
    return newArr;
  },
  hasOverSize: function (arr) {
    var newArr = arr.filter(function (item) {
      return item.imageCount.length != 0;
    })
    return newArr.length;
  }
}

module.exports = utils;