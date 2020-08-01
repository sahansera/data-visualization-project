// Ref - https://www.d3-graph-gallery.com/graph/barplot_horizontal.html

charts.chart2 = function () {
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

  // Clear the dropwdown
  d3.select("#chart2-select")
    .selectAll("option")
    .remove();

  var bisectDate = d3.bisector(function (d) {
    return d.date;
  }).left;

  // Parse the data
  d3.csv('data/users-by-age.csv', function (data) {
    console.log(data);

    // List of groups (here I have one group per column)
    var allGroup = data.columns.slice(1, data.columns.length);

    // add the options to the button
    d3.select('#chart2-select')
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) {
        return d;
      }) // text showed in the menu
      .attr('value', function (d) {
        return d;
      }); // corresponding value returned by the button

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal().domain(allGroup).range(colorScale);

    // Add X axis --> it is a date format
    var x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return new Date(parseInt(d.Date), 0);
        })
      )
      .range([0, width]);

    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

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
    var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // Initialize line with group a
    var line = svg
      .append('g')
      .append('path')
      .datum(data)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return x(new Date(+d.Date, 0));
          })
          .y(function (d) {
            return y(+d['18-29']);
          })
      )
      .attr('stroke', function (d) {
        return myColor('18-29');
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

    var focus = svg.append('g').attr('class', 'focus').style('display', 'none');

    focus.append('circle').attr('r', 5);

    focus.append('div').style('display', 'none').attr('class', 'tooltip');

    focus
      .append('text')
      .attr('class', 'tooltip-date')
      .attr('x', 18)
      .attr('y', -2);

    focus.append('text').attr('x', 18).attr('y', 18).text('Percentage:');

    focus
      .append('text')
      .attr('class', 'tooltip-likes')
      .attr('x', 100)
      .attr('y', 18);

    svg
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', function () {
        focus.style('display', null);
      })
      .on('mouseout', function () {
        focus.style('display', 'none');
      })
      .on('mousemove', mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - parseInt(d0.Date) > parseInt(d1.Date) - x0 ? d1 : d0;

      var filteredByDate = data.filter((x) => x.Date == x0.getFullYear());

      var xValue = new Date(x0.getFullYear() + '-01-01');
      var yValue = filteredByDate[0]['18-29'];
      focus.attr(
        'transform',
        'translate(' + x(xValue) + ',' + y(+yValue) + ')'
      );

      // focus.select(".tooltip")
      //         .html(
      //           '<strong>Platform: </strong>' +
      //             x0.getFullYear() +
      //             '<br>' +
      //             '<strong>Users: </strong>' +
      //             yValue
      //         )
      //         .style('display', 'block');

      // focus.select(".tooltip")
      //   .style('left', d3.event.pageX + 'px')
      //   .style('top', d3.event.pageY - 110 + 'px');

      focus.select('.tooltip-date').text('Year: ' + x0.getFullYear());
      focus.select('.tooltip-likes').text(yValue + '%');
    }

    // A function that update the chart
    function update(selectedGroup) {
      // Create new data with the selection?
      var dataFilter = data.map(function (d) {
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
              return x(+d.time);
            })
            .y(function (d) {
              return y(+d.value);
            })
        )
        .attr('stroke', function (d) {
          return myColor(selectedGroup);
        });
    }

    // When the button is changed, run the updateChart function
    d3.select('#chart2-select').on('change', function (d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property('value');
      // run the updateChart function with this selected option
      update(selectedOption);
    });
  });
};
