import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {Route} from "../lib/Route";
import {readFileSync} from "fs";

interface CollectionInterface {
	get();

	find(search: any);

	update(search, ob);

	remove(search)
}

class BlockType {
	public name;
	private type;
	private value;
	private created;

	constructor(documentType?) {

		documentType = documentType || {};
		this.name = documentType.name || 'untitled';
		this.type = documentType.type || '';
		this.value = documentType.value || '';
		this.created = Date.now();

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
}

class DocumentType {
	public _id;
	public name;
	public schema;
	private created;
	public fields;
	public rows;

	constructor(documentType?) {

		documentType = documentType || {};
		this._id = documentType._id || undefined;
		this.name = documentType.name || 'untitled';
		this.fields = documentType.fields || {};
		this.schema = documentType.schema || {};
		this.created = Date.now();

	}

	find(search) {
		return new Promise(function (resolve) {
			resolve([]);
		});
	}
}

export class Collections implements MiddlewareInterface {

	setup(app: Core) {

		const collections: Array<DocumentType> = [
			new DocumentType({"name": "User", fields: [new BlockType({"name": "username", "type": "text"})]}),
			new DocumentType({
				"name": "Site",
				fields: [new BlockType({"name": "title", "type": "text"}), new BlockType({"name": "url", "type": "text"})]
			}),
			new DocumentType({
				"name": "Page",
				fields: [new BlockType({"name": "title", "type": "text"}), new BlockType({"name": "slug", "type": "text"})]
			}),
			new DocumentType({
				"name": "Image",
				fields: [new BlockType({"name": "title", "type": "text"}), new BlockType({"name": "slug", "type": "text"})]
			}),
			new DocumentType({
				"name": "Template",
				fields: [new BlockType({"name": "title", "type": "text"}), new BlockType({
					"name": "css",
					"type": "code"
				}), new BlockType({"name": "javascript", "type": "code"}), new BlockType({"name": "html", "type": "code"})]
			}),
			new DocumentType({
				"name": "Comment",
				fields: [new BlockType({"name": "text", "type": "text"})]
			})
		];

		let documents = [];

		app.use(`/collections/`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				route.enqueueStyle(readFileSync('./theme/Default.css').toString());
				route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
				route.enqueueScript(readFileSync('./controller/Table.js').toString());
				route.enqueueBody(`<h1>Collections</h1><table data-src="/collections/get/"></table>Welcome to collections, if you are reading this there are no available collections for you!`);
				resolve();
			})
		});

		app.use(`/collections/get/`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				let cols = [];
				collections.forEach(function (collection) {


					let ob = Object.assign({}, collection);
					ob.rows = [];

					for (var i = 0; i < 12; i++) {
						let o = Object.assign({}, collection);
						o.fields.forEach(function (f, index) {
							o.fields[index].value = f.name + " " + Math.random();
						});
						ob.rows.push(o);
					}

					cols.push(ob);


				});
				route.getResponse().end(JSON.stringify(cols));
				reject();
			});
		});

		collections.forEach(function (col) {

			app.use(`/collections/get/${col.name}`, function (route: Route) {
				return new Promise(function (resolve, reject) {
					route.getResponse().end(JSON.stringify(col));
					reject();

				});
			});

			app.use(`/collections/${col.name}/?([a-f0-9]{24})?`, function (route: Route) {
				return new Promise(function (resolve, reject) {
					route.enqueueStyle(readFileSync('./theme/Default.css').toString());
					route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
					route.enqueueScript(readFileSync('./controller/Editor.js').toString());
					route.enqueueBody(`<h1><span class="muted">Editing</span> ${col.name}</h1><div class="editor" data-src="/collections/get/${col.name}"></div>`);

					route.enqueueBody(``);

					resolve();
				});
			});
		});

	}

}