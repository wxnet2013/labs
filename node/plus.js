var data = require('./data');


function combine(input){
	var rtn = [],len = input.length,i=0;
	for(;i<len;i++){
		if(input[i] == 0) continue;
		if (!rtn.length) {
			rtn.push(input[i]);
			continue;
		}
		if(input[i] >= 0){
			if(rtn[rtn.length - 1] >= 0 ) {
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

//console.log( Math.max.apply(null,[1,2,3,4,-1,10,11]) );
console.log( combine( [1,2,3,4,-1] ));

