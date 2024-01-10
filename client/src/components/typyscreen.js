import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Typyscreen = () => {
  const [typy, setTypy] = useState([]);
  const [newTyp, setNewTyp] = useState({
    nazov: '',
    popis: '',
  });

  const fetchTypy = async () => {
    try {
      const response = await axios.get('/api/typy/get');
      setTypy(response.data);
    } catch (error) {
      console.error('Error fetching typy:', error);
    }
  };

  useEffect(() => {
    fetchTypy();
  }, []); // Runs on component mount

  const handleDeleteTyp = async (typId) => {
    try {
      const response = await axios.delete(`api/typy/delete/${typId}`);

      if (response.data.success) {
        setTypy(typy.filter((typ) => typ.id !== typId));
      } else {
        console.error('Failed to delete typ:', response.data.error);
      }
    } catch (error) {
      console.error('Error deleting typ:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTyp({
      ...newTyp,
      [name]: value,
    });
  };

  const handleAddTyp = async () => {
    try {
      const response = await axios.post('api/typy/add', newTyp);

      if (response.data.success) {
        const newTypWithId = {
          ...newTyp,
          id: response.data.userId, // Assuming the returned property is 'userId'
        };
        setTypy([...typy, newTypWithId]);

        setNewTyp({
          nazov: '',
          popis: '',
        });
      } else {
        console.error('Failed to add typ:', response.data.error);
      }
    } catch (error) {
      console.error('Error adding typ:', error);
    }
  };

  return (
    <div>
      <h2>Typ List</h2>
      <ul>
        {typy.map((typ) => (
          <li key={typ.id}>
            {typ.nazov} - {typ.popis}
            <button onClick={() => handleDeleteTyp(typ.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div>
        <h3>Add Typ</h3>
        <form>
          <label>
            Nazov:
            <input type="text" name="nazov" value={newTyp.nazov} onChange={handleChange} />
          </label>
          <br />
          <label>
            Popis:
            <input type="text" name="popis" value={newTyp.popis} onChange={handleChange} />
          </label>
          <button type="button" onClick={handleAddTyp}>
            Add Typ
          </button>
        </form>
      </div>
    </div>
  );
};

export default Typyscreen;
