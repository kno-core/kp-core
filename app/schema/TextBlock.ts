import {BlockSchema} from "./BlockSchema";
import {BlockInterface} from "./BlockInterface";

export class TextBlock extends BlockSchema implements BlockInterface{

	private _handler_id:string;

	constructor(block?: any) {
		super(block);
		this._handler_id = (Math.random()*99999999.99999999).toString(16);
	}

	edit(): Promise<string> {
		let self = this;
		return new Promise(function (resolve, reject) {
			self.getValue().then(function (value) {
				resolve(`<label for="${self._handler_id}">${self.name}</label><input name="${self._handler_id}" type="text" value="${value}"/>`);
			});
		});
	}

	view(): Promise<string> {
		let self = this;
		return new Promise(function (resolve, reject) {
			resolve(self.getValue());
		});
	}

	getValue(): Promise<any> {
		let self = this;
		return new Promise(function (resolve, reject) {
			resolve(false);
		});
	}
}