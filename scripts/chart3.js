// https://www.d3-graph-gallery.com/graph/barplot_stacked_hover.html

charts.chart3 = function () {
  // set the dimensions and margins of the graph
  var margin = {
      top: 10,
      right: 200,
      bottom: 20,
      left: 50,
    },
    width =
      960 - margin.left - margin.right,
    height =
      400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#chart3")
    .append("svg")
    .attr(
      "width",
      width + margin.left + margin.right
    )
    .attr(
      "height",
      height + margin.top + margin.bottom
    )
    .append("g")
    .attr(
      "transform",
      "translate(" +
        margin.left +
        "," +
        margin.top +
        ")"
    );

  // Parse the Data
  d3.csv(
    "../data/daily-hours-spent-with-digital-media-per-adult-user.csv",
    function (data) {
      // List of subgroups = header of the csv files
      var subgroups = data.columns.slice(
        1
      );

      // List of groups
      var groups = d3
        .map(data, function (d) {
          return d.Year;
        })
        .keys();
      
      // Add X axis
      var x = d3
        .scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2]);
      svg.append("g")
        .attr(
          "transform",
          "translate(0," +
            height +
            ")"
        )
        .call(
          d3
            .axisBottom(x)
            .tickSizeOuter(0)
        );

      // Add Y axis
      var y = d3
        .scaleLinear()
        .domain([0, 7])
        .range([height, 0]);
      svg.append("g").call(
        d3.axisLeft(y)
      );

      // color palette = one color per subgroup
      var color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range([
          "#ffd53e",
          "#349840",
          "#3360a9",
        ]);

      //stack the data? --> stack per subgroup
      var stackedData = d3
        .stack()
        .keys(subgroups)(data);

      // ----------------
      // Create a tooltip
      // ----------------
      var tooltip = d3
        .select("#chart3")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");
        
      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (d) {
        var subgroupName = d3
          .select(this.parentNode)
          .datum().key;
        var subgroupValue =
          d.data[subgroupName];
        tooltip
          .html(
              "<strong>"+subgroupName+"</strong>" +
              "<br>" +
              "Daily Hours: " +
              subgroupValue
          )
          .style("opacity", 1);
      };
      var mousemove = function (d) {
        tooltip
          .style(
            "left", d3.event.pageX + "px"
          )
          .style(
            "top", (d3.event.pageY - 80)  + "px"
          );
      };
      var mouseleave = function (d) {
        tooltip.style("opacity", 0);
      };

      // Show the bars
      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", function (d) {
          return color(d.key);
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
          return d;
        })
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return x(d.data.Year);
        })
        .attr("y", function (d) {
          return y(d[1]);
        })
        .attr("height", function (d) {
          return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
        .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    var legend = svg.selectAll(".legend")
        .data(subgroups)
        .enter()
        .append("g")

    legend.append("rect")
        .attr("fill", color)
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", function (d, i) {
            return i * 50;
        })
        .attr("x", width - (margin.right - 250));

    legend.append("text")
        .attr("class", "label")
        // .attr("height", 20)
        .attr("y", function (d, i) {
            return (16 + (i * 46));
        })
        .attr("x", width - (margin.right - 290))
        .attr("text-anchor", "start")
        .text(function (d, i) {
            return subgroups[i];
        }); }

  );
};