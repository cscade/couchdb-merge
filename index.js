#!/usr/bin/env node
/*
	couchdb-merge

	Created by Carson S. Christian <cscade@gmail.com>

	Shallow merge json objects into couchdb documents.

	-t, --host [http://localhost]	The couchdb host.
	-p, --port [5984]		The couchdb port.
	-d, --database			The target database containing the documents to merge into.
	-j, --json				Path to the json input file.
	-v, --verbose			Print actions as they happen.
*/

var async = require('async');
var coerce = require('./lib/coerce');
var colors = require('colors');
var fs = require('fs');
var nano;
var path = require('path');
var script = require('commander');

// Initialize.
script
	.version('0.0.0')
	.option('-t, --host [host]', 'Connect to the specified host. [http://localhost]', 'http://localhost')
	.option('-p, --port [port]', 'Connect to the specified port. [5984]', parseInt, 5984)
	.option('-d, --database [database]', 'Update documents within the specified database.')
	.option('-j, --json [file]', 'Update documents with the specified JSON.')
	.option('-v, --verbose', 'Print actions as they happen. Stack for greater verbosity.', coerce.verbosity, 0)
	.parse(process.argv);

// Logging.
var log = require('./lib/output')(script);
log(0, 'Starting up.'.green);

// Required options.
if (!script.database) return log(0, 'No target database specified. Use the'.green, '--database', 'option, or try'.green, '--help'), process.exit(1);
if (!script.json) return log(0, 'No source json specified. Use the'.green, '--json', 'option, or try'.green, '--help'), process.exit(1);
script.json = path.resolve(script.json);

// Database connection.
if (script.host.slice(0, 4) !== 'http') script.host = 'http://' + script.host;
nano = require('nano')(script.host + ':' + script.port);

// Set up.
async.parallel({
	json: function(next) {
		log(2, 'Reading json:'.blue, script.json);
		fs.readFile(script.json, 'utf8', function (e, json) {
			if (e) return next(e);
			try {
				json = JSON.parse(json);
			} catch (e) {
				return next(e);
			}
			if (!Array.isArray(json)) return next(new Error('input json must contain a root level array'));
			log(1, 'Reading json:'.blue, json.length, 'input objects in json document.');
			next(null, json);
		});
	},
	database: function(next) {
		log(2, 'CouchDB:'.blue, script.host + ':' + script.port);
		nano.db.get(script.database, function(e, body) {
			if (e && e.code === 'ENOTFOUND') return next(new Error('could not connect to ' + (script.host + ':' + script.port)));
			if (e && e.status_code === 404) return next(new Error(script.database + ' does not exist'));
			if (e) return next(e);
			log(1, 'CouchDB:'.blue, 'database exists, ok.');
			next();
		});
	}
}, function(e, results) {
	if (e) return log(0, 'Error:'.red, e.message), process.exit(1);

});