import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { Price } from "../types/StockTypes";
import styles from "./StockChart.module.scss";

interface StockChartProps {
  stockData: Price[];
  stockSymbol: string;
  startYear: number;
  endYear: number;
}

const StockChart: React.FC<StockChartProps> = ({
  stockData,
  stockSymbol,
  startYear,
  endYear,
}) => {
  const chartData = useMemo(() => {
    if (!stockData.length) return null;

    const capacity = 1200;
    const years = endYear - startYear + 1;
    const workdaysPerYear = 253;
    const total = years * workdaysPerYear;
    const step = Math.max(Math.ceil(total / capacity), 1);

    const processedData: [number, number][] = [];

    for (let i = 0; i < stockData.length; i += step) {
      const price = stockData[i];
      const [month, day, year] = price.dateTime.split("/");

      if (Number(year) >= startYear && Number(year) <= endYear) {
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        processedData.push([date.getTime(), price.closePrice]);
      }
    }

    return processedData;
  }, [stockData, startYear, endYear]);

  const chartOptions: ApexOptions = useMemo(() => {
    if (!chartData || chartData.length === 0) return {};

    const startPrice = chartData[0][1];
    const endPrice = chartData[chartData.length - 1][1];
    const isGainColor = startPrice <= endPrice;

    return {
      chart: {
        type: "area",
        height: "100%",
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          autoSelected: "zoom",
          theme: "dark",
        },
        background: "#2d2d2d",
        foreColor: "#ffffff",
      },
      theme: {
        mode: "dark",
      },
      colors: [isGainColor ? "#66DA26" : "#FF4560"],
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        text: stockSymbol,
        align: "left",
        style: {
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: "bold",
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val.toFixed(2),
          style: {
            colors: "#ffffff",
          },
        },
        title: {
          text: "Price",
          style: {
            color: "#ffffff",
          },
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: {
            colors: "#ffffff",
          },
        },
      },
      grid: {
        borderColor: "#444",
        strokeDashArray: 0,
      },
      tooltip: {
        shared: false,
        theme: "dark",
        y: {
          formatter: (val: number) => val.toFixed(3),
        },
      },
    };
  }, [chartData, stockSymbol]);

  if (!stockData.length || !chartData) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.placeholderContent}>
          Select a stock to view the chart
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <Chart
        options={chartOptions}
        series={[
          {
            name: stockSymbol,
            data: chartData,
          },
        ]}
        type="area"
        height="100%"
      />
    </div>
  );
};

export default StockChart;
