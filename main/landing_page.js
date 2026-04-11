/*
 * name: budiono;
 * date: oct-21, 13:53, sun-2023; new;
 * edit: nov-30, 17:23, thursday; keep it simple;
 */

'use strict';
// #808080
//#fff
// with Huruf kecil;
function LandingPage(){
  var tahun=new Date().getFullYear();
  //<h1 style="letter-spacing:4px;"><big>&#x1D4D0</big>CCOUNTING <big>&#x1D4D2</big>LOUD&nbsp;<big>&#x1D4DF</big>ROJECT</h1>
  const html=`
    <header style="background-color:#9e9e9e;
      color: Ivory;
      padding-top: 20px;
      padding-bottom: 20px;
      text-align:center;">
        <h1 style="letter-spacing:4px;"><big>A</big>CCOUNTING <big>C</big>LOUD&nbsp;<big>P</big>ROJECT</h1>
        <h3 style="color:white;"><i style="font-weight:lighter">&#10020;&nbsp;</i> <i style="letter-spacing:3px;"><big>R</big>ANGKAI <big>D</big>ATA</big></i><i style="font-weight:lighter">&nbsp;&#10020</i></h3>
    </header>
    
    <div style="max-width:800px;margin:0 auto;text-align:center;border:0px red solid;">
      <h2 style="text-shadow:1px 2px 10px DarkGray;">Get started</h2> 
      <br>
      <fieldset style="border-radius:8px;padding:0px 20px 0 20px;font-size:16px;border:1px solid #555;">
        <legend align="center" style="border:1px solid grey;border-radius:8px;">
          <strong style="padding:10px 20px 5px 15px;letter-spacing:3px;">Accounting Information System</strong>
        </legend>
        <p>
          &#128999; Sales &nbsp;
          &#128998; Purchases &nbsp;
          &#128997; General Ledger &nbsp;
          &#129000; Inventory &nbsp;
          &#129001; Payroll &nbsp;
          &#129002; Job Costing &nbsp;
          <!-&#129003; Banking &nbsp;->
        </p>
      </fieldset>
      <br><br>
      <button 
        style="padding:10px 20px;
        display:inline-blok;
        background-color: #9e9e9e;
        color: Ivory;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        font-size: 18px;" onclick="MulaiLogin();">Log in</button>
        
      <button 
        style="padding:10px 20px;
        display:inline-blok;
        background-color: #9e9e9e;
        color: Ivory;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        font-size: 18px;" onclick="MulaiRegister();">Create new account</button>
      <br>
      <br>
      <p>
        &copy; 2019-${tahun}&nbsp;<a href="https://x.com/budionopixel">budionopixel</a>&nbsp;|&nbsp;<a href="https://github.com/rangkaidata">GitHub.com</a>
      </p>
    </div>`;

  document.getElementById('landing_page').innerHTML=html;
};

function MulaiRegister(){
  var tiket=JSON.parse(JSON.stringify(bingkai[0]));
  tiket.parent=0;
  tiket.menu.id='register';
  tiket.folder=bingkai[0].folder;
  antrian.push(tiket);
  Menu.klik(antrian.length-1);
}

function MulaiLogin(){
  var tiket=JSON.parse(JSON.stringify(bingkai[0]));
  tiket.parent=0;
  tiket.menu.id='login';
  tiket.folder=bingkai[0].folder;
  antrian.push(tiket);
  Menu.klik(antrian.length-1);
}

//  &#x2219;
// &#10077; 
// &#10078;
// #808080
