/*
 * auth: budiono
 * date: aug-31, 09:18, thu-2023; new;53;
 */

'use strict';

var About={}

About.show=(tiket)=>{
  tiket.menu.name='About'
  tiket.modul='user';
  
  tiket.ukuran.lebar=50;
  tiket.ukuran.tinggi=30;
  tiket.modal=1;
  tiket.letak.tengah=1;
  
  tiket.bisa.besar=0;
  tiket.bisa.kecil=0;
  tiket.bisa.ubah=0;
  tiket.bisa.tambah=0;
  
  tiket.toolbar.ada=0;
  tiket.statusbar.ada=0;
  
  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiSpesial(tiket);
    const indek=newReg.show();
    About.formCreate(indek);
  }else{
    show(baru);
  }  
}

About.formCreate=(indek)=>{
  About.form(indek);
}

About.form=(indek)=>{
  const html='<div style="padding:0.5rem;text-align:center">'
    +'<h1>rangkaidata.com</h1>'
    +'<p style="color:blue;">Accounting With JavaScript, HTML, & CSS</p>'
    +'<p>!-----------------*****-----------------!</p>'
    +'<p><b>APLIKASI DALAM TAHAP PROSES PEMBUATAN, </b><p>'
    +'<p><b>PENGUJIAN DAN PENGEMBANGAN. </b><p>'
    +'<p>Info lanjut di X/Twitter: <b>@budiono</b> atau <b>@rangkaidata</b> Team</p>'
    +'<p><small>@2023 DKI JAKARTA, Indonesia</small></p>'
    +'</div>';

  content.html(indek,html);
}
//eof: 53;
