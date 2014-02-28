exports.author = 'yongba';
exports.exec = function(arr) {
	var len = arr.length - 1,
	        sum = arr[len],
	        subSum = 0;

	    for (; len >= 0; len--) {

	        subSum = subSum < 0 ? arr[len] : (subSum + arr[len])
	        if (sum < subSum) {
	            sum = subSum;
	        }
	    }

	    return sum;
};