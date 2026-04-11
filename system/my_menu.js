/*
 * name: budiono;
 * date: mar-18, 14:33, tue-2025; #44; my_menu;
 * edit: sep-12, 08:21, fri-2025; #74; 
 */
 
'use strict';

var MyMenu={}

MyMenu.table_name="my_menu";
MyMenu.form=new ActionForm2(MyMenu);

MyMenu.show=(tiket)=>{
  tiket.modul=MyMenu.table_name;

  var baru=exist(tiket);
  
  if(baru==-1){
    
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    
    getPath(indek,MyMenu.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        MyMenu.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }  
}

MyMenu.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM my_menu"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

MyMenu.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  MyMenu.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT menu_sort,menu_id,menu_name,menu_parent,menu_type,"
        +"user_name,date_modified"
        +" FROM my_menu"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" ORDER BY menu_parent,menu_sort"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      MyMenu.readShow(indek);
    });
  })
}

MyMenu.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">#</th>'
      +'<th>Menu ID</th>'
      +'<th>Menu Name</th>'
      +'<th>Parent</th>'
      +'<th>Type</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].menu_sort+'</td>'
      +'<td align="left">'+d[x].menu_id+'</td>'
      +'<td align="left">'+xHTML(d[x].menu_name)+'</td>'
      +'<td align="left">'+d[x].menu_parent+'</td>'
      +'<td align="left">'+array_menu_type[d[x].menu_type]+'</td>'
      
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'

      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="MyMenu.formUpdate(\''+indek+'\''
        +',\''+d[x].menu_id+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="MyMenu.formDelete(\''+indek+'\''
        +',\''+d[x].menu_id+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  MyMenu.form.addPagingFn(indek);// #here
}

MyMenu.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'   
      +'<li><label>Sort:</label>'
        +'<input type="text" '
        +' id="menu_sort_'+indek+'"'
        +' size="9">'
      +'</li>'
      +'<li><label>Parent:</label>'
        +'<input type="text" '
        +' id="menu_parent_'+indek+'"'
        +' size="30">'
      +'</li>'
      +'<li><label>Menu ID</label>'
        +'<input type="text"'
        +' id="menu_id_'+indek+'"'
        +' size="30">'
      +'</li>'
      +'<li><label>Name</label>'
        +'<input type="text"'
        +' id="menu_name_'+indek+'"'
        +' size="30">'
      +'</li>'
      +'<li><label>File Type:</label>'
        +'<select id="menu_type_'+indek+'">'
          +getMenuType(indek)
        +'</select>'
      +'</li>'
/*
      +'<li><label>Access:</label>'
        +'<select id="menu_access_'+indek+'" disabled>'
          +getMenuAccess(indek)
        +'</select>'
      +'</li>'
*/      
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  

  if (metode===MODE_CREATE){
    document.getElementById('menu_id_'+indek).focus();
  }else{
    document.getElementById('menu_id_'+indek).disabled=true;
    document.getElementById('menu_type_'+indek).disabled=true;
    document.getElementById('menu_name_'+indek).focus();
  }
}

MyMenu.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO my_menu "
    +"(menu_sort,menu_parent,menu_id,menu_name,menu_type)"
    +" VALUES"
    +"('"+getEV("menu_sort_"+indek)+"'"
    +",'"+getEV("menu_parent_"+indek)+"'"
    +",'"+getEV("menu_id_"+indek)+"'"
    +",'"+getEV("menu_name_"+indek)+"'"
    +",'"+getEI("menu_type_"+indek)+"'"
    +")"
  });
}

MyMenu.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM my_menu"
      +" WHERE menu_id='"+bingkai[indek].menu_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      
      setEV('menu_sort_'+indek, d.menu_sort );
      setEV('menu_parent_'+indek, d.menu_parent);
      setEV('menu_id_'+indek, d.menu_id);
      setEV('menu_name_'+indek, d.menu_name);
      setEI('menu_type_'+indek, d.menu_type);
      
      message.none(indek);
    }
    return callback();
  });
}

MyMenu.formUpdate=(indek,menu_id)=>{
  bingkai[indek].menu_id=menu_id;
  MyMenu.form.modeUpdate(indek);
}

MyMenu.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE my_menu "
      +" SET menu_name='"+getEV("menu_name_"+indek) +"',"
      +" menu_sort='"+getEV("menu_sort_"+indek) +"',"
      +" menu_parent='"+getEV("menu_parent_"+indek) +"'"
      +" WHERE menu_id='"+bingkai[indek].menu_id+"'"
  },(p)=>{
    if(p.err.id==0) MyMenu.finalPath(indek);
  });
}

MyMenu.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{MyMenu.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{MyMenu.properties(indek);})
  }
}

MyMenu.formDelete=(indek,menu_id)=>{
  bingkai[indek].menu_id=menu_id;
  MyMenu.form.modeDelete(indek);
}

MyMenu.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM my_menu"
      +" WHERE menu_id='"+bingkai[indek].menu_id+"'"
  },(p)=>{
    if(p.err.id==0) MyMenu.finalPath(indek);
  });
}

MyMenu.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM my_menu "
      +" WHERE menu_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR menu_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

MyMenu.search=(indek)=>{
  MyMenu.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT menu_sort,menu_id,menu_name,menu_parent,menu_type,"
        +"user_name,date_modified "
        +" FROM my_menu"
        +" WHERE menu_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR menu_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      MyMenu.readShow(indek);
    });
  });
}

MyMenu.exportExecute=(indek)=>{
  var table_name=MyMenu.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

MyMenu.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT menu_sort,menu_id,menu_name,menu_parent,"
      +" user_name,date_modified"
      +" FROM my_menu"
      +" ORDER BY menu_parent,menu_sort"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    MyMenu.selectShow(indek);
  });
}

MyMenu.selectShow=(indek)=>{
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
      +'<th colspan="2">Menu ID</th>'
      +'<th>Menu Name</th>'
      +'<th>Parent</th>'
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
        +' value="'+d[x].menu_id+'">'
        +'</td>'
      +'<td align="center">'+d[x].menu_sort+'</td>'
      +'<td align="left">'+d[x].menu_id+'</td>'
      +'<td align="left">'+xHTML(d[x].menu_name)+'</td>'
      +'<td align="left">'+xHTML(d[x].menu_parent)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

MyMenu.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM my_menu"
          +" WHERE menu_id = '"+d[i].menu_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

MyMenu.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO my_menu "
        +"(menu_sort,menu_parent,menu_id,menu_name"
        +",menu_type,menu_access) "
        +" VALUES "
        +"('"+d[i][0]+"'"// sort
        +",'"+d[i][1]+"'"// parent
        +",'"+d[i][2]+"'"// menu_id
        +",'"+d[i][3]+"'"// name
        +",'"+d[i][4]+"'"// type
        +",'"+d[i][5]+"'"// menu_access
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

MyMenu.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('menu_id_'+indek).value;
  document.getElementById('menu_id_'+indek).disabled=false;
  document.getElementById('menu_id_'+indek).value=id;
  document.getElementById('menu_id_'+indek).focus();
}

MyMenu.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM my_menu "
      +" WHERE menu_id='"+getEV('menu_id_'+indek)+"' "
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


// eof:404;427;
