import {Core} from "./lib/Core";
import {Route} from "./lib/Route";
import {Collections} from "./middleware/Collections";
import {IAM} from "./middleware/IAM";
import {readFileSync} from "fs";
import {URLEncoded} from "./middleware/URLEncoded";

let app = new Core();


app.register(new URLEncoded());

app.register(new IAM());

app.register(new Collections());

app.listen(8081);

app.use('/', function(route:Route){

	return new Promise(function (resolve, reject) {
		route.enqueueStyle(readFileSync('./theme/Default.css').toString());
		route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
		route.enqueueBody(`<h1>Welcome Home</h1><p>Multi site, multi template, multi page, multi user, multi group, multi product;<br />One place.</p>`);
		resolve();
	});

});
