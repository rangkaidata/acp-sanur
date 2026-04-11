/*
 * auth: budiono;
 * date: jan-16, 17:36, fri-2026; 
 */ 

'use strict';

var ChangePassword={}
  
ChangePassword.table_name='calendar';
ChangePassword.title='Change Password';
ChangePassword.form=new ActionForm2(ChangePassword);


ChangePassword.show=(tiket)=>{
  tiket.modul=ChangePassword.table_name;
  tiket.menu.name=ChangePassword.title;
  tiket.ukuran.lebar=40;
  tiket.ukuran.tinggi=20;
  tiket.bisa.besar=0;
  tiket.bisa.kecil=0;
  tiket.bisa.tutup=0;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    getPath(indek,UserProfile.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        ChangePassword.formView(indek);
      });
    });
  }else{
    show(baru);
  }
}

ChangePassword.formView=(indek)=>{
  ChangePassword.formEdit(indek);
  toolbar.none(indek);
//  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
//  toolbar.edit(indek,()=>ChangePassword.formUpdate(indek));
  toolbar.save(indek,()=>ChangePassword.updateExecute(indek));
}

ChangePassword.formEdit=(indek)=>{

  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    //+'<div id="msg_'+indek+'" style="padding:0.5rem;"></div>'
    +'<div id="msg_'+indek+'" style="margin:0.5rem;"></div>'
    
    +'<form autocomplete="off" style="padding:1rem;" '
      +'id="form_'+indek+'" enctype="multipart/form-data">'

      +'<div>'
        +'<ul>'
        +'<li><label>Current Passwd:&nbsp;</label><input type="password" id="current_password_'+indek+'"></li>'
        +'<li><label>New Password:&nbsp;</label><input type="password" id="new_password_'+indek+'"></li>'
        +'<li><label>Retype Passwd:&nbsp;</label><input type="password" id="retype_password_'+indek+'"></li>'
        +'</ul>'
      +'</div>'
    
//    +'</div>'
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);

  document.getElementById("current_password_"+indek).focus();
}


ChangePassword.updateExecute=(indek)=>{
  if(getEV("retype_password_"+indek)!=getEV("new_password_"+indek)){
    pesanSalah2(indek,6,['retype_password','new_password'],[]);
    return;
  }

  db.execute(indek,{
    query:"UPDATE users "
      +" SET current_password='"+getEV('current_password_'+indek)+"',"
      +" user_password='"+getEV('new_password_'+indek)+"'"
      
  });
}
