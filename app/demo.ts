import {Core} from "./lib/Core";
import {Route} from "./lib/Route";
import {Collections} from "./middleware/Collections";
import {IAM} from "./middleware/IAM";
import {readFileSync} from "fs";
import {URLEncoded} from "./middleware/URLEncoded";
import {Passport} from "./middleware/Passport";
import {CookieSession} from "./middleware/CookieSession";
import {ObjectDocumentSchema} from "./schema/ObjectDocumentSchema";

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
        route.enqueueBody(readFileSync('./template/index.html').toString());
        route.enqueueScript(`feather.replace()`);
        resolve();
    });

});