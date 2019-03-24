import {LayerInterface} from "./LayerInterface";

export class Layer implements LayerInterface {
	route: string;
	fn: any;

	constructor(route, fn) {
		if (!(route instanceof RegExp)) {
			route = new RegExp("^" + route + "$")
		}
		this.route = route;
		this.fn = fn;
	}
}