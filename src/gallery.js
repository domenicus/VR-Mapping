"use strict";
AFRAME.registerComponent("gallery", { schema: {
		exhibits: {type: "array"},
		console: {type: "model", default:null}
	},
	camera: null,
	init: function() {
		console.log(this);
		//var fileloader = document.querySelector("a-assets").fileLoader;
		var outerEl = this.el;
		var raycastId = "raycast-voices-demo";
		var raycaster = document.createElement("a-entity");
		raycaster.setAttribute("raycaster", "showline"); 
		raycaster.setAttribute("raycaster", "origin", "0, 0, 0"); //Is required despite docs
		raycaster.setAttribute("raycaster", "objects", "[voices-lib]");
		raycaster.id = raycastId;
		// Create laser controls
		var pointers = document.querySelectorAll("[laser-controls]");
		console.log("pointers", pointers);
		this.data.pointers = pointers;
		var next = document.querySelector("#nextbutton");
		var back = document.querySelector("#previousbutton");
		this.data.elts = [];
		var outerElts = this.data.elts;
		var outer = this;
		this.data.currPos = 0;
		for(var i in pointers) {
			if(!pointers[i].addEventListener) {
				delete pointers[i];
				continue;
			}
			pointers[i].addEventListener("mousedown", function(e) {
				if(outer.data.go < 1)
					return; // no interactions while moving
				var hit = e.detail.intersectedEl;
				outer.data.go = 0;
				outer.data.start = {x:0, y:0, z:0};
				outer.data.end = {x:0, y:0, z:0};
				outer.data.end.x +=
					(hit==next)?-40:
					((hit==back)?40:
					 0);
				if(hit==back)
					outer.data.currPos --;
				if(hit==next)
					outer.data.currPos ++;
				for(var j in outerElts) {
					if(!(outerElts[j].data))
						outerElts[j].data = {};
					outerElts[j].data.start = 
						outerElts[j].object3D.position.clone();
				}
				if((hit==back) || (hit==next)) {
					return;
				}
				for(var j in outerElts) {
					if(outerElts[j].data.menuelt == hit) {
						outer.data.go = 0;
						outer.data.start = {x:0, y:0, z:0};
						outer.data.end= {x:40*(-outer.data.currPos+j), y:0, z:0};
						outer.data.currPos = j;
						for(var j in outerElts) {
							if(!(outerElts[j].data))
								outerElts[j].data = {};
							outerElts[j].data.start = 
								outerElts[j].
								object3D.position.clone();
						}
						return;
					}
				}
				console.log("---");
				// Guess it hit the room or something.
					
			});
		}
		var camera = document.querySelector("[camera]");
		if(!camera) {
			camera = document.createElement("a-camera");
			this.el.sceneEl.appendChild(camera);
		}
		this.camera = camera;
		camera.setAttribute("look-controls");
		camera.setAttribute("wasd-controls");
		camera.appendChild(raycaster);
		camera.id = "camera-gallery";
		camera.setAttribute("active", true);

	},
	logisticinterp: function logisticinterp(t, start, fin, out) {
		// check the wikipedia for 'logistic curve' for the math background
		// t is the parameter for where on the curve to return; vary it from 0
		// to get the initial position to 1 to get the final position.
		// returns by manipulating out
		var m = 1/(1+80*Math.exp(-10*t));
		var im = 1-m;
		out.x = start.x*im + fin.x*m;
		out.y = start.y*im + fin.y*m;
		out.z = start.z*im + fin.z*m;
	},
	tick: function tick() {
		if(this.camera) {
			this.camera.setAttribute("active", true);
			this.camera = null;
		}
		if((this.data.go < 1)) {
			var data = this.data;
			var te = {x:0, y:0, z:0};
			this.logisticinterp(data.go, data.start, data.end, te);
			data.go += 0.003;
			for(var i in data.elts) {
				data.elts[i].object3D.position.
					addVectors(te, data.elts[i].data.start);
			}
		}
	}
});

