import {RouteInterface} from "./RouteInterface";

export class Route implements RouteInterface {

	body: Array<string>;
	head: Array<string>;
	script: Array<string>;
	style: Array<string>;
	request: any;
	response: any;

	constructor() {
		this.body = [];
		this.head = [];
		this.script = [];
		this.style = [];
	}

	enqueueScript(script: string) {
		this.script.push(script);
	}

	enqueueStyle(style: string) {
		this.style.push(style);
	}

	enqueueHead(head: string) {
		this.head.push(head);
	}

	enqueueBody(body: string) {
		this.body.push(body);
	}

	getPayload() {
		let self = this;

		return new Promise(function (resolve, reject) {

			let style = self.style.join(' ');

			let script = self.script.join(' ');

			resolve(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" user-scalable="no"/>
  <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
${self.head.join(' ')}
<style>
${style}
</style>

</head>

<body>${self.body.join(' ')}<script type="text/javascript">${script}</script></body>
</html>`);

		});

	}

	getRequest() {
		return this.request;
	}

	getResponse() {
		return this.response;
	}

	setRequest(request): void {
		this.request = request;
	}

	setResponse(response) {
		this.response = response;
	}

}