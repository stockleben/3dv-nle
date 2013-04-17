console.log('huhu');
var FRAMERATE = 25;
var box;
//var empty_box = new BoxObject(0, 0, 0, 0, null, 0);
var dragging_box;
var dragging = false;
box = null;

$(document).ready(
		function() {

			// $('#markers').disableSelection();

			// create popcorn instance
			pop = Popcorn("#video", {
				frameAnimation : true,
				frameRate : FRAMERATE
			});
			// var pop = Popcorn( "#video", { frameRate: FRAMERATE } );
			links = new Object();
			// var $frames = new Object();

			$.get('res/test.xml', function(data) {
				parseFrames(data);
			});

			$("#canvas_div").mousedown(
					function(e) {
						if (box != null){
						var action = box.isInside(e.pageX, e.pageY);
						document.getSelection().removeAllRanges();
						$('#position').html(
								e.pageX + ', ' + e.pageY + "isInside:" + action
										+ "<br/>" + box.toString());
						if (action) {
							dragging_box = box.getCopy();
							dragging = true;

							$('#canvas_div').css('cursor', 'pointer');
							$('#markers').css('cursor', 'pointer');
						}
						}
					});

			$("#canvas_div").mouseup(function(e) {
				if (dragging && dragging_box != null) {
					pop.pause();
					window.open(box.link);
				}
				dragging = false;
				dragging_box = null;
				$('#canvas_div').css('cursor', 'default');
				$('#markers').css('cursor', 'default');
			});

			$("#markers").mouseup(
					function(e) {
						if (dragging && dragging_box != null) {
							$('#markers').append(
									'<br/><a href="' + dragging_box.link
											+ '" target="_blank">'
											+ dragging_box.link + '</a>');
						}
						dragging = false;
						dragging_box = null;
						$('#canvas_div').css('cursor', 'default');
						$('#markers').css('cursor', 'default');
					});
		})

function BoxObject(x1, y1, x2, y2, link, link_id) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.link = link;
	this.link_id = link_id;

	this.isInside = isInside;
	function isInside(x, y) {
		return (this.x1 < x) && (x < this.x2) && (this.y1 < y) && (y < this.y2);
	}

	this.toString = toString;
	function toString() {
		return "BoxObject " + x1 + "," + y1 + "," + x2 + "," + y2 + " link:"
				+ link + " link_id:" + link_id;
	}

	this.getCopy = getCopy;
	function getCopy() {
		return new BoxObject(this.x1, this.y1, this.x2, this.y2, this.link,
				this.link_id);
	}
}

function parseFrames(xml) {
	console.log("parseFrames");
	// var count = 3;

	$(xml).find('links > link').each(function() {
		console.log("link gefunden:" + $(this).attr('dest'));
		var destination = $(this).attr('dest');
		var link_id = $(this).attr('object');
		links[link_id] = destination;
	});

	// process single frames as jQuery objects
	$(xml).find('frames > frame').each(
			function() {
				console.log(" frame:" + $(this).attr('id'));
				var index = $(this).attr('id');
				var $BoundingBox = $(this).find('BoundingBox');
				console.log("BoundingBox:" + $BoundingBox.length);
				// <area shape="rect" coords="11,10,59,29"
				// href="http://www.koblenz.de/"
				// alt="Koblenz" title="Koblenz">
				// $('')
				if ($BoundingBox.length == 0) {
					pop.code({
						start: index / FRAMERATE,
						onStart : function(options){
							box = null;
							$('#timeline').empty();
							var canvas = document.getElementById('linkcanvas');
							if (canvas.getContext) {
								var context = canvas.getContext('2d');
								// Erase canvas
								context.canvas.height = context.canvas.height;
							}
						}
					});
				} else {

					pop.code({
						start : index / FRAMERATE,
						onStart : function(options) {
							// $('#linkmap').empty();
							var object_id = $BoundingBox.attr('id');
							var destination = links[object_id];

							var x1 = $BoundingBox.find("Min").attr("X");
							var y1 = $BoundingBox.find("Min").attr("Y");
							var x2 = $BoundingBox.find("Max").attr("X");
							var y2 = $BoundingBox.find("Max").attr("Y");
							box = new BoxObject(x1, y1, x2, y2, destination,
									object_id);
							// var coordinates = x1+','+y1+','+x2+','+y2;
							// var area_html = '<area shape="rect"
							// coords="'+coordinates+'" href="'+destination+
							// '"alt="'+object_id+'" title="'+object_id+'"/>';
							$('#timeline').html(
									"<a href='" + destination + "'>"
											+ destination + index + "</a>");
							// $('#linkmap').html(area_html);

							var canvas = document.getElementById('linkcanvas');
							if (canvas.getContext) {
								var context = canvas.getContext('2d');
								// Erase canvas
								context.canvas.height = context.canvas.height;
								context.fillStyle = 'rgba(127,255,127,0.5)';
								context.fillRect(x1, y1, x2 - x1, y2 - y1);
							}

							console.log("index:" + index);
						}
					});
				}// end else
			});
	console.log('parseFrames end');
};

console.log('hihi');

/*
 * 
 * pop.timeline({ start: 1, target: "timeline", title: "This is a title", text:
 * "this is some interesting text that goes inside", innerHTML: "Click here for
 * <a href='http://www.google.ca'>Google</a>" , direction: "up" }) .timeline({
 * start: 2, target: "timeline", title: "double as interesting", text: "this is
 * some interesting text that goes inside", innerHTML: "Maybe a button? <button
 * onClick=\"window.location.href='http://www.google.com'\">Click Me</button>",
 * direction: "up" }) .timeline({ start: 4, end: 700, target: "timeline", title:
 * "3x as interesting", text: "this is some interesting text that goes inside",
 * innerHTML: "", direction: "up" }); console.log("haha"); // play video
 * //pop.play();
 */