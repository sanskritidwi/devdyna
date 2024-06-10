import React, { useContext } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

interface Dataset {
    label: string;
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string;
    borderRadius: number;
    barThickness: number;
  }

  interface ChartData {
    labels: string[];
    datasets: Dataset[];
  }

  

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const BarChartCustom = ({ chartData }: { chartData: ChartData }) => {





  const chartOptions = {
    interaction: {
      mode: "index" as const,
      intersect: false,
      axis: "x" as const,
      includeInvisible: true,
    },
    responsive: true,
    scales: {
      // to remove the labels
      x: {
        ticks: {
          display: true,
        },
        border: {
          display: false,
        },
        grid: {
          drawBorder: false,
          display: false,
          margin: 10,
        },
      },
     
      y: {
        title: {
          display: false,
          color: "lightgray",
        
        },
        ticks: {
          display: true,
          beginAtZero: true,
          autoSkip: true,
          maxTicksLimit: 15, // to change what after value of 0 on left side bar
        },
        // to remove the y-axis grid
        grid: {
          drawBorder: false,
          display: true,
          tickColor: "transparent",
        },
        border: {
          dash: [2],
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: "top" as const,
        labels: { usePointStyle: true },
      },
      title: { display: false, text: "Transactions Schema" },
      datalabels: { display: false },
    },
    maintainAspectRatio: false,
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default BarChartCustom;
