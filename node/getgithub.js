var https = require('https'),
	fs = require('fs');
https.get("https://github.com/jquery/jquery-ui", function(res) {
	
	var html = ''
	res.on('data', function(d) {
		html += d;
	});
	
	res.on('end', function() {
		fs.writeFile('./html.txt',html);
		var reStar = /stargazers\">\s*([\d|,]+)\s*</;
		var reFork = /network\".*>\s*([\d|,]+)\s*</
	    var star = html.match(reStar);
		var fk = html.match(reFork);
		console.log([fk[1],star[1]]);
	});
  
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
