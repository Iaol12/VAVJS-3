import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
    });
  const [advertisement, setAdvertisement] = useState({
        imagelink: '',
        targetlink: '',
        });

  const fetchUsers = async () => {
    try {
        const response = await axios.get('api/users/get');
        setUsers(response.data);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    };

    // useEffect to fetch users on component mount and when users are imported
    useEffect(() => {
    fetchUsers();
    }, []); // Runs on component mount



  const [counter, setCounter] = useState(null);

  

  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const response = await axios.get('api/advertisement/get');
        console.log(response.data[0].counter);
        setCounter(response.data[0].counter)
      } catch (error) {
        console.error('Error fetching counter:', error);
      }
    };
    fetchCounter();
  }, []); 
  

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`api/users/delete/${userId}`);

      if (response.data.success) {
        // Update the local users state by removing the deleted user
        setUsers(users.filter((user) => user.user_id !== userId));
      } else {
        console.error('Failed to delete user:', response.data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post('api/users/register', newUser);

      if (response.data.success) {
        const newUserWithId = {
            ...newUser,
            user_id: response.data.userId,
          };
        setUsers([...users, newUserWithId]);
       
        setNewUser({
          name: '',
          email: '',
          password: '',
          age: '',
        });
      } else {
        console.error('Failed to add user:', response.data.error);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };
  const handleUpdateAdvertisement = async () => {
    try {
      const response = await axios.put('api/advertisement/update', advertisement);

      if (response.data.success) {
        console.log('Advertisement updated successfully.');
      } else {
        console.error('Failed to update advertisement:', response.data.error);
      }
    } catch (error) {
      console.error('Error updating advertisement:', error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleChangelinks = (e) => {
    const { name, value } = e.target;
    setAdvertisement({
      ...advertisement,
      [name]: value,
    });
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
          const response = await axios.post('api/users/import', { csvData });

          if (response.data.success) {
            console.log('Users imported successfully.');
            fetchUsers();
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
  const handleExportData = async () => {
    try {
      const response = await axios.get('api/users/export', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'exported_users.csv';
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
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.user_id}>
            {user.name} - {user.email}
            <button onClick={() => handleDeleteUser(user.user_id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div>
        <h3>Add User</h3>
        <form>
          <label>
            Name:
            <input type="text" name="name" value={newUser.name} onChange={handleChange} />
          </label>
          <br />
          <label>
            Email:
            <input type="text" name="email" value={newUser.email} onChange={handleChange} />
          </label>
          <br />
          <label>
            Password:
            <input type="password" name="password" value={newUser.password} onChange={handleChange} />
          </label>
          <br />
          <label>
            Age:
            <input type="text" name="age" value={newUser.age} onChange={handleChange} />
          </label>
          <br />
          <button type="button" onClick={handleAddUser}>
            Add User
          </button>
        </form>
      </div>
      <div>
      <h3>Import Users</h3>
      <input type="file" onChange={handleFileChange} />
      <button type="button" onClick={handleImportData}>
        Import Users
      </button>

      <h3>Export Users</h3>
      <button type="button" onClick={handleExportData}>
        Export Users
      </button>
    </div>
      <div>
        <h3>Update Advertisement</h3>
        <form>
          <label>
            Image Link:
            <input type="text" name="imagelink" value={advertisement.imagelink} onChange={handleChangelinks} />
          </label>
          <br />
          <label>
            Target Link:
            <input type="text" name="targetlink" value={advertisement.targetlink} onChange={handleChangelinks} />
          </label>
          <br />
          <button type="button" onClick={handleUpdateAdvertisement}>
            Update Advertisement
          </button>
        </form>
      </div>
      <div>
      <h2>Counter Value: (reklama sa zobrazuje iba pouzivatelom nie adminovi)</h2>
      {counter !== null ? (
        <p>{counter}</p>
      ) : (
        <p>Loading counter value...</p>
      )}
    </div>
    </div>
  );
};




export default UsersList;