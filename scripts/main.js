var charts = {};
var totalSlides = 6;
var slide = 3;

function prev() {
  if (slide > 1) {slide--;nextSlide()};
}

function next() {
  if (slide < totalSlides) {slide++;nextSlide();}
}

d3.select(window).on("keydown", function() {
  // var keys = Object.keys(charts).length;
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

nextSlide();