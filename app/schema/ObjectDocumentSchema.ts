import {FieldSchema} from "./FieldSchema";
import {TextBlock} from "./TextBlock";
import {CodeBlock} from "./CodeBlock";
import {RelationshipBlock} from "./RelationshipBlock";

export class ObjectDocumentSchema {
	public _id: string;
	public type: string;
	public created: number;
	public fields: Array<FieldSchema>;
	public rows: Array<ObjectDocumentSchema>;

	constructor(incoming?: any) {
		let self = this;
		this._id = incoming._id || undefined;
		this.type = incoming.type || 'document';
		this.fields = incoming.fields || [];
		this.fields.forEach(function (field, index) {
			let schema: any = null;
			switch (field.type) {
				case "text":
					schema = TextBlock;
					break;
				case "code":
					schema = CodeBlock;
					break;
				case "relationship":
					schema = RelationshipBlock;
					break;
				default:
					schema = FieldSchema;
					break;
			}
			if (schema) {
				self.fields[index] = (new schema(field));
			} else {
				console.warn(field, incoming, 'Unhandled schema / field type');
			}
		});
		this.created = incoming.created || Date.now();
	}

	find(search: any) {
		return new Promise(function (resolve) {
			resolve([]);
		});
	}

	factoryFromFlatObjectAsFields(input: any) {

		let ob = this.factory();
		ob.fields.forEach(function (f, i) {
			ob.fields[i].value = input[f.name];
		});
		return ob;
	}

	getProperty(field:string):Promise<any>{
		let self = this;
		return new Promise(function (resolve, reject) {


			let hit: any = false;
			self.fields.forEach(function (f) {
				console.log(f, "SWISH??", f["name"] === field);
				if (f["name"] === field) {
					hit = true;
					console.log('HITTTTTTTT', f);
					resolve(f.value);
					return f.value;
				}

			});

			if (!hit){
				//return new Promise(function (r) {
				//	reject('NO MATCHING FIELDS')
				//});
			}

		});
	}

	getPropertyFast(field:string){
		let hit: any = false;
		this.fields.forEach(function (f) {
			//console.log(f, "SWISH??", f["name"] === field);
			if (f["name"] === field) {
				hit = true;
				console.log('HITTTTTTTT', f);
				return f.value;
			}

		});

		if (!hit){
			return '';
		}
	}

	factory() {
		let ob = Object.assign({}, this);
		ob.created = Date.now();
		return (new ObjectDocumentSchema(ob));
	}
}