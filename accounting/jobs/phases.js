/*
 * name: budiono;
 * file: 26;
 * path: /accounting/jobs/phases.js;
 * date: sep-04, 17:57, mon-2023;new;324;
 * edit: sep-19, 21:46, tue-2023;
 * edit: oct-14, 20:04, sat-2023; 
 * -----------------------------; happy new year 2024;
 * edit: jan-01, 10:34, mon-2023; mringkas;
 * edit: feb-02, 10:58, fri-2024; w class;
 * edit: mar-22, 10:30, fri-2024; Basic SQL;
 * edit: jun-24, 20:44, mon-2024; mk-1;
 * edit: jul-27, 11:46, sat-2024; r-11;
 * edit: sep-10, 16:05, tue-2024; r-18;
 * edit: nov-24, 15:19, sun-2024; #27; add locker;
 * edit: nov-30, 19:22, sat-2024; #27; 
 * edit: dec-20, 15:45, fri-2024; #32; properti+duplicate;
 * edit: dec-23, 10:35, mon-2024; #32; 
 * -----------------------------; happy new year 2025; 
 * edit: feb-17, 16:21, mon-2025; #40; properties;
 * edit: mar-11, 09:38, mon-2025; #43; deep-folder;
 * edit: mar-25, 14:38, tue-2025; #45; cstructure;ctables; 
 * edit: apr-24, 22:47, thu-2025; #50; export cdv;
 */ 

'use strict';

var Phases={}

Phases.table_name='phases';
Phases.form=new ActionForm2(Phases);

Phases.show=(tiket)=>{
  tiket.modul=Phases.table_name;

  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Phases.form.modePaging(indek,Phases);
    });
  }else{
    show(baru);
  }
}

Phases.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM phases "
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

Phases.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Phases.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT phase_id,name,use_cost, "
        +" user_name,date_modified"
        +" FROM phases"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY phase_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Phases.readShow(indek);
    });
  })
}

Phases.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html=`<div style="padding:0.5rem;">
    ${content.title(indek)}
    ${content.message(indek)}
    ${totalPagingandLimit(indek)}
    <table border=1>
      <tr>
        <th colspan="2">Phase ID</th>
        <th>Description</th>
        <th>Use Cost</th>
        <th>User</th>
        <th>Modified</th>
        <th colspan="3">Action</th>
      </tr>`;

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+=`<tr>
      <td align="center">${n}</td>
      <td align="left">${d[x].phase_id}</td>
      <td align="left">${xHTML(d[x].name)}</td>
      <td align="center">${binerToBool(d[x].use_cost)}</td>
      <td align="center">${d[x].user_name}</td>
      <td align="center">${tglInt(d[x].date_modified)}</td>`
      +`<td align="center">`
        +`<button type="button" id="btn_change" `
        +`onclick="Phases.formUpdate(\'${indek}\',\'${d[x].phase_id}\');">`
        +`</button>`
      +`</td>`
      +`<td align="center">`
        +`<button type="button" id="btn_delete" `
        +`onclick="Phases.formDelete(\'${indek}\',\'${d[x].phase_id}\');">`
        +`</button>`
      +`</td>`
      +`<td align="center">${n}</td>`
      +`</tr>`;
    }
  }
  html+=`</table></div>`;
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Phases.form.addPagingFn(indek);
}

Phases.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=`<div style="padding:0.5rem">
    ${content.title(indek)}
    ${content.message(indek)}
    <form autocomplete="off">
    <ul>`
    
    +`<li><label>Phase ID:</label><input type="text" 
      id="phase_id_${indek}"></li>`
      
    +'<li><label>Name:</label>'
      +'<input type="text" '
      +' id="phase_name_'+indek+'"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox" '
      +' id="phase_inactive_'+indek+'">Inactive</label>'
      +'</li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox" '
      +' id="use_cost_'+indek+'">'
      +'Use Cost Codes</label></li>'

    +'</ul>'
    
    +'<details open>'
      +'<summary>General</summary>'
      +'<label>Cost Type:</label>'
      +'<select id="phase_type_'+indek+'">'
      +getDataCostType(indek)
      +'</select>'
    +'</details>'
    +'</form>'
    +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('phase_id_'+indek).focus();
  }else{
    document.getElementById('phase_id_'+indek).disabled=true;
    document.getElementById('phase_name_'+indek).focus();
    document.getElementById('use_cost_'+indek).disabled=true;
  }
}

Phases.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO phases"
    +"(admin_name,company_id,phase_id,name,inactive,use_cost,type)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("phase_id_"+indek)+"'"
    +",'"+getEV("phase_name_"+indek)+"'"
    +", "+getEC("phase_inactive_"+indek)
    +", "+getEC("use_cost_"+indek)
    +", "+getEI("phase_type_"+indek)
    +")"
  });
}

Phases.readOne=(indek,callback)=>{
  db.execute(indek,{
    content:true,
    query:"SELECT * "
      +" FROM phases "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND phase_id='"+bingkai[indek].phase_id+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('phase_id_'+indek, d.phase_id);
      setEV('phase_name_'+indek, d.name);
      setEC('phase_inactive_'+indek, d.inactive);
      setEC('use_cost_'+indek, d.use_cost);
      setEI('phase_type_'+indek, d.type);
      statusbar.ready(indek);
      message.none(indek);
    }
    return callback();
  });
}

Phases.formUpdate=(indek,phase_id)=>{
  bingkai[indek].phase_id=phase_id;
  Phases.form.modeUpdate(indek);
}

Phases.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE phases "
      +" SET name='"+getEV("phase_name_"+indek)+"', "
      +" inactive= "+getEC("phase_inactive_"+indek)+", "
      +" type= "+getEI("phase_type_"+indek)+" "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND phase_id='"+bingkai[indek].phase_id+"' "
  },(p)=>{
    if(p.err.id==0) Phases.finalPath(indek);
  });
}

Phases.formDelete=(indek,phase_id)=>{
  bingkai[indek].phase_id=phase_id;
  Phases.form.modeDelete(indek);
}

Phases.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM phases "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND phase_id='"+bingkai[indek].phase_id+"' "
  },(p)=>{
    if(p.err.id==0) Phases.finalPath(indek);
  });
}

Phases.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM phases "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND phase_id LIKE '%"+bingkai[indek].text_search+"%' "
      +" OR name LIKE '%"+bingkai[indek].text_search+"%' "
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Phases.search=(indek)=>{
  Phases.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT phase_id,name,use_cost, "
        +" user_name,date_modified "
        +" FROM phases "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND phase_id LIKE '%"+bingkai[indek].text_search+"%' "
        +" OR name LIKE '%"+bingkai[indek].text_search+"%' "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Phases.readShow(indek);
    });
  });
}

Phases.exportExecute=(indek)=>{
  var table_name=Phases.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Phases.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  
  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO phases "
      +" (admin_name,company_id,phase_id,name,inactive,use_cost,type)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +", "+d[i][3]+" "
      +", "+d[i][4]+" "
      +", "+d[i][5]+" "
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Phases.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT phase_id,name,use_cost,"
      +" user_name,date_modified"
      +" FROM phases "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY phase_id "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Phases.selectShow(indek);
  });
}

Phases.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0 1rem 0 1rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
      +'<th colspan="2">Phase ID</th>'
      +'<th>Description</th>'
      +'<th>Use Cost</th>'
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
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].phase_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'+binerToBool(d[x].use_cost)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Phases.deleteAllExecute=(indek)=>{
  var e=document.getElementsByName('checked_'+indek);
  var d=bingkai[indek].paket.data;
  var a=[];
  
  for(var i=0;i<e.length;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM phases "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND phase_id = '"+d[i][0]+"' "
      });
    }
  }
  db.deleteMany(indek,a);  
}

Phases.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,phase_id,date_created"
      +" FROM phases"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND phase_id='"+getEV('phase_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Phases.table_name,"/",
        d.company_id,"/",
        d.phase_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Phases.duplicate=(indek)=>{
  var id='copy_of '+getEV('phase_id_'+indek);
  document.getElementById('phase_id_'+indek).disabled=false;
  document.getElementById('phase_id_'+indek).value=id;
  document.getElementById('phase_id_'+indek).focus();
}

Phases.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Phases.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Phases.properties(indek);})
  }
}




// eof: 324;339;294;391;384;381;399;443;448;454;451;
