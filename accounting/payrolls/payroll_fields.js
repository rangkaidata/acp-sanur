/*
 * name: budiono;
 * date: jun-02, 15:09, mon-2025; #57; payroll_fields;
 */

'use strict';

var PayrollFields={}
  
PayrollFields.table_name='payroll_fields';
PayrollFields.form=new ActionForm2(PayrollFields);
PayrollFields.account=new AccountLook(PayrollFields);

PayrollFields.show=(tiket)=>{
  tiket.modul=PayrollFields.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath(indek,PayrollFields.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        PayrollFields.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

PayrollFields.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM payroll_fields"
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

PayrollFields.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  PayrollFields.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT field_name,description,class"
        +",user_name,date_modified"
        +" FROM payroll_fields"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY field_name"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      PayrollFields.readShow(indek);
    });
  })
}

PayrollFields.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Field Name</th>'
      +'<th>Description</th>'
      +'<th>Class</th>'
      
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].field_name+'</td>'
      +'<td align="left">'+xHTML(d[x].description)+'</td>'
      +'<td align="left">'+array_payroll_field_class[d[x].class]+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="PayrollFields.formUpdate(\''+indek+'\''
        +',\''+d[x].field_name+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="PayrollFields.formDelete(\''+indek+'\''
        +',\''+d[x].field_name+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  PayrollFields.form.addPagingFn(indek);// #here
}

PayrollFields.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Field Name:</label>'
      +'<input type="text" '
      +' id="field_name_'+indek+'"'
      +' size="15"></li>'
      
    +'<li><label>Description:</label>'
      +'<input type="text"'
      +' id="description_'+indek+'"'
      +' size="30"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="inactive_'+indek+'">'
      +'Inactive</label>'
      +'</li>'
      
    +'<li><label>Class:</label>'
      +'<select id="class_'+indek+'" '
        +' onchange="PayrollFields.clickClass(\''+indek+'\')">'
        +getPayrollFieldClass(indek)
      +'</select>'
      +'</li>'
      
    +'<li><label>Liability Acc. ID:</label>'
      +'<input type="text" '
      +' id="liability_account_id_'+indek+'"'
      +' size="9">'
      
      +'<button type="button" class="btn_find" '
        +' id="liability_account_btn_'+indek+'" '
        +' onclick="PayrollFields.account.getPaging(\''+indek+'\''
        +',\'liability_account_id_'+indek+'\',-1'
        +',\''+CLASS_LIABILITY+'\');">'
      +'</button>'
      
      +'<input type="text" '
      +' id="liability_account_name_'+indek+'" disabled>'
      +'</li>'
      
    +'<li><label>Expense Acc. ID:</label>'
      +'<input type="text" '
      +' id="expense_account_id_'+indek+'"'
      +' size="9">'

      +'<button type="button" class="btn_find" '
        +' id="expense_account_btn_'+indek+'" '
        +' onclick="PayrollFields.account.getPaging(\''+indek+'\''
        +',\'expense_account_id_'+indek+'\',-1'
        +',\''+CLASS_EXPENSE+'\');">'
      +'</button>'
      
      +'<input type="text" '
      +' id="expense_account_name_'+indek+'" disabled>'
      +'</li>'
      
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('field_name_'+indek).focus();
  }else{
    document.getElementById('field_name_'+indek).disabled=true;
    document.getElementById('description_'+indek).focus();
  }
  PayrollFields.clickClass(indek,0);
}

PayrollFields.clickClass=(indek)=>{
  var id=document.getElementById('class_'+indek).selectedIndex;
  switch(id){
    case 0:// expense
      PayrollFields.disabledLiability(indek,true);
      PayrollFields.disabledExpense(indek,false);
      break;
    case 1:// liability
      PayrollFields.disabledLiability(indek,false);
      PayrollFields.disabledExpense(indek,true);
      break;
    case 2:// expense and liability
      PayrollFields.disabledLiability(indek,false);
      PayrollFields.disabledExpense(indek,false);
      break;
    case 3:// no account
      PayrollFields.disabledLiability(indek,true);
      PayrollFields.disabledExpense(indek,true);
      break;
    default:
  }
}

PayrollFields.disabledLiability=(indek,b)=>{
  setEV('liability_account_id_'+indek,"");
  setEV('liability_account_name_'+indek,"");
  disabled('liability_account_id_'+indek,b);
  disabled('liability_account_btn_'+indek,b);
}

PayrollFields.disabledExpense=(indek,b)=>{
  setEV('expense_account_id_'+indek,"");
  setEV('expense_account_name_'+indek,"");
  disabled('expense_account_id_'+indek,b);
  disabled('expense_account_btn_'+indek,b);
}

PayrollFields.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO payroll_fields "
      +"(admin_name,company_id"
      +",field_name,description"
      +",inactive,class"
      +",liability_account_id,expense_account_id)"
      +" VALUES"
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("field_name_"+indek)+"'"
      +",'"+getEV("description_"+indek)+"'"
      +",'"+getEC("inactive_"+indek)+"'"
      +",'"+getEI("class_"+indek)+"'"
      +",'"+getEV("liability_account_id_"+indek)+"'"
      +",'"+getEV("expense_account_id_"+indek)+"'"
      +")"
  });
}

PayrollFields.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM payroll_fields"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND field_name='"+bingkai[indek].field_name+"'"
  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEI('class_'+indek, d.class);
      PayrollFields.clickClass(indek);

      setEV('field_name_'+indek, d.field_name );
      setEV('description_'+indek, d.description);
      setEC('inactive_'+indek, d.inactive);
      setEV('liability_account_id_'+indek, d.liability_account_id);
      setEV('liability_account_name_'+indek, d.liability_account_name);
      setEV('expense_account_id_'+indek, d.expense_account_id);
      setEV('expense_account_name_'+indek, d.expense_account_name);
      
      disabled('class_'+indek,true);//lock class;
      
      message.none(indek);
    }
    return callback();
  });
}

PayrollFields.formUpdate=(indek,field_name)=>{
  bingkai[indek].field_name=field_name;
  PayrollFields.form.modeUpdate(indek);
}

PayrollFields.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE payroll_fields "
      +" SET description='"+getEV("description_"+indek) +"',"
      +" inactive='"+getEC("inactive_"+indek)+"',"
      +" liability_account_id='"+getEV("liability_account_id_"+indek)+"',"
      +" expense_account_id='"+getEV("expense_account_id_"+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND field_name='"+bingkai[indek].field_name+"'"
  },(p)=>{
    if(p.err.id==0) PayrollFields.finalPath(indek);
  });
}

PayrollFields.formDelete=(indek,field_name)=>{
  bingkai[indek].field_name=field_name;
  PayrollFields.form.modeDelete(indek);
}

PayrollFields.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM payroll_fields"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND field_name='"+bingkai[indek].field_name+"'"
  },(p)=>{
    if(p.err.id==0) PayrollFields.finalPath(indek);
  });
}

PayrollFields.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM PayrollFields "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND field_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

PayrollFields.search=(indek)=>{
  PayrollFields.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT field_name,description,class,"
        +" user_name,date_modified "
        +" FROM payroll_fields"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND field_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      PayrollFields.readShow(indek);
    });
  });
}

PayrollFields.exportExecute=(indek)=>{
  var table_name=PayrollFields.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

PayrollFields.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT field_name,description,class,"
      +" user_name,date_modified"
      +" FROM payroll_fields"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY field_name"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    PayrollFields.selectShow(indek);
  });
}

PayrollFields.selectShow=(indek)=>{
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
      +'<th colspan="2">Field Name</th>'
      +'<th>Description</th>'
      +'<th>Class</th>'
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
      +'<td align="left">'+d[x].field_name+'</td>'
      +'<td align="left">'+xHTML(d[x].description)+'</td>'
      +'<td align="left">'+array_payroll_field_class[d[x].class]+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

PayrollFields.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM payroll_fields"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND field_name='"+d[i].field_name+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

PayrollFields.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO payroll_fields "
        +" (admin_name,company_id,field_name,description,inactive,"
        +" class,liability_account_id,expense_account_id)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +",'"+d[i][3]+"'"
        +",'"+d[i][4]+"'"
        +",'"+d[i][5]+"'"
        +",'"+d[i][6]+"'"
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

PayrollFields.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('field_name_'+indek).value;
  document.getElementById('field_name_'+indek).disabled=false;
  document.getElementById('field_name_'+indek).value=id;
  document.getElementById('field_name_'+indek).focus();
}

PayrollFields.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,field_name"
      +" FROM payroll_fields "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND field_name='"+getEV('field_name_'+indek)+"' "
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        PayrollFields.table_name,"/",
        d.company_id,"/",
        d.field_name);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

PayrollFields.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{PayrollFields.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{PayrollFields.properties(indek);})
  }
}

PayrollFields.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom, data.account_id);
  PayrollFields.getAccount(indek,id_kolom,nama_kolom);
}

PayrollFields.getAccount=(indek,id_kolom)=>{
  var isi={};

  PayrollFields.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    var nm_account=txt_undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields, paket.data);
      nm_account=d.name;
    }

    switch(id_kolom){
      case "gl_account_id_"+indek:
        setEV('gl_account_name_'+indek, nm_account);
        break;
      case "liability_account_id_"+indek:
        setEV('liability_account_name_'+indek, nm_account);
        break;
      case "expense_account_id_"+indek:
        setEV('expense_account_name_'+indek, nm_account);
        break;

      default:
        alert('column ['+id_kolom+'] undefined. ')
    }
  });
}



//eof:553;
