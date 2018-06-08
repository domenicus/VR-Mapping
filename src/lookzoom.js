"use strict";
AFRAME.registerComponent("lookzoom", {
    tick: function() {
        var rot = document.getElementById("camera").getAttribute("rotation");
        var camera = document.getElementById("camera");
        var moveobj = document.getElementById("map-surface");
        var pos = moveobj.getAttribute("position");
        switch(this.state) {
            case 2:
                if(this.ticksStable < 40) {
                    // when zoomed, rotational motion zooms out.
                    this.state = 1;
                    this.target.z = -5;
                    this.nextState = 0;
                    break;
                } // end of state transitions
                pos.z = -2;
                break;
            case 0: 
                if(this.ticksStable > 40) { // steady look
                    this.state = 1;
                    if(Math.abs(rot.y%360) > 10 || Math.abs(rot.x%360) > 15) {
                        // ^ read as "if user looking at angle from map"
                        // trig to figure out _how_ sideways the user is looking
                        this.target.x = pos.x+Math.atan(rot.y/180*Math.PI)*2;
                        this.target.y = pos.y-Math.atan(rot.x/180*Math.PI)*2;
                        this.nextState = 0; // once we get there, we'll be zoomed out.
                        this.target.z = -5;
                    } else {
                        // ^ if the user is looking directly at map
                        this.target.z = -2;
                        this.nextState = 2;
                    }
                    break;
                } // end of state transitions
                pos.z = -5;
                break;
            case 1:
                if(this.interp_t > 1) { // reset at completed motion
                    this.state = this.nextState;
                    this.interp_t = 0;
                    this.delta = 0;
                    this.oldrot.x = rot.x;
                } else { // continuting motion
                    this.logisticinterp(
                            this.interp_t, this.oldpos, this.target, pos);
                    this.interp_t += 1/60; // 1-second transition;
                }
                break;
            default:
                state = 0;
                break;
        }
        // make sure changes to the object's position are written back
        moveobj.setAttribute("position", pos.x+" "+pos.y+" "+pos.z);
        // add the new change in rotation to the running tally
        this.delta += Math.abs(this.oldrot.x-rot.x);
        this.oldrot.x = rot.x;
        // tally decays
        this.delta /= 2;
        if(this.delta < ((this.state==2)?4e-1:8e-2)) {
            // if the tally is below a certain level, the camera is considered stable.
            // that level is higher (less sensitive) when we're zoomed in.
            this.ticksStable ++;
        } else {
            // otherwise, it is unstable
            this.ticksStable = 0;
        }
        // make sure we track the previous position, too
        this.oldpos.x = pos.x;
        this.oldpos.y = pos.y;
        this.oldpos.z = pos.z;
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
    state: 0, // 0 = looking, 1 = animation playing to zoom in, 2 = zoomed in
    nextState: 0, // state that will be occupied after the animation
    delta: 50, // tracks running amount of look-angle movement
    oldrot: {x:0, y:0, z:0},
    oldpos: {x:0, y:0, z:0}, // previous frame's rotation and position
    target: {x:0, y:0, z:0}, // target of motion
    ticksStable: 0, // number of frames the camera has been stable
    interp_t: 0 // interpolation counter -- this is used to make smooth animation.
});

