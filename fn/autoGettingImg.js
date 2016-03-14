var Url        = require('../models/url.js');
var phantomas  = require('phantomas');
var Promise    = require('es6-promise').Promise;
var nodemailer = require('nodemailer');
var settingConfig = require('../settings.js');
var template      = require('art-template');

var transporter = nodemailer.createTransport({
    service: settingConfig.emailService,
    auth: {
        user: settingConfig.emailUser,
        pass: settingConfig.emailPass
    }
});

var mailOptions = {
    from: settingConfig.emailFrom, // sender address
    to: settingConfig.emailTo, // list of receivers
    subject: '有图片尺寸超标啦 ✔', // Subject line
    text: '有图片尺寸超标啦 ✔', // plaintext body
    html: '<b>Hello world ✔</b>' // html body
};

// var sendPwdReminder = transporter.templateSender({
//     subject: '有图片尺寸超标啦 ✔',
//     text: 'Hello, {{username}}, Your password is: {{ password }}',
//     html: '<b>Hello, <strong>{{username}}</strong>, Your password is:\n<b>{{ password }}</b></p>'
// }, {
//     from: settingConfig.emailFrom,
// });

//固定变量
var REG_URL   = '//';
var MAX_SIZE  = 200;
// var TIMEINTERVAL = 1000*60*60*6;
var TIMEINTERVAL = 1000*10;

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
function hasOverSize (arr) {
	var arrResult = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].imageCount.length > 0) {
			arrResult.push(arr[i].imageCount.length);
		}
	}
	return arrResult.length;
}

module.exports = function () {
	var timer = setInterval(function () {
		// Url.getAll(function (err, urlArr) {
			var urlArr = [{url: 'http://m.showjoy.com'},{url: 'http://www.showjoy.com'}];
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
		            if (checkLast() && hasOverSize(objArr)) {
                        var data = {};
                        data.list = objArr;
                        console.log(JSON.stringify(data));
                        var html = template('./views/email-img/html', data);
                        console.log(html)
                        mailOptions.html = html;
		                transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log(error);
                            }else{
                                console.log('Message sent: ' + info.response);
                            }
                        });
		            }
				});
		    }
		    for (var i = 0; i < urlArr.length; i++) {
		        openAgain(urlArr[i].url);
		    };
		// })
	}, TIMEINTERVAL);
}



