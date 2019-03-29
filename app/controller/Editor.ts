import {TextBlock} from "../schema/TextBlock";
import {BlockInterface} from "../schema/BlockInterface";

class Editor {

	private element: Element;
	private rows: Array<any>;
	private collection: any;
	private _collection: number;

	constructor(element: Element) {
		let self = this;
		this.element = element;

		this.rows = [];
		this.collection = [];
		this._collection = 0;

		var xhr = new XMLHttpRequest();
		xhr.open('GET', this.element.getAttribute('data-src'), true);
		xhr.responseType = 'text';
		xhr.onload = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 200) {
					self.collection = (JSON.parse(xhr.responseText));
					self.collection.fields.forEach(function (field: any, index: number) {
						self.collection.fields[index] = new TextBlock(field);
					});
					console.log(self.collection);
					self.render().then(function (html) {
						self.element.innerHTML = html;
					});
				}
			}
		};

		xhr.send(null);

	}

	render(): Promise<string> {
		let self = this;
		let chain = this.collection.fields.slice(0, this.collection.fields.length);
		let html: Array<string> = [];
		return new Promise(function (resolve, reject) {
			function process() {
				if (chain.length > 0) {
					let block: BlockInterface = chain.shift();
					block.edit().then(function (dat:string) {
						html.push(dat);
						process();
					}).catch(function () {
						console.log(block);
						html.push(`block failed ${JSON.stringify(block)}`);
						reject();
					});
				} else {
					resolve(html.join(''));
				}
			}

			process();
		});
	}


}

let editors = document.getElementsByClassName('editor');

for (let i = 0; i < editors.length; i++) {
	let editor = editors[i];
	if (editor.getAttribute('data-src')) {
		let t = new Editor(editor);
	}
}