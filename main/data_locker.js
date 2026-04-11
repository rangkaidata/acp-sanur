/*
 * name: budiono;
 * date: nov-16, 17:19, sat-2024; #27; record_locker;
 */

'use strict';

var DataLocker={};

DataLocker.show=(tiket)=>{
  tiket.modul='lock';
  //tiket.menu.name="&#x1F512 Data Locker (Read-only)";
  tiket.menu.name="Properties";
  tiket.ukuran.lebar=40;
  tiket.ukuran.tinggi=25;
  tiket.bisa.tutup=0;
  tiket.bisa.kecil=0;
  tiket.bisa.besar=0;
  tiket.bisa.ubah=0;
  tiket.statusbar.ada=0;
  tiket.bisa.tutup=1;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiSpesial(tiket);
    var indek=newReg.show();
    DataLocker.formUpdate(indek);
  }else{
    show(baru);
  }  
}

DataLocker.formUpdate=(indek)=>{
  toolbar.none(indek);  
  DataLocker.formEntry(indek)
  DataLocker.findID(indek)
}

DataLocker.formEntry=(indek)=>{
  var parent=bingkai[indek].parent;
  var d=bingkai[parent].data_locker;
  var kode="xyz";
  var ada=0;
  var html;
  var k=Object.keys(d.primary_key);
  var v=Object.values(d.primary_key);
  
  bingkai[indek].data_locker=d;
  
  html='<div'
    +' style="padding-left:2.5rem;'
    +' padding-right:2.5rem;'
    +' padding-top:1rem;">'
    +'<div id="msg_'+indek+'" style="padding:0.5rem;"></div>'
    +'<form autocomplete="off">'
    +'<table>'
    +'<tr><td><b>table_name:</b></td>'
    +'<td>'+d.table_name+'</td></tr>';
    
    for(var i=0;i<k.length;i++){
      html+='<tr>'
        +'<td><b>'+k[i]+':</b></td>'
        +'<td>'+v[i]+'</td>'
      +'</tr>';
    }
    
    html+='</table>'
/*    
    +'<details>'
      +'<summary>Data (click me!)</summary>'
      +'<pre>'
      +JSON.stringify(d.data,undefined,2)
      +'</pre>'
    +'</details>'
    
* */
    +'</br>'
    +'<label><input type="checkbox"'
    +' id="lock_'+indek+'"> Locked'
    +'</label>'    
    
    +'<p>'
    +'<input type="button" '
    +' value="Done" onclick="DataLocker.doneExecute('+indek+')">'
    +'</p>'
    
    +'</form>'
    +'</div>';
  content.html(indek,html); 
}

DataLocker.doneExecute=(indek)=>{

  var d=bingkai[indek].data_locker;
  
  db.run(indek,{
    query:"SELECT lock_id"
      +" FROM locker"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND table_name='"+d.table_name+"'"
      +" AND primary_key='"+JSON.stringify(d.primary_key)+"'"
  },(p)=>{
    var ada=0;
    var ga_jadi=false;
    if(p.err.id==0){
      if(p.count>0){
        ada=1;
      }
      
      if(ada==0){
        if(getEC('lock_'+indek)==true){
          DataLocker.createExecute(indek);
        }else{
          ga_jadi=true;
        }
      }else{
        if(getEC('lock_'+indek)==false){
          var d=objectOne(p.fields,p.data);
          bingkai[indek].data_locker.lock_id=d.lock_id;
          DataLocker.deleteExecute(indek);
        }else{
          ga_jadi=true;
        }
      }
      
      if(ga_jadi==true) {
        ui.CLOSE_POP(indek);
      }
    }else{
      message.infoPaket(indek,p);
    }
  })
}

DataLocker.findID=(indek)=>{
  var d=bingkai[indek].data_locker;

  db.run(indek,{
    query:"SELECT lock_id"
      +" FROM locker"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND table_name='"+d.table_name+"'"
      +" AND primary_key='"+JSON.stringify(d.primary_key)+"'"
  },(p)=>{
    if(p.count>0){
      setEC('lock_'+indek,true);
    }else{ // error
      if(p.err.id!=0){
        message.infoPaket(indek,p);
      }
    }
  })
}

DataLocker.createExecute=(indek)=>{
  var d=bingkai[indek].data_locker;
  var lock_id=new Date().getTime();

  db.run(indek,{
    query:"INSERT INTO locker "
      +"(admin_name,lock_id,table_name,primary_key)"
      +" VALUES ("
      +"'"+bingkai[indek].admin.name+"',"
      +"'"+lock_id+"',"
      +"'"+d.table_name+"',"
      +"'"+JSON.stringify(d.primary_key)+"')"
  },(p)=>{
    if(p.err.id==0){
      ui.CLOSE_POP(indek);
    }
    message.infoPaket(indek,p);
  });
}

DataLocker.deleteExecute=(indek)=>{
  var d=bingkai[indek].data_locker;

  db.run(indek,{
    query:"DELETE FROM locker"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND lock_id='"+d.lock_id+"'"
  },(p)=>{
    if(p.err.id==0){
      ui.CLOSE_POP(indek);
    }
    message.infoPaket(indek,p);
  });
}

// eof: 195;191;
