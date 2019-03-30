import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {Route} from "../lib/Route";
import {readFileSync} from "fs";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";
import {FieldSchema} from "../schema/FieldSchema";
import {TypescriptCompiler} from "../lib/TypescriptCompiler";

const tsc = new TypescriptCompiler();


interface CollectionInterface {

	define(collection: string, schema: ObjectDocumentSchema);

	find(collection: string, search: any): Promise<Array<ObjectDocumentSchema>>;

	update(collection: string, search, ob);

	remove(collection: string, search)
}

export class Collections implements MiddlewareInterface, CollectionInterface {

	private collections;

	setup(app: Core) {

		let self = this;
		this.collections = {};

		this.define("User", new ObjectDocumentSchema(
			{
				"type": "User", fields: [
					new FieldSchema({"name": "username", "type": "text"})
				]
			}));

		this.define("Site", new ObjectDocumentSchema(
			{
				"type": "Site",
				fields: [
					new FieldSchema({"name": "title", "type": "text"}),
					new FieldSchema({"name": "url", "type": "text"})
				]
			}));

		this.define("Page", new ObjectDocumentSchema({
			"type": "Page",
			fields: [
				new FieldSchema({"name": "title", "type": "text"}),
				new FieldSchema({"name": "slug", "type": "text"})
			]
		}));

		this.define("Image", new ObjectDocumentSchema({
			"type": "Image",
			fields: [
				new FieldSchema({"name": "title", "type": "text"}),
				new FieldSchema({"name": "slug", "type": "text"})
			]
		}));

		this.define("Template", new ObjectDocumentSchema({
			"type": "Template",
			fields: [
				new FieldSchema({"name": "title", "type": "text"}),
				new FieldSchema({"name": "css", "type": "code"}),
				new FieldSchema({"name": "javascript", "type": "code"}),
				new FieldSchema({"name": "html", "type": "code"})
			]
		}));

		this.define("Comment", new ObjectDocumentSchema({
			"type": "Comment",
			fields: [
				new FieldSchema({"name": "text", "type": "text"})
			]
		}));

		app.use(`/collections/`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				route.enqueueStyle(readFileSync('./theme/Default.css').toString());
				route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
				route.enqueueScript(readFileSync('./controller/Table.js').toString());
				route.enqueueBody(`<div class="container"><h1>Collections</h1><table data-src="/collections/get/"></table></div>`);
				resolve();
			})
		});

		app.use(`/collections/get/`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				let cols = [];
				for (var col in self.collections) {
					if (self.collections.hasOwnProperty(col)) {
						cols.push(self.collections[col]);
					}
				}
				route.getResponse().end(JSON.stringify(cols));
				resolve();
			});
		});

		for (var prop in self.collections) {
			if (self.collections.hasOwnProperty(prop)) {
				let col = self.collections[prop];
				app.use(`/collections/get/${col.type}`, function (route: Route) {
					return new Promise(function (resolve, reject) {
						route.getResponse().end(JSON.stringify(col));
						resolve();

					});
				});

				app.use(`/collections/${col.type}/?([a-f0-9]{24})?`, function (route: Route) {
					return new Promise(function (resolve, reject) {
						route.enqueueStyle(readFileSync('./theme/Default.css').toString());
						route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
						//route.enqueueScript(readFileSync('./controller/Editor.js').toString());
						tsc.compile('./controller/Editor.ts').then(function (compiled) {
							route.enqueueScript(compiled);
							route.enqueueBody(`<div class="container"><h1><span class="muted" style="font-weight:400;">Editing</span> ${col.type}</h1><div class="editor" data-src="/collections/get/${col.type}"></div></div>`);
							resolve();
						});
					});
				});
			}
		}
	}

	define(collection: string, schema: ObjectDocumentSchema) {
		this.collections[collection] = schema;
	}

	find(collection: string, search: any): Promise<Array<ObjectDocumentSchema>> {
		return new Promise(function (resolve, reject) {
			resolve([]);
		});
	}

	remove(collection: string, search): Boolean {
		return false;
	}

	update(collection: string, search, ob) {
	}

}