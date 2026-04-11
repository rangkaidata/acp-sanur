/*
 * auth: budiono;
 * date: jan-09, 11:18, fri-2026;
 */ 

'use strict';

var Collections={};
  
Collections.table_name='collections';
Collections.form=new ActionForm2(Collections);
Collections.hideNew=true;
Collections.hideSelect=true;

Collections.show=(tiket)=>{
  tiket.modul=Collections.table_name;
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Collections.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Collections.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Collections.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT key,val"
        +" FROM collections"
        +" ORDER BY date_created"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Collections.readShow(indek);
    });
  })
}

Collections.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM collections"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Collections.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th>Key</th>'
      +'<th>Value</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="left">'+d[x].key+'</td>'
      +'<td align="left">'+d[x].val+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Collections.form.addPagingFn(indek);// #here
}

Collections.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM collections "
      +" WHERE key LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR val LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Collections.search=(indek)=>{
  Collections.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT key,val,"
        +" user_name,date_modified "
        +" FROM collections"
        +" WHERE key LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR val LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Collections.readShow(indek);
    });
  });
}

Collections.exportExecute=(indek)=>{
  var table_name=Collections.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Collections.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO collections "
        +"(key,val "
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


/*
Lists.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>List ID:</label>'
      +'<input type="text" '
      +' id="list_id_'+indek+'"'
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
    document.getElementById('list_id_'+indek).focus();
  }else{
    document.getElementById('list_id_'+indek).disabled=true;
    document.getElementById('name_'+indek).focus();
  }
}

Lists.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO lists "
    +"(list_id,name"
    +") VALUES "
    +"('"+getEV("list_id_"+indek)+"'"
    +",'"+getEV("name_"+indek)+"'"
    +")"
  });
}

Lists.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM lists"
      +" WHERE list_id='"+bingkai[indek].list_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('list_id_'+indek, d.list_id );
      setEV('name_'+indek, d.name);
      message.none(indek);
    }
    return callback();
  });
}

Lists.formUpdate=(indek,list_id)=>{
  bingkai[indek].list_id=list_id
  Lists.form.modeUpdate(indek);
}

Lists.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE lists "
      +" SET name='"+getEV("name_"+indek) +"'"
      +" WHERE list_id='"+bingkai[indek].list_id+"'"
  },(p)=>{
    if(p.err.id==0) {
      Lists.deadPath( indek );
      bingkai[indek].list_id=getEV('list_id_'+indek);
    }
  });
}

Lists.formDelete=(indek,list_id)=>{
  bingkai[indek].list_id=list_id
  Lists.form.modeDelete(indek);
}

Lists.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM lists"
      +" WHERE list_id='"+bingkai[indek].list_id+"'"
  },(p)=>{
    if(p.err.id==0) Lists.deadPath( indek );
  });
}





Lists.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT list_id,name,"
      +" user_name,date_modified"
      +" FROM lists"
      +" ORDER BY list_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Lists.selectShow(indek);
  });
}

Lists.selectShow=(indek)=>{
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

Lists.deleteAllExecute=(indek)=>{
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

Lists.duplicate=(indek)=>{
  var id='copy_of '+getEV('list_id_'+indek);
  setEV('list_id_'+indek,id);
  focus('list_id_'+indek);
  disabled('list_id_'+indek);
}


Lists.properties=(indek)=>{
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

Lists.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Lists.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Lists.properties(indek);})
  }
}
*/



// eof: 343;400;366;380;392;
