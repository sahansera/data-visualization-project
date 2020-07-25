var charts = {};
var totalSlides = 7;
var slide = 4;

// Helper Functions
function prev() {
  if (slide > 1) {slide--;nextSlide()};
}

function next() {
  if (slide < totalSlides) {slide++;nextSlide();}
}

function updateChart2(selection) {
  var chart2Func = charts.chart2(selection);
  console.log(chart2Func);
  chart2Func.update(selection);
}

function nextSlide() {
  // Clear all slides except selected one
  d3.selectAll('section')
    .style("display", "none");

  d3.selectAll('svg').remove();

  d3.select("#slide-"+slide)
    .style("display", "block");

  // Load corresponding chart
  if (slide > 3) {
    var func = charts["chart" + (slide - 3)];
    if (func == undefined) return;
    func();
  }

  // Set navigation dots
  d3.selectAll(".navigation li")
    .attr("class", "");

  d3.select("#dot-"+slide)
    .attr("class", "active-dot");
}

// D3 Event Listeners
d3.select(window).on("keydown", function() {
  switch (d3.event.keyCode) {
    case 37: prev(); break;
    case 39: next(); break;
  }
});

d3.select("#prev").on("click", function() {
  prev();
});

d3.select("#next").on("click", function() {
  next();
});

// Initialization
nextSlide();