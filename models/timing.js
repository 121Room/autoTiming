var mongodb = require('./db');


function Time(time) {
	this.domComplete = time.domComplete;
}

module.exports = Time;

Time.prototype.save = function (callback) {
	var date = new Date();
	//存储各种事件格式，方便以后拓展
	var clientTime = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + '-' +( date.getMonth() + 1 ),
		day: date.getFullYear() + '-' +( date.getMonth() + 1 ) + '-' + date.getDate(),
		minute: date.getFullYear() + '-' +( date.getMonth() + 1 ) + '-' + date.getDate() + ' ' + date.getHours() + ':' + ( date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() )
	}
	//要存入数据库的时间
	var time = {
		clientTime: clientTime,
		domComplete: this.domComplete
	}
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取times的集合
		db.collection('times', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.insert(time, {
				safe: true
			}, function (err, user) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user[0]);
			})
		})
	})
}
Time.getOne = function(name, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('times', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"clientTime.minute": name
			}, function (err, user) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user);
			})
		})
	})
}
