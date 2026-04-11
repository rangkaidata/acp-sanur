/*
 * name: budiono
 * date: aug-31, 09:07, thu-2023; new; 98;
 * edit: sep-04, 10:48, mon-2023; add;140;
 * -----------------------------; happy new year 2024;
 * edit: mar-23, 16:26, sat-2024; Basic SQL;
 * edit: jul-27, 20:14, sat-2024; r-11;
 * edit: aug-28, 18:43, wed-2024; r 14;
 * edit: sep-05, 07:48, thu-2024; r-15;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 11:55, thu-2025; #32; properties;
 * edit: mar-09, 17:32, sun-2025; #43; folder+file;
 */ 

'use strict';

var Register={
  table_name:'register',
  title:'Registration'
}

Register.show=(tiket)=>{
  tiket.menu.name=Register.title;
  tiket.modul=Register.table_name;

  tiket.bisa.tambah=0;
  tiket.bisa.ubah=0;
  
  tiket.letak.atas=0;
  tiket.letak.tengah=1;
  
  tiket.ukuran.lebar=35;
  tiket.ukuran.tinggi=30;
  
  tiket.toolbar.ada=0;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    Register.formCreate(indek);
  }else{
    show(baru);
  }  
}

Register.formCreate=(indek)=>{
  Register.formEntry(indek);
}

Register.formEntry=(indek)=>{
  var html='<div class="div-center">'
  +'<form autocomplete="off" '
  +'style="padding:0.5rem;" >'
  +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
  +'<ul>'
  +'<li>'
    +'&#128100; <label>User Name<i class="required">*</i></label>'
    +'<input type="text" id="user_name_'+indek+'">'
    +'</li>'
  
  +'<li>'
    +'&#128101; <label>Full Name</label>'
    +'<input type="text" id="user_fullname_'+indek+'">'
    +'</li>'
    
  +'<li>'
//    +'&#128101; <label>Email Address<i class="required">*</label></i>'
    +'&#128101; <label>Email Address</label>'
    +'<input type="text" id="email_address_'+indek+'">'
    +'</li>'
  
  +'<li>'
    +'&#128273; <label>Password<i class="required">*</i></label>'
    +'<input type="password" id="user_password_'+indek+'">'
  +'</li>'
  
  +'<li>'
    +'&#128271; <label>Confirm Passwd<i class="required">*</i></label>'
    +'<input type="password" id="confirm_password_'+indek+'">'
    +'</li>'
    
  +'<li>'
    +'&#128291; <label>Passcode</label>'
    +'<iframe src="'+bingkai[indek].server.url+'passcode/create.png" '
    +' id="passcode_image_'+indek+'" '
    +' style="padding-top:0.2rem;width:5rem;height:1.5rem;overflow:hidden;" '
    +' scrolling="no" disabled>'
    +' </iframe>'
    +'</li>'
  
  +'<li>&nbsp;</li>'
  +'<li>'
    +'&#128290; <label>Retype Passcd<i class="required">*</i></label>'
  +'<input type="text" id="retype_passcode_'+indek+'">'
  +'<li>&nbsp;</li>'
  +'<li><button type="button" '
    +' id="button_register_'+indek+'" '
    +' onclick="Register.createData(\''+indek+'\');">'
    +'&#128209; Register</button>'

    +'<button type="button" '
    +' id="close_'+indek+'" '
    +' onclick="Register.closeMe(\''+indek+'\')">Close'
    +'</button>'
  +'</li>'

  +'</ul>'
  
  +'</form>'
  +'<i class="required">* Required</i>'
  +'</div>';
  content.html(indek,html);
  document.getElementById('user_name_'+indek).focus();
  statusbar.ready(indek);
}

Register.closeMe=(indek)=>{
  ui.CLOSE(indek);
}

Register.createData=(indek)=>{
  if (document.getElementById("button_register_"+indek).innerHTML == "Reset"){
    Register.clear(indek);
    return;
  }
  message.wait(indek);
  if(getEV("confirm_password_"+indek)!=getEV("user_password_"+indek)){
    pesanSalah2(indek,6,['confirm_password','user_password'],[]);
    return;
  }
  document.getElementById("button_register_"+indek).disabled=true;
  
  let auth='123-456';
  let folder_server='umum';
//  let folder_server='windows';
  
  db.run(indek,{
    query:"INSERT INTO register "
    +"(folder,user_name,user_fullname,email_address"
    +",user_password,retype_passcode,auth"
    +") VALUES "
    +"('"+folder_server+"'"
    +",'"+getEV("user_name_"+indek)+"'"
    +",'"+getEV("user_fullname_"+indek)+"'"
    +",'"+getEV("email_address_"+indek)+"'"
    +",'"+getEV("user_password_"+indek)+"'"
    +",'"+getEV("retype_passcode_"+indek)+"'"
    +",'"+auth+"'"
    +")"
  },(paket)=>{
    document.getElementById("button_register_"+indek).disabled=false;
    if (paket.err.id==0){
      document.getElementById('button_register_'+indek).innerHTML = "Reset";
    }
    else{
      document.getElementById('user_name_'+indek).focus();
    }
    db.infoPaket(indek,paket);
  });
}

Register.clear=(indek)=>{
  document.getElementById("button_register_"+indek).innerHTML='Register';
  document.getElementById("user_name_"+indek).value='';
  document.getElementById("user_fullname_"+indek).value='';
  document.getElementById("user_password_"+indek).value='';
  document.getElementById("email_address_"+indek).value='';
  document.getElementById("confirm_password_"+indek).value='';
  document.getElementById("retype_passcode_"+indek).value='';
  document.getElementById("msg_"+indek).innerHTML='';
  document.getElementById("user_name_"+indek).focus();
  reloadImage(indek);
  statusbar.ready(indek);
}

function reloadImage(indek){
  document.getElementById("passcode_image_"+indek).src += '';
}


// eof: 98;140;151;172;
