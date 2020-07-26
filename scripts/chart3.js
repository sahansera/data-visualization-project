// https://www.d3-graph-gallery.com/graph/barplot_stacked_hover.html

charts.chart3 = function () {
  // set the dimensions and margins of the graph
  var margin = {
      top: 20,
      right: 30,
      bottom: 90,
      left: 50,
    },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select('#chart3')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Parse the Data
  d3.csv(
    '../data/daily-hours-spent-with-digital-media-per-adult-user.csv',
    function (data) {
      drawChart(data);
      drawAnnotation();
    }
  );

  function drawChart(data) {
    // List of subgroups = header of the csv files
    var subgroups = data.columns.slice(1);

    // List of groups
    var groups = d3
      .map(data, function (d) {
        return d.Year;
      })
      .keys();

    // Add X axis
    var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // text label for the x axis
    svg
      .append('text')
      .attr(
        'transform',
        'translate(' + width / 2 + ' ,' + (height + margin.top + 30) + ')'
      )
      .style('text-anchor', 'middle')
      .text('Year');

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 7]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // text label for the y axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Hours Spent Daily');

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal().domain(subgroups).range(d3.schemeTableau10);

    // stack per subgroup
    var stackedData = d3.stack().keys(subgroups)(data);

    var mouseEventHandlers = drawTooltips();
    var mouseover = mouseEventHandlers.mouseover,
      mouseleave = mouseEventHandlers.mouseleave,
      mousemove = mouseEventHandlers.mousemove;

    // Show the bars
    svg
      .append('g')
      .selectAll('g')
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', function (d) {
        return color(d.key);
      })
      .selectAll('rect')
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function (d) {
        return d;
      })
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return x(d.data.Year);
      })
      .attr('y', function (d) {
        return y(d[1]);
      })
      .attr('height', function (d) {
        return y(d[0]) - y(d[1]);
      })
      .attr('width', x.bandwidth())
      .attr('stroke', 'grey')
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    drawLegend(color);
  }

  function drawTooltips() {
    var tooltip = d3
      .select('#chart3')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip');

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
      var subgroupName = d3.select(this.parentNode).datum().key;
      var subgroupValue = d.data[subgroupName];
      tooltip
        .html(
          '<strong>' +
            subgroupName +
            '</strong>' +
            '<br>' +
            subgroupValue +
            ' hours per adult user '
        )
        .style('opacity', 1);
    };
    var mousemove = function (d) {
      tooltip
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 80 + 'px');
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

  function drawLegend(color) {
    // add legend
    orderedSubgroups = ['Mobile', 'Desktop', 'Other'];
    var legend = svg
      .selectAll('.legend')
      .data(orderedSubgroups)
      .enter()
      .append('g');

    legend
      .append('rect')
      .attr('fill', color)
      .attr('width', 20)
      .attr('height', 20)
      .attr('y', function (d, i) {
        return height + 60;
      })
      // .attr('x', width - (margin.right - 250));
      .attr('x', function (d, i) {
        return (i * 120) + (width / 2) - (margin.right + 80);
      });

    legend
      .append('text')
      .attr('class', 'label')
      // .attr("height", 20)
      .attr('y', height + 75)
      // .attr('x', width - (margin.right - 290))
      .attr('x', function (d, i) {
        return (i * 120) + ((width / 2) + 25) - (margin.right + 80);
      })
      .attr('text-anchor', 'start')
      .text(function (d, i) {
        return orderedSubgroups[i];
      });
  }

  function drawAnnotation() {
    var annotation = svg.append('g');
    annotation
      .append('text')
      .attr('x', 150)
      .attr('y', 20)
      .attr('class', 'annotation')
      .html('Mobile usage has surpassed Desktop usage over the last decade');
    annotation
      .append('line')
      .attr('x1', 610)
      .attr('x2', 800)
      .attr('y1', 20)
      .attr('y2', 40)
      .attr('class', 'annotation')
      
    annotation
      .append('line')
      .attr('x1', 310)
      .attr('x2', 70)
      .attr('y1', 30)
      .attr('y2', 300)
      .attr('class', 'annotation');
  }
};
