/*
	Console output.
*/

module.exports = function(script) {
	// Set default verbosity.
	script.verbose = script.verbose || 0;

	/*
		log

		Log to the console.

		@param {Number} verbosity
	*/
	return function(verbosity) {
		if (verbosity > script.verbose) return;
		console.log.apply(console, Array.prototype.slice.call(arguments, 1));
	};
};
