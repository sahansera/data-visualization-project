// Globals used throughout the narrative
var charts = {};
var totalSlides = 6;
var slide = 1;
var colorScale = [
  '#4e79a7',
  '#f28e2c',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
];

// Helper functions for navigation
function prev() {
  if (slide > 1) {
    --slide;
    nextSlide();
  }
}

function next() {
  if (slide < totalSlides) {
    ++slide;
    nextSlide();
  }
}

function startOver() {
  slide = 1;
  nextSlide();
}

function nextSlide() {

  // Scroll to top during transition
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

  // Hide Prev button if we are on slide 1
  if (slide == 1) {
    d3.select("#prev").style("visibility", "hidden");
    d3.select("#next").style("display", "block");
    d3.select("#startover").style("display", "none");
  } else if (slide == totalSlides) {
    d3.select("#next").style("display", "none");
    d3.select("#startover").style("display", "block");
  } else {
    d3.select("#prev").style("visibility", "visible");
    d3.select("#next").style("display", "block");
    d3.select("#startover").style("display", "none");
  }

  // Clear all slides
  d3.selectAll('section').style('display', 'none');

  // Clear all tooltips
  d3.selectAll('.tooltip').style('display', 'none');

  // Clear all SVGs
  d3.selectAll('svg').remove();

  d3.select('#slide-' + slide).style('display', 'block');

  // Load corresponding chart
  if (slide > 1 && slide < totalSlides) {
    var func = charts['chart' + (slide - 1)];
    if (func == undefined) return;
    func();
  }

  // Set navigation dots
  d3.selectAll('.navigation li').attr('class', '');

  d3.select('#dot-' + slide).attr('class', 'active-dot');
}

// D3 event listeners for key bindings
d3.select(window).on('keydown', function () {
  switch (d3.event.keyCode) {
    case 37:
      prev();
      break;
    case 39:
      next();
      break;
  }
});

d3.select('#prev').on('click', function () {
  prev();
});

d3.select('#next').on('click', function () {
  next();
});

d3.select('#startover').on('click', function () {
  startOver();
});
// Initialization
nextSlide();
