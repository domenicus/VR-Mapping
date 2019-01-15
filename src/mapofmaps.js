"use strict";
AFRAME.registerComponent("mapofmaps", {
	zones: null,
	selected: false,
	init: function initMapOfMaps() {
		var el = this.el;
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
						el.setAttribute("src", "temp/flipped."+zones[i].name);
						self.data.selected = true;
					}
				}
			}
		});
		fetch("temp/out.json")
			.then(response => response.json())
			.then(json => self.data.zones = json);
	}
});
