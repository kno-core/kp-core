import {LayerInterface} from "./Layer.interface";
import {Route} from "../Route";

export class Layer implements LayerInterface {
	route(route: Route) {}
	use(route, fn?) {}
}