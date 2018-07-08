"use strict";
AFRAME.registerComponent("voices", {
    dependencies: ["raycaster"],
    /* ^ We require a raycaster component, so that we can test what the user
     * is looking at by seeing what the 'ray' intersects with.
     **/
    parsed: null,
    totalloaded: false,
    playing: null,
    playing_id: -1,
    init: function() {
        /* Setup call. */
        var outer = this;
        document.getElementById("mapFileLoad").addEventListener("change",
            function(e) {
                var file = this.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
                    outer.totalloaded = true;
                    outer.parsed = JSON.parse(e.target.result);
                    console.log(outer.parsed);
                    document.querySelector("#map-surface").
                        setAttribute("material", "src", "url("+outer.parsed.image+")");
                    outer.parsed = outer.parsed.list;
                }
                reader.readAsText(file);
            });

        //var mapped = JSON.parse();
    },
    tick: function() {
        if(!this.totalloaded)return;
        var intersections = this.el.components.raycaster.intersections;
        if(intersections.length <= 0) {
            return;
        }
        var x = intersections[0].uv.x;
        var y = 1-intersections[0].uv.y;
        for(var i = 0; i < this.parsed.length; i++) {
            var a = this.parsed[i];
            if(a.x < x && a.y < y && a.lx > x && a.ly > y) {
                console.log("picked ", i);
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

