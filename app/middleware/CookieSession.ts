/*
 * Middleware wrapper for cookie-session
 */
import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {RouteInterface} from "../lib/RouteInterface";

export class CookieSession implements MiddlewareInterface {

	setup(app: Core) {

		let cookieSession = require('cookie-session');

		app.use('/(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				cookieSession({keys: ['secret1', 'secret2']})(route.getRequest(), route.getResponse(), resolve);
			});
		});
	}

}