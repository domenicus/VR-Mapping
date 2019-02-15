"use strict";
AFRAME.registerComponent("mapofmaps", {
	zones: null,
	selected: false, // 0 = selecting, 1 = portal
	zoomed: false,
	schema: {target: {type: 'selector'}},
	init: function initMapOfMaps() {
		var el = this.el;
		var target = this.data.target;
		var self = this;
		console.log(el);
		el.addEventListener('click', function(e) {
			console.log("Clicked", e);
			if(self.data.selected) {
				el.setAttribute("src", "temp/out.jpg");
				self.data.selected = false;
				return;
			}
			if(self.data.zones) {
				var zones = self.data.zones;
				var isect = e.detail.intersection.uv;
				for(var i = 0; i < zones.length; i++) {
					var coords = zones[i].coords;
					if(coords[0] < isect.x && coords[2] > isect.x &&
						coords[1] < isect.y && coords[3] > isect.y) {
						console.log(zones[i].name);
						target.setAttribute("src", "temp/flipped."+zones[i].name);
						self.data.selected = true;
					}
				}
			}
		});
		target.addEventListener('click', function(e) {
			if(self.zoomed) {
				target.object3D.position.copy(self.zoomed);
				self.zoomed = false;
				return;
			}
			self.zoomed = target.object3D.position.clone();
			var s = e.detail.intersection.point.divideScalar(-3/2);
			target.object3D.position.add(s);
		});
		fetch("temp/out.json")
			.then(response => response.json())
			.then(json => self.data.zones = json);
	}
});
