import {FieldSchema} from "./FieldSchema";
import {BlockInterface} from "./BlockInterface";

export class TextBlock extends FieldSchema implements BlockInterface {

    private _handler_id: string;

    constructor(block?: any) {
        super(block);
    }

    edit(): Promise<string> {
        this._handler_id = ((Math.random() * 99999999.99999999) | 0).toString(16);
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getValue().then(function (value) {
                let output = [];
                let controls = [];
                //@ts-ignore
                controls.push(`<div class="text-controls">
    <button onmousedown="" onclick="document.execCommand('bold', false,'');"><i data-feather="bold"></i></button>
    <button onmousedown="" onclick="document.execCommand('italic', false,'');"><i data-feather="italic"></i></button>
    <button onmousedown="" onclick="document.execCommand('underline', false,'');"><i data-feather="underline"></i></button>

    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<h1>');">H1</button>
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<h2>');">H2</button>
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<h3>');">H3</button>
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<p>');">P</button>
    <button onmousedown=""  onclick="document.execCommand('insertUnorderedList', false,'');"><i data-feather="list"></i></button>
    
    <button onmousedown=""  onclick="document.execCommand('justifyLeft', false,'');"><i data-feather="align-left"></i></button>
    <button onmousedown=""  onclick="document.execCommand('justifyCenter', false,'');"><i data-feather="align-center"></i></button>
    <button onmousedown=""  onclick="document.execCommand('justifyRight', false,'');"><i data-feather="align-right"></i></button>
    
    <button onmousedown="" onclick="document.execCommand('formatBlock', false,'<blockquote>');">quote</button>
    <button onmousedown="" onclick="document.execCommand('removeFormat', false,'');removeSelectedElements('h1,h2,h3,h4,h5,h6,blockquote,span');">clear formatting</button>
<!--
    <button onmousedown=""  onclick="document.execCommand('', false,'');"><i data-feather="paperclip"></i></button>
    <button onmousedown=""  onclick="document.execCommand('createLink', true, url);"><i data-feather="link"></i></button> 
    <button onmousedown=""><i data-feather="maximize"></i></button>
    -->

</div>
				`);

                console.log(controls);

                switch (self.type) {
                    case "text":
                        if (self.name === 'slug' || self.name === 'created' || self.name === 'title' || self.name === 'url') {
                            output.push(`<div class="edit block">${self.name}<div class="clr"></div><div class="edit-window text flex">${(self.name == 'slug') ? `<label>${(location ? location.host : 'website.com')}/&nbsp;</label>` : ''}<input type='text' id="${self._handler_id}" placeholder='text' value="${self.value}"/></div></div>`);
                        } else {
                            output.push(`<div class="edit block">${self.name}<div class="wysiwyg-controls">${controls.join('')}</div><div class="clr"></div><div class="edit-window text flex">${(self.name == 'slug') ? `<label>website.com/&nbsp;</label>` : ''}<div contenteditable="true" class='input' style="width:100%;min-height:3em;" type="text" id="${self._handler_id}" placeholder="You can add some text here, it makes for great conversation." value="${self.value}" >${self.value}</div></div></div>`);
                        }
                        break;

                }
                //`<div class="block"><label for="${self._handler_id}">${self.name}</label><input id="${self._handler_id}" name="${self._handler_id}" type="text" value="${value}"/></div>`
                resolve(output.join(''));

            });
        });
    }

    view(): Promise<string> {
        let self = this;
        return new Promise(function (resolve, reject) {
            resolve(self.getValue());
        });
    }

    eventHandler() {
        let self = this;

        let el = (<HTMLInputElement>document.getElementById(`${self._handler_id}`));

        function _uu() {
            let v = el.value || el.innerHTML;
            console.log('before', v);
            while (v.indexOf("<p></p>") !== -1) {
                v = v.replace("<p></p>", "");
            }
            while (v.indexOf("<p><br></p>") !== -1) {
                v = v.replace("<p><br></p>", "");
            }
            while (v.indexOf("&nbsp;<br></p>") !== -1) {
                v = v.replace("&nbsp;<br></p>", "</p>");
            }
            while (v.indexOf("<br></p>") !== -1) {
                v = v.replace("<br></p>", "</p>");
            }
            console.log('after', v);
            self.value = v;
        }

        el.onkeyup = _uu;
        el.oninput = _uu;
        el.onchange = _uu;
    }

}