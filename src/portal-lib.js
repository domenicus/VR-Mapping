"use strict";

/* LESSON LEARNT:
 * the AFRAME screenshot component has to be on a-scene due to a failure of
 * modularity. I will try to submit a PR to fix this but in the meantime we
 * only ever need to render one area at a time soooooooo I guess this will
 * work.
 * */
AFRAME.registerComponent("face-portal", {
	schema: {
		to: {type: "vec3"},
		uuid:{type: 'number', default: -1}, // NEVER set this manually.
		sphere:{type: 'selector', default: null},
		tex:{type: 'string', default: null}
	},
	camera: null,
	renderInterval: 500,
	haveRendered: -1, // ticks to wait until render
	renderTimes: 2, // oughta be 2 for a slow scene
	myCanvas: null,
	done: false,
	sphere: null,
	init: function face_portal_init() {
		// create sphere
		// take screenshot
		// put screenshot in img element or smth
		// map screenshot to inside
		var el = this.el;
		var data = this.data;
		var sph;
		if(data.sphere) {
			sph = data.sphere;
		} else {
			console.log("Making own sphere");
			sph = document.createElement("a-entity");
			sph.setAttribute("material", "side", "back");
			sph.setAttribute("geometry", "primitive", "sphere");
			sph.setAttribute("geometry", "radius", 0.4);
			sph.classList.add("clickable");
			console.log(sph, this.el);
			el.appendChild(sph);
			console.log(el.childNodes.length);
			// Set up grab:
			sph.addEventListener("click", function portalclicked(e) {
				sph.setAttribute("position", "0 0 0");
				sph.flushToDOM();
				console.log(sph);
				e.detail.cursorEl.appendChild(sph);
				console.log(sph);
			});
		}
		var camera = document.createElement("a-camera");
		camera.setAttribute("active", "false");
		this.camera = camera;
		camera.setAttribute("position", this.data.to);
		camera.id = "face-portal-camera-"+~~(Math.random()*1000);
		el.sceneEl.appendChild(camera);
		// set up screenshot entity
		document.querySelector("a-scene").setAttribute("screenshot", {
			camera: "#"+camera.id
		});


		console.log("TO: ", data.to);
		this.sphere = sph;

		if(this.data.tex) {
			this.haveRendered = 1;
			sph.setAttribute("material", "src", this.data.tex);
		}
	},
	tick: function face_portal_tick() {
		// face-portal intersection code
		var el = this.el;
		var sph = this.sphere;
		var self = this;
		var camera = this.camera;
		if(!face_portal_tick.elpos) {
			face_portal_tick.elpos = new THREE.Vector3();
			face_portal_tick.portpos = new THREE.Vector3();
		}
		var elpos = face_portal_tick.elpos;
		var portpos = face_portal_tick.portpos;


		if(!sph.parentEl)
			return;// skip bad pre-loading stages
		sph.object3D.getWorldPosition(elpos);
		el.sceneEl.camera.getWorldPosition(portpos);
		if(portpos.x == 0 && portpos.y == 0 && portpos.z == 0)
			return;// origin cameras don't exist
		if(elpos.distanceTo(portpos) < 0.4 && !self.done) {
			console.log("position", sph.object3D.getWorldPosition(elpos), "camera position", el.sceneEl.camera.getWorldPosition(portpos),
					"distance", sph.object3D.getWorldPosition(elpos).distanceTo(el.sceneEl.camera.getWorldPosition(portpos)));
			console.log("CLOSE ENOUGH");
			//self.done = true;
			var q = new THREE.Quaternion();
			q = sph.object3D.getWorldQuaternion(q);
			q.inverse();
			var evt = new CustomEvent('teleportme', {detail: {quat: q, to: self.data.to}});
			el.dispatchEvent(evt);
			if(!self.data.sphere)
				this.el.appendChild(sph);
		}


		// Render reloading code
		if(this.haveRendered > 0) {
			return;
		}
		if(this.haveRendered < 0) {
			this.haveRendered++;
			return;
		}
		
		setTimeout(function doScreenshot() {
			document.querySelector("a-scene").setAttribute("screenshot", {
				camera: "#"+camera.id
			});
			if(!face_portal_tick.t)face_portal_tick.t=1;
			console.log("SCREENSHOTTING AGAIN ", face_portal_tick.t++);
			console.log("Camera:", camera);
			var t = document.querySelector("a-scene").components.screenshot.
				getCanvas('equirectangular');
			if(t != self.myCanvas) {
				t.id = "face-portal-canvas-"+~~(Math.random()*1000);
				document.querySelector("a-assets").appendChild(t);
				// put screenshot in
				sph.setAttribute("material", "src", '#'+t.id);
			}
			if(self.renderTimes > 0) {
				console.log("resetting render");
				self.renderTimes --;
				self.haveRendered = -self.renderInterval;
			} else {
				self.haveRendered = 1;
			}
		});
	}
});
