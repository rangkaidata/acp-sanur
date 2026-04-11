/*
 * name: budiono
 * date: sep-04, 10:53, mon-2023; new:30;
 * edit: seo-05, 11:12, tue-2023; add;38;
 */
 
'use strict';

message.wait=function(indek){
  this.html(indek
    ,'<span style="background-color:gold;'
    +'padding:0.5rem;margin:0.1rem;border-radius:0rem 1rem 1rem;">'
    +'Sending, please wait ...</span>'
  );
}

message.html=function(indek,html){
  document.getElementById('msg_'+indek).innerHTML=html;
}

message.paket=function(indek,paket){
  this.html(indek,db.info(paket));
}

message.none=function(indek){
  this.html(indek,'');
}

message.infoPaket=function(indek,paket){
  this.html(indek,db.info(paket));
}

message.text=function(indek,text){
  document.getElementById('msg_'+indek).innerHTML=
    '<span style="background-color:gold;'
    +'padding:0.5rem;margin:0.1rem;border-radius:0rem 1rem 1rem;">'
    +text+'</span>';
}
// eof: 30;38;
