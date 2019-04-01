/**
 * Database
 * @constructor
 */
import {DatabaseInterface} from "./DatabaseInterface";
import {DatabaseStreamInterface} from "./DatabaseStreamInterface";

export class Database implements DatabaseInterface {

	public _databaseInMemory;

	constructor() {
		//TODO this should not be using an arbitrary array
		this._databaseInMemory = [];
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

	public findOrCreate(databaseName: string, collection: string, search, callback) {
		let self = this;
		if (this._databaseInMemory[databaseName]) {
			this._databaseInMemory[databaseName].search(collection, search, 1, function (err, res) {
				console.log("find or create SEARCH RESULT",err, res, search);
				if (!err || !res || res.length === 0) {
					self._databaseInMemory[databaseName].save(collection, search, function(err2, res2){
						self._databaseInMemory[databaseName].search(collection, search, 1, callback);
					});
				}else{
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


}
