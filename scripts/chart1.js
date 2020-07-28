// https://www.d3-graph-gallery.com/connectedscatter.html
// https://github.com/d3/d3-scale-chromatic

charts.chart1 = function () {
  var dataSet;
  var xScale, yScale;
  var dots;

  var MAX_YEAR = 2018,
    MIN_YEAR = 2004;

  // List of groups
  var allGroups = [
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

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 100, bottom: 30, left: 100 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

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
    dataSet = data;
    drawChart(data);

    drawAnnotation();

    // listen to the slider
    d3.select('#mySlider').on('change', function (d) {
      selectedValue = this.value;
      updateChart(selectedValue);
    });

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
    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = reformatData(allGroups, data);

    // console.log(dataReady)

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal().domain(allGroups).range(d3.schemeTableau10);

    // Add X axis
    xScale = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return new Date(parseInt(d.Year), 0);
        })
      )
      .range([0, width]);

    xAxis = svg.append('g').attr('transform', 'translate(0,' + height + ')');

    xAxis.call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)));

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
    yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, function (d) {
          return +d['MonthlyUsers'];
        }),
        d3.max(data, function (d) {
          return +d['MonthlyUsers'];
        }),
      ])
      .range([height, 0]);

    yAxis = svg.append('g');
    yAxis.call(d3.axisLeft(yScale));

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
    line = d3
      .line()
      .x(function (d) {
        return xScale(+d.time);
      })
      .y(function (d) {
        return yScale(+d.value);
      });

    lines = svg
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
    dots = svg
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
      });

    // Second we need to enter in the 'values' part of this group
    points = dots
      .selectAll('myPoints')
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return xScale(d.time);
      })
      .attr('cy', function (d) {
        return yScale(d.value);
      })
      .attr('r', 5)
      .attr('stroke', 'white')
      .attr('class', function (d, i) {
        return 'dot_' + parseInt(d.time.getFullYear());
      })
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
        return (
          'translate(' +
          xScale(d.value.time) +
          ',' +
          yScale(d.value.value) +
          ')'
        );
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
      .attr('class', 'annotation chart1')
      .html('Facebook was the first to hit <br>1 billion users in 2012');
    annotation
      .append('line')
      .attr('x1', 190)
      .attr('x2', 430)
      .attr('y1', 210)
      .attr('y2', 320)
      .attr('class', 'annotation chart1');
  }

  function updateChart(sliderValue) {
    if (sliderValue) {
      // filter and reformat dataset
      data = dataSet.filter(
        (d) => new Date(d.Year) <= new Date(sliderValue + '-01-01')
      );
      var dataReady = reformatData(allGroups, data);

      // update the lines
      lines
        .data(dataReady)
        .transition()
        .duration(1000)
        .attr('d', function (d) {
          return line(d.values);
        });

      // update the dots
      for (var i = parseInt(sliderValue) + 1; i <= MAX_YEAR; i++) {
        d3.selectAll('.dot_' + i).style('display', 'none');
      }

      for (var i = parseInt(sliderValue); i >= MIN_YEAR; i--) {
        d3.selectAll('.dot_' + i).style('display', 'block');
      }

      // update title
      d3.select('#chart1-year-title').text(MIN_YEAR + ' to ' + sliderValue);

      // update the annotation
      if (parseInt(sliderValue) < 2012) {
        d3.selectAll('.annotation.chart1')
          .style("display", "none")
      } else {
        d3.selectAll('.annotation.chart1')
        .style("display", "block")
      }
    }
  }

  function reformatData(allGroup, data) {
    return allGroup.map(function (grpName) {
      return {
        name: grpName,
        values: data
          .filter(function (d) {
            return d.Entity === grpName;
          })
          .map(function (d) {
            return {
              time: new Date(d.Year),
              value: d.MonthlyUsers,
              group: d.Entity,
            };
          }),
      };
    });
  }
};
