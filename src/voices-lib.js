"use strict";
AFRAME.registerComponent("voices-lib", {
	schema: {
		raycaster:{type:"selector"},
		mapped:{type:"string"}
	},
	parsed: null,
	totalloaded: false,
	playing: null,
	playing_id: -1,
	init: function() {
	/* Setup call. */
		this.parsed = JSON.parse(this.data.mapped);
		var parsed = this.parsed;
		var outer = this;
		var map_surface = document.createElement("a-entity");
		map_surface.setAttribute("geometry", "primitive", "plane");
		map_surface.setAttribute("position", "0, 2, -5", );
		map_surface.setAttribute("material", "src", "url("+parsed.image+")");
		map_surface.setAttribute("material", "shader", "flat");
		var img = document.createElement("img");
		document.querySelector("a-assets").appendChild(img);
		img.setAttribute("src", parsed.image);
		img.onload = function() {
			map_surface.setAttribute("geometry", "width", "16");
			map_surface.setAttribute("geometry", "height", 16*img.naturalHeight/img.naturalWidth);
			outer.el.appendChild(map_surface);
			outer.totalloaded = true;
		}
		this.parsed = parsed.list;
	},
	tick: function() {
		if(!this.totalloaded)return;
		var intersections = this.data.raycaster.components.raycaster.intersections;
		if(!intersections)return;
		if(intersections.length <= 0) {
			return;
		}
		var x = intersections[0].uv.x;
		var y = 1-intersections[0].uv.y;
		for(var i = 0; i < this.parsed.length; i++) {
			var a = this.parsed[i];
			if(a.x < x && a.y < y && a.lx > x && a.ly > y) {
				var f = this.parsed[i].file;
				if(f) {
					if(this.playing_id != i) {
						if(this.playing)this.playing.pause();
						var aud = new Audio(f);
						aud.play();
						this.playing = aud;
						this.playing_id = i;
					}
				}
				break;
			}
		}
	}
});

