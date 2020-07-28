// Globals used throughout the narrative
var charts = {};
var totalSlides = 7;
var slide = 5;
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
    slide--;
    nextSlide();
  }
}

function next() {
  if (slide < totalSlides) {
    slide++;
    nextSlide();
  }
}

function nextSlide() {
  // Clear all slides except selected one
  d3.selectAll('section').style('display', 'none');

  // Clear all tooltips
  d3.selectAll('.tooltip').style('display', 'none');

  // Clear the SVG
  d3.selectAll('svg').remove();

  d3.select('#slide-' + slide).style('display', 'block');

  // Load corresponding chart
  if (slide > 3) {
    var func = charts['chart' + (slide - 3)];
    if (func == undefined) return;
    func();
  }

  // Set navigation dots
  d3.selectAll('.navigation li').attr('class', '');

  d3.select('#dot-' + slide).attr('class', 'active-dot');
}

// D3 Event Listeners
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

// Initialization
nextSlide();
