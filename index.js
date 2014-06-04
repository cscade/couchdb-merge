#!/usr/bin/env node
/*
	couchdb-merge

	Created by Carson S. Christian <cscade@gmail.com>

	Shallow merge json objects into couchdb documents.

	-t, --host [http://localhost]	The couchdb host.
	-p, --port [5984]		The couchdb port.
	-d, --database			The target database containing the documents to merge into.
	-j, --json				Path to the json input file.
	-v						Print actions as they happen. Stack for greater verbosity.
*/

var async = require('async');
var badId = 0;
var coerce = require('./lib/coerce');
var colors = require('colors');
var db;
var fs = require('fs');
var nano;
var notFound = 0;
var path = require('path');
var script = require('commander');
var updated = 0;
var util = require('util');
var xtend = require('xtend');

// Initialize.
script
	.version('0.1.0')
	.option('-t, --host [host]', 'Connect to the specified host. [http://localhost]', 'http://localhost')
	.option('-p, --port [port]', 'Connect to the specified port. [5984]', parseInt, 5984)
	.option('-d, --database [database]', 'Update documents within the specified database.')
	.option('-j, --json [file]', 'Update documents with the specified JSON.')
	.option('-v', 'Print actions as they happen. Stack for greater verbosity.', coerce.verbosity, 0)
	.parse(process.argv);

// Logging.
var log = require('./lib/output')(script);
log(1, 'Starting up.'.green);

// Required options.
if (!script.database) return log(0, 'No target database specified. Use the'.green, '--database', 'option, or try'.green, '--help'), process.exit(1);
if (!script.json) return log(0, 'No source json specified. Use the'.green, '--json', 'option, or try'.green, '--help'), process.exit(1);
script.json = path.resolve(script.json);

// Database connection.
if (script.host.slice(0, 4) !== 'http') script.host = 'http://' + script.host;
nano = require('nano')(script.host + ':' + script.port);

// Set up, verify.
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
		log(2, 'Couchdb:'.blue, script.host + ':' + script.port);
		nano.db.get(script.database, function(e, body) {
			if (e && e.code === 'ENOTFOUND') return next(new Error('could not connect to ' + (script.host + ':' + script.port)));
			if (e && e.status_code === 404) return next(new Error(script.database + ' does not exist'));
			if (e) return next(e);
			log(1, 'Couchdb database'.blue, script.database, 'exists, ok.'.blue);
			db = nano.use(script.database);
			next();
		});
	}
}, function(e, results) {
	if (e) return log(0, 'Error:'.red, e.message), process.exit(1);
	// Perform the merges.
	async.forEach(results.json, function(input, next) {
		if (!input._id) return log(1, 'Object has no _id, ignoring:'.yellow, util.inspect(input)), badId++, next();
		db.get(input._id, function(e, doc) {
			var result;

			if (e && e.status_code === 404) return log(1, 'Document'.yellow, input._id, 'does not exist, skipping.'.yellow), notFound++, next();
			else if (e) return next(e);
			log(2, 'Document'.blue, doc._id, 'is at rev'.blue, doc._rev);
			result = xtend(doc, input);
			db.insert(result, function(e, body) {
				if (e) return next(e);
				log(3, 'Document'.blue, result._id, 'updated to rev'.blue, body.rev);
				updated++;
				next();
			});
		});
	}, function(e) {
		if (e) return log(0, 'Error:'.red, e.message), process.exit(1);
		log(0, 'All done!'.green, updated, 'documents were updated.'.green);
		if (notFound) log(0, 'Missing documents:'.yellow, notFound, 'document could not be found in couchdb.'.yellow);
		if (badId) log(0, 'Bad inputs:'.yellow, badId, 'input objects had bad or missing _id properties.'.yellow);
		process.exit(0);
	});
});