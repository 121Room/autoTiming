var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, head, title, post, tags) {
	this.name = name;
	this.title = title;
	this.post = post;
	this.tags = tags;
	this.head = head;
}
module.exports = Post;

//存储一篇文章及相关信息
Post.prototype.save = function (callback) {
	var date = new Date();
	//存储各种事件格式，方便以后拓展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + '-' +( date.getMonth() + 1 ),
		day: date.getFullYear() + '-' +( date.getMonth() + 1 ) + '-' + date.getDate(),
		minute: date.getFullYear() + '-' +( date.getMonth() + 1 ) + '-' + date.getDate() + ' ' + date.getHours() + ':' + ( date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() )
	}
	//要存入数据库的文档
	var post = {
		name: this.name,
		title: this.title,
		head: this.head,
		time: time,
		post: this.post,
		comments: [],
		tags: this.tags,
		reprint_info: {},
		pv: 0
	}
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//db是返回的数据库
		//再查找读取posts集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//将文档插入posts集合
			collection.insert(post, {
				safe: true
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			})
		})
	})
}
Post.getTen = function (name, page, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			//这里加判断是因为有可能筛选的时候不通过文章名字（即全选）
			if (name) {
				query.name = name;
			}
			//根据query对象查询文章以对象进行查询
			//查询的时候都是
			//time-1 指的是对数据进行降序排序
			//使用count返回特定查询的文档数
			collection.count(query, function (err, total) {
				//根据query对象查询，并跳过前（page-1）*10个结果，返回之后的10个结果
				collection.find(query, {
					skip: (page - 1) * 10,
					limit: 10
				}).sort({
					time: -1
				}).toArray(function (err, docs) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					//解析markdown语法为html
					docs.forEach(function (doc) {
						doc.post = markdown.toHTML(doc.post);
					})
					callback(null, docs, total);
				})
			})
		})
	})
}
Post.getOne = function (name, day, title, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名 发表日期 文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function (err, doc) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				if (doc) {
					//找到该片文章后将pv增加1
					collection.update({
						"name": name,
						"time.day": day,
						"title": title
					}, {
						$inc: {"pv": 1}
					}, function (err) {
						mongodb.close();
						if (err) {
							return callback(err);
						}
					})
					doc.post = markdown.toHTML(doc.post);
				}
				if (doc.comments) {
					doc.comments.forEach(function (comment) {
						comment.content = markdown.toHTML(comment.content);
					})
				}
				callback(null, doc);
			})
		})
	})
}
Post.edit = function (name, day, title, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function (err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, doc);
			})
		})
	})
}
Post.update = function (name, day, title, post, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.update({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				$set: {post: post}
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			})
		})
	})
}
Post.remove = function (name, day, title, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function (err, doc) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				var reprint_from = '';
				if (doc.reprint_info.reprint_from) {
					reprint_from = doc.reprint_info.reprint_from;
					collection.update({
						"name": reprint_from.name,
						"time.day": reprint_from.day,
						"title": reprint_from.title
					}, {
						$pull: {
							"reprint_info.reprint_to": {
								"name": name,
								"day": day,
								"title": title
							}
						}
					}, function (err) {
						if (err) {
							mongodb.close();
							return callback(err);
						}
					})
				}
				collection.remove({
					"name": name,
					"time.day": day,
					"title": title
				}, {
					w:1
				}, function (err) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					callback(null);
				})
			})
			
		})
	})
}
Post.getArchive = function (callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			})
		})
	})
}
//返回所有的标签
Post.getTags = function (callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//distinct 用来找出给定建的所有不同值
			collection.distinct("tags", function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			})
		})
	})
}
Post.getTag = function (tag, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find({
				"tags": tag
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs)
			})
		})
	})
}
Post.search = function (keyword, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection("posts", function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var pattern = new RegExp(keyword, "i");
			collection.find({
				"title": pattern
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			})
		})
	})
}
Post.reprint = function (reprint_from, reprint_to, callback) {
	//转载后 原文章的reprint_info里的reprint_to和转载文章的reprint_from会改变
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"name": reprint_from.name,
				"time.day": reprint_from.day,
				"title": reprint_from.title
			}, function (err, doc) {
				if (err) {
					mongodb.close();
					return callback(err);
				}

				var date = new Date();
				var time = {
					date: date,
					year: date.getFullYear(),
					month: date.getFullYear() + '-' +( date.getMonth() + 1 ),
					day: date.getFullYear() + '-' +( date.getMonth() + 1 ) + '-' + date.getDate(),
					minute: date.getFullYear() + '-' +( date.getMonth() + 1 ) + '-' + date.getDate() + ' ' + date.getHours() + ':' + ( date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() )
				}
				delete doc._id;//删除掉原来文章的_id

				doc.name = reprint_to.name;
				doc.head = reprint_to.head;
				doc.time = time;
				doc.title = (doc.title.search(/转载/) > -1) ? doc.title : "转载" + doc.title;
				doc.comments = [];
				doc.reprint_info = {
					"reprint_from": reprint_from
				};
				doc.pv = 0;

				//更新被转载的原文档的reprint_info的reprint_to
				collection.update({
					"name": reprint_from.name,
					"time.day": reprint_from.day,
					"title": reprint_from.title 
				}, {
					$push: {
						"reprint_info.reprint_to": {
							"name": doc.name,
							"day": time.day,
							"title": doc.title
						}
					}
				}, function (err) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
				})
				collection.insert(doc, {
					safe: true
				}, function (err, post) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					callback(null, post[0]);
				})
			})
		})
	})
}














