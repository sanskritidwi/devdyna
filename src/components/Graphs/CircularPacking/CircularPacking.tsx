import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface DataItem {
    count: string,
    label: string,
    fillColor: string,
}

interface Data {
  children: DataItem[];
}

interface CircularPackingChartProps {
  data: Data;
}

const CircularPackingChart: React.FC<CircularPackingChartProps> = ({
  data,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Set up dimensions
    const width = 100;
    const height = 100;
    const radius = width / 6;

    // Create a new pack layout
    const pack = d3.pack().size([width, height]).padding(8);

    // Append the SVG element to the component's ref
    const svg = d3.select(svgRef.current);

    // Create a hierarchy from the data
    const root = d3
      .hierarchy(data)
      .sum((d: any) => d.count)
      .sort((a: any, b: any) => b.count - a.count);

    // Use the pack layout to generate the nested circles
    const circles = pack(root)
      .descendants()
      .filter((d: any) => d.depth > 0);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "4px")
      .style("background", "white")
    //   .style("border", "1px solid #000")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "0.9rem")
      .style("font-family", `"Inter", sans-serif`);
      const scaleFactor = 0.7;
    // Draw the circles
    svg
      .selectAll("circle")
      .data(circles)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => d.x* scaleFactor)
      .attr("cy", (d: any) => d.y* scaleFactor)
      .attr("r", (d: any) => d.r * scaleFactor)
      .style("fill", (d: any) => d?.data?.fillColor)
      .style("opacity", 1)
      .style("stroke", "#fff")
      .on("mouseover", function (this: SVGElement, event: any, d: any) {
        d3.select(this).style("stroke-width", 2);
        tooltip
          .style("opacity", 1)
          .html(`${d.data.count}  ${d.data.label}`)
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

    // Draw the text labels
    svg
      .selectAll("text")
      .data(root.descendants())
      .enter()
      .append("text")
      .attr("x", (d: any) => d.x)
      .attr("y", (d: any) => d.y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
    //   .text((d: any) => d.data.label);
  }, []);

  return <svg ref={svgRef} width={100} height={100}></svg>;
};

export default CircularPackingChart;
