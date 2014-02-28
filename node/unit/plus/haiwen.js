exports.author = 'haiwen';
exports.exec = function(arr) {
	var curMax = 0;
	    var len = arr.length;
	    for(var i = len - 1 ; i > 0 ; i--){
	        curMax = arr[i] - curMax > 0 ? arr[i] : curMax;
	        arr[i] > 0 ? arr[i-1] += arr[i] : 0;
	    }
	    curMax = arr[0] - curMax > 0 ? arr[0] : curMax;
	    return curMax;
};