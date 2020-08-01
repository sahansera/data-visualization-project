// Ref - https://www.d3-graph-gallery.com/graph/barplot_horizontal.html

charts.chart2 = function () {
  var xScale, yScale;
  var dataSet;
  var line;
  var myColor;
  var selectedGroup = '18-29';
  var focus;

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 30, bottom: 40, left: 90 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select('#chart2')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Initialize the dropdown
  d3.select('#chart2-select').selectAll('option').remove();

  // Parse the data
  d3.csv('data/users-by-age.csv', function (data) {
    dataSet = data;
    initialize();
    drawAnnotation();

    // When the button is changed, run the updateChart function
    d3.select('#chart2-select').on('change', function (d) {
      var selectedOption = d3.select(this).property('value');
      update(selectedOption);
    });
  });

  function initialize() {
    var allGroups = dataSet.columns.slice(1, dataSet.columns.length);

    // add the options to the button
    d3.select('#chart2-select')
      .selectAll('myOptions')
      .data(allGroups)
      .enter()
      .append('option')
      .text(function (d) {
        return d;
      }) // text showed in the menu
      .attr('value', function (d) {
        return d;
      }); // corresponding value returned by the button

    // A color scale: one color for each group
    myColor = d3.scaleOrdinal().domain(allGroups).range(colorScale);

    // Add X axis --> it is a date format
    xScale = d3
      .scaleTime()
      .domain(
        d3.extent(dataSet, function (d) {
          return new Date(parseInt(d.Date), 0);
        })
      )
      .range([0, width]);

    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale));

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
    yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(yScale));

    // Initialize line with group a
    line = svg
      .append('g')
      .append('path')
      .datum(dataSet)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return xScale(new Date(+d.Date, 0));
          })
          .y(function (d) {
            return yScale(+d[selectedGroup]);
          })
      )
      .attr('stroke', function (d) {
        return myColor(selectedGroup);
      })
      .style('stroke-width', 4)
      .style('fill', 'none');

    // text label for the y axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 30)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Percentage');

    focus = svg.append('g').attr('class', 'focus').style('display', 'none');
    focus
      .append('circle')
      .attr('r', 5)
      .attr('fill', function (d) {
        return myColor(selectedGroup);
      });

    var mouseEventHandlers = drawTooltips();
    var mouseover = mouseEventHandlers.mouseover,
      mouseleave = mouseEventHandlers.mouseleave,
      mousemove = mouseEventHandlers.mousemove;

    svg
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave)
      .on('mousemove', mousemove);
  }

  function update(selection) {
    selectedGroup = selection;
    // Create new data with the selection?
    var dataFilter = dataSet.map(function (d) {
      return { time: new Date(+d.Date, 0), value: +d[selectedGroup] };
    });

    // Give these new data to update line
    line
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return xScale(+d.time);
          })
          .y(function (d) {
            return yScale(+d.value);
          })
      )
      .attr('stroke', function (d) {
        return myColor(selectedGroup);
      });

    focus.select('circle').attr('fill', function (d) {
      return myColor(selectedGroup);
    });
    drawAnnotation();
  }

  function drawTooltips() {
    var tooltip = d3
      .select('#chart2')
      .append('div')
      .style('display', 'none')
      .attr('class', 'tooltip');

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
      d3.select('.focus').style('display', null);
    };
    var mousemove = function (d) {
      var x0 = xScale.invert(d3.mouse(this)[0]);
      var filteredData = dataSet.find((x) => x.Date == x0.getFullYear());

      var xValue = new Date(x0.getFullYear() + '-01-01');
      var yValue = filteredData[selectedGroup];

      focus.attr(
        'transform',
        'translate(' + xScale(xValue) + ',' + yScale(+yValue) + ')'
      );

      tooltip
        .html(
          '<strong>Year: </strong>' +
            x0.getFullYear() +
            '<br>' +
            '<strong>Percentage: </strong>' +
            yValue
        )
        .style('display', 'block');

      tooltip
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 80 + 'px');
    };

    var mouseleave = function (d) {
      focus.style('display', 'none');
      tooltip.style('display', 'none');
    };

    return {
      mouseover: mouseover,
      mouseleave: mouseleave,
      mousemove: mousemove,
    };
  }

  function drawAnnotation() {
    d3.selectAll('.annotation.chart2').remove();
    var annotation = svg.append('g');
    if (selectedGroup == '18-29') {
      annotation
        .append('text')
        .attr('x', 400)
        .attr('y', 180)
        .attr('class', 'annotation chart2')
        .text('Young adults were the early adopters of social media');
      annotation
        .append('text')
        .attr('x', 420)
        .attr('y', 200)
        .attr('class', 'annotation chart2 secondary')
        .text('(hover over data points to explore more info)');
      annotation
        .append('line')
        .attr('x1', 330)
        .attr('x2', 390)
        .attr('y1', 180)
        .attr('y2', 180)
        .attr('class', 'annotation chart2');
      annotation
        .append('circle')
        .attr('cx', 230)
        .attr('cy', 180)
        .attr('r', 100)
        .attr('class', 'annotation chart2');
    }
  }
};
