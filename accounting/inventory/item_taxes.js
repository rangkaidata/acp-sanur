/*
 * name: budiono;
 * date: sep-04, 19:22, mon-2023; new;308;324;
 * edit: sep-19, 21:20, tue-2023; 
 * edit: dec-31, 17:32, sun-2023; di-ringkas;
 * -----------------------------; happy new year 2024;
 * edit: feb-01, 20:26, thu-2024; mringkas;
 * edit: apr-02, 11:49, tue-2024; Basic SQL;
 * edit: apr-22, 20:46, mon-2024; tambah search;
 * edit: jun-23, 11:27, sun-2024; revisi-i;
 * edit: jul-27, 06:20, sat-2024; r-11;
 * edit: sep-10, 12:32, tue-2024; r-18;
 * edit: dec-21, 14:22, sun-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-14, 16:20, fri-2025; #40; new properties;
 * edit: mar-10, 22:29, mon-2025; #43; deep folder;
 * edit: mar-25, 13:55, tue-2025; #45; ctables,cstructure;
 * edit: apr-24, 22:21, thu-2025; #50; export csv;
 */ 

'use strict';

var ItemTaxes={};

ItemTaxes.table_name='taxes';
ItemTaxes.form=new ActionForm2(ItemTaxes);

ItemTaxes.show=(tiket)=>{
  tiket.modul=ItemTaxes.table_name;

  var baru=exist(tiket);
  if(baru==-1){
    var newItm=new BingkaiUtama(tiket);
    var indek=newItm.show();
    createFolder(indek,()=>{
      ItemTaxes.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

ItemTaxes.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM taxes "
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

ItemTaxes.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ItemTaxes.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT tax_id,name,calculate,"
        +" user_name,date_modified "
        +" FROM taxes "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY tax_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ItemTaxes.readShow(indek);
    });
  })
}

ItemTaxes.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
      +'<tr>'
        +'<th colspan="2">Tax ID</th>'
        +'<th>Description</th>'
        +'<th>Taxable</th>'
        +'<th>User</th>'
        +'<th>Modified</th>'
        +'<th colspan="2">Action</th>'
      +'</tr>';

  if (p.err.id===0){
    var checked='';
    for (var x in d) {
      n++;
      if(d[x].calculate==1){
        checked="&check;";
      }else{
        checked="";
      }
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].tax_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'+checked+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="ItemTaxes.formUpdate(\''+indek+'\''
          +',\''+d[x].tax_id+'\');"></button>'
          +'</td>'
        +'<td class="rata-tengah">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="ItemTaxes.formDelete(\''+indek+'\''
          +',\''+d[x].tax_id+'\');"></button>'
          +'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ItemTaxes.form.addPagingFn(indek);
}

ItemTaxes.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Item Tax ID</label>'
      +'<input type="text" '
      +' id="tax_id_'+indek+'"></li>'
      
    +'<li><label>Description</label>'
      +'<input type="text" '
      +' id="tax_name_'+indek+'"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox" '
        +' id="tax_inactive_'+indek+'">Inactive'
      +'</label>'
      +'</li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox" '
      +' id="tax_calculate_'+indek+'" checked>With Tax</label>'
      +'</li>'
      
    +'</ul>'
    +'</form>'
    +'</div>';
    
  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode==MODE_CREATE){
    document.getElementById('tax_id_'+indek).focus();
  }else{
    document.getElementById('tax_id_'+indek).disabled=true;
    document.getElementById('tax_name_'+indek).focus();
    document.getElementById('tax_calculate_'+indek).disabled=true;
  }
}

ItemTaxes.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO taxes"
      +"(admin_name,company_id,tax_id,name,inactive,calculate) "
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("tax_id_"+indek)+"'"
      +",'"+getEV("tax_name_"+indek)+"'"
      +",'"+getEC("tax_inactive_"+indek)+"'"
      +",'"+getEC("tax_calculate_"+indek)+"'"
      +")"
  });
}

ItemTaxes.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM taxes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND tax_id='"+bingkai[indek].tax_id+"'"
  },(paket)=>{
    if (paket.err.id==0) {
      var d=objectOne( paket.fields,paket.data );
      setEV('tax_id_'+indek, d.tax_id);
      setEV("tax_name_"+indek, d.name);
      setEC('tax_inactive_'+indek, d.inactive);
      setEC('tax_calculate_'+indek, d.calculate);
      message.none(indek);
    }
    return callback();
  });
}

ItemTaxes.formUpdate=(indek,tax_id)=>{
  bingkai[indek].tax_id=tax_id;
  ItemTaxes.form.modeUpdate(indek);
}

ItemTaxes.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE taxes "
      +" SET name='"+getEV("tax_name_"+indek)+"', "
      +" inactive="+getEC("tax_inactive_"+indek) +" "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND tax_id='"+bingkai[indek].tax_id+"'"
  },(p)=>{
    if(p.err.id==0) ItemTaxes.finalPath(indek);
  });
}

ItemTaxes.formDelete=(indek,tax_id)=>{
  bingkai[indek].tax_id=tax_id;
  ItemTaxes.form.modeDelete(indek);
}

ItemTaxes.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM taxes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND tax_id='"+bingkai[indek].tax_id+"'"
  },(p)=>{
    if(p.err.id==0) ItemTaxes.finalPath(indek);
  });
}

ItemTaxes.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM taxes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND tax_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ItemTaxes.search=(indek)=>{
  ItemTaxes.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT tax_id, name, calculate,"
        +" user_name,date_modified"
        +" FROM taxes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND tax_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ItemTaxes.readShow(indek);
    });
  });
}

ItemTaxes.exportExecute=(indek)=>{
  var sql={
    "select": "company_id,tax_id,name,inactive,calculate",
    "from": "taxes",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'taxes');
}

ItemTaxes.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;  
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO taxes "
      +" (admin_name,company_id,tax_id,name,inactive,calculate) "
      +" VALUES"
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

ItemTaxes.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT tax_id, name, calculate,"
      +" user_name,date_modified"
      +" FROM taxes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY tax_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ItemTaxes.selectShow(indek);
  });
}

ItemTaxes.selectShow=(indek)=>{
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
        +'<th colspan="2">Tax ID</th>'
        +'<th>Description</th>'
        +'<th>Taxable</th>'
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
          +' value="'+d[x].tax_id+'">'
          +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+xHTML(d[x].tax_id)+'</td>'  
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'+d[x].calculate+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

ItemTaxes.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var a=[];
  
  for(var i=0;i<e.length;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM taxes"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND tax_id = '"+d[i].tax_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

ItemTaxes.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,tax_id,date_created"
      +" FROM taxes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND tax_id='"+getEV('tax_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        ItemTaxes.table_name,"/",
        d.company_id,"/",d.tax_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

ItemTaxes.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('tax_id_'+indek).value;
  document.getElementById('tax_id_'+indek).disabled=false;
  document.getElementById('tax_id_'+indek).value=id;
  document.getElementById('tax_id_'+indek).focus();
}

ItemTaxes.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ItemTaxes.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ItemTaxes.properties(indek);})
  }
}



// eof: 308;324;281;352;390;383;385;397;443;447;444;
