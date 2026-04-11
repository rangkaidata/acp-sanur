/*
 * name: budiono;
 * file: -23-;
 * path: /accounting/inventory/ship_methods;
 * date: sep-04, 20:26, mon-2023; new;296;
 * edit: dec-27, 17:31, wed-2023;
 * edit: dec-31, 19:11, sun-2023; mringkas;
 * -----------------------------; happy new year 2024;
 * edit: feb-02, 10:37, fri-2024; class;
 * edit: mar-21, 11:51, fri-2024; menggunakan Basic SQL Command;
 * edit: apr-22, 21:39, mon-2024; perbaikan;
 * edit: jun-24, 11:35, mon-2024; rev-1;
 * edit: jul-27, 07:24, sat-2024; r-11;
 * edit: sep-10, 15:27, tue-2024; r-18;
 * edit: nov-23, 12:55, sat-2024; #27; add locker;
 * edit: nov-30, 17:43, sat-2024; #27; revisi locker();
 * edit: dec-20, 13:42, fri-2024; #31; properties; duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-14, 18:14, fri-2025; #40; new properti;
 * edit: mar-10, 22:56, mon-2025; #43; deep folder;
 * edit: mar-25, 14:04, tue-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:26, thu-2025; #50; can csv;
 */ 

'use strict';

var ShipVia={}

ShipVia.table_name='ship_methods';
ShipVia.form=new ActionForm2(ShipVia);

ShipVia.show=(karcis)=>{
  karcis.modul=ShipVia.table_name;
  karcis.child_free=false;
  
  var baru=exist(karcis);
  if(baru==-1){
    var form=new BingkaiUtama(karcis);
    var indek=form.show();
    createFolder(indek,()=>{
      ShipVia.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

ShipVia.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM ship_methods"
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

ShipVia.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ShipVia.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT ship_id, name, "
        +" user_name,date_modified "
        +" FROM ship_methods "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY ship_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ShipVia.readShow(indek);
    });
  })
}

ShipVia.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
      +'<tr>'
        +'<th colspan="2">Ship Method</th>'
        +'<th>Name</th>'
        +'<th>User</th>'
        +'<th>Modified</th>'
        +'<th colspan="2">Action</th>'
      +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].ship_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_change" '
          +' onclick="ShipVia.formUpdate(\''+indek+'\''
          +',\''+d[x].ship_id+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" id="btn_delete" '
          +' onclick="ShipVia.formDelete(\''+indek+'\''
          +',\''+d[x].ship_id+'\');">'
          +'</button></td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ShipVia.form.addPagingFn(indek);
}

ShipVia.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Ship Via:</label>'
      +'<input type="text"'
      +' id="ship_id_'+indek+'"></li>'
      
    +'<li><label>Name:</label>'
      +'<input type="text" '
      +' id="ship_name_'+indek+'"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox" '
      +' id="ship_inactive_'+indek+'">Inactive</label>'
      +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';
    
  content.html(indek,html);  
  statusbar.ready(indek);

  if(metode==MODE_CREATE){
    document.getElementById('ship_id_'+indek).focus();
  }else{
    document.getElementById('ship_id_'+indek).disabled=true;
    document.getElementById('ship_name_'+indek).focus();
  }
}

ShipVia.createExecute=(indek)=>{
  db.execute(indek,{
    query: "INSERT INTO ship_methods"
      +"(admin_name,company_id,ship_id,name,inactive)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("ship_id_"+indek)+"'"
      +",'"+getEV("ship_name_"+indek)+"'"
      +", "+getEC("ship_inactive_"+indek)+""
      +")"
  });
}

ShipVia.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM ship_methods "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ship_id='"+bingkai[indek].ship_id+"'"
  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('ship_id_'+indek, d.ship_id);
      setEV('ship_name_'+indek, d.name);
      setEC('ship_inactive_'+indek, d.inactive);
      statusbar.ready(indek);
      message.none(indek);
    }
    
    return callback();
  });
}

ShipVia.formUpdate=(indek,ship_id)=>{
  bingkai[indek].ship_id=ship_id;
  ShipVia.form.modeUpdate(indek);
}

ShipVia.updateExecute=function(indek){
  db.execute(indek,{
    query:"UPDATE ship_methods "
      +" SET name='"+getEV("ship_name_"+indek)+"', "
      +" inactive= "+getEC("ship_inactive_"+indek)+" "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ship_id='"+bingkai[indek].ship_id+"' "
  },(p)=>{
    if(p.err.id==0) ShipVia.finalPath( indek );
  });
}

ShipVia.formDelete=(indek,ship_id)=>{
  bingkai[indek].ship_id=ship_id;
  ShipVia.form.modeDelete(indek);
}

ShipVia.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM ship_methods "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ship_id='"+bingkai[indek].ship_id+"' "
  },(p)=>{
    if(p.err.id==0) ShipVia.finalPath( indek );
  });
}

ShipVia.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT ship_id,name,"
      +" user_name,date_modified "
      +" FROM ship_methods "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY ship_id "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ShipVia.selectShow(indek);
  });
}

ShipVia.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
      +'<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="check_all_'+indek+'"'
          +' onclick="checkAll(\''+indek+'\')">'
        +'</td>'
        +'<th colspan="2">Ship Method</th>'
        +'<th>Name</th>'
        +'<th>User</th>'
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
          +' value="'+d[x].ship_id+'">'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].ship_id+'</td>'
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

ShipVia.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM ship_methods "
    +" WHERE company_id='"+bingkai[indek].company.id+"' "
    +" AND ship_id LIKE '%"+bingkai[indek].text_search+"%' "
    +" OR name LIKE '%"+bingkai[indek].text_search+"%' "
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ShipVia.search=(indek)=>{
  ShipVia.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT ship_id,name,"
        +" user_name,date_modified "
        +" FROM ship_methods "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND ship_id LIKE '%"+bingkai[indek].text_search+"%' "
        +" OR name LIKE '%"+bingkai[indek].text_search+"%' "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ShipVia.readShow(indek);
    });
  });
}

ShipVia.exportExecute=(indek)=>{
  var table_name=ShipVia.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

ShipVia.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO ship_methods "
      +"(admin_name,company_id,ship_id,name,inactive"
      +") VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +",'"+d[i][3]+"'"
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

ShipVia.deleteAllExecute=(indek)=>{
  var e=document.getElementsByName('checked_'+indek);
  var d=bingkai[indek].paket.data;
  var a=[];
  
  for(var i=0;i<e.length;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM ship_methods "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND ship_id = '"+d[i][0]+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

ShipVia.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,ship_id,date_created"
      +" FROM ship_methods"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ship_id='"+getEV('ship_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        ShipVia.table_name,"/",
        d.company_id,"/",d.ship_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

ShipVia.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('ship_id_'+indek).value;
  document.getElementById('ship_id_'+indek).disabled=false;
  document.getElementById('ship_id_'+indek).value=id;
  document.getElementById('ship_id_'+indek).focus();
}

ShipVia.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ShipVia.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ShipVia.properties(indek);})
  }
}




// eof: 296;309;256;365;366;361;377;422;428;424;
