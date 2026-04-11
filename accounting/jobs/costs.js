/*
 * name: budiono;
 * file: 25;
 * path: accounting/jobs/costs.js;
 * date: sep-04, 17:44, mon-2023; new; 318;
 * edit: oct-14, 20:05, sat-2023; getPaging;
 * -----------------------------; happy new year 2024;
 * edit: jan-01, 10:05, mon-2024; mringkas;
 * edit: feb-01, 20:19, thu-2024; with class;
 * edit: mar-21, 23:17, thu-2024; Basic SQL;
 * edit: apr-24, 15:06, wed-2024; readOne:objectOne;
 * edit: jun-24, 16:09, mon-2024; BasicSQL; r1;
 * edit: jul-27, 10:28, sat-2024; r-11;
 * edit: sep-10, 15:53, tue-2024; r18;
 * edit: nov-24, 14:20, sun-2024; #27; add locker;
 * edit: nov-30, 19:00, sat-2024; #27; locker();
 * edit: dec-20, 15:13, fri-2024; #32; properties+duplicate;
 * edit: dec-22, 21:54, sun-2024; #32;
 * -----------------------------; happy new year 2025;
 * edit: feb-17, 15:54, mon-2025; #40; new properties;
 * edit: mar-10, 23:45, mon-2025; #43; deep folder;
 * edit: mar-25, 14:26, tue-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:47, thu-2025; #50; export csv;
 */ 

'use strict';

var Costs={};

Costs.table_name='cost_codes';
Costs.form=new ActionForm2(Costs);

Costs.show=(tiket)=>{
  tiket.modul=Costs.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Costs.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Costs.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM cost_codes"
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

Costs.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Costs.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cost_id,name, "
        +" user_name,date_modified "
        +" FROM cost_codes "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY cost_id "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Costs.readShow(indek);
    });
  })
}

Costs.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)

    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Cost ID</th>'
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
        +'<td align="left">'+d[x].cost_id+'</td>'
        +'<td align="left">'+tHTML(d[x].name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="Costs.formUpdate(\''+indek+'\''
          +',\''+d[x].cost_id+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Costs.formDelete(\''+indek+'\''
          +',\''+d[x].cost_id+'\');">'
          +'</button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Costs.form.addPagingFn(indek);
}

Costs.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT cost_id,name, "
      +" user_name,date_modified "
      +" FROM cost_codes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY cost_id "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Costs.selectShow(indek);
  });
}

Costs.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html='<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Cost ID:</label>'
      +'<input type="text"'
      +' id="cost_id_'+indek+'"'
      +' size="12"></li>'
      
    +'<li><label>Description:</label>'
      +'<input type="text"'
      +' id="cost_name_'+indek+'"'
      +' size="30"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="cost_inactive_'+indek+'">'
      +'Inactive</label>'
      +'</li>'
      
    +'<li><label>Cost Type:</label>'
      +'<select id="cost_type_'+indek+'">'
      +getDataCostType(indek)
      +'</select></li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('cost_id_'+indek).focus();
  }else{
    document.getElementById('cost_id_'+indek).disabled=true;
    document.getElementById('cost_name_'+indek).focus();
  }
}

Costs.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO cost_codes "
      +"(admin_name,company_id,cost_id,name,inactive,type)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("cost_id_"+indek)+"'"
      +",'"+getEV("cost_name_"+indek)+"'"
      +",'"+getEC("cost_inactive_"+indek)+"'"
      +",'"+getEI("cost_type_"+indek)+"'"
      +")"
  });
}

Costs.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM cost_codes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cost_id='"+bingkai[indek].cost_id+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV( 'cost_id_'+indek,d.cost_id );
      setEV('cost_name_'+indek,d.name);
      setEC('cost_inactive_'+indek,d.inactive);
      setEI('cost_type_'+indek,d.type);
      statusbar.ready(indek);
      message.none(indek);
    }
    return callback();
  });
}

Costs.formUpdate=(indek,cost_id)=>{
  bingkai[indek].cost_id=cost_id;
  Costs.form.modeUpdate(indek);
}

Costs.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE cost_codes "
      +" SET name='"+getEV("cost_name_"+indek)+"', "
      +" inactive= "+getEC("cost_inactive_"+indek)+", "
      +" type= "+getEI("cost_type_"+indek)+" "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"      
      +" AND cost_id='"+bingkai[indek].cost_id+"' "
  },(p)=>{
    if(p.err.id==0) Costs.finalPath(indek);
  });
}

Costs.formDelete=(indek,cost_id)=>{
  bingkai[indek].cost_id=cost_id;
  Costs.form.modeDelete(indek);
}

Costs.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM cost_codes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cost_id='"+bingkai[indek].cost_id+"' "
  },(p)=>{
    if(p.err.id==0) Costs.finalPath(indek);
  });
}

Costs.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM cost_codes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cost_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Costs.search=(indek)=>{
  Costs.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cost_id,name,inactive,type, "
        +" user_name,date_modified "
        +" FROM cost_codes "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND cost_id LIKE '%"+bingkai[indek].text_search+"%' "
        +" OR name LIKE '%"+bingkai[indek].text_search+"%' "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Costs.readShow(indek);
    });
  });
}

Costs.exportExecute=(indek)=>{
  var table_name=Costs.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Costs.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO cost_codes "
        +" (admin_name,company_id,cost_id, name, inactive,type"
        +") VALUES "
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

Costs.selectShow=(indek)=>{
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
      +'<th colspan="2">Cost ID</th>'
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
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].cost_id+'</td>'
        +'<td align="left">'+tHTML(d[x].name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Costs.deleteAllExecute=(indek)=>{
  var e=document.getElementsByName('checked_'+indek);
  var d=bingkai[indek].paket.data;
  var a=[];
  
  for(var i=0;i<e.length;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM cost_codes "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cost_id = '"+d[i][0]+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

Costs.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM cost_codes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cost_id='"+getEV('cost_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }else{
      message.infoPaket(indek,p);
    }
  });
}

Costs.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('cost_id_'+indek).value;
  document.getElementById('cost_id_'+indek).disabled=false;
  document.getElementById('cost_id_'+indek).value=id;
  document.getElementById('cost_id_'+indek).focus();
}

Costs.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Costs.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Costs.properties(indek);})
  }
}




// eof: 318;299;273;399;381;378;372;388;428;436;442;439;434;
