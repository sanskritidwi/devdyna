export const donutOptions = {
    responsive: true,
    cutout: "63%",
    plugins: {
      legend: { display: false },
      datalabels: {
        display: false,
        color: "#ffffff",
        labels: {
          title: {
            font: {
              weight: "bold" as const,
            },
          },
        },
        formatter: function (value: any, context: any) {
          // return context.dataIndex + ': ' + Math.floor(value*100) + '%';
          return value /* + '%' */;
        },
      },
    },
  };


 export  const plugins = [
    {
      id: "CenterText",
      beforeDraw: function (chart: any, plugins: any) {
        var sliceThicknessPixel = [205, 217];
        sliceThicknessPixel.forEach((thicknesss: any, index: number) => {
          chart.getDatasetMeta(0).data[index].outerRadius =
            (chart.chartArea.width / thicknesss) * 100;
        });
      },
    },
  ];

  export   const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { day: "2-digit" });
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${day} ${weekday}`;
  };
