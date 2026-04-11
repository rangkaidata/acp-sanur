/*
 * auth: budiono
 * date: sep-04, 21:47, mon-2023; new;130;
 */ 
 
'use strict';

var nBebas={
  gimana:false,
  indek:-1
}

var hentikan=false;

Resize.init=function(e) {
  if(event.srcElement.className=='tombol'){
    window.addEventListener('mousemove', Resize.start, false);
    window.addEventListener('mouseup', Resize.stop, false);
  }
}

Resize.start=function() {
  nGeser.bisa=false;
  if(nBebas.gimana==false){
    var nama=event.srcElement.id;
    if(event.srcElement.className!='tombol'){
      return;
    }

    if(nama.substring(0,13)!="frm_btn_size_"){
      return;
    }

    const jendela_n=document.getElementById(nama);
    if (jendela_n==null){
      return 
    }

    const jendela_id=nama;
    const jendela_arr=jendela_id.split("_");
    nBebas.indek=(jendela_arr[jendela_arr.length-1]);
  }
  nBebas.gimana=true;

  const ada=document.getElementById("frm_toolbar_"+nBebas.indek);
  const ada_statusbar=document.getElementById("frm_statusbar_"+nBebas.indek);
  const ada_konten=document.getElementById("frm_konten_"+nBebas.indek);
  
  const lebar_minimal=20;
  const tinggi_minimal=2;
  
  if(
    document.getElementById("frm_"+nBebas.indek).offsetHeight<=parseInt(remPxn(tinggi_minimal+3)) || 
    document.getElementById("frm_"+nBebas.indek).offsetWidth<=parseInt(remPxn(lebar_minimal)) 
  ){
    if (ada){document.getElementById("frm_toolbar_"+nBebas.indek).style.visibility="hidden";}
    if (ada_statusbar){document.getElementById("frm_statusbar_"+nBebas.indek).style.visibility="hidden";}
    document.getElementById("frm_konten_"+nBebas.indek).style.visibility="hidden";
    document.getElementById("frm_"+nBebas.indek).style.overflow="hidden";
  }else{
    document.getElementById("frm_konten_"+nBebas.indek).style.visibility="visible";
    if(bingkai[nBebas.indek].toolbar.ada==1){document.getElementById("frm_toolbar_"+nBebas.indek).style.visibility="visible";}
    if(bingkai[nBebas.indek].statusbar.ada==1){document.getElementById("frm_statusbar_"+nBebas.indek).style.visibility="visible";}
    document.getElementById("frm_"+nBebas.indek).style.overflow="auto";
  }
  
  if(hentikan==false){
    document.getElementById("frm_"+nBebas.indek).style.transition= "0s";
    document.getElementById("frm_"+nBebas.indek).style.width=(10+event.clientX - document.getElementById("frm_"+nBebas.indek).offsetLeft) + 'px';
    document.getElementById("frm_"+nBebas.indek).style.height=(7+event.clientY - document.getElementById("frm_"+nBebas.indek).offsetTop) + 'px';
  }
  
  // dibuatkan fungsi---nanti !!
  const lbr_1=(document.getElementById("frm_"+nBebas.indek).offsetWidth-5);
  const tng_1=(document.getElementById("frm_"+nBebas.indek).offsetHeight-5);

  if(// stop resize height;
    document.getElementById("frm_"+nBebas.indek).offsetHeight<parseInt(remPxn(tinggi_minimal-0.5))
  ){
    hentikan=true;
    document.getElementById("frm_"+nBebas.indek).style.height=tinggi_minimal+"rem";
  }
  
  if(// stop resize height;
    document.getElementById("frm_"+nBebas.indek).offsetWidth<parseInt(remPxn(lebar_minimal))
  ){
    hentikan=true;
    document.getElementById("frm_"+nBebas.indek).style.width=lebar_minimal+'rem';//"21.00rem";
  }
    
  document.getElementById("frm_konten_"+nBebas.indek).style.width=parseInt(lbr_1)-remPxn(0.1)+'px';
  document.getElementById("frm_konten_"+nBebas.indek).style.height=parseInt(tng_1)-remPxn(5.71)+'px';

  if(bingkai[nBebas.indek].toolbar.ada==0){
    document.getElementById('frm_konten_'+nBebas.indek).style.top=remPx(1.5);
    document.getElementById('frm_konten_'+nBebas.indek).style.height=(tng_1-remPxn(3.0))+'px';
  }
  
  if(bingkai[nBebas.indek].toolbar.ada==1){
    document.getElementById("frm_toolbar_"+nBebas.indek).style.width=(lbr_1-remPxn(1))+'px'
  }
  
  document.getSelection().removeAllRanges();
}

Resize.stop=function(e) {
  nBebas.gimana=false;
  nGeser.bisa=true;
  hentikan=false;
  
  if(nBebas.indek==-1){return;}
  console.log(nBebas.indek);
  document.getElementById("frm_"+nBebas.indek).style.transition= "0.6s";
  
  bingkai[nBebas.indek].ukuran={
    lebar:pxRem(document.getElementById("frm_"+nBebas.indek).offsetWidth),
    tinggi:pxRem(document.getElementById("frm_"+nBebas.indek).offsetHeight),
  }

  bingkai[nBebas.indek].letak={
    kiri:pxRem(document.getElementById("frm_"+nBebas.indek).offsetLeft),
    atas:pxRem(document.getElementById("frm_"+nBebas.indek).offsetTop),
  }
  
  // alert(bingkai[nBebas.indek].letak.kiri);
  
  window.removeEventListener('mousemove', Resize.start, false);
  window.removeEventListener('mouseup', Resize.stop, false);
  
}
// eof:130;
