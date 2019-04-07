(function () {

	function Table(element) {
		let self = this;
		this.element = element;
		this.rows = [];
		this.collections = [];
		this._collection = parseInt(element.getAttribute('data-index'))||0;
		console.log('index',this._collection);

		var xhr = new XMLHttpRequest();
		xhr.open('GET', this.element.getAttribute('data-src'), true);
		xhr.responseType = 'text';
		xhr.onload = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 200) {
					self.collections = (JSON.parse(xhr.responseText));
					self.render();
				}
			}
		};
		xhr.send(null);

		this.render = function () {

			let self = this;
			new Promise(function (resolve) {

				let col = self.collections[self._collection];
				let str = [];
				let width = col.fields.length;

				if (self.collections.length > 1) {
					let options = [];
					self.collections.forEach(function (collection, index) {
						options.push(`<option value="${index}" ${(self._collection === index ? `selected='selected'` : '')}>${collection.type}</option>`);
					});
					str.push(`<tr><td colspan="${width}"><span class="select-wrapper"><select id="select-collection">${options.join('')}</select></span> <a href="/collections/edit/${self.collections[self._collection].type}/"><button class="primary">Create New ${self.collections[self._collection].type}</button></a></td></tr>`);
				}

				str.push(`<tr>`);
				col.fields.forEach(function (field) {

					str.push(`<td>${field.name}</td>`);

				});
				str.push(`<td>controls</td>`);

				str.push(`</tr>`);


				if (col.rows) {
					col.rows.forEach(function (row) {
						str.push(`<tr>`);
						row.fields.forEach(function (field) {
							str.push(`<td>${field.value}</td>`);
						});
						str.push(`<td><a href="/collections/edit/${col.type}/${row._id||''}">edit</a><a href="/collections/remove/${col.type}/${row._id||''}">remove</a></td>`);
						str.push(`</tr>`);

					});
				}

				resolve(str.join(''));

			}).then(function (inner) {
				self.element.innerHTML = inner;
				document.getElementById('select-collection').onchange = function () {
					window.location = `/collections/edit/${document.getElementById('select-collection')[this.value].innerText}/`;
				};
			}).catch(function (inner) {
				self.element.innerHTML = inner;
			});
		};

		return this;

	}

	let tables = document.getElementsByTagName('table');

	for (let i = 0; i < tables.length; i++) {
		let table = tables[i];
		if (table.getAttribute('data-src')) {
			(new Table(table));
		}
	}

})();

