/*
 * name: budiono
 * date: sep-04, 09:47, thu-2025; #72; path;
 */ 

'use strict';

var MyPath={}
  
MyPath.table_name='path';
MyPath.form=new ActionForm2(MyPath);
MyPath.folder=new FolderLook(MyPath);
MyPath.table=new TableLook(MyPath);

MyPath.hideSaveAs=true;

MyPath.show=(tiket)=>{
  tiket.modul=MyPath.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath(indek,MyPath.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        MyPath.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

MyPath.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM path"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

MyPath.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  MyPath.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT table_name,path,"
        +" user_name,date_modified"
        +" FROM path"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" ORDER BY table_name"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      MyPath.readShow(indek);
    });
  })
}

MyPath.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Table Name</th>'
      +'<th>Path</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].table_name+'</td>'
      +'<td align="left">'+d[x].path+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="MyPath.formUpdate(\''+indek+'\''
        +',\''+d[x].table_name+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="MyPath.formDelete(\''+indek+'\''
        +',\''+d[x].table_name+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  MyPath.form.addPagingFn(indek);// #here
}

MyPath.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
      +'<ul>'
        +'<li><label>Table Name:</label>'
          +'<input type="text" '
            +' id="table_name_'+indek+'"'
            +' size="30">'
          +'<button type="button" '
            +' onclick="MyPath.table.getPaging(\''+indek+'\''
            +',\'table_name_'+indek+'\')"'
            +' class="btn_find">'
          +'</button>'
        +'</li>'
        +'<li><label>Path:</label>'
          +'<input type="text"'
            +' id="path_'+indek+'"'
            +' size="30">'
          +'<button type="button" '
            +' onclick="MyPath.folder.getPaging(\''+indek+'\''
            +',\'path_'+indek+'\')"'
            +' class="btn_find">'
          +'</button>'
        +'</li>'
      +'</ul>'
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('table_name_'+indek).focus();
  }else{
    document.getElementById('table_name_'+indek).disabled=true;
    document.getElementById('path_'+indek).focus();
  }
}

MyPath.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO path "
    +"(table_name,path)"
    +" VALUES "
    +"('"+getEV("table_name_"+indek)+"'"
    +",'"+getEV("path_"+indek)+"'"
    +")"
  });
}

MyPath.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM path"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND table_name='"+bingkai[indek].table_name+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('table_name_'+indek, d.table_name );
      setEV('path_'+indek, d.path);
      message.none(indek);
    }
    return callback();
  });
}

MyPath.formUpdate=(indek,table_name)=>{
  bingkai[indek].table_name=table_name;
  MyPath.form.modeUpdate(indek);
}

MyPath.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE path "
      +" SET path='"+getEV("path_"+indek) +"'"
      +" WHERE table_name='"+bingkai[indek].table_name+"'"
  },(p)=>{
    if(p.err.id==0) MyPath.finalPath(indek);
  });
}

MyPath.formDelete=(indek,table_name)=>{
  bingkai[indek].table_name=table_name;
  MyPath.form.modeDelete(indek);
}

MyPath.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM path"
      +" WHERE table_name='"+bingkai[indek].table_name+"'"
  },(p)=>{
    if(p.err.id==0) MyPath.finalPath(indek);
  });
}

MyPath.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM path "
      +" WHERE table_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR path LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

MyPath.search=(indek)=>{
  MyPath.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT table_name,path,"
        +" user_name,date_modified "
        +" FROM path"
        +" WHERE table_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR path LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      MyPath.readShow(indek);
    });
  });
}

MyPath.exportExecute=(indek)=>{
  var table_name=MyPath.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

MyPath.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT table_name,path,"
      +" user_name,date_modified"
      +" FROM path"
      +" ORDER BY table_name"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    MyPath.selectShow(indek);
  });
}

MyPath.selectShow=(indek)=>{
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
      +'<th colspan="2">Table Name</th>'
      +'<th>Path</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'">'
//        +' value="'+d[x].location_id+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].table_name+'</td>'
      +'<td align="left">'+d[x].path+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

MyPath.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM path"
          +" WHERE table_name='"+d[i].table_name+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

MyPath.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO path "
        +" (table_name,path) "
        +" VALUES "
        +"('"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

MyPath.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM path "
      +" WHERE table_name='"+bingkai[indek].table_name+"'"
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

MyPath.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{MyPath.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{MyPath.properties(indek);})
  }
}

MyPath.setFolder=(indek,d)=>{
  setEV('path_'+indek,d.path);
}

MyPath.setTable=(indek,d)=>{
  setEV('table_name_'+indek,d.table_id);
}



//eof: 366;
