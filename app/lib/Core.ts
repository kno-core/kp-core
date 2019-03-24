import {Layer} from "./layer/Layer";
import {Route} from "./Route";
import {MiddlewareInterface} from "./MiddlewareInterface";
import {StackInterface} from "./layer/StackInterface";

export class Core implements StackInterface {

	stack: Array<Layer>;

	constructor() {
		this.stack = [];
	}

	public register(middleware: MiddlewareInterface) {
		middleware.setup(this);
	}

	public use(route, fn?): void {
		this.stack.push(new Layer(route, fn));
	}

	public route(route: Route) {

		let chain = [];
		this.stack.forEach(function (layer) {

			let match = route.getRequest().url.match(layer.route);
			if (match) {
				route.getRequest().params = match.slice(1);
				console.log(layer);
				let p: Promise<any> = layer.fn(route);
				chain.push(p);
			}
		});

		return Promise.all(chain).then(function () {
			// Chain has been complete
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
}

