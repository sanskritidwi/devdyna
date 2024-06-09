import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface Totals {
  [key: string]: number;
}

interface BarChartProps {
  data: Totals;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    
    const x = d3
      .scaleBand()
      .domain(Object.keys(data))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(data)) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);
      const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "white")
      .style("border", "1px solid #000")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg
      .selectAll(".bar")
      .data(Object.entries(data))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", ([key]: [string, number]) => x(key)!)
      .attr("y", ([, value]: [string, number]) => y(value))
      .attr("width", x.bandwidth())
      .attr("height", ([, value]: [string, number]) => y(0) - y(value))
      .attr("fill", "steelblue")
       .on("mouseover", function (this: SVGElement, event: any,  [key, value]: [string, number]) {
        d3.select(this).style("stroke-width", 2);
        tooltip
          .style("opacity", 1)
          .html(`${value}`)
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY + 5}px`);
      })
      .on("mousemove", function (event: any) {
        tooltip
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY + 5}px`);
      })
      .on("mouseout", function (this: SVGElement, d: any, i: any) {
        d3.select(this)
        .style("stroke-width", 1);
        tooltip.style("opacity", 0);
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={svgRef} width={500} height={300}></svg>;
};

export default BarChart;