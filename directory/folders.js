// --/media/budiono/data2/coding/sep22/github/accounting_a09/apps/lists.js


/*
 * auth: budiono;
 * date: Dec-04, 11:26, wed-2024; #28;documents;
 * edit: Dec-06, 15:03, fri-2024; #30; 
 * edit: dec-12, 11:46, thu-2024; #30; documents->folders;
 * edit: dec-13, 10:16, fri-2024; #30;
 * edit: dec-14, 11:35, sat-2024; #30;
 * edit: dec-16, 21:07, mon-2024. #31; hideSaveAs;
 * edit: feb-03, 15:02, mon-2025; #37; show data input, bukan data record;
 * edit: mar-10, 20:05, mon-2025; #43; deep-folder;
 */ 

'use strict';

var Folders={}
  
Folders.table_name='folders';
Folders.title='Folders';
Folders.form=new ActionForm2(Folders);
Folders.hideSelect=true;
Folders.hideExport=true;
Folders.hideImport=true;
Folders.hideProperties=true;
Folders.hideSaveAs=true;

Folders.show=(tiket)=>{
  tiket.modul=Folders.table_name;
  tiket.menu.name=Folders.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    
    bingkai[indek].parent_folder='/'; // default ke root folder
    bingkai[indek].path='';// ini sudah benar
    bingkai[indek].path_name='Root directory';
    bingkai[indek].path_back='/';
    bingkai[indek].path_array=[];
    
    Folders.form.modePaging(indek);
  }else{
    show(baru);
  }
}

Folders.count=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT COUNT(*)"
    +" FROM folders"
    +" WHERE parent='"+bingkai[indek].path+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Folders.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Folders.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT file_id,name,type,parent,locked,"
        +" path,query,data,"
        +" user_name,date_modified"
        +" FROM folders"
        +" WHERE parent='"+bingkai[indek].path+"'"
        +" ORDER BY type,name"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Folders.readShow(indek);
    });
  })
}

Folders.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var path='';
  
  bingkai[indek].path_array.push({
    path:bingkai[indek].path,
    name: bingkai[indek].path_name,
  })

  var a=bingkai[indek].path_array;
  var oke=true;
  var new_arr=[];

  for(var o=0;o<a.length;o++){
    if(oke==true){
      new_arr.push(bingkai[indek].path_array[o]);
      if(o>0) path+='/';
      path+='<input type="button" '
        +' onclick="Folders.klikFolder(\''+indek+'\''
        +',\''+bingkai[indek].path_array[o].path+'\''
        +',\''+bingkai[indek].path_array[o].name+'\')"'
        +' value="'+bingkai[indek].path_array[o].name+'"'
        +' style="font-weight:bold;">'
    }
    if(a[o].path==bingkai[indek].path){
      oke=false;
      bingkai[indek].path_array=new_arr;
    }
  }

  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +path
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th>File Name</th>'
      +'<th>Type</th>'
      +'<th>File ID</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="2">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="left">'+ Menu.ikon2(d[x].type)
        +'<label id="name_'+x+'_'+indek+'">'
          +'<input type="button" '
          +' value="&nbsp;'+strN(d[x].name,15)+'" '
          +' onclick="Folders.klikOpen(\''+indek+'\''
          +',\''+x+'\')"></div>'
        +'</label>'
      +'</td>'
      +'<td align="left">'+array_file_type[d[x].type]+'</td>'
      +'<td align="left">'+strN(d[x].file_id,15)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>';
      if(d[x].type==1){// folder
        html+='<td align="center">'
            +'<button type="button" '
            +' id="btn_change"'
            +' onclick="Folders.formUpdate(\''+indek+'\''
            +',\''+d[x].parent+'\''
            +',\''+d[x].name+'\')">'
        +'</td>'
        +'<td align="center">'
            +'<button type="button" '
            +' id="btn_delete"'
            +' onclick="Folders.formDelete(\''+indek+'\''
            +',\''+d[x].parent+'\''
            +',\''+d[x].name+'\')">';

        +'</td>';
      }else{
        html+='<td>&nbsp;</td>'
          +'<td>&nbsp;</td>';
      }
      html+='</tr>';
    }
  }
  html+='</table><br>';
  html+='</div>';
    
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Folders.form.addPagingFn(indek);// #here
}

Folders.klikOpen=(indek,n)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  
  if(d.length==0) return;
  
  if(d[n].type==1) Folders.klikFolder(indek,d[n].path,d[n].name);
  if(d[n].type==3 || d[n].type==0) Folders.klikFile(indek
    ,d[n].file_id
    ,d[n].name
    ,d[n].parent
    ,d[n].type
    ,d[n].query
    ,d[n].data
  );
}

Folders.klikFolder=(indek,path,name)=>{
  // reset page;
  bingkai[indek].paging.offset=0;
  bingkai[indek].paging.page=1;
  // path
  bingkai[indek].path=path;
  bingkai[indek].path_name=name;
  
  // remove
  var arr=bingkai[indek].path_array;
  var arr_2=[];
  
  for(var i=0;i<arr.length;i++){
    if(arr[i].path==path){
      arr_2.push(arr[i]);
    }else{
      
    }
  }  
  Folders.form.modePaging(indek);
}

Folders.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'

    +'<li><label>Name:</label>'
      +'<input type="text" '
      +' id="name_'+indek+'"'
      +' size="20"></li>'
    
    +'<li><label>Parent:</label>'
      +'<input type="text" '
      +' id="parent_'+indek+'">'
    +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('name_'+indek).focus();
  setEV('parent_'+indek, bingkai[indek].path);
}

Folders.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO folders "
    +"(name,parent)"
    +" VALUES"
    +"('"+getEV("name_"+indek)+"',"
    +"'"+getEV("parent_"+indek)+"')"
  });
}

Folders.readOne=(indek,callback)=>{
  
  db.execute(indek,{
    query:"SELECT * "
    +" FROM folders"
    +" WHERE parent='"+bingkai[indek].parent_folder+"'"
    +" AND name='"+bingkai[indek].name+"'"

  },(paket)=>{
    if (paket.err.id==0){
      if(paket.count>0){
        var d=objectOne(paket.fields,paket.data);
        setEV('name_'+indek, d.name);
        setEV('parent_'+indek, d.parent);
      }
      
      message.none(indek);
    }
    return callback();
  });
}

Folders.formUpdate=(indek,parent,name)=>{
  bingkai[indek].parent_folder=parent;
  bingkai[indek].name=name;
  Folders.form.modeUpdate(indek);
}

Folders.updateExecute=function(indek){
  db.execute(indek,{
    query:"UPDATE folders"
      +" SET name='"+getEV('name_'+indek)+"'"
      +" ,parent='"+getEV('parent_'+indek)+"'"
      +" WHERE parent='"+bingkai[indek].parent_folder+"'"
      +" AND name='"+bingkai[indek].name+"'"
  });
}

Folders.formDelete=(indek,parent,name)=>{
  bingkai[indek].parent_folder=parent;
  bingkai[indek].name=name;
  Folders.form.modeDelete(indek);
}

Folders.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM folders"
      +" WHERE parent='"+bingkai[indek].parent_folder+"'"
      +" AND name='"+bingkai[indek].name+"'"
  });
}

Folders.countSearch=(indek,callback)=>{
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

Folders.search=(indek)=>{
  Folders.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT *"
        +" FROM properties "
        +" WHERE name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Folders.readShow(indek);
    });
  });
}

Folders.exportExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT name,parent,locked"
      +" FROM folders "
      +" WHERE parent='"+bingkai[indek].path+"'"
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'folders.json');
    }else{
      content.infoPaket(indek,paket);
    }
  });
}

Folders.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO folders "
        +" (admin_name,name,parent,locked) "
        +" VALUES('"+bingkai[indek].admin.name+"', "
        +" '"+d[i][0]+"', "// name
        +" '"+d[i][1]+"', "// parent
        +" '"+d[i][2]+"') "// locked
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Folders.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT name,type,parent,path,"
      +" user_name,date_modified"
      +" FROM folders"
      +" WHERE parent='"+bingkai[indek].path+"'"
      +" ORDER BY name"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Folders.selectShow(indek);
  });
}

Folders.selectShow=(indek)=>{
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
      +'<th colspan="2">Name</th>'
      +'<th>Type</th>'
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
        +' name="checked_'+indek+'"'
        +' value="'+d[x].name+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].name+'</td>'
      +'<td align="left">'+array_file_type[d[x].type]+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Folders.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM folders"
          +" WHERE name='"+d[i].name+"'"
          +" AND parent='"+d[i].parent+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Folders.changeID=(indek)=>{
  var id=document.getElementById('name_'+indek).value+' -new';
//  document.getElementById('name_'+indek).disabled=false;
  document.getElementById('name_'+indek).focus();
  document.getElementById('name_'+indek).value=id;
}

Folders.klikFile=(indek,file_id,name,parent,type,db_query,data)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.delet(indek,()=>{Folders.deleteFile(indek,db_query)});
  toolbar.back(indek,()=>{Folders.form.lastMode(indek) });

    var d=JSON.parse(data);
    var v=Object.values(d);
    var k=Object.keys(d);
    var v2;
    
    var html=''
      +'<div style="padding:0.5rem">'
      
      +'<div style="line-height:2rem">'      
        +'<strong>File ID</strong>&nbsp;'
          +'<span class="quote_text">'+file_id+'</span></br>'
        +'<strong>File Name</strong>&nbsp;'
          +'<span class="quote_text">'+name+'</span></br>'
        +'<strong>Parent Folder</strong>&nbsp;'
          +'<span class="quote_text">'+parent+'</span></br>'
        +'<strong>Small Query</strong>&nbsp;'
          +'<span class="quote_text">'+db_query+'</span></br>'
      +'</div>'
      +content.message(indek)
      
    // bentuk ke table;
      +'<table style="table-layout: fixed;">'
      +'<tr>'
        +'<td align="center" colspan="2">'
          +'<strong>Data Content</strong>'
        +'</td>'
      +'</tr>'
      
//      if(p.count>0){
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
//      }
    html+='</table>';
    
    content.html(indek,html);
    statusbar.ready(indek);
//  })  
}

Folders.deleteFile=(indek,q)=>{
  var sql="DELETE "+q;
  db.execute(indek,{query:sql},(h)=>{
    // nothing to-do;
  });
}


// eof: 279;484;516;
