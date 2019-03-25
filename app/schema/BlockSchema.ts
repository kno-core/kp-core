export class BlockSchema {
	public name;
	private type;
	private value;
	private created;

	constructor(block?) {

		block = block || {};
		this.name = block.name || 'untitled';
		this.type = block.type || '';
		this.value = block.value || '';
		this.created = block.value || Date.now();

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