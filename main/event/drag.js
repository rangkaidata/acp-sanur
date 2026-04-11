/*
 * auth: budiono
 * date: aug-31, 07:27, thu-2023; new;91;
 */ 

'use strict';

var nGeser={
   gimana:false
  ,ax:0
  ,ay:0
  ,indek:-1
  ,bisa:false
}

Drag.init=function(e){
  if(event.srcElement.className=='jendela' 
  || event.srcElement.className=='toolbar'){
    window.addEventListener('mousemove', Drag.start, false);
    window.addEventListener('mouseup', Drag.stop, false);
  }else{
    window.removeEventListener('mousemove', Drag.start, false);
    window.removeEventListener('mouseup', Drag.stop, false);
  }
}

Drag.start=function(){
  if(nBebas.gimana==true){
    return;
  }
  if(nGeser.gimana==false){
    var nama=event.srcElement.id;
    
    if(event.srcElement.className!='jendela' 
    && event.srcElement.className!='toolbar'){
      window.removeEventListener('mousemove', Drag.start, false);
      return;
    }
    
    const jendela_id=nama;
    const jendela_arr=jendela_id.split("_");
    nGeser.indek=(jendela_arr[jendela_arr.length-1]);
    
    console.log(bingkai[nGeser.indek].status);
    
    if(bingkai[nGeser.indek].status==3) return; // kondisi max, tdk bisa geser
    
    nGeser.ax=(event.clientX-document.getElementById("frm_"+nGeser.indek).offsetLeft);
    nGeser.ay=(event.clientY-document.getElementById("frm_"+nGeser.indek).offsetTop);
    if(bingkai[nGeser.indek].ada_toolbar=='ada'){
      document.getElementById("frm_toolbar_"+nGeser.indek).style.cursor="move";
    }
    document.getElementById("frm_"+nGeser.indek).style.cursor="move";
  }
  nGeser.gimana=true;
  
  if(document.getElementById("frm_"+nGeser.indek)!=null){
    document.getElementById("frm_"+nGeser.indek).style.transition= "0s";
    document.getElementById("frm_"+nGeser.indek).style.left=(event.clientX-nGeser.ax)+'px';
    document.getElementById("frm_"+nGeser.indek).style.top=(event.clientY-nGeser.ay)+'px';
  }
}

Drag.stop=function(){
  
  nGeser.gimana=false;
  if(nGeser.indek==-1){return};
  if(document.getElementById("frm_"+nGeser.indek)==null){
    return;
  }
  console.log('stop: '+bingkai[nGeser.indek].status);
  if(bingkai[nGeser.indek].status==3) return; // kondisi max, tdk bisa geser
  
  document.getElementById("frm_"+nGeser.indek).style.transition= "0.6s";
  /*
  bingkai[nGeser.indek].ukuran={
    lebar:ui.pxRm(document.getElementById("frm_"+nGeser.indek).offsetWidth),
    tinggi:ui.pxRm(document.getElementById("frm_"+nGeser.indek).offsetHeight),
  }*/
  bingkai[nGeser.indek].letak={
    kiri:ui.pxRm(document.getElementById("frm_"+nGeser.indek).offsetLeft),
    atas:ui.pxRm(document.getElementById("frm_"+nGeser.indek).offsetTop),
  }
  
  window.removeEventListener('mousemove', Drag.start, false);
  window.removeEventListener('mouseup', Drag.stop, false);
  document.getElementById("frm_"+nGeser.indek).style.cursor="default";
  if(bingkai[nGeser.indek].ada_toolbar=='ada'){
    document.getElementById("frm_toolbar_"+nGeser.indek).style.cursor="default";
  }
}
// eof: 91;
