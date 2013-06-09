console.log('huhu');
var FRAMERATE = 25;
// Determine Accuracy of tracking
var FRAME_STEP = 2;
// set playback speed for easier tracking
var PLAYBACK_RATE = 0.3;

// standard object id, maybe dynamic later
var OBJECT_ID = 10;

// the object that is currently worked on
var current_trackobject_index = 0;

var trackobjects = [];

// buffers for mouseactions
var mouseDown = false;
var mouseX = -1;
var mouseY = -1;

// object
function TrackObject(title, description, author, link, thumb) {
	this.trackpoints = [];
	this.title = title;
	this.description = description;
	this.author = author;
	this.link = link;
	this.thumb = thumb;

	this.toXML = toXML;
	
	function toXML(object_id) {
		return '<link object="' + object_id + '" dest="' + this.link + '">'
				+ '<title>' + this.title + '</title>' + '<author>'
				+ this.author + '</author>' + '<image>' + this.thumb
				+ '</image>' + '<description>' + this.description
				+ '</description>' + '</link>';
	}
}

// tracking point
function TrackPoint(x1, y1, frame) {
	console.log("creating TrackPoint");
	this.x1 = x1;
	this.y1 = y1;
	this.frame = frame;

	this.toString = toString;
	this.toXML = toXML;

	function toString() {
		return "TrackPoint " + x1 + "," + y1 + "," + frame;
	}

	function toXML(object_id) {
		return '<frame id="' + frame + '"><BoundingBox id="' + object_id
				+ '"><Min Y="' + (y1 - 40) + '" X="' + (x1 - 40) + '" />'
				+ '<Max Y="' + (y1 + 40) + '" X="' + (x1 + 40)
				+ '" /></BoundingBox></frame>';
	}
	console.log("finished creating TrackPoint");

}

$(document).ready(function() {

	document.onmousedown = function() {
		mouseDown = true;
		// console.log("mousedown");
	};

	document.onmouseup = function() {
		mouseDown = false;
	};

	document.onmousemove = function(event) {
		mouseX = event.pageX;
		mouseY = event.pageY;
	};

	trackobjects.push(new TrackObject('title', 'description', 'author', 'link', 'thumb'));
	current_trackobject_index = 0;
	update_ui();
	$("#object_data #object_name").change(function(){
		trackobjects[current_trackobject_index].title = $("#object_data #object_name").val();
		update_ui();
	});
	$("#object_data #object_author").change(function(){
		trackobjects[current_trackobject_index].author = $("#object_data #object_author").val();
		update_ui();
	});
	$("#object_data #object_description").change(function(){
		trackobjects[current_trackobject_index].description = $("#object_data #object_description").val();
		update_ui();
	});
	$("#object_data #object_link").change(function(){
		trackobjects[current_trackobject_index].link = $("#object_data #object_link").val();
		update_ui();
	});
	$("#object_data #object_image").change(function(){
		trackobjects[current_trackobject_index].thumb = $("#object_data #object_image").val();
		update_ui();
	});
	
	
	// create popcorn instance
	pop = Popcorn("#video", {
		frameAnimation : true,
		frameRate : FRAMERATE
	});

	pop.play();

	pop.cue(1, function() {
		console.log(this.duration());
		this.pause(0);
		this.playbackRate(PLAYBACK_RATE);
		var duration = this.duration();
		this.destroy();
		prepare_trackpoints(duration);
	});

});

function update_ui(){
	var object = trackobjects[current_trackobject_index];
	$("#object_data #object_name").val(object.title);
	$("#object_data #object_author").val(object.author);
	$("#object_data #object_description").val(object.description);
	$("#object_data #object_link").val(object.link);
	$("#object_data #object_image").val(object.thumb);
	
	$("#object_list").empty().append('<li class="nav-header">Traced Objects</li>');
	
	$.each(trackobjects, function(object_index, value) {
		console.log('update_ui '+object_index);
		if (object_index == current_trackobject_index) $("#object_list").append('<li class="active"><a href="#">'+value.title+'</a></li>');
		else $("#object_list").append('<li><a onclick="select_object('+object_index+');" href="#">'+value.title+'</a></li>');		
	});
	
	$("#object_list").append('<li class="divider"></li><li><a onclick="add_object();" href="#">add a new object</a></li>');
}

function select_object(object_index){
	current_trackobject_index = object_index;
	update_ui();
}

function add_object(){
	console.log("add object");
	trackobjects.push(new TrackObject('title', 'description', 'author', 'link', 'thumb'));
	current_trackobject_index++;
	update_ui();
}

function prepare_trackpoints(media_duration) {
	// create popcorn instance
	pop = Popcorn("#video", {
		frameAnimation : true,
		frameRate : FRAMERATE
	});

	media_duration_frames = media_duration * FRAMERATE;
	trackpoints = [];

	for ( var i = 0; i < media_duration_frames; i = i + FRAME_STEP) {
		// console.log("giving cues");
		pop.cue(i / FRAMERATE, create_trackpoint);

	}

}

function create_trackpoint(options) {
	// console.log("called create_trackpoint");
	if (mouseDown) {
		console.log("cueMouseDown");
		var video_offset = $("#video").offset();
		var x1 = Math.floor(mouseX-video_offset.left);
		var y1 = Math.floor(mouseY-video_offset.top);
		var tp = new TrackPoint(x1, y1, Math.floor(this.currentTime()*FRAMERATE), OBJECT_ID);
		console.log(tp.toXML());
		trackobjects[current_trackobject_index].trackpoints.push(tp);
		var canvas = document.getElementById('marker_canvas');
		if (canvas.getContext) {
			var context = canvas.getContext('2d');
			// Erase canvas
			// context.canvas.height = context.canvas.height;
			context.fillStyle = 'rgba(127,127,127,0.4)';
			context.fillRect(x1 - 5, y1 - 5, 10, 10);
		}

	} else {
		console.log("cueMouseUp");
		var canvas = document.getElementById('marker_canvas');
		if (canvas.getContext) {
			var context = canvas.getContext('2d');
			// Erase canvas
			// context.canvas.height = context.canvas.height;
		}
	}
}

function save_xml() {
	console.log("print_xml called");
	var output_xml = '<?xml version="1.0" encoding="utf-8"?><nle_data><links>';
	$.each(trackobjects, function(object_index, value) {
		output_xml = output_xml + value.toXML(object_index);
	});

	output_xml = output_xml + '</links><frames>';

	$.each(trackobjects, function(object_index, value) {
		$.each(value.trackpoints, function(index, value) {
			output_xml = output_xml + value.toXML(object_index);
		});
	});
	output_xml = output_xml + '</frames></nle_data>';
	//console.log(output_xml);
	$.post("create_xml_file.php",{data: output_xml},function(data){
		console.log("Data was saved successfully");
	});
}