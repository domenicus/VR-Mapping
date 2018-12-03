"use strict";

AFRAME.registerComponent("intro-room", {
	haveComandeered: false,
	camera: null,
	greeting:
		"Welcome to the Gallery!\n\n"+
		"You need a controller.\n"+
		"Pick up the entry portal to\n"+
		"begin. It's at your feet.\n"+
		"Put it on your face.",
	init: function intro_room_init() {
		// create intro room programatically:
		var room = document.createElement("a-collada-model");
		room.setAttribute("src", "introroom.dae");
		room.setAttribute("position", "0 2 0");
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
		portal.setAttribute("face-portal", "to", "0 0 0");
		portal.setAttribute("position", "0 0 -3");

		this.el.appendChild(portal);
		this.el.appendChild(room);
		this.el.appendChild(cam);
		//this.el.sceneEl.appendChild(cam);
		//var riginner = document.createElement("a-entity");
		//riginner.setAttribute("position", "2, 0, 0");
		//riginner.appendChild(cam);
		//this.el.sceneEl.appendChild(riginner);
		//cam.setAttribute("position", this.el.getAttribute("position"));
		this.el.appendChild(greeting);
	},
	tick: function intro_room_tick() {
		if(this.haveComandeered)
			return;
		var cam = this.camera;
		cam.setAttribute("camera", "active", true);
		console.log("Camera THREE map:");
		console.log(cam.components.camera);
		console.log(cam.components.camera.camera);
		this.haveComandeered = true;
	}

});
