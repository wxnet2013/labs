# localStorage与domain设置

localStorage的写入和读取，不能跨子域，否则在一些移动端浏览器上，会出现读取不到的情况。

最近开发一个移动端的播放记录功能，在pc端和android版的chrome测试很顺利通过了，但后来进行多平台测试的时候，悲剧发生了。。

## 掉进localStorage的坑里
android版本UC、iphone及ipad mini版的safari，localStorage跨页面读取不到数据，必须要重启浏览器后才能够正常的读取到数据。

## 爬出localStorage的坑
首先怀疑的可能是localStorage的访问方式的问题，写入的方式是属性设置localStorage.history而读取是api的方式localStorage.getItem，demo后确认localStorage的三种访问方式都是没有问题的。

思维短路了，开始思考如何规避这个跨页面无法读取的问题，首先想到的是尝试下sessionStorage，浏览器运行期间将数据保存在“session”中，后来发现有着同样的问题。

继续思考能够跨页面保存“大数据”的方式，“灵光”闪现，window.name应该是可以跨页面保存的，试了下各种设备确认这种方案确实可行，但是风险是任何页面都有可能重写掉这个name，甚至会有安全问题。

用极简的demo测试，发现这些有问题的浏览器对localStorage的支持是没问题的。在几乎要放弃的时候，同事跑过来说，将某个文件提前到head里，可以正常的读取数据，这是才意识到播放器的前置代码里没有显示的设置document.domain，导致读取和设置localStorage在不同的domain下面发生的。

在写入localStorage的页面方法之前没有显示的设置document.domain,默认的值为 labs.wxnet.me,但是在读取的页面，读取数据之前显示的设置了document.domain为根域wxnet.me

## 将问题环境抽象为demo
写入数据的页面 http://labs.wxnet.me/labs/writelocalstorage.html
	
	//document.domain默认值为子域 labs.wxnet.me
	localStorage['k'] = '{"a":"1"}';
	document.domain = "wxnet.me";
	
读取数据的页面 http://labs.wxnet.me/labs/readlocalstorage.html

	document.domain = "wxnet.me";
	alert(localStorage['k']);

## 解决方案
读取和设置localStorage的页面必须要统一document.domain，要么全部不显示设置或统一设置为根域。

设置页面:

	document.domain = "wxnet.me";
	localStorage['k'] = '{"a":"1"}';
	
读取页面:

	document.domain = "wxnet.me";
	alert(localStorage['k']);
	
## 思考
不同的移动版浏览器在处理子域方式不同，iphone、ipad mini子域下写入，主域下是无法读取的，重启浏览器后忽略掉这个安全策略，可以读到数据。但是ipad、pc版的浏览器没有发现这个问题。

	