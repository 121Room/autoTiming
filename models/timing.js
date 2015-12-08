var Db = require('./db');
var poolModule = require('generic-pool');
var pool = poolModule.Pool({
  name     : 'mongoPool',
  create   : function(callback) {
    var mongodb = Db();
    mongodb.open(function (err, db) {
      callback(err, db);
    })
  },
  destroy  : function(mongodb) {
    mongodb.close();
  },
  max      : 100,
  min      : 5,
  idleTimeoutMillis : 30000,
  log      : true
});

function Time(url, time) {
	this.domComplete = time.domComplete;
	this.url = url;
}

module.exports = Time;

Time.prototype.save = function (callback) {
	var self = this;
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
		domComplete: self.domComplete,
		url: self.url
	}
	//打开数据库
	pool.acquire(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取times的集合
		db.collection('times', function (err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);
			}
			collection.insert(time, {
				safe: true
			}, function (err, user) {
				pool.release(db);
				if (err) {
					return callback(err);
				}
				callback(null);
			})
		})
	})
}
Time.getAll = function(url, callback) {
	pool.acquire(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('times', function (err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);
			}
			collection.find({
				"url": url
			}).sort({
				time: 1
			}).toArray(function (err, docs) {
				pool.release(db);
				if (err) {
					return callback(err);
				}
				callback(null, docs)
			})
		})
	})
}
