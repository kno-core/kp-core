import {Core} from "./lib/Core";
import {Route} from "./lib/Route";
import {Collections} from "./middleware/Collections";
import {IAM} from "./middleware/IAM";
import {existsSync, readFileSync} from "fs";
import {URLEncoded} from "./middleware/URLEncoded";
import {Passport} from "./middleware/Passport";
import {CookieSession} from "./middleware/CookieSession";
import {ObjectDocumentSchema} from "./schema/ObjectDocumentSchema";
import {Analytics} from "./middleware/Analytics";
import {Template} from "./lib/Template";

let app = new Core();
app.DB().use('kino');

app.register(new CookieSession());
app.register(new URLEncoded());
app.register(new Passport());
app.register(new IAM());
app.register(new Analytics());
app.register(new Collections());


let _mimeTypes = {
	'ico': 'image/x-icon',
	'html': 'text/html',
	'js': 'text/javascript',
	'json': 'application/json',
	'css': 'text/css',
	'png': 'image/png',
	'jpg': 'image/jpeg',
	'wav': 'audio/wav',
	'mp3': 'audio/mpeg',
	'avi': 'video/avi',
	'mp4': 'video/mp4',
	'mov': 'video/mov',
	'webm': 'audio/webm',
	'svg': 'image/svg+xml',
	'pdf': 'application/pdf',
	'doc': 'application/msword',
	'eot': 'appliaction/vnd.ms-fontobject',
	'ttf': 'x-font/ttf',
	'gif': 'image/gif'
};


app.use('/([a-zA-Z0-9-/._)]+).(html|css|png|jpg|js|svg|mp3|wav|oft|ttf|gif)', function (route) {

	return new Promise(function(resolve){
		let filename = `./public/central/${route.getRequest().params[0]}.${route.getRequest().params[1]}`;
		if (filename.indexOf('.') === -1) {
		}

		console.log(`F: ${filename}`);
		if (existsSync(filename)) {
			route.getResponse().writeHead(200, {'Content-Type': _mimeTypes[route.getRequest().params[1]]});
			route.getResponse().end(
				(new Template(filename)).apply({}), 'binary'
			);
		}
		resolve();
	});

});

app.listen(8080);