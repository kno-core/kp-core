import {TextBlock} from "../schema/TextBlock";
import {BlockInterface} from "../schema/BlockInterface";
import {ObjectDocumentSchema} from "../schema/ObjectDocumentSchema";
import {FieldSchema} from "../schema/FieldSchema";
import {CodeBlock} from "../schema/CodeBlock";
import {TemplateBlock} from "../schema/TemplateBlock";
import {MediaBlock} from "../schema/MediaBlock";

class Editor {

	private element: Element;
	private rows: Array<any>;
	private collection: any;
	private _collection: number;

	constructor(element?: Element) {
		let self = this;
		this.element = element;
		this.rows = [];
		this.collection = [];
		this._collection = 0;

		var xhr = new XMLHttpRequest();
		xhr.open('GET', this.element.getAttribute('data-src'), true);
		xhr.responseType = 'text';
		xhr.onload = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 200) {
					self.collection = new ObjectDocumentSchema(JSON.parse(xhr.responseText));
					console.log('col', self.collection);
					self.render();
				}
			}
		};
		xhr.send(null);
	}



	render() {
		let self = this;
		self.getHTML().then(function (html) {
			self.element.innerHTML = html;

			return self.attachHandlers().then(function () {
				//@ts-ignore
				window['feather'].replace();
			});

		}).catch(function (e) {
			console.error('rejected', e);
		});
	}

	attachHandlers(): Promise<any> {
		let self = this;
		return new Promise(function (resolve, reject) {

			let controls = document.getElementById('editor-controls');
			controls.innerHTML = '';

			let save_btn = document.createElement('button');
			save_btn.innerText = "Save";
			save_btn.className = "primary";
			save_btn.onclick = function () {
				self.save();
			};
			controls.appendChild(save_btn);
			//self.element.appendChild(controls);

			function moveUp(index: number) {
				let v = self.collection.blocks[index];
				self.collection.blocks[index] = self.collection.blocks[index - 1];
				self.collection.blocks[index - 1] = v;
				self.render()
			}

			function moveDown(index: number) {
				let v = self.collection.blocks[index];
				self.collection.blocks[index] = self.collection.blocks[index + 1];
				self.collection.blocks[index + 1] = v;
				self.render()
			}

			function removeBlock(index: number) {
				self.collection.blocks.splice(index, 1);
				self.render()
			}

			function selectionHover(){

			}

			let b = document.getElementsByClassName('edit-controls');
			if (b) {
				for (let i = 0; i < b.length; i++) {
					let el: any = b[i];
					let block = self.collection.blocks[i];

					let mid = Math.floor(Math.random() * 100000000);

					let str = '';


					if (i > 0) {
						str += `<button id="${mid}-up"><i data-feather="arrow-up"></i></button>`;
					}

					if (i < b.length - 1) {
						str += `<button id="${mid}-down"><i data-feather="arrow-down"></i></button>`;
					}


					str += `<button id="${mid}-remove" class="danger last"><i data-feather="delete"></i></button>`;


					str += block.getControls();


					el.innerHTML = str;

					let up = document.getElementById(`${mid}-up`);
					if (up) {
						up.onclick = function () {
							moveUp(i);
							self.render();
						}
					}

					let down = document.getElementById(`${mid}-down`);
					if (down) {
						down.onclick = function () {
							moveDown(i);
							self.render();
						}
					}

					let remove = document.getElementById(`${mid}-remove`);
					if (remove) {
						remove.onclick = function () {
							removeBlock(i);
							self.render();
						}
					}

				}
			}

			self.collection.fields.forEach(function (field: BlockInterface) {
				field.eventHandler();
			});
			self.collection.blocks.forEach(function (field: BlockInterface) {
				field.eventHandler();
			});


			b = document.getElementsByClassName('create');
			if (b) {
				for (let i = 0; i < b.length; i++) {
					let el: any = b[i];
					el.onclick = function () {
						switch (el.getAttribute('data-type')) {

							case "text":
								self.collection.blocks.push(new TextBlock({"type": 'text', "value": ""}));
								break;
							//case "image":
							//	self.collection.blocks.push(new ImageBlock({"type": 'image', "value": ""}));
							//	break;
							case "html":
								self.collection.blocks.push(new CodeBlock({"type": 'code', "value": "", "name": "html"}));
								break;
							case "media":
								self.collection.blocks.push(new MediaBlock({"type": 'media', "value": "", "name": ""}));
								break;
							case "template":
								self.collection.blocks.push(new TemplateBlock({"type": 'template', "value": "", "name": "Template"}, self.render));
								break;

						}
						self.render();

					};
				}
			}


			resolve();
		});
	}

	getHTML(): Promise<string> {
		let self = this;
		let chain: Array<FieldSchema> = this.collection.fields.slice(0, this.collection.fields.length);
		chain = chain.concat(this.collection.blocks.slice(0, this.collection.blocks.length));
		let html: Array<string> = [];
		html.push("<div class='edit block'><div id='editor-controls'></div></div>");

		let locked_fields_length = -this.collection.fields.length;

		return new Promise(function (resolve, reject) {
			function process() {
				if (chain.length > 0) {
					let block: BlockInterface = chain.shift();

					block.edit().then(function (dat: string) {
						let controls = '';
						if (locked_fields_length >= 0) {
							controls = `<div class='edit-controls flex-row'></div>`;
						}
						html.push(`<div class="contain">${controls}${dat}</div>`);
						locked_fields_length++;
						process();
					}).catch(function () {
						html.push(`block failed ${JSON.stringify(block)}`);
						reject('block failed');
					});
				} else {

					html.push(`<div style="text-align: center;">Add...<button class="primary create" data-type="text">Add Text</button> <button class="primary create" data-type="poll">Add Poll</button> <button class="primary create" data-type="media">Add Media</button> <button class="primary create" data-type="html">Add HTML</button> <button class="primary create" data-type="template">Add Template</button></div>`);
					resolve(html.join(''));

				}
			}

			process();
		});
	}

	save(): any {
		let self = this;
		var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
		var theUrl = "/collections/post/";
		xmlhttp.open("POST", theUrl);
		xmlhttp.withCredentials = true;
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.responseType = 'text';

		xmlhttp.onload = function (e) {
			console.log(e);
			if (xmlhttp.readyState === xmlhttp.DONE) {
				if (xmlhttp.status === 200) {
					let resp = JSON.parse((xmlhttp.responseText));
					if (resp.schema) {
						self.collection = new ObjectDocumentSchema(resp.schema);
						console.log('got', self.collection);
						self.render();
					}
					let msg_queue = document.getElementById('message-queue');
					if (msg_queue) {
						let el = document.createElement('div');
						el.innerHTML = `<div class="container"><span onclick="this.parentNode.removeChild(this);"><input type="text" value="${resp.msg}" readonly/></span></div>`;
						msg_queue.appendChild(el);
					}
				}
			}
		};
		let payload  =JSON.stringify(self.collection);
		console.log('SENDING ',self.collection, payload);
		xmlhttp.send(payload);
	}

}


let editors = document.getElementsByClassName('editor');

for (let i = 0; i < editors.length; i++) {
	let editor = editors[i];
	if (editor.getAttribute('data-src')) {
		let t = new Editor(editor);
	}
}

eval(`
function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}
window["nextNode"] = nextNode;

function getRangeSelectedNodes(range, includePartiallySelectedContainers) {
    var node = range.startContainer;
    var endNode = range.endContainer;
    var rangeNodes = [];

    // Special case for a range that is contained within a single node
    if (node == endNode) {
        rangeNodes = [node];
    } else {
        // Iterate nodes until we hit the end container
        while (node && node != endNode) {
            rangeNodes.push( node = nextNode(node) );
        }
    
        // Add partially selected nodes at the start of the range
        node = range.startContainer;
        while (node && node != range.commonAncestorContainer) {
            rangeNodes.unshift(node);
            node = node.parentNode;
        }
    }

    // Add ancestors of the range container, if required
    if (includePartiallySelectedContainers) {
        node = range.commonAncestorContainer;
        while (node) {
            rangeNodes.push(node);
            node = node.parentNode;
        }
    }

    return rangeNodes;
}
window["getRangeSelectedNodes"] = getRangeSelectedNodes;

function getSelectedNodes() {
    var nodes = [];
    if (window.getSelection) {
        var sel = window.getSelection();
        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
            nodes.push.apply(nodes, getRangeSelectedNodes(sel.getRangeAt(i), true));
        }
    }
    return nodes;
}
window["getSelectedNodes"] = getSelectedNodes;

function replaceWithOwnChildren(el) {
    var parent = el.parentNode;
    while (el.hasChildNodes()) {
        parent.insertBefore(el.firstChild, el);
    }
    parent.removeChild(el);
}
window["replaceWithOwnChildren"] = replaceWithOwnChildren;

function removeSelectedElements(tagNames) {
    var tagNamesArray = tagNames.toLowerCase().split(",");
    getSelectedNodes().forEach(function(node) {
        if (node.nodeType == 1 &&
                tagNamesArray.indexOf(node.tagName.toLowerCase()) > -1) {
            // Remove the node and replace it with its children
            replaceWithOwnChildren(node);
        }
    });
}
window["removeSelectedElements"] = removeSelectedElements;
                
`);