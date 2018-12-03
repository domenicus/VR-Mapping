"use strict";
AFRAME.registerComponent("testroom", {
	camera: null,
	counter: 0,
	init: function() {
		// Append controllers?
	},
	tick: function tick() {
		if(this.counter < 1e6)
			this.counter++;
		else if(this.counter > 1e6) {}
		else {
			var cam;
			this.camera = cam = document.querySelector("a-camera");
			this.counter ++;
			this.el.sceneEl.appendChild(cam);
		}
	}
});
