// https://www.d3-graph-gallery.com/connectedscatter.html

charts.chart1 = function () {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 100, bottom: 30, left: 100 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // Year parse function
  var parseDate = d3.timeParse("%Y");

  // append the svg object to the body of the page
  var svg = d3
    .select('#chart1')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //Read the data
  d3.csv('../data/users-by-social-media-platform.csv', function (data) {
    drawChart(data);

    drawAnnotation();

    // Add a legend (interactive)
    // svg
    // .selectAll("myLegend")
    // .data(dataReady)
    // .enter()
    //   .append('g')
    //   .append("text")
    //     .attr('x', function(d,i){ return 30 + i*80})
    //     .attr('y', 30)
    //     .text(function(d) { return d.name; })
    //     .style("fill", function(d){ return myColor(d.name) })
    //     .style("font-size", 15)
    //   .on("click", function(d){
    //     // is the element currently visible ?
    //     currentOpacity = d3.selectAll("." + d.name).style("opacity")
    //     // Change the opacity: from 0 to 1 or from 1 to 0
    //     d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0:1)})
  });

  function drawChart(data) {
    // List of groups
    var allGroup = [
      'Facebook',
      'YouTube',
      'Whatsapp',
      'Instagram',
      'Tumblr',
      'TikTok',
      'Reddit',
      'Twitter',
      'MySpace',
    ];

    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = allGroup.map(function (grpName) {
      // .map allows to do something for each element of the list
      return {
        name: grpName,
        values: data
          .filter(function (d) {
            return d.Entity === grpName;
          })
          .map(function (d) {
            return { time: new Date(d.Year), value: d.MonthlyUsers, group: d.Entity };
          }),
      };
    });

    // console.log(dataReady)

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal().domain(allGroup).range(d3.schemeSet2);

    // Add X axis
    var x = d3
      .scaleTime()
      .domain(d3.extent(data, function (d) { return new Date(parseInt(d.Year),0); }))
      .range([0, width]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)));

    // text label for the x axis
    svg
      .append('text')
      .attr(
        'transform',
        'translate(' + width / 2 + ' ,' + (height + margin.top + 20) + ')'
      )
      .style('text-anchor', 'middle')
      .text('Year');

    // Add Y axis
    var y = d3.scaleLinear().domain([240000, 2375000000]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // text label for the y axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Monthly Active Users');

    // Add the lines
    var line = d3
      .line()
      .x(function (d) {
        return x(+d.time);
      })
      .y(function (d) {
        return y(+d.value);
      });
    svg
      .selectAll('myLines')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('d', function (d) {
        return line(d.values);
      })
      .attr('class', function (d) {
        return d.name;
      })
      .attr('stroke', function (d) {
        return myColor(d.name);
      })
      .style('stroke-width', 4)
      .style('fill', 'none');

    var mouseEventHandlers = drawTooltips();
    var mouseover = mouseEventHandlers.mouseover,
      mouseleave = mouseEventHandlers.mouseleave,
      mousemove = mouseEventHandlers.mousemove;

    // Add the points
    svg
      // First we need to enter in a group
      .selectAll('myDots')
      .data(dataReady)
      .enter()
      .append('g')
      .style('fill', function (d) {
        return myColor(d.name);
      })
      .attr('class', function (d) {
        return d.name;
      })
      // Second we need to enter in the 'values' part of this group
      .selectAll('myPoints')
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return x(d.time);
      })
      .attr('cy', function (d) {
        return y(d.value);
      })
      .attr('r', 5)
      .attr('stroke', 'white')
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    // Add a legend at the end of each line
    svg
      .selectAll('myLabels')
      .data(dataReady)
      .enter()
      .append('g')
      .append('text')
      .datum(function (d) {
        return { name: d.name, value: d.values[d.values.length - 1] };
      }) // keep only the last value of each time series
      .attr('transform', function (d) {
        return 'translate(' + x(d.value.time) + ',' + y(d.value.value) + ')';
      }) // Put the text at the position of the last point
      .attr('x', 12) // shift the text a bit more right
      .text(function (d) {
        return d.name;
      })
      .style('fill', function (d) {
        return myColor(d.name);
      })
      .style('font-size', 15)
      .attr('class', function (d) {
        return d.name;
      });
  }

  function drawTooltips() {
    var tooltip = d3
      .select('#chart1')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip');

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
      tooltip
        .html(
          '<strong>Platform: </strong>' +
            d.group +
            '<br>' +
            '<strong>Users: </strong>' +
            d.value +
            '<br>' +
            '<strong>Year: </strong>' +
            d.time.getFullYear()
        )
        .style('opacity', 1);
    };
    var mousemove = function (d) {
      tooltip
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 110 + 'px');
    };
    var mouseleave = function (d) {
      tooltip.style('opacity', 0);
    };

    return {
      mouseover: mouseover,
      mouseleave: mouseleave,
      mousemove: mousemove,
    };
  }

  function drawAnnotation() {
    var annotation = svg.append('g');
    annotation
      .append('text')
      .attr('x', 60)
      .attr('y', 200)
      .attr('class', 'annotation')
      .html('Facebook was the first to hit <br>1 billion users in 2012');
    annotation
      .append('line')
      .attr('x1', 190)
      .attr('x2', 430)
      .attr('y1', 210)
      .attr('y2', 320)
      .attr('class', 'annotation');
  }
};
