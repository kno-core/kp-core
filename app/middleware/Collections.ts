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

		this.define("User", app.IAM().getUserSchema());

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

		app.use(`/collections/?(.*)?`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				if (app.IAM().isAuthenticated(route)) {
					resolve();
				}else{
					route.enqueueScript(`window.location = '/login/';`);
					reject();
				}
			});
		});
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
				let promises = [];
				for (var col in self.collections) {
					if (self.collections.hasOwnProperty(col)) {
						let collection = Object.assign({},self.collections[col]);
						collection.rows = [];

						promises.push(new Promise(function(resolve){
							app.DB().search('kino', collection.type,{},50,function(e,r){
								collection.rows=collection.rows.concat(r);
								resolve();
							});
						}));
						cols.push(collection);
					}
				}

				Promise.all(promises).then(function(){
					route.getResponse().end(JSON.stringify(cols));
					resolve();
				});
			});
		});

		for (var prop in self.collections) {
			if (self.collections.hasOwnProperty(prop)) {
				let col = self.collections[prop];
				app.use(`/collections/get/${col.type}/([a-f0-9]{24})?`, function (route: Route) {
					return new Promise(function (resolve, reject) {
						let req = route.getRequest();
						if (req.params[0] !== '/'){
							app.DB().search('kino', col.type,{"_id": require("mongoose").Types.ObjectId(req.params[0])},50,function(e,r){
								if (e){
								}else{
									route.getResponse().end(JSON.stringify(r[0]));
								}
								resolve();
							});
						}else{
							route.getResponse().end(JSON.stringify(col));
							resolve();
						}
					});
				});

				app.use(`/collections/remove/${col.type}/([a-f0-9]{24})?`, function (route: Route) {
					return new Promise(function (resolve, reject) {
						let req = route.getRequest();
						if (req.params[0] !== '/'){
							app.DB().remove('kino', col.type,{"_id": require("mongoose").Types.ObjectId(req.params[0])},function(e,r){
								if (e){
								}else{
									route.enqueueScript(`window.location = "/collections/";`);
								}
								resolve();
							});
						}else{
							route.getResponse().end(JSON.stringify(col));
							resolve();
						}
					});
				});

				app.use(`/collections/${col.type}/([a-f0-9]{24})?/?`, function (route: Route) {
					return new Promise(function (resolve, reject) {
						route.enqueueStyle(readFileSync('./theme/Default.css').toString());
						route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
						route.enqueueStyle(readFileSync('./external/CodeHighlight.css').toString());
						tsc.compile('./controller/Editor.ts').then(function (compiled) {
							route.enqueueScript(compiled);
							route.enqueueScript(readFileSync('./external/CodeHighlight.js').toString());
							let req = route.getRequest();
							route.enqueueBody(`<div class="container"><h1><span class="muted" style="font-weight:400;">Editing</span> ${col.type}</h1><div class="editor" data-src="/collections/get/${col.type}${req.params[0]!=='/'?("/"+req.params[0]):'/'}"></div></div>`);
							resolve();
						});
					});
				});
			}
		}

		app.use(`/collections/post/`, function (route: Route) {

			let request = route.getRequest();
			let body = [];
			let final = '';

			return new Promise(function (resolve, reject) {

				if (!request.body){
					resolve();
					return;
				}

				try {
					let thread = request.body || {};

					if (thread._id) {
						thread._id = require("mongoose").Types.ObjectId(thread._id);
					}

					app.DB().search('kino', thread.type, {"_id": thread._id}, 2, function (e, r) {
						if (r.length > 0) {
							app.DB().update('kino', thread.type, {"_id": thread._id}, thread, function (e2, r2) {
								route.getResponse().end(JSON.stringify({"msg": "Updated", "schema": thread}));
								resolve('UPDATED');
							});
						} else {
							thread.created = Date.now();
							app.DB().save('kino', thread.type, thread, function (e2, r2) {
								route.getResponse().end(JSON.stringify({"msg": "Saved", "schema": thread}));
								resolve('SAVED');
							});
						}
					});

				} catch (e) {
					console.error(e);
				}
			})
		});
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