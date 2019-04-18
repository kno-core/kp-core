"use strict";
exports.__esModule = true;
var TextBlock_1 = require("../schema/TextBlock");
var ObjectDocumentSchema_1 = require("../schema/ObjectDocumentSchema");
var CodeBlock_1 = require("../schema/CodeBlock");
var TemplateBlock_1 = require("../schema/TemplateBlock");
var MediaBlock_1 = require("../schema/MediaBlock");
var Editor = (function () {
    function Editor(element) {
        var self = this;
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
                    self.collection = new ObjectDocumentSchema_1.ObjectDocumentSchema(JSON.parse(xhr.responseText));
                    console.log('col', self.collection);
                    self.render();
                }
            }
        };
        xhr.send(null);
    }
    Editor.prototype.render = function () {
        var self = this;
        self.getHTML().then(function (html) {
            self.element.innerHTML = html;
            return self.attachHandlers().then(function () {
                window['feather'].replace();
            });
        })["catch"](function (e) {
            console.error('rejected', e);
        });
    };
    Editor.prototype.attachHandlers = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            var controls = document.getElementById('editor-controls');
            controls.innerHTML = '';
            var save_btn = document.createElement('button');
            save_btn.innerText = "Save";
            save_btn.className = "primary";
            save_btn.onclick = function () {
                self.save();
            };
            controls.appendChild(save_btn);
            function moveUp(index) {
                var v = self.collection.blocks[index];
                self.collection.blocks[index] = self.collection.blocks[index - 1];
                self.collection.blocks[index - 1] = v;
                self.render();
            }
            function moveDown(index) {
                var v = self.collection.blocks[index];
                self.collection.blocks[index] = self.collection.blocks[index + 1];
                self.collection.blocks[index + 1] = v;
                self.render();
            }
            function removeBlock(index) {
                self.collection.blocks.splice(index, 1);
                self.render();
            }
            function selectionHover() {
            }
            var b = document.getElementsByClassName('edit-controls');
            if (b) {
                var _loop_1 = function (i) {
                    var el = b[i];
                    var block = self.collection.blocks[i];
                    var mid = Math.floor(Math.random() * 100000000);
                    var str = '';
                    if (i > 0) {
                        str += "<button id=\"" + mid + "-up\"><i data-feather=\"arrow-up\"></i></button>";
                    }
                    if (i < b.length - 1) {
                        str += "<button id=\"" + mid + "-down\"><i data-feather=\"arrow-down\"></i></button>";
                    }
                    str += "<button id=\"" + mid + "-remove\" class=\"danger last\"><i data-feather=\"delete\"></i></button>";
                    str += block.getControls();
                    el.innerHTML = str;
                    var up = document.getElementById(mid + "-up");
                    if (up) {
                        up.onclick = function () {
                            moveUp(i);
                            self.render();
                        };
                    }
                    var down = document.getElementById(mid + "-down");
                    if (down) {
                        down.onclick = function () {
                            moveDown(i);
                            self.render();
                        };
                    }
                    var remove = document.getElementById(mid + "-remove");
                    if (remove) {
                        remove.onclick = function () {
                            removeBlock(i);
                            self.render();
                        };
                    }
                };
                for (var i = 0; i < b.length; i++) {
                    _loop_1(i);
                }
            }
            self.collection.fields.forEach(function (field) {
                field.eventHandler();
            });
            self.collection.blocks.forEach(function (field) {
                field.eventHandler();
            });
            b = document.getElementsByClassName('create');
            if (b) {
                var _loop_2 = function (i) {
                    var el = b[i];
                    el.onclick = function () {
                        switch (el.getAttribute('data-type')) {
                            case "text":
                                self.collection.blocks.push(new TextBlock_1.TextBlock({ "type": 'text', "value": "" }));
                                break;
                            case "html":
                                self.collection.blocks.push(new CodeBlock_1.CodeBlock({ "type": 'code', "value": "", "name": "html" }));
                                break;
                            case "media":
                                self.collection.blocks.push(new MediaBlock_1.MediaBlock({ "type": 'media', "value": "", "name": "" }));
                                break;
                            case "template":
                                self.collection.blocks.push(new TemplateBlock_1.TemplateBlock({ "type": 'template', "value": "", "name": "Template" }, self.render));
                                break;
                        }
                        self.render();
                    };
                };
                for (var i = 0; i < b.length; i++) {
                    _loop_2(i);
                }
            }
            resolve();
        });
    };
    Editor.prototype.getHTML = function () {
        var self = this;
        var chain = this.collection.fields.slice(0, this.collection.fields.length);
        chain = chain.concat(this.collection.blocks.slice(0, this.collection.blocks.length));
        var html = [];
        html.push("<div class='edit block'><div id='editor-controls'></div></div>");
        var locked_fields_length = -this.collection.fields.length;
        return new Promise(function (resolve, reject) {
            function process() {
                if (chain.length > 0) {
                    var block_1 = chain.shift();
                    block_1.edit().then(function (dat) {
                        var controls = '';
                        if (locked_fields_length >= 0) {
                            controls = "<div class='edit-controls flex-row'></div>";
                        }
                        html.push("<div class=\"contain\">" + controls + dat + "</div>");
                        locked_fields_length++;
                        process();
                    })["catch"](function () {
                        html.push("block failed " + JSON.stringify(block_1));
                        reject('block failed');
                    });
                }
                else {
                    html.push("<div style=\"text-align: center;\">Add...<button class=\"primary create\" data-type=\"text\">Add Text</button> <button class=\"primary create\" data-type=\"poll\">Add Poll</button> <button class=\"primary create\" data-type=\"media\">Add Media</button> <button class=\"primary create\" data-type=\"html\">Add HTML</button> <button class=\"primary create\" data-type=\"template\">Add Template</button></div>");
                    resolve(html.join(''));
                }
            }
            process();
        });
    };
    Editor.prototype.save = function () {
        var self = this;
        var xmlhttp = new XMLHttpRequest();
        var theUrl = "/collections/post/";
        xmlhttp.open("POST", theUrl);
        xmlhttp.withCredentials = true;
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.responseType = 'text';
        xmlhttp.onload = function (e) {
            console.log(e);
            if (xmlhttp.readyState === xmlhttp.DONE) {
                if (xmlhttp.status === 200) {
                    var resp = JSON.parse((xmlhttp.responseText));
                    if (resp.schema) {
                        self.collection = new ObjectDocumentSchema_1.ObjectDocumentSchema(resp.schema);
                        console.log('got', self.collection);
                        self.render();
                    }
                    var msg_queue = document.getElementById('message-queue');
                    if (msg_queue) {
                        var el = document.createElement('div');
                        el.innerHTML = "<div class=\"container\"><span onclick=\"this.parentNode.removeChild(this);\"><input type=\"text\" value=\"" + resp.msg + "\" readonly/></span></div>";
                        msg_queue.appendChild(el);
                    }
                }
            }
        };
        var payload = JSON.stringify(self.collection);
        console.log('SENDING ', self.collection, payload);
        xmlhttp.send(payload);
    };
    return Editor;
}());
var editors = document.getElementsByClassName('editor');
for (var i = 0; i < editors.length; i++) {
    var editor = editors[i];
    if (editor.getAttribute('data-src')) {
        var t = new Editor(editor);
    }
}
eval("\nfunction nextNode(node) {\n    if (node.hasChildNodes()) {\n        return node.firstChild;\n    } else {\n        while (node && !node.nextSibling) {\n            node = node.parentNode;\n        }\n        if (!node) {\n            return null;\n        }\n        return node.nextSibling;\n    }\n}\nwindow[\"nextNode\"] = nextNode;\n\nfunction getRangeSelectedNodes(range, includePartiallySelectedContainers) {\n    var node = range.startContainer;\n    var endNode = range.endContainer;\n    var rangeNodes = [];\n\n    // Special case for a range that is contained within a single node\n    if (node == endNode) {\n        rangeNodes = [node];\n    } else {\n        // Iterate nodes until we hit the end container\n        while (node && node != endNode) {\n            rangeNodes.push( node = nextNode(node) );\n        }\n    \n        // Add partially selected nodes at the start of the range\n        node = range.startContainer;\n        while (node && node != range.commonAncestorContainer) {\n            rangeNodes.unshift(node);\n            node = node.parentNode;\n        }\n    }\n\n    // Add ancestors of the range container, if required\n    if (includePartiallySelectedContainers) {\n        node = range.commonAncestorContainer;\n        while (node) {\n            rangeNodes.push(node);\n            node = node.parentNode;\n        }\n    }\n\n    return rangeNodes;\n}\nwindow[\"getRangeSelectedNodes\"] = getRangeSelectedNodes;\n\nfunction getSelectedNodes() {\n    var nodes = [];\n    if (window.getSelection) {\n        var sel = window.getSelection();\n        for (var i = 0, len = sel.rangeCount; i < len; ++i) {\n            nodes.push.apply(nodes, getRangeSelectedNodes(sel.getRangeAt(i), true));\n        }\n    }\n    return nodes;\n}\nwindow[\"getSelectedNodes\"] = getSelectedNodes;\n\nfunction replaceWithOwnChildren(el) {\n    var parent = el.parentNode;\n    while (el.hasChildNodes()) {\n        parent.insertBefore(el.firstChild, el);\n    }\n    parent.removeChild(el);\n}\nwindow[\"replaceWithOwnChildren\"] = replaceWithOwnChildren;\n\nfunction removeSelectedElements(tagNames) {\n    var tagNamesArray = tagNames.toLowerCase().split(\",\");\n    getSelectedNodes().forEach(function(node) {\n        if (node.nodeType == 1 &&\n                tagNamesArray.indexOf(node.tagName.toLowerCase()) > -1) {\n            // Remove the node and replace it with its children\n            replaceWithOwnChildren(node);\n        }\n    });\n}\nwindow[\"removeSelectedElements\"] = removeSelectedElements;\n                \n");
//# sourceMappingURL=Editor.js.map