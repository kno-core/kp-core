import {expect} from 'chai';
import {MongoDB} from "./MongoDB";
import {Database} from "./Database";
import {Authenticator} from "./Authenticator";

let mongo_db_stream = new MongoDB('kino', function () {
});

const DB = new Database();
DB.openDB(mongo_db_stream, 'kino');
const auth = new Authenticator(DB, 'kino');

describe('Authenticator', () => {

	it('should be created', () => {
		expect(DB).not.equal(undefined);
		expect(auth).not.equal(undefined);
	});

	//TODO auth test

	it('should close', (done) => {
		DB.close('kino');
		done();
	});

});