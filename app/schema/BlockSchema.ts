export class BlockSchema {
	public name:string;
	private type:string;
	private value;
	private created:number;
	private last_modified: number;

	constructor(block?) {

		block = block || {};
		this.name = block.name || 'untitled';
		this.type = block.type || '';
		this.value = block.value || '';
		this.created = block.created || Date.now();
		this.last_modified = block.last_modified || this.created;

	}

	edit(): Promise<any> {
		return new Promise(function (resolve, reject) {
			resolve('Editing Block');
		});
	}

	view(): Promise<any> {
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