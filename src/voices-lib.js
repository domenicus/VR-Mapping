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
		console.log("INITTING");
		this.parsed = JSON.parse(this.data.mapped);
		var parsed = this.parsed;
		var outer = this;
		var map_surface = document.createElement("a-entity");
		map_surface.setAttribute("geometry", "primitive", "plane");
		map_surface.setAttribute("position", "0, 2, -5", );
		map_surface.setAttribute("material", "src", "url("+parsed.image+")");
		map_surface.setAttribute("material", "shader", "flat");
		map_surface.classList.add("clickable");
		var img = document.createElement("img");
		document.querySelector("a-assets").appendChild(img);
		img.setAttribute("src", parsed.image);
		img.onload = function() {
			map_surface.setAttribute("geometry", "width", "16");
			map_surface.setAttribute("geometry", "height", 16*img.naturalHeight/img.naturalWidth);
			outer.el.appendChild(map_surface);
			outer.totalloaded = true;
		}
		// metadata pane:
		if(parsed.meta) {
			var desc = parsed.meta.displayTitle + "\n"+
				parsed.meta.source_publisher + "\n"+
				parsed.meta.source_date + "\n"+
				parsed.meta.id + "\n"+
				parsed.meta.technique;
			var pane = document.createElement("a-entity");
			pane.setAttribute("geometry", "primitive", "plane");
			pane.setAttribute("geometry", "height", "auto");
			pane.setAttribute("geometry", "width", "auto");
			pane.setAttribute("text", "width", 6);
			pane.setAttribute("text", "value", desc);
			pane.setAttribute("position", "-11, 0, 0");
			pane.setAttribute("material", "color", "darkblue");
			map_surface.appendChild(pane);
		}
		this.meta = parsed.meta;
		this.parsed = parsed.list;

		this.onloadmetaf({detail: {meta: parsed.meta}});
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
	},
	onloadmeta: function(f) {
		this.onloadmetaf = f;
	}
});

