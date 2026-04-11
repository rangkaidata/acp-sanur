/*
 * name: budiono
 * date: aug-31, 07:19, thu 2023; new;71;
 * edit: sep-04, 11:44, mon-2023; add;108; bjirrrr..
 * -----------------------------; happy new year 2024;
 * edit: mar-25, 17:02, mon-2024; Basic SQL;
 * edit: aug-29, 09:54, thu-2024; r14;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 12:44, thu-2024; #32; properties;
 */  
 
'use strict';

var Login={
  table_name:'login',
  title:"Login"
}

Login.show=(tiket)=>{
  tiket.modul=Login.table_name;
  tiket.menu.name=Login.title;

  tiket.letak.atas=0;
  tiket.ukuran.lebar=35;
  tiket.ukuran.tinggi=20;

  tiket.bisa.tambah=0;
  tiket.toolbar.ada=0;

  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    Login.formCreate(indek);
  }else{
    show(baru);
  }  
}

Login.formCreate=(indek)=>{
  Login.form_01(indek);
}

Login.form_01=(indek)=>{
  var html='<div class="div-center">'
    +content.message(indek)
    +'<form autocomplete="off" align="center">'
    +'<ul>'
    +'<li>&#128100; <label>User Name</label>&nbsp;'
      +'<input type="text" id="user_name_'+indek+'">'
      
    +'<li>&#128273; <label>Password</label>&nbsp;'
      +'<input type="password" id="user_password_'+indek+'">'
      
    +'<li>&nbsp;</li>'
      
    +'<li><button type="button"'
      +' id="button_create_'+indek+'"'
      +'  onclick="Login.createData(\''+indek+'\')">'
      +'&#128275; Log In</button>'
      +'</li>'
    
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  document.getElementById('user_name_'+indek).focus();
}

Login.getDir=(indek)=>{
  return {
    folder:'/',
    name:Login.table_name
  };
}

Login.createData=(indek)=>{
  document.getElementById('button_create_'+indek).disabled=true;
  message.wait(indek);
  db.run(indek,{
    query:"INSERT INTO login"
      +"(user_name,user_password)"
      +"VALUES "
      +"('"+getEV('user_name_'+indek)+"'"
      +",'"+getEV('user_password_'+indek)+"'"
      +")"
  },(paket)=>{
    if (paket.err.id==-7){
      document.getElementById('button_create_'+indek).disabled=false;
      return message.text(indek,paket.err.msg);
    }

    if (paket.err.id==0) {
      sessionStorage.setItem("login_id", paket.data.blok);
      sessionStorage.setItem("modul",'home');
      location.reload();
    } else {
      document.getElementById('button_create_'+indek).disabled=false;
    }
    db.infoPaket(indek,paket);
  });
//  });
}


// EOF: 70;108;110;92;105;
