// https://www.d3-graph-gallery.com/graph/barplot_horizontal.html

charts.chart4 = function () {
  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 30, bottom: 40, left: 90 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select('#chart4')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Parse the Data
  d3.csv('../data/users-by-age.csv', function (data) {
    console.log(data);

    // List of groups (here I have one group per column)
    var allGroup = data.columns.slice(1, data.columns.length);

    // add the options to the button
    d3.select('#chart4-select')
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
    d3.select('#chart4-select').on('change', function (d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property('value');
      // run the updateChart function with this selected option
      update(selectedOption);
    });
  });
};
