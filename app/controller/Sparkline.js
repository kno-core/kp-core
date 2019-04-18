/**
 * Javascript Sparklines Library
 * Written By John Resig
 * http://ejohn.org/projects/jspark/
 *
 * This work is tri-licensed under the MPL, GPL, and LGPL:
 * http://www.mozilla.org/MPL/
 *
 *
 * in your CSS you might want to have the rule:
 * .sparkline { display: none }
 * so that non-compatible browsers don't see a huge pile of numbers.
 *
 *
 */

addEvent( window, "load", function() {
	let a = document.getElementsByTagName("*") || document.all;

	for ( let i = 0; i < a.length; i++ )
		if ( has( a[i].className, "sparkline" ) )
			sparkline( a[i] );
} );

function has(s,c) {
	let r = new RegExp("(^| )" + c + "\W*");
	return ( r.test(s) ? true : false );
}

function addEvent( obj, type, fn ) {
	if ( obj.attachEvent ) {
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
		obj.attachEvent( 'on'+type, obj[type+fn] );
	} else
		obj.addEventListener( type, fn, false );
}

function removeEvent( obj, type, fn ) {
	if ( obj.detachEvent ) {
		obj.detachEvent( 'on'+type, obj[type+fn] );
		obj[type+fn] = null;
	} else
		obj.removeEventListener( type, fn, false );
}


function sparkline(o) {
	let p = o.innerHTML.split(',');
	console.log(p);
	while ( o.childNodes.length > 0 )
		o.removeChild( o.firstChild );

	let nw = "auto";
	let nh = "auto";
	if ( window.getComputedStyle ) {
		nw = window.getComputedStyle( o, null ).width;
		nh = window.getComputedStyle( o, null ).height;
	}

	if ( nw !== "auto" ) nw = nw.substr( 0, nw.length - 2 );
	if ( nh !== "auto" ) nh = nh.substr( 0, nh.length - 2 );

	let f = 2;
	let w = ( nw === "auto" || nw === 0 ? p.length * f : nw - 0 );
	let h = ( nh === "auto" || nh === 0 ? "1em" : nh );

	let co = document.createElement("canvas");


	w = o.offsetWidth;
	if ( co.getContext ) o.style.display = 'inline';
	else return false;

	let style=o.getAttribute('data-style')||'';

	if (o.getAttribute('data-height')){
	//	w = (window.innerWidth)/2|0;//-40;
	}else{
	//	w = (window.innerWidth)/4|0;//-40;
	}
	h = parseInt(o.getAttribute('data-height'),10)||15;

	let scale = 2;


	co.style.height = h+'px';
	co.style.width = w+'px';
	co.width = w*scale;
	//co.style.transform='scale()';
	o.appendChild( co );

	h = co.offsetHeight;
	co.height = h*scale;

	let min = 9999;
	let max = -1;

	for ( let i = 0; i < p.length; i++ ) {
		p[i] = parseFloat((p[i] - 0))*10000000;
		if ( p[i] < min ) min = p[i];
		if ( p[i] > max ) max = p[i];
	}


	if ( co.getContext ) {
		let c = co.getContext("2d");
		c.strokeStyle = "#999";
		c.fillStyle = "#f6f6ff";
		c.lineWidth = 4.0;
		c.beginPath();

		c.moveTo( 0, (h - ((0) * h))*scale );

		for ( let i = 0; i < p.length; i++ ) {
			if ( i == 0 )
				c.lineTo( ((w / p.length) * i)*scale, (h - (((p[i] - min) / (max - min)) * h))*scale );
			c.lineTo( ((w / p.length) * i)*scale, (h - (((p[i] - min) / (max - min)) * h))*scale );
		}

		c.lineTo( ((w / p.length) * (p.length-1))*scale, (h - ((0) * h))*scale );

		c.fill();

		c.beginPath();
		for ( let i = 0; i < p.length; i++ ) {
			if ( i == 0 )
				c.moveTo( ((w / p.length) * i)*scale, (h - (((p[i] - min) / (max - min)) * h))*scale );

			if (i==20&&style==='daylines'){
				c.stroke();
				if (p[p.length-1]>p[i]){c.strokeStyle = "green";}else{c.strokeStyle = "black";}
				c.beginPath();
				c.moveTo( ((w / p.length) * i)*scale, (h - (((p[i] - min) / (max - min)) * h))*scale );
			}
			if (style==='zeroline'){
				if (p[p.length-1]>p[0]){c.strokeStyle = "green";}else{c.strokeStyle = "black";}
			}

			c.lineTo( ((w / p.length) * i)*scale, (h - (((p[i] - min) / (max - min)) * h))*scale );
		}
		c.stroke();

		//o.style.display = 'inline';
	}
}