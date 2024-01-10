import React, { useState,useEffect,useCallback } from 'react';
import axios from 'axios';

import LinearRegressionChart from './lregresschart';

const Jzdastatscreen = ({signedData}) => {
  const [trasy, settrasy] = useState([]);
  const [trvania, settrvania] = useState([]);
  const [spotreby, setspotreby] = useState([]);

  

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/jazdy/get?user_id=${signedData}`);
      const groupedData = response.data.reduce((acc, item) => {
        switch (item.table_name) {
          case 'trasy':
            acc.trasy.push(item.hodnota);
            break;
          case 'trvania':
            acc.trvania.push(item.hodnota);
            break;
          case 'spotreby':
            acc.spotreby.push(item.hodnota);
            break;
          default:
            break;
        }
        return acc;
      }, { trasy: [], trvania: [], spotreby: [] });
  
      settrasy(groupedData.trasy);
      settrvania(groupedData.trvania);
      setspotreby(groupedData.spotreby);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [signedData]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); 
  function calculateAverage(numbers) {
    if (numbers.length === 0) {
      return 0;
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
  
    return average;
  }
  function calculateTotal(numbers) {
    if (numbers.length === 0) {
      return 0;
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum;
  }
  return (
    <div>
      <div>
      <p>Priemerna spotreba: {calculateAverage(spotreby)}</p>
      <p>dlzka trasy: {calculateTotal(trasy)}</p>
      <p>trvanie jazdy: {calculateTotal(trvania)}</p>
      </div>
      <h1>TRASY</h1>
      <LinearRegressionChart mydata={trasy} />
      <h1>TRVANIA</h1>
      <LinearRegressionChart mydata={trvania} />
      <h1>SPOTREBY</h1>
      <LinearRegressionChart mydata={spotreby} />
    </div>
  );
};
export default Jzdastatscreen;