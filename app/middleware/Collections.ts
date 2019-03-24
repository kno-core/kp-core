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
	private fields;

	constructor(documentType?) {

		documentType = documentType || {};
		this.name = documentType.name || 'untitled';
		this.fields = documentType.fields || {};
		this.schema = documentType.schema || {};
		this.created = Date.now();

	}
}

export class Collections implements MiddlewareInterface {

	setup(app: Core) {

		const collections: Array<DocumentType> = [
			new DocumentType({"name": "User", fields: [new BlockType({"name":"username","type":"text"})]})
		];

		app.use(`/collections/`, function(route:Route){
			return new Promise(function (resolve, reject) {
				route.enqueueScript(readFileSync('./controller/Table.js').toString());
				route.enqueueBody(`<table data-src="/collections/get/User"></table>Welcome to collections, if you are reading this there are no available collections for you!`);
				resolve();
			})
		});

		collections.forEach(function(col){
			app.use(`/collections/get/${col.name}`, function(route:Route){
				return new Promise(function (resolve, reject) {
					//route.enqueueBody(JSON.stringify(collections));
					route.getResponse().end(JSON.stringify(collections));
					reject();
				})
			});
		});

	}

}