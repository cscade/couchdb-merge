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
		var message = Array.prototype.slice.call(arguments, 1);

		if (verbosity > script.verbose) return;
		if (verbosity > 0) message.unshift(' ');
		console.log.apply(console, message);
	};
};
