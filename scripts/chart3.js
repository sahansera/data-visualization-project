// https://www.d3-graph-gallery.com/graph/barplot_button_data_hard.html

charts.chart3 = function () {
  // set the dimensions and margins of the graph
  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // globals which we need later in other functions
  var xScale, yScale;
  var xAxis, yAxis;
  var selection;

  // append the svg object to the body of the page
  svg = d3
    .select('#chart3')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  function initialize() {

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
    d3.select('button.chart3.men').on('click', function () {
      update('Men');
    });

    d3.select('button.chart3.women').on('click', function () {
      update('Women');
    });
  }

  // A function that create / update the plot for a given variable:
  function update(selectedVar) {

    // update selection because it's used by tooltip function
    selection = selectedVar;

    // Parse the Data
    d3.csv(
      'data/percent-of-men-and-women-using-social-media-platforms-in-the-us.csv',
      function (data) {

        var allEntities = data.map(function (d) {
          return d.Entity;
        });

        // A color scale: one color for each group
        var myColor = d3.scaleOrdinal().domain(allEntities).range(colorScale);

        // X axis
        xScale.domain(
          allEntities
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

        // draw tooltips
        var mouseEventHandlers = drawTooltips();
        var mouseover = mouseEventHandlers.mouseover,
          mouseleave = mouseEventHandlers.mouseleave,
          mousemove = mouseEventHandlers.mousemove;

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
          .attr('fill', function (d, i) {
            return myColor(d.Entity);
          });

        d3.select('h3.chart3.title').text(
          'Social Media Usage of ' + selectedVar + ' in 2019'
        );
        showHideAnnotations(selectedVar);
      }
    );
  }

  function drawTooltips() {
    var tooltip = d3
      .select('#chart3')
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
      .attr('x', 150)
      .attr('y', 20)
      .attr('class', 'annotation chart3 men')
      .html('Youtube usage among Men is higher compared to Women');
    annotation
      .append('text')
      .attr('x', 150)
      .attr('y', 20)
      .attr('class', 'annotation chart3 women')
      .html('Facebook usage among Women is higher compared to Men');
    annotation
      .append('text')
      .attr('x', 250)
      .attr('y', 40)
      .attr('class', 'annotation secondary')
      .text('(hover over the bars to explore more info)');
    // annotation
    //   .append('line')
    //   .attr('x1', 410)
    //   .attr('x2', 800)
    //   .attr('y1', 20)
    //   .attr('y2', 40)
    //   .attr('class', 'annotation chart3 men');

    annotation
      .append('line')
      .attr('x1', 610)
      .attr('x2', 800)
      .attr('y1', 20)
      .attr('y2', 40)
      .attr('class', 'annotation chart3 men');
    annotation
      .append('line')
      .attr('x1', 210)
      .attr('x2', 70)
      .attr('y1', 30)
      .attr('y2', 80)
      .attr('class', 'annotation chart3 women');
;
  }

  function showHideAnnotations(selectedVar) {
    if (selectedVar === 'Men') {
      d3.selectAll('.annotation.chart3.men').style('display', 'block');
      d3.selectAll('.annotation.chart3.women').style('display', 'none')
    } else {
      d3.selectAll('.annotation.chart3.men').style('display', 'none');
      d3.selectAll('.annotation.chart3.women').style('display', 'block')
    }
  }

  initialize();
  update('Men');
  drawAnnotation();
};
