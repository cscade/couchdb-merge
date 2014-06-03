#!/usr/bin/env node
/*
	couchdb-merge

	Created by Carson S. Christian <cscade@gmail.com>

	Shallow merge json objects into couchdb documents.

	-t, --host [localhost]	The couchdb host.
	-p, --port [5984]		The couchdb port.
	-d, --database			The target database containing the documents to merge into.
	-j, --json				Path to the json input file.
	-v, --verbose			Print actions as they happen.
*/

var coerce = require('./lib/coerce');
var colors = require('colors');
var script = require('commander');

// Initialize.
script
	.version('0.0.0')
	.option('-t, --host [host]', 'Connect to the specified host. [localhost]', 'localhost')
	.option('-p, --port [port]', 'Connect to the specified port. [5984]', 5984)
	.option('-d, --database [database]', 'Update documents within the specified database.')
	.option('-j, --json [file]', 'Update documents with the specified JSON.')
	.option('-v, --verbose', 'Print actions as they happen. Stack for greater verbosity.', coerce.verbosity, 0)
	.parse(process.argv);

// Logging.
var log = require('./lib/output')(script);

// Required options.
if (!script.database) return log(0, 'No target database specified. Use the'.green, '--database', 'option, or try'.green, '--help'), process.exit(1);
if (!script.json) return log(0, 'No source json specified. Use the'.green, '--json', 'option, or try'.green, '--help'), process.exit(1);

