var Github = require('github-api');

var github = new Github({
	username: "wxnet2013",
	  password: "dddd",
	  auth: "basic"
});

var repo = github.getRepo('github', 'platform-samples');

repo.show(function(err,repo){
	console.log(repo);
});
