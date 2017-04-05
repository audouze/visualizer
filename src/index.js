import * as d3 from 'd3';

// Set the dimensions of the canvas / graph
const margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Get the data
d3.json('assets/1491410512957.json', function(error, data) {
  if (error !== null) {
    console.log(error);
    return;
  }

  let start = +Infinity;
  let stop = -Infinity;

  for (let i = 0; i < data.length; i++) {
    if (data[i].time < start)
      start = data[i].time;

    if (data[i].time > stop)
      stop = data[i].time;
  }

  // Set the ranges
  const xDomain = [Math.floor(start), Math.ceil(stop)];
  const x = d3.scaleLinear()
    .domain(xDomain)
    .range([0, width]);

  const yDomain = [0, 1];
  const y = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

  // Define the axes
  const xAxis = d3.axisBottom()
    .scale(x)
    .ticks(xDomain[1] - xDomain[0]);

  const yAxis = d3.axisLeft()
    .scale(y)
    .ticks(yDomain[1] - yDomain[0]);


  //separate values
  const dataGroup = d3.nest()
  .key(function(d) {
      return d.data[0];
  })
  .entries(data);

  console.log('dataGroup :', dataGroup);

  const dataDevice = dataGroup.slice(0,1);
  const dataAvg = dataGroup.slice(1,2);

  console.log('dataDevice :', dataDevice);
  console.log('dataAvg :', dataAvg);



  // define the line
  const path = d3.line()
    .x(d => {
      return x(d.time)
    })
    .y(d => {
      return y(d.data[2])
    });


  // adds the svg canvas
  const svg = d3.select('body')
    .append('svg')
      .attr('version', '1.1')
      .attr('baseProfile', 'full')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


dataDevice.forEach(function(d, i) {
    svg.append('path')
        .attr('d', path(d.values))
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
});

dataAvg.forEach(function(d, i) {
    svg.append('path')
        .attr('d', path(d.values))
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
});


  // add the x axis
  svg.append('g')
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .attr('shape-rendering', 'crispEdges')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  // add the y axis
  svg.append('g')
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .attr('shape-rendering', 'crispEdges')
    .call(yAxis);
});


