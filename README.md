# couchdb-merge

Shallow merge JSON objects into CouchDB documents. Input object properties will overwrite destination document properties, regardless of existence or type.

## Basic Usage

	couchdb-merge --host localhost --port 5984 --database db_name --json input.json

For each object in the input JSON file, the appropriate couchdb document will be updated. The latest document _rev is automatically retrieved before the merge is performed, therefore this is a "blind merge" - the input properties will always take precedence over the existing document properties at execution time.

## Input Formatting

The input json document must contain a root-level array of objects. Each object must at minimum contain an `_id` peoperty, referencing the document to merge the remaining properties of the object into.

Example input file;

	[
		{
			"_id":"d50ad02277690ca661ae5cecaf0db335",
			"title":"Elk Grove Villiage, IL"
		}
	]

## Options

* `-t --host [localhost]` The couchdb host.
* `-p --port [5984]` The couchdb port.
* `-d --database` The target database containing the documents to merge into.
* `-j --json` Path to the json input file.
* `-v --verbose` Print actions as they happen.

## License 

(The MIT License)

Copyright (c) 2011 Carson Christian &lt;cc@amplego.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
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