/* This piece of code displays an image, then lets a user map a ghostly
 * voice onto it. The resulting data can be exported to a file.
 *
 * Expects:
 * A HTML canvas with ID #mapperCanvas
 * A HTML image with ID #mapperImage
 **/
var voices_mapper = {
    meta: null,
    image_name: "bad",
    init:
function voices_mapper_loadimage() {
    var image_upload = document.getElementById("mapperImageUpload");
    var image = document.getElementById("mapperImage");
    var image_upload_box = document.getElementById("mapperImageUploadBox");
    var outer = this;

    image_upload.addEventListener("change", function(e) {
        if(!this.files || !this.files[0]) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
            outer.image_url = e.target.result;
            image.onload = function() {outer.main()};
            image_upload_box.style.display = "none";
        }
		outer.image_name = this.files[0].name;
        reader.readAsDataURL(this.files[0]);
    });

    // Handle multiDB:
    var self = this;
    var dbsearchbar = document.getElementById("mapperDBSearchbar");
    var restable = document.getElementById("mapperDBResultsTable");
    dbsearchbar.addEventListener("keyup", function(e) {
	    if(e.keyCode != 13) {
		    return;
	    }
	    // Clear search results:
	    while(restable.firstChild) restable.removeChild(restable.firstChild);
	    var dbswitch = document.getElementById("mapperDBSwitch");
	    var querystring = encodeURI(dbsearchbar.value);
	    switch(dbswitch.value) {
	    case "wdl": 
		    self.handleWDL(restable, querystring);
		    break;
	    case "rumsey":
		    self.handleLUNA(restable, querystring, true);
		    break;
	    case "jcb":
		    self.handleLUNA(restable, querystring, false);
		    break;
	    default:
		    alert("That database is not implemented.");
	    }
    });
},
    // LUNA import:
handleLUNA:
function handleLUNA(restable, querystring, isrumsey) {
    var outer = this;
    var image_upload_box = document.getElementById("mapperImageUploadBox");
    var image = document.getElementById("mapperImage");
    var http = new XMLHttpRequest();
    var url;
    if(isrumsey) {
	    url = "http://www.davidrumsey.com/luna/servlet/as/fetchMediaSearch";
    } else {
	    url = "https://jcb.lunaimaging.com/luna/servlet/as/fetchMediaSearch";
    }
    var params = "&sort=Pub_List_No_InitialSort%2CPub_Date%2CPub_List_No%2CSeries_No&lc=RUMSEY%7E8%7E1&fullData=true&bs=25&random=true&os=0";
    http.open(isrumsey?"GET":"POST", url+'?'+"&q="+querystring+params, true);
    http.onreadystatechange = function(e) {
	    var resp = http.response;
	    var back;
	    try {
		    back = JSON.parse(resp);
	    } catch(e) {
		    return;
	    }
	    var tab = restable;
	    var hidcan = document.createElement("canvas");
	    for(var i in back) {
		    i = back[i];
		    var el = document.createElement("tr");
		    var a = document.createElement("td");
		    var b = document.createElement("td");
		    var act = document.createElement("a");
		    //console.log(i);
		    var attr = JSON.parse(i.attributes);
		    act.onclick = function(e) {
			    image_upload_box.style.display = "none";
			    image.crossOrigin = "Anonymous";
			    image.src = "https://cors-anywhere.herokuapp.com/"+i.urlSize4.replace("https", "http"); // CORS
			    image_upload_box.appendChild(hidcan);
			    image.onload = function() {
				outer.main()
				hidcan.width = image.naturalWidth;
				hidcan.height = image.naturalHeight;
				hidcan.getContext('2d').drawImage(image, 0, 0);
				outer.image_url = hidcan.toDataURL('image/png');
				console.log(outer.image_url);
			    };
			    outer.meta = attr;
		    };
		    act.style.color = "blue";
		    act.innerHTML = i.displayName;
		    b.innerHTML = attr.pub_note;
		    a.appendChild(act);
		    el.appendChild(a);
		    el.appendChild(b);
		    tab.appendChild(el);
	    }
    };
    http.send(null);
},
    handleWDL:
function handleWDL(restable, querystring, page) {
    var self = this;
    if(!page) page = 1;
    var req = new XMLHttpRequest();
    if(page > 1) {
	    var query = "https://www.wdl.org/en/search/?q="+querystring+"&qla=en&page="+page;
	    req.open("GET", "https://cors-anywhere.herokuapp.com/"+query.replace("https", "http"));
	    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    } else {
	    req.open("GET", "https://www.wdl.org/en/search/?q="+querystring+"&qla=en");
    }
    req.onreadystatechange = function() {
	    if(req.readyState != 4) {
		    return;
	    }
	    if(req.status != 200) {
		    alert("WDL API failed with error "+req.status);
	    }
	    // OK, think we have a good request
	    // start parsing the WDL search page for what we want:
	    var searchres = req.responseXML;
	    var listel = searchres.getElementById("search-results");
	    listel = listel.children[0];
	    // iterate over entries:
	    for(var entry in listel.children) {
		    entry = listel.children[entry];
		    if(!entry.querySelector) continue; // ignore spare junk
		    var title = entry.querySelector("[itemprop=name]")
			    .innerHTML;
		    var desc = entry.querySelector("[itemprop=description]")
			    .innerHTML;
		    var id = entry.id;
		    console.log(entry);
		    var newlinkel = document.createElement("a");
		    var newtitleel = document.createElement("td");
		    var newdescel = document.createElement("td");
		    var newrowel = document.createElement("tr");
		    newlinkel.href = "";
		    newlinkel.onclick = self.loadIIIF.bind(self, "wdl", id);
		    newlinkel.innerHTML = title;
		    newdescel.innerHTML = desc;
		    newrowel.appendChild(newtitleel);
		    newrowel.appendChild(newdescel);
		    newtitleel.appendChild(newlinkel);
		    restable.appendChild(newrowel);
	    }
	    var nextrow = document.createElement("tr");
	    var nextcel = document.createElement("td");
	    var nextlink = document.createElement("a");
	    nextlink.href="-";
	    nextlink.innerHTML = "Load More"
	    nextlink.onclick = function(e) {
		    e.preventDefault();
		    restable.removeChild(nextrow);
		    self.handleWDL(restable, querystring, page+1);
	    };
	    nextrow.appendChild(nextcel);
	    nextcel.appendChild(nextlink);
	    restable.appendChild(nextrow);
    };
    req.responseType = "document";
    req.send();
},
    loadIIIF:
function loadIIIF(endpoint, id, e) {
	e.preventDefault();
	var endstring = "/full/full/0/default.jpg";
	var startstring;
	switch(endpoint) {
	case "wdl":
		startstring = "https://content.wdl.org/iiif/";
		id += ",1,1"; // temporary: always use first volume and page.
		break;
	default:
		alert("Unimplemented endpoint: "+endpoint);
	}
	// bind is great
	this.image_url = startstring+id+endstring;
	var image = document.getElementById("mapperImage");
	image.src = this.image_url;
	image.onload = this.main.bind(this);
	var image_upload_box = document.getElementById("mapperImageUploadBox");
	image_upload_box.style.display = "none";
},
    main:
function voices_mapper() {
    var canvas = document.getElementById("mapperCanvas");
    var image = document.getElementById("mapperImage");
    var select_box = document.getElementById("mapperIdBox");
    var file_upload = document.getElementById("mapperFileUpload");
    var file_download = document.getElementById("mapperFileDownload");
    var ctx = canvas.getContext("2d");
    var act_list = []; // active area list
    var meta = this.meta;
    
    this.act_list = act_list;
    //rescaling!
    var redraw;
    var ratio = 0;
    var canvas_rect = canvas.getBoundingClientRect();
    function rescale() {
        canvas_rect = canvas.getBoundingClientRect();
        canvas.width = canvas.scrollWidth;
        canvas.height = canvas.scrollHeight;
        var xdiff = image.width / canvas.width;
        var ydiff = image.height / canvas.height;
        if(xdiff > ydiff) {
            // calculate ratio:
            ratio = canvas.width/image.width;
            xdiff = 0;
        } else {
            ratio = canvas.height/image.height;
            ydiff = 0;
        }
        redraw();
    }
    redraw = 
    function redraw() {
        ctx.drawImage(image, 0, 0, image.width*ratio, image.height*ratio);
        var i = 0;
        var area;
        for(area = act_list[i]; i < act_list.length; area=act_list[++i]) {
                ctx.beginPath();
                ctx.fillStyle = "rgba("+(140*i)%255+", "+(180*i)%255+
                    ", "+(195*(i+1))%255+", 0.3)";
                ctx.rect(uv_x_to_screen(area.x), uv_y_to_screen(area.y), 
                        uv_x_to_screen(area.lx-area.x), uv_y_to_screen(area.ly-area.y));
                ctx.fill();
                ctx.stroke();
                ctx.font = "20px Arial";
                ctx.fillStyle = "#000000";
                ctx.fillText(i, uv_x_to_screen(area.x)+2, uv_y_to_screen(area.y)+20);
                if(area.filename) {
                    ctx.font = "12px Arial";
                    ctx.fillText(area.filename,
                            uv_x_to_screen(area.x)+2, uv_y_to_screen(area.y)+30);
                }
        }
    };
    rescale();
    function uv_x_to_screen(x) {
        return x*image.width*ratio;
    }
    function uv_y_to_screen(y) {
        return y*image.height*ratio;
    }
    // Next, we can add code for drawing new active areas
    function handle_mouse(mode, e) {
        // mode is 0 for down, 1 for drag, 2 for up.
        var x = (e.clientX - canvas_rect.x)/ratio/image.width;
        var y = (e.clientY - canvas_rect.y)/ratio/image.height;
        switch(mode) {
            case 0:
                this.oldx = x;
                this.oldy = y;
                this.active = true;
                this.moved = false;
                break;
            case 1:
                if(this.active) {
                    this.moved = true;
                    redraw();
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(100, 240, 155, 0.3)";
                    ctx.rect(uv_x_to_screen(this.oldx), uv_y_to_screen(this.oldy), 
                            uv_x_to_screen(x-this.oldx), uv_y_to_screen(y-this.oldy));
                    ctx.fill();
                    ctx.stroke();
                }
                break;
            case 2:
                this.active = false;
                // Ignore clicks without a drag -- probably a mistake click.
                if(!moved)return;
                var temp ={x:this.oldx, y:this.oldy,lx:x,ly:y, file:null}; 
                var swap;
                if(temp.x > temp.lx) {
                    swap = temp.lx;
                    temp.lx = temp.x;
                    temp.x = swap;
                }
                if(temp.y > temp.ly) {
                    swap = temp.ly;
                    temp.ly = temp.y;
                    temp.y = swap;
                }
                act_list.push(temp);
                var opt = document.createElement("option");
                opt.appendChild(document.createTextNode(act_list.length-1));
                select_box.appendChild(opt);
                select_box.selectedIndex = act_list.length-1;
                file_upload.value=null;
                redraw();
                break;
            default:
        }
    }
    canvas.addEventListener("mousedown", function(e){handle_mouse(0, e);});
    canvas.addEventListener("mousemove", function(e){handle_mouse(1, e);});
    canvas.addEventListener("mouseup", function(e){handle_mouse(2, e);});
    // toolbar ID select detector:
    select_box.addEventListener("change", function(e) {
        file_upload.value=null;
    });
    // Audio file upload detect code:
    var oldsource = null;
    file_upload.addEventListener("change", function() {
        if(oldsource) {
            oldsource.stop();
        }
        var file_reader = new FileReader();
        var upfile = this.files[0];
        file_reader.onload = function(e) {
            // save the resulting huge dataURL
            act_list[select_box.selectedIndex].file = e.target.result;
            act_list[select_box.selectedIndex].filename = upfile.name;
            redraw();
            // also play it:
            file_reader.readAsArrayBuffer(upfile);
            file_reader.onload = function(e) {
                var aud_ctx = new window.AudioContext();
                aud_ctx.decodeAudioData(e.target.result, function(buff) {
                    var source = aud_ctx.createBufferSource();
                    source.buffer = buff;
                    source.loop = false;
                    source.connect(aud_ctx.destination);
                    source.start(0);
                    oldsource = source;
                });
            };
        }
        file_reader.readAsDataURL(this.files[0]);
    });
    // Download mapped file:
    var outer = this;
    file_download.addEventListener("click", function() {
        file_download.href = URL.createObjectURL(
            new Blob([JSON.stringify({meta: meta,list:act_list,image:outer.image_url})], 
                { type:"application/octet-stream" }));
        file_download.setAttribute("download", "data.mapped");
    });
	// Download just-filenames file
	var json_download = document.getElementById("mapperJSONDownload");
	var self = this;
	json_download.addEventListener("click", function() {
		console.log("light JSON");
		json_download.href = URL.createObjectURL(
            new Blob([JSON.stringify({meta: meta,list:act_list,image:outer.image_name})], 
                { type:"application/octet-stream" }));
        json_download.setAttribute("download", self.image_name+".json");
	});
}
};
window.addEventListener("load", function() {voices_mapper.init();});
