console.log('huhu');
var FRAMERATE = 25;
// Determine Accuracy of tracking
var FRAME_STEP = 2;
// set playback speed for easier tracking
var PLAYBACK_RATE = 0.3;
// set size of hotspot area in pixel
var HOTSPOT_SIZE = 100;

// standard object id, maybe dynamic later
var OBJECT_ID = 10;

// the currently handled video
var current_video_url = "res/quergelesen.m4v";

// the object that is currently worked on
var current_trackobject_index = 0;

var current_demo = 1;

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
	//console.log("creating TrackPoint");
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
				+ '"><Min Y="' + (y1 - HOTSPOT_SIZE) + '" X="' + (x1 - HOTSPOT_SIZE) + '" />'
				+ '<Max Y="' + (y1 + HOTSPOT_SIZE) + '" X="' + (x1 + HOTSPOT_SIZE)
				+ '" /></BoundingBox></frame>';
	}
	//console.log("finished creating TrackPoint");

}

$(document).ready(function() {
	console.log("document loaded.");
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

	$("#demo1 a").click(function(){change_demo(1);});
	$("#demo2 a").click(function(){change_demo(2);});
	$("#demo3 a").click(function(){change_demo(3);});
	
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
	
	$("#source_video_url").change(function(){
		set_current_video($("#source_video_url").val());
		update_ui();
	});	
	
	init_video();
});

function init_video(){
	console.log("calling restore_xml()");
	restore_xml();	
	
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
}

function update_ui(){
	var object = trackobjects[current_trackobject_index];
	$("#object_data #object_name").val(object.title);
	$("#object_data #object_author").val(object.author);
	$("#object_data #object_description").val(object.description);
	$("#object_data #object_link").val(object.link);
	$("#object_data #object_image").val(object.thumb);
	$("#source_video_url").val(current_video_url);
	
	$("#object_list").empty().append('<li class="nav-header">Traced Objects</li>');
	
	$.each(trackobjects, function(object_index, value) {
		console.log('update_ui '+object_index);
		if (object_index == current_trackobject_index) $("#object_list").append('<li class="active"><a href="#">'+value.title+'</a></li>');
		else $("#object_list").append('<li><a onclick="select_object('+object_index+');" href="#">'+value.title+'</a></li>');		
	});
	
	$("#object_list").append('<li class="divider"></li><li><a onclick="add_object();" href="#"><i class="icon-plus"></i> add a new object</a></li>');
}

function set_current_video(video_url){
	current_video_url = video_url;
	$("#video").attr("src",video_url);
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

// removes the currently selected object
function remove_object(){
	if (trackobjects.length > 1){
		trackobjects.splice(current_trackobject_index,1);
		current_trackobject_index = 0;
		update_ui();
	}
}

function remove_tracking_data(){
	trackobjects[current_trackobject_index].trackpoints = [];
	clear_canvas();
	update_ui();
}

function change_demo(number){
	current_demo = number;
	$("#demolist li").removeClass("active");
	$("#demolist li").eq(current_demo-1).addClass("active");
	init_video();
	
}

function prepare_trackpoints(media_duration) {
	// create popcorn instance
	pop = Popcorn("#video", {
		frameAnimation : true,
		frameRate : FRAMERATE
	});

	media_duration_frames = media_duration * FRAMERATE;

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
	var output_xml = '<?xml version="1.0" encoding="utf-8"?><nle_data url="'+current_video_url+'"><links>';
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
	$.post("create_xml_file.php",{filename: 'tracedata'+current_demo+'.xml', data: output_xml},function(data){
		console.log("Data was saved successfully");
	});
}

function restore_xml() {
	console.log("started restore_xml()");
	trackobjects = [];
	current_trackobject_index = 0;
	$.get('tmp/tracedata'+current_demo+'.xml', function(data) {
		console.log(data);
		console.log("Restoring XML.");
		parseXML(data);
		update_ui();
	}).error(function(){
		console.log("Failed to restore XML.");
		trackobjects.push(new TrackObject('title', 'description', 'author', 'link', 'thumb'));
		update_ui();
	});

}

function parseXML(xml) {
	console.log("parseXML");
	// var count = 3;

	set_current_video($(xml).find('nle_data').first().attr('url'));
	
	$(xml).find('links > link').each(
			function() {
				console.log("link gefunden:" + $(this).attr('dest'));
				var link = $(this).attr('dest');
				var object_id = $(this).attr('object');
				var title = $(this).find('title').text();
				var author = $(this).find('author').text();
				var thumb = $(this).find('image').text();
				var description = $(this).find('description').text();

				trackobjects.push(new TrackObject(title, description, author, link, thumb));
			});

	// process single frames as jQuery objects
	$(xml).find('frames > frame').each(
			function() {
				var frame_index = $(this).attr('id');
				var $BoundingBox = $(this).find('BoundingBox');
				// console.log("BoundingBox:" + $BoundingBox.length);
				// <area shape="rect" coords="11,10,59,29"
				// href="http://www.koblenz.de/"
				// alt="Koblenz" title="Koblenz">
				// $('')
				if ($BoundingBox.length === 0) {
					// ignore bounding box if it is empty
				} else {
							var object_id = $BoundingBox.attr('id');
							var trackpoints = trackobjects[object_id].trackpoints;
							// revert box calculations
							var x = parseInt($BoundingBox.find("Min").attr("X"))+HOTSPOT_SIZE;
							var y = parseInt($BoundingBox.find("Min").attr("Y"))+HOTSPOT_SIZE;
							var tp = new TrackPoint(x, y, frame_index);
							trackpoints.push(tp);
					}// end else
			});
	console.log('parseXML end');
}

function clear_canvas(){
	var canvas = document.getElementById('marker_canvas');
	if (canvas.getContext) {
		var context = canvas.getContext('2d');
		// Erase canvas
		context.canvas.height = context.canvas.height;
	}

}