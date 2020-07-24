var charts = {};
var totalSlides = 6;
var slide = 1;

d3.select(window).on("keydown", function() {
  // var keys = Object.keys(charts).length;
  switch (d3.event.keyCode) {
    case 37: 
      if (slide > 1) {slide--; console.log(slide);nextSlide()};break;
    case 39: 
      if (slide < totalSlides) {slide++; console.log(slide); nextSlide();}break;
  }
});

function nextSlide() {
  // Clear all slides except selected one
  d3.selectAll('section')
    .style("display", "none");

  d3.selectAll('svg').remove();

  d3.select("#slide-"+slide)
    .style("display", "block");

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