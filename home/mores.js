/*
 * auth: budiono;
 * date: sep-04, 12:32, mon-2023; new;170;
 * edit: sep-17, 08:26, sun-2023; xHTML;Home.refresh;
 * -----------------------------; happy new year 2024;
 * edit: apr-18, 16:32, thu-2024; Basic Query;
 * edit: apr-22, 11:49, mon-2024; replace invite.id==null /w ''
*/

'use strict';

var More={};

More.show=(tiket)=>{
  tiket.modul='home';
  tiket.ukuran.lebar=35;
  tiket.ukuran.tinggi=25;
  tiket.bisa.tutup=0;
  tiket.bisa.kecil=0;
  tiket.bisa.besar=0;
  tiket.bisa.ubah=0;
  tiket.statusbar.ada=0;
  tiket.bisa.tutup=1;
  
  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiSpesial(tiket);
    const indek=newReg.show();
    More.formUpdate(indek);
  }else{
    show(baru);
  }  
}

More.formUpdate=(indek)=>{
  toolbar.none(indek);  
  getPath2(indek,(p)=>{
    bingkai[indek].menu.folder=p.folder;
    More.form01(indek)
    More.findID(indek)
  });
}

More.form01=(indek)=>{

  var type='Folder';
  
  if(bingkai[indek].menu.type==0 || bingkai[indek].menu.type==1){
    type="Folder Name"
  }
  
  if(bingkai[indek].menu.type==2){
    type="Application Name"
  }
  
  if(bingkai[indek].menu.type==3){
    type="File Name"
  }
  
  var kode="xyz";
  var ada=0;
  var html='<div'
    +' style="padding-left:2.5rem;'
    +' padding-right:2.5rem;'
    +' padding-top:1rem;">'
    
    +'<div id="msg_'+indek+'" style="padding:0.5rem;"></div>'
    
    +'<form autocomplete="off">'
    +'<i id="menu_id_'+indek+'" hidden></i>'
    +'<table>'
      +'<tr>'
        +'<td><strong>'+type+'</strong></td>'
        +'<td>'+xHTML(bingkai[indek].menu.name)+'</td>'
      +'</tr>'
      +'<tr>'
        +'<td><strong>Data Location</strong></td>'
        +'<td>'
          +bingkai[indek].menu.folder
        +'</td>'
      +'</tr>'
      
      +'<tr>'
        +'<td><strong>App Location</strong></td>'
        +'<td>'
          +bingkai[indek].menu.parent
        +'</td>'
      +'</tr>'
      
    +'</table>'
    +'<p>'
    +'<label>'
      +'<input type="checkbox"'
      +' id="add_to_home_'+indek+'" >Add to Home'
    +'</label>'
    +'</p>'
    
    +'<p>'
    +'<input type="button"'
    +' onclick="More.CLOSE(\''+indek+'\')" value="Close">'
    +'</p>'
    +'</form>'
    +'</div>';
  content.html(indek,html); 
}

More.findID=(indek)=>{
  if(bingkai[indek].home.id==''){
    //var invite_id=bingkai[indek].invite.id;
    //if(invite_id==null) invite_id='';
    // alert('more-a')
    db.run(indek,{
      query:"SELECT * FROM home "
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND menu_id='"+bingkai[indek].menu.id+"'"
      //+" AND invite_id='"+invite_id+"'"
      +" AND admin_name='"+bingkai[indek].admin.name+"'"
    },(paket)=>{
      bingkai[indek].paket=paket;
      More.setData(indek);
    });
  }else{
    // alert('more-b')
    db.run(indek,{
      query:"SELECT * FROM home "
      +" WHERE home_id='"+bingkai[indek].home.id+"'"
    },(paket)=>{
      bingkai[indek].paket=paket;
      More.setData(indek);
    });
  }
}

More.search=function(indek,dataku,callback){
  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/search',
    dataku,
    callback,
  );
}

More.setData=(indek)=>{
  const p=bingkai[indek].paket;
  if(p.err.id==0 && p.count>0){
    const d=objectOne(p.fields,p.data);
    bingkai[indek].home.id=d.home_id;
    document.getElementById('menu_id_'+indek).innerHTML=d.home_id;
    document.getElementById('add_to_home_'+indek).checked=true;
  }else{
    bingkai[indek].home.id='';
    document.getElementById('menu_id_'+indek).innerHTML='_____'
    document.getElementById('add_to_home_'+indek).checked=false;
  }  
}

More.CLOSE=(indek)=>{
  const nilai=document.getElementById('add_to_home_'+indek).checked;
  Home.refresh=true; 
  //if(bingkai[indek].invite.id==null) bingkai[indek].invite.id='';

  if(nilai==true){
    if(bingkai[indek].home.id==''){
      More.createExecute(indek);
    }else{
      ui.CLOSE_POP(indek);// ini
    }
  }
  if(nilai==false){
    if(bingkai[indek].home.id!=''){
      More.deleteExecute(indek);
    }else{
      ui.CLOSE_POP(indek);// ini
    }
  }
}

More.createExecute=(indek)=>{
  var home_id=String(new Date().getTime()).slice(-6);
  db.run(indek,{
    query:"INSERT INTO home"
      +"(home_id,menu_id,menu_name,menu_type"
      +" admin_name,company_id,company_name,parent"
      +") VALUES "
      +"('"+home_id+"'"
      +",'"+bingkai[indek].menu.id+"'"
      +",'"+bingkai[indek].menu.name+"'"    
      +",'"+bingkai[indek].menu.type+"'"    
      +",'"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+bingkai[indek].company.name+"'"
      +",'"+bingkai[indek].menu.parent+"'"
      +")"
  },(paket)=>{
    if(paket.err.id==0){
      ui.CLOSE_POP(indek);// ini
    }else{
      message.infoPaket(indek,paket);
      //ui.CLOSE(indek);
    }    
  });
}

More.deleteExecute=(indek)=>{
  db.run(indek,{
    query:"DELETE FROM home "
    +" WHERE home_id='"+bingkai[indek].home.id+"'"
  },(paket)=>{
    if(paket.err.id==0){
      ui.CLOSE_POP(indek); //ini
    }else{
      message.infoPaket(indek,paket);
      //ui.CLOSE(indek);
    }
  });
}



// eof: 170;174;212;
