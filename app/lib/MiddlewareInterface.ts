import {Core} from "./Core";

export interface MiddlewareInterface {
	setup(app:Core);
}