var growl = require('growl');
var glob = require("glob");

var curr_dir = process.cwd();
var search_for = curr_dir + "/*.kit";

var options = {};

// options is optional
glob(search_for, options, function (er, files) {
	for (var i = 0; i < files.length; i++) {
		console.log(files[i]);
	}
});

growl('Kit Files Compiled', { title: 'Kit Compiler', image: '../img/kitIcon.png'});