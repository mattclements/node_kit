var growl = require('./growl.js');
var walk = require('./walk.js');

var curr_dir = process.cwd();
console.log(curr_dir + "/*.kit");

//async with path callback 

walk(curr_dir,function(path,stat){
  console.log('found: ',path);
});

growl('Kit Files Compiled', { title: 'Kit Compiler', image: '../img/kitIcon.png'});