import {BlockSchema} from "./BlockSchema";

export class ObjectDocumentSchema {
	public _id;
	public type;
	//public schema;
	private created;
	public fields: Array<BlockSchema>;
	public rows;

	constructor(documentType?) {

		documentType = documentType || {};
		this._id = documentType._id || undefined;
		this.type = documentType.type || 'document';
		this.fields = documentType.fields || [];
		//this.schema = documentType.schema || {};
		this.created = documentType.created || Date.now();

	}

	find(search) {
		return new Promise(function (resolve) {
			resolve([]);
		});
	}
}