export interface BlockInterface {
	type: string;
	name: string;
	value?: any;
	created?: number;
	last_modified?: number;

	edit(): Promise<string>;
	view(): Promise<string>;
	getValue(): Promise<any>;
}