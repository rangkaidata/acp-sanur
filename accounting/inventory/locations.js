/*
 * name: budiono
 * date: sep-04, 18:03, mon-2023; new;313;
 * edit: sep-19, 21:06, tue-2023; 
 * edit: dec-27, 17:19, wed-2023;
 * edit: dec-29, 16:30, fri-2023; new Fn;
 * -----------------------------; happy new year 2024;
 * edit: feb-01, 20:34, thu-2024;
 * edit: jul-26, 20:31, fri-2024; r-11;
 * edit: aug-22, 20:48, thu-2024; r-13; revisi ke-13;
 * edit: sep-10, 12:18, tue-2024; r-18; admin_name;
 * edit: sep-30, 17:16, mon-2024; #19; 
 * edit: dec-16, 11:36, mon-2024; #31, properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-14, 14:45, fri-2025; #40; new properties;
 * edit: mar-10, 22:19, mon-2025; #43; deep folder;
 * edit: apr-24, 22:22, thu-2025; #50; csv;
 */ 

'use strict';

var Locations={}
  
Locations.table_name='locations';
Locations.form=new ActionForm2(Locations);

Locations.show=(tiket)=>{
  tiket.modul=Locations.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Locations.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Locations.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM locations"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Locations.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Locations.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT location_id,name,"
        +" user_name,date_modified"
        +" FROM locations"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY location_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Locations.readShow(indek);
    });
  })
}

Locations.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Location ID</th>'
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
      +'<td align="left">'+d[x].location_id+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="Locations.formUpdate(\''+indek+'\''
        +',\''+d[x].location_id+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Locations.formDelete(\''+indek+'\''
        +',\''+d[x].location_id+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Locations.form.addPagingFn(indek);// #here
}

Locations.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Location ID:</label>'
      +'<input type="text" '
      +' id="location_id_'+indek+'"'
      +' size="9"></li>'
      
    +'<li><label>Description:</label>'
      +'<input type="text"'
      +' id="location_name_'+indek+'"'
      +' size="30"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="location_inactive_'+indek+'">'
      +'Inactive</label>'
      +'</li>'
      
    +'<li><label>Type:</label>'
      +'<select id="location_type_'+indek+'">'
      +getDataLocationType(indek)
      +'</select>'
      +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('location_id_'+indek).focus();
  }else{
    document.getElementById('location_id_'+indek).disabled=true;
    document.getElementById('location_name_'+indek).focus();
  }
}

Locations.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO locations "
    +"(admin_name,company_id,location_id,name,inactive,type)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("location_id_"+indek)+"'"
    +",'"+getEV("location_name_"+indek)+"'"
    +",'"+getEC("location_inactive_"+indek)+"'"
    +",'"+getEI("location_type_"+indek)+"'"
    +")"
  });
}

Locations.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM locations"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+bingkai[indek].location_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('location_id_'+indek, d.location_id );
      setEV('location_name_'+indek, d.name);
      setEC('location_inactive_'+indek, d.inactive);
      setEI('location_type_'+indek, d.type);
      message.none(indek);
    }
    return callback();
  });
}

Locations.formUpdate=(indek,location_id)=>{
  bingkai[indek].location_id=location_id;
  Locations.form.modeUpdate(indek);
}

Locations.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE locations "
      +" SET name='"+getEV("location_name_"+indek) +"',"
      +" inactive='"+getEC("location_inactive_"+indek)+"',"
      +" type='"+getEI("location_type_"+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+bingkai[indek].location_id+"'"
  },(p)=>{
    if(p.err.id==0) Locations.finalPath(indek);
  });
}

Locations.formDelete=(indek,location_id)=>{
  bingkai[indek].location_id=location_id;
  Locations.form.modeDelete(indek);
}

Locations.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM locations"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+bingkai[indek].location_id+"'"
  },(p)=>{
    if(p.err.id==0) Locations.finalPath(indek);
  });
}

Locations.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM locations "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Locations.search=(indek)=>{
  Locations.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT location_id,name,inactive,type,"
        +" user_name,date_modified "
        +" FROM locations"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND location_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Locations.readShow(indek);
    });
  });
}

Locations.exportExecute=(indek)=>{
  var table_name=Locations.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Locations.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT location_id,name,"
      +" user_name,date_modified"
      +" FROM locations"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY location_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Locations.selectShow(indek);
  });
}

Locations.selectShow=(indek)=>{
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
      +'<th colspan="2">Location ID</th>'
      +'<th>Description</th>'
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
        +' value="'+d[x].location_id+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].location_id+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Locations.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM locations"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND location_id = '"+d[i].location_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Locations.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO locations "
        +" (admin_name,company_id,location_id,name,inactive,type) "
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +",'"+d[i][3]+"'"
        +",'"+d[i][4]+"'"
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Locations.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('location_id_'+indek).value;
  document.getElementById('location_id_'+indek).disabled=false;
  document.getElementById('location_id_'+indek).value=id;
  document.getElementById('location_id_'+indek).focus();
}

Locations.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,location_id,date_created"
      +" FROM locations "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+getEV('location_id_'+indek)+"' "
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Locations.table_name,"/",
        d.company_id,"/",
        d.location_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Locations.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Locations.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Locations.properties(indek);})
  }
}



//eof: 313;333;304;287;271;376;377;391;395;434;422;435;438;

/*
 * 0=root, 1=folder, 2=app, 3=file;
 * 
 * 0=name (root/folder)
 * 1=table_name (application)
 * 2=primary_key (file)
 * 3=parent
 */ 

