import {BlockSchema} from "./BlockSchema";

export class ObjectDocumentSchema {
	public _id;
	public type;
	private created;
	public fields: Array<BlockSchema>;
	public rows;

	constructor(incoming?) {

		incoming = incoming || {};
		this._id = incoming._id || undefined;
		this.type = incoming.type || 'document';
		this.fields = incoming.fields || [];
		this.created = incoming.created || Date.now();

	}

	find(search) {
		return new Promise(function (resolve) {
			resolve([]);
		});
	}

	factory(incoming){
		return new ObjectDocumentSchema(incoming);
	}
}