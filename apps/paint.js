/*
 * auth: budiono;
 * date: Dec-03, 22:24, tue-2024; #28;files;
 */ 

'use strict';

var Calendar={}
  
Calendar.table_name='calendar';
Calendar.title='Calendar';
Calendar.form=new ActionForm2(Calendar);

Calendar.show=(tiket)=>{
  tiket.modul=Calendar.table_name;
  tiket.menu.name=Calendar.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    Calendar.form.modePaging(indek);
  }else{
    show(baru);
  }
}

Calendar.readPaging=(indek)=>{}
Calendar.formEntry=(indek)=>{}
Calendar.search=(indek)=>{}
Calendar.createExecute=(indek)=>{}
Calendar.exportExecute=(indek)=>{}
Calendar.readSelect=(indek)=>{}
