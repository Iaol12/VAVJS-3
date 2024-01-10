import React, { useState } from 'react';
import axios from "axios";

const LoginScreen = ({ navigateTo,setsignedData}) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/users/login', loginData);
      if (response.data.success) {
        console.log(response.data)
        const userId = response.data.id;
        setsignedData(userId);
        
        console.log(response.data);
        console.log('Login successful. User ID:', userId);
        if(userId === "admin"){
          navigateTo('adminscreen');  
        }
        else{
          navigateTo('zmenjazdyscreen');
        }
        
      } else {
        console.error('Login failed:', response.data.error);
      }
      
      
    } catch (error) {
      console.error('Error loging in user');
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <p>This is the login page.</p>
      <form>
        <label>
        email:
          <input type="email" name="email" value={loginData.email} onChange={handleChange} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" value={loginData.password} onChange={handleChange} />
        </label>
        <br />
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </form>
      <p>Not registered yet?</p>
      <button onClick={() => navigateTo('registerscreen')}>Register</button>
    </div>
  );
};

export default LoginScreen;
