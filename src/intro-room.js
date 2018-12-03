"use strict";

AFRAME.registerComponent("intro-room", {
	schema: {replacewith: {type: "selector"}}, 
	haveComandeered: false,
	lazyInit: false, // getAttribute gives wrong results in init?
	camera: null,
	greeting:
		"Welcome to the Gallery!\n\n"+
		"You need a controller.\n"+
		"Pick up the entry portal to\n"+
		"begin. It's at your feet.\n"+
		"Put it on your face.",
	init: function intro_room_init() {
		var data = this.data;
		var el = this.el;
		var self = this;
		// create intro room programatically:
		var room = document.createElement("a-collada-model");
		//room.setAttribute("src", "introroom.dae");
		room.setAttribute("src", "temp/domingo.dae")
		room.setAttribute("scale", "0.8, 0.8, 0.8")
		room.setAttribute("rotation", "0 -90 0")
		room.setAttribute("position", "0 -2 0");
		var cam = document.querySelector("[camera]");
		if(!cam) {
			cam = document.createElement("a-camera");
			cam.setAttribute("camera", "active", true);
		}
		this.camera = cam;
		var greeting = document.createElement("a-text");
		greeting.setAttribute("value", this.greeting);
		greeting.setAttribute("color", "black");
		greeting.setAttribute("position", "-2.8 2.8 -4.5");
		greeting.setAttribute("scale", "2, 2, 2");

		var portal = document.createElement("a-entity");
		this.portal = portal;

		portal.addEventListener('teleportme', function(e) {
			if(self.done) return;
			self.done = true;
			console.log('teleport parent');
			console.log(el);
			data.replacewith.setAttribute("position", el.object3D.position);
			//data.replacewith.object3D.applyQuaternion(e.detail.quat);
			self.el.parentEl.removeChild(el);
		});

		this.el.appendChild(portal);
		this.el.appendChild(room);
		this.el.sceneEl.appendChild(cam);
		this.el.appendChild(greeting);
	},
	tick: function intro_room_tick() {
		if(!this.lazyInit) {
			var data = this.data;
			var portal = this.portal;
			this.lazyInit=true;
			console.log(data);
			console.log(data.replacewith.getAttribute("position"));
			portal.setAttribute("face-portal", "to", 
					data.replacewith.getAttribute("position"));
			portal.setAttribute("position", "0 0 -3");
		}
		if(!this.haveComandeered) {
			var cam = this.camera;
			cam.setAttribute("camera", "active", true);
			console.log("Camera THREE map:");
			console.log(cam.components.camera);
			console.log(cam.components.camera.camera);
			this.haveComandeered = true;
		}
	}

});
