var settings = require('../settings.js'),
Db = require('mongodb').Db,
Connection = require('mongodb').Connection,
Server = require('mongodb').Server;
module.exports = function () {
	return new Db(settings.db, new Server(settings.host, settings.port), {safe: true, poolSize: 1});
}
