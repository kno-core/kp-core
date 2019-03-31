import {Layer} from "./layer/Layer";
import {Route} from "./Route";
import {MiddlewareInterface} from "./MiddlewareInterface";
import {StackInterface} from "./layer/StackInterface";
import {ProviderInterface} from "./ProviderInterface";
import {Database} from "./Database";
import {MongoDB} from "./MongoDB";
import {Authenticator} from "./Authenticator";
import {DatabaseInterface} from "./DatabaseInterface";

export class Core implements StackInterface, ProviderInterface {

	stack: Array<Layer>;

	private iam: Authenticator;
	private db: Database;

	constructor() {
		this.stack = [];

		this.db = new Database();

		let mongo_db_stream = new MongoDB('kino', function () {});
		this.db.openDB(mongo_db_stream, 'kino');

		this.iam = new Authenticator(this.db, 'kino');
	}

	public register(middleware: MiddlewareInterface) {
		middleware.setup(this);
	}

	public use(route, fn?): void {
		this.stack.push(new Layer(route, fn));
	}

	public route(route: Route) {

		var url = require('url');
		var url_parts = url.parse(route.getRequest().url, true);

		route.getRequest().query = url_parts.query;
		route.getRequest().url = route.getRequest().url.split("?")[0];

		let chain: Array<Layer> = [];
		this.stack.forEach(function (layer) {

			let match = route.getRequest().url.match(layer.route);

			if (match) {
				console.log(layer.route,match);
                route.getRequest().params = match.slice(1).map(function (slug) {
                    return slug || '/';
                });
				chain.push(layer);
			}

		});

		return new Promise(function (resolve, reject) {
			function process() {
				if (chain.length > 0) {
					let layer: Layer = chain.shift();
					layer.fn(route).then(function () {
						process();
					}).catch(function () {
						console.log(layer);
						route.getResponse().end(`CHAIN FAILED`);
						reject();
					});
				} else {
					resolve();
				}
			}
			process();
		});

	}

	public http_listener(request, response) {
		let self = this;

		let route = new Route();
		route.setRequest(request);
		route.setResponse(response);

		self.route(route).then(function () {
			route.getPayload().then(function (payload) {
				response.end(payload);
			});
		});
	}

	public listen(port: number): void {

		let http = require('http');
		let self = this;
		let server = http.createServer(function (request, response) {
			self.http_listener(request, response);
		});

		server.listen(port, (err) => {
			if (err) {
				return console.log(err)
			}
			console.log(`Core HTTP Server is listening on port ${port}`)
		});
	}

	DB(): DatabaseInterface {
		return this.db;
	}

	IAM(): Authenticator {
		return this.iam;
	}
}

