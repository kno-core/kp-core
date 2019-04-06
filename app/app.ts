import {Core} from "./lib/Core";
import {Route} from "./lib/Route";
import {Collections} from "./middleware/Collections";
import {IAM} from "./middleware/IAM";
import {readFileSync} from "fs";
import {URLEncoded} from "./middleware/URLEncoded";
import {Passport} from "./middleware/Passport";
import {CookieSession} from "./middleware/CookieSession";
import {ObjectDocumentSchema} from "./schema/ObjectDocumentSchema";

let app = new Core();

app.register(new CookieSession());
app.register(new URLEncoded());
app.register(new Passport());
app.register(new IAM());


app.use(`/(.*)`, function (route: Route) { // DB & SOFTWARE DEFINED ROUTES
	console.log('what');
	return new Promise(function (resolve, reject) {

		app.DB().search('kino', 'Page', {"fields.name": "slug", "fields.value": route.getRequest().params[0]}, 1, function (e, r) {
			if (!e && r.length > 0) {
				console.log('page', r);

				let page_ob = new ObjectDocumentSchema(r[0]);

				app.DB().search('kino', 'Site', {
					"fields.name": "url",
					"fields.value": route.getRequest().headers['x-forwarded-for'] || ''
				}, 1, function (e2, r2) {

					console.log('site', r2);
					if (!e2 && r2.length > 0) {
						let site_ob = new ObjectDocumentSchema(r2[0]);
						route.enqueueStyle(readFileSync('./theme/Default.css').toString());
						route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
						//console.log(page_ob, site_ob, page_ob["Site"] == site_ob["_id"].toString());
						//console.log('request for', route.getRequest().headers['x-forwarded-for']);

						let tasks = [];

						console.log('SITE SHITE', page_ob.getPropertyFast("site"), site_ob["_id"].toString())

						//if (page_ob.getPropertyFast("site") == site_ob["_id"].toString() || (!route.getRequest().headers['x-forwarded-for'] && site_ob.getPropertyFast("url") === '' && route.getRequest().headers.host.indexOf("localhost:") !== -1)) {

						route.enqueueBody(`<div class="container">`);
						page_ob.fields.forEach(function (f, index) {
							tasks.push(
								function () {
									return new Promise(function (resolve2, reject2) {
										f.view().then(function (v) {
											if (index === 0){
												route.enqueueBody(`<h1>${v}</h1>`);
											}else{
												route.enqueueBody(v);
											}
											//console.log('should be enqueuing', v);
											resolve2();
										});
									})
								}
							);
						});


						var result = Promise.resolve();
						tasks.forEach(task => {
							result = result.then(() => task());
						});
						result.then(function () {
							route.enqueueBody(`</div>`);
							resolve();
						});

						//}

					} else {
						console.log('no sites');
						resolve();
					}

				});


			} else {
				console.log('no page');
				resolve();
			}
		});

	});
});

app.register(new Collections());


app.listen(8080);

app.use('/', function (route: Route) {

	return new Promise(function (resolve, reject) {
		route.enqueueStyle(readFileSync('./theme/Default.css').toString());
		route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
		route.enqueueHead(`<script src="https://unpkg.com/feather-icons"></script>`);
		route.enqueueBody(readFileSync('./template/index.html').toString());
		route.enqueueScript(`feather.replace()`);
		resolve();
	});

});

app.use('/log/', function (route: Route) {
	//console.log(request);
	let response = route.getResponse();
	let request = route.getRequest();

	response.end(`
    <h1>/log</h1>
    <p>${JSON.stringify(request.headers)}</p>
    <p>${JSON.stringify(request.headers.host)}</p>
    <p>${JSON.stringify(request.connection.remoteAddress)}</p>
    <p>${JSON.stringify(request.socket.remoteAddress)}</p>
    `);
});
