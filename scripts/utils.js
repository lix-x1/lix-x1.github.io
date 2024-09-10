'use strict';

window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

(function(global) {
	var MONTHS = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	var COLORS = [
		'#4dc9f6',
		'#f67019',
		'#f53794',
		'#537bc4',
		'#acc236',
		'#166a8f',
		'#00a950',
		'#58595b',
		'#8549ba'
	];

	var Samples = global.Samples || (global.Samples = {});
	var Color = global.Color;

	Samples.utils = {
		// Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
		srand: function(seed) {
			this._seed = seed;
		},

		rand: function(min, max) {
			var seed = this._seed;
			min = min === undefined ? 0 : min;
			max = max === undefined ? 1 : max;
			this._seed = (seed * 9301 + 49297) % 233280;
			return min + (this._seed / 233280) * (max - min);
		},

		numbers: function(config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 1;
			var from = cfg.from || [];
			var count = cfg.count || 8;
			var decimals = cfg.decimals || 8;
			var continuity = cfg.continuity || 1;
			var dfactor = Math.pow(10, decimals) || 0;
			var data = [];
			var i, value;

			for (i = 0; i < count; ++i) {
				value = (from[i] || 0) + this.rand(min, max);
				if (this.rand() <= continuity) {
					data.push(Math.round(dfactor * value) / dfactor);
				} else {
					data.push(null);
				}
			}

			return data;
		},

		labels: function(config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 100;
			var count = cfg.count || 8;
			var step = (max - min) / count;
			var decimals = cfg.decimals || 8;
			var dfactor = Math.pow(10, decimals) || 0;
			var prefix = cfg.prefix || '';
			var values = [];
			var i;

			for (i = min; i < max; i += step) {
				values.push(prefix + Math.round(dfactor * i) / dfactor);
			}

			return values;
		},

		months: function(config) {
			var cfg = config || {};
			var count = cfg.count || 12;
			var section = cfg.section;
			var values = [];
			var i, value;

			for (i = 0; i < count; ++i) {
				value = MONTHS[Math.ceil(i) % 12];
				values.push(value.substring(0, section));
			}

			return values;
		},

		color: function(index) {
			return COLORS[index % COLORS.length];
		},

		transparentize: function(color, opacity) {
			var alpha = opacity === undefined ? 0.5 : 1 - opacity;
			return Color(color).alpha(alpha).rgbString();
		}
	};

	// DEPRECATED
	window.randomScalingFactor = function() {
		return Math.round(Samples.utils.rand(-100, 100));
	};

	// INITIALIZATION

	Samples.utils.srand(Date.now());

	// Google Analytics
	/* eslint-disable */
	// if (document.location.hostname.match(/^(www\.)?chartjs\.org$/)) {
	// 	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	// 	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	// 	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	// 	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	// 	ga('create', 'UA-28909194-3', 'auto');
	// 	ga('send', 'pageview');
	// }
	/* eslint-enable */

}(this));

window.addEventListener("DOMContentLoaded", () => {
	const displayOrientation = () => {
		const screenOrientation = screen.orientation.type;
		if (screenOrientation === "landscape-primary") {
			$app.onresize();
			console.log("That looks good.");
		} else if (screenOrientation === "landscape-secondary") {
			$app.onresize();
			console.log("Mmmh... the screen is upside down!");
		} else if (screenOrientation === "portrait-secondary" || screenOrientation === "portrait-primary") {
			$app.onresize();
			console.log("Mmmh... you should rotate your device to landscape");
		} else if (screenOrientation === undefined) {
			$app.onresize();
			console.log("The orientation API isn't supported in this browser :(");
		}
	};

	if (screen && screen.orientation !== null) {
		try {
			window.screen.orientation.onchange = displayOrientation;
			displayOrientation();
			$app.onresize();
		}
		catch (e) { }
	}
});
function matrix3DToCorners(matrix3d, width, height, perspective = 1300) {
	if (matrix3d.length !== 16) {
		throw new Error("Invalid matrix3d format. Expected an array of 16 elements.");
	}

	function transformPoint(matrix, x, y, perspective) {
		var transformed = [
			matrix[0] * x + matrix[4] * y + matrix[12],
			matrix[1] * x + matrix[5] * y + matrix[13],
			matrix[2] * x + matrix[6] * y + matrix[14],
			matrix[3] * x + matrix[7] * y + matrix[15]
		];

		// Adjust for perspective
		var perspectiveFactor = perspective / (perspective - transformed[2]);

		return [
			transformed[0] * perspectiveFactor,
			transformed[1] * perspectiveFactor
		];
	}

	// Transform all four corners
	var topLeft = transformPoint(matrix3d, -width / 2, -height / 2, perspective);
	var topRight = transformPoint(matrix3d, width / 2, -height / 2, perspective);
	var bottomLeft = transformPoint(matrix3d, -width / 2, height / 2, perspective);
	var bottomRight = transformPoint(matrix3d, width / 2, height / 2, perspective);

	// Offset back to top-left corner as origin
	var cx = width / 2;
	var cy = height / 2;

	return [
		topLeft[0] + cx, topLeft[1] + cy,
		topRight[0] + cx, topRight[1] + cy,
		bottomLeft[0] + cx, bottomLeft[1] + cy,
		bottomRight[0] + cx, bottomRight[1] + cy
	];
}

function getMatrix3DArrayFromElement(element) {
	// Get the computed style of the element
	var style = window.getComputedStyle(element);

	// Extract the transform property
	var transform = style.transform || style.webkitTransform || style.mozTransform || style.msTransform || style.oTransform;

	// Check if the transform is of type matrix3d
	if (transform && transform.startsWith("matrix3d(")) {
		// Remove the "matrix3d(" and ")" and split the string into an array
		var matrixString = transform.slice(9, -1);
		var matrixArray = matrixString.split(',').map(Number);

		return matrixArray;
	} else {
		throw new Error("No matrix3d transformation found on the element.");
	}
}