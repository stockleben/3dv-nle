console.log('huhu');

//create popcorn instance
var FRAMERATE = 25;
var pop = Popcorn( "#video", { frameAnimation: true, frameRate: FRAMERATE } );
var links = new Object();
//var $frames = new Object();

$.get('res/test.xml', function(data){parseFrames(data);});


function parseFrames(xml){
	console.log("parseFrames");
	//var count = 3;
	
	$(xml).find('links > link').each(function(){
		console.log("link gefunden:"+$(this).attr('dest'));
		var destination = $(this).attr('dest');
		var link_id = $(this).attr('object');
		links[link_id] = destination;
	});
	
	// process single frames as jQuery objects
	$(xml).find('frames > frame').each(function(){
		console.log(" frame:"+$(this).attr('id'));
		var index = $(this).attr('id');
		var $BoundingBox = $(this).find('BoundingBox');
		
		//<area shape="rect" coords="11,10,59,29" href="http://www.koblenz.de/"
		//	alt="Koblenz" title="Koblenz">
		// $('')
		
		
		
		pop.code({
			start: index/FRAMERATE,
			onStart: function (options){
				$('#linkmap').empty();
				var object_id = $BoundingBox.attr('id');
				var destination = links[object_id];
				
				var x1 = $BoundingBox.find("Min").attr("X");
				var y1 = $BoundingBox.find("Min").attr("Y");
				var x2 = $BoundingBox.find("Max").attr("X");
				var y2 = $BoundingBox.find("Max").attr("Y");
				var coordinates = x1+','+y1+','+x2+','+y2;
				var area_html = '<area shape="rect" coords="'+coordinates+'" href="'+destination+
					'"alt="'+object_id+'" title="'+object_id+'"/>';
				$('#timeline').html("<a href='"+destination+"'>"+destination+index+"</a>");
				$('#linkmap').html(area_html);
				
				var canvas = document.getElementById('linkcanvas');
				if (canvas.getContext){
					var context = canvas.getContext('2d');
					// Erase canvas
					context.canvas.height = context.canvas.height;
					context.fillStyle = 'rgba(127,255,127,0.5)';
					context.fillRect(x1,y1,x2,y2);
				}
				
				console.log("index:"+index);
			}
		});
		
	
	});
	console.log('parseFrames end');
};


console.log('hihi');


/*

pop.timeline({
        start: 1,
        target: "timeline",
        title: "This is a title",
        text: "this is some interesting text that goes inside",
        innerHTML: "Click here for <a href='http://www.google.ca'>Google</a>" ,
        direction: "up"
      })
      .timeline({
        start: 2,
        target: "timeline",
        title: "double as interesting",
        text: "this is some interesting text that goes inside",
        innerHTML: "Maybe a button? <button onClick=\"window.location.href='http://www.google.com'\">Click Me</button>",
        direction: "up"
      })
     .timeline({
        start: 4,
        end: 700,
        target: "timeline",
        title: "3x as interesting",
        text: "this is some interesting text that goes inside",
        innerHTML: "",
        direction: "up"
      });
console.log("haha");
// play video
//pop.play();
*/