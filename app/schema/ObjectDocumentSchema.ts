import {FieldSchema} from "./FieldSchema";
import {TextBlock} from "./TextBlock";

export class ObjectDocumentSchema {
	public _id: string;
	public type: string;
	private created: number;
	public fields: Array<FieldSchema>;
	public rows: Array<ObjectDocumentSchema>;

	constructor(incoming?: any) {
		let self = this;
		this._id = incoming._id || undefined;
		this.type = incoming.type || 'document';
		this.fields = incoming.fields || [];
		this.fields.forEach(function (field, index) {
			let schema:any = null;
			//self.fields[index] = new FieldSchema(field);
				switch (field.type) {
					case "text":
						schema = TextBlock;break;
						default:
						schema = FieldSchema;break;
				}

			if (schema){
				self.fields[index] = new schema(field);
			}
		});
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