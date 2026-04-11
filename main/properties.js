/*
 * name: budiono;
 * date: dec-14, 15:40, sat-2024; #31; properties;
 * edit: feb-13, 11:26, thu-2025; #40; properties-2;
 */

'use strict';

var Properties={};

Properties.show=(tiket)=>{
  tiket.modul='properties';
  //tiket.menu.name="&#x1F512 Data Locker (Read-only)";
  tiket.menu.name="Properties";
  tiket.ukuran.lebar=40;
  tiket.ukuran.tinggi=35;
  tiket.bisa.tutup=0;
  tiket.bisa.kecil=0;
  tiket.bisa.besar=0;
  tiket.bisa.ubah=0;
//  tiket.statusbar.ada=0;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiSpesial(tiket);
    var indek=newReg.show();
    Properties.formUpdate(indek);
  }else{
    show(baru);
  }  
}

Properties.formUpdate=(indek)=>{
  toolbar.none(indek);  
  toolbar.close(indek);  
  Properties.formEntry(indek);
  Properties.readOne(indek,()=>{    
  });
}

Properties.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
//    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'

    +'<li>'
      +'<label style="text-align:right;color:gray;">'
        +'File name:&nbsp;</label>'
      +'<input type="text" '
        +' id="name_'+indek+'"'
        +' size="20">'
    +'</li>'
      
    +'<li>'
      +'<label style="text-align:right;color:gray;">'
        +'Type:&nbsp;</label>'
      +'<span id="type_'+indek+'"'
        +' style="background-color:lightgrey;padding:1px;border-radius:10%;">'
        +array_file_type[1]
      +'</span>'
    +'</li>'
    
    +'<li><label style="text-align:right;color:gray;">' 
      +'Parent folder:&nbsp;</label>'
      +'<input type="text"'
      +' id="parent_'+indek+'">'
      //+'<span id="parent_'+indek+'"></span>'
    +'</li>'
      
    +'<li><label style="text-align:right;color:gray;">'
      +'Locked:&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="locked_'+indek+'">'
      +'</label>'
    +'</li>'

    +'<li><label style="text-align:right;color:gray;">'
      +'Created:&nbsp;</label>'
      +'<span id="date_created_'+indek+'"></span>'
    +'</li>'
      
    +'<li><label style="text-align:right;color:gray;">'
      +'Modified:&nbsp;</label>'
      +'<span id="date_modified_'+indek+'"></span>'
    +'</li>'
      
    +'<li><label style="text-align:right;color:gray;">'
      +'File Path:&nbsp;</label>'
      +'<span id="path_'+indek+'"></span>'
    +'</li>'
    +'<li><label style="text-align:right;color:gray;">'
      +'Add caption:&nbsp;</label>'
      +'<input type="text" id="note_'+indek+'" size="30" style="padding:20px 10px;">'
    +'</li>'
/*      
    +'<li><label style="text-align:right;color:gray;">'
      +'File ID:&nbsp;</label>'
      +'<span id="file_id_'+indek+'"></span>'
    +'</li>'
*/      
/*
    +'<li><label style="text-align:right;color:gray;">'
      +'&nbsp;</label>'
      +'<div id="db_query_'+indek+'" '
      +'style="margin:auto;padding:10px;'
      +'width:350px;display:inline-block;border:1px solid grey;'
      +'white-space:wrap;border-radius:10px;"></div>'
    +'</li>'
*/
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  // statusbar.ready(indek);
  
  document.getElementById('name_'+indek).focus();
  setEV('parent_'+indek, bingkai[indek].path);
}

Properties.readOne=(indek,callback)=>{
  var file_id=bingkai[indek].file_id;

  db.run(indek,{
    query:"SELECT * "
    +" FROM properties"
    +" WHERE file_id='"+file_id+"'"
    +" AND admin_name='"+bingkai[indek].admin.name+"'"

  },(paket)=>{
    if (paket.err.id==0){
      if(paket.count>0){

        toolbar.save(indek,()=>Properties.updateExecute(indek));  // kenapa ini disini???
        
        var d=objectOne(paket.fields,paket.data);
        setEV('name_'+indek, d.name);
        setiH('type_'+indek, array_file_type[d.type] );
        setEV('parent_'+indek, d.parent);
        setEV('note_'+indek, d.note);
        setEC('locked_'+indek, d.locked);
        setiH('date_created_'+indek, tglInt(d.date_created) );
        setiH('date_modified_'+indek, tglInt(d.date_modified) );

        setiH('path_'+indek, d.path
          +'.<i style="background-color:lightgrey;padding:1px;">'
          +array_file_type[d.type]+'</i>');

//        setiH('db_query_'+indek, d.query);
        
        bingkai[indek].db_query=d.query;
        
        bingkai[indek].path=d.path;
      }else{
        var html='<div style="padding:0.5rem">'
          +content.message(indek)
          +"<strong>Property owned by someone else</strong>"
          +"</div>";
        content.html(indek,html);
      }      
      message.none(indek);
    }
    return callback();
  });
}

Properties.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE properties"
      +" SET locked="+getEC("locked_"+indek)
      +",name='"+getEV("name_"+indek)+"'"
      +",parent='"+getEV("parent_"+indek)+"'"
      +",note='"+getEV("note_"+indek)+"'"

      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND file_id='"+bingkai[indek].file_id+"'"
  });
}

Properties.lookup=(indek)=>{
  const x=JSON.parse(JSON.stringify(bingkai[indek]));
  x.baru=true;
  x.parent=indek;
  Properties.show(x);
}



// eof: 195;191;175;170;
