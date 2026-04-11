/*
 * auth: budiono;
 * code: L5;
 * path: /apps/groups.js;
 * ---------------------;
 * date: jan-13, 16:31, mon-2025; #34; apps;
 * edit: jan-14, 09:40, tue-2025; #34; apps+members;
 * edit: jan-20, 21:27, mon-2025; #35; mov group to b;
 * edit: jan-21, 15:38, tue-2025; #35; 
 * edit: feb-27, 10:55, thu-2025; #41; file_id;
 * edit: mar-16, 11:13, sun-2025; #43; deep-folder;
 * edit: mar-28, 11:26, fri-2025; #45; ctables;cstructure;
 * -----------------------------; happy new year 2026;
 * edit: jan-29, 09:47, thu-2026; #90; send_method;
 */ 

'use strict';

var Groups={};
  
Groups.table_name='groups';
Groups.form=new ActionForm2(Groups);
Groups.contact=new ContactLook(Groups);

Groups.show=(tiket)=>{
  tiket.modul=Groups.table_name;
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      //Groups.getRoom(indek,()=>{
        Groups.form.modePaging(indek);
      //});
    });
  }else{
    show(baru);
  }
}

Groups.getRoom=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT room_id,contact_name,description,members"
      +" FROM room"
      +" WHERE option=1"// group
  },(p)=>{
    if(p.count>0){
      var d=objectMany(p.fields,p.data);
      var i;
      
      for(i=0;i<d.length;i++){
        Groups.getGroup(indek,d[i].contact_name,(data)=>{
          if(data.length>0){
            alert('FE:ADA:'+data[0].contact_name);
            db.execute(indek,{
              query:"INSERT INTO groups"
                +"(group_id,name,members)"
                +" VALUES ("
                +"'"+data[0].contact_name+"',"
                +"'"+data[0].description+"',"
                +"'"+data[0].members+"'"
                +")"
            });
          }else{
            
          }
        });
      }
    }
    return callback();
  })
}

Groups.getGroup=(indek,contact_name,callback)=>{
  db.run(indek,{
    query:"SELECT contact_name,description,members"
      +" FROM room"
      +" WHERE contact_name='"+contact_name+"'"
  },(p)=>{
    if(p.count>0){
      var d=objectMany(p.fields,p.data);
      alert('ada: '+contact_name);
      return callback(d)//already exits
    }else{
      alert('tdk ada');
      return callback([])//not exists
    }
  });
}

Groups.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Groups.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT group_id,name,members,"
        +" user_name,date_modified"
        +" FROM groups"
        +" ORDER BY group_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Groups.readShow(indek);
    });
  })
}

Groups.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM groups "
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Groups.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Group ID</th>'
      +'<th>Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].group_id+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="Groups.formUpdate(\''+indek+'\''
        +',\''+d[x].group_id+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Groups.formDelete(\''+indek+'\''
        +',\''+d[x].group_id+'\');">'
        +'</button></td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Groups.form.addPagingFn(indek);// #here
}

Groups.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
      +'<ul>'      
        +'<li>'
          +'<label>Group ID</label>'
          +'<input type="text" '
          +' id="group_id_'+indek+'"'
          +' size="30">'
        +'</li>'      
        +'<li>'
          +'<label>Group Name</label>'
          +'<input type="text" '
          +' id="name_'+indek+'"'
          +' size="30">'
        +'</li>'      
        +'<li>'
          +'<label>Send Method</label>'
          +'<select id="send_method_'+indek+'">';
            for(var i=0;i<array_message_send_method.length;i++){
              html+='<option>'+array_message_send_method[i]+'</option>';
            }
          html+='</select>'
        +'</li>'
      +'</ul>'    
      +'<details open>'
        +'<summary>Members</summary>'
        +'<div id="members_'+indek+'">'
      +'</details>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);

  if (metode===MODE_CREATE){
    document.getElementById('group_id_'+indek).focus();
  }else{
    document.getElementById('group_id_'+indek).disabled=true;
    document.getElementById('name_'+indek).focus();
  }

  bingkai[indek].members=[];
  Groups.setRows(indek,[]);
}

Groups.createExecute=(indek)=>{
  var members=JSON.stringify(bingkai[indek].members);
//  alert(getEI("send_method_"+indek));
  
  db.execute(indek,{
    query:"INSERT INTO groups "
    +"(group_id,name,members,send_method)"
    +" VALUES "
    +"('"+getEV("group_id_"+indek)+"'"
    +",'"+getEV("name_"+indek)+"'"
    +",'"+members+"'"
    +",'"+getEI("send_method_"+indek)+"'"
    +")"
  });
}

Groups.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM groups"
      +" WHERE group_id='"+bingkai[indek].group_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('group_id_'+indek, d.group_id );
      setEV('name_'+indek, d.name);
      
      Groups.setRows(indek,JSON.parse(d.members) );

      message.none(indek);
    }
    return callback();
  });
}

Groups.formUpdate=(indek,id)=>{
  bingkai[indek].group_id=id
  Groups.form.modeUpdate(indek);
}

Groups.updateExecute=(indek)=>{
  var members=JSON.stringify(bingkai[indek].members);

  db.execute(indek,{
    query:"UPDATE groups "
      +" SET name='"+getEV("name_"+indek) +"'"
      +",members='"+members+"'"
      +" WHERE group_id='"+bingkai[indek].group_id+"'"
  },(p)=>{
    if(p.err.id==0) Groups.deadPath(indek);
  });
}

Groups.formDelete=(indek,id)=>{
  bingkai[indek].group_id=id;
  Groups.form.modeDelete(indek);
}

Groups.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM groups"
      +" WHERE group_id='"+bingkai[indek].group_id+"'"
  },(p)=>{
    if(p.err.id==0) Groups.deadPath(indek);
  });
}

Groups.duplicate=(indek)=>{
  var id='copy_of '+getEV('group_id_'+indek);
  setEV('group_id_'+indek,id);
  focus('group_id_'+indek);
  disabled('group_id_'+indek,false);
}

Groups.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM groups"
      +" WHERE group_id='"+getEV('group_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Groups.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Groups.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Groups.properties(indek);})
  }
}

Groups.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM groups "
      +" WHERE group_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR members LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Groups.search=(indek)=>{
  Groups.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT group_id,name,members"
        +",user_name,date_modified "
        +" FROM groups"
        +" WHERE group_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR members LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Groups.readShow(indek);
    });
  });
}

Groups.exportExecute=(indek)=>{
  var table_name=Groups.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Groups.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO groups "
        +"(group_id,name,members"
        +") VALUES "
        +"('"+d[i][0]+"'" // group_id
        +",'"+d[i][1]+"'" // name
        +",'"+d[i][2]+"'" // members
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Groups.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT group_id,name,members,"
      +" user_name,date_modified"
      +" FROM groups"
      +" ORDER BY group_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Groups.selectShow(indek);
  });
}

Groups.selectShow=(indek)=>{
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
      +'<th colspan="2">Group ID</th>'
      +'<th>Group Name</th>'
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
      +'<td align="left">'+d[x].group_id+'</td>'
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

Groups.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM groups"
          +" WHERE group_id = '"+d[i].group_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Groups.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
    
  var panjang=isi.length;
  var html=Groups.tableHead(indek);
  var sum_rate=0;
  var is_admin="";

  bingkai[indek].members=isi;
    
  for (var i=0;i<panjang;i++){
    isi[i].is_admin==1?is_admin='checked':is_admin='';
    
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="margin:0;padding:0">'
      +'<input type="text" '
      +' id="user_name_'+i+'_'+indek+'" '
      +' value="'+isi[i].user_name+'"'
      +' onchange="Groups.setCell(\''+indek+'\''
      +',\'user_name_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()">'
    +'</td>'

    +'<td>'
      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="Groups.contact.getPaging(\''+indek+'\''
        +',\'user_name_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
    +'</td>'

    +'<td align="left" style="padding:0;margin:0;">'
      +'<input type="text" '
        +' id="full_name_'+i+'_'+indek+'" '
        +' value="'+isi[i].full_name+'"'
        +' style="text-align:center"'
        +'  size="30" disabled>'
    +'</td>'

    +'<td style="margin:0;padding:0;" align="center">'
      +'<input type="checkbox" '+is_admin
      +' id="is_admin_'+i+'_'+indek+'" '
      +' onchange="Groups.setCell(\''+indek+'\''
      +',\'is_admin_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"></td>'

    +'<td align="center">'
      +'<button type="button" '
        +' id="btn_add" '
        +' onclick="Groups.addRow(\''+indek+'\','+i+')">'
      +'</button>'
      
      +'<button type="button" '
        +' id="btn_remove" '
        +' onclick="Groups.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }
  html+=Groups.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('members_'+indek).innerHTML=html;
  if(panjang==0) Groups.addRow(indek,[]);
}

Groups.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="3">Contact Name</th>'
    +'<th>Full Name</th>'
    +'<th>Admin</th>'
    +'<th>Add/Remove</th>'
    +'</tr>'
    +'</thead>';
}

Groups.tableFoot=(indek)=>{
  return '<tr>'
  +'<td>&nbsp;</td>'
  +'</tr>'
  +'</tfoot>'
  +'</table>';
}

Groups.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].members;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)Groups.newRow(newBasket);
  }
  if(oldBasket.length==0)Groups.newRow(newBasket);
  Groups.setRows(indek,newBasket);
}

Groups.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.user_name="";
  myItem.full_name="";
  myItem.is_admin=false;
  newBasket.push(myItem);
}

Groups.removeRow=(indek,number)=>{
  var isi=bingkai[indek].members;
  var newBasket=[];
  Groups.setRows(indek,isi);
  for(var i=0;i<isi.length;i++){
    if (i!=(number))newBasket.push(isi[i]);
  }
  Groups.setRows(indek,newBasket);
}

Groups.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].members;
  var baru=[];
  var isiEdit={};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('user_name_'+i+'_'+indek)){
      isiEdit.user_name=getEV(id_kolom);
      baru.push(isiEdit);
      Groups.getContact(indek,id_kolom,i);
    }
    else if(id_kolom==('full_name_'+i+'_'+indek)){
      isiEdit.full_name=getEV(id_kolom);
      baru.push(isiEdit);
    } 
    else if(id_kolom==('is_admin_'+i+'_'+indek)){
      isiEdit.is_admin=getEC(id_kolom);
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
  }  
  bingkai[indek].members=isi;
}

Groups.setContact=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  
  setEV(id_kolom, data.user_name);
  Groups.setCell(indek,id_kolom);  
}

Groups.getContact=(indek,id_kolom,baris)=>{
  var name_kolom="full_name_" + baris + "_" + indek;
  
  if(getEV(id_kolom)==bingkai[0].login.name){
    setEV(name_kolom, bingkai[0].login.full_name);  
  } else {
    setEV(name_kolom, 'contact '+txt_undefined);  
  }
  Groups.contact.getOne(indek,
    getEV(id_kolom),
  (p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEV(name_kolom, d.full_name);
    }
    Groups.setCell(indek, name_kolom)
  });
}





// eof: 413;521;594;579;580;583;
