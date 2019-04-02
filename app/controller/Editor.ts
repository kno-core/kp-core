import {TextBlock} from "../schema/TextBlock";
import {BlockInterface} from "../schema/BlockInterface";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";
import {FieldSchema} from "../schema/FieldSchema";

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
					self.render();
				}
			}
		};

		xhr.send(null);

	}

	render() {
		let self = this;
		self.getHTML().then(function (html) {
			self.element.innerHTML = html;
			return self.attachHandlers();
		})
	}

	attachHandlers(): Promise<any> {
		let self = this;
		return new Promise(function (resolve, reject) {

			let controls = document.createElement('div');

			let save_btn = document.createElement('button');
			save_btn.className = 'primary';
			save_btn.innerText = "Save";
			save_btn.onclick = function () {
				self.save();
			};
			controls.appendChild(save_btn);
			self.element.appendChild(controls);

			self.collection.fields.forEach(function (field: any) {
				field.eventHandler();
			});

			resolve();
		});
	}

	getHTML(): Promise<string> {
		let self = this;
		let chain = this.collection.fields.slice(0, this.collection.fields.length);
		let html: Array<string> = [];
		return new Promise(function (resolve, reject) {
			function process() {
				if (chain.length > 0) {
					let block: BlockInterface = chain.shift();
					block.edit().then(function (dat: string) {
						html.push(dat);
						process();
					}).catch(function () {
						html.push(`block failed ${JSON.stringify(block)}`);
						reject();
					});
				} else {

					resolve(html.join(''));
					//	self.attachHandlers().then(function (controls) {
					//		resolve(html.join('') + controls);
					//	});

				}
			}

			process();
		});
	}

	save(): any {
		let self = this;
		var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
		var theUrl = "../post/";
		xmlhttp.open("POST", theUrl);
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.responseType = 'text';
		xmlhttp.onload = function () {
			if (xmlhttp.readyState === xmlhttp.DONE) {
				if (xmlhttp.status === 200) {
					let resp = JSON.parse((xmlhttp.responseText));
					if (resp.schema) {
						self.collection = new ObjectDocumentSchema(resp.schema);
						self.render();
					}
					let msg_queue = document.getElementById('message-queue');
					if (msg_queue) {
						let el = document.createElement('div');
						el.innerHTML = `<div class="container"><span onclick="this.parentNode.removeChild(this);"><input type="text" value="${resp.msg}" readonly/></span></div>`;
						msg_queue.appendChild(el);
					}
				}
			}
		};
		xmlhttp.send(JSON.stringify(self.collection));
	}


}

let editors = document.getElementsByClassName('editor');

for (let i = 0; i < editors.length; i++) {
	let editor = editors[i];
	if (editor.getAttribute('data-src')) {
		let t = new Editor(editor);
	}
}