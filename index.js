var Queue = function() {
	var me = {};

	me.queued = [];
	me.argsets = [];

	me.started = false;
	
	function next() {
		if (me.queued.length > 0) {
			me.queued.shift().apply(this, me.argsets.shift());
			next();
		} else {
			me.started = false;
		}
	}

	function start() {
		console.log(me.started);
		if (!me.started) {
			me.started = true;
			next();	
		}
	}

	function add(func) {
		me.queued.push(func);
		me.argsets.push(Array.prototype.slice.call(arguments, 1));
	}

	$.extend(me, {
		start: start,
		next: next,
		add: add,
	});

	return me;
}

function parseRotation(rotation) {
	return rotation.split(' ').map(function(i) {
		return parseFloat(i);
	});
}

function circleOverlap(circ1, circ2) {
	var cxd = circ1.attr('cx') - circ2.attr('cx')
	var cyd = circ1.attr('cy') - circ2.attr('cy')

	var v = Vector.create([cxd, cyd]);

	var dist = v.modulus();

	var radsum = circ1.truerad + circ2.truerad;

	return (dist <= radsum);
}

function randomRGB() {
	return "rgb(" + Math.random()*255 + ", " + Math.random()*255 + ", " + Math.random()*255 + ")";
}


$(function() {
	$('svg').width(window.innerWidth);
	$('svg').height(window.innerHeight);
	var paper = Raphael('svg', document.width, document.height);
	paper.canvas.id = 'viewport';
	window.paper = paper;

	var node = document.createElement('script');
	node.src = "lib/SVGPan.js";
	$('svg').get(0).appendChild(node);

	var minradius = 50;
	var maxradius = 150;

	var circles = [];

	function clickCircle() {
		var circle = this;
		console.log(circles.length);
		var cx = circle.attr('cx'), cy = circle.attr('cy');

		var i = 0;
		while (i < 20) {
			// Calculate new circle location and properties
			var radius = Math.random()*(maxradius-minradius) + minradius;
			var angle = (i/10)*360;
			var length = radius*4;

			var v = Vector.create([length, 0]);
			var axis = Vector.create([0, 0]);
			var vr = v.rotate(Raphael.rad(angle), axis);

			var ncx = cx+vr.elements[0], ncy = cy+vr.elements[1];

			// Add circle
			var newcircle = paper.circle(ncx, ncy, radius);
			newcircle.truerad = radius;
			newcircle.hide();

			// Cancel if collision detected
			var collision = false;
			circles.forEach(function(other) {
				if (circleOverlap(newcircle, other)) {
					collision = true;
				}
			});

			if (collision) {
				newcircle.remove();
				i++;
				continue;
			}

			circles.push(newcircle);

			// Create joining path
			var pathstr = ("M" + cx + " " + cy); //+ "L" + ncx + " " + ncy);
			var path = paper.path(pathstr);
			path.origin = circle;
			path.target = newcircle;
			path.toBack();

			window.path = path;
			window.circle = circle

			path.animate({ path: pathstr + "L" + ncx + " "  + ncy }, 1000, function() {//, rotation: "" + angle + " " + cx + " " + cy }, 1000, function() {
				var path = this;
				var newcircle = path.target;

				newcircle.show();
				newcircle.scale(0.1, 0.1);
				newcircle.attr('fill', 'rgb(255, 255, 255)');
				newcircle.animate({ scale: "1.0 1.0", fill: randomRGB() }, 1000);
				newcircle.click(clickCircle);

			});

			i += 1;
		}
	}

	var radius = Math.random()*(maxradius-minradius) + minradius;

	var first = paper.circle(document.width/2, document.height/2, radius);
	first.truerad = radius;

	first.attr('fill', randomRGB());

	first.tr

	first.click(clickCircle);

	circles.push(first);
});