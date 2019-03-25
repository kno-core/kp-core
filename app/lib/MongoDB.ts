/**
 * MongoClientDBStream
 * @struct
 */

const MongoClient = require('mongodb').MongoClient;
import {DatabaseStreamInterface} from "./DatabaseStreamInterface";

export class MongoDB implements DatabaseStreamInterface {

	private _databaseName: string;
	private _connected: boolean;
	private _mongoose;
	private _db;
	private _schemas;

	constructor(databaseName, cb) {
		this._databaseName = databaseName;
		this._connected = false;
		this._schemas = {};
		this._db = null;
		let _this = this;

		this.connect();
	}

	connect() {
		let _this = this;
		let databaseName = this._databaseName;
		(async function () {
			_this._mongoose = new MongoClient('mongodb://localhost:27017/' + databaseName);
			try {
				await _this._mongoose.connect();
				_this._db = _this._mongoose.db(_this._databaseName);
				console.log("Connected correctly to server");
				_this._connected = true;
			} catch (err) {
				_this._connected = false;
			}
		})();
	}

	save(collection, doc, callback) {

		let col = this._db.collection(collection);

		(async function () {
			try {
				col.insertOne(doc, callback);
			} catch (err) {
				callback(false, []);
			}
		})();

	}

	update(collection, search, doc, callback) {

		let col = this._db.collection(collection);

		(async function () {
			try {
				col.update(search, doc, callback);
			} catch (err) {
				callback(false, []);
			}
		})();

	}

	search(collection, search, count, callback) {
		let col = this._db.collection(collection);
		col.find(search);
		(async function () {
			try {
				let docs = await col.find(search).limit(count).toArray();
				callback(false, docs);
			} catch (err) {
				callback(true, []);
			}
		})();
	}

	get(collection, key, pair, callback) {
		let _search = {};
		_search[key] = pair;

		let col = this._db.collection(collection);
		col.find(_search);
		(async function () {
			try {
				let docs = await col.find(_search).limit(1).toArray();
				callback(false, docs);
			} catch (err) {
				callback(true, []);
			}
		})();
	}

	remove(collection, search, callback) {
		let col = this._db.collection(collection);
		col.findOneAndDelete(search, function (err, r) {
			callback(err, r)
		});
	}

	close() {
		if (this._connected) {
			this._mongoose.close();
			this._connected = false;
			return true;
		}
		return false;
	}
}
