"use strict";
AFRAME.registerComponent("rotationinterruptor", {
	workingquat: new THREE.Quaternion(),
	workingscale: new THREE.Vector3(),
	workingpos: new THREE.Vector3(),
	workingmat: new THREE.Matrix4(),
	init: function initRotationInterruptor() {
		var el = this.el;
		var self = this;
		var obj = el.object3D;

		obj.updateMatrixWorld = function(force) {
			//console.log("Gotcha");
			if(this.matrixAutoUpdate) this.updateMatrix();
			if(this.parent === null) {
				this.matrixWorld.copyPosition(this.matrix);
			} else {
				this.parent.matrixWorld.decompose(self.workingpos, self.workingquat, self.workingscale);
				self.workingquat.set(1, 0, 0, 0);
				self.workingmat.compose(self.workingpos, self.workingquat, self.workingscale);
				this.matrixWorld.multiplyMatrices(self.workingmat,
						this.matrix);
			}
			var children = this.children;
			for ( var i = 0, l = children.length; i < l; i ++ ) {
				children[ i ].updateMatrixWorld(force);

			}
		};
	},
	i: 0,
	tick: function tickRotationInterruptor() {
		/*
		var el = this.el;
		var obj = el.object3D;
		//obj.matrixWorld.copyPosition(el.parentNode.object3D.matrixWorld);
		el.parentNode.object3D.matrixWorld.decompose(this.workingpos, 
				this.workingquat,this.workingscale);
		this.workingquat.set(1, 0, 0, 0);
		obj.matrixWorld.compose(this.workingpos, 
				this.workingquat,this.workingscale);
		if((this.i++)%100 == 0) {
			console.log(obj.matrixAutoUpdate);
			console.log(el.parentNode.object3D.matrixWorld);
			console.log(obj.matrixWorld);
		}
		*/
	}
});

