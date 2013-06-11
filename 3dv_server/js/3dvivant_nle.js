console.log('huhu');
var FRAMERATE = 25;
var FADE = 5; // if an object's tracking data is not refreshed at 5 frames, the tracking is considered finished
var box;
//var empty_box = new BoxObject(0, 0, 0, 0, null, 0);
var dragging_box;
box = null;

var current_demo = 1;

$(document)
.ready(
		function() {

			// $('#markers').disableSelection();

			$("#canvas_div")
			.draggable(
					{
						opacity : 0.7,
						cursor : "move",
						cursorAt : {
							top : 0,
							left : 0
						},
						helper : function(event) {
							return $('<div class="bookentry"><img width="60" src="'
									+ dragging_box.thumb
									+ '"/><p>'+dragging_box.author+'</p>'
									+ '<a href="'
									+ dragging_box.link
									+ '" target="_blank">'
									+ dragging_box.title
									+ '</a><br class="clearing" /></div>');		
						}
					});

			$("#markers").droppable(
					{
						drop : function(event, ui) {
							console.log("drop accepted.");
							// $( this ).addClass( "ui-state-highlight"
							// ).find( "p" ).html( "Dropped!" );
							// $( this ).append(ui.draggable);
							if (checkDouble($('#markers').find('a'),
									dragging_box.title)) {
								console.log("already there ...");
							} else {
								$(this).append(
										'<div class="bookentry"><img width="60" src="' +
										dragging_box.thumb +
										'"/><p>'+dragging_box.author+'</p>' +
										'<a href="' +
										dragging_box.link +
										'" target="_blank">' +
										dragging_box.title +
								'</a><br class="clearing" /></div>');

							}
						}
					});

			$("#canvas_div").mousedown(function(e) {
				if (box !== null) {
					var video_offset = $("#video").offset();
					var action = box.isInside(e.pageX-video_offset.left, e.pageY-video_offset.top);
					document.getSelection().removeAllRanges();
					/*
					 * $('#position').html( e.pageX + ', ' + e.pageY +
					 * "isInside:" + action + "<br/>" +
					 * box.toString());
					 */

					if (action) {
						dragging_box = box.getCopy();
						dragging = true;

						$('#canvas_div').css('cursor', 'pointer');
						$('#markers').css('cursor', 'pointer');

					}
				}
			});
			
			$("#demo1 a").click(function(){change_demo(1);});
			$("#demo2 a").click(function(){change_demo(2);});
			$("#demo3 a").click(function(){change_demo(3);});
			
			init_video();
			console.log("page ready.");
		});

function checkDouble($results, text) {
	console.log("checkdouble" + $results);
	var check = false;
	$($results).each(function() {
		console.log("this:" + $(this) + " text:" + $(this).text());
		if ($(this).text() == text)
			check = true;
	});
	return check;
}

function BoxObject(x1, y1, x2, y2, link, link_id, title, author, thumb) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.link = link;
	this.link_id = link_id;
	this.title = title;
	this.author = author;
	this.thumb = thumb;

	this.isInside = isInside;
	this.getDistance = getDistance;
	//this.get_center_x = get_center_x;
	//this.get_center_y = get_center_y;	
	
	function isInside(x, y) {
		return (this.x1 < x) && (x < this.x2) && (this.y1 < y) && (y < this.y2);
	}
	
	function getDistance(x,y){
		return Math.sqrt(Math.pow(get_center_x-x,2)+Math.pow(get_center_y-y,2))
	}

	function get_center_x(){
		return this.x1 + (this.x2-this.x1)/2;
	}
	
	function get_center_y(){
		return this.y1 + (this.y2-this.y1)/2;
	}
	
	this.toString = toString;
	function toString() {
		return "BoxObject " + x1 + "," + y1 + "," + x2 + "," + y2 + " link:"
		+ link + " link_id:" + link_id;
	}

	this.getCopy = getCopy;
	function getCopy() {
		return new BoxObject(this.x1, this.y1, this.x2, this.y2, this.link,
				this.link_id, this.title, this.author, this.thumb);
	}
}

function change_demo(number){
	current_demo = number;
	$("#demolist li").removeClass("active");
	$("#demolist li").eq(current_demo-1).addClass("active");
	init_video();
}

function set_current_video(video_url){
	current_video_url = video_url;
	$("#video").attr("src",video_url);
}

function init_video(){
	// create popcorn instance
	pop = Popcorn("#video", {
		frameAnimation : true,
		frameRate : FRAMERATE
	});
	// var pop = Popcorn( "#video", { frameRate: FRAMERATE } );
	links = {};
	// var $frames = new Object();

	$.get('tmp/tracedata'+current_demo+'.xml', function(data) {
		parseFrames(data);
	});
}

function parseFrames(xml) {
	console.log("parseFrames");
	// var count = 3;
	set_current_video($(xml).find('nle_data').first().attr('url'));
	
	$(xml).find('links > link').each(
			function() {
				console.log("link gefunden:" + $(this).attr('dest'));
				var link = $(this).attr('dest');
				var link_id = $(this).attr('object');
				var title = $(this).find('title').text();
				var author = $(this).find('author').text();
				var thumb = $(this).find('image').text();

				var linkObject = new BoxObject(0, 0, 0, 0, link, link_id,
						title, author, thumb);

				links[link_id] = linkObject;
			});

	// process single frames as jQuery objects
	$(xml).find('frames > frame').each(
			function() {
				// console.log(" frame:" + $(this).attr('id'));
				var index = $(this).attr('id');
				var $BoundingBox = $(this).find('BoundingBox');
				// console.log("BoundingBox:" + $BoundingBox.length);
				// <area shape="rect" coords="11,10,59,29"
				// href="http://www.koblenz.de/"
				// alt="Koblenz" title="Koblenz">
				// $('')
				if ($BoundingBox.length === 0) {
					pop.code({
						start : index / FRAMERATE,
						onStart : function(options) {
							box = null;
							// $('#timeline').empty();
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
							var obj = links[object_id];

							var x1 = $BoundingBox.find("Min").attr("X");
							var y1 = $BoundingBox.find("Min").attr("Y");
							var x2 = $BoundingBox.find("Max").attr("X");
							var y2 = $BoundingBox.find("Max").attr("Y");

							create_stars(x1,y1,x2,y2,3);

							box = new BoxObject(x1, y1, x2, y2, obj.link,
									obj.link_id, obj.title, obj.author,
									obj.thumb);
							// var coordinates = x1+','+y1+','+x2+','+y2;
							// var area_html = '<area shape="rect"
							// coords="'+coordinates+'" href="'+destination+
							// '"alt="'+object_id+'" title="'+object_id+'"/>';

							// $('#timeline').html(
							// "<a href='" + destination + "'>"
							// + destination + index + "</a>");

							// $('#linkmap').html(area_html);

							// ****************** canvas paint method ******************
							
							//var canvas = document.getElementById('linkcanvas');
							//if (canvas.getContext) {
							//	var context = canvas.getContext('2d');
								// Erase canvas
							//	context.canvas.height = context.canvas.height;
							//	context.fillStyle = 'rgba(127,127,127,0.4)';
							//	context.fillRect(x1, y1, x2 - x1, y2 - y1);
							//}

							// ****************** /canvas paint method ******************

							
							$('#current_item').empty();

							$('#current_item').append(
									'<div class="bookentry" id="' + box.link_id
									+ '"><img width="60" src="'
									+ box.thumb + '"/><a href="'
									+ box.link + '" target="_blank">'
									+ box.title + '</a><br class="clearing" /></div>');
						}

					// console.log("index:" + index);

					});
				}// end else
			});
	console.log('parseFrames end');
}

function create_stars(x1,y1,x2,y2,no_of_stars){
	var w = x2-x1;
	var h = y2-y1;

	for (var counter = 0; counter < no_of_stars; counter++ ){
		var star_x = parseInt(x1);
		var star_y = parseInt(y1);
		for (var i = 0; i <= 2; i++ ) {
			//console.log("star_x before: "+star_x);
			star_x = star_x + Math.floor(Math.random()*w/3);
			//console.log("star_x after: "+star_x);
			star_y = star_y + Math.floor(Math.random()*h/3);
		}						

		var star = '<img src="res/star.png" class="star" style="position: absolute; top: '+ star_y +'px; left: '+ star_x +'px;" />';

		$("#canvas_div").append(star);
		$stars = $("#canvas_div .star");
		$star = $stars.filter(":last").fadeOut(800, function(){
			$(this).remove();
		});
	}
}

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