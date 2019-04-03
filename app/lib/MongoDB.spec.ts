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

		DB.search('kino', 'Thread', {}, 1, function (err, data) {
			if (err !== null || data == null || !data.length) {
				console.error(err, data);
			}
			expect(err).to.equal(false);
			expect(data.length).to.be.below(2);
			done();
		});

	});

	it('should find or create', (done) => {

		let randParam = Math.floor(Math.random() * 999999.9999999).toString(16);

		DB.findOrCreate('kino', 'Thread', {"param.name": randParam}, {
			param: [{name: "cat", size: 1}, {
				name: randParam,
				size: 2
			}]
		}, function (err, data) {
			if (err !== null || data == null || !data.length) {
				console.error('ERR', err,'DATA', data);
			}

			expect(err).to.equal(false);
			expect(data.length).equal(1);

			DB.search('kino', 'Thread', {"param.name": randParam}, 10, function (err2, data2) {
				if (err2 || data2 == null || !data2.length) {
					console.error(err2, data2);
				}
				expect(err2).to.equal(false);
				expect(data2.length).to.equal(1);
				done();
			});

		});

	});

	it('should close', (done) => {
		DB.close('kino');
		done();
	});

});