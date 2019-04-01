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
				resolve(`<div class="block"><label for="${self._handler_id}">${self.name}</label><input id="${self._handler_id}" name="${self._handler_id}" type="text" value="${value}"/></div>`);
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

		(<HTMLInputElement>document.getElementById(`${self._handler_id}`)).onkeyup = function () {
			self.value = (<HTMLInputElement>document.getElementById(`${self._handler_id}`)).value;
		}
	}

}