var phantomas = require('phantomas'),
	task      = null,
	url       = 'http://www.w3cplus.com/';
task = phantomas(url, function(err, json, results) {
  // err: exit code
  // json: parsed JSON with raw results
  // results: results object with metrics values, offenders, asserts data
  console.log(json.offenders.imageCount);
});
// var t = new Date().getTime();
// task.on('milestone', function(milestone) {
//   // reports page loading milestone - first byte received, onDOMReady, window.onload
//   	console.log(milestone);
//   	if (milestone === 'domComplete') {
//   		console.log('load time: ' + (new Date().getTime() - t));
//   	} else if (milestone === 'domInteractive') {
//   		console.log('interactive time: ' + (new Date().getTime() - t))
//   	}
// });
// task.on('results', function(results) {
//   // results object with metrics values, offenders, asserts data
//   console.log(results.getMetrics().domComplete);
// });