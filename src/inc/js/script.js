(function($){
	'use strict';

	var bingoCard = {

		// canvas
		canvas: null,
		context: null,
		$container: null,
		container_padding: null,

		// data arrays
		squares: [],
		phrases: [],

		// card variables
		total_squares: 25,
		squares_per_row: 5,
		gutter_size: 0, // todo: make this work.
		clicked_square_bg_color: null,

		// free space info
		free_space_text: 'Moore',
		free_space_position: 13,

		// font
		font: 'serif',
		font_size: '20px',
		line_height: 1,
		space_between_lines: 2,

		/**
		 * Magic
		 */
		init: function(canvasID){
			var self = this;

			this.canvas = $(canvasID)[0];
			this.context = this.canvas.getContext('2d');
			this.$container = $(this.canvas).parent();
			this.clicked_square_bg_color = this.getRandomColor();

			this.container_padding = {
				left: parseInt(this.$container.css('paddingLeft').toString().replace(/px/g,'')),
				right: parseInt(this.$container.css('paddingRight').toString().replace(/px/g,'')),
				top: parseInt(this.$container.css('paddingTop').toString().replace(/px/g,'')),
				bottom: parseInt(this.$container.css('paddingBottom').toString().replace(/px/g,''))
			};

			this.getPhrases();
			this.resize(false);

			window.addEventListener('resize', function(){ self.resize(true); });
			$(this.canvas).click(function(e){self.captureClickOnSquare(e);});
		},

		/**
		 * Get the dimensions for each square
		 *
		 * @returns {{h: number, w: number}}
		 */
		getSquareDimensions: function(){
			return {
				h: this.canvas.height / this.squares_per_row - this.gutter_size,
				w: this.canvas.width / this.squares_per_row - this.gutter_size
			};
		},

		/**
		 * populate each bingo square for the canvas
		 */
		populateSquares: function(){

			var current_row = 1,
				current_row_idx = 1,
				dimensions = this.getSquareDimensions();

			this.squares = [];

			for( var idx = 0; idx < this.total_squares; idx++){

				// get x & y coordinates for each square
				var x = (dimensions.w * (current_row_idx - 1)),
					y = (dimensions.h * (current_row - 1));

				// add square to array
				this.squares.push(new bingoSquare(
					x, // x position for square
					y, // y position for square
					dimensions.h, // height of square
					dimensions.w, // width of square
					current_row_idx, // idx of the square in the current row
					current_row, // current row
					this.getPhrase(idx), // text for square
					idx === (this.free_space_position - 1), // boolean - if this is the free space or not
					idx + 1 // id of square, 1 - 25(bingoCard.total_squares)
				));

				// increment row and reset row idx if need be
				if( (idx+1) % (this.squares_per_row) === 0 ){
					current_row += 1;
					current_row_idx = 0;
				}

				// increment current row idx
				current_row_idx += 1;
			}
		},

		/**
		 * draw the squares on the bingo card
		 */
		drawSquares: function(){
			var self = this;
			this.squares.forEach(function(square){

				var ctx = self.context,
					font_size_no_px = self.font_size.replace(/px/g, '');

				// draw square
				ctx.beginPath();
				ctx.rect(square.x, square.y, square.width, square.height);
				ctx.closePath();

				ctx.fillStyle = square.is_free_space ? self.clicked_square_bg_color : square.backgroundColor;

				ctx.stroke();
				ctx.fill();

				// add text
				ctx.lineWidth = 1;
				ctx.fillStyle = square.is_free_space ? 'red' :'black';
				ctx.font = self.font_size + " " + self.font;

				var lines = square.splitPhraseToNewLines(square.text);
				if (lines.length){

					var total_text_height = lines.length * font_size_no_px + self.space_between_lines,
						ly = (square.height - total_text_height) / 2 + square.y + self.space_between_lines * lines.length,
						lx = 0;

					var curLine = 1;
					lines.forEach(function(line){
						lx = square.x + square.width / 2 - self.context.measureText(line).width / 2;
						ctx.fillText(line, lx, (ly + (font_size_no_px * 1 ) * curLine));
						curLine += 1;
					});
				}
			});
		},

		/**
		 * load phrases from json
		 */
		getPhrases: function(){
			var self = this;
			$.getJSON('inc/json/phrases.json', function(data){
				self.phrases = self.shuffleArray(data);
				self.render();
			});
		},

		/**
		 * get an unused phrase to use or use the free square if we're at that positon
		 */
		getPhrase: function(idx){
			if (idx !== (this.free_space_position - 1)) {
				return this.phrases[idx];
			} else {
				return this.free_space_text;
			}
		},

		/**
		 * Shuffle an array
		 *
		 * @param array
		 * @returns {*}
		 */
		shuffleArray: function(array){
			var currentIndex = array.length, temporaryValue, randomIndex;

			// While there remain elements to shuffle...
			while (0 !== currentIndex){

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		},

		/**
		 * Render the bingo card
		 */
		render: function(populate){
			this.clear(); // clear canvas
			if (populate === undefined) populate = true;
			if(populate) this.populateSquares(); // populate each square randomly
			this.drawSquares(); // draw
		},

		/**
		 * clear canvas
		 */
		clear: function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},

		/**
		 * Resize canvas to fit window
		 *
		 * @param render
		 * 	(bool) render canvas
		 */
		resize: function(render){
			var total_side_padding = this.container_padding.left + this.container_padding.right;

			this.canvas.height = this.$container.innerWidth() - total_side_padding;
			this.canvas.width = this.$container.innerWidth() - total_side_padding;

			var dimensions = this.getSquareDimensions();
			this.squares.forEach(function(square){
				square.setDimensions(dimensions.h, dimensions.w);
			});

			if (render){
				this.render();
			}
		},

		/**
		 * Get a random color
		 *
		 * @returns {string}
		 */
		getRandomColor: function(){
			return '#'+Math.floor(Math.random()*16777215).toString(16);
		},

		/**
		 * get the square that was clicked
		 * @param e
		 */
		captureClickOnSquare: function(e){
			var self = this,
				click = {
					x: e.offsetX,
					y: e.offsetY
				};

			if (this.squares.length){
				this.squares.forEach(function(square){
					if (
						click.x >= square.x && click.x <= (square.x + square.width) &&
						click.y >= square.y && click.y <= (square.y + square.height)
					){
						if (square.backgroundColor === square.defaultBackgroundColor) {
							square.setBackgroundColor(self.clicked_square_bg_color);
						} else {
							square.setBackgroundColor(square.defaultBackgroundColor);
						}
						self.render(false);
					}
				});
			}
		}
	};


	/**
	 * Bingo Square
	 *
	 * @param x
	 * 	x position
	 * @param y
	 * 	y position
	 * @param h
	 * 	height
	 * @param w
	 * 	width
	 * @param pos
	 * 	position in row
	 * @param row
	 * 	row
	 * @param text
	 * 	square text
	 * @param is_free_space
	 * 	if this is the free space or not
	 */
	var bingoSquare = function(x, y, h, w, pos, row, text, is_free_space, id){
		this.height = h;
		this.width = w;
		this.x = x;
		this.y = y;
		this.is_free_space = is_free_space;
		this.backgroundColor = 'white';
		this.defaultBackgroundColor = 'white';
		this.text = text;
		this.rowPosition = pos;
		this.row = row;
		this.id = 'Square-' + id;
	};

	/**
	 * set the dimensions for this square
	 *
	 * @param h
	 * @param w
	 */
	bingoSquare.prototype.setDimensions = function(h, w){
		this.height = h;
		this.width = w;
	};

	/**
	 * set background color of the square
	 * @param color
	 */
	bingoSquare.prototype.setBackgroundColor = function(color){
		this.backgroundColor = color;
	};

	/**
	 * Split text into new lines depending on how much will fit into the square.
	 *
	 * @param text
	 * @returns {Array}
	 */
	bingoSquare.prototype.splitPhraseToNewLines = function(text){
		var maxWidth = this.width - 10; // 10 for a little padding around the square
		bingoCard.context.font = bingoCard.font_size + " " + bingoCard.font;

		// We split the text by words
		var words = text.split(' ');
		var new_line = words[0];
		var lines = [];

		for(var i = 1; i < words.length; ++i) {
			if (bingoCard.context.measureText(new_line + " " + words[i]).width < maxWidth) {
				new_line += " " + words[i];
			} else {
				lines.push(new_line);
				new_line = words[i];
			}
		}
		lines.push(new_line);
		return lines;
	};

	$(document).ready(function(){bingoCard.init('#bingo-card');});
})(jQuery);