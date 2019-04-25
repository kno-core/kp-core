import {FieldSchema} from "./FieldSchema";
import {BlockInterface} from "./BlockInterface";

export class TextBlock extends FieldSchema implements BlockInterface {

	private _handler_id: string;

	constructor(block?: any) {
		super(block);
	}

	edit(): Promise<string> {
		this._handler_id = ((Math.random() * 99999999.99999999) | 0).toString(16);
		let self = this;
		return new Promise(function (resolve, reject) {
			self.getValue().then(function (value) {
				let output = [];
				//let controls = [];
				output.push(`<div class="edit block">`);
				switch (self.type) {
					case "text":
						if (self.name === 'slug' || self.name === 'created' || self.name === 'title' || self.name === 'url') {
							output.push(`<label>${self.name}</label><div class="edit-window text flex"><small>${(self.name == 'slug') ? `${(location ? location.host : 'website.com')}/&nbsp;` : ''}</small><input type='text' id="${self._handler_id}" placeholder='text' value="${self.value}"/></div>`);
						} else {
							output.push(`<div class="edit-window text">${(self.name == 'slug') ? `<label>website.com/&nbsp;</label>` : ''}<div contenteditable="true" class='input' style="width:100%;min-height:3em;" type="text" id="${self._handler_id}" placeholder="You can add some text here, it makes for great conversation." >${self.value}</div></div>`);
						}
						break;
				}
				output.push(`</div>`);
				//`<div class="block"><label for="${self._handler_id}">${self.name}</label><input id="${self._handler_id}" name="${self._handler_id}" type="text" value="${value}"/></div>`
				resolve(output.join(''));

			});
		});
	}

	getControls() {
		let self = this;
		return (`
    <button class="bold" onmousedown="" onclick="document.execCommand('bold', false,'');"><i data-feather="bold"></i></button>
    <button onmousedown="" onclick="document.execCommand('italic', false,'');"><i data-feather="italic"></i></button>
    <button onmousedown="" onclick="document.execCommand('underline', false,'');"><i data-feather="underline"></i></button>



	<!--<button onmousedown="" id="controls-caption-${self._handler_id}">Caption</button>-->
	
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<h1>');">H1</button>
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<h2>');">H2</button>
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<h3>');">H3</button>
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<p>');">P</button>
    <button onmousedown="" onclick="document.execCommand('insertUnorderedList', false,'');"><i data-feather="list"></i></button>
    
    <button onmousedown=""  onclick="document.execCommand('justifyLeft', false,'');"><i data-feather="align-left"></i></button>
    <button onmousedown=""  onclick="document.execCommand('justifyCenter', false,'');"><i data-feather="align-center"></i></button>
    <button onmousedown=""  onclick="document.execCommand('justifyRight', false,'');"><i data-feather="align-right"></i></button>
    
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<blockquote>');">quote</button>
    <button onmousedown="" onclick="document.execCommand('removeFormat', false,'');removeSelectedElements('h1,h2,h3,h4,h5,h6,blockquote,span,li,ul,a');">clear formatting</button>

    <button onmousedown="" onclick="window['editor-link']()"><i data-feather="link"></i></button> 


<!--
    <button onmousedown=""  onclick="document.execCommand('', false,'');"><i data-feather="paperclip"></i></button>
    <button onmousedown=""  onclick="document.execCommand('createLink', true, url);"><i data-feather="link"></i></button> 
    <button onmousedown=""><i data-feather="maximize"></i></button>
    -->
				<div class="secondary-controls flex" style="auto" id="secondary-controls-${self._handler_id}">`);
	}

	view(): Promise<string> {
		let self = this;
		return new Promise(function (resolve, reject) {
			resolve(self.getValue());
		});
	}

	getSelected() {
		if (window.getSelection) {
			return window.getSelection().toString();
		} else if (document.getSelection) {
			return document.getSelection().toString();
		} else {
			//@ts-ignore
			var sel: any = document['selection'];
			//@ts-ignore
			var selection: any = sel && sel.createRange();
			if (selection.text) {
				return selection.text
			}
			return false;
		}
	}

	eventHandler() {
		let self = this;

		let el = (<HTMLInputElement>document.getElementById(`${self._handler_id}`));

		function _uu() {
			let v = el.value || el.innerHTML;
			console.log('before', v);
			while (v.indexOf("<p></p>") !== -1) {
				v = v.replace("<p></p>", "");
			}
			while (v.indexOf("<p><br></p>") !== -1) {
				v = v.replace("<p><br></p>", "");
			}
			while (v.indexOf("&nbsp;<br></p>") !== -1) {
				v = v.replace("&nbsp;<br></p>", "</p>");
			}
			while (v.indexOf("<br></p>") !== -1) {
				v = v.replace("<br></p>", "</p>");
			}
			console.log('after', v);
			self.value = v;
		}

		el.onkeyup = _uu;
		el.oninput = _uu;
		el.onchange = _uu;


		//@ts-ignore
		let sel: any = document.selection;

		function saveSelection() {
			if (window.getSelection) {
				var sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
					return sel.getRangeAt(0);
				}
			}
			return null;
		}

/*
		var commands:any = {state: {}, exec: {}, value: {}};
//Add your costum command
		function addCommand(command:any, callback:any, scope:any) {
			command = command.toLowerCase();
			commands.exec[command] = function(args:any) {
				return callback.apply(scope , args);
			};
		}

//Exec the command
		function  execCommand( ){
			var args:any = [];
			Array.prototype.push.apply( args, arguments );
			var customCommand:any = args.shift().toLowerCase();
			var func:any;
			if ((func = commands.exec[customCommand])) {
				func(args);
				return true;
			}
		}

//Exemple add insertfigure command
		//@ts-ignore
		addCommand('insertfigure',function( src:any ,caption:any){
// IE <= 10
			//@ts-ignore
			if (document.selection){
				//@ts-ignore
				var range:any = document.selection.createRange();
				range.pasteHTML('<figure> <img src= "' + src + '" /  <figcaption>'
					+ caption + '</figcaption> </figure>');

// IE 11 && Firefox, Opera .....
			}else if(document.getSelection) {
				var range:any = window.getSelection().getRangeAt(0);
				var figure:any = document.createElement("figure");
				range.surroundContents(figure);
				figure.innerHTML = '<img src= "' + src + '" /><figcaption>'
					+ caption + '</figcaption>';
			}
		});

		let controls_format_caption:any = document.getElementById('controls-caption-'+self._handler_id);
		controls_format_caption.onclick=function(){
			//@ts-ignore
			execCommand('insertfigure','http://example.org/image.jpg','your_caption')
		};

*/

		function restoreSelection(range:any) {
			if (range) {
				if (window.getSelection) {
					var sel:any = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}


		let secondary_controls:any = document.getElementById(`secondary-controls-${self._handler_id}`);
		let seld: any;
		let selected:any;
		//@ts-ignore
		window['insert-link'] = function () {
			//let selected: any = self.getSelected();

			//if (selected) {
				let href: any = (<HTMLInputElement>document.getElementById(`link-add-${self._handler_id}`)).value;
				restoreSelection(seld);
				document.execCommand("insertHTML", false, "<a href='" + href + "' target='_blank'>" + selected + "</a>");

			//} else {

			//}

			secondary_controls.innerHTML = "";
			secondary_controls.style.width="auto";
		};
		//@ts-ignore
		window['editor-link'] = function () {
			selected = self.getSelected();
			if (selected) {
			//	console.log('YOU HAVE SELECTED', selected);
				secondary_controls.innerHTML = `<input type='text' placeholder='link address' id="link-add-${self._handler_id}" ><button class='primary' onclick='window["insert-link"]();'>add</button>`;
			} else {
				secondary_controls.innerHTML = "<small>Please select some text first</small>";
			}
			secondary_controls.style.width="80%";
		}

		el.onmousemove = function () {
			let selected = self.getSelected();
			if (selected) {
				seld = saveSelection();
				console.log('YOU HAVE SELECTED', selected);
				//updateTooltip();
			}
		}
		/*
				function updateTooltip(){
					let tooltip:any = document.getElementById('editor-tooltip');
					if(!tooltip){
						tooltip = document.createElement('div');   // make bo
						tooltip.id = 'editor-tooltip';
					}
					var selection:any = window.getSelection(),      // get the selection then
						range:any = selection.getRangeAt(0),        // the range at first selection group
						rect:any = range.getBoundingClientRect(); // and convert this to useful data
					tooltip.style.border = '2px solid black';      // with outline
					tooltip.style.position = 'fixed';              // fixed positioning = easy mode
					tooltip.style.top = rect.top-rect.height + 'px';       // set coordinates
					tooltip.style.left = rect.left + 'px';
					tooltip.style.height = rect.height + 'px'; // and size
					tooltip.style.width = rect.width + 'px';
					document.body.appendChild(tooltip);            // finally append
				}


		*/

	}

	getValue(): Promise<string> {
		let self = this;
		console.log('hey', self.value);
		return new Promise(function (resolve, reject) {
			resolve(`<div class="container">${self.value}</div>`);
		});
	}

}