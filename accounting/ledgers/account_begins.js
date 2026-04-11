/*
 * auth: budiono;
 * file: F1;
 * path: /accounting/ledgers/account_begins.js;
 * -------------------------------------------;
 * date: sep-27, 13:44, wed-2023; new;
 * edit: oct-04, 12:25, wed-2023; xHTML;
 * edit: dec-23, 17:14, sat-2023; 
 * -----------------------------; happy new year 2024;
 * edit: jan-10, 21:20, wed-2024; 
 * edit: jun-12, 17:19, wed-2024; BasicSQL;
 * edit: jul-04, 11:46, thu-2024; r4;
 * edit: jul-06, 11:43, sat-2024; r7;
 * edit: aug-03, 10:35, sat-2024; r11;
 * edit: sep-13, 10:14, fri-2024; r19; 
 * edit: nov-25, 16:44, mon-2024; #27; add locker;
 * edit: dec-26, 12:15, thu-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 11:17, sun-2025; #41; file_id;
 * edit: mar-12, 14:32, wed-2025; #43; deep-folder;
 * edit: mar-22, 13:44, sat-2025; #44; my_menu;remove title;
 * edit: mar-26, 12:24, wed-2025; #45; ctables;cstructure;
 * edit: apr-20, 16:49, sun-2025; #50; download_csv;
 */ 

'use strict';

var AccountBegins={};

AccountBegins.table_name='account_begins';
AccountBegins.form=new ActionForm2(AccountBegins);
AccountBegins.account=new AccountLook(AccountBegins);

AccountBegins.show=(tiket)=>{
  tiket.modul=AccountBegins.table_name;
  tiket.bisa.tambah=0;

  var baru=exist(tiket);
  if(baru==-1){
    var form=new BingkaiUtama(tiket);
    var indek=form.show();
    createFolder(indek,()=>{
      AccountBegins.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

AccountBegins.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  AccountBegins.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id,account_name,account_class,debit,credit,"
        +" user_name,date_modified"
        +" FROM account_begins "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY account_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      AccountBegins.readShow(indek);
    });
  })
}

AccountBegins.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*),SUM(debit) as debit,SUM(credit) as credit"
      +" FROM account_begins "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].debit_amt=paket.data[0][1];
      bingkai[indek].credit_amt=paket.data[0][2];
    }
    return callback()
  });
}

AccountBegins.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var debit_amt=bingkai[indek].debit_amt;
  var credit_amt=bingkai[indek].credit_amt;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +totalPagingandLimit(indek)
  +'<table border=1>'
    +'<th colspan="2">Account ID</th>'
    +'<th>Account Name</th>'
    +'<th>Account Class</th>'
    +'<th>Debit</th>'
    +'<th>Credit</th>'
    +'<th colspan="2">Action</th>';

  if (p.err.id===0){
    var x;
    for (x in d){
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].account_id+'</td>'
      +'<td align="left">'+xHTML(d[x].account_name)+'</td>'
      +'<td align="center">'+array_account_class[d[x].account_class]+'</td>'
      +'<td align="center">'+d[x].debit+'</td>'
      +'<td align="center">'+d[x].credit+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="AccountBegins.formUpdate(\''+indek+'\''
        +' ,\''+d[x].account_id+'\');">'
        +'</button>'
        +'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="AccountBegins.formDelete(\''+indek+'\''
        +',\''+d[x].account_id+'\');">'
        +'</button>'
        +'</td>'
      +'</tr>';
    }
  }
  html+='<tr>'
      +'<td colspan="3">&nbsp;</td>'
      +'<td align="center"><strong>Total:</strong></td>'
      +'<td align="center"><strong>'+debit_amt+'</strong></td>'
      +'<td align="center"><strong>'+credit_amt+'</strong></td>'
      +'<td colspan="2">&nbsp;</td>'
    +'</tr>';
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  AccountBegins.form.addPagingFn(indek);
}

AccountBegins.formEntry=(indek,metode)=>{ // #4.1
  bingkai[indek].metode=metode;
  
  var html='<form autocomplete="off">'
    +'<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<ul>'
    +'<li><label>Account ID:</label>'
      +'<input type="text"'
      +' id="account_id_'+indek+'"'
      +' onchange="AccountBegins.getAccount(\''+indek+'\')"'
      +' size="20">'
      
      +'<button type="button" '
        +' id="account_btn_'+indek+'" class="btn_find"'
        +' onclick="AccountBegins.account.getPaging(\''+indek+'\''
        +',\'account_id_'+indek+'\',-1'
        +',\''+CLASS_ALL+'\');">'
        +'</button>'
      +'</li>'
      
    +'<li><label>Account Name:</label>'
      +'<input type="text" id="account_name_'+indek+'" disabled>'
      +'</li>'
      
    +'<li><label>Account Class:</label>'
      +'<select id="account_class_'+indek+'" disabled>'
      +getDataAccountClass(indek)
      +'</select></li>'

    +'<li><label>Debit:</label>'
      +'<input type="text" '
      +' id="begin_debit_'+indek+'" '
      +' onfocus="this.select();"'
      +' style="text-align:right;"'
      +' size="8"></li>'
      
    +'<li><label>Credit:</label>'
      +'<input type="text" '
      +' id="begin_credit_'+indek+'" '
      +' onfocus="this.select();"'
      +' style="text-align:right;"'
      +' size="8"></li>'
  +'</ul>'
   +'</form>'
  +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode==MODE_CREATE){
    document.getElementById('account_id_'+indek).focus();
  }else{
    document.getElementById('account_id_'+indek).disabled=true;
    document.getElementById('account_btn_'+indek).disabled=true;
  }
}

AccountBegins.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.account_id);
  AccountBegins.getAccount(indek);
}

AccountBegins.getAccount=(indek)=>{//#4.3
  message.none(indek);
  AccountBegins.account.getOne(indek,
    getEV('account_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('account_name_'+indek, d.name);
      setEV('account_class_'+indek, d.class);
    }else{
      setEV('account_name_'+indek, '');
      setEV('account_class_'+indek, '');
    }
  });
}

AccountBegins.createExecute=(indek)=>{

  db.execute(indek,{
    query:"INSERT INTO account_begins"
    +"(admin_name,company_id,account_id,debit,credit)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV('account_id_'+indek)+"'"
    +",'"+getEV('begin_debit_'+indek)+"'"
    +",'"+getEV('begin_credit_'+indek)+"'"
    +")"
  })
}

AccountBegins.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT account_id,account_name,account_class,debit,credit"
      +" FROM account_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+bingkai[indek].account_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('account_id_'+indek,d.account_id);
      setEV('account_name_'+indek,d.account_name);
      setEI('account_class_'+indek,d.account_class);
      setEV('begin_debit_'+indek,d.debit);
      setEV('begin_credit_'+indek,d.credit);
      message.none(indek);
    }
    statusbar.ready(indek);
    return callback();
  });
}

AccountBegins.formUpdate=(indek,account_id)=>{
  bingkai[indek].account_id=account_id;
  AccountBegins.form.modeUpdate(indek);
}

AccountBegins.updateExecute=(indek)=>{

  db.execute(indek,{
    query:"UPDATE account_begins "
      +" SET debit='"+getEV("begin_debit_"+indek)+"', "
      +" credit='"+getEV("begin_credit_"+indek)+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+bingkai[indek].account_id+"'"
  },(p)=>{
    if(p.err.id==0) AccountBegins.endPath( indek);
  });
}

AccountBegins.formDelete=(indek,account_id)=>{
  bingkai[indek].account_id=account_id;
  AccountBegins.form.modeDelete(indek);
}

AccountBegins.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM account_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+bingkai[indek].account_id+"'"
  },(p)=>{
    if(p.err.id==0) AccountBegins.endPath( indek);
  });
}

AccountBegins.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM account_begins "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR account_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

AccountBegins.search=(indek)=>{
  AccountBegins.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id,account_name,account_class,debit,credit,"
        +" user_name,date_modified"
        +" FROM account_begins "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR account_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      AccountBegins.readShow(indek);
    });
  });
}

AccountBegins.exportExecute=(indek)=>{
  var table_name=AccountBegins.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

AccountBegins.importExecute=(indek)=>{
  var n=0,
    m="<p>[Start]</p>",
    o={},
    d=bingkai[indek].dataImport.data,
    j=d.length;
 
  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO account_begins"
      +"(admin_name,company_id,account_id,debit,credit)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // account_id
      +",'"+d[i][2]+"'" // debit
      +",'"+d[i][3]+"'"
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

AccountBegins.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT account_id,account_name,account_class,debit,credit,"
      +" user_name, date_modified"
      +" FROM account_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY account_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    AccountBegins.selectShow(indek);
  });
}

AccountBegins.selectShow=(indek)=>{
  var p=bingkai[indek].paket
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<table border=1>'
    +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
    +'</td>'
    +'<th colspan="2">Account ID</th>'
    +'<th>Account Name</th>'
    +'<th>Account Class</th>'
    +'<th>Debit</th>'
    +'<th>Credit</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'

  if (p.err.id===0){
    var x;
    for (x in d){
      n++;
      html+='<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'" >'
      +'</td>'
      +'<td align="left">'+n+'</td>'
      +'<td align="left">'+d[x].account_id+'</td>'
      +'<td align="left">'+xHTML(d[x].account_name)+'</td>'
      +'<td align="center">'+array_account_class[d[x].account_class]+'</td>'
      +'<td align="center">'+d[x].debit+'</td>'
      +'<td align="center">'+d[x].credit+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+d[x].date_modified+'</td>'
      
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

AccountBegins.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM account_begins"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND account_id='"+d[i].account_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

AccountBegins.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,account_id,date_created"
      +" FROM account_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+getEV('account_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        AccountBegins.table_name,"/",
        d.company_id,"/",
        d.account_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

AccountBegins.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('account_id_'+indek).value;
  document.getElementById('account_id_'+indek).value=id;
  document.getElementById('account_id_'+indek).focus();
  //--disabled;
  document.getElementById('account_id_'+indek).disabled=false;
  document.getElementById('account_btn_'+indek).disabled=false;
}

AccountBegins.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{AccountBegins.form.lastMode(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{AccountBegins.properties(indek);})
  }
}




// EOF: 394;330;305;417;422;418;433;447;483;481;491;
