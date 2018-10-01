"use strict";
AFRAME.registerComponent("voices", {
	init: function() {
		var outerEl = this.el;
		document.getElementById("mapFileLoad").addEventListener("change",
		    function(e) {
			var file = this.files[0];
			var reader = new FileReader();
			var scene = document.querySelector("a-scene");
			var ent = document.createElement("a-entity");
			var raycaster = document.querySelector("[camera] [raycaster]");
			if(!(raycaster.id)) {
				raycaster.id = "voices-demo-camera-raycaster";
			}
			reader.onload = function(e) {
				ent.setAttribute("voices-lib", "raycaster", "#"+raycaster.id);
				ent.setAttribute("voices-lib", "mapped", e.target.result);
				outerEl.appendChild(ent);
				outerEl.flushToDOM();
			}
			reader.readAsText(file);
		});
	}
});
