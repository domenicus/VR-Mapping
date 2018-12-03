"use strict";

/* LESSON LEARNT:
 * the AFRAME screenshot component has to be on a-scene due to a failure of
 * modularity. I will try to submit a PR to fix this but in the meantime we
 * only ever need to render one area at a time soooooooo I guess this will
 * work.
 * */
AFRAME.registerComponent("face-portal", {
	schema: {to: {type: "vec3"}},
	camera: null,
	renderInterval: 500,
	haveRendered: -1, // ticks to wait until render
	renderTimes: 2,
	myCanvas: null,
	init: function face_portal_init() {
		// create sphere
		// take screenshot
		// put screenshot in img element or smth
		// map screenshot to inside
		this.el.setAttribute("material", "side", "back");
		this.el.setAttribute("geometry", {
			primitive: "sphere"
		});
		console.log(this.el.object3D);
		var camera = document.createElement("a-camera");
		camera.setAttribute("active", "false");
		this.camera = camera;
		camera.setAttribute("position", this.data.to);
		camera.id = "face-portal-camera-"+~~(Math.random()*1000);
		this.el.sceneEl.appendChild(camera);
		// set up screenshot entity
		document.querySelector("a-scene").setAttribute("screenshot", {
			camera: "#"+camera.id
		});

		console.log(camera);
	},
	tick: function face_portal_tick() {
		if(this.haveRendered > 0) {
			return;
		}
		if(this.haveRendered < 0) {
			this.haveRendered++;
			return;
		}
		
		var self = this;
		var camera = this.camera;
		setTimeout(function doScreenshot() {
			var t = document.querySelector("a-scene").components.screenshot.
				getCanvas('equirectangular');
			if(t != self.myCanvas) {
				t.id = "face-portal-canvas-"+~~(Math.random()*1000);
				document.querySelector("a-assets").appendChild(t);
				// put screenshot in
				console.log(t);
				console.log("Rendering!");
				self.el.setAttribute("drawCanvas", t);
			}
			// Force using data URLs (bad perfomance)
			self.el.setAttribute("material", "src", t.toDataURL("image/png"));
			console.log(self.renderTimes);
			if(self.renderTimes > 0) {
				console.log("resetting");
				self.renderTimes --;
				self.haveRendered = -self.renderInterval;
			} else {
				self.haveRendered = 1;
			}
		});
	}
});
