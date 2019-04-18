import {Route} from "../lib/Route";
import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {readFileSync} from "fs";
import {Authenticator} from "../lib/Authenticator";

export class IAM implements MiddlewareInterface {

	setup(app: Core) {

		let self = this;

		app.use('/(.+)?', function (route: Route) {

			return new Promise(function (resolve, reject) {
				resolve();
			});

		});

		app.use('/profile/', function (route: Route) {

			return new Promise(function (resolve, reject) {
				if (app.IAM().isAuthenticated(route)) {
					route.enqueueStyle(readFileSync('./theme/Default.css').toString());
					route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
					route.enqueueBody(`<div class="container"><h1>Profile</h1><p>${JSON.stringify(app.IAM().getUser(route))}</p><a href='/logout/'>Logout</a></div>`)
				}else{
					route.enqueueScript(`window.location = '/login/';`);
				}
				resolve();
			});

		});

		app.use('/login/', function (route: Route) {

			return new Promise(function (resolve, reject) {
				route.enqueueStyle(readFileSync('./theme/Default.css').toString());
				route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
				if (app.IAM().isAuthenticated(route)) {
					route.enqueueScript(`window.location = '/profile/';`);
				} else {
					route.enqueueBody(`<div class="container"><h1>Login</h1><p><ul><li><a href="/auth/github/">Login with Github</a></li></ul></p></div>`);
				}
				resolve();
			});

		});

		app.use('/logout/', function (route: Route) {
			return new Promise(function (resolve, reject) {
				route.enqueueScript(`window.location = '/profile/';`);
				route.getRequest().logout();
				resolve();
			});
		});

	}


}