# localStorage与domain设置

## 现象
android版本UC\safari Iphone版及ipad mini版，localStorage跨页面不能读取到数据，重启浏览器后能够正常读取。

## 原因
在写入localStorage的页面方法之前没有显示的设置document.domain,默认的值为 labs.wxnet.me,但是在读取的页面，读取数据之前显示的设置了document.domain为根域,wxnet.me

## demo
写入数据的页面 http://labs.wxnet.me/labs/writelocalstorage.html
	
	localStorage['k'] = '{"a":"1"}';
	document.domain = "wxnet.me";
	
读取数据的页面 http://labs.wxnet.me/labs/readlocalstorage.html

	document.domain = "wxnet.me";
	alert(localStorage['k']);

## 解决方案
读取和设置页面必须要统一document.domain，全部不显示设置或统一设置为根域。

设置页面:

	document.domain = "wxnet.me";
	localStorage['k'] = '{"a":"1"}';
	
读取页面:

	document.domain = "wxnet.me";
	alert(localStorage['k']);

	