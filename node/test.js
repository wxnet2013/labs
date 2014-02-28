//author
//exec
var glob = require('glob');
var data = require('./data500');
var project = 'plus'

glob('unit/' + project + '/*.js',function (er, files) {
  files.forEach(function(v){
	  var test = require('./' + v),
	  	  t1=0,
		  t2=0,
		  res=0,
		  i=0,
		  temp=0,
		  arr = null;
		  
	  author = test.author;
	  arr = data.concat();
	  for(i=0;i<10;i++){
		t1 = Date.now();
	  	res = test.exec(arr);
		t2 = Date.now();
	    temp = temp + (t2-t1);
	  }
	  
	  console.log('author: ' + author);
	  console.log('result:' + res) ;
	  console.log('time: ' + (temp / 10));
	  test = null;
  });
});


