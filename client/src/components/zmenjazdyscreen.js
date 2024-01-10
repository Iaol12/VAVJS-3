import React, { useState,useEffect,useCallback } from 'react';
import axios from 'axios';

const Zmenajazdyscreen = ({signedData}) => {
  const [jazdy, setjazdy] = useState([]);

  const [hodnota, sethodnota] = useState(0);
  const [velicina, setvelicina] = useState("");
  const [typ, settyp] = useState("");

  var veliciny = ['trasy', 'trvania', 'spotreby'];
  const [customOptions2, setCustomOptions2] = useState(['Pridajte_najskor_typ_v']);

  const fetchTypy = async () => {
    try {
      const response = await axios.get('/api/typy/get');
      const nazovValues = response.data.map(item => item.nazov);
      if (nazovValues.length === 0) {
        setCustomOptions2(['Default Value']);
      } else {
        setCustomOptions2(nazovValues);
      }
    } catch (error) {
      console.error('Error fetching typy:', error);
    }
  };

  useEffect(() => {
    fetchTypy();
  }, []); // Runs on component mount

  const handleInputChange = (event) => {
    sethodnota(event.target.value);
  };

  const handleOptionChange1 = (event) => {
    setvelicina(event.target.value);
  };

  const handleOptionChange2 = (event) => {
    settyp(event.target.value);
  };
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };
  const handleImportData = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const csvData = event.target.result;

        // Now you can use `csvData` in your import functionality
        try {
          const response = await axios.post('/api/jazdy/import', { csvData, user_id: signedData });

          if (response.data.success) {
            console.log('Users imported successfully.');
            fetchData();
          } else {
            console.error('Failed to import users:', response.data.error);
          }
        } catch (error) {
          console.error('Error importing users:', error);
        }
      };
      fileReader.readAsText(selectedFile);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const nowdate = new Date();
    console.log(nowdate);
    const formattedDate = nowdate.toISOString().split('T')[0];
    console.log(formattedDate);
    const data = {
      hodnota: hodnota,
      velicina: velicina,
      typ: typ,
      currentDate: formattedDate,
      user_id: signedData
    };
    try {
      const response = await axios.post('/api/jazdy/add', data);
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error during API call:', error.response ? error.response.data : error.message);
    }
    fetchData();
  };
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/jazdy/get?user_id=${signedData}`);
      setjazdy(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [signedData]);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]); 


  const handleDeleteJazda = async (tableName, id) => {
    try {
      const response = await axios.delete(`api/jazdy/delete/${tableName}/${id}`);
          if (response.data.success) {
        setjazdy(jazdy.filter((jazda) => jazda.id !== id));
      } else {
        console.error('Failed to delete jazda:', response.data.error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
 
  const handleExportData = async () => {
    try {
      const response = await axios.get(`api/jazdy/export?user_id=${signedData}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'exported_jazdy.csv';
      document.body.appendChild(link);
      link.click();

      // Remove the link from the document
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
  <div>
    <h2>jazdy:</h2>
      <ul>
        {jazdy.map((jazda) => (
          <li key={jazda.id}>
            {jazda.table_name} - {jazda.hodnota} - {jazda.typ}
            <button onClick={() => handleDeleteJazda(jazda.table_name,jazda.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h3>Export Jazdy</h3>
      <button type="button" onClick={handleExportData}>
        Export vsetky Jazdy
      </button>
      <h3>Import Jazdy</h3>
      <input type="file" onChange={handleFileChange} />
      <button type="button" onClick={handleImportData}>
        Import Jazdy
      </button>
      <h3>Pridanie Jazdy</h3>
    <form onSubmit={handleSubmit}>
      <label>
        Zvol si velicinu:
        <select
          name="selectedOption1"
          value={velicina}
          onChange={handleOptionChange1}
        >
          <option value="" disabled>Select an option</option>
          {veliciny.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        Hodnota:
        <input
          type="text"
          name="name"
          value={hodnota}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Choose Option 2:
        <select
          name="selectedOption2"
          value={typ}
          onChange={handleOptionChange2}
        >
          <option value="" disabled>Select an option</option>
          {customOptions2.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </label>

      <button type="submit">Submit</button>
    </form>
  </div>
  );
};

export default Zmenajazdyscreen;
