var phantom = require('phantom');

module.exports = function () {
  phantom.create(function (ph) {
      
      function openAgain(url) {
          ph.createPage(function (page) {
              var t = new Date().getTime();
              var tDomCompleteTime = 0;
              var objTime = {};
              page.open(url, function (status) {
                  page.evaluate(function(t) {
        				    
                    return window.addEventListener('load', function () {
                      var diffTime = new Date().getTime() - t;
                      return t;
                    }, false)
                    // var _timer1=setInterval(function(){
                    // if(/interactive/.test(document.readyState)){
                    //         clearInterval(_timer1);
                    //         return new Date().getTime() - t;
                    //     }
                    // }, 5);

        				  },
        				  function(result) {
        				    console.log('load time: ' + result);
        				    ph.exit();
        				  }, t);
              });
          });
      }
      openAgain('http://10.1.2.77:8000/injectTiming.html');
  });

}