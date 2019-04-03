import {Database} from "./Database";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";
import {RouteInterface} from "./RouteInterface";
import {FieldSchema} from "../schema/FieldSchema";

export class Authenticator {

	private db: Database;
	private db_name: string;

	constructor(DB: Database, db_name: string) {
		this.db = DB;
		this.db_name = db_name;
	}

	public isAuthenticated(route:RouteInterface) {
		//TODO refactor passport and session specific checks
		return (route.getRequest().session && route.getRequest().session.passport && route.getRequest().session.passport.user);
	}

	public getUser(route){
		//TODO refactor passport and session specific checks
		return route.getRequest().session.passport.user||false;
	}

	public findOrCreate(search: any, doc:ObjectDocumentSchema): Promise<ObjectDocumentSchema> {
		let self = this;
		return new Promise(function (resolve, reject) {
			self.db.findOrCreate('kino', 'User', search || {}, doc,function (err, res) {
				console.log('AUTH GOT',err, res);
				resolve(res);
			});
		});
	}

	getRequestGUID(cookie) {
		return Authenticator.generateToken(64);
	}

	isValidCookie() {
		//TODO MAKE COOKIES ASSERTABLE
		return true;
	}

	public hasPermission(request) {
		return true;
	}

	public static generateToken(length: number): string {
		let cry = require('crypto');
		return cry.randomBytes(length).toString('hex');
	}

	public static checkToken(token: string) {
		return token.length === 128 && /^([a-f0-9]{128})$/.test(token);
	}

	getUserSchema(){
		return new ObjectDocumentSchema(
			{
				"type": "User", fields: [
					new FieldSchema({"name": "username", "type": "text"}),
					new FieldSchema({"name": "githubId", "type": "text"})
				]
			})
	}

}
