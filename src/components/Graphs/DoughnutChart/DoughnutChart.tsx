import React, { useEffect, useState, FC, useLayoutEffect } from 'react';


import {

  Chart as ChartJS2,

  ArcElement,

  Tooltip,

  Legend,

} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';


import { Doughnut } from 'react-chartjs-2';




ChartJS2.register(ArcElement, Tooltip, Legend, ChartDataLabels);


interface DonutChartProps {
  type?: string; 
  chartDataSetProps?: [] | any,
  options?: any , 
  plugins? : any 

}


const DonutChart: FC<DonutChartProps> = ({ type, chartDataSetProps , options , plugins }) => {
  const data = {
    labels: chartDataSetProps[0]?.labels,
    datasets: chartDataSetProps,
  };

  const defaultOptions = {
    responsive: true,
    cutout: '38%',
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        color: '#ffffff',
        labels: {
          title: {
            font: {
              weight: 'bold' as const
            }
          },

        },
        formatter: function (value: any, context: any) {
          // return context.dataIndex + ': ' + Math.floor(value*100) + '%';
          return value /* + '%' */;
        }

      },

    },

  };

  return <>  <Doughnut data={data} options={options ? options : defaultOptions}   plugins={plugins}  /> </>
}
//export default React.memo(DonutChart);
export default DonutChart;
