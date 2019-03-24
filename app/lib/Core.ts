import {LayerInterface} from "./layer/Layer.interface";
import {Stack} from "./layer/Stack";
import {Route} from "./Route";

export class Core implements LayerInterface {

	private stack: Array<Stack>;

	constructor() {
		this.stack = [];
	}

	public use(route: string, layer: LayerInterface) {
		this.stack.push(new Stack(route, layer));
	}

	public route(route: Route) {

		let chain = [];
		this.stack.forEach(function (stack) {

			let match = route.getRequest().url.match(stack.route);
			if (match) {
				route.getRequest().params = match.slice(1);
				let p: Promise<any> = stack.layer.route(route);
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

