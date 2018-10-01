"use strict";
AFRAME.registerComponent("gallery", { schema: {
		exhibits: {type: "array"},
		console: {type: "model", default:null}
	},
	init: function() {
		console.log(this);
		var fileloader = document.querySelector("a-assets").fileLoader;
		var outerEl = this.el;
		var raycastId = "raycast-voices-demo";
		var raycaster = document.createElement("a-entity");
		raycaster.setAttribute("raycaster", "showline"); 
		raycaster.setAttribute("raycaster", "objects", "[voices-lib]");
		raycaster.id = raycastId;
		// Create laser controls
		console.log(document.querySelector("[laser-controls]"));
		var pointers = [document.createElement("a-entity"), 
			document.createElement("a-entity")];
		pointers[0].setAttribute("laser-controls", "hand", "right");
		pointers[1].setAttribute("laser-controls", "hand", "left");
		pointers[0].setAttribute("raycaster", "recursive", "true");
		pointers[1].setAttribute("raycaster", "recursive", "true");
		pointers[0].setAttribute("line", "color", "blue");
		pointers[1].setAttribute("line", "color", "green");
		this.data.pointers = pointers;
		var next = document.querySelector("#nextbutton");
		var back = document.querySelector("#previousbutton");
		this.data.elts = [];
		var outerElts = this.data.elts;
		var outer = this;
		this.data.currPos = 0;
		var controllerModel = document.createElement("a-box");
		controllerModel.setAttribute("color", "blue");
		controllerModel.setAttribute("width", "0.1");
		controllerModel.setAttribute("depth", "0.3");
		controllerModel.setAttribute("height", "0.1");
		pointers[0].appendChild(controllerModel);
		this.el.sceneEl.appendChild(pointers[0]);
		for(var i in pointers) {
			//this.el.sceneEl.appendChild(pointers[i]);
			pointers[i].addEventListener("mousedown", function(e) {
				if(outer.data.go < 1)
					return; // no interactions while moving
				var hit = e.detail.intersectedEl;
				outer.data.go = 0;
				outer.data.start = {x:0, y:0, z:0};
				outer.data.end = {x:0, y:0, z:0};
				outer.data.end.x +=
					(hit==next)?-20:
					((hit==back)?20:
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
						outer.data.end= {x:20*(-outer.data.currPos+j), y:0, z:0};
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
				console.log(e);
				console.log(hit);
				console.log(hit.parentEl.id);
				// if we didn't already hit a menu or whatever..
				// check to see if we hit a map
				for(var j in outerElts) {
					console.log(outerElts[j].id);
					if(hit.parentEl.id == outerElts[j].id) {
						console.log("picked!");
						if(!hit.parentEl.data.zoomed) {
							console.log("not zoomed");
							hit.setAttribute("scale", {x:2, y:2, z:2});
							var uv = e.detail.intersection.uv;
							var dim = hit.components.geometry.oldData;
							var position = hit.components.position.data;
							outerElts[j].data.oldposition = position;
							console.log(position, uv, dim);
							position = {x:position.x, y:position.y, z:position.z};
							position.x -= 2*(uv.x-0.5)*dim.width;
							position.y -= 2*(uv.y-0.5)*dim.height;
							hit.setAttribute("position", position);
							hit.parentEl.data.zoomed = true;
						} else
						if(hit.parentEl.data.zoomed) {
							console.log("zoomed");
							hit.setAttribute("scale", {x:1, y:1, z:1});
							hit.parentEl.data.zoomed = false;
							hit.setAttribute("position", outerElts[j].data.oldposition);
						}
					}
				}
				console.log("---");
				// Guess it hit the room or something.
					
			});
		}
		var camera = document.createElement("a-camera");
		camera.setAttribute("look-controls");
		camera.setAttribute("wasd-controls");
		camera.appendChild(raycaster);
		camera.id = "camera-gallery";
		this.el.sceneEl.appendChild(camera);
		this.data.exhibits.forEach(function(url, i) {
			var elt = document.createElement("a-entity");
			fileloader.load(url, function(mapped) {
				elt.setAttribute("voices-lib", "mapped", mapped);
				elt.setAttribute("voices-lib", "raycaster", "#"+raycastId);
				elt.setAttribute("position", 20*i+" 0 0");
				outerEl.appendChild(elt);
				outerElts.push(elt);
			});
			// Create a menu item:
			var menu = document.createElement("a-text");
			menu.setAttribute("value", url.split("/").pop().split(".")[0]);
			menu.setAttribute("geometry", "primitive", "plane");
			menu.setAttribute("position", (i*1.5-3)+" 2 5");
			menu.setAttribute("rotation", "0 180 0");
			outerEl.sceneEl.appendChild(menu);
			elt.data={};
			elt.data.menuelt = menu;
			elt.id = "gallery-item-"+i;
		});

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

