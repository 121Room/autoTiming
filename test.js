var phantom = require('phantom');
phantom.create(function (ph) {
    
    function openAgain(url) {
        ph.createPage(function (page) {
            var t = new Date().getTime();
            var tDomCompleteTime = 0;
            var objTime = {};
            page.open(url, function (status) {
                page.evaluate(function() {
      				    function funny() {
      				      var results = document.querySelector('#J_Time');
      				      var data = results.getAttribute('data-time');
                    var data3 = results.id;
      				      return data;
      				    }

      				    // var dataObj = JSON.parse(funny());
      				    // return dataObj;
                  return funny();
      				  },
      				  function(result) {
      				    console.log(result);
      				    ph.exit();
      				  });
            });
        });
    }
    openAgain('http://10.1.2.77:8000/injectTiming.html');
});