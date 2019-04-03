import {expect} from 'chai';
import {FieldSchema} from "./FieldSchema";
import {ObjectDocumentSchema} from './ObjectDocumentSchema';


describe('ObjectDocumentSchema', () => {

	let doc = new ObjectDocumentSchema(
		{
			"type": "TestSchema",
			fields: [
				new FieldSchema({"name": "title", "type": "text"}),
				new FieldSchema({"name": "property", "type": "text"})
			]
		});

	it('should be created', () => {
		expect(doc).not.equal(undefined);
		expect(doc.type).to.equal("TestSchema");

	});

	it('should return a blank from factory with no params', function (done) {
		let timeout = 100;

		setTimeout(function () {
			let doc2 = doc.factory();
			expect(doc2.type).to.equal("TestSchema");
			expect(doc2.created).to.be.above((doc.created + timeout) - 1);
			expect(doc2.fields.length).to.equal(2);
			done();

		}, timeout);

	});


	it('should factory a clone of a new object type', function (done) {

		let doc2 = doc.factoryFromFlatObjectAsFields({title: "title0", "property": "prop0"});
		expect(doc2.type).to.equal("TestSchema");
		expect(doc2.fields[0].name).to.equal("title");
		expect(doc2.fields[0].value).to.equal("title0");
		expect(doc2.fields.length).to.equal(2);
		done();

	});


});