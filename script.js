/*
 * auth: budiono
 * date: aug-31, 06:53, thu-2023; new; 195;
 * edit: sep-04, 21:40, mon-2023; add; 201;
 * edit: feb-05, 23:44, wed-2025; #39; modif;
 */ 

'use strict';

function main(){  
  var startTime = performance.now();
  var paket={
    err:-1
  };
  // sessionStorage.removeItem('login_id');
  
  bingkai[0].login.id=sessionStorage.getItem('login_id')
  console.log(bingkai[0].login.id);
  
  if (bingkai[0].login.id==null){
    belumLogin(0);
  }else{
    sudahLogin(0);
  }

  var endTime = performance.now();
  // alert( endTime-startTime + 'ms')
}

function sudahLogin(indek){
  getSettingConstructor();// paging lebih awal;
  
  bingkai[0].modul='login'
  db.run(indek,{
    query:"SELECT * FROM login"
  },(paket)=>{
    if(paket.err.id==0){
      const d=objectOne(paket.fields, paket.data);
      bingkai[0].login.name=d.user_name;
      bingkai[0].login.full_name='';
      bingkai[0].group.id='root';
      bingkai[0].admin.name=d.user_name;
      
      db.run(indek,{
        query:"SELECT user_fullname FROM users"
      },(paket)=>{
        if(paket.count>0){
          const d2=objectOne(paket.fields,paket.data);
          bingkai[0].login.full_name=d2.user_fullname;
          //Menu.getMyMenu(()=>{
          Menu.server();
          //});
        }
      });
    }else{
      belumLogin(0);    
    }
  });
}

function belumLogin(paket){
  if (paket.err===24){
    // login expired
  }
  else{
    bingkai[0].login.id=null;
    sessionStorage.removeItem('login_id');
  }
  Menu.lokal();
  var tiket=JSON.parse(JSON.stringify(bingkai[0]));
  // Login.show(tiket);
  LandingPage();
}

function updateJam(){
  if(document.getElementById('menu_bar_r'))
  document.getElementById('menu_bar_r').innerHTML=tglSekarangUpdate();
}

function getSettingConstructor(){
  db.run(0,{
    query:"SELECT page_rows FROM setting"
  },(p)=>{
    if(p.count>0){
      var page_rows=p['data'][0];
      bingkai[0].paging.select=page_rows;
      bingkai[0].paging.limit=array_page_limit_int[page_rows];
      bingkai[0].paging.page=1;
    }
  });
}


// eof: 195;201;91;
