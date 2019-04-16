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