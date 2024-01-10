import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const LinearRegressionChart = ({ mydata}) => {
  const data = {
    labels: Array.from({ length: mydata.length }, (_, i) => i + 1), // Generate labels based on the length of mydata
    datasets: [
      {
        label: 'Dataset 1',
        data: mydata,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
      },
    ],
  };
  const options = {
    scales: {
      x: 
        {
          type: 'linear',
          position: 'bottom',
        },
      
      y: 
        {
          type: 'linear',
          position: 'left',
        },
      
    },
  };

  useEffect(() => {
    // You can perform additional setup or calculations here
  }, [mydata]);

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
};

export default LinearRegressionChart;
