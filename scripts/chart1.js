// https://www.d3-graph-gallery.com/connectedscatter.html

charts.chart1 = function () {
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 100},
  width = 960 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#chart1")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv("../data/users-by-social-media-platform.csv", function(data) {

  // List of groups (here I have one group per column)
  var allGroup = ["Facebook", "YouTube", "Whatsapp", "Instagram", "WeChat", "Tumblr", "TikTok", "Reddit", "Twitter", "MySpace"];

  // Reformat the data: we need an array of arrays of {x, y} tuples
  var dataReady = allGroup.map(function(grpName) { // .map allows to do something for each element of the list
    return {
      name: grpName,
      values: data
        .filter(function(d){ return d.Entity === grpName})
        .map(function(d) {
          return {time: d.Year, value: d.MonthlyUsers};
        })
    };
  });

  // console.log(dataReady)

  // A color scale: one color for each group
  var myColor = d3.scaleOrdinal()
    .domain(allGroup)
    .range(d3.schemeSet2);

  // Add X axis --> it is a date format
  var x = d3.scaleBand()
    .domain([2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // text label for the x axis
  svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Year");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain( [240000,2375000000])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // text label for the y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Monthly Active Users");

  // Add the lines
  var line = d3.line()
    .x(function(d) { return x(+d.time) })
    .y(function(d) { return y(+d.value) })
  svg.selectAll("myLines")
    .data(dataReady)
    .enter()
    .append("path")
      .attr("d", function(d){ return line(d.values) } )
      .attr("stroke", function(d){ return myColor(d.name) })
      .style("stroke-width", 4)
      .style("fill", "none")

  // Add the points
  svg
    // First we need to enter in a group
    .selectAll("myDots")
    .data(dataReady)
    .enter()
      .append('g')
      .style("fill", function(d){ return myColor(d.name) })
    // Second we need to enter in the 'values' part of this group
    .selectAll("myPoints")
    .data(function(d){ return d.values })
    .enter()
    .append("circle")
      .attr("cx", function(d) { return x(d.time) } )
      .attr("cy", function(d) { return y(d.value) } )
      .attr("r", 5)
      .attr("stroke", "white")

  // Add a legend at the end of each line
  svg
    .selectAll("myLabels")
    .data(dataReady)
    .enter()
      .append('g')
      .append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
        .attr("transform", function(d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function(d) { return d.name; })
        .style("fill", function(d){ return myColor(d.name) })
        .style("font-size", 15)

  });
};