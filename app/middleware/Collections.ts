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
				new FieldSchema({"name": "slug", "type": "text"}),
				new FieldSchema({"name": "site", "type": "relationship"})
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
					reject('NOT AUTHORIZED');
				}
			});
		});
		app.use(`/collections/([a-zA-Z]*)?/?`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				route.enqueueStyle(readFileSync('./theme/Default.css').toString());
				route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
				route.enqueueScript(readFileSync('./controller/Table.js').toString());

				let selected_index = 0;
				let i = 0;
				console.log('PARAM',route.getRequest().params[0]);
				for (let col in self.collections) {
					if (col == route.getRequest().params[0]){
						selected_index = i;
					}
					i++;
				}

				route.enqueueBody(`<header class="container"><h1>Collections</h1>${self.generateMenu()}</header><div class="container"><table data-src="/collections/get/" data-index="${selected_index}"></table></div>`);
				resolve();
			});
		});

		app.use(`/relationships/site/`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				app.DB().search('kino', 'Site', {}, 100, function (e, r) {
					route.getResponse().end(JSON.stringify(r));
					resolve('ace');
				});
			});
		});
		app.use(`/relationships/Template/`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				app.DB().search('kino', 'Template', {}, 100, function (e, r) {
					route.getResponse().end(JSON.stringify(r));
					resolve('ace');
				});
			});
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

				app.use(`/collections/edit/${col.type}/([a-f0-9]{24})?/?`, function (route: Route) {
					return new Promise(function (resolve, reject) {
						route.enqueueStyle(readFileSync('./theme/Default.css').toString());
						route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
						route.enqueueStyle(readFileSync('./external/CodeHighlight.css').toString());
						route.enqueueHead(`<script src="https://unpkg.com/feather-icons"></script>`);
						tsc.compile('./controller/Editor.ts').then(function (compiled) {
							route.enqueueScript(compiled);
							route.enqueueScript(readFileSync('./external/CodeHighlight.js').toString());
							let req = route.getRequest();
							route.enqueueBody(`<header class="container"><h1><span class="muted" style="font-weight:400;">Editing</span> ${col.type}</h1></header><div class="container">${self.generateMenu()}<div class="editor" data-src="/collections/get/${col.type}${req.params[0]!=='/'?("/"+req.params[0]):'/'}"></div></div>`);
							resolve();
						}).catch(function(e){
							console.trace('compile',e);
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

					console.log('THREAD', thread);

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
					reject('not posted');
					console.error(e);
				}
			})
		});

		app.use(`/([a-zA-Z0-9\-]*)?`, function (route: Route) { // DB & SOFTWARE DEFINED ROUTES

			return new Promise(function (resolve, reject) {
				let slug = ((route.getRequest().params[0] && route.getRequest().params[0] !== '/') ? route.getRequest().params[0] : '');
				app.DB().search('kino', 'Page', {"fields.name": "slug", "fields.value": slug}, 100, function (e, r) {
					if (!e && r.length > 0) {
						app.DB().search('kino', 'Site', {
							"fields.name": "url",
							"fields.value": route.getRequest().headers['x-forwarded-for'] || ''
						}, 1, function (e2, r2) {
							if (!e2 && r2.length > 0) {
								let hit = false;
								r.forEach(function (page) {
									let page_ob = new ObjectDocumentSchema(page);
									let site_ob = new ObjectDocumentSchema(r2[0]);
									let tasks = [];
									if (page_ob.getPropertyFast("site") == site_ob["_id"].toString() || (!route.getRequest().headers['x-forwarded-for'] && site_ob.getPropertyFast("url") === '' && route.getRequest().headers.host.indexOf("localhost:") !== -1)) {
										hit = true;
										route.enqueueStyle(readFileSync('./theme/Default.css').toString());
										route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
										route.enqueueBody(`<article>`);
										page_ob.blocks.forEach(function (f, index) {
											tasks.push(
												function () {
													return new Promise(function (resolve2) {
														if (f.type === 'template') {
															if (f.value.length === 24) {
																app.DB().search('kino', 'Template', {"_id": require("mongoose").Types.ObjectId(f.value)}, 100, function (e3, r3) {
																	if (!e3 && r3.length > 0) {
																		let ob = new ObjectDocumentSchema(r3[0]);
																		route.enqueueBody(ob.getPropertyFast('html'));
																		route.enqueueScript(ob.getPropertyFast('javascript'));
																		route.enqueueStyle(ob.getPropertyFast('css'));
																	}
																	resolve2('ace');
																});
															} else {
																resolve2('not attached');
															}
														} else {
															f.view().then(function (v) {
																route.enqueueBody(v);
																resolve2();
															});
														}
													})
												}
											);
										});
										var result = Promise.resolve();
										tasks.forEach(task => {
											result = result.then(() => task());
										});
										result.then(function () {
											route.enqueueBody(`</article>`);
											resolve();
										});
									} else {
										console.log('site didnt match');
									}
								});
								if (!hit) {
									resolve('nothin to do here');
								}
							} else {
								console.log('no site');
								resolve('no site');
							}
						});
					} else {
						console.log('no page');
						resolve();
					}
				});
			});
		});
	}

	generateMenu():string{
		let menu = [];

		for (let prop in this.collections){
			let scheme:ObjectDocumentSchema = this.collections[prop];

			menu.push(`<a href="/collections/${scheme.type}/">${scheme.type}</a>`);
		}

		return `<div class="block">${menu.join(' - ')}</div>`;
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