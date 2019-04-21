/*
 * Middleware wrapper for analytics
 */
import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {RouteInterface} from "../lib/RouteInterface";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";
import {FieldSchema} from "../schema/FieldSchema";
import {Route} from "../lib/Route";
import {readFileSync} from "fs";

let crypto = require('crypto');

export class Analytics implements MiddlewareInterface {

	private app;

	setup(app: Core) {
		let self = this;
		this.app = app;
		app.setAnalytics(self);

		app.DB().define("Event", new ObjectDocumentSchema(
			{
				"type": "Event",
				fields: [
					new FieldSchema({"name": "tag", "type": "text"}),
					new FieldSchema({"name": "url", "type": "text"}),
					new FieldSchema({"name": "host", "type": "text"}),
					new FieldSchema({"name": "forwarded", "type": "text"}),
					new FieldSchema({"name": "session", "type": "text"}),
					new FieldSchema({"name": "object_id", "type": "text"})
				]
			}));


		app.use('/(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				self.submitEvent('request', route);
				resolve();
			});
		});


		app.use('/log/', function (route: Route) {
			return new Promise(function (resolve, reject) {

				let response = route.getResponse();
				let request = route.getRequest();
				response.end(`
    <h1>/log</h1>
    <p>${JSON.stringify(request.headers)}</p>
    <p>${JSON.stringify(request.headers.host)}</p>
    <p>${JSON.stringify(request.connection.remoteAddress)}</p>
    <p>${JSON.stringify(request.socket.remoteAddress)}</p>
    `);
				resolve();
			});
		});

		app.use(`/analytics/([a-zA-Z]*)?/?`, function (route: Route) {
			return new Promise(function (resolve, reject) {
				route.enqueueStyle(readFileSync('./theme/Default.css').toString());
				route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
				route.enqueueScript(readFileSync('./controller/Sparkline.js').toString());

				let selected_index = 0;
				let i = 0;
				console.log('PARAM', route.getRequest().params[0]);
				for (let col in self.app.DB().getCollections()) {
					if (col == route.getRequest().params[0]) {
						selected_index = i;
					}
					i++;
				}

				console.log('what');

				app.DB().search('kino', 'Event', {}, 100000, function (e, r) {

					let sparklines = [];
					let min_time = 9999999999999;
					let max_time = 0;
					let time_step = (1000 * 15); //15 seconds

					let pageviews = [];
					let requests = [];
					let ob = {
						pageviews:0,
						requests: 0,
						goals: 0,
					};

					r.forEach(function (event, i) {
						min_time = Math.min(min_time, event.created);
						max_time = Math.max(max_time, event.created);
						let ev = new ObjectDocumentSchema(event);
						r[i] = ev;

						if (ev.getPropertyFast('tag') === 'request'){
							ob.requests++;
						}

						if (ev.getPropertyFast('tag') === 'pageview'){
							ob.pageviews++;
						}

					});
					//console.log(min_time, max_time);
					for (let i = min_time; i < max_time; i += time_step) {
						let pv = 0;
						let rv = 0;
						r.forEach(function (event) {
							if (event.created > i && event.created < i + time_step) {
								if (event.getPropertyFast('tag') === 'request'){
									rv++
								}

								if (event.getPropertyFast('tag') === 'pageview'){
									pv++;
								}
							}
						});
						pageviews.push(pv);
						requests.push(rv);
					}

					//console.log(pageviews);


					sparklines.push(`Requests:<div class="sparkline">${requests.join(',')}</div>`);
					sparklines.push(`Pageviews:<div class="sparkline">${pageviews.join(',')}</div>`);

					let overview = `<div class="flex"><div class="hero"><h1>Requests</h1>${ob.requests}</div><div class="hero"><h1>Pageviews</h1>${ob.pageviews}</div><div class="hero"><h1>Goals</h1>${ob.goals}</div></div>`;


					route.enqueueBody(`<header class="container"><h1>Analytics</h1>${self.generateMenu()}</header><div class="container">${overview}${sparklines.join('')}</div>`);
					resolve();
				});

			});
		});

		app.use(`/analytics/get/`, function (route: Route) {
			console.log('GETME');
			return new Promise(function (resolve, reject) {
				let cols = [];
				let promises = [];
				for (var col in self.app.DB().getCollections()) {
					if (self.app.DB().getCollections().hasOwnProperty(col)) {
						let collection = Object.assign({}, self.app.DB().getCollections()[col]);
						collection.rows = [];
						console.log(collection.type);
						promises.push(new Promise(function (resolve) {
							app.DB().search('kino', collection.type, {}, 50, function (e, r) {
								collection.rows = collection.rows.concat(r);
								resolve();
							});
						}));
						cols.push(collection);
					}
				}

				Promise.all(promises).then(function () {
					route.getResponse().end(JSON.stringify(cols));
					resolve();
				});
			});
		});


	}

	generateMenu(): string {
		let menu = [];
		let self = this;

		for (let prop in  self.app.DB().getCollections()) {
			let scheme: ObjectDocumentSchema = self.app.DB().getCollections()[prop];

			menu.push(`<a href="/collections/${scheme.type}/">${scheme.type}</a>`);
		}

		return `<div class="block">${menu.join(' - ')}</div>`;
	}

	submitEvent(eventName: string, route: RouteInterface) {

		let self = this;

		let sess = '';
		if (route.getRequest().cookies){
			sess = route.getRequest().cookies['express:sess']||'';
		}
		let event = self.app.DB().getCollections()["Event"].factoryFromFlatObjectAsFields({
			forwarded: route.getRequest().headers['x-forwarded-for'],
			tag: eventName,
			url: route.getRequest().url,
			session: crypto.createHash('sha1').update(sess).digest('hex')
		});
		self.app.DB().save('kino', event.type, event, function (e2, r2) {
		});
	}

}