exports.author = 'qixiu';
exports.exec = function(array) {
	var i, last, len, ret, t;
	    last = array[0] > 0 ? array[0] : 0;
	    ret = last;
	    len = array.length;
	    i = 1;
	    while (i < len) {
	        t = last + array[i];
	        last = t > 0 ? t : 0;
	        if (last > ret) {
	            ret = last;
	        }
	        i++;
	    }
	    return ret;
};