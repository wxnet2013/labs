exports.author = 'xiangge';
exports.exec = function(numbers) {
	var max = 0,tempmax = 0,i = 0,end = numbers.length,t=0;
	for (; i < end; i++) {
		t = tempmax + numbers[i];
		tempmax = t > 0 ? t : 0; //Math.max(tempmax + numbers[i], 0);
		max = max > tempmax ? max : tempmax;// Math.max(max, tempmax);
	}
	return max;
};