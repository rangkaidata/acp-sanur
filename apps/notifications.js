/*
 * auth: budiono;
 * date: Dec-03, 22:24, tue-2024; #28;files;
 */ 

'use strict';

var Notifications={}
  
Notifications.table_name='notofications';
Notifications.title='Notifications';
Notifications.form=new ActionForm2(Notifications);

Notifications.show=(tiket)=>{
  tiket.modul=Notifications.table_name;
  tiket.menu.name=Notifications.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    Notifications.form.modePaging(indek);
  }else{
    show(baru);
  }
}

Notifications.readPaging=(indek)=>{}
Notifications.formEntry=(indek)=>{}
Notifications.search=(indek)=>{}
Notifications.createExecute=(indek)=>{}
Notifications.exportExecute=(indek)=>{}
Notifications.readSelect=(indek)=>{}


//eof: 
