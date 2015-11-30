var urlArr = ['http://www.showjoy.com', 'http://www.baidu.com', 'http://market.showjoy.com/activity/ctopic/25438.html'];
var $boxResult = $('.j_results');

function AutoSending (arr) {
	this.urlArr = arr;
  var timer = function (url) {
    $.ajax({
      dataType: 'json',
      url: '/report',
      type: 'POST',
      data: {
        url: url.toString()
      },
      success: function (data) {
        console.log(data);
        $boxResult.append('<p>' + JSON.stringify(data) + '</p>');
      }
    })
  }
  timer(this.urlArr);
	this.init = function () {
    var that = this;
		setInterval(function () {
      timer(that.urlArr);
    }, 1000*60*2)
	};
}

var autoTiming = new AutoSending(urlArr);
autoTiming.init();