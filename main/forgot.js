/*
 * auth: budiono
 * date: aug-31, 09:14, thu-2023; new;60;
 * -----------------------------; happy new year 2025;
 * edit: jan-04, 11:51, sat-2025; #32; properties;
 * edit: jan-05, 22:05, sun-2025; #33; forgot_password_ok;
 */ 
 
'use strict';

var Forgot={
  modul_name:'Forgot Password',
  url:null,
  email_address:'',
  reset_code:'',
}

Forgot.show=(tiket)=>{
  tiket.letak.atas=0;
  tiket.bisa.tambah=0;
  tiket.ukuran.lebar=40;
  tiket.ukuran.tinggi=20;
  
  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Forgot.formCreate(indek);
  }else{
    show(baru);
  }  
}

Forgot.formCreate=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  Forgot.formEmail(indek);
}

Forgot.formEmail=(indek)=>{
  const html='<div class="div-center">'
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off" align="center">'
    +'<p><b>1 - Find your account</b></p>'
    +'<ul>'

    +'<li>&#128273; <label>Email Address</label>&nbsp;'
      +'<input type="text" id="email_address_'+indek+'">'
      
    +'<li><button type="button"'
      +' id="button_create_'+indek+'"'
      +'  onclick="Forgot.createData(\''+indek+'\')">&#128275; Next'
      +'</button>'
      +'</li>'
    
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  document.getElementById('email_address_'+indek).focus();
}

Forgot.createData=(indek)=>{
  db.run(indek,{
    query:"insert into reset_password"
      +"(email_address"
      +") values"
      +"('"+getEV('email_address_'+indek)+"'"
      +")"
  },(p)=>{
    message.infoPaket(indek,p);
    if (p.err.id===0){
      Forgot.email_address=getEV('email_address_'+indek);
      document.getElementById('button_create_'+indek).disabled=true;
      //message.text(indek,"");
      Forgot.confirmPassword(indek);
    }
  });
}

Forgot.confirmPassword=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Forgot.formCreate(indek)});
  Forgot.formConfirm(indek);
}

Forgot.formConfirm=(indek)=>{
  const html='<div class="div-center">'
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;line-height:1.5rem;"></div>'
      +'<form autocomplete="off" align="center">'
      +'<p><b>2 - We sent a code to your email address.<br>Enter that code  to confirm your account.</b></p>'
      +'<ul>'

      +'<li>&#128273; <label>Enter Code</label>&nbsp;'
        +'<input type="text" id="reset_code_'+indek+'">'
        
      +'<li><button type="button"'
        +' id="button_create_'+indek+'"'
        +'  onclick="Forgot.enterPassword(\''+indek+'\')">&#128275; Continue'
        +'</button>'
        +'</li>'
      
      +'</ul>'
      +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  document.getElementById('reset_code_'+indek).focus();
}

Forgot.enterPassword=(indek)=>{
  Forgot.reset_code=getEV('reset_code_'+indek);
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Forgot.formCreate(indek)});
  Forgot.formPassword(indek);
}

Forgot.formPassword=(indek)=>{
  const html='<div class="div-center">'
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off" align="center">'
    +'<p><b>3 - Change Password</b></p>'
    +'<ul>'

    +'<li>&#128273; <label>New password</label>&nbsp;'
      +'<input type="password" id="password_'+indek+'">'

    +'<li>&#128273; <label>Retype password</label>&nbsp;'
      +'<input type="password" id="retype_password_'+indek+'">'

    +'<li><button type="button"'
      +' id="button_create_'+indek+'"'
      +'  onclick="Forgot.updatePassword(\''+indek+'\')">&#128275; Continue'
      +'</button>'
      +'</li>'
    
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  document.getElementById('password_'+indek).focus();
}

Forgot.updatePassword=(indek)=>{
  if(getEV('password_'+indek)==getEV('retype_password_'+indek)){
    db.execute(indek,{
      query:"UPDATE reset_password "
        +" SET password='"+getEV('password_'+indek)+"'"
        +" WHERE email_address='"+Forgot.email_address+"'"
        +" AND reset_code='"+Forgot.reset_code+"'"
    },(p)=>{
      if(p.err.id==0){
        Forgot.finalPath(indek);
      }else{
        message.paket(indek,p);
      }
    });
  }else{
    pesanSalah2(indek,6,['new_password','retype_password'],[]);
  };
}

Forgot.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.close(indek);
  const html='<div class="div-center">'
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off" align="center">'
    +'<p><b>4 - Change Password Succesfully.</b></p>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
}

// eof: 60;80;
