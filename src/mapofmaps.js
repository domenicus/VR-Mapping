"use strict";
AFRAME.registerComponent("mapofmaps", {
	init: function initMapOfMaps() {
		var lmaps = document.querySelectorAll(".lmap");
		var self = this;
		for(var i = 0; i < lmaps.length; i++) {
			var t = i;
			/*
			lamps[i].addEventListener('mousedown',
				function(e) {
				*/
		}
	},
	tick: function tickMapOfMaps() {
		var lmaps = document.querySelectorAll(".lmap");
		var camera = document.querySelector("a-camera");
		if(!camera) {
			camera = document.querySelector("[camera]");
		}
		if(!camera) {
			console.log("failed:");
			return;
		}
		var p = camera.object3D.position;
		for(var i = 0; i < lmaps.length; i++) {
			lmaps[i].object3D.lookAt(p);
		}
	}
});
