import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface Data {
  [key: string]: number;
}

interface DoughnutChartProps {
  data: Data;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const thickness = 40; // Adjust thickness of doughnut

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value((d:any) => d);
    const dataEntries = Object.entries(data);
    const arcs = pie(dataEntries.map(([_, value]) => value));

    const arcGenerator = d3.arc().innerRadius(radius - thickness).outerRadius(radius);

    svg.selectAll('*').remove(); // Clear previous elements

    svg.attr('width', width).attr('height', height);

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const tooltip = d3
      .select(svgRef.current?.parentNode) // Select the SVG's parent node
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'relative')
      .style('padding', '8px')
      .style('background', 'white')
      .style('border', '1px solid #000')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    chartGroup
      .selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .style('position', 'absolute')
      .attr('fill', (_:any, i:any) => colorScale(i.toString()))
      .attr('d', arcGenerator)
      .on('mouseover', function (event: MouseEvent, d: any) {
        const [x, y] = d3.pointer(event);
        tooltip
          .style('opacity', 1)
          .html(`${d.data[0]}: ${d.data[1]}`)
          .style('left', `${x}px`)
          .style('top', `${y}px`);
      })
      .on('mousemove', function (event: MouseEvent) {
        const [x, y] = d3.pointer(event);
        tooltip
          .style('left', `${x}px`)
          .style('top', `${y}px`);
      })
      .on('mouseout', function () {
        tooltip.style('opacity', 0);
      });
  }, [data]);

  return <svg ref={svgRef} />;
};

export default DoughnutChart;
