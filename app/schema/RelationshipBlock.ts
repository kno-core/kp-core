import {FieldSchema} from "./FieldSchema";
import {BlockInterface} from "./BlockInterface";
import {ObjectDocumentSchema} from "./ObjectDocumentSchema";
import {TextBlock} from "./TextBlock";

var isNode = false;
if (typeof process === 'object') {
	if (typeof process.versions === 'object') {
		if (typeof process.versions.node !== 'undefined') {
			isNode = true;
		}
	}
}
if (isNode) {
	let XMLHttpRequest = function () {
		return this;
	};
}


export class RelationshipBlock extends FieldSchema implements BlockInterface {

	private _handler_id: string;
	private _options: any;
	private cached: any;
	private renderFn: any;
	private firstrun:boolean;

	constructor(block?: any) {
		super(block);

		this.cached = [{"_id": 0, fields:[new TextBlock({name:"title",value:"None"})]}];

		let self = this;
		this.firstrun = true;


		if (!isNode) {
			self.renderFn = function () {
				self.edit().then(function (html: string) {
					document.getElementById(`${self._handler_id}outer`).outerHTML = html;
					self.eventHandler();
					console.log('reset me');
				});
			};

		}

		this._handler_id = ((Math.random() * 99999999.99999999) | 0).toString(16);

	}

	config(): any {
		return {
			color: {'type': 'RGB', 'default': "#333"},
			element: {'type': 'element', 'default': "p"}
		}
	}

	view(): Promise<string> {
		let self = this;

		return new Promise(function (resolve, reject) {

			let output = [];

			output.push(`<div class="what settings-apply-container"><p>Relationship: ${self.name}: ` + self.value + `</p></div>`);

			resolve(output.join(''));

		});
	}

	edit(): Promise<string> {
		let self = this;
		return new Promise(function (resolve) {

			let output = [`<div id="${self._handler_id}outer">`];
			let name = '';

			if (self.name.length !== 0) {
				name = `<div class="edit-title">Relationship: ${self.name}</div>`;
			}

			output.push(`<div class="edit block" data-block-index="${self._handler_id}">${name}<div class="clr"></div><div class="edit-window text flex">${(self.name == 'slug') ? `<label>Relationship: ${self.name || '???'}</label>` : ''}`);

			let options: any = [];

			//console.log('CACHED', self.cached);

			let promises:Array<Promise<void>> = [];
			if (!self.firstrun) {
				self.cached.forEach(function (item: ObjectDocumentSchema) {
					console.log(item);
					if (item.fields) {
						promises.push(item.getProperty('title').then(function (title) {
							options.push(`<option value="${item._id || 0}" ${item._id == self.value ? `selected='selected'` : ''}>${title || 'site name'}</option>`);
						}));
					}
				});
			}
			Promise.all(promises).then(function () {

				output.push(`<span class="select-wrapper"><select id="block-edit-${self._handler_id}">${options.join('')}</select></span>`);

				//output.push(`<input type="text" id="block-edit-${this.guid}" placeholder="${this.name || 'text'}" value="${this.value}" /></div></div>`);

				output.push(`</div></div>`);

				output.push(`</div>`);

				resolve(output.join(''));
			});


		});
	}

	eventHandler(): void {
		let self = this;


		function _uu() {
			self.value = (<HTMLInputElement>document.getElementById(`block-edit-${self._handler_id}`)).value;
			console.log("FORMATTING", self);
		}

		(<HTMLInputElement>document.getElementById(`block-edit-${self._handler_id}`)).onchange = _uu;


		if (this.firstrun) {
			//@ts-ignore
			let xhr: any = new XMLHttpRequest();
			xhr.open('GET', `/relationships/${this.name}/`, true);
			xhr.responseType = 'text';
			xhr.onload = function () {
				if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200) {
						self.cached = self.cached.concat(JSON.parse(xhr.responseText));
						self.cached.forEach(function (ob: any, index: number) {
							self.cached[index] = new ObjectDocumentSchema(ob);
						});
						self.renderFn();
					}
				}
			};

			xhr.send(null);
		}

		this.firstrun = false;

	}

	toString() {
		return JSON.stringify({type: this.type, value: this.value});
	}

	getType() {
		return this.type;
	}
}