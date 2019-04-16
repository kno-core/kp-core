import {BlockPropertiesInterface} from "./BlockPropertiesInterface";

export interface BlockInterface extends BlockPropertiesInterface {
    edit(): Promise<string>;
	view(): Promise<string>;
	getValue(): Promise<any>;
	eventHandler(): void;
	getControls():string;
}