/*
 * auth: budiono;
 * date: Dec-03, 22:24, tue-2024; #28;files;
 */ 

'use strict';

var Calculator={}
  
Calculator.table_name='calculator';
Calculator.title='Calculator';
Calculator.form=new ActionForm2(Calculator);

Calculator.show=(tiket)=>{
  tiket.modul=Calculator.table_name;
  tiket.menu.name=Calculator.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    Calculator.form.modePaging(indek);
  }else{
    show(baru);
  }
}

Calculator.readPaging=(indek)=>{}
Calculator.formEntry=(indek)=>{}
Calculator.search=(indek)=>{}
Calculator.createExecute=(indek)=>{}
Calculator.exportExecute=(indek)=>{}
Calculator.readSelect=(indek)=>{}
