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

app.use(`/([a-zA-Z0-9\-]*)?`, function (route: Route) { // DB & SOFTWARE DEFINED ROUTES

    return new Promise(function (resolve, reject) {
        let slug = ((route.getRequest().params[0] && route.getRequest().params[0] !== '/') ? route.getRequest().params[0] : '');
        app.DB().search('kino', 'Page', {"fields.name": "slug", "fields.value": slug}, 100, function (e, r) {
            if (!e && r.length > 0) {
                app.DB().search('kino', 'Site', {
                    "fields.name": "url",
                    "fields.value": route.getRequest().headers['x-forwarded-for'] || ''
                }, 1, function (e2, r2) {
                    if (!e2 && r2.length > 0) {
                        let hit = false;
                        r.forEach(function (page) {
                            let page_ob = new ObjectDocumentSchema(page);
                            let site_ob = new ObjectDocumentSchema(r2[0]);
                            let tasks = [];
                            if (page_ob.getPropertyFast("site") == site_ob["_id"].toString() || (!route.getRequest().headers['x-forwarded-for'] && site_ob.getPropertyFast("url") === '' && route.getRequest().headers.host.indexOf("localhost:") !== -1)) {
                                hit = true;
                                route.enqueueStyle(readFileSync('./theme/Default.css').toString());
                                route.enqueueStyle(readFileSync('./theme/Theme.css').toString());
                                route.enqueueBody(`<article>`);
                                page_ob.blocks.forEach(function (f, index) {
                                    tasks.push(
                                        function () {
                                            return new Promise(function (resolve2) {
                                                if (f.type === 'template') {
                                                    if (f.value.length === 24) {
                                                        app.DB().search('kino', 'Template', {"_id": require("mongoose").Types.ObjectId(f.value)}, 100, function (e3, r3) {
                                                            if (!e3 && r3.length > 0) {
                                                                let ob = new ObjectDocumentSchema(r3[0]);
                                                                route.enqueueBody(ob.getPropertyFast('html'));
                                                                route.enqueueScript(ob.getPropertyFast('javascript'));
                                                                route.enqueueStyle(ob.getPropertyFast('css'));
                                                            }
                                                            resolve2('ace');
                                                        });
                                                    } else {
                                                        resolve2('not attached');
                                                    }
                                                } else {
                                                    f.view().then(function (v) {
                                                        route.enqueueBody(v);
                                                        resolve2();
                                                    });
                                                }
                                            })
                                        }
                                    );
                                });
                                var result = Promise.resolve();
                                tasks.forEach(task => {
                                    result = result.then(() => task());
                                });
                                result.then(function () {
                                    route.enqueueBody(`</article>`);
                                    resolve();
                                });
                            } else {
                                console.log('site didnt match');
                            }
                        });
                        if (!hit) {
                            resolve('nothin to do here');
                        }
                    } else {
                        console.log('no site');
                        resolve('no site');
                    }
                });
            } else {
                console.log('no page');
                resolve();
            }
        });
    });
});

app.register(new Collections());

app.listen(8080);