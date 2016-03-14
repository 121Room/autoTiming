var phantomas = require('phantomas');

var Promise   = require('es6-promise').Promise;


//固定变量
var REG_URL   = '//';
var MAX_SIZE  = 200;


function checkSize (arr) {
    var arrResult = [];
    for (var i = 0; i < arr.length; i++) {
        var size = arr[i].substring(arr[i].lastIndexOf('(')+1, arr[i].lastIndexOf('.'));
        if (parseInt(size) > MAX_SIZE) {
            arrResult.push(arr[i]);
        }
    }
    return arrResult;
}

module.exports = function (urlArr, callback) {

    var index = 0;
    var objArr = [];

    function checkLast () {
        return index === urlArr.length;
    }

    function openAgain(url) {

		phantomas(url, function(err, json, results) {
			index++;
            var imageCountArr = json.offenders.imageCount;
            var imagesLength = imageCountArr.length;
			objArr.push({
				url: url,
                length: imagesLength,
				imageCount: checkSize(imageCountArr)
			});
            console.log('imagesLength ' + imagesLength);
            if (checkLast()) {
                return callback(objArr);
            }
		});
    }
    for (var i = 0; i < urlArr.length; i++) {
        openAgain(urlArr[i]);
    };
}