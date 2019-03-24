import {Core} from "./lib/Core";
import {Layer} from "./lib/layer/Layer";
import {Route} from "./lib/Route";

let app = new Core();

class Log extends Layer {
	route(route: Route) {
		return new Promise(function (resolve, reject) {
			route.enqueueBody(`home`);
			resolve(`this is my resolve`);
		});
	}
}

let log = new Log();

app.use('/', log);
app.listen(8081);
