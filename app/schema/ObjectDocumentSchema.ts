import {FieldSchema} from "./FieldSchema";
import {TextBlock} from "./TextBlock";
import {CodeBlock} from "./CodeBlock";
import {RelationshipBlock} from "./RelationshipBlock";
import {TemplateBlock} from "./TemplateBlock";
import {MediaBlock} from "./MediaBlock";

export class ObjectDocumentSchema {
	public _id: string;
	public type: string;
	public created: number;
	public fields: Array<FieldSchema>;
	public blocks: Array<FieldSchema>;
	public rows: Array<ObjectDocumentSchema>;

	constructor(incoming?: any) {
		let self = this;
		this._id = incoming._id || undefined;
		this.type = incoming.type || 'document';
		this.fields = incoming.fields || [];
		this.blocks = incoming.blocks || [];
		self.expand(self.fields);
		self.expand(self.blocks);
		this.created = incoming.created || Date.now();
	}

	find(search: any) {
		return new Promise(function (resolve) {
			resolve([]);
		});
	}

	factoryFromFlatObjectAsFields(input: any) {

		let ob = this.factory();
		ob.fields.forEach(function (f: any, i: any) {
			ob.fields[i].value = input[f.name];
		});
		ob.blocks = [];
		return ob;
	}

	expand(e: Array<FieldSchema>) {
		if (!e) {
			return;
		}
		e.forEach(function (field: FieldSchema, index: number) {
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
				case "template":
					schema = TemplateBlock;
					break;
				case "media":
					schema = MediaBlock;
					break;
				default:
					schema = FieldSchema;
					break;
			}
			if (schema) {
				e[index] = (new schema(field));
			} else {
				console.warn(field, 'Unhandled schema / field type');
			}
		});
	}

	getProperty(field: string): Promise<any> {
		let self = this;
		return new Promise(function (resolve, reject) {


			let hit: any = false;
			self.fields.forEach(function (f) {
				if (f["name"] === field) {
					hit = true;
					resolve(f.value);
				}
			});

			if (!hit) {
				console.log('no matching fields for getProperty');
				reject('NO MATCHING FIELDS');
			}
		});
	}

	getPropertyFast(field: string) {
		let hit: any = false;
		let v = '';
		this.fields.forEach(function (f) {
			if (f["name"] === field) {
				hit = true;
				v = f.value;
			}

		});

		return v;
	}

	factory() {
		let ob = Object.assign({}, this);
		ob.created = Date.now();
		return (new ObjectDocumentSchema(ob));
	}
}