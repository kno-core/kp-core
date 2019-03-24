import {Layer} from "./Layer";

export interface StackInterface {
	stack:Array<Layer>;
	use(route, fn?):void;
}
