import {DatabaseInterface} from "./DatabaseInterface";
import {Authenticator} from "./Authenticator";

export interface ProviderInterface {
	DB():DatabaseInterface;
	IAM():Authenticator;
}
