import {FieldSchema} from "./FieldSchema";
import {BlockInterface} from "./BlockInterface";

export class MediaBlock extends FieldSchema implements BlockInterface {

	private _handler_id: string;

	constructor(block?: any) {
		super(block);
	}

	getControls(): string {
		return ``;
	}

    edit(): Promise<string> {
		this._handler_id = ((Math.random() * 99999999.99999999) | 0).toString(16);
		let self = this;
		return new Promise(function (resolve, reject) {
			self.getValue().then(function (value) {
				let output: any = [];
				let controls: any = [];

				controls.push(`<label id="explore-quick-image-${self._handler_id}" class="col">
<i data-feather="image"></i>
<input type="file" name="image" accept="image/*">
</label>

<label id="explore-quick-video-${self._handler_id}" class="col">
<i data-feather="video"></i>
<input type="file" name="video" accept="video/*">
</label>
`);

				output.push(`<div class="edit block">${self.name}<div class="clr"></div><div class="edit-window text flex"><span>${controls.join('')}</span><input type='text' id="${self._handler_id}" placeholder='text' value="${self.value}" readonly/></div><div id="display-${self._handler_id}"></div></div>`);

				//`<div class="block"><label for="${self._handler_id}">${self.name}</label><input id="${self._handler_id}" name="${self._handler_id}" type="text" value="${value}"/></div>`
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


		let open_image = function () {
			//display.innerHTML = `<img src="${block.value}" class="big" id="explore-new-script-modal-img-${i}"/>`;
			//self._blocks[i].type = "image";
			console.log('img');

						document.getElementById(`explore-quick-image-${self._handler_id}`).onchange = function (evt: any) {
							if (!evt.srcElement.files) {
								return;
							}
							let input = evt.srcElement;
							let url = input.files[0].name;
							let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
							console.log(ext);
							if (input.files && input.files[0] && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {
								let reader = new FileReader();

								reader.onload = function (e:any) {

									let img = new Image();

									img.onload = function () {
										let w = img.naturalWidth || img.width,
											h = img.naturalHeight || img.height;
										let _is_portrait = (h > w) || (/iPad|iPhone|iPod/.test(navigator.userAgent));// && !window["MSStream"]);// || isAndroid;

										let cv = document.createElement('canvas');
										let ctx = cv.getContext('2d');
										let sc;

										let mx = 960;

										function rotateAndPaintImage(context:any, image:any, angleInRad:any, positionX:any, positionY:any, axisX:any, axisY:any) {
											context.rotate(angleInRad);
											context.drawImage(image, -axisX, -axisY);
											context.rotate(-angleInRad);
											context.translate(axisX, axisY);
										}

										if (_is_portrait) {
											sc = (mx / h);
											cv.width = mx;
											cv.height = w * sc;
											console.log('sizes yo: ', cv.width, cv.height);
											ctx.save();
											ctx.translate(cv.width, 0);
											ctx.rotate(Math.PI / 2);
											ctx.drawImage(img, 0, 0, cv.height, cv.width);
											ctx.rotate(-(Math.PI / 2));
											ctx.restore();
										} else {
											cv.width = mx;
											sc = mx / img.width;
											cv.height = (sc * img.height) | 0;
											ctx.drawImage(img, 0, 0, cv.width, cv.height);
										}

										self.value = cv.toDataURL();

									};

									img.src = e.target.result;

								};

								reader.readAsDataURL(input.files[0]);
								console.log(reader, input.files[0])
							}
						};
			console.log('open image');
		};
		document.getElementById(`explore-quick-image-${self._handler_id}`).onclick = open_image;

		let display = document.getElementById(`display-${self._handler_id}`);

		let open_video = function () {
			let new_type = 'mp4';// (isAndroid ? 'mp4' : 'mp4');
			let new_src = self.value.indexOf('.mp4') !== -1 ? (self.value.split('.mp4')[0]) + '.' + ('mp4') : self.value;
			let poster = self.value.indexOf('.mp4') !== -1 ? (self.value.split('.mp4')[0] + '.png') : '';

			display.innerHTML = `<video width="100%" webkit-playsinline playsinline autoplay controls id="explore-new-script-modal-video-${self._handler_id}" poster="${poster}">
		<source type="video/${new_type}" src="${new_src}" id="explore-new-script-modal-source-${self._handler_id}">
		Your browser does not support HTML5 video.
	</video>`;
			self.name = "video";
			let video_source_inner: any = document.getElementById(`explore-new-script-modal-source-${self._handler_id}`);

			document.getElementById(`explore-quick-video-${self._handler_id}`).onchange = function (evt: any) {
				console.log('b', evt.srcElement.files);
				if (!evt.srcElement.files || evt.srcElement.files.length === 0) {
					return;
				}
				let input = evt.srcElement;
				console.log(video_source_inner);

				var reader = new FileReader();
				reader.onloadend = function (e: any) {
					console.log('c', e, video_source_inner);
					self.value = e.target.result;
					let blob_url: any = URL.createObjectURL(input.files[0]);
					video_source_inner.src = blob_url;
					console.log(blob_url);
					try {
						video_source_inner.load();
						video_source_inner.play();
					} catch (e) {
						console.error(e);
					}

				};
				reader.readAsDataURL(input.files[0]);
			};
		};
		document.getElementById(`explore-quick-video-${self._handler_id}`).onclick = open_video;

		if (self.name === 'video'){
			open_video();
			let video_source_inner: any = document.getElementById(`explore-new-script-modal-video-${self._handler_id}`);
			video_source_inner.load();
		}

	}

}