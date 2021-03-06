/*
	Tests for couchdb-merge.
*/

var exec = require('child_process').exec;
var nano = require('nano')('http://localhost:5984');
var should = require('should');

// Set up.
before(function(done) {
	nano.db.create('couchdb-merge-test', done);
});

// Test document state.
beforeEach(function(done) {
	nano.use('couchdb-merge-test').insert(require(__dirname + '/couchdb/testDocument.json'), done);
});
afterEach(function(done) {
	nano.use('couchdb-merge-test').get('test_document', function(e, doc) {
		if (e) return done();
		nano.use('couchdb-merge-test').destroy(doc._id, doc._rev, done);
	});
});

// Tear down.
after(function(done) {
	nano.db.destroy('couchdb-merge-test', done);
});

describe('couchdb-merge', function() {
	// Input checking.
	describe('error conditions', function() {
		it('should exit with status 1 if no database is provided', function(done) {
			exec('./index.js -j foo.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if no json file is provided', function(done) {
			exec('./index.js -d couchdb-merge-test', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json path is invalid', function(done) {
			exec('./index.js -d couchdb-merge-test -j bad/path.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json input is empty', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/empty.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json input is malformed', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/malformed.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json input is not a root-level array', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/object.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if target database does not exist', function(done) {
			exec('./index.js -d bad-db-name -j test/json/array-only.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
	});

	// No-ops.
	describe('no-ops', function() {
		it('should exit with status 0 when input json contains no objects', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/array-only.json', function(e) {
				should.not.exist(e);
				done();
			});
		});
		it('should exit with status 0 when input json contains only objects without valid _ids', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/no-valid-ids.json', function(e) {
				should.not.exist(e);
				done();
			});
		});
		it('should exit with status 0 when input json contains only objects with no matching couchdb documents', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/no-matching.json', function(e) {
				should.not.exist(e);
				done();
			});
		});
	});

	// Merging.
	describe('merging', function() {
		it('should add new properties', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/merge-add-new.json', function(e) {
				should.not.exist(e);
				nano.use('couchdb-merge-test').get('test_document', function(e, doc) {
					should.not.exist(e);
					doc.should.have.property('test', 'Yay!');
					done();
				});
			});
		});
		it('should overwrite existing properties', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/merge-overwrite.json', function(e) {
				should.not.exist(e);
				nano.use('couchdb-merge-test').get('test_document', function(e, doc) {
					should.not.exist(e);
					doc.should.have.property('simple', 'bar');
					doc.should.have.property('complex');
					doc.complex.should.eql({
						"foo": "bar"
					});
					done();
				});
			});
		});
		it('should leave unmentioned properties alone', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/merge-add-new.json', function(e) {
				should.not.exist(e);
				nano.use('couchdb-merge-test').get('test_document', function(e, doc) {
					should.not.exist(e);
					doc.should.have.property('simple', 'foo');
					done();
				});
			});
		});
		it('should set properties passed in as null literally', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/merge-delete-null.json', function(e) {
				should.not.exist(e);
				nano.use('couchdb-merge-test').get('test_document', function(e, doc) {
					should.not.exist(e);
					doc.should.have.property('complex');
					(doc.complex === null).should.be.true;
					done();
				});
			});
		});
		it('should delete properties passed in as null when --prune is set', function(done) {
			exec('./index.js -d couchdb-merge-test -j test/json/merge-delete-null.json --prune', function(e) {
				should.not.exist(e);
				nano.use('couchdb-merge-test').get('test_document', function(e, doc) {
					should.not.exist(e);
					doc.should.not.have.property('complex');
					done();
				});
			});
		});
	});
});
