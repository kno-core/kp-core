export class Form {

	private title: string;
	private headers: [];
	private rows: [];
	private editable: boolean;

	constructor(action, method, items) {

		this.editable = false;
	}

	generate() {
		let self = this;

		let headers = ``;
		this.headers.forEach(function (item) {
			headers += `<th>${item}</th>`;
		});
		headers += `<th>actions</th>`;

		let rows = ``;
		this.rows.forEach(function (row) {
			let fields = '';
			self.headers.forEach(function (item) {
				fields += `<td>${(row[item] + '').slice(0, 100)}</td>`;
			});
			fields += `<td>Edit Save Delete</td>`;
			rows += `<tr>
                        ${fields}
                    </tr>`;
		});

		let html = `
<script></script>
<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <i class="fa fa-align-justify"></i> ${this.title}</div>
            <div class="card-body">
                <table class="table table-responsive-sm table-sm">
                    <thead>
                    <tr>
                        ${headers}
                    </tr>
                    </thead>
                    <tbody>
                    ${rows}
                    </tbody>
                </table>
  
            </div>
        </div>
    </div>
</div>`;
//JSON.stringify({title:this.title,headers:this.headers,rows:this.rows})
		return html;
	}
}