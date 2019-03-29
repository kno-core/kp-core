import {Core} from "./lib/Core";
import {Route} from "./lib/Route";
import {Collections} from "./middleware/Collections";
import {IAM} from "./middleware/IAM";
import {readFileSync} from "fs";
import {URLEncoded} from "./middleware/URLEncoded";
import {Passport} from "./middleware/Passport";
import {CookieSession} from "./middleware/CookieSession";

let app = new Core();

app.register(new CookieSession());
app.register(new URLEncoded());
app.register(new Passport());
app.register(new IAM());
app.register(new Collections());

app.listen(8080);

app.use('/', function (route: Route) {

	return new Promise(function (resolve, reject) {
		route.enqueueStyle(readFileSync('./theme/Default.css').toString());
		route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
		route.enqueueHead(`<script src="https://unpkg.com/feather-icons"></script>`);
		route.enqueueBody(`<div class="hero bg-primary"><div class="container"><i data-feather="coffee"></i><h1>k ( kp-core )</h1><p>20 minutes and a drink of coffee;</p></div></div><div class="container"><h2>Welcome Home</h2><ul><li>Multi site</li><li>multi template</li><li>multi page</li><li>multi user</li><li>multi group</li><li>multi product</li></ul><br /><p>One place.</p></div>`);
		route.enqueueScript(`feather.replace()`);
		resolve();
	});

});
