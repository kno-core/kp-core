import {Core} from "./lib/Core";
import {Route} from "./lib/Route";
import {Collections} from "./middleware/Collections";

let app = new Core();

app.register(new Collections());

app.listen(8081);

app.use('/', function(route:Route){

	return new Promise(function (resolve, reject) {
		route.enqueueBody(`Welcome to your home page`);
		resolve();
	});

});
