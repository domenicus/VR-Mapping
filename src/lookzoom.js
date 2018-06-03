oldX = 0;
delta = 64;
ticksStable = 0;
target = {x:0, y:0, z:0};
oldpos = {x:0, y:0, z:0};
moving = false;
interpT = 0;
motionDecay = 2;
AFRAME.registerComponent("lookzoom", {
    tick: function() {
        var rot = document.getElementById("camera").getAttribute("rotation");
        var camera = document.getElementById("camera");
        var moveobj = document.getElementById("map-surface");
        var pos = moveobj.getAttribute("position");
        if(moving) {
            if(interpT > 1) { // reset at completed motion
                moving = false;
                interpT = 0;
                delta = 0;
                oldX = rot.x;
            } else { // continuting motion
                logisticinterp(interpT, oldpos, target, pos);
                interpT += 1/60; // 1-second transition;
                moveobj.setAttribute("position", pos.x+" "+pos.y+" "+pos.z);
                return;
            }
        }
        delta += Math.abs(oldX-rot.x);
        oldX = rot.x;
        delta /= motionDecay;
        motionDecay = 2;
        //console.log(delta);
        if(delta < 8e-2) {
            ticksStable ++;
        } else {
            ticksStable = 0;
        }
        if(ticksStable > 40) {
            if(Math.abs(rot.y%360) > 10 || Math.abs(rot.x%360) > 15) {
                target.x = pos.x+Math.atan(rot.y/180*Math.PI)*2;
                target.y = pos.y-Math.atan(rot.x/180*Math.PI)*2;
                target.z = -5;
                ticksStable = 0;
                moving = true;
            } else {
                if(target.z != -2) {
                    moving = true;
                }
                motionDecay = 16; // increase dwell time when zoomed
                target.z = -2;
            }
        } else {
            if(target.z != -5) {
                moving = true;
            }
            target.z = -5;
        }
        oldpos.x = pos.x;
        oldpos.y = pos.y;
        oldpos.z = pos.z;

    }
});

// check the wikipedia for 'logistic curve' for the math background
// t is the parameter for where on the curve to return; vary it from 0
// to get the initial position to 1 to get the final position.
// returns by manipulating out
function logisticinterp(t, start, fin, out) {
    var m = 1/(1+80*Math.exp(-10*t));
    var im = 1-m;
    out.x = start.x*im + fin.x*m;
    out.y = start.y*im + fin.y*m;
    out.z = start.z*im + fin.z*m;
}
