const h = 520;
const w = 1280;
const p = {top: 40, right: 10, bottom: 120, left: 60};
const squareSize = (w / 3) / 10;
const colorTemp = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5]

const svg = d3.select('#container')
  .append('svg')
  .attr('height', h)
  .attr('width', w)
  .attr("viewBox", [0, 0, w, h])
  .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(obj => {
  const data = obj.monthlyVariance;
  const baseTemp = obj.baseTemperature;

  const x = d3.scaleTime()
    .domain([new Date(d3.min(data, d => d.year), 0),
             new Date(d3.max(data, d => d.year), 11)])
    .range([p.left, w - p.right]);
  const y = d3.scaleBand()
    .domain(d3.timeMonths(new Date(0,0,0), new Date(1,0,0))
              .toLocaleString('en-US', {month: 'long'})
              .split(',')
              .reverse())
    .range([h - p.bottom, p.top]);
  
  const xAxis = d3.axisBottom(x)
    .ticks(20)
    .tickSizeOuter(0);
  const yAxis = d3.axisLeft(y)
    .tickSize(0)
  
  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', 'translate(0,' + (h - p.bottom) + ')')
    .call(xAxis)
  svg.append('g')
    .attr('id', 'y-axis')
    .attr('transform', 'translate(' + p.left + ', 0)')
    .call(yAxis)
    .call(g => g.select(".domain").remove())
  
  const tooltip = d3.select('body')
    .append("div")
    .attr('id', 'tooltip')
  
  const colorScale = d3.scaleSequential(d3.interpolateInferno)
  
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-month', d => d.month - 1)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => (d.variance + baseTemp).toFixed(2))
    .attr('fill', d => colorScale((d.variance + baseTemp) / 10))
    .attr('x', d => x(new Date(d.year, 0)))
    .attr('y', d => y(new Date(0, d.month - 1)
                      .toLocaleString('en-US', {month: 'long'})))
    .attr('width', (w - p.right - p.left) / (data.length / 12))
    .attr('height', (h - p.bottom - p.top) / 12)
    .on('mouseover', (event, d) => {
      const left = event.x;
      const top = event.pageY;
    
      tooltip.attr('data-year', d.year)
        .style('opacity', 1)
        .style('top', (top - 100) + 'px')
        .style('left', left + 'px')
        .html('Year: ' + d.year + '<br>' +
              'Temperature: ' + (d.variance + baseTemp).toFixed(2) + 'Cº' + '<br>' +
              'Variation: ' + d.variance.toFixed(2));
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0)
    })
  
  const legend = svg.append('g')
    .attr('id', 'legend');
  
  const colorAxisScale = d3.scaleLinear()
    .domain([0,15])
    .range([w / 3, w - (w / 3)])
  
  const f = d3.format(".1f");
  
  const colorAxis = d3.axisBottom(colorAxisScale)
    .ticks(10)
    .tickValues(colorTemp.slice(1))
    .tickFormat(f)
    .tickSizeOuter(0)
  
  legend.append('g')
    .attr('transform', 'translate(0, ' + (h - 20) + ')')
    .call(colorAxis);
  
  legend.selectAll('rect')
    .data(colorTemp)
    .enter()
    .append('rect')
    .attr('x', c => colorAxisScale(c))
    .attr('y', h - squareSize - 20)
    .attr('fill', (c, i) => colorScale((i + 1) / 10))
    .attr('height', squareSize)
    .attr('width', squareSize)
})