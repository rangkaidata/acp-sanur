/*
 * auth: budiono;
 * code: L5;
 * path: /apps/contacts.js;
 * -----------------------;
 * date: Dec-03, 22:21, tue-2024; #28; files;
 * -----------------------------; happy new year 2025;
 * edit: jan-13, 11:00, mon-2025; #34; apps;
 * edit: jan-20, 21:25, mon-2025; #35; mov group;
 * edit: jan-21, 11:40, tue-2025; #35; join contact+group+message;
 * edit: feb-26, 23:31, wed-2025; #41; file_id;
 * edit: mar-15, 22:53, sat-2025; #43; deep-folder;
 * edit: mar-28, 11:21, fri-2025; #45; ctables;cstructure;
 * -----------------------------; happt new year 2026;
 * edit: jan-29, 09:48, thu-2026; #90; send_method;
 */ 

'use strict';

var Contacts={}
  
Contacts.table_name='contacts';
Contacts.form=new ActionForm2(Contacts);

Contacts.show=(tiket)=>{
  tiket.modul=Contacts.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Contacts.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Contacts.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Contacts.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT user_name,full_name,"
        +" admin_name,date_modified"
        +" FROM contacts"
        +" ORDER BY user_name"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Contacts.readShow(indek);
    });
  })
}

Contacts.count=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT COUNT(*)"
    +" FROM contacts"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Contacts.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">User Name</th>'
      +'<th>Full Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].user_name+'</td>'
      +'<td align="left">'+d[x].full_name+'</td>'
      +'<td align="left">'+d[x].admin_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="Contacts.formUpdate(\''+indek+'\''
        +',\''+d[x].user_name+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Contacts.formDelete(\''+indek+'\''
        +',\''+d[x].user_name+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Contacts.form.addPagingFn(indek);// #here
}

Contacts.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>User Name</label>'
      +'<input type="text" '
      +' id="user_name_'+indek+'"'
      +' size="30"></li>'
      
    +'<li><label>Full Name:</label>'
      +'<input type="text"'
      +' id="full_name_'+indek+'"'
      +' size="30"></li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('user_name_'+indek).focus();
  }else{
    document.getElementById('user_name_'+indek).disabled=true;
    document.getElementById('full_name_'+indek).focus();
  }
}

Contacts.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO contacts "
    +"(user_name,full_name,send_method"
    +") VALUES"
    +"('"+getEV('user_name_'+indek)+"'"
    +",'"+getEV('full_name_'+indek)+"'"
    +',0'
    +")"
  });
}

Contacts.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
    +" FROM contacts"
    +" WHERE user_name='"+bingkai[indek].user_name+"'"
  },(paket)=>{
    if (paket.err.id==0){
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('user_name_'+indek, d.user_name );
      setEV('full_name_'+indek, d.full_name);

      message.none(indek);
    }
    return callback();
  });
}

Contacts.formUpdate=(indek,id)=>{
  bingkai[indek].user_name=id;
  Contacts.form.modeUpdate(indek);
}

Contacts.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE contacts "
      +" SET full_name='"+getEV("full_name_"+indek) +"'"
      +" WHERE user_name='"+bingkai[indek].user_name+"'"
  },(p)=>{
    if(p.err.id==0) {
      Contacts.deadPath( indek );
    }
  })
}

Contacts.formDelete=(indek,id)=>{
  bingkai[indek].user_name=id;
  Contacts.form.modeDelete(indek);
}

Contacts.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM contacts"
      +" WHERE user_name='"+bingkai[indek].user_name+"'"
  },(p)=>{
    if(p.err.id==0) Contacts.deadPath( indek );
  })
}

Contacts.duplicate=(indek)=>{
  var id='copy_of '+getEV('user_name_'+indek);
  setEV('user_name_'+indek,id);
  focus('user_name_'+indek);
  disabled('user_name_'+indek,false);
}

Contacts.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Contacts.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Contacts.properties(indek);})
  }
}

Contacts.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM contacts"
      +" WHERE user_name='"+bingkai[indek].user_name+"'"
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

Contacts.countSearch=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT COUNT(*) "
      +" FROM contacts "
      +" WHERE user_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR full_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Contacts.search=(indek)=>{
  Contacts.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT user_name,full_name,"
        +" admin_name,date_modified "
        +" FROM contacts"
        +" WHERE user_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR full_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Contacts.readShow(indek);
    });
  });
}

Contacts.exportExecute=(indek)=>{
  var table_name=Contacts.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Contacts.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO contacts "
        +"(user_name,full_name"
        +") VALUES "
        +"('"+d[i][0]+"'" //contact name
        +",'"+d[i][1]+"'" //full name
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Contacts.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT user_name,full_name"
      +",admin_name,date_modified"
      +" FROM contacts"
      +" ORDER BY user_name"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Contacts.selectShow(indek);
  });
}

Contacts.selectShow=(indek)=>{
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
      +'<th colspan="2">User Name</th>'
      +'<th>Full Name</th>'
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
        +' name="checked_'+indek+'"'
        +' value="'+d[x].contact_name+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].user_name+'</td>'
      +'<td align="left">'+d[x].full_name+'</td>'
      +'<td align="center">'+d[x].admin_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Contacts.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM contacts"
          +" WHERE user_name = '"+d[i].user_name+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}




// eof: 404;407;384;385;391;
