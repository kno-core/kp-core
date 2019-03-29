import {BlockSchema} from "./BlockSchema";

export class ObjectDocumentSchema {
	public _id: string;
	public type: string;
	private created: number;
	public fields: Array<BlockSchema>;
	public rows: Array<ObjectDocumentSchema>;

	constructor(incoming?: any) {

		incoming = incoming || {};
		this._id = incoming._id || undefined;
		this.type = incoming.type || 'document';
		this.fields = incoming.fields || [];
		this.created = incoming.created || Date.now();

	}

	find(search: any) {
		return new Promise(function (resolve) {
			resolve([]);
		});
	}

	factory(incoming: any) {
		return new ObjectDocumentSchema(incoming);
	}
}