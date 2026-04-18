/*
 * auth: budiono
 * date: sep-04, 16:10, mon-2023; new;98;
 * edit: sep-17, 07:34, sun-2023; 
 * -----------------------------; happy new year 2024;
 * edit: mar-23, 14:30, sat-2024; Basic SQL;
 * edit: mar-26, 21:42, tue-2024; quota sudah terpisah dgn login;
 * edit: aug-29, 17:28, thu-2024; r14;
 * edit: sep-01, 22:32, sat-2024; 
 * edit: oct-17, 06:50, thu-2024; #22;
 * edit: feb-13, 17:58, thu-2025; #40; new properties;
 */ 

'use strict';

var Logout={
  url:'login'
};

Logout.show=(tiket)=>{
  tiket.modul=Logout.url;
  tiket.ukuran.lebar=45;
  tiket.ukuran.tinggi=30;
  tiket.toolbar.ada=0;
  tiket.bisa.besar=0;
  tiket.bisa.kecil=0;
  tiket.bisa.ubah=0;
  tiket.letak.atas=0;

  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiSpesial(tiket);
    var indek=newReg.show();
    Logout.formDelete(indek);
  }else{
    show(baru);
  }  
}

Logout.formDelete=(indek)=>{
  Logout.form01(indek);
  Logout.read_one(indek);
}

Logout.deleteExecute=(indek)=>{
  if (document.getElementById("btn_logout_"+indek).innerHTML==Logout.txtEnd){
    location.reload();
    return;
  }
  message.wait(indek);  
  db.run(indek,{
    query:"DELETE FROM login "
      +" WHERE login_id='"+bingkai[0].login.id+"'"
  },(paket)=>{
    if(paket.err.id==0) {
      sessionStorage.removeItem('login_id');
      Logout.txtEnd="Log Out OK. Press F5 to Refresh Page and Log In."
      document.getElementById("btn_logout_"+indek).innerHTML=Logout.txtEnd;
      document.getElementById("btn_cancel_"+indek).style.display="none";
    }else{
      if(paket.err.id==10){
        sessionStorage.removeItem('login_id');
        Logout.txtEnd="Log Out OK. Press F5 to Refresh Page and Log In.";
        document.getElementById("btn_logout_"+indek).innerHTML=Logout.txtEnd;
      }
    }
    db.infoPaket(indek,paket);
  });
}

Logout.form01=(indek)=>{
  
  var html='<div class="div-center">'
    +'<div id="msg_'+indek+'"'
    +' style="padding:1rem;line-height:1.5rem;"></div>'
    +'<ul>'
      +'<li><label>User Name:&nbsp;</label>'
        +'<i id="name_'+indek+'"></i></li>'
        
      +'<li><label>Full Name:&nbsp;</label>'
        +'<i id="fullname_'+indek+'"></i></li>'
        
      +'<li><label>Size:&nbsp;</label>'
        +'<i id="size_'+indek+'">...</i> tx</li>'
        
      +'<li><label>Used:&nbsp;</label>'
        +'<i id="used_'+indek+'">...</i> tx</li>'
        
      +'<li><label>Free:&nbsp;</label>'
        +'<i id="free_'+indek+'">...</i> tx</li>'
        
      +'<li><label>Login Date:&nbsp;</label>'
        +'<i id="login_date_'+indek+'"></i></li>'
        
      +'<li><label>Login ID:&nbsp;</label>'
        +'<i id="login_id_'+indek+'"></i></li>'
        
      +'<li><label>Login Expired in:&nbsp;</label>'
        +'<i id="login_expired_'+indek+'"></i></li>'
        
      +'<li><label>Login Duration:&nbsp;</label>'
        +'<i id="login_duration_'+indek+'"></i></li>'
    +'</ul>'
    +'<br>'
    +'<button id="btn_logout_'+indek+'" value="Log Out"'
      +' onclick="Logout.deleteExecute(\''+indek+'\');">'
      +Menu.ikon3('Exit')+'Log out'
      +'</button>'
      
    +'<button onclick="ui.CLOSE(\''+indek+'\')" '
    +' id="btn_cancel_'+indek+'");">Cancel</button>'
      
    +'</div>'
  content.html(indek,html);
}

Logout.read_one=(indek)=>{
  db.run(indek,{
    query:"SELECT * FROM login"
    +" WHERE login_id='"+bingkai[0].login.id+"'"
  },(paket)=>{
    if(paket.err.id==0){
      var d=objectOne(paket.fields , paket.data);
      
      setEH('name_'+indek, '@'+xHTML(d.user_name) );
      setEH('fullname_'+indek, xHTML(bingkai[0].login.full_name) );
      
      setEH('login_date_'+indek, tglInt(d.date_created) );
      setEH('login_id_'+indek, blokID2(bingkai[0].login.id) );
      setEH('login_expired_'+indek, array_expired_mode[d.timeout] );
      setEH('login_duration_'+indek, loginDuration(d.date_created) );
    }
    statusbar.message(indek,paket);
    if(paket.err.id!=0) content.infoPaket(indek,paket);
    
    Logout.quota(indek);
  });
}

Logout.quota=(indek)=>{
  db.run(indek,{
    query:"SELECT size,used,free "
      +" FROM quota_blockchain_sum"
  },(paket)=>{
    if(paket.count>0){
      setEH('size_'+indek, paket.data[0][0] );
      setEH('used_'+indek, paket.data[0][1] );
      setEH('free_'+indek, paket.data[0][2] );
    }
  });
}


// eof: 98;116;136;
