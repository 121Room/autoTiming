var phantomas = require('phantomas');

// var task2 = phantomas('http://market.showjoy.com/activity/ctopic/23929.html', function (err, json, results) {
// 				console.log([
//                 'phantomas results',
//                 json, // parsed JSON with raw results
//                 results.getAsserts() // results object with metrics values, offenders, asserts data
//         ]);
// })

// task2.on('results', function (results) {
// 	console.log([
// 		'task results',
// 		results,
// 		results.getMetrics()
// 		]);
// })
var domComplete = 0;
var task = phantomas('http://showjoy.com', function (err, json, results) {
			// console.log([
			//         'phantomas results',
			//         json, // parsed JSON with raw results
			//         results.getAsserts() // results object with metrics values, offenders, asserts data
			// ]);
})
task.on('results', function (results) {
	domComplete = results.getMetrics();
	console.log(domComplete);
})
	
