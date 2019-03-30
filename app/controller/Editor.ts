import {TextBlock} from "../schema/TextBlock";
import {BlockInterface} from "../schema/BlockInterface";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";

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
					self.getHTML().then(function (html) {
						self.element.innerHTML = html;
						return self.attachHandlers();
					})
				}
			}
		};

		xhr.send(null);

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
						console.log(block);
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
					let msg_queue = document.getElementById('message-queue');
					if (msg_queue) {
						let el = document.createElement('div');
						//	el.className = "flex";
						if (resp.schema) {
							console.log(resp.schema);
							self.collection = new ObjectDocumentSchema(resp.schema);
							self.getHTML();
						}
						el.innerHTML = `<div class="container"><span onclick="this.parentNode.removeChild(this);"><input type="text" value="${resp.msg}" readonly/></span></div>`;
						msg_queue.appendChild(el);
					}
				}
			}
		};
		let payload: any = {fields: []};
		self.collection.fields.forEach(function (block: any) {
			payload.fields.push(block.serialize());
		});
		/*if (self.blocks) {
			payload["blocks"] = [];
		}
		self.blocks.forEach(function (block: any) {
			payload.blocks.push(block.serialize());
		});*/

		if (self.collection["_id"]) {
			payload["_id"] = self.collection["_id"];
		}
		xmlhttp.send(JSON.stringify(payload));

	}


}

let editors = document.getElementsByClassName('editor');

for (let i = 0; i < editors.length; i++) {
	let editor = editors[i];
	if (editor.getAttribute('data-src')) {
		let t = new Editor(editor);
	}
}