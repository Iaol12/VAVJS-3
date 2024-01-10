import React, { useState, useEffect } from 'react';
import Registerscreen from './components/registerscreen.js';
import LoginScreen from './components/loginscreen.js';
import Zmenjazdyscreen from './components/zmenjazdyscreen.js';
import Jzdastatscreen from './components/jzdastatscreen.js';
import Reklama from './components/reklama.js';
import AdminScreen from './components/adminscreen.js';
import Typyscreen from './components/typyscreen.js';

const App = () => {
  const [showAD, setshowAD] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('loginscreen');
  const [signedData, setsignedData] = useState();
  var Badscreens = ['registerscreen',"loginscreen","adminscreen"] 

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };
  
  const zavrireklamu = () =>{
    setshowAD(false);
  };

  useEffect(() => {
    let intervalId;

    if (!showAD) {
       intervalId = setInterval(() => {
      setshowAD(true);
    }, 60000);} // 60000 milliseconds = 1 minute zmen to potom jak ma byt
    return () => clearInterval(intervalId);
  }, [showAD]); 
  return (

    <div>
    {!Badscreens.includes(currentScreen) && (
      <nav>
        <ul>
          <li>
            <button onClick={() => navigateTo('zmenjazdyscreen')}>Zmen Jazdy</button>
          </li>
          <li>
            <button onClick={() => navigateTo('jazdastats')}>Statistiky Jazdy</button>
          </li>
          <li>
            <button onClick={() => navigateTo('typyscreen')}>Pridaj a Zmen Typy</button>
          </li>
        </ul>
      </nav>
    )}
      <hr />    
      {currentScreen === 'adminscreen' && <AdminScreen/>}
      {currentScreen === 'registerscreen' && <Registerscreen navigateTo={navigateTo} />}
      {currentScreen === 'loginscreen' && <LoginScreen navigateTo={navigateTo} setsignedData={setsignedData}/>}
      {currentScreen === 'zmenjazdyscreen' && <Zmenjazdyscreen signedData={signedData}/>}
      {currentScreen === 'jazdastats' && <Jzdastatscreen signedData={signedData}/>}
      {currentScreen === 'typyscreen' && <Typyscreen/>}
      {currentScreen !== 'adminscreen' && showAD && <Reklama zavriReklamu = {zavrireklamu}/>}
      
    </div>
  );
};

export default App;
