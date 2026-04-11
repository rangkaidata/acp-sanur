/*
 * name: budiono;
 * date: may-02, 14:16, fri-2025; #53; base currency;
 */ 

'use strict';

var Currencies={}
  
Currencies.table_name='currencies';
Currencies.form=new ActionForm2(Currencies);

Currencies.show=(tiket)=>{
  tiket.modul=Currencies.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Currencies.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Currencies.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM currencies"
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

Currencies.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Currencies.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT currency_id,name,base,"
        +" user_name,date_modified"
        +" FROM currencies"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY currency_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Currencies.readShow(indek);
    });
  })
}

Currencies.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Currency ID</th>'
      +'<th>Description</th>'
      +'<th>Base Currency</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    let check='';
    for (var x in d) {
      check="";
      if(d[x].base==1) check='&check;';
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].currency_id+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+check+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="Currencies.formUpdate(\''+indek+'\''
        +',\''+d[x].currency_id+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Currencies.formDelete(\''+indek+'\''
        +',\''+d[x].currency_id+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Currencies.form.addPagingFn(indek);// #here
}

Currencies.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html='<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    
    +'<ul>'
    
    +'<li><label>Currency ID:</label>'
      +'<input type="text" '
      +' id="currency_id_'+indek+'"'
      +' size="9"></li>'
      
    +'<li><label>Description:</label>'
      +'<input type="text"'
      +' id="name_'+indek+'"'
      +' size="30"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="inactive_'+indek+'">Inactive</label>'
      +'</li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox" '
      +' id="base_'+indek+'">Base Currency</label>'
      +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('currency_id_'+indek).focus();
  }else{
    document.getElementById('currency_id_'+indek).disabled=true;
    document.getElementById('name_'+indek).focus();
  }
}

Currencies.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO currencies "
    +"(admin_name,company_id,currency_id,name,inactive,base)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("currency_id_"+indek)+"'"
    +",'"+getEV("name_"+indek)+"'"
    +",'"+getEC("inactive_"+indek)+"'"
    +",'"+getEI("base_"+indek)+"'"
    +")"
  });
}

Currencies.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM currencies"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+bingkai[indek].currency_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('currency_id_'+indek, d.currency_id );
      setEV('name_'+indek, d.name);
      setEC('inactive_'+indek, d.inactive);
      setEC('base_'+indek, d.base);
      message.none(indek);
    }
    return callback();
  });
}

Currencies.formUpdate=(indek,currency_id)=>{
  bingkai[indek].currency_id=currency_id;
  Currencies.form.modeUpdate(indek);
}

Currencies.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE currencies "
      +" SET name='"+getEV("name_"+indek) +"',"
      +" inactive='"+getEC("inactive_"+indek)+"',"
      +" base='"+getEC("base_"+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+bingkai[indek].currency_id+"'"
  },(p)=>{
    if(p.err.id==0) Currencies.finalPath(indek);
  });
}

Currencies.formDelete=(indek,currency_id)=>{
  bingkai[indek].currency_id=currency_id;
  Currencies.form.modeDelete(indek);
}

Currencies.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM currencies"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+bingkai[indek].currency_id+"'"
  },(p)=>{
    if(p.err.id==0) Currencies.finalPath(indek);
  });
}

Currencies.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM currencies"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Currencies.search=(indek)=>{
  Currencies.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT currency_id,name,inactive,base,"
        +" user_name,date_modified "
        +" FROM currencies"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND currency_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Currencies.readShow(indek);
    });
  });
}

Currencies.exportExecute=(indek)=>{
  var sql={
    "select": "company_id,currency_id,name,inactive,base",
    "from": "currencies",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'currencies');
}

Currencies.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT currency_id,name,base,"
      +" user_name,date_modified"
      +" FROM currencies"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY currency_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Currencies.selectShow(indek);
  });
}

Currencies.selectShow=(indek)=>{
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
      +'<th colspan="2">Currency ID</th>'
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
        +' value="'+d[x].currency_id+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].currency_id+'</td>'
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

Currencies.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM currencies"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND currency_id = '"+d[i].currency_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Currencies.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO currencies "
        +" (admin_name,company_id,currency_id,name,inactive,base) "
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

Currencies.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('currency_id_'+indek).value;
  document.getElementById('currency_id_'+indek).disabled=false;
  document.getElementById('currency_id_'+indek).value=id;
  document.getElementById('currency_id_'+indek).focus();
}

Currencies.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,currency_id,date_created"
      +" FROM currencies "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+getEV('currency_id_'+indek)+"' "
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Currencies.table_name,"/",
        d.company_id,"/",
        d.currency_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Currencies.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Currencies.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Currencies.properties(indek);})
  }
}




//eof: 420;
