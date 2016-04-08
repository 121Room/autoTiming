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

function Performance(json) {
	this.performance = json;
}

module.exports = Performance;

Performance.prototype.save = function (callback) {
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
	var json = {
		configJson: self.config
	}
	//打开数据库
	pool.acquire(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取times的集合
		db.collection('performances', function (err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);
			}
			collection.insert(self.performance, {
				safe: true
			}, function (err, json) {
				pool.release(db);
				if (err) {
					return callback(err);
				}
				if (typeof callback === 'function') {
					callback(null, json);
				}
			})
		})
	})
}
Performance.getAll = function(callback) {
	pool.acquire(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('performances', function (err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);
			}
			collection.find().toArray(function (err, docs) {
				pool.release(db);
				if (err) {
					return callback(err);
				}
				callback(null, docs)
			})
		})
	})
}
