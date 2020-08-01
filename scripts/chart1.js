// Ref - https://www.d3-graph-gallery.com/connectedscatter.html
charts.chart1 = function () {
  var dataSet;
  var xScale, yScale;
  var dots;

  var selectedValue, myVar, isAnimationPlaying;

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

  var myColor = d3.scaleOrdinal().domain(allGroups).range(colorScale);

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 200, bottom: 30, left: 100 },
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
  d3.csv('data/users-by-social-media-platform.csv', function (data) {
    dataSet = data;
    drawChart(data);

    drawAnnotation();

    // listen to the slider
    d3.select('#mySlider').on('input', function (d) {
      selectedValue = this.value;
      updateChart(selectedValue);
    });

    //listen to playback button
    d3.select("#chart1-play-btn")
      .on("click", function() {
        if (isAnimationPlaying) {
          // We need to clear the timer
          clearInterval(myVar);
          isAnimationPlaying = false;
          d3.select("#chart1-play-btn").text("Play");
        } else {
          myVar = setInterval(playAnimation, 700);
        }
      });
  });  

  function playAnimation() {
    var val = parseInt(selectedValue);
    if (val < MAX_YEAR) {
      
      // We haven't reached the end yet, so continue
      d3.select('#mySlider').property("value", ++val)
      selectedValue = val.toString();
      updateChart(selectedValue);
      isAnimationPlaying = true;
      d3.select("#chart1-play-btn").text("Pause");
    } else if (selectedValue == MAX_YEAR && !isAnimationPlaying || selectedValue == undefined) {
      
      // We have reached the end so start over
      selectedValue = MIN_YEAR;
      d3.select('#mySlider').property("value", MIN_YEAR.toString())
      updateChart(selectedValue);
      isAnimationPlaying = true;
      d3.select("#chart1-play-btn").text("Pause");
    }  else {
      isAnimationPlaying = false;
      clearInterval(myVar);
      d3.select("#chart1-play-btn").text("Play");
    }
  }

  function drawChart(data) {
    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = reformatData(allGroups, data);

    // console.log(dataReady)

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
    yAxis.call(d3.axisLeft(yScale).ticks(4).tickFormat(yAxisTickFormat));

    // text label for the y axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 30)
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

    // Add one dot in the legend for each name.
    drawLegend();
  }

  // Use D3's number format that generates SI prefixes for the Y axis.
  // Ref - http://bl.ocks.org/curran/4df29e2f8c6e20ed2baf
  var siFormat = d3.format("0.2s");
  function yAxisTickFormat(num){
    // Replace the confusing G (for Giga) with 
    // the more recognizable B (for Billion).
    return siFormat(num).replace("G", "B");
  }

  function drawTooltips() {
    var tooltip = d3
      .select('#chart1')
      .append('div')
      .style('display', 'none')
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
        .style('display', 'block');
    };
    var mousemove = function (d) {
      tooltip
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 110 + 'px');
    };
    var mouseleave = function (d) {
      tooltip.style('display', 'none');
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
      .attr('y', 180)
      .attr('class', 'annotation chart1')
      .text('Facebook was the first to hit 1 billion users in 2012');
    annotation
      .append('text')
      .attr('x', 120)
      .attr('y', 200)
      .attr('class', 'annotation chart1 secondary')
      .text('(hover over data points to explore more info)')
    annotation
      .append('line')
      .attr('x1', 190)
      .attr('x2', 330)
      .attr('y1', 210)
      .attr('y2', 290)
      .attr('class', 'annotation chart1');
    annotation
      .append("circle")
      .attr("cx",370)
      .attr("cy",320)
      .attr("r", 50)
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
        .duration(200)
        .attr('d', function (d) {
          return line(d.values);
        })
        .ease(d3.easeLinear);

      // update the dots
      for (var i = parseInt(sliderValue) + 1; i <= MAX_YEAR; i++) {
        d3.selectAll('.dot_' + i).style('display', 'none');
      }

      for (var i = parseInt(sliderValue); i >= MIN_YEAR; i--) {
        d3.selectAll('.dot_' + i).style('display', 'block');
      }

      // update title
      d3.select('#chart1-year-title').text("Monthly Active Users From " + MIN_YEAR + ' to ' + sliderValue);

      // update the annotation
      if (parseInt(sliderValue) < 2012) {
        d3.selectAll('.annotation.chart1').style('display', 'none');
      } else {
        d3.selectAll('.annotation.chart1').style('display', 'block');
      }
    }
  }

  function drawLegend() {
    var size = 20;
    svg
      .selectAll('legendDots')
      .data(allGroups)
      .enter()
      .append('circle')
      .attr('cx', width + 70)
      .attr('cy', function (d, i) {
        return height - 200 + i * (size + 5);
      })
      .attr('r', 5)
      .style('fill', function (d) {
        return myColor(d);
      });

    // Add labels next to legend dots
    svg
      .selectAll('legendLabels')
      .data(allGroups)
      .enter()
      .append('text')
      .attr('x', width + size * 4.2)
      .attr('y', function (d, i) {
        return i * (size + 5) + (size / 2) + (height - 210);
      })
      .style('fill', function (d) {
        return myColor(d);
      })
      .text(function (d) {
        return d;
      })
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle')
      .on("click", function(d){
        // is the element currently visible ?
        currentOpacity = d3.selectAll("." + d.name).style("opacity")
        // Change the opacity: from 0 to 1 or from 1 to 0
        d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0:1)

      });
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
