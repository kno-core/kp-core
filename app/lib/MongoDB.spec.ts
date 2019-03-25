import {expect} from 'chai';
import {MongoDB} from "./MongoDB";
import {Database} from "./Database";

let mongo_db_stream = new MongoDB('kino', function () {
});

const DB = new Database();

describe('MongoDB', () => {

	it('should be created', () => {
		expect(DB).not.equal(undefined);
	});

	it('should fail before initialize on save', function (done) {
		DB.save('kino', 'Thread', {test_obj: "YEAH"}, function (err, response) {
			expect(err).to.equal(true);
			expect(response.length).to.equal(0);
			done();
		});
	});

	it('should return initialize with a MongoClientDBStream', function (done) {
		expect(DB.openDB(mongo_db_stream, 'kino')).to.equal(true);
		done();
	});

	it('should return searched threads', (done) => {

		DB.search('kino', 'Thread', {}, 5, function (err, data) {
			console.log("GOT BACK", err, data);
			if (err !== null || data == null || !data.length) {
				console.error(err, data);
			}
			expect(data.length).equal(0);
			done();
		});

	});

	it('should close', (done) => {
		DB.close('kino');
		console.log('closed?');
		done();
	});

});