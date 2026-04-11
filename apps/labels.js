/*
 * auth: budiono;
 * code: L1;
 * path: /apps/labels.js;
 * ---------------------;
 * date: Dec-03, 22:24, tue-2024; #28; files;
 * edit: dec-14, 20:51, sat-2024; #31; properties;
 * edit: dec-16, 21:58, mon-2024; #31;
 * -----------------------------;
 * edit: jan-09, 16:42, thu-2025; #34;
 * edit: feb-26, 20:51, wed-2025; #41; file_id;
 * edit: mar-15, 22:01, sat-2025; #43; deep-folder;
 * edit: mar-28, 09:05, fri-2025; #45; ctables;cstructure;
 */ 

'use strict';

var Labels={}
Labels.table_name='labels';
Labels.form=new ActionForm2(Labels);

Labels.show=(tiket)=>{
  tiket.modul=Labels.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Labels.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Labels.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Labels.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT label_id,name,"
        +" user_name,date_modified"
        +" FROM labels"
        +" ORDER BY label_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Labels.readShow(indek);
    });
  })
}

Labels.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM labels"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Labels.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Label ID</th>'
      +'<th>Description</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].label_id+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="Labels.formUpdate(\''+indek+'\''
        +',\''+d[x].label_id+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Labels.formDelete(\''+indek+'\''
        +',\''+d[x].label_id+'\');">'
        +'</button></td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Labels.form.addPagingFn(indek);
}

Labels.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    +'<li><label>Label ID:</label>'
      +'<input type="text" '
      +' id="label_id_'+indek+'"'
      +' size="9">'
    +'</li>'
    
    +'<li><label>Description:</label>'
      +'<input type="text" '
      +' id="name_'+indek+'"'
      +' size="30">'
    +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('label_id_'+indek).focus();
  }else{
    document.getElementById('label_id_'+indek).disabled=true;
    document.getElementById('name_'+indek).focus();
  }
}

Labels.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO labels"
    +"(label_id,name)"
    +" VALUES "
    +"('"+getEV("label_id_"+indek)+"'"
    +",'"+getEV("name_"+indek)+"'"
    +")"
  });
}

Labels.readOne=(indek,callback)=>{
  var label_id=bingkai[indek].label_id;
  db.execute(indek,{
    query:"SELECT *"
      +" FROM labels"
      +" WHERE label_id='"+label_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('label_id_'+indek, d.label_id );
      setEV('name_'+indek, d.name);
      message.none(indek);
    }
    return callback();
  });
}

Labels.formUpdate=(indek,id)=>{
  bingkai[indek].label_id=id;
  Labels.form.modeUpdate(indek);
}

Labels.updateExecute=(indek)=>{
  var label_id=bingkai[indek].label_id;
  db.execute(indek,{
    query:"UPDATE labels"
      +" SET name='"+getEV("name_"+indek) +"'"
      +" WHERE label_id='"+label_id+"'"
  },(p)=>{
    if(p.err.id==0) {
      Labels.deadPath(indek);
      bingkai[indek].label_id=getEV("label_id_"+indek);
    }
  });
}

Labels.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Labels.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Labels.properties(indek);})
  }
}

Labels.formDelete=(indek,id)=>{
  bingkai[indek].label_id=id;
  Labels.form.modeDelete(indek);
}

Labels.deleteExecute=(indek)=>{
  var label_id=bingkai[indek].label_id;
  db.execute(indek,{
    query:"DELETE FROM labels"
      +" WHERE label_id='"+label_id+"'"
  },(p)=>{
    if(p.err.id==0) Labels.deadPath(indek);
  });
}

Labels.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT label_id,date_created"
      +" FROM labels"
      +" WHERE label_id='"+bingkai[indek].label_id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=String(":/").concat(
        Labels.table_name,"/",
        d.label_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Labels.duplicate=(indek)=>{
  var id='copy_of '+getEV('label_id_'+indek);
  setEV('label_id_'+indek,id);
  focus('label_id_'+indek);
  disabled('label_id_'+indek);
}

Labels.search=(indek)=>{
  var text_search=bingkai[indek].text_search;
  var limit=bingkai[indek].paging.limit;
  var offset=bingkai[indek].paging.offset;
  Labels.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT label_id,name,"
        +" user_name,date_modified "
        +" FROM labels"
        +" WHERE label_id LIKE '%"+text_search+"%'"
        +" OR name LIKE '%"+text_search+"%'"
        +" LIMIT "+limit
        +" OFFSET "+offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Labels.readShow(indek);
    });
  });
}

Labels.countSearch=(indek,callback)=>{
  var text_search=bingkai[indek].text_search;
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM labels"
      +" WHERE label_id LIKE '%"+text_search+"%'"
      +" OR name LIKE '%"+text_search+"%'"
  },(p)=>{
    bingkai[indek].count=0;
    if(p.err.id==0 && p.count>0){
      bingkai[indek].count=p.data[0][0];
    }
    return callback()
  });
}

Labels.exportExecute=(indek)=>{
  var table_name=Labels.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Labels.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){    
    db.run(indek,{
      query:"INSERT INTO labels"
        +" (label_id,name) "
        +" VALUES "
        +"('"+d[i][0]+"'"
        +",'"+d[i][1]+"'"
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Labels.readSelect=(indek)=>{
  var limit=bingkai[indek].paging.limit;
  var offset=bingkai[indek].paging.offset;
  db.execute(indek,{
    query:"SELECT label_id,name,"
      +" user_name,date_modified"
      +" FROM labels"
      +" ORDER BY label_id"
      +" LIMIT "+limit
      +" OFFSET "+offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Labels.selectShow(indek);
  });
}

Labels.selectShow=(indek)=>{
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
      +'<th colspan="2">Label ID</th>'
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
      +'<td align="left">'+d[x].label_id+'</td>'
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

Labels.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM labels"
          +" WHERE label_id = '"+d[i].label_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}





// eof: 371;405;388;392;396;391;
