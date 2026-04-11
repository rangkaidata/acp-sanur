/*
 * auth: budiono
 * date: sep-04, 21:41, mon-2023; new;30;
 */ 
 
'use strict';

var Page404={}

Page404.show=(tiket)=>{
  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Page404.formPaging(indek);
  }else{
    show(baru);
  }  
}

Page404.formPaging=(indek)=>{
  toolbar.hide(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  Page404.form(indek);
}

Page404.form=(indek)=>{
  var html='<h1>Page not found!</h1>'
    +content.message(indek)
  content.html(indek,html);
  
  db.run(indek,{
    query:"SELECT size, begin, add, send, receive, "
      +" used, free, "
      +" stmt_insert, stmt_update, stmt_delete, "
      +" stmt_lock, stmt_unlock, "
      +" stmt_ok, stmt_err "
      +" FROM quota_blockchain_sum"
  },(paket)=>{
    if(paket.err!=0){
      content.infoPaket(indek,paket);
    }
  });
  
  
}
// eof:30;
