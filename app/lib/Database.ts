/**
 * Database
 * @constructor
 */
import {DatabaseInterface} from "./DatabaseInterface";
import {DatabaseStreamInterface} from "./DatabaseStreamInterface";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";

export class Database implements DatabaseInterface {

	public _databaseInMemory;
	private collections;

	constructor() {
		//TODO this should not be using an arbitrary array
		this._databaseInMemory = [];
		this.collections = [];
	}

	public openDB(databaseSource: DatabaseStreamInterface, databaseName: string): boolean {
		if (this._databaseInMemory[databaseName]) {
			console.error(`Database '${databaseName}' already initialized.`);
			return false;
		} else {
			this._databaseInMemory[databaseName] = databaseSource;//new databaseSource(databaseName, cb);
			console.error(`Database '${databaseName}' created.`);
		}
		return true;
	}

	public get(databaseName: string, collection: string, key, pair, callback) {

		if (this._databaseInMemory[databaseName]) {
			return this._databaseInMemory[databaseName].get(collection, key, pair, callback);
		} else {
			callback(true, []);
			return false;
		}

	}

	public findOrCreate(databaseName: string, collection: string, search, doc, callback) {
		let self = this;
		if (this._databaseInMemory[databaseName]) {
			this._databaseInMemory[databaseName].search(collection, search, 1, function (err, res) {
				console.log('r0',err,res);
				if (err || res.length === 0) {
					self._databaseInMemory[databaseName].save(collection, doc, function (err2, res2) {
						console.log('r2',err2,res2);
						self._databaseInMemory[databaseName].search(collection, search, 1, function (err3, res3) {
							console.log('r3',err3,res3);
							callback(err3, res3);
						});
					});
				} else {
					callback(err, res);
				}

			});
		} else {
			callback(true, []);
		}
	}

	public save(databaseName: string, collection: string, item, callback) {

		if (this._databaseInMemory[databaseName]) {
			return this._databaseInMemory[databaseName].save(collection, item, callback);
		} else {
			callback(true, []);
			return false;
		}

	}

	public search(databaseName: string, collection: string, search, count, callback) {
		if (this._databaseInMemory[databaseName]) {
			this._databaseInMemory[databaseName].search(collection, search, count, callback);
		} else {
			callback(true, []);
		}
	}

	public update(databaseName: string, collection: string, search, item, callback) {
		if (this._databaseInMemory[databaseName]) {
			this._databaseInMemory[databaseName].update(collection, search, item, callback);
		} else {
			callback(true, []);
		}
	}

	public remove(databaseName: string, collection: string, item, callback) {
		if (this._databaseInMemory[databaseName]) {
			return this._databaseInMemory[databaseName].remove(collection, item, callback);
		} else {
			callback(true, []);
			return false;
		}
	}

	public close(databaseName: string) {
		if (this._databaseInMemory[databaseName]) {
			this._databaseInMemory[databaseName].close();
			this._databaseInMemory[databaseName] = false;
			return true;
		}
		return false;
	}

	use(databaseName: string) {
	}

	define(collection: string, schema: ObjectDocumentSchema) {
		this.collections[collection] = schema;
	}

	getCollections(){
		return this.collections;
	}

}
