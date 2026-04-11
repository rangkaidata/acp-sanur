/*
 * auth: budiono
 * date: aug-31, 08:34, thu-2023; new;15;
 * edit: sep-04, 21:51, mon-2023; add:19;
 */ 
 
'use strict';

statusbar.html=function(indek,tulisan){
  document.getElementById('frm_statusbar_'+indek).innerHTML=tulisan;
}

statusbar.ready=function(indek){
  this.html(indek,"Page ready");
}

statusbar.message=function(indek,paket){
  this.html(indek,db.error(paket)+' Task completed in '+paket.timer+'s');
}
// eof: 15;19;
