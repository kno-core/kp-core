export interface RouteInterface {
	script:Array<string>;
	style:Array<string>;
	head:Array<string>;
	body:Array<string>;
	request;
	response;
	enqueueScript(script:string);
	enqueueStyle(style:string);
	enqueueHead(head:string);
	enqueueBody(body:string);
	setResponse(response:any):any;
	getResponse():any;
	setRequest(request:any):any;
	getRequest():any;
}