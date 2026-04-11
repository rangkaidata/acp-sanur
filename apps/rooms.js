/*
 * auth: budiono;
 * date: jan-23, 11:58, fri-2026; #89; 
 */ 

'use strict';

var Rooms={};
  
Rooms.table_name='message_room';
Rooms.form=new ActionForm2(Rooms);
Rooms.contact=new ContactLook(Rooms);
Rooms.group=new GroupLook(Rooms);
Rooms.room=new RoomLook(Rooms);

Rooms.show=(tiket)=>{
  tiket.modul=Rooms.table_name;
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Rooms.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Rooms.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Rooms.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT room_id,option,contact_name,"
        +"user_name,date_modified"
        +" FROM message_room"
        +" ORDER BY room_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Rooms.readShow(indek);
    });
  })
}

Rooms.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM message_room"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Rooms.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Room ID</th>'
      +'<th>Option</th>'
      +'<th>Contact Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].room_id+'</td>'
      +'<td align="left">'+d[x].option+'</td>'
      +'<td align="left">'+d[x].contact_name+'</td>'
      
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="Rooms.formUpdate(\''+indek+'\''
        +',\''+d[x].room_id+'\''
        +',\''+d[x].option+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Rooms.formDelete(\''+indek+'\''
        +',\''+d[x].room_id+'\''
        +',\''+d[x].option+'\');">'
        +'</button></td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Rooms.form.addPagingFn(indek);// #here
}

Rooms.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Room ID:</label>'
      +'<input type="text" '
      +' id="room_id_'+indek+'"'
      +' size="12">'
    +'</li>'
    
    +'<li>'
      +'<label>Option:</label>'
      +'<select id="option_'+indek+'"'
      +' onchange="Rooms.clear(\''+indek+'\')">';
        for(var i=0;i<array_message_option.length;i++){
          html+='<option>'+array_message_option[i]+'</option>';
        }
      html+='</select>'
    +'</li>'
    
    +'<li>'
      +'<label>Contact Name:</label>'
      +'<input type="text" '
      +' id="contact_name_'+indek+'"'
      +' onchange="Rooms.getContact(\''+indek+'\')"'
      +' size="15">'
      
      +'<button type="button" '
      +' class="btn_find"'
      +' onclick="Rooms.room.getPaging(\''+indek+'\''
      +',\'room_id_'+indek+'\',\'option_'+indek+'\');"'
      +' id="btn_'+indek+'">'
      +'</button>'
    +'</li>'
    
    +'<li>'
      +'<label>Full Name:</label>'
      +'<input type="text" disabled'
      +' id="full_name_'+indek+'"'
      +' size="15">'
    +'</li>'
    
    +'<li>'
      +'<label>Send Method:</label>'
      +'<select id="message_mode_'+indek+'">'
        for(var i=0;i<array_message_method.length;i++){
          html+='<option>'+array_message_method[i]+'</option>';
        }
      html+='</select>'
    +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('room_id_'+indek).focus();
  }else{
    document.getElementById('room_id_'+indek).disabled=true;
    document.getElementById('contact_name_'+indek).focus();
  }
}

Rooms.clear=(indek)=>{
  setEV('contact_name_'+indek, "");
  setEV('full_name_'+indek, "");
}

Rooms.getReceipentPaging=(indek)=>{

  var i=document.getElementById('option_'+indek).selectedIndex
  if(i==0){
    Rooms.contact.getPaging(indek,'contact_name_'+indek,-1)
  }else{
    Rooms.group.getPaging(indek,'contact_name_'+indek,-1)
  }
}

Rooms.setContact=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.user_name);
  Rooms.getContact(indek);
}

Rooms.getContact=(indek)=>{
  setEV('full_name_'+indek, '');
  Rooms.contact.getOne(indek,getEV('contact_name_'+indek),(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEV('full_name_'+indek, d.full_name);
    }
  });
}

Rooms.setRoomServer=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.room_id);
  setEI('option_'+indek, data.option);
  
  Rooms.getRoom(indek);
}

Rooms.getRoom=(indek)=>{
  setEV('full_name_'+indek, '');
  Rooms.room.getOne(indek,
    getEV('room_id_'+indek),
    getEI('option_'+indek),
    (p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEV('room_id_'+indek, d.room_id);
      setEV('contact_name_'+indek, d.contact_name);
      setEV('full_name_'+indek, d.description);
    }
  });
}

Rooms.setGroup=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.group_id);
  Rooms.getGroup(indek);
}

Rooms.getGroup=(indek)=>{
  setEV('room_id_'+indek, '');
  setEV('full_name_'+indek, '');
  
  Rooms.group.getOne(indek,
    getEV('contact_name_'+indek),
  (p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEV('full_name_'+indek, d.name);
//      setEV('room_id_'+indek, d.room_id);
      bingkai[indek].members=JSON.parse(d.members);
    }
  });
}

Rooms.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO message_room "
    +"(bus_id,room_id,option,contact_name"
    +") VALUES "
    +"('bus_id'"
    +",'"+getEV("room_id_"+indek)+"'"
    +",'"+getEI("option_"+indek)+"'"
    +",'"+getEV("contact_name_"+indek)+"'"
    +")"
  });
}

Rooms.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM message_room"
      +" WHERE room_id='"+bingkai[indek].room_id+"'"
      +" AND option="+bingkai[indek].option
  },(paket)=>{
    if (paket.count>0){
      Rooms.copyData(indek,paket);
      var d=objectOne(paket.fields,paket.data);
      setEV('room_id_'+indek, d.room_id );
      setEI('option_'+indek, d.option);
      setEV('contact_name_'+indek, d.contact_name);
//      setEV('contact_name_'+indek, d.contact_name);
      
      message.none(indek);
    }
    return callback();
  });
}

Rooms.copyData=(indek,paket)=>{
  bingkai[indek].copy_data={
    fields: paket.fields,
    rows: paket.data
  }
}

Rooms.formUpdate=(indek,list_id)=>{
  bingkai[indek].list_id=list_id
  Rooms.form.modeUpdate(indek);
}

Rooms.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE lists "
      +" SET name='"+getEV("name_"+indek) +"'"
      +" WHERE list_id='"+bingkai[indek].list_id+"'"
  },(p)=>{
    if(p.err.id==0) {
      Rooms.deadPath( indek );
      bingkai[indek].list_id=getEV('list_id_'+indek);
    }
  });
}

Rooms.formDelete=(indek,room_id,option)=>{
  bingkai[indek].room_id=room_id;
  bingkai[indek].option=option;
  Rooms.form.modeDelete(indek);
}

Rooms.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM message_room"
      +" WHERE room_id='"+bingkai[indek].room_id+"'"
      +" AND option="+bingkai[indek].option
  },(p)=>{
    if(p.err.id==0) Rooms.deadPath( indek );
  });
}

Rooms.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM lists "
      +" WHERE list_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Rooms.search=(indek)=>{
  Rooms.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT list_id,name,"
        +" user_name,date_modified "
        +" FROM lists"
        +" WHERE list_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Rooms.readShow(indek);
    });
  });
}

Rooms.exportExecute=(indek)=>{
/*  
  db.run(indek,{
    query:"SELECT list_id,name"
      +" FROM lists "
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'lists.json');
    }else{
      content.infoPaket(indek,paket);
    }
  });
*/  
  var table_name=Rooms.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Rooms.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO lists "
        +"(list_id,name "
        +") VALUES "
        +"('"+d[i][0]+"' "
        +",'"+d[i][1]+"' "
        +") "
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Rooms.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT list_id,name,"
      +" user_name,date_modified"
      +" FROM lists"
      +" ORDER BY list_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Rooms.selectShow(indek);
  });
}

Rooms.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border="1">'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
        +'</td>'
      +'<th colspan="2">List ID</th>'
      +'<th>Description</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].list_id+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Rooms.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM lists"
          +" WHERE list_id = '"+d[i].list_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Rooms.duplicate=(indek)=>{
  var id='copy_of '+getEV('list_id_'+indek);
  setEV('list_id_'+indek,id);
  focus('list_id_'+indek);
  disabled('list_id_'+indek);
}


Rooms.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM lists"
      +" WHERE list_id='"+getEV('list_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Rooms.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Rooms.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Rooms.properties(indek);})
  }
}

Rooms.copy=(indek)=>{
  var id=new Date().getTime();
  var copy_data=JSON.stringify(bingkai[indek].copy_data);

  db.execute(indek,{
    query:"INSERT INTO clipboard"
      +"(clipboard_id,modul,name,content)"
      +" VALUES "
      +"('"+id+"'"
      +",'"+Rooms.table_name +"'"
      +",'"+getEV('list_id_'+indek) +"'"
      +",'"+copy_data +"'"
      +")"
  });
}




// eof: 343;400;366;380;392;
