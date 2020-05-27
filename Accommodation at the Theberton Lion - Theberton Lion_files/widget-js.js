/***************************************************

		DOM OBJECT AND CURSOR POSITION OBJECT / METHODS

 ***************************************************/

var mouseX, mouseY;


function Position(o)
{
	this.obj = o;
	this.x=0;
	this.y=0;
	this.getSize = getObjSize;
}

function getObjSize()
{
	this.w = this.obj.offsetWidth;
	this.h = this.obj.offsetHeight;
}

function getObjPosition(objId)
{
	var o=document.getElementById(objId);
	var pos=new Position(o);
	var offsetX = 0;
	var offsetY = 0;
	while (o)
	{
		offsetX += o.offsetLeft;
		offsetY += o.offsetTop;
		o = o.offsetParent;
	}
	pos.x = offsetX;
	pos.y = offsetY;
	pos.getSize();
	return pos;
}



function getMouseXY(e) {
  if (document.all)
	{ // grab the x-y pos.s if browser is IE
    mouseX = window.event.clientX + document.documentElement.scrollLeft;
    mouseY = window.event.clientY + document.documentElement.scrollTop;
  }
	else
	{  // grab the x-y pos.s if browser is not IE
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
  return true;
}


function showAtMousePos(content, divObj)
{
	// optional 3rd and 4th arguments : offsetX, offsetY
	var offsetX = (arguments.length > 2) ? mouseX + arguments[2] : mouseX;
	var offsetY = (arguments.length > 3) ? mouseY + arguments[3] : mouseY;
	divObj.innerHTML = content;
	divObj.style.left = offsetX + 'px';
	divObj.style.top = offsetY + 'px';
	divObj.style.visibility = 'visible';
}


function changeHtmlContent(elementid, content)
{
	var el = document.getElementById(elementid);
  if (document.all)
	{
		el.innerHTML = content;
	}
  else if (document.getElementById)
	{
    var rng = document.createRange();
    rng.setStartBefore(el);
    var htmlFrag = rng.createContextualFragment(content);
    while (el.hasChildNodes())
		{
			el.removeChild(el.lastChild);
		}
    el.appendChild(htmlFrag);
	}
	
	if (arguments.length > 2)
	{
		el.style.display = arguments[2];
	}
	return true;
}


function injectScript(scriptText)
{
	var scrpt = document.createElement('script');
	scrpt.setAttribute('type', 'text/javascript');
	scrpt.text = scriptText;
	document.body.appendChild(scrpt);
}






/*
	******************************************************

		dynamictable object methods
		- a div-based pseudo table manipulated using the DOM

	******************************************************
 */

dynamictable.prototype.create = dt_create;
dynamictable.prototype.addrow = dt_add_row;
dynamictable.prototype.deleterow = dt_delete_row;
dynamictable.prototype.shiftRowsUp = dt_shift_rows_up;
dynamictable.prototype.shiftRowsDown = dt_shift_rows_down;
dynamictable.prototype.attachStylesheet = dt_attach_stylesheet;


function dynamictable(id)
{
	this.id = id;
	this.numRows = 0;
	this.rowsById = new Array();
	this.rowsByPos = new Array();
	
	var d;
	if (d = document.getElementById(id))
	{
		this.obj = d;
	}
	else
	{
		this.create(id);
	}
}


function dt_create(id)
{
	var newElement = document.createElement('div');
	newElement.id = id;
	document.body.appendChild(newElement);
	this.obj = newElement;
}


function dt_add_row(id)
{
	// optional second argument for position to insert row element : default 0 = end
	// optional third argument for class name of row element : default 'dt_tablerow'
	var newElement = document.createElement('div');
	newElement.id = id;
	newElement.className = (arguments.length > 2) ? arguments[2] : 'dt_tablerow';
	
	var pos = (arguments.length > 1) ? arguments[1] : 0;
	if ((this.numRows == 0) || (pos == 0) || (pos > this.numRows)) // insert at the end
	{
		this.obj.appendChild(newElement);
		this.numRows++;
		this.rowsById[id] = this.numRows;
		this.rowsByPos[this.numRows] = id;
		return newElement;
	}
	else if (pos < 0) // insert at a reversed offset from the end
	{
		pos = (Number(pos) + this.numRows >= 0) ? (Number(pos) + this.numRows + 1) : 1;
	}
	var oldElement = document.getElementById(this.rowsByPos[pos]);
	this.obj.insertBefore(newElement, oldElement);
	this.shiftRowsUp(pos);
	this.rowsByPos[pos] = id;
	this.rowsById[id] = pos;
	return newElement;
}


function dt_shift_rows_up(pos)
{
	if (pos <= this.numRows)
	{
		var rowId;
		for (var i=this.numRows + 1; i > pos; i--)
		{
			rowId = this.rowsByPos[i-1];
			this.rowsByPos[i] = rowId;
			this.rowsById[rowId] = i;
		}
		this.numRows++;
	}
}


function dt_delete_row()
{
	var id, pos, ditchNode;
	if (arguments.length > 0)
	{
		id = arguments[0];
		pos = this.rowsById[id];
	}
	else if (this.numRows>0)
	{
		pos = this.numRows;
		id = this.rowsByPos[pos];
	}
	var ditchNode = document.getElementById(id);
	this.obj.removeChild(ditchNode);
	this.shiftRowsDown(pos);
	return true;
}


function dt_shift_rows_down(pos)
{
	if (pos <= this.numRows)
	{
		var rowId = this.rowsByPos[pos];
		delete this.rowsById[rowId];
		for (var i=pos; i<this.numRows; i++)
		{
			rowId = this.rowsByPos[i+1];
			this.rowsByPos[i] = rowId;
			this.rowsById[rowId] = i;
		}
		delete this.rowsByPos[this.numRows];
		this.numRows--;
	}
}


function dt_attach_stylesheet(href)
{
	var newElement = document.createElement('link');
	newElement.setAttribute('type', 'text/css');
	newElement.setAttribute('rel', 'stylesheet');
	newElement.setAttribute('href', href);
	document.getElementsByTagName('head')[0].appendChild(newElement);
}

calendarPopup.prototype.rowHeight = 20;
calendarPopup.prototype.numLabelRows = 2;
calendarPopup.prototype.months = ['January', 'February', 'March', 'April', 'May', 'June',
																	'July', 'August', 'September', 'October', 'November', 'December'];


calendarPopup.prototype.init = cp_init_date; // gets selected date from cookie, or sets to today
calendarPopup.prototype.create = cp_create; // creates required DOM display elements
calendarPopup.prototype.position = cp_position; // moves display div for calendar
calendarPopup.prototype.calOpen = cp_open; 
calendarPopup.prototype.show = cp_make_visible; // makes calendar visible
calendarPopup.prototype.showMonth = cp_show_month; // show selected month, from cache, or using ajax
calendarPopup.prototype.chooseDate = cp_set_date; // sets the date of this object by passing a YYYY-MM-DD string
calendarPopup.prototype.setPeriod = cp_set_period; // sets object period property
calendarPopup.prototype.dateString = cp_get_date_string; // returns object date as YYYY-MM-DD string
calendarPopup.prototype.clearObsoleteCache = cp_clear_obsolete_cache; // clears old cache on date selection 
calendarPopup.prototype.save = cp_store_cookie; // stores date properties in a cookie
calendarPopup.prototype.generateSelectedDays=cp_generate_selected_days;

function calendarPopup(calName, containerId)
{
	this.name = calName;
	this.id = 'cp_container_' + this.name;
	
	this.containerId=containerId;
	this.container = document.getElementById(containerId);
	this.basePath = '/resource/calendarPopupv2/';
	this.openerId  = 'cp_opener_' + this.name;
	
	this.dateCookie = this.name + '_cp_date';
	this.periodCookie = this.name + '_cp_period';

	this.cache = {}; // we'll use this to keep ajax calls to a minimum
	
	//methods
	this.callback = (typeof cp_callback == 'function') ? cp_callback : false;

	this.create();
	cp_calendar_collection.add(this);
	this.toggle = true; // allows calendar to be held visible in event of document.onclick overriding opener.onclick
}




function cp_create()
{
	this.init();

	newElement = document.createElement('div');
	newElement.id = this.id;
	newElement.className = 'cp_container';
	document.body.appendChild(newElement);
	
	this.obj = newElement;
	
	var opener = document.createElement('img');
	opener.id = this.openerId;
	opener.src = basePath + '/images/calendar.gif';
	opener.width = '16'; opener.height = '15'; opener.border = '0';
	opener.alt = 'calendar icon';
	opener.style.cursor = 'pointer';
	eval('opener.onclick = function() { ' + this.name + '.calOpen(); };');
	
	this.container.appendChild(opener);
	this.position(opener);
	
}



function cp_position(o)
{
	var offsetX = o.offsetWidth;
	var offsetY = 0;

		while (o)
		{
			offsetX += o.offsetLeft;
			offsetY += o.offsetTop;
			o = o.offsetParent;
		}

	
	this.obj.style.left = (offsetX + 1) + 'px';
	this.obj.style.top = (offsetY + 1) + 'px';
}



function cp_init_date()
{
	var dateCookiePat = new RegExp(this.dateCookie + '=(\\d{4})\\-(\\d{2})\\-(\\d{2})');
	var periodCookiePat = new RegExp(this.periodCookie + '=(\\d{1,2})');

	var dateCookie = document.cookie.match(dateCookiePat);
	var periodCookie = document.cookie.match(periodCookiePat);
	if (dateCookie!=null && dateCookie)
	{
		
		this.y = Number(dateCookie[1]);
		this.m = Number(dateCookie[2]);
		this.d = Number(dateCookie[3]);
	}
	else
	{
		var d = new Date(defaultCheckIn);
		this.y = d.getFullYear();
		this.m = d.getMonth() + 1;
		this.d = d.getDate();
	}
	this.period = periodCookie ? Number(periodCookie[1]) : defaultPeriod;
	this.save();
	this.generateSelectedDays();
}


function cp_generate_selected_days()
{
	//use stupid 0-11 for months
	var selectedDays={};
	startDate=new Date(this.y,this.m-1,this.d,0,0,0,0);

	cd=new Date();
	for (i=0;i<this.period;i++)
	{
		cd.setTime(startDate.getTime()+(i*86400000));	
		selectedDays[cd.getFullYear()+'-'+cd.getMonth()+'-'+cd.getDate()]=true;
	}
	this.selectedDays=selectedDays;
}


function cp_set_date(date)
{
	// date needs to be YYYY-MM-DD
	var datePat = /^(\d{4})\-(\d{2})\-(\d{2})$/;
	if (datePat.test(date))
	{
		this.y = Number(date.replace(datePat, '$1'));
		this.m = Number(date.replace(datePat, '$2'));
		this.d = Number(date.replace(datePat, '$3'));
		this.save();
		this.generateSelectedDays();		
		if (this.callback)
		{
			this.callback(date);
		}
		this.obj.style.visibility = 'hidden';
	}
}


function cp_set_period(p)
{
	var periodPat = /^[1-9]\d?$/;
	if (periodPat.test(p))
	{
		this.period = Number(p);
		this.save();
	}
}


function cp_store_cookie()
{
	this.clearObsoleteCache();
	document.cookie = this.dateCookie + '=' + escape(this.dateString()) + ';path=/';
	document.cookie = this.periodCookie + '=' + this.period + ';path=/';
}


function cp_clear_obsolete_cache()
{
	var months = {};
	
	// cache indexes of newly selected month(s)
	var startIndex = this.y + '-';
	startIndex += (this.m < 10) ? '0' + this.m : this.m;
	months[startIndex] = true;

	var d = new Date(this.y, this.m - 1, this.d + this.period);
	var endIndex = d.getFullYear() + '-';
	var m = d.getMonth() + 1;
	endIndex += (m < 10) ? '0' + m : m;
	months[endIndex] = true;
	
	// cache indexes of cookie stored month(s), if any
	var dateCookiePat = new RegExp(this.dateCookie + '=(\\d{4})\\-(\\d{2})\\-(\\d{2})');
	var periodCookiePat = new RegExp(this.periodCookie + '=(\\d{1,2})');
	var dateCookie = document.cookie.match(dateCookiePat);
	var periodCookie = document.cookie.match(periodCookiePat);
	
	
	if (dateCookie)
	{
		months[dateCookie[1] + '-' + dateCookie[2]] = true;
	}
	
	if (periodCookie)
	{
		d = new Date(Number(dateCookie[1]), Number(dateCookie[2]) - 1, Number(dateCookie[3]) + Number(periodCookie[1]));
		endIndex = d.getFullYear() + '-';
		m = d.getMonth() + 1;
		endIndex += (m < 10) ? '0' + m : m;
		months[endIndex] = true;
	}
	
	for (var m in months)
	{
		if (this.cache[m])
		{
			delete this.cache[m];
		}
	}
	
}


function cp_open()
{
	if (this.obj.style.visibility != 'visible')
	{
		changeHtmlContent(this.id, 'please wait');
		this.showMonth(this.dateString());
	}
	else
	{
		this.obj.style.visibility = 'hidden';
		this.toggle = true;
	}
}


function cp_make_visible(html, calRows)
{
//	this.obj.style.height = ((Number(calRows) + this.numLabelRows) * this.rowHeight + 1) + 'px';
//	changeHtmlContent(this.id, html);
//	this.obj.style.height='900px';
	this.position(document.getElementById(this.openerId));
	this.obj.style.visibility = 'visible';
}


function cp_show_month(month)
{
	var validMonth = /^\d{4}\-\d{2}(\-\d{2})?$/;
	if (validMonth.test(month))
	{
		month = month.substr(0,7);
		c_displayCalendar(this.id,month.substr(5,2),month.substr(0,4),this.selectedDays);
		this.toggle=false;
		this.show();
	}
}



function cp_get_date_string()
{
	return dateStr = String(this.y) + '-'
								 + ((this.m < 10) ? '0' + this.m : this.m) + '-'
								 + ((this.d < 10) ? '0' + this.d : this.d);
}



/*
	Calendar collection object - used to keep the screen tidy of all calendars
	in the event of window resize and clicks outside calendar divs
*/




var cp_calendar_collection = { windowResetIsSet : false, calendars : {} };

cp_calendar_collection.add = function(calObj)
{
	this.calendars[calObj.name] = calObj;
	this.windowReset();
};
 
cp_calendar_collection.clickCheck = function(e)
{
	var clickTarget = (e && e.target) || (event && event.srcElement);
	var closeCals = true;
	var t;

	loop :
	while (clickTarget.parentNode)
	{
		for (t in this.calendars)
		{
			if (clickTarget == this.calendars[t].obj)
			{
				closeCals = false;
				break loop;
			}
		}
		clickTarget = clickTarget.parentNode;
	}
	
	if (closeCals)
	{
		//this.closeall();
	}
};

cp_calendar_collection.closeall = function()
{
	for (var p in this.calendars)
	{
		if (this.calendars[p].toggle)
		{
			this.calendars[p].obj.style.visibility = 'hidden';
		}
		this.calendars[p].toggle = true;
	}
};

cp_calendar_collection.windowReset = function()
{
	if (!this.windowResetIsSet)
	{
		window.onresize = function() { cp_calendar_collection.closeall(); };
		document.onclick = function(e) { cp_calendar_collection.clickCheck(e); };
		this.windowResetIsSet = true;
	}
};





/* ------------------------------- */

function alterHeader(basePath)
{

	var headID = document.getElementsByTagName("head")[0];         
	var cssNode = document.createElement('link');
	cssNode.type = 'text/css';
	cssNode.rel = 'stylesheet';
	cssNode.href = basePath+'/styles/'+f2b_stylesheet;
	cssNode.media = 'screen';
	headID.appendChild(cssNode);
}




function addHandler(element,eventName,handler)
{
	if (element.addEventListener) 
	{
    	element.addEventListener(eventName, handler, false); 
	}
	else if (element.attachEvent) 
	{
    	element.attachEvent('on'+eventName, handler);
	}
}

function getRenderMode()
{
	
    var mode=document.compatMode;
	var m=false;
	if(mode)
	{
        if(mode=='BackCompat')m='quirks';
        else m='standard'
		
	}
	return m;
}

function alterLayout(container,w_id,w_tkn,resultPage)
{
	
	renderMode=getRenderMode()
	if (f2b_widget_style=='thin')
	{
		container.style.height='50px';		
	}
	else
	{
		container.style.height='60px';
	}
	container.style.fontFamily='Arial, Helvetica, sans-serif';
	container.style.paddingLeft='5px';
	container.style.fontSize='12px';
	searchBox=document.createElement('div');
	frm=document.createElement('form');
	frm.method='POST';
	frm.name='f2b_search_form';
	frm.id='f2b_search_form';
	frm.onSubmit='amendStayLength(this.stayLength, f2b_search_cal);return true;';
	
	if (f2b_enable_ga) frm.onSubmit='amendStayLength(this.stayLength, f2b_search_cal);_gaq.push([\'_linkByPost\', this]);return true;';
	
	frm.action=resultPage + '?w_id=' + w_id +'&w_tkn=' + w_tkn;
	if (f2b_widget_openWindow)
	{
		frm.target='_blank';
	}

	//check-in	
	cin=document.createElement('div');
	cin.id='cin';
	cin.style.width='120px';
	cin.style.float='left';
	label=document.createElement('STRONG');
	label.innerHTML='Check In date:';
	cin.appendChild(label);
	
	calBox=document.createElement('DIV');
	calBox.className='cin-box';	
	calBox.style.border='1px solid #aaa';
	calBox.style.padding='2px';
	calBox.style.width='113px';

	div=document.createElement('DIV');
	div.id='f2b-calendar';
	div.style.width='16px';
	div.style.height='15px';
	div.style.float='right';
	div.style.margin='2px 1px 0px 0px'

	calBox.appendChild(div);

	inp=document.createElement('INPUT');
	inp.name='search_stage';
	inp.type='hidden';
	inp.value='dates';
	calBox.appendChild(inp);

	inp=document.createElement('INPUT');
	inp.name='referrer';
	inp.type='hidden';
	inp.value=window.location;
	calBox.appendChild(inp);

	inp=document.createElement('INPUT');
	inp.name='checkIn';
	inp.id='checkIn';
	inp.type='hidden';
	calBox.appendChild(inp);

	inp=document.createElement('INPUT');
	inp.id='checkInDisplay';
	inp.readOnly=true;
	inp.size=11;
	
	inp.type='text';
	inp.style.fontSize='12px';
	inp.style.border='1px solid #5ca3d2';	

	inp.style.lineHeight='normal';
	inp.style.padding='1px';
	inp.style.width='88px';
	inp.style.width=(renderMode=='quirks')?'86px':'88px';

	inp.style.height=(renderMode=='quirks')?'20px':'16px';
	calBox.appendChild(inp);


	cin.appendChild(calBox);
	frm.appendChild(cin);
	//-----


	if (!f2b_widget_blockAvailability)
	{
		//stay length
		stay=document.createElement('DIV');
		stay.id='duration'
		
		box=document.createElement('DIV');
		box.className='duration-box'
		box.style.width='22px';
		box.style.height='22px';		
		box.style.float='left';
		box.style.border='1px solid #aaa';
		box.style.padding='2px';

		inp=document.createElement('INPUT');
		inp.className='stayLength';
		inp.name='stayLength';
		inp.id='stayLength';
		inp.type='text';	
		inp.size=2;
		inp.maxLength=2;
		
		inp.style.width=(renderMode=='quirks')?'21px':'18px';
		inp.style.padding='1px 1px 1px 1px';
		if (  navigator.appName == 'Microsoft Internet Explorer')
		{
			inp.style.margin=(renderMode=='quirks')?'0px':'1px 0px 0px 0px';
								
		}
		else
		{
			inp.style.margin='1px 0px 0px 0px';		
		}
		inp.style.height=(renderMode=='quirks')?'20px':'16px';
		inp.style.lineHeight='normal';
		inp.style.fontSize='12px';
		inp.fontFamily='Arial';
		inp.value='2';
	
		box.appendChild(inp);
		label=document.createElement('div');
		label.className='label';
		
		labelText=document.createElement('STRONG');
		labelText.appendChild(document.createTextNode('Nights:'));
		label.appendChild(labelText);
		
		stay.appendChild(label);
	
	
		box.appendChild(inp);
		stay.appendChild(box);
		frm.appendChild(stay);
	}
	else
	{
		
		inp=document.createElement('INPUT');
		inp.className='stayLength';
		inp.name='stayLength';
		inp.id='stayLength';
		inp.type='hidden';
		inp.value='1';
		frm.appendChild(inp);
		
	}
	//---
	
	srch=document.createElement('INPUT');
	srch.className='searchButton';
	srch.type='submit';	
	srch.value='';
	srch.style.width='94px';
	srch.style.height='28px';

	
	div=document.createElement('div');
	div.className='searchButtonContainer';
	div.style.float='left';
	div.style.width='94px';
	if (f2b_widget_style=='thin')
	{
		div.style.paddingTop='16px';
		div.style.paddingLeft='10px';	
	}
	else
	{
		div.style.clear='both';	
	}
	div.appendChild(srch);
	frm.appendChild(div)	


	searchBox.appendChild(frm);
	container.appendChild(searchBox);
}


function attachListeners()
{
	d=document.getElementById('checkInDisplay');
	addHandler(d,'click',function() {	f2b_search_cal.calOpen()} )

	d=document.getElementById('stayLength');
	addHandler(d,'focus',function() {document.getElementById('stayLength').select()} )
	addHandler(d,'blur',function() {amendStayLength(document.getElementById('stayLength'), f2b_search_cal)} )

	if (f2b_analytics_type=='analytics.js')
	{
		d=document.getElementById('f2b_search_form');
	    addHandler(d,'submit',ftb_decorate_form);
	}
    
}

function ftb_decorate_form(event)
{
  event = event || window.event;                            
  var target = event.target || event.srcElement;

  if (target && target.action) {
    ga('linker:decorate', target);
  }	
}


function drawCalendar()
{
	var container=document.getElementById('f2b-widget');	
	alterLayout(container,w_id,w_tkn,resultPage);
	f2b_search_cal = new calendarPopup('f2b_search_cal', 'f2b-calendar');
	cp_callback(f2b_search_cal.dateString());
	document.getElementById('stayLength').value=f2b_search_cal.period;
	
	
	attachListeners();
}

function f2b_init(resultPage)
{
	alterHeader(basePath);
	drawCalendar();
	if (typeof(window.f2b_oldonload)=='function') window.f2b_oldonload();
}


// ajax callback function for calendar

function cp_callback(date)
{
	var isOpera=(navigator.appName=='Opera');	
	var validDatePat = /^(\d{4})\-(\d{2})\-(\d{2})$/;
	var dateStrPat;	
	var datebits = date.match(validDatePat);

	if (isOpera) dateStrPat = /^\w{3}, (\d{1,2}) (\w{3}) (\d{4})$/i;
	else dateStrPat = dateStrPat = /^\w{3} (\w{3}) (\d{1,2}) (\d{4})$/i;

	if (datebits !== null)
	{
		var y = datebits[1];
		var m = datebits[2] - 1;
		var d = datebits[3];
		var dateObj = new Date(y, m, d);
		datebits = dateObj.toDateString().match(dateStrPat);
		var dateInputObj = document.getElementById('checkInDisplay');
		var dateValueObj = document.getElementById('checkIn');

		if (isOpera) dateInputObj.value = datebits[1] + ' ' + datebits[2] + ' ' + datebits[3];
		else dateInputObj.value = datebits[2] + ' ' + datebits[1] + ' ' + datebits[3];

		dateValueObj.value = date;
		var coDateObj = new Date(y, m, Number(d) + Number(document.getElementById('stayLength').value));
		datebits = coDateObj.toDateString().match(dateStrPat);
		//changeHtmlContent('checkOutDisplay', datebits[2] + ' ' + datebits[1] + ' ' + datebits[3]);
	}
}

function amendStayLength(inputObj, calendarObj)
{
	var l = inputObj.value;
	var validLengthPat = /^[1-9]\d?$/;
	if (!validLengthPat.test(l) || (l>calendarObj.maxStayLength))
	{
		inputObj.value = 1;
	}
	calendarObj.setPeriod(inputObj.value);
	calendarObj.generateSelectedDays();
	cp_callback(calendarObj.dateString());
}


var f2b_search_cal;

/* -----------------------*/
// JavaScript Document

calendar.prototype.maxStayLength=99;
calendar.prototype.weeks=[];
calendar.prototype.getWeek=c_getWeek;
calendar.prototype.getMonth=c_getMonth;
calendar.prototype.setDateDescriptors=c_setDateDescriptors;
calendar.prototype.populateWeeks=c_populateWeeks;
calendar.prototype.addHeader=c_addHeader;
calendar.prototype.addMonthDays=c_addMonthDays;
calendar.prototype.addFooter=c_addFooter;
calendar.prototype.dayStrings=['Monday','Tuesday','Wedneday','Thursay','Friday','Saturday','Sunday'];
calendar.prototype.monthStrings=['January','February','March','April','May','June','July','August','September',
								 'October','November','December'];


function calendar(month,year,selectedDays)
{
	//internally uses js 0-11 range for months
	var date=new Date();
	this.today = {}
	this.today.d = date.getDate();
	this.today.m = date.getMonth(); 
	this.today.y = date.getFullYear(); 
	this.selectedDays=selectedDays;
	this.month = (month!=undefined) ? (month-1) : this.today.m; 
	this.year = (year!=undefined) ? year :  this.today.y;

	this.setDateDescriptors();
	this.isThisMonth = ((this.month==this.today.m) && (this.year==this.today.y));
	if (this.isThisMonth)
	{
		firstOfThisMonth = Date.UTC(this.today.y,this.today.m,1,0, 0, 0, 0 );
		this.monthIsInPast = (firstOfThisMonth > this.firstOfMonth);
	}
	
	this.populateWeeks();
	this.weekPointer = this.weekOfFirst;



}
	

	
	function c_getWeek()
	{
		// week will be array [week num] [day of week] = calendar date (1..31)
		// where day of week [1..7] = [Mon..Sun]
		if (week = this.weeks[this.weekPointer])
		{
			this.weekPointer++;
			return week;
		}
		this.weekPointer = this.weekOfFirst;
		return false;
	}
	
	
	 function c_getMonth(offset)
	{
		// month will be stdClass .m = month, .y = year
		month =  {}
		if (!isNaN(offset))
		{
			ts = Date.UTC(this.year,this.month,1,0,0,0,0);
			today=Date.UTC(this.today.y,this.today.m,1,0,0,0,0);
			if (ts >= today)
			{
				month.y = ts.getFullYear();
				month.m = ts.getMonth();
				return month;
			}
		}
		else if (offset == 'today')
		{
			month.y = Date().getFullYear;
			month.m = Date().getFullMonth;
			return month;
		}
		return false;
	}
	
	
	function c_setDateDescriptors() // only called by constructor
	{
		this.firstOfMonth = Date.UTC(this.year,this.month,1, 0, 0,0,0);
		firstDate=new Date(this.year,this.month,1, 0, 0,0,0,0);
		this.dayOfFirst = firstDate.getDay();
		if (this.dayOfFirst==0) this.dayOfFirst=7; //fix so that day of week corresponds to iso-8601
		
		this.daysInMonth = daysInMonth(this.month,this.year);

		previousMonth=new Date(this.firstOfMonth - 604800000); 	// -1 week from first to avoid daylight savings issues
		this.daysInPrevMonth=daysInMonth(previousMonth.getMonth(),previousMonth.getYear())
		this.weekOfFirst=firstDate.getWeek();
		this.lastOfMonth = Date(this.year,this.month,this.daysInMonth,0, 0, 0,0 );
		
		this.monthString = this.monthStrings[this.month]+' '+this.year;
		
		//this.firstOfMonthStr = date('Y-m-d', this.firstOfMonth);
		//this.lastOfMonthStr = date('Y-m-d', this.lastOfMonth);
		
		return true;
	}
	
	
	
	function c_populateWeeks() // only called by constructor
	{
		this.weeks=[];
		w = this.weekOfFirst;
		wd = this.dayOfFirst;
		if (wd > 1)
		{
			var date = this.daysInPrevMonth;
			for (leadingwd=wd-1; leadingwd; leadingwd--)
			{
				day = {};
				//day.date = date;
				day.date='';
				day.displayClass = 'othermonth';
				if (this.weeks[w]==undefined) this.weeks[w]=[];
				this.weeks[w][leadingwd] = day;
				date--;
			}
		
		}
		for (d=1; d<=this.daysInMonth; d++)
		{
			day = {};
			day.date = d;
			day.displayClass = (this.isThisMonth)
													? ((d < this.today.d) ? 'pastday' : 'day')
													: (this.monthIsInPast ? 'pastday' : 'day');
													
			if (this.selectedDays[this.year+'-'+this.month+'-'+d]) day.displayClass='selectedday';
			
			if (this.weeks[w]==undefined) this.weeks[w]=[];
			this.weeks[w][wd] = day;
			if (wd%7)
			{
				wd++;
			}
			else
			{
				w++;
				wd = 1;
			}
		}
		if (wd > 1)
		{
			d=1;
			while (wd<=7)
			{
				day = {};
				//day.date = d;
				day.date='';
				day.displayClass = 'othermonth';
				this.weeks[w][wd] = day;
				wd++;
				d++;
			}
		}
		return true;
	}
	
	
function c_formatMonth(date)
{
	var month;
	month=(date.getMonth()+1).toString();
	month=(month.length==1)?('0'+month):month;
	return month;
	
}

function c_addLeadingZero(str)
{
	str=''+str;
	return (str.length==1)?'0'+str:str;	
}



function c_addHeader(container)
{
	var today,header;
	calName='f2b_search_cal';
	
	today=new Date();
	thisMonth=new Date(this.year,this.month,1,1,0,0,0,0);

	lastMonthDate=new Date(thisMonth.getFullYear(),(thisMonth.getMonth()-1),1,0,0,0,0);
	nextMonthDate=new Date(thisMonth.getFullYear(),(thisMonth.getMonth()+1),1,0,0,0,0);
	
	if (lastMonthDate.getYear()==today.getYear() && lastMonthDate.getMonth()<today.getMonth())
	{
		lastMonth=false;
	}
	else
	{
		lastMonth=lastMonthDate.getFullYear()+'-'+c_formatMonth(lastMonthDate)+'-01';
	}
	nextMonth=nextMonthDate.getFullYear()+'-'+c_formatMonth(nextMonthDate)+'-01';

	header=document.createElement('div');
	header.className='monthHeader';
	calMonth=this.monthString;

	outerSpan=document.createElement('div');
	outerSpan.style.cssFloat='left';
	outerSpan.style.styleFloat='left';
	outerSpan.style.width='15px';
	outerSpan.style.height='15px';
	if (lastMonth)
	{
		
		innerSpan= document.createElement('DIV');
		innerSpan.className='pseudolink';
		eval('innerSpan.onclick = function() {' + calName + '.showMonth("'+lastMonth+'"); }');
		/*
		img= document.createElement('IMG');
		img.src=basePath+'/images/prev_arrow.gif';
		img.width=10;
		img.height=10;
		innerSpan.appendChild(img);
		*/
		txt=document.createTextNode('<<');
		innerSpan.appendChild(txt);
		outerSpan.appendChild(innerSpan);	
	}
	
	header.appendChild(outerSpan);
	
	if (nextMonth)
	{
		outerSpan= document.createElement('DIV');
		outerSpan.style.cssFloat='right';
		outerSpan.style.styleFloat='right';
		outerSpan.style.width='15px';	
		innerSpan= document.createElement('DIV');
		innerSpan.className='pseudolink';
		eval('innerSpan.onclick = function() {' + calName + '.showMonth("'+nextMonth+'"); }');
		/*
		img= document.createElement('IMG');
		img.src=basePath+'/images/next_arrow.gif';
		img.width=10;
		img.height=10;
		innerSpan.appendChild(img);
*/
		txt=document.createTextNode('>>'); 
		innerSpan.appendChild(txt);
		outerSpan.appendChild(innerSpan);	
		header.appendChild(outerSpan);

	}
	span=document.createElement('div');
	span.className='pseudolink';
	span.id=calName+'_calendarMonth';
	/* onclick="'+calName+'.showMonthDD(this.id, '+y+','+m+')">*/
	span.innerHTML=calMonth;


	
	
	header.appendChild(span);
	
	container.appendChild(header);
	
	weekHeader=document.createElement('DIV');
	weekHeader.className='weekHeader';
	days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
	for (i=0;i<days.length;i++)
	{
		div=document.createElement('DIV');
		div.className='day';
		div.innerHTML=days[i];
		weekHeader.appendChild(div);
	}
	
	container.appendChild(weekHeader);

		
}

function c_addMonthDays(container)
{
	var date;
	while (week=this.getWeek())
	{
		weekDiv=document.createElement('div');
		weekDiv.className='week';

		for (d=1;d<=7;d++)
		{
			date = week[d]!=undefined? week[d] :'&nbsp;';



			className=date.displayClass;
			dayDiv=document.createElement('div');
			dayDiv.className=className;	
			daySpan=document.createElement('span');


			dateArg = (date.date < 10) ? '0'+date.date : date.date;
			dateFmt = this.year + '-' + (c_addLeadingZero(this.month+1)) + '-' + dateArg;
			
			if (date.displayClass == 'day' || date.displayClass=='selectedday')
			{
				daySpan.className='pseudolink'
				eval('daySpan.onclick = function() {' + calName + '.chooseDate("'+dateFmt+'"); }');				
			}
			
            var text = null;
			if (date=='&nbsp;') text=document.createTextNode(' ');
			else text=document.createTextNode(date.date);
			
			daySpan.appendChild(text);
			dayDiv.appendChild(daySpan);
			weekDiv.appendChild(dayDiv);
		}	
		container.appendChild(weekDiv);
	}
}

function c_addFooter(container)
{
	div=document.createElement('div');
	div.className="monthFooter";
	span=document.createElement('span');
	span.innerHTML='close';
	span.className='pseudolink';
	eval('span.onclick = function() {' + calName + '.calOpen(); }');				

	div.appendChild(span);

	container.appendChild(div);
}

function c_displayCalendar(cal,m,y,selectedDays)
{
	var cal,month,cObj;
	cal=document.getElementById(cal);
	while (cal.hasChildNodes())
	{
		cal.removeChild(cal.lastChild);
	}

	month=document.createElement('div');
	month.className='month';


	cObj=new calendar(m,y,selectedDays);
	cObj.addHeader(month,cObj);	
	cObj.addMonthDays(month,cObj);
	cObj.addFooter(month);
	cal.appendChild(month);	
	

	

}



	
	


Date.prototype.getWeek = function (dowOffset) {
/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
var newYear = new Date(this.getFullYear(),0,1);
var day = newYear.getDay() - dowOffset; //the day of week the year begins on
day = (day >= 0 ? day : day + 7);
var daynum = Math.floor((this.getTime() - newYear.getTime() -
(this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
var weeknum;
//if the year starts before the middle of a week
if(day < 4) {
weeknum = Math.floor((daynum+day-1)/7) + 1;
if(weeknum > 52) {
nYear = new Date(this.getFullYear() + 1,0,1);
nday = nYear.getDay() - dowOffset;
nday = nday >= 0 ? nday : nday + 7;
/*if the next year starts before the middle of
the week, it is week #1 of that year*/
weeknum = nday < 4 ? 1 : 53;
}
}
else {
weeknum = Math.floor((daynum+day-1)/7);
}
return weeknum;
};


function daysInMonth(iMonth, iYear)
{
	return 32 - new Date(iYear, iMonth, 32).getDate();
}


// Function found at Simon Willison's weblog - http://simon.incutio.com/

//

function addLoadEvent2()
{
	window.f2b_oldonload=window.onload;
	window.onload=f2b_init;
}

function addLoadEvent(func)
{	
	
	var oldonload = window.onload;
	if (typeof window.onload != 'function'){
    	window.onload = func;
	} else {
		window.onload = function(){
		oldonload();
		func();
		}
	}
}




var w_id=21663;
var w_tkn='4hhkuL8RDdgYowsN9PYQgpO5ppq1TLGqZZMFdQbwZLFKNemSITMr1vNYkhciS'
var resultPage='https://portal.freetobook.com/widget-redir';
var calendarUrl='https://www.freetobook.com/resource/calendarPopupv2/calendar.php';
var basePath='https://www.freetobook.com/affiliates/dynamicWidget';
var defaultCheckIn = 'Jul 10,2018';
var defaultPeriod=1;
var f2b_stylesheet='widget-css.php?w_id=21663&w_tkn=4hhkuL8RDdgYowsN9PYQgpO5ppq1TLGqZZMFdQbwZLFKNemSITMr1vNYkhciS';
var f2b_widget_openWindow=true;
var f2b_widget_blockAvailability=false;
var f2b_widget_style='thin';
var f2b_enable_ga=false;
var f2b_analytics_type='none';
addLoadEvent2('f2b_init');


