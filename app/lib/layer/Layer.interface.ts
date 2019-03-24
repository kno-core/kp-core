import {Route} from "../Route";

export interface LayerInterface {
	route(route:Route):Promise<any>;
	use(route, fn?);
}