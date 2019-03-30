import {BlockInterface} from "./BlockInterface";
import {BlockPropertiesInterface} from "./BlockPropertiesInterface";

export class FieldSchema implements BlockInterface {
	public type: string;
	public name: string;
	public value?: any;
	public created?: number;
	public last_modified?: number;

	constructor(fieldblock?: any) {

		fieldblock = fieldblock || {};
		this.type = fieldblock.type || '';
		this.name = fieldblock.name || 'Block';
		this.value = fieldblock.value || '';
		this.created = fieldblock.created || Date.now();
		this.last_modified = fieldblock.last_modified || this.created;

	}

	edit(): Promise<string> {
		let self = this;
		return new Promise(function (resolve, reject) {
			resolve('Editing Block');
		});
	}

	view(): Promise<string> {
		let self = this;
		return new Promise(function (resolve, reject) {
			resolve('Viewing Block');
		});
	}

	getValue(): Promise<any> {
		let self = this;
		return new Promise(function (resolve, reject) {
			resolve(self.value);
		});
	}

	serialize() {
		return {
			type: this.type,
			name: this.name,
			value: this.value,
			created: this.created,
			last_modified: this.last_modified
		}
	}
}