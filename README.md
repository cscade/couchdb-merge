# couchdb-merge

[![Build Status](https://travis-ci.org/cscade/couchdb-merge.svg)](https://travis-ci.org/cscade/couchdb-merge)

Shallow merge JSON documents into CouchDB documents from the command line.

	npm install -g couchdb-merge

## Basic Usage

	$ couchdb-merge --database db_name --json source.json

For each object in the input JSON file, the appropriate couchdb document will be updated. The latest document _rev is automatically retrieved before the merge is performed, therefore this is a "blind merge" - the input properties will always take precedence over the existing document properties at execution time.

## Options

* `-t, --host [localhost]` The couchdb host.
* `-p, --port [5984]` The couchdb port.
* `-d, --database` The target database containing the documents to merge into.
* `-j, --json` Path to the json input file.
* `-x, --prune` Delete document properties when object values === null.
* `-v` Print actions as they happen. Stack for greater verbosity.

## Input Formatting

The input json document must contain a root-level array of objects. Each object must at minimum contain an `_id` property, referencing the document to merge the remaining properties of the object into.

Example input file;

	[
		{
			"_id":"mydoc",
			"title":"Elk Grove Village, IL"
		}
	]

Given the input document above, the couchdb document `mydoc` would be updated to include a `title` property of `Elk Grove Village, IL`. The result would be the same regardless of whether the couchdb document contained a title property before the merge. All other properties of the destination document will remain unchanged.

Properties can be arbitrarily complex and nested, the merge is performed with both the source and destination objects as javascript objects. Just remember this is a shallow merge, so if you need to maintain properties in nested sections of the destination document inside a property you are updating, they must be included in the source json!

## Cleaning Up With --prune

By default, when an object in the json document has a property with a value of `null`, `null` will be written to the couchdb document literally. By using the `--prune` command line option, you can alter this behavior to "clean up" target documents during the merge. Take the following example;

	# couchdb doc before merge:
	{
		"_id": "mydoc",
		"name": "foo",
		"type": "example"
	}

	# Input object from your json array:
	{
		"_id": "mydoc",
		"type": null
	}

	# The resulting document in couch:
	# Default behavior
	{
		"_id": "mydoc",
		"name": "foo",
		"type": null
	}
	# With --prune
	{
		"_id": "mydoc",
		"name": "foo"
	}

## License 

(The MIT License)

Copyright (c) 2014 Carson Christian &lt;cc@amplego.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.