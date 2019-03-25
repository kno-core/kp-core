import {Database} from "./Database";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";
import {RouteInterface} from "./RouteInterface";


export class Authenticator {

	private db: Database;
	private db_name: string;

	constructor(DB: Database, db_name: string) {
		this.db = DB;
		this.db_name = db_name;
	}

	public isAuthenticated(route:RouteInterface) {
		return (!!route.getRequest().session.passport.user);
	}

	public getUser(route){
		return route.getRequest().session.passport.user||false;
	}

	public findOrCreate(search: any): Promise<ObjectDocumentSchema> {
		let self = this;
		return new Promise(function (resolve, reject) {
			self.db.findOrCreate('kino', 'User', search || {}, function (err, res) {
				console.log('FIND OR CREATE 0', err, res);
				resolve(res);
			})
		});
	}

	getRequestGUID(cookie) {

		/*
		let cookies = Authenticator.parseCookies(cookie);
		console.log('COOKIES', cookies);
		if (cookies['kpid']) { //TODO check is valid cookie
			return Authenticator.checkToken(cookies['kpid']) ? cookies['kpid'] : Token.generateToken(64);
		}*/
		return Authenticator.generateToken(64);

	}

	isValidCookie() {
		//TO MAKE COOKIES ASSERTABLE
		return true;
	}

	public hasPermission(request) {
		return true;
	}

	getForm() {
		return "FORM";
	}

	public static generateToken(length: number): string {
		let cry = require('crypto');
		return cry.randomBytes(length).toString('hex');
	}

	public static checkToken(token: string) {
		return token.length === 128 && /^([a-f0-9]{128})$/.test(token);
	}

}
