/*
 * name: budiono
 * date: sep-04, 15:28, mon-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: mar-26, 21:56, tue-2024; quota terpisah dgn login;
 * edit: apr-25, 11:49, thu-2024; objectOne;
 * edit: aug-27, 20:45, tue-2024; r14; 
 * edit: aug-31, 11:48, sat-2024; r14;
 * edit: nov-15, 08:57, fri-2024; #26; update upload photo;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 12:50, thu-2025; #32; properties;
 * edit: feb-13, 18:09, thu-2025; #40; new properties;
 * edit: mar-23, 13:39, sun-2025; #45; tables;structure;
 */

'use strict';

var UserProfile={
  table_name:'users',
  title:"User Profile"
}

UserProfile.show=(tiket)=>{
  tiket.modul=UserProfile.table_name;
  tiket.menu.name=UserProfile.title;

  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    getPath(indek,UserProfile.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        UserProfile.formView(indek);
      });
    });
  }else{
    show(baru);
  }  
}

UserProfile.formView=(indek)=>{
  UserProfile.form(indek);
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  toolbar.edit(indek,()=>UserProfile.formUpdate(indek));
  UserProfile.readOne(indek,()=>{
    toolbar.download(indek,()=>UserProfile.formExport(indek));    
  });  
}

UserProfile.form=(indek)=>{

  bingkai[indek].metode="View"

  var html='<div style="margin:1rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin:0.5rem;"></div>'
    +'<div>'
    
    +'<form autocomplete="off" id="form_'+indek+'"  enctype="multipart/form-data">'      
    +'<div'
      +' style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);padding-bottom:20px;">'
      +'<div>'
        +'<ul>'
        +'<li><label>User ID</label>: '
          +'<i id="id_'+indek+'"></i></li>'
          
        +'<li><label>User Name</label>: '
          +'<i id="name_'+indek+'"></i></li>'
          
        +'<li><label>Full Name</label>: '
          +'<i id="fullname_'+indek+'"></i></li>'
          
        +'<li><label>Email Address</label>: '
          +'<i id="email_address_'+indek+'"></i></li>'
          
        +'<li><label>Mobile Number</label>: '
          +'<i id="mobile_number_'+indek+'"></i></li>'
          
        +'<li><label>Size</label>: '
          +'<i id="size_'+indek+'"></i></li>'
          
        +'<li><label>Used</label>: '
          +'<i id="used_'+indek+'"></i></li>'
        
        +'<li><label>Free</label>: '
          +'<i id="free_'+indek+'"></i></li>'
        
        +'</ul>'
      +'</div>'

      +'<div>'
/*      
        +'<p><img id="folder_image_'+indek+'" '
        +' width="200" height="200"/ '
        +' srcset="'+bingkai[indek].server.url+'photo">'
        +'</p>'
*/        
        +'<p><img id="folder_image_'+indek+'" '
        +' width="200" height="200"/ '
        +' srcset="'+bingkai[indek].server.url+'photo">'
        +'</p>'
        
        +'<input type="text" disabled'
        +' id="user_photo_'+indek+'"'
        +' disabled class="b-text">' 
        +'</li>'
        +'</ul>'
      +'</div>'
    +'</div>'
    +'</form>'
    +'<div>'
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

UserProfile.readOne=(indek,eop)=>{

  db.execute(indek,{
    query:"SELECT * FROM users;"
  },(paket)=>{
    if(paket.err.id==0){
      var v=objectOne(paket.fields,paket.data);
      var photo=        bingkai[indek].server.url+"photo"
        +'?login_id='+bingkai[indek].login.id
        +'&user_photo='+v.user_photo
        +'&'+new Date();
      
      document.getElementById('id_'+indek).innerHTML=blokID2(v.user_id);
      setEH('name_'+indek,'@'+xHTML(v.user_name) );
      setEH('fullname_'+indek, xHTML(v.user_fullname) );
      setEH('email_address_'+indek, xHTML(v.email_address) );
      setEH('mobile_number_'+indek, xHTML(v.mobile_number) );
      setEV("user_photo_"+indek, v.user_photo);

      document.getElementById("folder_image_"+indek).src=photo;
      document.getElementById("folder_image_"+indek).srcset=photo;

      
    }
    statusbar.message(indek,paket);
    message.none(indek);
    
    db.run(indek,{
      query:"SELECT size,used,free FROM quota_blockchain_sum;"
    },(paket)=>{
      if(paket.count>0){
        setEH('size_'+indek, paket.data[0][0] +' tx');
        setEH('used_'+indek, paket.data[0][1] +' tx');      
        setEH('free_'+indek, paket.data[0][2] +' tx');      
      }
      return eop();
    });
  });
}

UserProfile.formUpdate=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{UserProfile.formView(indek);});
  toolbar.properties(indek,()=>{UserProfile.properties(indek);});
  UserProfile.formEdit(indek);
  UserProfile.readOne02(indek,()=>{
    toolbar.save(indek,()=>UserProfile.updateExecute(indek));
  });
}

UserProfile.formEdit=(indek)=>{

  var html='<div style="padding:0.5rem;">'
    +'<div id="msg_'+indek+'" style="padding:0.5rem;"></div>'
    
    +'<form autocomplete="off" style="padding:1rem;" '
    +'id="form_'+indek+'" enctype="multipart/form-data">'
    +'<div'
      +' style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);padding-bottom:20px;"'
      +'>'

      +'<div>'
        +'<ul>'
        +'<li><label>Name</label>: <label><strong id="name_'+indek+'"></strong></label></li>'
        +'<li><label>Full Name</label>: <input type="text" id="fullname_'+indek+'" ></li>'
        +'<li><label>Email Address</label>: <input type="text" id="email_address_'+indek+'" ></li>'
        +'<li><label>Mobile Number</label>: <input type="text" id="mobile_number_'+indek+'" ></li>'
        +'<li><label>Current Password</label>: <input type="password" id="current_password_'+indek+'"></li>'
//        +'<li><label>New Password</label>: <input type="password" id="new_password_'+indek+'"></li>'
//        +'<li><label>Retype Password</label>: <input type="password" id="retype_password_'+indek+'"></li>'
        +'</ul>'
      +'</div>'
    
      +'<div>'
        +'<input type="file" name="file_photo" '
          +'id="fileToUpload_'+indek+'" '
          +'accept="image/*" '
          +'onchange="loadFilePhoto(event,'+indek+')">'

        +'<br><button type="button" '
          +'onclick="noPhoto('+indek+')">No image</button>' 
/*        
        +'<p><img id="folder_image_'+indek+'" '
        +'width="150" height="150"/ src='+bingkai[0].server.url+'photo?login_id='
        +bingkai[indek].login.id+'></p>'
*/
//        +'<p><img id="folder_image_'+indek+'" '
//        +'width="150" height="150"/></p>'        
        +'<p><img id="folder_image_'+indek+'" '
        +'width="150" height="150"/ srcset='+bingkai[0].server.url+'photo?login_id='
        +bingkai[indek].login.id+'></p>'
        
        +'<input type="text" id="user_photo_'+indek+'" value="" disabled class="b-text">' 
        
      +'</div>'
    +'</div>'
    +'</form>'
    +'</div>'
    +'<p><label><i>&#10020 PENTING!!<br>&emsp; '
    +'Bila Anda seringkali ganti (reset/forgot) password. <br>&emsp;'
    +'Sebaiknya alamat email ditulis dengan benar,&nbsp;'
    +'agar kode verifikasi dapat di kirim ke alamat email Anda.</i></label></p>';
  content.html(indek,html);
  statusbar.ready(indek);

  document.getElementById("fullname_"+indek).focus();
}

UserProfile.readOne02=(indek,eop)=>{

  db.execute(indek,{
    query:"SELECT * FROM users;"
  },(paket)=>{
    if(paket.err.id==0){
      var v=objectOne(paket.fields,paket.data);
      var photo=bingkai[indek].server.url+"photo"
        +'?login_id='+bingkai[indek].login.id
        +'&user_photo='+v.user_photo
        +'&'+new Date();
      
      document.getElementById('name_'+indek).innerHTML=v.user_name;
      setEV('fullname_'+indek, v.user_fullname);
      setEV('email_address_'+indek, v.email_address);
      setEV('mobile_number_'+indek, v.mobile_number);
      setEV("user_photo_"+indek, v.user_photo);
      
      document.getElementById("folder_image_"+indek).src=photo;
      document.getElementById("folder_image_"+indek).srcset=photo;
        
            
      statusbar.ready(indek);
    }
    message.none(indek);
    return eop();
  });
}

UserProfile.getDir=(indek)=>{
  return {
    folder:'/',
    name:UserProfile.table_name
  };
}


UserProfile.updateExecute=(indek)=>{
/*  
  if(getEV("retype_password_"+indek)!=getEV("new_password_"+indek)){
    pesanSalah2(indek,6,['retype_password','new_password'],[]);
    return;
  }
*/  
  var current_password=getEV('current_password_'+indek);

  db.execute(indek,{
    query:"UPDATE users "
      +" SET user_fullname='"+getEV('fullname_'+indek)+"',"
      +" email_address='"+getEV('email_address_'+indek)+"',"
      +" mobile_number='"+getEV('mobile_number_'+indek)+"',"
//      +" current_password='"+getEV('current_password_'+indek)+"',"
//      +" user_password='"+getEV('new_password_'+indek)+"',"
//      +" user_photo='"+getEV('user_photo_'+indek)+"'"
      +" current_password='"+current_password+"',"
      +" user_password='"+current_password+"',"
      +" user_photo='"+getEV('user_photo_'+indek)+"'"
  },(paket)=>{
    if(getEV("fileToUpload_"+indek)!=''){
      uploadPhoto(indek);// upload image
    }
  });
}

UserProfile.formExport=function(indek){
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>UserProfile.formView(indek));
  UserProfile.exportExecute(indek);
}

UserProfile.exportExecute=(indek)=>{
  var table_name=UserProfile.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

UserProfile.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM users"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    };
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}



// eof:202;248;305;300;
