/*
 * name: budiono;
 * file: 24;
 * path: /accounting/sales/pay_methods.js;
 * edit: sep-04, 20:28, mon-2023; new;312;
 * edit: dec-31, 19:31, sun-2023; mringkas;
 * -----------------------------; happy new year 2024;
 * edit: feb-02, 10:46, fri-2024; w class;
 * edit: mar-22, 16:00, fri-2024; query;
 * edit: apr-23, 17:45, tue-2024; basic query;
 * edit: jun-24, 13:14, mon-2024; BasicQuery;r1;r&w
 * edit: jul-27, 08:18, sat-2024; r-11;
 * edit: sep-10, 15:42, tue-2024; r18;
 * edit: nov-23, 17:23, sat-2024; #27; add locker;
 * edit: nov-30, 18:07, sat-2024; #27; revisi properties locker();
 * edit: dec-20, 14:47, fri-2024; #31;
 * -----------------------------; happy new year 2025;
 * edit: feb-17, 15:15, mon-2025; #40; new properties;
 * edit: mar-10, 23:18, mon-2025; #43; deep folder;
 * edit: mar-25, 14:17, tue-2025; #45; cstructure;ctables;
 * edit: apr-24, 21:02, thu-2025; #50; export to csv;
 */ 

'use strict';

var PayMethods={};

PayMethods.table_name='pay_methods';
PayMethods.form=new ActionForm2(PayMethods);

PayMethods.show=(karcis)=>{
  karcis.modul=PayMethods.table_name;
  karcis.child_free=false;

  var baru=exist(karcis);
  if(baru==-1){
    var form=new BingkaiUtama(karcis);
    var indek=form.show();
    createFolder(indek,()=>{
      PayMethods.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

PayMethods.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM pay_methods"
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

PayMethods.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  PayMethods.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT pay_method_id, name, "
        +" user_name, date_modified "
        +" FROM pay_methods "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY pay_method_id "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      PayMethods.readShow(indek);
    });
  })
}

PayMethods.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Pay Method</th>'
    +'<th>Description</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'<th colspan="3">Action</th>'
    +'</tr>';

  if(p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td>'+d[x].pay_method_id+'</td>'
      +'<td>'+tHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" id="btn_change" '
          +' onclick="PayMethods.formUpdate(\''+indek+'\''
          +',\''+d[x].pay_method_id+'\');">'
          +'</button>'
      +'</td>'
      +'<td align="center">'
        +'<button type="button" id="btn_delete" '
        +' onclick="PayMethods.formDelete(\''+indek+'\''
        +',\''+d[x].pay_method_id+'\');">'
        +'</button>'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  PayMethods.form.addPagingFn(indek);
}

PayMethods.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
      +'<li><label>Pay Method ID:</label>'
        +'<input type="text" '
        +' id="pay_method_id_'+indek+'"></li>'
      
      +'<li><label>Description:</label>'
        +'<input type="text" '
        +' id="pay_method_name_'+indek+'"></li>'
      
      +'<li><label>&nbsp;</label>'
      +'<label>'
        +'<input type="checkbox"'
        +' id="pay_method_inactive_'+indek+'">Inactive'
        +'</label>'
      +'</li>'
    +'</ul>'
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode==MODE_CREATE){
    document.getElementById("pay_method_id_"+indek).focus();
  }else{  
    document.getElementById("pay_method_id_"+indek).disabled=true;
    document.getElementById("pay_method_name_"+indek).focus();
  }
}

PayMethods.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO pay_methods "
    +"(admin_name,company_id,pay_method_id,name,inactive)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("pay_method_id_"+indek)+"'"
    +",'"+getEV("pay_method_name_"+indek)+"'"
    +",'"+getEC("pay_method_inactive_"+indek)+"'"
    +")"
  });
}

PayMethods.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM pay_methods "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND pay_method_id='"+bingkai[indek].pay_method_id+"' "
  },(paket)=>{
    if (paket.err.id==0) {
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('pay_method_id_'+indek, d.pay_method_id);
      setEV('pay_method_name_'+indek, d.name);
      setEC('pay_method_inactive_'+indek, d.inactive);
      statusbar.ready(indek);
      message.none(indek);
    }
    return callback();
  });
}

PayMethods.formUpdate=(indek,pay_method_id)=>{
  bingkai[indek].pay_method_id=pay_method_id;
  PayMethods.form.modeUpdate(indek);
}

PayMethods.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE pay_methods "
      +" SET name='"+getEV("pay_method_name_"+indek)+"', "
      +" inactive= "+getEC("pay_method_inactive_"+indek)+" "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND pay_method_id='"+bingkai[indek].pay_method_id+"' "
  },(p)=>{
    if(p.err.id==0) PayMethods.finalPath(indek);
  });
}

PayMethods.formDelete=(indek,pay_method_id)=>{
  bingkai[indek].pay_method_id=pay_method_id;
  PayMethods.form.modeDelete(indek);
}

PayMethods.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM pay_methods "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND pay_method_id='"+bingkai[indek].pay_method_id+"' "
  },(p)=>{
    if(p.err.id==0) PayMethods.finalPath(indek);
  });
}

PayMethods.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM pay_methods "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND pay_method_id LIKE '%"+bingkai[indek].text_search+"%' "
      +" OR name LIKE '%"+bingkai[indek].text_search+"%' "
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

PayMethods.search=(indek)=>{
  PayMethods.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT pay_method_id,name, "
        +" user_name,date_modified "
        +" FROM pay_methods "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND pay_method_id LIKE '%"+bingkai[indek].text_search+"%' "
        +" OR name LIKE '%"+bingkai[indek].text_search+"%' "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      PayMethods.readShow(indek);
    });
  });
}

PayMethods.exportExecute=(indek)=>{
  var table_name=PayMethods.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

PayMethods.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO pay_methods "
      +" (admin_name,company_id,pay_method_id,name,inactive)"
      +" VALUES "
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

PayMethods.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT pay_method_id,name,"
      +" user_name,date_modified"
      +" FROM pay_methods"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY pay_method_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    PayMethods.selectShow(indek);
  });
}

PayMethods.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</th>'
    +'<th colspan="2">Pay Method</th>'
    +'<th>Description</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'</tr>';

  if(p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<th align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
        +'</th>'
      +'<td align="center">'+n+'</td>'
      +'<td>'+d[x].pay_method_id+'</td>'
      +'<td>'+tHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

PayMethods.deleteAllExecute=(indek)=>{
  var e=document.getElementsByName('checked_'+indek);
  var d=bingkai[indek].paket.data;
  var a=[];
  
  for(var i=0;i<e.length;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM pay_methods "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND pay_method_id = '"+d[i][0]+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

PayMethods.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM pay_methods"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND pay_method_id='"+getEV('pay_method_id_'+indek)+"'"
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

PayMethods.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('pay_method_id_'+indek).value;
  document.getElementById('pay_method_id_'+indek).disabled=false;
  document.getElementById('pay_method_id_'+indek).value=id;
  document.getElementById('pay_method_id_'+indek).focus();
}

PayMethods.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{PayMethods.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{PayMethods.properties(indek);})
  }
}



// eof:312;283;259;371;363;361;377;419;425;431;428;
