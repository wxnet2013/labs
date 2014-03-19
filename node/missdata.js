var test = [46, 22, 17, 15, 19, 20, 25, 29, 50, 11, 33, 10, 3, 44, 37, 47, 40, 5, 27, 24, 41, 12, 14, 16, 30, 31, 34, 48, 4, 42, 28, 8, 21, 32, 39, 9, 38, 43, 26, 2, 35, 49, 6, 45, 13, 18, 36];


function getNum(num,a,b,c){
	var i = 0, len = num-3, arr = new Array(len), offset = Math.floor(len*Math.random());
	while(i < num){
		i++;
		if(i != a && i != b && i != c){
			while(arr[offset]){
				offset = Math.floor(len*Math.random());
			}
			arr[offset] = i;
		}
	}
	return arr;
}

test = getNum(90000,6,10,9);

//排序算法 http://jsdo.it/norahiko/oxIy/fullscreen

var quickSort = function(arr) {
　　if (arr.length <= 1) { return arr; }
　　var pivotIndex = Math.floor(arr.length / 2);
　　var pivot = arr.splice(pivotIndex, 1)[0];
　　var left = [];
　　var right = [];
　　for (var i = 0; i < arr.length; i++){
　　　　if (arr[i] < pivot) {
　　　　　　left.push(arr[i]);
　　　　} else {
　　　　　　right.push(arr[i]);
　　　　}
　　}
　　return quickSort(left).concat([pivot], quickSort(right));
};



console.time('test');

var sortData = test.sort(function(a,b){
	return a - b;
});

var arr = [];
if(sortData[0] != 1) {
	arr.push(1);
}
var temp = 0
for(var i=0,len=sortData.length - 1;i < len; i++){
	if(sortData[i+1] - sortData[i] > 1 ){
		temp = sortData[i] + 1;
		while(temp < sortData[i+1]){
			arr.push(temp++);
		}
		if(arr.length == 3) {
			break;
		}
	}
}

console.log(arr);

console.timeEnd('test');