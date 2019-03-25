/**
 * StaticDBStream
 * @constructor
 */
class StaticDBStream {

	_cache: any[];

	constructor (databaseName) {
		this._cache = [];
	}

	save (collection, doc, callback) {
		//this._cache[`${collection}:${key}:${pair}`] = doc;
		//callback(false, this._cache[`${collection}:${key}:${pair}`]);
	};
	get (collection, key, pair, callback) {
		callback(false, this._cache[`${collection}:${key}:${pair}`]);
	};
	close (){
		this._cache = [];
		return true;
	}
}

module.exports = StaticDBStream;
