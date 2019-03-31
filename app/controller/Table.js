(function () {

	function Table(element) {
		let self = this;
		this.element = element;
		this.rows = [];
		this.collections = [];
		this._collection = 0;

		var xhr = new XMLHttpRequest();
		xhr.open('GET', this.element.getAttribute('data-src'), true);
		xhr.responseType = 'text';
		xhr.onload = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 200) {
					self.collections = (JSON.parse(xhr.responseText));
					console.log(self.collections);
					self.render();
				}
			}
		};
		xhr.send(null);

		this.render = function () {
			let self = this;
			new Promise(function (resolve, reject) {


				let col = self.collections[self._collection];
				let str = [];
				let width = col.fields.length;

				if (self.collections.length > 1) {
					let options = [];
					self.collections.forEach(function (collection, index) {
						options.push(`<option value="${index}" ${(self._collection === index ? `selected='selected'` : '')}>${collection.type}</option>`);
					});
					str.push(`<tr><td colspan="${width}"><span class="select-wrapper"><select id="select-collection">${options.join('')}</select></span> <a href="/collections/${self.collections[self._collection].type}/"><button class="primary">Create New ${self.collections[self._collection].type}</button></a></td></tr>`);
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
						str.push(`<td><a href="./${col.type}/${row._id||''}">edit</a><a href="./remove/${col.type}/${row._id||''}">remove</a></td>`);
						str.push(`</tr>`);

					});
				}

				resolve(str.join(''));

			}).then(function (inner) {
				self.element.innerHTML = inner;
				document.getElementById('select-collection').onchange = function () {
					self._collection = parseInt(this.value);
					self.render();
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
			let t = new Table(table);
		}
	}

})();

