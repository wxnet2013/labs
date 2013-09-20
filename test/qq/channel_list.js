/**
 * @name zepto.extend
 * @file 对Zepto做了些扩展，以下所有JS都依赖与此文件
 * @desc 对Zepto一些扩展，组件必须依赖
 * @import core/zepto.js
 */

(function($){
    $.extend($, {
        contains: function(parent, node) {
            /**
             * modified by chenluyang
             * @reason ios4 safari下，无法判断包含文字节点的情况
             * @original return parent !== node && parent.contains(node)
             */
            return parent.compareDocumentPosition
                ? !!(parent.compareDocumentPosition(node) & 16)
                : parent !== node && parent.contains(node)
        }
    });
})(Zepto);


//Core.js
;(function($, undefined) {
    //扩展在Zepto静态类上
    $.extend($, {
        /**
         * @grammar $.toString(obj)  ⇒ string
         * @name $.toString
         * @desc toString转化
         */
        toString: function(obj) {
            return Object.prototype.toString.call(obj);
        },

        /**
         * @desc 从集合中截取部分数据，这里说的集合，可以是数组，也可以是跟数组性质很像的对象，比如arguments
         * @name $.slice
         * @grammar $.slice(collection, [index])  ⇒ array
         * @example (function(){
         *     var args = $.slice(arguments, 2);
         *     console.log(args); // => [3]
         * })(1, 2, 3);
         */
        slice: function(array, index) {
            return Array.prototype.slice.call(array, index || 0);
        },

        /**
         * @name $.later
         * @grammar $.later(fn, [when, [periodic, [context, [data]]]])  ⇒ timer
         * @desc 延迟执行fn
         * **参数:**
         * - ***fn***: 将要延时执行的方法
         * - ***when***: *可选(默认 0)* 什么时间后执行
         * - ***periodic***: *可选(默认 false)* 设定是否是周期性的执行
         * - ***context***: *可选(默认 undefined)* 给方法设定上下文
         * - ***data***: *可选(默认 undefined)* 给方法设定传入参数
         * @example $.later(function(str){
         *     console.log(this.name + ' ' + str); // => Example hello
         * }, 250, false, {name:'Example'}, ['hello']);
         */
        later: function(fn, when, periodic, context, data) {
            return window['set' + (periodic ? 'Interval' : 'Timeout')](function() {
                fn.apply(context, data);
            }, when || 0);
        },

        /**
         * @desc 解析模版
         * @grammar $.parseTpl(str, data)  ⇒ string
         * @name $.parseTpl
         * @example var str = "<p><%=name%></p>",
         * obj = {name: 'ajean'};
         * console.log($.parseTpl(str, data)); // => <p>ajean</p>
         */
        parseTpl: function(str, data) {
            var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' + 'with(obj||{}){__p.push(\'' + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/<%=([\s\S]+?)%>/g, function(match, code) {
                return "'," + code.replace(/\\'/g, "'") + ",'";
            }).replace(/<%([\s\S]+?)%>/g, function(match, code) {
                    return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('";
                }).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + "');}return __p.join('');";
            var func = new Function('obj', tmpl);
            return data ? func(data) : func;
        },

        /**
         * @desc 减少执行频率, 多次调用，在指定的时间内，只会执行一次。
         * **options:**
         * - ***delay***: 延时时间
         * - ***fn***: 被稀释的方法
         * - ***debounce_mode***: 是否开启防震动模式, true:start, false:end
         *
         * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
         * X    X    X    X    X    X      X    X    X    X    X    X</code>
         *
         * @grammar $.throttle(delay, fn) ⇒ function
         * @name $.throttle
         * @example var touchmoveHander = function(){
         *     //....
         * }
         * //绑定事件
         * $(document).bind('touchmove', $.throttle(250, touchmoveHander));//频繁滚动，每250ms，执行一次touchmoveHandler
         *
         * //解绑事件
         * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.throttle返回的function, 当然unbind那个也是一样的效果
         *
         */
        throttle: function(delay, fn, debounce_mode) {
            var last = 0,
                timeId;

            if (typeof fn !== 'function') {
                debounce_mode = fn;
                fn = delay;
                delay = 250;
            }

            function wrapper() {
                var that = this,
                    period = Date.now() - last,
                    args = arguments;

                function exec() {
                    last = Date.now();
                    fn.apply(that, args);
                };

                function clear() {
                    timeId = undefined;
                };

                if (debounce_mode && !timeId) {
                    // debounce模式 && 第一次调用
                    exec();
                }

                timeId && clearTimeout(timeId);
                if (debounce_mode === undefined && period > delay) {
                    // throttle, 执行到了delay时间
                    exec();
                } else {
                    // debounce, 如果是start就clearTimeout
                    timeId = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - period : delay);
                }
            };
            // for event bind | unbind
            wrapper._zid = fn._zid = fn._zid || $.proxy(fn)._zid;
            return wrapper;
        },

        /**
         * @desc 减少执行频率, 在指定的时间内, 多次调用，只会执行一次。
         * **options:**
         * - ***delay***: 延时时间
         * - ***fn***: 被稀释的方法
         * - ***t***: 指定是在开始处执行，还是结束是执行, true:start, false:end
         *
         * 非at_begin模式
         * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
         *                         X                                X</code>
         * at_begin模式
         * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
         * X                                X                        </code>
         *
         * @grammar $.debounce(delay, fn[, at_begin]) ⇒ function
         * @name $.debounce
         * @example var touchmoveHander = function(){
         *     //....
         * }
         * //绑定事件
         * $(document).bind('touchmove', $.debounce(250, touchmoveHander));//频繁滚动，只要间隔时间不大于250ms, 在一系列移动后，只会执行一次
         *
         * //解绑事件
         * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.debounce返回的function, 当然unbind那个也是一样的效果
         */
        debounce: function(delay, fn, t) {
            return fn === undefined ? $.throttle(250, delay, false) : $.throttle(delay, fn, t === undefined ? false : t !== false);
        }
    });

    /**
     * 扩展类型判断
     * @param {Any} obj
     * @see isString, isBoolean, isRegExp, isNumber, isDate, isObject, isNull, isUdefined
     */
    /**
     * @name $.isString
     * @grammar $.isString(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***String***
     * @example console.log($.isString({}));// => false
     * console.log($.isString(123));// => false
     * console.log($.isString('123'));// => true
     */
    /**
     * @name $.isBoolean
     * @grammar $.isBoolean(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***Boolean***
     * @example console.log($.isBoolean(1));// => false
     * console.log($.isBoolean('true'));// => false
     * console.log($.isBoolean(false));// => true
     */
    /**
     * @name $.isRegExp
     * @grammar $.isRegExp(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***RegExp***
     * @example console.log($.isRegExp(1));// => false
     * console.log($.isRegExp('test'));// => false
     * console.log($.isRegExp(/test/));// => true
     */
    /**
     * @name $.isNumber
     * @grammar $.isNumber(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***Number***
     * @example console.log($.isNumber('123'));// => false
     * console.log($.isNumber(true));// => false
     * console.log($.isNumber(123));// => true
     */
    /**
     * @name $.isDate
     * @grammar $.isDate(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***Date***
     * @example console.log($.isDate('123'));// => false
     * console.log($.isDate('2012-12-12'));// => false
     * console.log($.isDate(new Date()));// => true
     */
    /**
     * @name $.isObject
     * @grammar $.isObject(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***Object***
     * @example console.log($.isObject('123'));// => false
     * console.log($.isObject(true));// => false
     * console.log($.isObject({}));// => true
     */
    /**
     * @name $.isNull
     * @grammar $.isNull(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***null***
     * @example console.log($.isNull(false));// => false
     * console.log($.isNull(0));// => false
     * console.log($.isNull(null));// => true
     */
    /**
     * @name $.isUndefined
     * @grammar $.isUndefined(val)  ⇒ Boolean
     * @desc 判断变量类型是否为***undefined***
     * @example
     * console.log($.isUndefined(false));// => false
     * console.log($.isUndefined(0));// => false
     * console.log($.isUndefined(a));// => true
     */
    $.each("String Boolean RegExp Number Date Object Null Undefined".split(" "), function( i, name ){
        var fn;

        if( 'is' + name in $ ) return;//already defined then ignore.

        switch (name) {
            case 'Null':
                fn = function(obj){ return obj === null; };
                break;
            case 'Undefined':
                fn = function(obj){ return obj === undefined; };
                break;
            default:
                fn = function(obj){ return new RegExp(name + ']', 'i').test( toString(obj) )};
        }
        $['is'+name] = fn;
    });

    var toString = $.toString;

})(Zepto);

//Support.js
(function($, undefined) {
    var ua = navigator.userAgent,
        na = navigator.appVersion,
        br = $.browser;

    /**
     * @name $.browser
     * @desc 扩展zepto中对browser的检测
     *
     * **可用属性**
     * - ***qq*** 检测qq浏览器
     * - ***chrome*** 检测chrome浏览器
     * - ***uc*** 检测uc浏览器
     * - ***version*** 检测浏览器版本
     *
     * @example
     * if ($.browser.qq) {      //在qq浏览器上打出此log
     *     console.log('this is qq browser');
     * }
     */
    $.extend( br, {
        qq: /qq/i.test(ua),
        uc: /UC/i.test(ua) || /UC/i.test(na)
    } );

    br.uc = br.uc || !br.qq && !br.chrome && !br.firefox && !/safari/i.test(ua);

    try {
        br.version = br.uc ? na.match(/UC(?:Browser)?\/([\d.]+)/)[1] : br.qq ? ua.match(/MQQBrowser\/([\d.]+)/)[1] : br.version;
    } catch (e) {}


    /**
     * @name $.support
     * @desc 检测设备对某些属性或方法的支持情况
     *
     * **可用属性**
     * - ***orientation*** 检测是否支持转屏事件，UC中存在orientaion，但转屏不会触发该事件，故UC属于不支持转屏事件(iOS 4上qq, chrome都有这个现象)
     * - ***touch*** 检测是否支持touch相关事件
     * - ***cssTransitions*** 检测是否支持css3的transition
     * - ***has3d*** 检测是否支持translate3d的硬件加速
     *
     * @example
     * if ($.support.has3d) {      //在支持3d的设备上使用
     *     console.log('you can use transtion3d');
     * }
     */
    $.support = $.extend($.support || {}, {
        orientation: !(br.uc || (parseFloat($.os.version)<5 && (br.qq || br.chrome))) && !($.os.android && parseFloat($.os.version) > 3) && "orientation" in window && "onorientationchange" in window,
        touch: "ontouchend" in document,
        cssTransitions: "WebKitTransitionEvent" in window,
        has3d: 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()
    });

})(Zepto);

//Event.js
(function($) {
    /**
     * @name $.matchMedia
     * @grammar $.matchMedia(query)  ⇒ MediaQueryList
     * @desc 是原生的window.matchMedia方法的polyfill，对于不支持matchMedia的方法系统和浏览器，按照[w3c window.matchMedia](http://www.w3.org/TR/cssom-view/#dom-window-matchmedia)的接口
     * 定义，对matchMedia方法进行了封装。原理是用css media query及transitionEnd事件来完成的。在页面中插入media query样式及元素，当query条件满足时改变该元素样式，同时这个样式是transition作用的属性，
     * 满足条件后即会触发transitionEnd，由此创建MediaQueryList的事件监听。由于transition的duration time为0.001ms，故若直接使用MediaQueryList对象的matches去判断当前是否与query匹配，会有部分延迟，
     * 建议注册addListener的方式去监听query的改变。$.matchMedia的详细实现原理及采用该方法实现的转屏统一解决方案详见
     * [GMU Pages: 转屏解决方案($.matchMedia)](https://github.com/gmuteam/GMU/wiki/%E8%BD%AC%E5%B1%8F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88$.matchMedia)
     *
     * **MediaQueryList对象包含的属性**
     * - ***matches*** 是否满足query
     * - ***query*** 查询的css query，类似\'screen and (orientation: portrait)\'
     * - ***addListener*** 添加MediaQueryList对象监听器，接收回调函数，回调参数为MediaQueryList对象
     * - ***removeListener*** 移除MediaQueryList对象监听器
     *
     * @example
     * $.matchMedia('screen and (orientation: portrait)').addListener(fn);
     */
    $.matchMedia = (function() {
        var mediaId = 0,
            cls = 'gmu-media-detect',
            transitionEnd = $.fx.transitionEnd,
            cssPrefix = $.fx.cssPrefix,
            $style = $('<style></style>').append('.' + cls + '{' + cssPrefix + 'transition: width 0.001ms; width: 0; position: relative; bottom: -999999px;}\n').appendTo('head');

        return function (query) {
            var id = cls + mediaId++,
                $mediaElem = $('<div class="' + cls + '" id="' + id + '"></div>').appendTo('body'),
                listeners = [],
                ret;

            $style.append('@media ' + query + ' { #' + id + ' { width: 100px; } }\n') ;   //原生matchMedia也需要添加对应的@media才能生效
            // if ('matchMedia' in window) {
            //     return window.matchMedia(query);
            // }

            $mediaElem.on(transitionEnd, function() {
                ret.matches = $mediaElem.width() === 100;
                $.each(listeners, function (i,fn) {
                    $.isFunction(fn) && fn.call(ret, ret);
                });
            });

            ret = {
                matches: $mediaElem.width() === 100 ,
                media: query,
                addListener: function (callback) {
                    listeners.push(callback);
                    return this;
                },
                removeListener: function (callback) {
                    var index = listeners.indexOf(callback);
                    ~index && listeners.splice(index, 1);
                    return this;
                }
            };

            return ret;
        };
    }());

    $(function () {
        var handleOrtchange = function (mql) {
                if ( state !== mql.matches ) {
                    $( window ).trigger( 'ortchange' );
                    state = mql.matches;
                }
            },
            state = true;
        $.mediaQuery = {
            ortchange: 'screen and (width: ' + window.innerWidth + 'px)'
        };
        $.matchMedia($.mediaQuery.ortchange).addListener(handleOrtchange);
    });

    /**
     * @name Trigger Events
     * @theme event
     * @desc 扩展的事件
     * - ***scrollStop*** : scroll停下来时触发, 考虑前进或者后退后scroll事件不触发情况。
     * - ***ortchange*** : 当转屏的时候触发，兼容uc和其他不支持orientationchange的设备，利用css media query实现，解决了转屏延时及orientation事件的兼容性问题
     * @example $(document).on('scrollStop', function () {        //scroll停下来时显示scrollStop
     *     console.log('scrollStop');
     * });
     *
     * $(window).on('ortchange', function () {        //当转屏的时候触发
     *     console.log('ortchange');
     * });
     */
    /** dispatch scrollStop */
    function _registerScrollStop(){
        $(window).on('scroll', $.debounce(80, function() {
            $(document).trigger('scrollStop');
        }, false));
    }
    //在离开页面，前进或后退回到页面后，重新绑定scroll, 需要off掉所有的scroll，否则scroll时间不触发
    function _touchstartHander() {
        $(window).off('scroll');
        _registerScrollStop();
    }
    _registerScrollStop();
    $(window).on('pageshow', function(e){
        if(e.persisted) {//如果是从bfcache中加载页面
            $(document).off('touchstart', _touchstartHander).one('touchstart', _touchstartHander);
        }
    });
})(Zepto);

/**
 *  @file 基于Zepto的图片延迟加载插件
 *  @name zepto.imglazyload
 *  @desc 图片延迟加载
 *  @import core/zepto.extend.js
 */

 //doc http://gmu.baidu.com/doc#imglazyload
(function ($) {
    /**
     * @name imglazyload
     * @grammar  imglazyload(opts)   ⇒ self
     * @desc 图片延迟加载
     * **Options**
     * - ''placeHolder''     {String}:              (可选, 默认值:\'\')图片显示前的占位符
     * - ''container''       {Array|Selector}:      (可选, 默认值:window)图片延迟加载容器，若innerScroll为true，则传外层wrapper容器即可
     * - ''threshold''       {Array|Selector}:      (可选, 默认值:0)阀值，为正值则提前加载
     * - ''urlName''         {String}:              (可选, 默认值:data-url)图片url名称
     * - ''eventName''       {String}:              (可选, 默认值:scrollStop)绑定事件方式
     * - ''refresh''         {Boolean}              (可选, 默认值:false)是否是更新操作，若是页面追加图片，可以将该参数设为true
     * - ''innerScroll''     {Boolean}              (可选, 默认值:false)是否是内滚，若内滚，则不绑定eventName事件，用户需在外部绑定相应的事件，可调$.fn.imglazyload.detect去检测图片是否出现在container中
     * - ''isVertical''      {Boolean}              (可选, 默认值:true)是否竖滚
     * - ''startload''       {Function}             (可选, 默认值:null)开始加载前的事件，该事件作为参数，不是trigger的
     *
     * **events**
     * - ''startload'' 开始加载图片
     * - ''loadcomplete'' 加载完成
     * - ''error'' 加载失败
     *
     * @example $('.lazy-load').imglazyload();
     * $('.lazy-load').imglazyload().on('error', function (e) {
     *     e.preventDefault();      //该图片不再加载
     * });
     */
    var pedding;
    $.fn.imglazyload = function (opts) {
        var splice = Array.prototype.splice,
            opts = $.extend({
                threshold:0,
                container:window,
                urlName:'data-url',
                placeHolder:'',
                eventName:'scrollStop',
                refresh: false,
                innerScroll: false,
                isVertical: true,
                startload: null
            }, opts),
            $viewPort = $(opts.container),
            isVertical = opts.isVertical,
            isWindow = $.isWindow($viewPort.get(0)),
            OFFSET = {
                win: [isVertical ? 'scrollY' : 'scrollX', isVertical ? 'innerHeight' : 'innerWidth'],
                img: [isVertical ? 'top' : 'left', isVertical ? 'height' : 'width']
            };

        !isWindow && (OFFSET['win'] = OFFSET['img']);   //若container不是window，则OFFSET中取值同img

        function isInViewport(offset) {      //图片出现在可视区的条件
            var viewOffset = isWindow ? window : $viewPort.offset(),
                viewTop = viewOffset[OFFSET.win[0]],
                viewHeight = viewOffset[OFFSET.win[1]];
            return viewTop >= offset[OFFSET.img[0]] - opts.threshold - viewHeight && viewTop <= offset[OFFSET.img[0]] + offset[OFFSET.img[1]];
        }

        pedding = $.slice(this).reverse();
        if (opts.refresh) return this;      //更新pedding值，用于在页面追加图片

        function _load(div) {     //加载图片，并派生事件
            var $div = $(div), $img;
            $.isFunction(opts.startload) && opts.startload.call($div);
            $img = $('<img />').on('load',function () {
                $div.replaceWith($img).trigger('loadcomplete');
                $img.off('load');
            }).on('error',function () {     //图片加载失败处理
                var errorEvent = $.Event('error');       //派生错误处理的事件
                $div.trigger(errorEvent);
                errorEvent.defaultPrevented || pedding.push(div);
                $img.off('error').remove();
            }).attr('src', $div.attr(opts.urlName));
        }

        function _detect() {     //检测图片是否出现在可视区，并对满足条件的开始加载
            var i, $image, offset, div;
            for (i = pedding.length; i--;) {
                $image = $(div = pedding[i]);
                offset = $image.offset();
                isInViewport(offset) && (splice.call(pedding, i, 1), _load(div));
            }
        }

        $(document).ready(function () {    //页面加载时条件检测
            opts.placeHolder && $(pedding).append(opts.placeHolder);     //初化时将placeHolder存入
            _detect();
        });

        !opts.innerScroll && $(window).on(opts.eventName + ' ortchange', function () {    //不是内滚时，在window上绑定事件
            _detect();
        });

        $.fn.imglazyload.detect = _detect;    //暴露检测方法，供外部调用

        return this;
    };

})(Zepto);

//搜索结果页
//wangxiang


le.m.loadMore= {
	init: function(){
		this._initDom();
		if(!this._moredata.html()){
			return;
		}
		this._initEvent();
		this._parseData();
	},
	_initDom: function(){
		this._moredata = $('#j-listmore');
		this._moreBtn = $('.j-more');
		this._listWrapper = this._moredata.parent();
		this._win = $(window);
		this._doc = $(document);
	},
	_initEvent: function(){
		this.__scroll = _.bind(this._scroll,this);
		//bfcache bug
        //this._win.on('scroll',this.__scroll);
        window.addEventListener('scroll',this.__scroll,false);

        //alert('initevent');
        /*
        this._win.on('pageshow',_.bind(this._pageshow,this));
        this._win.on('pagehide', function(){
            alert('hide');
        });
        this._win.on('scroll',function(){
            alert('scroll');
        });

        window.addEventListener('scroll',function(){
            //alert(33333333333333);
        },false);*/

        /*
        window.onscroll = function(){
            alert('2222222222222222');
        };*/
	},
    /*
    _pageshow: function(e){
        //bfcache 浏览器返回 缓存
        alert('pageshow2');
        alert(e.persisted);
        if(e.persisted) {
            alert(this.__scroll);
            this._win.on('scroll',this.__scroll);   
        }
    },*/
	_moreSize: 6,
	_scroll: function(){
        //alert(this._list);
        //alert('list: ' + _.size(this._list));
		var top = this._listWrapper.position()['top'],
			height = this._listWrapper.height(),
			scrollTop = this._win.scrollTop(),
			winHeight = this._win.height(),
			data = null;

        //alert([top,height,scrollTop,winHeight]);
		
		if(!_.size(this._list)) {
			//this._win.off('scroll',this.__scroll);
			if(!!this._moreBtn.size() && this._moreBtn.hasClass('f-hide') ){
				this._moreBtn.removeClass('f-hide');
			}
			return;
		}

        //alert((scrollTop + winHeight) > (top + height) );
		if( (scrollTop + winHeight) > (top + height) ) {
            alert(111111);
			data = this._list.splice(0,this._moreSize);
			this._moredata.before(data.join(''));
			$('img[data-url]').imglazyload();
		}
		//alert([top,height,scrollTop,winHeight,this._doc.height()]);
	},
	_list: [],
	_parseData: function(){
		var html = this._moredata.html();
		this._list = html.split('</dl>');
		this._list = _.map(this._list,function(v){
			v = v.trim();
			if( v == '') return '';
			return v + '</dl>';
		});
		this._list = _.compact(this._list);
	}
};
//列表页
//wangxiang



$('img[data-url]').imglazyload();
le.m.loadMore.init();

