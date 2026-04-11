/*
 * name: budiono;
 * date: feb-28, 08:49, wed-2024; new
 */
 
'use strict';

var FiscalYear={}

FiscalYear.table_name='fiscal_year';
FiscalYear.title="Fiscal Year";
FiscalYear.form=new ActionForm2(FiscalYear);
FiscalYear.hideNew=true;

FiscalYear.show=(tiket)=>{
  tiket.modul=FiscalYear.table_name;
  tiket.menu.name=FiscalYear.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
  }else{
    show(baru);
  }  
}


