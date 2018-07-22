"use strict";
AFRAME.registerComponent("planetarium", {
    dependencies: ["laser-controls"],
    /**
     * We require a laser-controls so the user can choose photos
     * from the constellation.
     **/
    schema: {
        images: {type:"array"}, // holds the IDs of the image assets
        radius: {type: "number", default: 5}
    },
    init: function() {
        var imageIds = this.data.images;
        var images = [];
        var panels = [];
        var scene = document.querySelector("a-scene");
        var width = Math.ceil(Math.sqrt(imageIds.length));
        var radius = this.data.radius; // r=20 meter dome
        for(var i = 0; i < imageIds.length; i++) {
            images[i] = document.querySelector("#"+imageIds[i]);
            panels[i] = document.createElement("a-entity"); // panel
            scene.appendChild(panels[i]);
            panels[i].setAttribute("material", "src", "#"+imageIds[i]);
            panels[i].setAttribute("geometry", "primitive", "plane");
            // For the following lines, note >>0 is a faster, more compatible
            // version of 'trunc' (know as integer division in most languages)
            // and the trig functions are for 'spherical coordinates' (see
            // Wikipedia for details). Note that we are in the 
            // polar angle > pi/2 hemisphere.
            var phi = (i/width>>0)/(width)*Math.PI/2+Math.PI/2;
            var theta = (1+(i%width+1)/(width+1))*Math.PI/2;
            console.log(i, theta, phi, (i%width), (i%width)/width);
            console.log(width);
            panels[i].setAttribute("position", {
                    z:radius*Math.sin(theta)*Math.cos(phi), 
                    x:radius*Math.sin(theta)*Math.sin(phi), 
                    y:-radius*Math.cos(theta)});
            panels[i].setAttribute("rotation", {
                    z:0, 
                    y:phi*180/Math.PI, 
                    x:theta*180/Math.PI/4+90});
            var p = panels[i];
            p.setAttribute('geometry','width',2);
            p.setAttribute('geometry','height',1.25);
            panels[i].setAttribute('larger', false);
            panels[i].addEventListener('mousedown',function(evt){
                this.setAttribute('geometry','width',8);
                this.setAttribute('geometry','height',5);
                var t = this.getAttribute("position");
                this.setAttribute("position", {x:t.x*1.3, y:t.y*1.3, z:t.z*1.3});
            });
        }
        console.log(images);
        console.log(panels);
        this.panels = panels;
    },
    tick: function() {

    },
    panels: null
});

