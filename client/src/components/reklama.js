import React, {useCallback, useState, useEffect } from 'react';
import axios from "axios";

const Reklama = ({ zavriReklamu }) => {
    const [postData, setPostData] = useState({});
    
    const getADdata = useCallback(async () => {
      const response = await axios.get('/api/advertisement/get'); 
     
      setPostData(response.data[0]);
    }, []);

    useEffect(() => {
      getADdata();
  }, [getADdata]);

  const handleImageClick = async (targetLink) => {
    // Open the target link in a new tab
    window.open(targetLink, '_blank');
    try {
      await axios.put('/api/advertisement/increase-counter');
    } catch (error) {
      console.error('Error increasing counter:', error);
    }
  };

  return (
    <div className="modal">
      <img
        src={postData.imagelink}
        alt="Advertisement"
        onClick={() => handleImageClick(postData.targetlink)}
        style={{ cursor: 'pointer' }}
      />
      <p>Toto je reklama.</p>
      <button onClick={zavriReklamu}>zatvorit reklamu</button>
    </div>
  );
};

export default Reklama;
