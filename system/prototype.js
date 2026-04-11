/*
 * name: budiono;
 * date: feb-28, 08:49, wed-2024; new
 */
 
'use strict';

var Clipboard={}

Clipboard.form=new ActionForm(Clipboard);
Clipboard.hideSelect=true;
Clipboard.hideImport=true;
Clipboard.hideNew=true;

Clipboard.show=(tiket)=>{
  tiket.modul='clipboard';
  tiket.menu.name="Clipboard";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    // Query.form.modePaging(indek);
  }else{
    show(baru);
  }  
}


