console.log('huhu');
var FRAMERATE = 25;
// Determine Accuracy of tracking
var FRAME_STEP = 2;
// set playback speed for easier tracking
var PLAYBACK_RATE = 0.5;

// standard object id, maybe dynamic later
var OBJECT_ID = 10;

// buffers for mouseactions
var mouseDown = false;
var mouseX = -1;
var mouseY = -1;

var trackpoints;

// tracking object
function TrackPoint(x1, y1, frame, object_id) {
	this.x1 = x1;
	this.y1 = y1;
	this.frame = frame;
	this.object_id = object_id;

	this.toString = toString;
	function toString() {
		return "TrackPoint " + x1 + "," + y1 + "," + frame + "," + object_id;
	}

	function toXML() {
		return '<frame id="'+frame+'"><BoundingBox id="'+object_id+'"><Min Y="'+(y1-20)+'" X="'+(x1-20)+'" />'
		+'<Max Y="'+(y1+20)+'" X="'+(x1+20)+'" /></BoundingBox></frame>';
	}
}

$(document).ready(
		function() {

			document.onmousedown = function () {
				mouseDown = true;
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

			pop.playbackRate(PLAYBACK_RATE);

			var media_duration = pop.duration()*FRAMERATE;
			trackpoints = new Array(media_duration/2);

			for (var i = 0; i < media_duration; i = i + FRAME_STEP){
				pop.code({
					start: i,
					onStart: if (mouseDown) {
						var x1 = mouseX;
						var y1 = mouseY;
						trackpoints.append(new Trackpoint(x1,y1,i,OBJECT_ID));
						var canvas = document.getElementById('marker_canvas');
						if (canvas.getContext) {
							var context = canvas.getContext('2d');
							// Erase canvas
							context.canvas.height = context.canvas.height;
							context.fillStyle = 'rgba(127,127,127,0.4)';
							context.fillRect(x1-5, y1-5, x1+5, y1+5);
						}

					}
					else {
						var canvas = document.getElementById('marker_canvas');
						if (canvas.getContext) {
							var context = canvas.getContext('2d');
							// Erase canvas
							context.canvas.height = context.canvas.height;
						}
					}

				}
			});

		}

	});
