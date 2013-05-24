console.log('huhu');
var FRAMERATE = 25;
//Determine Accuracy of tracking
var FRAME_STEP = 2;
//set playback speed for easier tracking
var PLAYBACK_RATE = 0.3;

//standard object id, maybe dynamic later
var OBJECT_ID = 10;

//buffers for mouseactions
var mouseDown = false;
var mouseX = -1;
var mouseY = -1;

var trackpoints;

//tracking object
function TrackPoint(x1, y1, frame, object_id) {
	console.log("creating TrackPoint");
	this.x1 = x1;
	this.y1 = y1;
	this.frame = frame;
	this.object_id = object_id;

	this.toString = toString;
	this.toXML = toXML;
	
	function toString() {
		return "TrackPoint " + x1 + "," + y1 + "," + frame + "," + object_id;
	}

	function toXML() {
		return '<frame id="'+frame+'"><BoundingBox id="'+object_id+'"><Min Y="'+(y1-20)+'" X="'+(x1-20)+'" />'
		+'<Max Y="'+(y1+20)+'" X="'+(x1+20)+'" /></BoundingBox></frame>';
	}
	console.log("finished creating TrackPoint");
	
}

$(document).ready(
		function() {

			document.onmousedown = function () {
				mouseDown = true;
				console.log("mousedown");
			}

			document.onmouseup = function () {
				mouseDown = false;
			}

			document.onmousemove = function (event){
				mouseX = event.pageX;
				mouseY = event.pageY;
			}

			// create popcorn instance
			pop = Popcorn("#video", {
				frameAnimation : true,
				frameRate : FRAMERATE
			});

			pop.play();

			pop.cue( 2, function() {
				console.log( this.duration() );
				this.pause(0);
				this.playbackRate(PLAYBACK_RATE);
				var duration = this.duration();
				this.destroy();
				prepare_trackpoints(duration);
			});

		});

function prepare_trackpoints(media_duration){
	// create popcorn instance
	pop = Popcorn("#video", {
		frameAnimation : true,
		frameRate : FRAMERATE
	});

	media_duration_frames = media_duration*FRAMERATE
	trackpoints = new Array();
	
	for (var i = 0; i < media_duration_frames; i = i + FRAME_STEP){
		//console.log("giving cues");
		pop.cue(i/FRAMERATE, function(options) {
			if (mouseDown) {
				console.log("cueMouseDown");
				
				var x1 = mouseX;
				var y1 = mouseY;
				console.log("break 1");
				var tp = new TrackPoint(x1,y1,this.currentTime(),OBJECT_ID);
				console.log(tp.toXML());
				trackpoints.push(tp);
				console.log("break 2");
				var canvas = document.getElementById('marker_canvas');
				console.log("break 3");
				if (canvas.getContext) {
					console.log("break 4");
					var context = canvas.getContext('2d');
					// Erase canvas
					//context.canvas.height = context.canvas.height;
					context.fillStyle = 'rgba(127,127,127,0.4)';
					console.log("break 5");
					context.fillRect(x1-5, y1-5, 10, 10);
				}

			} else {
				console.log("cueMouseUp");
				var canvas = document.getElementById('marker_canvas');
				if (canvas.getContext) {
					var context = canvas.getContext('2d');
					// Erase canvas
					//context.canvas.height = context.canvas.height;
				}
			}
		});	

	}

}