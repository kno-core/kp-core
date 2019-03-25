export interface DatabaseStreamInterface {

	get(databaseName:string, collection:string, key, pair, callback);

	save(databaseName:string, collection:string, item, callback);

	search(databaseName:string, collection:string, search, count, callback);

	close(databaseName:string);
}
