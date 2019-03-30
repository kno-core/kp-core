import {FieldSchema} from "./FieldSchema";

export class ObjectDocumentSchema {
	public _id: string;
	public type: string;
	private created: number;
	public fields: Array<FieldSchema>;
	public rows: Array<ObjectDocumentSchema>;

	constructor(incoming?: any) {

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

	factory() {
		console.log('factory me', this.type);
		return new ObjectDocumentSchema(this);
	}
}