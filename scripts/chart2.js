charts.chart2 = function () {
  // set the dimensions and margins of the graph
  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var xScale, yScale;
  var xAxis, yAxis;
  var svg;

  var mouseover, mousemove, mouseleave;

  var selection;

  function initialize() {
    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3
      .select('#chart2')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip');

    // Three function that change the tooltip when user hover / move / leave a cell
    mouseover = function (d) {
      tooltip
        .html('<strong>' + d.Entity + '</strong>' + '<br>' + d[selection] + '%')
        .style('opacity', 1);
    };
    mousemove = function (d) {
      tooltip
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 80 + 'px');
    };
    mouseleave = function (d) {
      tooltip.style('opacity', 0);
    };

    // append the svg object to the body of the page
    svg = d3
      .select('#chart2')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Initialize the X axis
    xScale = d3.scaleBand().range([0, width]).padding(0.2);
    xAxis = svg.append('g').attr('transform', 'translate(0,' + height + ')');

    // text label for the x axis
    svg
      .append('text')
      .attr(
        'transform',
        'translate(' + width / 2 + ' ,' + (height + margin.top + 20) + ')'
      )
      .style('text-anchor', 'middle')
      .text('Social Media Platform');

    // Initialize the Y axis
    yScale = d3.scaleLinear().range([height, 0]);
    yAxis = svg.append('g').attr('class', 'myYaxis');

    // text label for the y axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Percentage');

    // event handlers for buttons
    d3.select('button.chart2.men').on('click', function () {
      update('Men');
    });

    d3.select('button.chart2.women').on('click', function () {
      update('Women');
    });
  }

  // A function that create / update the plot for a given variable:
  function update(selectedVar) {
    selection = selectedVar;

    // Parse the Data
    d3.csv(
      '../data/percent-of-men-and-women-using-social-media-platforms-in-the-us.csv',
      function (data) {
        // X axis
        xScale.domain(
          data.map(function (d) {
            return d.Entity;
          })
        );
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale));

        // Add Y axis
        yScale.domain([
          0,
          d3.max(data, function (d) {
            return +d[selectedVar];
          }),
        ]);
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale));

        // variable u: map data to existing bars
        var u = svg.selectAll('rect').data(data);

        // update bars
        u.enter()
          .append('rect')
          .on('mouseover', mouseover)
          .on('mousemove', mousemove)
          .on('mouseleave', mouseleave)
          .merge(u)
          .transition()
          .duration(1000)
          .attr('x', function (d) {
            return xScale(d.Entity);
          })
          .attr('y', function (d) {
            return yScale(d[selectedVar]);
          })
          .attr('width', xScale.bandwidth())
          .attr('height', function (d) {
            return height - yScale(d[selectedVar]);
          })
          .attr('fill', '#69b3a2');

        d3.select('h4.chart2.title').text(
          'Social Media Usage of ' + selectedVar
        );
      }
    );
  }

  initialize();
  update('Men');
};
