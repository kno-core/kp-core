(function () {

	function Editor(element) {
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
					self.collection = (JSON.parse(xhr.responseText));

					self.render();
				}
			}
		};

		xhr.send(null);
		
		this.render = function () {
			let self = this;
			new Promise(function (resolve, reject) {

				resolve(JSON.stringify(self.collection));

			}).then(function (inner) {
				self.element.innerHTML = inner;
			}).catch(function (inner) {
				self.element.innerHTML = inner;
			});
		};

		return this;

	}

	let editors = document.getElementsByClassName('editor');

	for (let i = 0; i < editors.length; i++) {
		let editor = editors[i];
		if (editor.getAttribute('data-src')) {
			let t = new Editor(editor);
		}
	}

})();

