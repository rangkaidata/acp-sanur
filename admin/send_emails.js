/*
 * name: budiono;
 * date: jun-15, 07:58, thu-2023; readPaging;
 * edit: jun-17, 09:52, sat-2023; reset_code;
 * edit: jun-19, 11:40, mon-2023; reset_code->reset_id;
 */ 

'use strict';

var SendEmails={};

SendEmails.show=(tiket)=>{
  tiket.modul='send_emails';
  tiket.menu.name="Send Email Reset";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    SendEmails.formPaging(indek);
  }else{
    show(baru);
  }  
}

SendEmails.formPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.search(indek,()=>SendEmails.formSearch(indek));
  toolbar.neuu(indek,()=>SendEmails.formCreate(indek));
  toolbar.refresh(indek,()=>SendEmails.formPaging(indek));
  toolbar.more(indek,()=>Menu.more(indek));
  db1.readPaging(indek,()=>{
    SendEmails.readShow(indek);
  });
}

SendEmails.readShow=(indek)=>{
  const metode=bingkai[indek].metode;
  const paket=bingkai[indek].paket;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"></div>'
    +'<p>Total: '+paket.count+' rows</p>';
    
  if (paket.err.id===0){
    if (metode==MODE_READ){
      if (paket.paging.first!=""){
        html+= '<button type="button"'
        +' id="btn_first" '
        +' onclick="SendEmails.gotoPage(\''+indek+'\','
        +'\''+paket.paging.first+'\')"></button>';
      }
      for (x in paket.paging.pages){
        if (paket.paging.pages[x].current_page=="yes"){
          html+= '<button type="button" '
          +' onclick="SendEmails.gotoPage(\''+indek+'\''
          +',\''+paket.paging.pages[x].page+'\')" disabled >'
          +paket.paging.pages[x].page 
          +'</button>'; 
        } else {
          html+= '<button type="button" '
          +' onclick="SendEmails.gotoPage(\''+indek+'\''
          +',\''+paket.paging.pages[x].page+'\')">'
          +paket.paging.pages[x].page
          +'</button>';  
        }
      }
      if (paket.paging.last!=""){
        html+='<button type="button"'
        +' id="btn_last" '
        +' onclick="SendEmails.gotoPage(\''+indek+'\''
        +',\''+paket.paging.last+'\')">'
        +'</button>';
      }
    }
  }
  
  html+='<table border=1>'
    +'<tr>'
    +'<th colspan="2">Email Address</th>'
    +'<th>Reset Code</th>'
    +'<th>Status</th>'
    +'<th>done</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'<th>Action</th>'
    +'</tr>';

  if (paket.err.id===0){
    for (var x in paket.data) {
      html+='<tr>'
        +'<td align="center">'+paket.data[x].row_id+'</td>'
        +'<td align="left">'+paket.data[x].email_to+'</td>'
        +'<td align="center">'+resetCode(paket.data[x].reset_id)+'</td>'
        +'<td align="center">'+paket.data[x].email_status+'</td>'
        +'<td align="center">'+blokID(paket.data[x].done)+'</td>'
        +'<td align="center">'+paket.data[x].info.user_name+'</td>'
        +'<td align="center">'
          +tglInt(paket.data[x].info.date_modified)+'</td>'
          
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="SendEmails.formUpdate(\''+indek+'\''
          +',\''+paket.data[x].reset_id+'\');">'
          +'</button></td>'

        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(paket.err.id!=0) content.infoPaket(indek,paket);
}

SendEmails.gotoPage=(indek,page)=>{
  bingkai[indek].page=page;
  SendEmails.formPaging(indek);
}

SendEmails.formCreate=(indek)=>{
  bingkai[indek].reset_id='';

  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>SendEmails.formLast(indek));
  toolbar.save(indek,()=>SendEmails.createExecute(indek));
  
  SendEmails.formEntry(indek, MODE_CREATE);
}

SendEmails.createExecute=(indek)=>{
  db1.createOne(indek,{
    "reset_id":getEV('reset_id_'+indek),
    "email_from":getEV('from_'+indek),
    "email_to":getEV('to_'+indek),
    "email_subject":getEV('subject_'+indek),
    "email_status":getEC('status_'+indek),
    "email_compose":getEV('compose_'+indek)
  });
}

SendEmails.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<form autocomplete="off">'
    +'<ul>'

    +'<li><label>From</label>'
      +'<input type="text"'
      +' id="from_'+indek+'"'
      +' value="rangkaidata@gmail.com"'
      +' size="20"></li>'
      
    +'<li><label>To</label>'
      +'<input type="text"'
      +' id="to_'+indek+'"'
      +' value=""'
      +' size="20">'
      
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="ResetPassword.lookUp(\''+indek+'\''
      +',\'to_'+indek+'\')"></button>'
      
      +'<input type="text"'
      +' id="reset_id_'+indek+'"'
      +' readonly>'
      
      +'</li>'
      
    +'<li><label>Subject</label>'
      +'<input type="text"'
      +' id="subject_'+indek+'" '
      +' value="Forgot Password?"'
      +' size="20"></li>'
      
    +'<li><label>&nbsp;</label><label><input type="checkbox"'
      +' id="status_'+indek+'">Send OK</label>'
      +'</li>'

    +'</ul>'
    +'<textarea cols="100" rows="20" '
      +' id="compose_'+indek+'" '
      +' placeholder="Compose Email">'
      +'</textarea>'

    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  setEV('compose_'+indek, SendEmails.isiEmail(indek));
}

SendEmails.isiEmail=(indek)=>{
  //var reset_link='http://datablok.id/reset_password/form?blok='
    //+bingkai[indek].reset_id;
    
  var reset_link=config.url+'reset_password/form?reset_id='
    +bingkai[indek].reset_id;
  
  return '\n'
+'Reset Password\n'
+'\n'
+'To reset your password, follow this link:\n'
+'\n'
+'<a href="'+reset_link+'">RESET PASSWORD</a>\n'
+'\n'
+'Link doesn\'t work? Copy the following link to your browser address bar:\n'
+reset_link
+'\n'
+'\n'
+'You received this email, because it was requested by a Rangkaidata user.\n' 
+'This is part of the procedure to create a new password on the system.\n'
+'if you DID NOT request a new password then please ignore this email and your password will remain the same.\n'
+'\n'
+'\n'
+'Thank you.\n'
+'The Rangkaidata Team';
  
}

SendEmails.formLast=function(indek){
  bingkai[indek].text_search==''?
  SendEmails.formPaging(indek):
  SendEmails.formResult(indek);
}

SendEmails.setEmail=(indek,d)=>{
  const id_kolom=bingkai[indek].id_kolom;
  
  setEV(id_kolom,d.email_address);
  setEV('reset_id_'+indek,d.reset_id);
}

SendEmails.getEmail=(indek)=>{
  
}

SendEmails.readOne=(indek)=>{
  db1.readOne(indek,{
    "reset_id":bingkai[indek].reset_id
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      const d=paket.data;
      setEV('from_'+indek,d.email_from);
      setEV('to_'+indek,d.email_to);
      setEV('subject_'+indek,d.email_subject);
      setEC('status_'+indek,d.email_status);
      setEV('reset_id_'+indek,d.reset_id);
    }
  });
}

SendEmails.formUpdate=(indek,reset_id)=>{
  bingkai[indek].reset_id=reset_id;
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>SendEmails.formLast(indek));
  toolbar.save(indek,()=>SendEmails.updateExecute(indek));

  SendEmails.formEntry(indek,MODE_UPDATE);
  SendEmails.readOne(indek);

}

SendEmails.updateExecute=(indek)=>{
  db1.updateOne(indek,{
    "reset_id":bingkai[indek].reset_id,
    "email_from":getEV('from_'+indek),
    "email_to":getEV('to_'+indek),
    "email_subject":getEV('subject_'+indek),
    "email_status":getEC('status_'+indek),
    "email_compose":getEV('compose_'+indek)
  });
}

/*EOF*/
