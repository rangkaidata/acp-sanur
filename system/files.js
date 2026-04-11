// --/media/budiono/data2/coding/sep22/github/accounting_a09/apps/lists.js


/*
 * auth: budiono;
 * date: Dec-05, 17:08, thu-2024; 
 * edit: dec-12, 21:02, thu-2024; #30;
 * -----------------------------; happy new year 2025;
 * edit: feb-13, 16:24, thu-2025; #40; new properties;
 * edit: mar-10, 22:01, mon-2025; #43; deep folder;
 * edit: mar-23, 14:45, sun-2025; #45; ctable;cstructure;
 */ 

'use strict';

var Files={}
  
Files.table_name='properties';
Files.form=new ActionForm2(Files);
Files.hideImport=true;
Files.hideNew=true;
Files.hideSelect=true;

Files.show=(tiket)=>{
  tiket.modul=Files.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    Files.form.modePaging(indek);
  }else{
    show(baru);
  }
}

Files.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM properties"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Files.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Files.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT name,type,parent,locked,"
        +" path,query,data,user_name,"
        +" admin_name,date_modified,file_id"
        +" FROM properties"
          +" ORDER BY date_modified DESC"

        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Files.readShow(indek);
    });
  })
}

Files.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">File name</th>'
      +'<th>File type</th>'
      +'<th>File ID</th>'
      +'<th>Locked</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    var ikon='';
    var locked;
    for (var x in d) {
      if(d[x].type==1) ikon='&#x1F4C2';
      if(d[x].type==3) ikon='&#x1F4C4';
      if(d[x].locked==0) {locked='&#x2610'}else{locked='&#x2705'}
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+ikon
        +'<input type="button" style="font-weight:bold;"'
        +' value="'+strN(d[x].name,10)+'"'
        +' onclick="Files.klikProperties(\''+indek+'\',\''+x+'\')"'
        +'>'
      +'</td>'
      +'<td align="left">'+array_file_type[d[x].type]+'</td>'
      +'<td align="left">'+strN(d[x].file_id,30)+'</td>'
      +'<td align="center">'+locked+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Files.form.addPagingFn(indek);// #here
}

Files.klikProperties=(indek,n)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  
  if(d.length==0) return;
  
  Files.openProperties(indek
    ,d[n].file_id
    ,d[n].name
    ,d[n].type
    ,d[n].query
    ,d[n].data
  );
}

Files.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Path:</label>'
      +'<input type="text" value="/" disabled'
      +' id="file_id_'+indek+'"'
      +' size="30"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="locked_'+indek+'">'
      +'Locked</label>'
      +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  setEV('file_id_'+indek, bingkai[indek].file_id);
}

Files.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
    +" FROM properties"
    +" WHERE file_id='"+bingkai[indek].file_id+"'"

  },(paket)=>{
    if (paket.err.id==0){
      if(paket.count>0){
        var d=objectOne(paket.fields,paket.data);
        
        setEV('file_id_'+indek, d.file_id);
        
        bingkai[indek].db_path=d.path;
      }
      
      message.none(indek);
    }
    return callback();
  });
}

Files.formDelete=(indek,file_id)=>{
  bingkai[indek].file_id=file_id;
  Files.form.modeDelete(indek);
}

Files.deleteExecute=function(indek){
  var file_id=bingkai[indek].file_id;

  db.execute(indek,{
    query:"DELETE FROM properties"
      +" WHERE file_id='"+file_id+"'"
  });
}

Files.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM properties "
      +" WHERE name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Files.search=(indek)=>{
  Files.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT *"
        +" FROM properties"
        +" WHERE name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Files.readShow(indek);
    });
  });
}

Files.exportExecute=(indek)=>{
  var table_name=Files.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Files.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT name,parent,type,file_id,locked,query,"
      +" user_name,date_modified"
      +" FROM properties"
      +" ORDER BY date_modified DESC"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Files.selectShow(indek);
  });
}

Files.selectShow=(indek)=>{
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
      +'<th colspan="2">File name</th>'
      +'<th>File type</th>'
      +'<th>File ID</th>'
      +'<th>Locked</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    var ikon='';
    var locked;
    var x;
    for (x in d) {
      n++;
      if(d[x].type==1) ikon='&#x1F4C2';
      if(d[x].type==3) ikon='&#x1F4C4';
      if(d[x].locked==0) {locked='&#x2610'}else{locked='&#x2705'}
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'"'
        +' value="'+d[x].name+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+ikon+' '+strN(d[x].name,10)+'</td>'
      +'<td align="left">'+array_file_type[d[x].type]+'</td>'
      +'<td align="left">'+strN(d[x].file_id,30)+'</td>'
      +'<td align="center">'+locked+'</td>'
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

Files.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  var sql='';
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      sql='DELETE '+d[i].query;
      a.push({query:sql});
    }
  }
  db.deleteMany(indek,a);
}

Files.properties=(indek)=>{
  Properties.lookup(indek);
}

Files.openProperties=(indek,file_id,name,type,query,data)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Files.form.modePaging(indek) });
  
  var d=JSON.parse(data);
  var v=Object.values(d);
  var k=Object.keys(d);
  var v2;
    
  var html=''
    +'<div style="padding:0.5rem">'
    +'<p>'
      +'<strong>File ID</strong>&nbsp;'
      +'<span class="quote_text">'+file_id+'</span>'
    +'</p>'
    +'<p>'
      +'<strong>Query</strong>&nbsp;'
      +'<span class="quote_text">'+query+'</span>'
    +'</p>'

    +content.message(indek)

    +'<table style="table-layout: fixed;">'
    
      for(var i=0;i<k.length;i++){
        if(typeof v[i] ==="object") {
          v2=JSON.stringify(v[i]);
        }else{
          v2=v[i];
        }
        html+='<tr>'
          +'<td align="right"><strong>'
            +k[i]+' ('+i+')'
            +':</strong>&nbsp;</td>'
          +'<td align="left">'
          +'<span style="display:block;'
          +'word-wrap:break-word;padding:2px 0px 2px 0px;">'
          +v2 //v[i]
          +'</span>'
          +'</td>'
          +'</tr>';
      }
  html+='</table>';
  
  content.html(indek,html);
  statusbar.ready(indek);
}


// eof: 172;205;304;376;380;379;384;
