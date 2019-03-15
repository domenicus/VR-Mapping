"use strict";
AFRAME.registerComponent("gallery", { schema: {
		exhibits: {type: "array"}, // array of IDs of images
		metafile: {type: "asset"}, // metadata file generated by annotator
		mapfile:  {type: "map"}, // 
		navtools: {type: "selectorAll"},
		platform: {type: "selector"}
	},
	toolState: 0, //0=no tool, 1=have tool, 2=is portal
	activetool: null,
	zones: null,
	planets: [],
	t: 0,
	currentRoom: null,
	currentCompassPortal: null,
	roomvector: new THREE.Vector3(0, 0, 25),
	greeting:
		"Welcome to the Gallery!\n\n"+
		"You need a controller.\n"+
		"Pick up the entry portal to\n"+
		"begin. It's at your feet.\n"+
		"Put it on your face.",
	init: function() {
		// SCOPES ARE ANNOYING
		var data = this.data;
		var self = this;
		// GREET USER
		var greeting = document.createElement("p");
		greeting.innerHTML = (this.greeting);
		greeting.style.width = "25vw";
		greeting.style.zIndex = 999;
		greeting.style.position = "relative";
		greeting.style.left = "5em";
		greeting.style.background = "white";
		greeting.style.padding = "2em";
		setTimeout(function() {
			document.querySelector('.a-enter-vr').appendChild(greeting);
		}, 1000);

		// LOAD METADATA
		var metafile = document.querySelector('a-asset-item[src="' + data.metafile +'"]').data;
		this.zones = JSON.parse(metafile);
		var zones = this.zones;

		// REGISTER MAP TOOL LISTENERS
		function teleportHandler(newroom, e) {
			// delete old portal:
			if(self.activetool) {
				e.target.parentNode.removeChild(e.target);
				self.currentCompassPortal = null;
			}
			console.log("current room index:", self.currentRoom);
			self.makeRoom(self.currentRoom)[0].setAttribute("position", e.detail.to);
			self.makeRoom(newroom)[0].setAttribute("position", new THREE.Vector3());
			self.currentRoom = newroom;
			console.log(self.activetool);
			if(self.activetool)
				self.el.sceneEl.appendChild(self.activetool);
			self.activetool = null;
			self.toolState = 0;
			// HIDE/UNHIDE logic
			if(zones[self.currentRoom].isnexus) {
				self.data.platform.setAttribute("position", {x:0, y:1000, z:5000});
			} else {
				self.data.platform.setAttribute("position", {x:0, y:-2, z:0});
			}
		}
		for(var i = 0; i < data.navtools.length; i++) {
			var tool = data.navtools[i];
			tool.addEventListener('click', function(e) {
				console.log("State:", self.zones, self.toolState);
				console.log("Clicked", e);
				var zones = self.zones;
				if(self.toolState == 0) { // Picked up!
					var cursor = e.detail.cursorEl;
					if(false && cursor.hasAttribute("cursor")) { // Workaround for 2D debug
						cursor.parentElement.parentElement.appendChild(tool);
					} else {
						cursor.appendChild(tool);
					}
					self.toolState = 1;
					self.activetool = tool;
					console.log("active tool:", self.activetool);
					console.log("Picked up");
					return;
				}
				if(self.zones && self.toolState == 1) { // Selected a zone!
					console.log("Picked region:");
					var isect = e.detail.intersection.uv;
					for(var i = 0; i < zones.length; i++) {
						var coords = zones[i].coords;
						if(coords[0] < isect.x && coords[2] > isect.x &&
							coords[1] < isect.y && coords[3] > isect.y) {
							console.log(zones[i].name);
							var room = self.makeRoom(i);
							self.toolState = 2; // transition to portal mode
							// set up portal
							var portal = document.createElement("a-entity");
							portal.setAttribute("face-portal", "sphere", "#"+tool.id);
							portal.setAttribute("face-portal", "to", room[1]);
							portal.setAttribute("face-portal", "tex", "temp/flipped."+zones[i].name);
							tool.appendChild(portal);
							portal.addEventListener("teleportme", teleportHandler.bind(self, i));
							self.currentCompassPortal = portal;
						}
					}
					return;
				}
				if(self.zones && self.toolState == 2) { // tried to leave
					console.log("Resetting");
					self.currentCompassPortal.parentNode.removeChild(self.currentCompassPortal);
					tool.setAttribute("material", "src", self.data.mapfile);
					self.toolState = 1;
					return;
				}
			});
		}
		const nexusIndex = zones.map(e => e.isnexus).indexOf(true);
		var nexusroom = self.makeRoom(nexusIndex);
		self.currentRoom = nexusIndex;

		// MAKE CONSTELLATION
		for(var i = 0; i < zones.length; i++) {
			if(zones[i].isnexus) {
				self.planets[i] = null;
				continue;
			}
			var portal = document.createElement("a-entity");
			var room = self.makeRoom(i);
			var theta = (i/zones.length)*2*Math.PI;
			console.log("position", {x:5*Math.cos(theta), y:0, z:5*Math.sin(theta)}, "theta", theta, i/zones.length);
			portal.setAttribute("position", {x:5*Math.cos(theta), y:0, z:5*Math.sin(theta)});
			portal.setAttribute("face-portal", "to", (new THREE.Vector3()).copy(room[1]));
			portal.setAttribute("face-portal", "tex", "temp/flipped."+zones[i].name);
			nexusroom[0].appendChild(portal);
			portal.addEventListener("teleportme", teleportHandler.bind(self, i));
			self.planets[i] = portal;
		}
	},
	makeRoom: function(zoneIndex) {
		var self = this;
		var zones = self.zones;
		var exists = document.getElementById(self.el.id+"k"+zoneIndex);
		if(!exists && zones[zoneIndex].isnexus) {
			exists = document.getElementById("nexus");
		}
		if(exists) {
			console.log("Zone already exists:", exists);
			pos = exists.getAttribute("position");
			return [exists, pos];
		}
		var rel = document.createElement("a-entity"); // base for room
		var globe = document.createElement("a-sphere");
		globe.setAttribute("src", "temp/flipped."+zones[zoneIndex].name);
		globe.setAttribute("radius", 10);
		globe.setAttribute("theta-start", 20);
		globe.setAttribute("theta-length", 120);
		//theta-start="20" theta-length="120" material="side: back; shader: flat" class="clickable">
		globe.classList.add("clickable");
		globe.setAttribute("material", "side", "back");
		globe.setAttribute("material", "shader", "flat");
		globe.addEventListener('click', function(e) {
			if(zones[zoneIndex].zoomed) {
				globe.object3D.position.copy(zones[zoneIndex].zoomed);
				zones[zoneIndex].zoomed = false;
				return;
			}
			zones[zoneIndex].zoomed = globe.object3D.position.clone();
			var s = e.detail.intersection.point.divideScalar(-3/2);
			globe.object3D.position.add(s);
		});
		rel.appendChild(globe);
		var pos;
		if(zones[zoneIndex].isnexus) {
			pos = new Three.Vector3(0, 0, 0);
			rel.setAttribute("id", "nexus");
			rel.setAttribute("position", pos);
		} else {
			pos = self.roomvector.multiplyScalar(zoneIndex+1);
			rel.setAttribute("id", self.el.id+"k"+zoneIndex);
			rel.setAttribute("position", pos);
		}
		self.el.sceneEl.appendChild(rel);
		return [rel, pos];
	},
	tick: function() {
		var zones = this.zones;
		var self = this;
		self.t ++;
		for(var i = 0; i < zones.length; i++) {
			if(zones[i].isnexus) {
				continue;
			}
			var portal = self.planets[i];
			var theta = (i/zones.length + (i/4+1)*self.t/3600/3)%1*2*Math.PI;
			portal.setAttribute("position", {x:(5+i/3)*Math.cos(theta), y:0.3*Math.cos(theta*2), z:(5+i/3)*Math.sin(theta)});
		}
	}
});

