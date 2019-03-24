/*
 * Middleware wrapper for body-parser
 */
import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {RouteInterface} from "../lib/RouteInterface";

var bodyParser = require('body-parser');

export class URLEncoded implements MiddlewareInterface {

	setup(app: Core) {


		app.use('/(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				bodyParser.urlencoded({ extended: true })(route.getRequest(),route.getResponse(),resolve);
			});
		});

		app.use('/(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				bodyParser.json()(route.getRequest(),route.getResponse(),resolve);
			});
		});

		// DEBUG ONLY
		app.use('/(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {

				bodyParser.json()(route.getRequest(),route.getResponse(),function(req,res,next){

					if (route.getRequest().body) {
						route.enqueueBody(JSON.stringify(route.getRequest().body));
					}

					resolve();
				});

			});
		});
	}

}