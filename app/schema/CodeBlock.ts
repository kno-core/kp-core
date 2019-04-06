import {FieldSchema} from "./FieldSchema";
import {BlockInterface} from "./BlockInterface";

export class CodeBlock extends FieldSchema implements BlockInterface {

	private _handler_id: string;
	private _options: any;

	constructor(block?: any) {
		super(block);

	}

	config(): any {
		return {
			color: {'type': 'RGB', 'default': "#333"},
			element: {'type': 'element', 'default': "p"}
		}
	}

	view(): any {
		let self = this;
		return new Promise(function (resolve, reject) {

			let output = [];
			output.push(`<div class="what settings-apply-container"><p>` + self.value + `</p></div>`);
			resolve(output.join(''));
		});

	}

	edit(): Promise<string> {
		this._handler_id = ((Math.random() * 99999999.99999999) | 0).toString(16);
		let self = this;
		return new Promise(function (resolve) {

			let output = [];

			function escapeHtml(unsafe: string): string {
				if (!unsafe || unsafe.length < 1) {
					unsafe = ' ';
				}

				return (unsafe)
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#039;");
			}

			output.push(`
<div class="edit block" data-block-index="${self._handler_id}">
<div class="edit-title">${self.name}</div>
<div class="edit-controls">X Y Z P D Q</div>

<div class="clr"></div>

<div class="edit-window text">
<pre><code contenteditable="true" id="block-edit-${self._handler_id}format" data-language="${self.name || 'javascript'}">${escapeHtml(self.value)}</code></pre>
<pre class="edit-overlay"><code contenteditable="true" id="block-edit-${self._handler_id}" data-language="${self.name || 'javascript'}">${escapeHtml(self.value)}</code></pre>
</div>

</div>`);

			resolve(output.join(''));
		});
	}

	eventHandler(): void {
		let parent = this;
		let codeblock = <HTMLInputElement>document.getElementById(`block-edit-${parent._handler_id}`);
		if (codeblock) {
			(codeblock.onkeyup = function (e) {
				let input = (<HTMLInputElement>document.getElementById(`block-edit-${parent._handler_id}`));
				parent.value = (input).innerText;
				let dest = (<HTMLInputElement>document.getElementById(`block-edit-${parent._handler_id}format`));

				dest.innerText = (input).innerText;
				// @ts-ignore
				window["format"](dest);

			});
		}

	}

	toString() {
		return JSON.stringify({type: this.type, value: this.value});
	}

	getType() {
		return this.type;
	}
}