import {StackInterface} from "./Stack.interface";
import {LayerInterface} from "./Layer.interface";

export class Stack implements StackInterface {
	route: string;
	layer: LayerInterface;
	constructor(route, layer) {
		if (!(route instanceof RegExp)) {
			route = new RegExp("^" + route + "$")
		}
		this.route = route;
		this.layer = layer;
	}
}