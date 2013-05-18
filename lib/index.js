var growl = require('growl');
var glob = require("glob");
var fs = require("fs");
var path = require('path');

var curr_dir = process.cwd();
var search_for = curr_dir + "/*.kit";

var options = {};

function log_error(message) {
	growl(message, { title: 'Kit Compiler', image: '../img/kitIcon.png'});
}

function read_file(file) {
	var data = -1;
	try {
		data = fs.readFileSync(file, 'utf8');
	}
	catch(err) {
		log_error("Error reading file: " + path.basename(file));
		data = -1;
	}
	return data;
}


var ok_status = true;

// options is optional
glob(search_for, options, function (er, files) {
	for (var i = 0; i < files.length; i++) {
		console.log(files[i]);

		var data = read_file(files[i]);
		if(data == -1)
		{
			ok_status = false;
			break;
		}

		//data = data.replace(/\s+/g, '');

		var reading_from = -1;
		var check_started = false;
		var reading_import = false;
		//var reading_variable = false;

		var import_data = "";

		for (var pos = 0; pos < data.length; pos++) {
			if(reading_import === false && data[pos].indexOf(' ') >= 0)
			{
				//Ignore Whitespace
			}
			else if(check_started === true && ((data[pos-6]=="@" && data[pos-5]=="i" && data[pos-4]=="m" && data[pos-3]=="p" && data[pos-2]=="o" && data[pos-1]=="r" && data[pos]=="t") || (data[pos-7]=="@" && data[pos-6]=="i" && data[pos-5]=="n" && data[pos-4]=="c" && data[pos-3]=="l" && data[pos-2]=="u" && data[pos-1]=="d" && data[pos]=="e")))
			{
				reading_import = true;
			}
			else if(check_started === true && reading_import === true && data[pos] == "-" && data[pos+1] == "-" && data[pos+2] == ">")
			{
				var file_length = data.length;
				var start_data = data.substring(0,reading_from);
				var end_data = data.substring((pos+2),file_length);

				var output_data = start_data;

				var to_import = import_data.split(',');
				for (var j = 0; j < to_import.length; j++) {

					//Strip Whitespace from Start/End of Filename
					var file_to_import = to_import[j].replace(/^\s+|\s+$/g, "");
					file_to_import = file_to_import.replace(/\"/g, '');

					if(file_to_import.indexOf('.') === -1)
						file_to_import += ".kit";

					if(fs.existsSync(curr_dir + "/" + file_to_import))
					{
						//Found the file at the original location
						output_data += read_file(curr_dir + "/" + file_to_import);
					}
					else
					{
						if(file_to_import.substring(0,1)==="_")
						{
							file_to_import = file_to_import.substring(1);
						}
						else
						{
							file_to_import = "_" + file_to_import;
						}

						if(fs.existsSync(curr_dir + "/" + file_to_import))
						{
							//Found the file with/without the underscore
							output_data += read_file(curr_dir + "/" + file_to_import);
						}
						else
						{
							//Cannot find the file
							log_error("Error reading import file: " + file_to_import);
						}
					}
				}

				output_data += end_data;

				//@TODO: Compensate Value for adjusting future replacements

				fs.mkdirSync('./build');

				output_file = fs.openSync('./build/' + path.basename(files[i]),'w');
				var buf = new Buffer(output_data);
				fs.writeSync(output_file, buf, 0, buf.length);

				import_data = "";
				reading_import = false;
				check_started = false;
				reading_from = -1;
			}
			else if(check_started === true && reading_import === true)
			{
				import_data += data[pos];
			}
			/*else if(check_started === true && data[pos]=="$")
			{
				reading_variable = true;
			}*/
			else if(data[pos] == "<" && data[pos+1] == "!" && data[pos+2] == "-" && data[pos+3] == "-")
			{
				check_started = true;
				reading_from = pos;
			}
		}

		//console.log(data.indexOf("<!--"));

		//console.log(data);
	}

	if(ok_status === true)
		growl('Kit Files Compiled', { title: 'Kit Compiler', image: '../img/kitIcon.png'});
});