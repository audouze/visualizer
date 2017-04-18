import * as d3 from 'd3';
import * as lfo from 'waves-lfo/common';

// Set the dimensions of the canvas / graph
const margin = {top: 50, right: 100, bottom: 50, left: 100},
    width = 1000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


// get a value from a string
function filterInt(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return NaN;
}

// define a function which will allow to set the ticks in a generic way
function analysedNumberUnit(n) {
  var s = n.toString();
  var unit = s.length;
  return filterInt('1'.concat('0'.repeat((unit-1))));
}

// Get the data
d3.json('assets/1491835451553.json', function(error, data) {
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


  //separate data
  const dataGroup = d3.nest()
  .key(function(d) {
      return d.data[0];
  })
  .entries(data);

  // console.log('dataGroup :', dataGroup);

  // device 0 values
  const dataDevice0 = dataGroup.slice(0, 1);
  // device 1 values
  const dataDevice1 = dataGroup.slice(1, 2);

  console.log(dataDevice0);

  // get all the rssi values in one array
  let device0Array = [];
  let device1Array = [];

  for (let i = 0; i < dataDevice0[0].values.length; i++) {
    const dataDevice0Content = dataDevice0[0].values[i].data[2];
    device0Array.push(dataDevice0Content);
  }

  for (let i = 0; i < dataDevice1[0].values.length; i++) {
    const dataDevice1Content = dataDevice1[0].values[i].data[2];
    device1Array.push(dataDevice1Content);
  }

  // make a group with only the rssi data
  const dataDeviceGroup = device0Array.concat(device1Array);

  // markers
  const dataMarker = dataGroup.slice(2, 3);

  // get all the marker values in one array
  let markerArray = [0];
  for (let i = 0; i < dataMarker[0].values.length; i++) {
    const dataMarkerContent = dataMarker[0].values[i].time;
    markerArray.push(dataMarkerContent);
  }

  markerArray.push(dataDevice0[0].values[dataDevice0[0].values.length - 1].time);


  // let dataDist = [];
  // for (let i = 0; i < dataDevice0[0].values.length; i++) {
  //   dataDist.push({time:dataDevice0[0].values[i].time, distance:(0.89976 * Math.pow(dataDevice0[0].values[i].data[2] / -55, 7.7095) + 0.111)});
  // }

  const dataDist = [];
  const records = dataDevice0[0].values;
  const movingAverage = new lfo.operator.MovingAverage({ order: 3 });
  movingAverage.initStream({ frameSize: 1, frameType: 'scalar' });

  const movingMedian = new lfo.operator.MovingMedian({ order: 7 });
  movingMedian.initStream({ frameSize: 1, frameType: 'scalar' });

  function getDistance(rssi) {
    return 1.0998 * (Math.pow(rssi / -57.5, 7.4095) + 0.0110);
  }

  window.getDistance = getDistance;

  for (let i = 0; i < records.length; i++) {
    const time = records[i].time;
    const rssi = records[i].data[2];
    const meanRssi = movingAverage.inputScalar(rssi);
    // const meanRssi = movingMedian.inputScalar(rssi);
    const distance = getDistance(meanRssi);

    dataDist.push({ time, distance });
  }

  const avgGeneral = [-29.43, -58.16, -62.88, -60.32, -60.34, -66.36, -64.45, -65.58, -62.36, -64.26, -70];
  const avgPrecise = [-20, -40.52, -43.65, -49.22, -48.11, -48.57, -51.54, -50.07, -49.25, -55.89, -53.2, -53.25, -58.29, -58.65, -55.67, -56.86, -61.51, -59.94, -61.44, -58.6, -62.88];

  function linearInterpolation(rssi) {
    if (avgPrecise[0] >= rssi && rssi > avgGeneral[2]) {
      if (avgPrecise[0] >= rssi && rssi > avgPrecise[1]) {
        return (rssi - avgPrecise[0]) * 0.1 / (avgPrecise[1] - avgPrecise[0]);
      } else if (avgPrecise[1] >= rssi && rssi > avgPrecise[2]) {
        return 0.1 + (rssi - avgPrecise[1]) * 0.1 / (avgPrecise[2] - avgPrecise[1]);
      } else if (avgPrecise[2] >= rssi && rssi > avgPrecise[3]) {
        return 0.2 + (rssi - avgPrecise[2]) * 0.1 / (avgPrecise[3] - avgPrecise[2]);
      } else if (avgPrecise[3] >= rssi && rssi > avgPrecise[6]) {
        return 0.3 + (rssi - avgPrecise[3]) * 0.3 / (avgPrecise[6] - avgPrecise[3]);
      } else if (avgPrecise[6] >= rssi && rssi > avgPrecise[9]) {
        return 0.6 + (rssi - avgPrecise[6]) * 0.3 / (avgPrecise[9] - avgPrecise[6]);
      } else if (avgPrecise[9] >= rssi && rssi > avgPrecise[12]) {
        return 0.9 + (rssi - avgPrecise[9]) * 0.3 / (avgPrecise[12] - avgPrecise[9]);
      } else if (avgPrecise[12] >= rssi && rssi > avgPrecise[20]) {
        return 1.2 + (rssi - avgPrecise[12]) * 0.8 / (avgPrecise[20] - avgPrecise[12]);
      }
    } else if (avgGeneral[2] >= rssi && rssi > avgGeneral[5]) {
        return  2 + (rssi - avgGeneral[2]) * 3 / (avgGeneral[5] - avgGeneral[2]);
    } else if (avgGeneral[5] >= rssi && rssi > avgGeneral[10]) {
        return  5 + (rssi - avgGeneral[5]) * 5 / (avgGeneral[10] - avgGeneral[5]);
    } else {
      return Infinity;
    }
  }

  // let dataDist = [];
  // for (let i = 0; i < dataDevice0[0].values.length; i++) {
  //   dataDist.push({time:dataDevice0[0].values[i].time, distance:linearInterpolation(dataDevice0[0].values[i].data[2])});
  // }


  console.log('dataDist :', dataDist);

  // get max and min values to make the y axis domain range generic
  let dataDistArray = [];
  for (let i = 0; i < dataDist.length; i++) {
    dataDistArray.push(dataDist[i].distance);
  }
  let maxDataDeviceArray = Math.max(...dataDistArray);
  let minDataDeviceArray = Math.min(...dataDistArray);

  // Set the ranges
  const xDomain = [Math.floor(start), Math.ceil(stop)];
  const x = d3.scaleLinear()
    .domain(xDomain)
    .range([0, width]);

  const yDomain = [0, 10];
  const y = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

  // Define the axes
  const xAxis = d3.axisBottom()
    .scale(x)
    .ticks(10 * Math.floor((xDomain[1] - xDomain[0])/analysedNumberUnit(xDomain[1] - xDomain[0])));

  const yAxis = d3.axisLeft()
    .scale(y)
    .ticks((yDomain[1] - yDomain[0]) / 2);

  const markerAxis = d3.axisLeft()
  .scale(y);


  // define the line
  const path = d3.line()
    .x(d => {
      return x(d.time)
    })
    .y(d => {
      return y(d.distance)
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


  // text label for the x axis
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr("y", 0 - (margin.left / 2))
    .attr("x",0 - (height / 2))
    .attr('text-anchor', 'middle')
    .text('DIST (m)');

  // text label for the y axis
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + (margin.bottom / 2) + 20)
    .attr('text-anchor', 'middle')
    .text('TIME (s)');

  // add the x axis
  svg.append('g')
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .attr('shape-rendering', 'crispEdges')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x-axis')
    .call(xAxis);

  // add the y axis
  svg.append('g')
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .attr('shape-rendering', 'crispEdges')
    .attr('class', 'y-axis')
    .call(yAxis);

    // add markers
  for (let i = 0; i < dataMarker[0].values.length; i++) {
    d3.selectAll('g.x-axis')
    .append('line')
    .attr('shape-rendering', 'crispEdges')
    .attr('stroke', 'black')
    .attr('x1', x(dataMarker[0].values[i].time))
    .attr('y1', 0)
    .attr('x2', x(dataMarker[0].values[i].time))
    .attr('y2', -height);
    if ( i%2 == 0) {
      if(i%4 == 0) {
        // add marker text
        svg.append('text')
        .attr('transform', 'translate(' +
          x(dataMarker[0].values[i].time - 3) + ',' +
          (- margin.top / 3) + ')')
        .attr('text-anchor', 'start')
        .attr('fill', 'black')
        .text('move ' + (dataMarker[0].values.indexOf(dataMarker[0].values[i]) + 1));
      }
      else {
        svg.append('text')
        .attr('transform', 'translate(' +
          x(dataMarker[0].values[i].time - 3) + ',' +
          (- margin.top / 1.5) + ')')
        .attr('text-anchor', 'start')
        .attr('fill', 'black')
        .text('move ' + (dataMarker[0].values.indexOf(dataMarker[0].values[i]) + 1));
      }
    }
  }

  // add x axis grid lines
  d3.selectAll('g.x-axis g.tick')
    .append('line')
    .attr('shape-rendering', 'crispEdges')
    .attr('stroke', 'lightgrey')
    .attr('x1', 0.5)
    .attr('y1', 0)
    .attr('x2', 0.5)
    .attr('y2', -height);

  // add y axis grid lines
  d3.selectAll('g.y-axis g.tick')
    .append('line')
    .attr('shape-rendering', 'crispEdges')
    .attr('stroke', 'lightgrey')
    .attr('x1', 0)
    .attr('y1', 0.5)
    .attr('x2', width)
    .attr('y2', 0.5);

  // add path
    svg.append('path')
    .attr('d', path(dataDist))
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('fill', 'none');



  // make an array of arrays containing distance values between each marker
  let betweenArray = [{key: null, arr: []}];
  let betweenArraysDist = [];


  function isBetweenMarkers(u, val) {
    if (val >= markerArray[u]) {
      if (val <= markerArray[(u+1)]) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  function makeBetweenArrays0(u) {
    betweenArray = [{key: u, arr: []}]
    for (let i = 0; i < dataDistArray.length; i++) {
      if (isBetweenMarkers(u, dataDist[i].time)) {
        betweenArray[0].arr.push(dataDistArray[i]);
      }
    }
    betweenArraysDist.push(betweenArray);
  }
        console.log(betweenArray)

  for (let i = 0; i < markerArray.length - 1; i++) {
    makeBetweenArrays0(i);
  }

console.log(betweenArraysDist);

  // add an array of average distance values between each marker
  let avgArrayDist = [];

  for (let i = 0; i < betweenArraysDist.length; i++) {
    function avg() {
      let somme = betweenArraysDist[i][0].arr.reduce((a, b) => {
        return (a + b);
      });
      return Math.round(100 * (somme / betweenArraysDist[i][0].arr.length)) / 100;
    }
    avgArrayDist.push(avg());
  }

  console.log('avgArrayDist :', avgArrayDist);



  function adjustWidthDist(number) {
    if (analysedNumberUnit(number) == 1) {
      return 20;
    }
    else {
      return 30;
    }
  }


  // display average distance value between each marker
  for (let i = 0; i < avgArrayDist.length; i++) {
    if ( i%2 == 0) {
      if (i%4 == 0) {
        svg.append('rect')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 25) + ',' +
          (y(dataDistArray[i] + 5) - 10) + ')')
        .attr('fill', 'white')
        .attr('stroke-width', 1)
        .attr('stroke', 'blue')
        .attr("width", 50)
        .attr("height", 15);
        svg.append('text')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 22) + ',' +
          (y(dataDistArray[i] + 5)) + ')')
        .attr('text-anchor', 'start')
        .attr('font-size', '8px')
        .attr('fill', 'blue')
        .text('Avg   = ' + (Math.round(avgArrayDist[i] * 100) / 100));
      }
      else {
        svg.append('rect')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 25) + ',' +
          (y(dataDistArray[i] + 4) - 10) + ')')
        .attr('fill', 'white')
        .attr('stroke-width', 1)
        .attr('stroke', 'blue')
        .attr("width", 50)
        .attr("height", 15);
        svg.append('text')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 22) + ',' +
          (y(dataDistArray[i] + 4)) + ')')
        .attr('text-anchor', 'start')
        .attr('font-size', '8px')
        .attr('fill', 'blue')
        .text('Avg   = ' + (Math.round(avgArrayDist[i] * 100) / 100));
      }
    }
  }

  // display relative error between real distance and estimated distance
  function calculateError(index) {
    if (transformValue(index) == 0) {
      return avgArrayDist[index] * 100;
    }
    else {
      return Math.abs(Math.round(100 * ((Math.round(avgArrayDist[index] * 100) / 100) -
      transformValue(index)) /
      transformValue(index)));
    }
  }

  let errorArray = [];
  for (let i = 0; i < avgArrayDist.length; i++) {
    if (i%2 == 0) {
      errorArray.push(calculateError(i));
    }
  }

  for (let i = 0; i < avgArrayDist.length; i++) {
    if ( i%2 == 0) {
      if (i%4 == 0) {
        svg.append('rect')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 25) + ',' +
          (y(dataDistArray[i] + 7) - 10) + ')')
        .attr('fill', 'white')
        .attr('stroke-width', 1)
        .attr('stroke', 'red')
        .attr("width", 50)
        .attr("height", 15);
        svg.append('text')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 20) + ',' +
          (y(dataDistArray[i] + 7)) + ')')
        .attr('text-anchor', 'start')
        .attr('font-size', '8px')
        .attr('fill', 'red')
        .text('Err : ' + calculateError(i) + '%');
      }
      else {
        svg.append('rect')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 25) + ',' +
          (y(dataDistArray[i] + 8) - 10) + ')')
        .attr('fill', 'white')
        .attr('stroke-width', 1)
        .attr('stroke', 'red')
        .attr("width", 50)
        .attr("height", 15);
        svg.append('text')
        .attr('transform', 'translate(' +
          (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) - 20) + ',' +
          (y(dataDistArray[i] + 8)) + ')')
        .attr('text-anchor', 'start')
        .attr('font-size', '8px')
        .attr('fill', 'red')
        .text('Err : ' + calculateError(i) + '%');
      }
    }
  }

  const sommeError = errorArray.reduce((a, b) => {
        return (a + b);
        });

  const errorGeneral = Math.round(100 * (sommeError / errorArray.length)) / 100;


    svg.append('rect')
  .attr('transform', 'translate(' +
    (0) + ',' +
    (height + 30) + ')')
  .attr('fill', 'white')
  .attr('stroke-width', 1)
  .attr('stroke', 'red')
  .attr("width", 92)
  .attr("height", 15);
  svg.append('text')
  .attr('transform', 'translate(' +
    (5) + ',' +
    (height + 40) + ')')
  .attr('text-anchor', 'start')
  .attr('font-size', '8px')
  .attr('fill', 'red')
  .text('General Error : ' + errorGeneral + '%');


  //dipslay device position at each step

  function transformValue(val) {
    return (val - (val - 1) + (val / 2) - 1);
  }

  for (let i = 0; i < markerArray.length; i++) {
    if (i%2 == 0) {
      svg.append('rect')
      .attr('transform', 'translate(' +
        (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) -
          (adjustWidthDist(transformValue(i)) / 2)) + ',' +
        (0) + ')')
      .attr('fill', 'white')
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
      .attr("width", adjustWidthDist(transformValue(i)))
      .attr("height", 15);
      svg.append('text')
     .attr('transform', 'translate(' +
        (x(((markerArray[i+1] - markerArray[i]) / 2) + markerArray[i]) -
          (adjustWidthDist(transformValue(i)) / 2) +
          (adjustWidthDist(transformValue(i)) / 10)) + ',' +
        (10) + ')')
      .attr('text-anchor', 'start')
      .attr('fill', 'black')
      .text(transformValue(i) + 'm');
    }
  }


});



