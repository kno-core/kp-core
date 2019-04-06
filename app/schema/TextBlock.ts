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
				switch (self.type) {
					case "text":
						if (self.name === 'slug' || self.name === 'created' || self.name === 'title' || self.name === 'url') {
							output.push(`<div class="edit block">${self.name}<div class="clr"></div><div class="edit-window text flex">${(self.name == 'slug') ? `<label>${(location?location.host:'website.com')}/&nbsp;</label>` : ''}<input type='text' id="${self._handler_id}" placeholder='text' value="${self.value}"/></div></div>`);
						} else {
							output.push(`<div class="edit block">${self.name}<div class="wysiwyg-controls"><button onmousedown = "" onclick="document.execCommand('bold', false,'');">Bold</button> Y Z P D Q</div><div class="clr"></div><div class="edit-window text flex">${(self.name == 'slug') ? `<label>website.com/&nbsp;</label>` : ''}<div contenteditable="true" class='input' style="width:100%;min-height:3em;" type="text" id="${self._handler_id}" placeholder="You can add some text here, it makes for great conversation." value="${self.value}" >${self.value}</div></div></div>`);
						}
						break;

				}
				//`<div class="block"><label for="${self._handler_id}">${self.name}</label><input id="${self._handler_id}" name="${self._handler_id}" type="text" value="${value}"/></div>`
				resolve(output.join(''));

			});
		});
	}

	view(): Promise<string> {
		let self = this;
		return new Promise(function (resolve, reject) {
			resolve(self.getValue());
		});
	}

	eventHandler() {
		let self = this;

		function _uu () {
			self.value = (<HTMLInputElement>document.getElementById(`${self._handler_id}`)).value|| (<HTMLInputElement>document.getElementById(`${self._handler_id}`)).innerHTML;
		}
		(<HTMLInputElement>document.getElementById(`${self._handler_id}`)).onkeyup = _uu;
		(<HTMLInputElement>document.getElementById(`${self._handler_id}`)).oninput = _uu;
	}

}