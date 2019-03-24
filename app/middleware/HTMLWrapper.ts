import {Route} from "../lib/Route";
import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";

export class HTMLWrapper implements MiddlewareInterface {

	setup(app: Core) {

		app.use('/', function (route: Route) {

			return new Promise(function (resolve, reject) {
				route.enqueueBody(`HTML WEAPPER`);

				resolve();
			});

		});

	}

}