import {DatabaseStreamInterface} from "./DatabaseStreamInterface";

export interface DatabaseInterface {

	_databaseInMemory;

	openDB(databaseSource: DatabaseStreamInterface, databaseName: string, cb): boolean;

	get(databaseName: string, collection: string, key, pair, callback);

	save(databaseName: string, collection: string, item, callback);

	remove(databaseName:string, collection:string, search, callback);

	update(databaseName: string, collection: string, search, item, callback);

	search(databaseName: string, collection: string, search, count, callback);

	close(databaseName: string);
}
