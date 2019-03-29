import {BlockInterface} from "./BlockInterface";

export class BlockSchema implements BlockInterface {
	public type: string;
	public name: string;
	public value?: any;
	public created?: number;
	public last_modified?: number;

	constructor(block?: any) {

		block = block || {};
		this.type = block.type || '';
		this.name = block.name || 'untitled';
		this.value = block.value || '';
		this.created = block.created || Date.now();
		this.last_modified = block.last_modified || this.created;

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
}