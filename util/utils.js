var fs = require('fs');
var path = require('path');
var utils = {
	getImgUrlist: function (content) {
    return content.match(/http:\/\/(\w+)\.showjoy\.com\/images\/(\w+)\/(\w+)(\.(png|jpg)\.\w+)?\.(png|jpg)/gi);
	},
  getImgFilePath: function(){
    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var imgBaseRoot = path.join(home,'imgfile');
    // var imgBase = path.join(imgBaseRoot, 'file')
    return imgBaseRoot;
  },
  createImgFile: function () {
    if(!fs.existsSync(this.getImgFilePath())){
      fs.mkdirSync(this.getImgFilePath());
    }
  }
}

module.exports = utils;