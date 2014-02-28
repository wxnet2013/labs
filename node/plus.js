var data = require('./data500');

//test case
//console.log( Math.max.apply(null,[1,2,3,4,-1,10,11]) );
//console.log( combine( [1,2,3,4,-1] ));
//console.log( combine( [-1,-2,0,4,-1] ));
//console.log( combine( [-1,0,0,4,-1] ));
//console.log( combine( [-1,-2,0,-4,-1] ));
function combine(input){
	var rtn = [],len = input.length,i=0;
	for(;i<len;i++){
		if(input[i] == 0) {
			if(rtn[rtn.length - 1] != 0 ){
				rtn.push(input[i]);
			}
			continue;
		}
		if (!rtn.length) {
			rtn.push(input[i]);
			continue;
		}
		if(input[i] >= 0){
			if(rtn[rtn.length - 1] > 0 ) {
				rtn[rtn.length - 1] = rtn[rtn.length - 1] + input[i];
			} else{
				rtn.push(input[i]);
			}
		} else {
			if(rtn[rtn.length - 1] < 0 ) {
				rtn[rtn.length - 1] = rtn[rtn.length - 1] + input[i];
			} else{
				rtn.push(input[i]);
			}
		}
	}
	return rtn;
}



var max = 0;
function crossPlus(input){
	var rtn = [],
		i=0,
		len=input.length,
		tempMax = Math.max.apply(null,input);
	max = tempMax > max ? tempMax : max;
	if(len < 3){
		return max;
	}
	var j = 3,x=0,temp = [],tempv = 0;
	for(;j<=len;j++){
		for(i=0;i<len;i++){
			if(len - i < j) break;
			for(x=0;x<j;x++){
				tempv = tempv + input[x + i];
			}
			temp.push(tempv);
			tempv = 0;
		}
		tempMax = Math.max.apply(null,temp);
		max = tempMax > max ? tempMax : max;
		temp = [];
	}
	return max;
}


function getMaxSum(numbers) {
	var max = 0,tempmax = 0,i = 0,end = numbers.length;
	for (; i < end; i++) {
		tempmax = Math.max(tempmax + numbers[i], 0);
		max = Math.max(max, tempmax);
	}
	return max;
}


//test case
//console.log( crossPlus([-1,0,-1,3,-2]) );
//console.log("max: " + crossPlus([1,-1,3,-2]) );
//console.log("max: " + crossPlus([11,-1,3,13,-1,99]) );
console.time('total');
//console.time('combine');
//var newArr = combine( data );
//console.timeEnd('combine');
//console.time('plus');
console.log( getMaxSum(data) );
console.timeEnd('total');

