(function () {

	class Table {
		element;
		rows;

		constructor(element) {
			let self = this;
			this.element = element;
			this.rows = [];

			var xhr = new XMLHttpRequest();
			xhr.open('GET', this.element.getAttribute('data-src'), true);
			xhr.responseType = 'text';
			xhr.onload = function () {
				if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200) {
						self.rows = (JSON.parse(xhr.responseText));
						self.render();
					}
				}
			};
			xhr.send(null);
		}

		render() {
			this.element.innerText = JSON.stringify(this.rows);
		}

	}

	let tables = document.getElementsByTagName('table');

	for (let i = 0; i < tables.length; i++) {
		let table = tables[i];
		if (table.getAttribute('data-src')) {
			let t = new Table(table);
		}
	}

})();

