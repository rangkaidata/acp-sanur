/*
 * auth: budiono;
 * file: E9;
 * path: /accounting/ledgers/budgets.js;
 * ------------------------------------;
 * date: feb-19, 20:52, mon-2024; new;
 * edit: feb-22, 11:39, thu-2024; ok[?] ok[!] ok[.] ok[,]  
 * edit: jun-11, 21:09, tue-2024; BasicSQL; best;
 * edit: jun-26, 10:58, wed-2024; r3;
 * edit: aug-02, 20:42, fri-2024; r11;
 * edit: sep-12, 17:01, thu-2024; r19;
 * edit: nov-25, 16:19, mon-2024; #27; add locker;
 * edit: dec-01, 22:11, sun-2024; #27; 
 * edit: dec-26, 11:42, thu-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2024;
 * edit: feb-23, 08:59, sun-2025; #41; file_id;
 * edit: mar-11, 22:46, tue-2025; #43; deep-folder;
 * edit: mar-26, 00:39, wed-2025; #45; ctables;cstructure;
 * edit: oct-11, 15:23, sat-2025; #80; relation_vobj;
 */
 
'use strict';

var Budgets={};

Budgets.table_name='budgets';
Budgets.form=new ActionForm2(Budgets);
Budgets.account=new AccountLook(Budgets);

Budgets.show=(tiket)=>{
  tiket.modul=Budgets.table_name;
  tiket.bisa.tambah=0;

  var baru = exist(tiket);
  if(baru == -1) {
    var newReg = new BingkaiUtama(tiket);
    var indek = newReg.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,(h)=>{
        Budgets.form.modePaging(indek);
      });
    });
  } else {
    show(baru);
  }  
}

Budgets.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM budgets"
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

Budgets.readPaging=(indek)=>{
  Budgets.getPeriod(indek);
  bingkai[indek].metode=MODE_READ;
  Budgets.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id,account_name,account_class,allocate,"
        +" user_name,date_modified"
        +" FROM budgets"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY account_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Budgets.readShow(indek);
    });
  })
}

Budgets.getPeriod=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM period"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY start_date ASC"
  },(paket)=>{
    bingkai[indek].table={};
    if(paket.count>0){
      var d=objectMany(paket.fields,paket.data);
      bingkai[indek].budget_detail=d;
    }else{
      bingkai[indek].budget_detail=[];
    }
  });
}

Budgets.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +totalPagingandLimit(indek)
  +'<table border=1>'  
    +'<tr>'
      +'<th colspan="2">Account ID</th>'
      +'<th>Account Name</th>'
      +'<th>Account Class</th>'
      +'<th>Allocate</th>'
      +'<th>User Name</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>'  
  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].account_id+'</td>'
        +'<td align="left">'+xHTML(d[x].account_name)+'</td>'
        +'<td align="left">'+array_account_class[d[x].account_class]
          +'</td>'
        +'<td align="right">'+d[x].allocate+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="Budgets.formUpdate(\''+indek+'\''
          +',\''+d[x].account_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="Budgets.formDelete(\''+indek+'\''
          +',\''+d[x].account_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Budgets.form.addPagingFn(indek);
}

Budgets.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
      +'<ul>'
      +'<li><label>Account ID:</label>'
        +'<input type="text" '
        +' id="account_id_'+indek+'"'
        +' onchange="Budgets.getAccount(\''+indek+'\')"'
        +' size="15">'
        
        +'<button type="button" '
          +' id="account_btn_'+indek+'" class="btn_find"'
          +' onclick="Budgets.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,\''+CLASS_ALL+'\')">'
          +'</button>'
      +'</li>'
        
      +'<li><label>Account Name:</label>'
        +'<input type="text" disabled'
        +' id="account_name_'+indek+'"'
        +' size="30">'
      +'</li>'
    +'</ul>'
    
    +'<details open>'
      +'<summary>Periods</summary>'
      +'<div id="budget_detail_'+indek+'" style="width:0;"></div>'
    +'</details>'

    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode!=MODE_CREATE){
    document.getElementById('account_id_'+indek).disabled=true;
    document.getElementById('account_btn_'+indek).disabled=true;
    document.getElementById('account_name_'+indek).focus();
  }else{
    document.getElementById('account_id_'+indek).focus();
  }
  Budgets.setRows(indek,bingkai[indek].budget_detail);
}

Budgets.createExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].budget_detail);
  
  db.execute(indek,{
    query:"INSERT INTO budgets"
    +"(admin_name,company_id,account_id,detail)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV('account_id_'+indek)+"'"
    +",'"+detail+"'"
    +")"
  });
}

Budgets.setRows=(indek,isi)=>{
  var d=isi;
  var html=Budgets.tableHead(indek);
  
  bingkai[indek].budget_detail=isi;
  
  html+='<tr>';
  for(var i=0;i<d.length;i++){
    if(d[i].amount==undefined)d[i].amount=0;
    html+='<tr>'
      +'<td align="center"><i>'+tglWest(d[i].end_date)+'</i></td>'

      +'<td align="center">'
        +'<input type="text" '
        +' id="amount_'+i+'_'+indek+'"'
        +' value="'+d[i].amount+'"'
        +' onchange="Budgets.setCell(\''+indek+'\''
        +',\'amount_'+i+'_'+indek+'\')"'
        +' style="text-align:right" '
        +' size="8">'
      +'</td>'
    +'</tr>';
  }
  html+=Budgets.tableFoot(indek);
  document.getElementById('budget_detail_'+indek).innerHTML=html;
}

Budgets.tableHead=(indek)=>{
  return '<table border=0 >'
    +'<thead>'
      +'<tr>'
        +'<th>Period Ending</th>'
        +'<th>Amount</th>'
      +'</tr>'
    +'</thead>';
}

Budgets.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td colspan="2">&nbsp;</td>'
    +'</tr>'
    +'<tr>'
    +'<td align="center"><big>Allocate:</big></td>'    
    +'<td>'
      +'<input type="text" disabled'
      +' id="budget_allocate_'+indek+'" '
      +' style="text-align:center;"'
      +' size="8">'
    +'</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Budgets.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.account_id);
  Budgets.getAccount(indek);
}

Budgets.getAccount=(indek)=>{
  message.none(indek);
  Budgets.account.getOne(indek,
    getEV('account_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('account_name_'+indek, d.name);
    }else{
      setEV('account_name_'+indek, '');
    }
  });
}

Budgets.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].budget_detail;
  var baru=[];
  var isiEdit={};
  var sum_amount=0;

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('end_date_'+i+'_'+indek)){
      isiEdit.end_date=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('amount_'+i+'_'+indek)){
      isiEdit.amount=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
    sum_amount+=parseFloat(baru[i].amount || 0);
  }
  document.getElementById('budget_allocate_'+indek).value=sum_amount;
  bingkai[indek].budget_detail=isi;
}

Budgets.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM budgets "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+bingkai[indek].account_id+"' "
  },(paket)=>{
    if (paket.err.id==0) {
      var d=objectOne(paket.fields,paket.data);
      setEV('account_id_'+indek, d.account_id);
      setEV('account_name_'+indek, d.account_name);
      Budgets.setRows(indek, JSON.parse(d.detail) );
      setEV('budget_allocate_'+indek, d.allocate);
      message.none(indek);
    }else{
      Budgets.setRows(indek,[]);    
    }
    return callback();
  });
}

Budgets.formUpdate=function(indek,account_id){
  bingkai[indek].account_id=account_id;
  Budgets.form.modeUpdate(indek);
}

Budgets.updateExecute=function(indek){

  var detail=JSON.stringify(bingkai[indek].budget_detail);

  db.execute(indek,{
    query:"UPDATE budgets"
      +" SET detail='"+detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+bingkai[indek].account_id+"' "
  },(p)=>{
    if(p.err.id==0) Budgets.endPath( indek );
  });
}

Budgets.formDelete=function(indek,account_id){
  bingkai[indek].account_id=account_id;
  Budgets.form.modeDelete(indek);
}

Budgets.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM budgets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+bingkai[indek].account_id+"'"
  },(p)=>{
    if(p.err.id==0) Budgets.endPath( indek );
  });
}

Budgets.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM budgets"
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

Budgets.search=(indek)=>{
  Budgets.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id,account_name,account_class,allocate,"
        +" user_name,date_modified"
        +" FROM budgets"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR account_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Budgets.readShow(indek);
    });
  });
}

Budgets.exportExecute=(indek)=>{
  var table_name=Budgets.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Budgets.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO budgets"
      +"(admin_name,company_id,account_id,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Budgets.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT account_id,account_name,account_class,allocate,"
      +" user_name,date_modified"
      +" FROM budgets "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY account_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Budgets.selectShow(indek);
  });
}

Budgets.selectShow=(indek)=>{
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
      +'<th colspan="2">Account ID</th>'
      +'<th>Account Name</th>'
      +'<th>Account Class</th>'
      +'<th>Allocate</th>'
      +'<th>User Name</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>'  
  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<th align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
        +'</th>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+d[x].account_id+'</td>'
        +'<td align="left">'+xHTML(d[x].account_name)+'</td>'
        +'<td align="left">'+array_account_class[d[x].account_class]+'</td>'
        +'<td align="right">'+d[x].allocate+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Budgets.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM budgets "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND account_id='"+d[i].account_id+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

Budgets.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM budgets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+getEV('account_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Budgets.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('account_id_'+indek).value;
  document.getElementById('account_id_'+indek).value=id;
  document.getElementById('account_id_'+indek).focus();
  // disabled;
  document.getElementById('account_id_'+indek).disabled=false;
  document.getElementById('account_btn_'+indek).disabled=false;
}

Budgets.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Budgets.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Budgets.properties(indek);})
  }
}




// eof: 418;508;503;516;527;571;564;567;574;

