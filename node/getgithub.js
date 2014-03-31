var https = require('https'),
	fs = require('fs'),
	mongoose = require('mongoose'),
	_ = require('underscore'),
	async = require('async');
	
mongoose.connect('mongodb://127.0.0.1:27017/cdnjs');

var Cdnjs = mongoose.model('cdnjs', { 
	  "name": String,
	  "filename": String,
	  "version": String,
	  "homepage": String,
	  "description": String,
	  "keywords": [String],
	  "maintainers":[{"name": String,"email":String,"web": String}],
	  "bugs": String,
	  "licenses": [{"type":String,"url":String}],
	  "repository":{"type": String,"url": String},
	  "repositories": [{}],
	  "assets": [{"version": String,"files": [String]}]
});

async.waterfall([
	//get data
    function(callback){
		Cdnjs.find({},{
			repositories:1,
			name: 1,
			_id: 0
		}).exec(function(err,list){	
			var arr = [];
			_.each(list,function(v){
				var t = v.repositories[0],url = '';
				if(t){
					if(t.url == 'git://github.com/angular-strap/angular-strap.git'){
						t.url = 'https://github.com/mgcrea/angular-strap';
					}
					if(/^git\@github.com\:/.test(t.url)){
						t.url = t.url.replace(/git\@github.com\:/,'https://github.com/')
								.replace(/\.git$/,'');
					}
					if(/^git\:\/\/github\.com\//.test(t.url) && /\.git$/.test(t.url)){
						t.url = t.url.replace(/git\:\/\/github\.com\//,'https://github.com/')
								.replace(/\.git$/,'');
						
					}
					if(t && t.url && t.url.indexOf('https') == 0){
						url  = v.repositories[0].url.replace(/\.git$/,'');
						arr.push([v.name,url]);
					}
				}
			});
			callback(null,arr);
		});
    },
	//正常处理
    function(arr, callback){
		var arr301 = [],datas = [];
		async.each(arr, function(obj,cb){
			var path = obj[1];
			// bitbucket
			if(path.indexOf('bitbucket') !== -1){
				cb();		
				return;
			}
			// other
			if(path.indexOf('https://github.com') == -1) { 
				cb();		
				return;
			}
			https.get(path, function(res) {	
				if(res.statusCode == '301'){
					//console.log('301=============')
					//console.log(res.headers.location);
					if(res.headers.location.indexOf('https://github.com') == 0){
						arr301.push([obj[0],res.headers.location])
					}
					cb();	
					return;
				}
				var html = ''
				res.on('data', function(d) {
					html += d;
				});
				res.on('end', function() {
					var reStar = /stargazers\">\s*([\d|,]+)\s*</;
					var reFork = /network\".*>\s*([\d|,]+)\s*</
				    var star = html.match(reStar);
					var fk = html.match(reFork);
					if(!fk){
						console.log(path);
						console.log(fk);
					}
					if(fk && star) {
						//console.log([obj[0],fk[1]])
						datas.push({
							name: obj[0],
							star: +star[1].replace(',',''),
							fork: +fk[1].replace(',','')
						})
					}
					cb();
				});
			}).on('error', function(e) {
			  cb("Got error: " + e.message);
			});
		}, function(err) {
			//console.log('301 list ===============');
		    //console.log(arr301);
			//console.log('301 list end ===============');
			callback(null, arr301,datas);
		});  
    },
	//301的地址
    function(arr, datas, callback){
		async.each(arr, function(obj,cb){
			https.get(obj[1], function(res) {	
				var html = ''
				res.on('data', function(d) {
					html += d;
				});
				res.on('end', function() {
					var reStar = /stargazers\">\s*([\d|,]+)\s*</;
					var reFork = /network\".*>\s*([\d|,]+)\s*</
				    var star = html.match(reStar);
					var fk = html.match(reFork);
					if(!fk){
						console.log(path);
						console.log(fk);
					}
					if(fk && star) {
						//console.log([obj[0],fk[1]])
						datas.push({
							name: obj[0],
							star: +star[1].replace(',',''),
							fork: +fk[1].replace(',','')
						})
					}
					cb();
				});
			}).on('error', function(e) {
			  cb("Got error: " + e.message);
			});
		}, function(err) {
			// 301 data ==========
		    //console.log(datas);
			// 301 data end ==========
			callback(null, datas);
		});
    }
], function (err, result) {
   // result now equals 'done'  
   console.log(result);  
});
