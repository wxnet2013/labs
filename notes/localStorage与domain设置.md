# localStorage与domain设置

## 现象
android版本UC及Iphone版safari，localStorage跨页面不能读取到数据，重启浏览器后能够正常读取。

## 原因
在写入localStorage的页面方法之前没有显示的设置document.domain,但是在读取的页面，读取数据之前显示的设置了document.domain为根域。
## demo
写入数据的页面 writelocalstorage.html
	
	localStorage['k'] = '{"a":"1"}';
	document.domain = "wxnet.me";
	
读取数据的页面 readlocalstorage.html

	document.domain = "wxnet.me";
	alert(localStorage['k']);
