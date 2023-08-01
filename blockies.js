(function() {
	// The random number is a JavaScript implementation of the Xorshift PRNG (Pseudo-Random Number Generator)
	var randseed = new Array(4); // Xorshift: [x, y, z, w] 32-bit values

	// Function to seed the random number generator with a given seed string
	function seedrand(seed) {
		for (var i = 0; i < randseed.length; i++) {
			randseed[i] = 0;
		}
		for (var i = 0; i < seed.length; i++) {
			randseed[i % 4] = ((randseed[i % 4] << 5) - randseed[i % 4]) + seed.charCodeAt(i);
		}
	}

	// Function to generate a pseudo-random number between 0 and 1
	function rand() {
		// Based on Java's String.hashCode(), expanded to 4 32-bit values
		var t = randseed[0] ^ (randseed[0] << 11);

		randseed[0] = randseed[1];
		randseed[1] = randseed[2];
		randseed[2] = randseed[3];
		randseed[3] = (randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8));

		// Convert the 32-bit value to a floating-point number between 0 and 1
		return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
	}

	// Function to create a random HSL color
	function createColor() {
		// Saturation is the whole color spectrum (0-360)
		var h = Math.floor(rand() * 360);
		// Saturation goes from 40 to 100, avoiding greyish colors
		var s = ((rand() * 60) + 40) + '%';
		// Lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
		var l = ((rand() + rand() + rand() + rand()) * 25) + '%';

		var color = 'hsl(' + h + ',' + s + ',' + l + ')';
		return color;
	}

	// Function to create the image data for the icon
	function createImageData(size) {
		var width = size; // Only support square icons for now
		var height = size;

		var dataWidth = Math.ceil(width / 2);
		var mirrorWidth = width - dataWidth;

		var data = [];
		for (var y = 0; y < height; y++) {
			var row = [];
			for (var x = 0; x < dataWidth; x++) {
				// This makes foreground and background color have a 43% (1/2.3) probability
				// Spot color has a 13% chance
				row[x] = Math.floor(rand() * 2.3);
			}
			var r = row.slice(0, mirrorWidth);
			r.reverse();
			row = row.concat(r);

			for (var i = 0; i < row.length; i++) {
				data.push(row[i]);
			}
		}

		return data;
	}

	// Function to build options for rendering the icon
	function buildOpts(opts) {
		var newOpts = {};

		newOpts.seed = opts.seed || Math.floor((Math.random() * Math.pow(10, 16))).toString(16);

		seedrand(newOpts.seed);

		newOpts.size = opts.size || 8;
		newOpts.scale = opts.scale || 4;
		newOpts.color = opts.color || createColor();
		newOpts.bgcolor = opts.bgcolor || createColor();
		newOpts.spotcolor = opts.spotcolor || createColor();

		return newOpts;
	}

	// Function to render the icon on a canvas element
	function renderIcon(opts, canvas) {
		opts = buildOpts(opts || {});
		var imageData = createImageData(opts.size);
		var width = Math.sqrt(imageData.length);

		canvas.width = canvas.height = opts.size * opts.scale;

		var cc = canvas.getContext('2d');
		cc.fillStyle = opts.bgcolor;
		cc.fillRect(0, 0, canvas.width, canvas.height);
		cc.fillStyle = opts.color;

		for (var i = 0; i < imageData.length; i++) {

			// If data is 0, leave the background
			if (imageData[i]) {
				var row = Math.floor(i / width);
				var col = i % width;

				// If data is 2, choose spot color; if 1, choose foreground
				cc.fillStyle = (imageData[i] == 1) ? opts.color : opts.spotcolor;

				cc.fillRect(col * opts.scale, row * opts.scale, opts.scale, opts.scale);
			}
		}
		return canvas;
	}

	// Function to create an icon and return it as a canvas element
	function createIcon(opts) {
		var canvas = document.createElement('canvas');

		renderIcon(opts, canvas);

		return canvas;
	}

	// Define the public API for the blockies library
	var api = {
		create: createIcon,
		render: renderIcon
	};

	// Export the API for Node.js if available
	if (typeof module !== "undefined") {
		module.exports = api;
	}

	// Export the API for browsers
	if (typeof window !== "undefined") {
		window.blockies = api;
	}
})();
