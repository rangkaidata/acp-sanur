/*
 * name: budiono;
 * file: Mini Query;
 * date: mar-04, 11:26, mon-2024; new...
 * edit: jul-24, 06:14, wed-2024; r9 ;
 * edit: sep-03, 11:46, tue-2024; r14;
 * edit: sep-30, 14:41, mon-2024; r19;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 17:10, thu-2025; #32; 
 * edit: mar-04, 11:20, tue-2025; #41; file_id;
 * edit: mar-16, 14:31, sun-2025; #43; deep-folder;
 * edit: mar-23, 13:58, sun-2025; #45; ctables;cstructure;
 * edit: apr-21, 10:46, mon-2025; #50; export_only;
 */
 
'use strict';

var SmallQuery={}

SmallQuery.table_name="small_query";
//Query.title="Small Query";//"Mini-Query", "Basic-Query";
SmallQuery.form=new ActionForm2(SmallQuery);
// Query.hideNew=true;

SmallQuery.show=(tiket)=>{
  tiket.modul=SmallQuery.table_name;
//  tiket.menu.name=Query.title;
  tiket.bisa.tambah=1;
  tiket.paket_download=[];

  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    getPath(indek,SmallQuery.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        SmallQuery.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }  
}

SmallQuery.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM small_query "
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

SmallQuery.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  SmallQuery.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT name,sql, "
      +" user_name,date_modified "
      +" FROM small_query "
      +" ORDER BY date_created DESC"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      SmallQuery.readShow(indek);
    });
  })
}

SmallQuery.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Name</th>'
      +'<th>SQL</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].name+'</td>'
      +'<td align="left">'+xHTML(d[x].sql)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="SmallQuery.formUpdate(\''+indek+'\''
        +',\''+d[x].name+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="SmallQuery.formDelete(\''+indek+'\''
        +',\''+d[x].name+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  SmallQuery.form.addPagingFn(indek);// #here
}

SmallQuery.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html='<div style="margin:1rem;">'

    +content.title(indek)
    +content.message(indek)

    +'<p>'
      +'<label>Query Name:</label>'
      +'<input type="text" size="30"'
      +' id="query_name_'+indek+'">'
    +'</p>'
    
    +'<input type = "button" '
      +' id="query_view_'+indek+'" '
      +' value="Query" disabled'
      +' onclick="SmallQuery.tampilSQL(\''+indek+'\')"'
      +' style="height:2em;width:8em;'
      +' border-radius:0px 20px 0px 0px;margin:0;">'

    +'<input type="button" '
      +' id="grid_view_'+indek+'" '
      +' value="JSON"'
      +' onclick="SmallQuery.tampilSQL(\''+indek+'\')"'
      +' style="margin:0;height:2em;width:8em;'
      +' border-radius:0px 20px 0px 0px;">'
      
    +'<div id="query_'+indek+'">'
      +'<form autocomplete="off">'   

      +'<textarea id="sql_'+indek+'" '
      +' style="width:100%;height:80px; '
      +' padding-top:10px;'
      +' font-size:14px;font-family:courier new;"'
      +' spellcheck=false >'
      +'</textarea><br>'

      +'<input type="button" '
      +' value="Run Query >>" '
      +' onclick="SmallQuery.executeQuery(\''+indek+'\')"'
      +' style="width:100px;height:30px;font-size:14px;">'
      
      +'<div id="grid2_'+indek+'"></div>'
      
      +'</form>'
    +'</div>'
    
    +'<div style="overflow-x: auto;width:100%;">'
    +'<div id="grid_'+indek+'" style="display:none;"></div>'
    +'</div>'
    +'</div>'
    +'</div>'
    +'<span id="test_html"></span>'
    ;

  content.html(indek,html);
  document.getElementById('query_name_'+indek).focus();
}

SmallQuery.executeQuery=(indek)=>{
  setiH('grid_'+indek,"");
  
  var sql={
    query: getEV('sql_'+indek)
  }
  db.execute(indek,sql,(paket)=>{
    bingkai[indek].paket=paket;
    bingkai[indek].paket_download=paket;
    if(paket.err.id!=0) content.infoPaket(indek,paket);
    message.infoPaket(indek,paket);
    statusbar.message(indek,paket);
    paket=xHTML(paket);

    var hasil='<p style="color:blue;"><big>JSON Response:</big></p>'
    +'<pre>'+JSON.stringify(paket,undefined,2)+'</pre>';
    //setiH('result_'+indek,hasil );
    setiH('grid_'+indek,hasil );
    
    SmallQuery.loadGrid(indek);
  });
}

SmallQuery.tampilSQL=(indek)=>{
  if(document.getElementById('query_view_'+indek).disabled){
    //alert('a');
    document.getElementById('query_'+indek).style.display='none';
    document.getElementById('grid_'+indek).style.display='inline';
    document.getElementById('query_view_'+indek).disabled=false;
    document.getElementById('grid_view_'+indek).disabled=true;
    
  }else{
    //alert('b');
    document.getElementById('query_'+indek).style.display='inline';
    document.getElementById('grid_'+indek).style.display='none';
    document.getElementById('query_view_'+indek).disabled=true;
    document.getElementById('grid_view_'+indek).disabled=false;
  }
}

SmallQuery.loadGrid=(indek)=>{
  var paket=bingkai[indek].paket;
  var d=paket.data;
  var f=paket.fields;
  var html='';
  
  if(paket.metode!="read"){
    html='<div style="padding:0.5rem;width:100%;overflow:auto;">'
      +'<b>Blockchain:</b>'
      +'<ul>'
        +'<li>Message: '+paket.err.msg+'</li>'
        +'<li>Index: '+d.index+'</li>'
        +'<li>Hash: '+d.blok+'</li>'
      +'</ul>'
    +'</div>';
  }else{ 
    html='<div style="padding:0.5rem;width:100%;overflow:auto;">'
    +'<p>Total rows loaded: '+d.length+'</p>'
    +'<table border=1>'  
      +'<tr>';
      for(let i=0;i<f.length;i++){
        html+='<th>'+f[i]+'</th>';
      }
      html+='</tr>';
      
      for(let i=0;i<d.length;i++){
        html+='<tr>'   
        for(let j=0;j<d[i].length;j++){
          html+='<td>'+d[i][j]+'</td>';
        }
        html+='</tr>'
      } 
    html+='</table>'
    +'</div>';
  }

  setiH('grid2_'+indek,html );
}

SmallQuery.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO small_query "
    +"(name,sql"
    +") VALUES "
    +"('"+getEV('query_name_'+indek)+"'"
    +",'"+encodeKutip(getEV('sql_'+indek))+"'"
    +")"
  });
}

SmallQuery.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
    +" FROM small_query"
    +" WHERE name='"+bingkai[indek].query_name+"'"
  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('query_name_'+indek, d.name );
      setEV('sql_'+indek, decodeKutip(d.sql));
      message.none(indek);
    }
    return callback();
  });
}

SmallQuery.formUpdate=(indek,query_name)=>{
  bingkai[indek].query_name=query_name;
  SmallQuery.form.modeUpdate(indek);
  toolbar.download(indek,()=>SmallQuery.exportExecute2(indek) );
}

SmallQuery.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE small_query "
    +" SET name='"  +getEV("query_name_"+indek)      +"', "
    +" sql='"       +encodeKutip(getEV("sql_"+indek))+"' "
    +" WHERE name='"+bingkai[indek].query_name       +"'"
  },(p)=>{
    if(p.err.id==0) {
      bingkai[indek].query_name=getEV("query_name_"+indek);
      SmallQuery.endPath( indek );
    }
  });
}

SmallQuery.formDelete=(indek,query_name)=>{
  bingkai[indek].query_name=query_name;
  SmallQuery.form.modeDelete(indek);
}

SmallQuery.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM small_query"
    +" WHERE name='"+bingkai[indek].query_name+"'"
  },(p)=>{
    if(p.err.id==0) SmallQuery.endPath( indek );
  });
}

SmallQuery.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM small_query "
    +" WHERE name LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR sql LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

SmallQuery.search=(indek)=>{
  SmallQuery.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT name,sql, "
      +" user_name,date_modified "
      +" FROM small_query "
      +" WHERE name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR sql LIKE '%"+bingkai[indek].text_search+"%'"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      SmallQuery.readShow(indek);
    });
  });
}

SmallQuery.exportExecute=(indek)=>{
/*  
  db.execute(indek,{
    query:"SELECT name,sql"
    +" FROM small_query "
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'query.json');
    }else{
      content.infoPaket(indek,paket);
    }
  });
*/  
  var table_name=SmallQuery.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

SmallQuery.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO small_query"
      +" (name,sql )"
      +" VALUES('"+d[i][0]+"', "
      +" '"+d[i][1]+"') "
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

SmallQuery.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT name,sql, "
    +" user_name,date_modified "
    +" FROM small_query "
    +" ORDER BY date_created DESC "
    +" LIMIT "+bingkai[indek].paging.limit
    +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    SmallQuery.selectShow(indek);
  });
}

SmallQuery.selectShow=(indek)=>{
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
      +'<th colspan="2">name</th>'
      +'<th>SQL</th>'
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
        +' value="'+d[x].name+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].name+'</td>'
      +'<td align="left">'+xHTML(d[x].sql)+'</td>'
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

SmallQuery.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM small_query "
          +" WHERE name='"+d[i].name+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

SmallQuery.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM small_query"
      +" WHERE name='"+bingkai[indek].query_name+"'"
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

SmallQuery.duplicate=(indek)=>{
  var id='copy_of '+getEV('query_name_'+indek);
  setEV('query_name_'+indek,id);
  focus('query_name_'+indek);
}

SmallQuery.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{SmallQuery.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{SmallQuery.properties(indek);})
  }
}

SmallQuery.exportExecute2=(indek)=>{
  const my_data2=bingkai[indek].paket_download;
  const file_name=getEV('query_name_'+indek);
  DownloadAllPage.fileReady(indek, JSON.stringify(my_data2), file_name );
}

SmallQuery.readOffset=(indek,val,callback)=>{
  
  setCursor(indek,val);

  db.run(indek,{
    query:"SELECT * "
      +" FROM small_query"
      +" ORDER BY date_created DESC"
      +" LIMIT 1"
      +" OFFSET "+bingkai[indek].offset
      
  },(p)=>{
    SmallQuery.setFields(p,(d)=>{
      bingkai[indek].name=d.name;
      return callback(d);
    });
  })  
}

SmallQuery.nextPrevious=(indek,val)=>{
  SmallQuery.readOffset(indek,val,(d)=>{
    SmallQuery.formUpdate(indek,d.name);// disini
  });
}

SmallQuery.setFields=(p,callback)=>{
  var m={
    name:"",
    sql: "",
    file_id:"",
  };
  
  if(p.data.length>0){
    var d=objectOne(p.fields,p.data) ;
    m.name=d.name;
    m.sql=d.sql;
    m.file_id=d.file_id;
  }
  
  return callback(m);
}

// eof: 300;446;488;
