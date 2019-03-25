import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {Route} from "../lib/Route";
import {readFileSync} from "fs";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";
import {BlockSchema} from "../schema/BlockSchema";

interface CollectionInterface {
	get();

	find(search: any);

	update(search, ob);

	remove(search)
}


export class Collections implements MiddlewareInterface {

	setup(app: Core) {
		/*

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
									//o.fields[index].value = f.name + " " + Math.random();
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

					app.use(`/collections/get/${col.type}`, function (route: Route) {
						return new Promise(function (resolve, reject) {
							route.getResponse().end(JSON.stringify(col));
							reject();

						});
					});

					app.use(`/collections/${col.type}/?([a-f0-9]{24})?`, function (route: Route) {
						return new Promise(function (resolve, reject) {
							route.enqueueStyle(readFileSync('./theme/Default.css').toString());
							route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
							route.enqueueScript(readFileSync('./controller/Editor.js').toString());
							route.enqueueBody(`<h1><span class="muted">Editing</span> ${col.type}</h1><div class="editor" data-src="/collections/get/${col.type}"></div>`);

							route.enqueueBody(``);

							resolve();
						});
					});
				});
		*/
	}

}