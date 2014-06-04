/*
	Tests for couchdb-merge.
*/

var exec = require('child_process').exec;
var nano = require('nano')('http://localhost:5984');
var should = require('should');

// Set up.
before(function(done) {
	nano.db.create('couchdb-merge-test', function(e) {
		if (e) return done(e);
		nano.use('couchdb-merge-test').insert(require(__dirname + '/couchdb/testDocument.json'), done);
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
			exec('couchdb-merge -j foo.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if no json file is provided', function(done) {
			exec('couchdb-merge -d couchdb-merge-test', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json path is invalid', function(done) {
			exec('couchdb-merge -d couchdb-merge-test -j bad/path.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json input is empty', function(done) {
			exec('couchdb-merge -d couchdb-merge-test -j test/json/empty.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json input is malformed', function(done) {
			exec('couchdb-merge -d couchdb-merge-test -j test/json/malformed.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if json input is not a root-level array', function(done) {
			exec('couchdb-merge -d couchdb-merge-test -j test/json/object.json', function(e) {
				should.exist(e);
				e.should.be.instanceOf(Error);
				e.code.should.equal(1);
				done();
			});
		});
		it('should exit with status 1 if target database does not exist', function(done) {
			exec('couchdb-merge -d bad-db-name -j test/json/array-only.json', function(e) {
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
			exec('couchdb-merge -d couchdb-merge-test -j test/json/array-only.json', function(e) {
				should.not.exist(e);
				done();
			});
		});
		it('should exit with status 0 when input json contains only objects without valid _ids', function(done) {
			exec('couchdb-merge -d couchdb-merge-test -j test/json/no-valid-ids.json', function(e) {
				should.not.exist(e);
				done();
			});
		});
		it('should exit with status 0 when input json contains only objects with no matching couchdb documents', function(done) {
			exec('couchdb-merge -d couchdb-merge-test -j test/json/no-matching.json', function(e) {
				should.not.exist(e);
				done();
			});
		});
	});
});
