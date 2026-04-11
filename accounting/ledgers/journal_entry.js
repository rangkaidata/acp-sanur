/*
 * auth: budiono;
 * code: G1;
 * path: /accounting/ledgers/journal_entry.js;
 * ------------------------------------------;
 * date: oct-12, 09:08, thu-2023; new;
 * edit: oct-19, 22:04, thu-2023; xHTML;
 * -----------------------------; happy new year 2024;
 * edit: jan-12, 09:26, fri-2024; re-write w class;
 * edit: jun-19, 17:29, wed-2024; BasicSQL;
 * edit: jul-09, 10:26, tue-2024; r7;
 * edit: aug-05, 15:46, mon-2024; r11;
 * edit: sep-25, 09:37, thu-2024; r19;
 * edit: nov-26, 14:39, tue-2024; #27; add locker();
 * edit: dec-01, 14:10, mon-2024; #27;
 * edit: dec-27, 15:06, fri-2024; #32; properties+duplicate; 
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 18:16, sun-2025; #41; file_id;
 * edit: mar-13, 07:06, thu-2025; #43; deep-folder;
 * edit: mar-26, 13:06, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:55, thu-2025; #50; export to csv;
 * edit: aug-18, 17:15, mon-2025; #68; 
 * edit: oct-13, 21:01, mon-2025; #80; relation_vobj;
 */ 

'use strict';

var JournalEntry={};

JournalEntry.table_name='journal_entry';
JournalEntry.form=new ActionForm2(JournalEntry);
JournalEntry.account=new AccountLook(JournalEntry);
JournalEntry.job=new JobLook(JournalEntry);
JournalEntry.grid=new Grid(JournalEntry);

JournalEntry.show=(tiket)=>{
  tiket.modul=JournalEntry.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var form=new BingkaiUtama(tiket);
    var indek=form.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        JournalEntry.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

JournalEntry.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM journal_entry"
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

JournalEntry.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  JournalEntry.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date, journal_no, amount, description, "
        +" user_name,date_modified"
        +" FROM journal_entry"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY journal_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      JournalEntry.readShow(indek);
    });
  })
}

JournalEntry.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table border=1>'
      +'<tr>'
      +'<th colspan="2">Date</th>'
      +'<th>Ref.</th>'
      +'<th>Amount</th>'
      +'<th>Description</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].journal_no+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+xHTML(strN(d[x].description,30))+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change" '
          +' onclick="JournalEntry.formUpdate(\''+indek+'\''
          +',\''+d[x].journal_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="JournalEntry.formDelete(\''+indek+'\''
          +',\''+d[x].journal_no+'\');"></button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);

  if(p.err.id!=0) content.infoPaket(indek,p);
  JournalEntry.form.addPagingFn(indek);
}

JournalEntry.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul style="display:inline-block;">'
/*    
    +'<li><label>Company ID <i class="required">*</i></label>'
      +'<input type="text" disabled '
      +' value="'+bingkai[indek].company.id+'"'
      +' size="12">'
*/      
    +'<li><label>Date</label>'
      +'<input type="date" '
        +' id="journal_date_'+indek+'"'
        +' onblur="dateFakeShow('+indek+',\'journal_date\')"'
        +' style="display:none;">'
      +'<input type="text" '
        +' id="journal_date_fake_'+indek+'"'
        +' onfocus="dateRealShow('+indek+',\'journal_date\')"'
        +' size="9">'
    +'</li>'
      
    +'<li><label>Journal #<i class="required">*</i></label>'
      +'<input type="text" '
      +' id="journal_no_'+indek+'">'
    +'</li>'
      
    +'<li><label>&nbsp;</label>'
    +'<textarea id="journal_note_'+indek+'"'
      +' cols=50 rows=5 '
      +' style="resize:none;"'
      +' spellcheck=false '
      +' placeholder="Note or memo...">'
      +'</textarea></li>'
    
    +'</ul>'
    +'<details open>'
      +'<summary>Journal details</summary>'
      +'<div id="page_detail_'+indek+'" '
      +' style="overflow-y:auto;">'
      +'</div>'
    +'</details>'
    +'</form>'
    +'<p><i class="required">* Required</i></p>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);

  document.getElementById('journal_no_'+indek).focus();
  document.getElementById('journal_date_'+indek).value=tglSekarang();
  document.getElementById('journal_date_fake_'+indek).value=tglWest(tglSekarang());
  
  JournalEntry.setRows(indek,[]);
}

JournalEntry.setRows=(indek,isi)=>{
  if(isi==undefined)isi=[];
  bingkai[indek].journal_detail=isi;
  
  var panjang=isi.length;
  var html=JournalEntry.TabelHead(indek);
  var sum_debit=0;
  var sum_credit=0;
  var is_balance=0;
  
  for (let i=0;i<panjang;i++){
    html+='<tr>'
      +'<td style="margin:0;padding:0;">'+(i+1)+'</td>'
      +'<td style="margin:0;padding:0;">'
        +'<input type="text" id="account_id_'+i+'_'+indek+'" '
          +' value="'+isi[i].account_id+'" '
          +' onchange="JournalEntry.setCell(\''+indek+'\''
          +',\'account_id_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" '
          +' size="12">'
      +'</td>'
      +'<td style="margin:0;padding:0;">'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="JournalEntry.account.getPaging(\''+indek+'\''
          +',\'account_id_'+i+'_'+indek+'\',\''+i+'\''
          +',\''+CLASS_ALL+'\');">'
        +'</button>'
      +'</td>'
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" id="description_'+i+'_'+indek+'" '
          +' value="'+isi[i].description+'"'
          +' onchange="JournalEntry.setCell(\''+indek+'\''
          +',\'description_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()"'
          +' size="30" >'
      +'</td>'
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" '
          +' id="debit_'+i+'_'+indek+'" '
          +' value="'+isi[i].debit+'" '
          +' size="8" '
          +' style="text-align:right" '
          +' onchange="JournalEntry.setCell(\''+indek+'\''
          +',\'debit_'+i+'_'+indek+'\')"  '
          +' onfocus="this.select()" >'
      +'</td>'
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="credit_'+i+'_'+indek+'"'
          +' value="'+isi[i].credit+'"'
          +' size="8" '
          +' style="text-align:right" '
          +' onchange="JournalEntry.setCell(\''+indek+'\''
          +',\'credit_'+i+'_'+indek+'\')"'
          +' onfocus="this.select()" >'
      +'</td>'
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="job_phase_cost_'+i+'_'+indek+'"'
          +' value="'+isi[i].job_phase_cost+'" '
          +' size="8"'
          +' onchange="JournalEntry.setCell(\''+indek+'\''
          +',\'job_phase_cost_'+i+'_'+indek+'\')"'
          +' onfocus="this.select()">'
      +'</td>'
      +'<td  style="padding:0;margin:0;">'
        +'<button type="button" '
          +' id="btn_find"'
          +' onclick="JournalEntry.job.getPaging(\''+indek+'\''
          +',\'job_phase_cost_'+i+'_'+indek+'\');">'
        +'</button>'
      +'</td>'
      +'<td  style="padding:0;margin:0;">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="JournalEntry.addRow(\''+indek+'\','+i+')" >'
          +'</button>'
        +'<button type="button"'
          +' id="btn_remove"'
          +' onclick="JournalEntry.removeRow(\''+indek+'\','+i+')" >'
          +'</button>'
      +'</td>'
    +'</tr>';
    sum_debit+=parseFloat(isi[i].debit);
    sum_credit+=parseFloat(isi[i].credit);
  }
  html+=JournalEntry.TabelFoot(indek);
  var budi = JSON.stringify(isi);

  document.getElementById('page_detail_'+indek).innerHTML=html;
  bingkai[indek].sum_debit=sum_debit;
  bingkai[indek].sum_credit=sum_credit;
  JournalEntry.calculate(indek);

  if(panjang==0) JournalEntry.addRow(indek,0);
}

JournalEntry.TabelHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="3">Account ID&nbsp;<i class="required">*</i></th>'
    +'<th>Decription</th>'
    +'<th>Debit</th>'
    +'<th>Credit</th>'
    +'<th colspan="2">Job</th>'
    +'<th>Action</th>'
    +'</tr>'
    +'</thead>';
}

JournalEntry.TabelFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan=4 style="text-align:right;">Totals:</td>'
    +'<td style="text-align:right;font-weight:bolder;" '
      +' id="sum_debit_'+indek+'">0.00</td>'
    +'<td style="text-align:right;font-weight:bolder;" '
      +' id="sum_credit_'+indek+'">0.00</td>'
    +'<td colspan="4">&nbsp;</td>'
    +'</tr>'
    +'<tr>'
    +'<td colspan="4" style="text-align:right;">Out of Balance:</td>'
    +'<td style="text-align:right;font-weight:bolder;" '
      +' id="is_balance_'+indek+'">0.00</td>'
    +'<td colspan="5">&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

JournalEntry.calculate=(indek)=>{
  setiH('sum_debit_'+indek, bingkai[indek].sum_debit);
  setiH('sum_credit_'+indek, bingkai[indek].sum_credit);
  setiH(
    'is_balance_'+indek, 
    Number(bingkai[indek].sum_debit)-Number(bingkai[indek].sum_credit)
  );
}

JournalEntry.addRow=(indek,baris)=>{
  JournalEntry.grid.addRow(indek,baris,bingkai[indek].journal_detail);
}

JournalEntry.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.account_id='';
  myItem.description='';
  myItem.debit=0;
  myItem.credit=0;
  myItem.job_phase_cost='';
  newBasket.push(myItem);
}

JournalEntry.removeRow=(indek,baris)=>{
  JournalEntry.grid.removeRow(indek,baris,bingkai[indek].journal_detail);
}

JournalEntry.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  document.getElementById(id_kolom).value=data.account_id;
  JournalEntry.setCell(indek,id_kolom);  
}

JournalEntry.getAccount=(indek,baris)=>{
  JournalEntry.account.getOne(indek,
    getEV('account_id_'+baris+'_'+indek),
  (paket)=>{
    setEV('description_'+baris+'_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('description_'+baris+'_'+indek, d.name);
    }
    JournalEntry.setCell(indek,'description_'+baris+'_'+indek);
  });
}

JournalEntry.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].journal_detail;
  var baru = [];
  var isiEdit = {};
  
  var sum_debit=0;
  var sum_credit=0;

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('account_id_'+i+'_'+indek)){
      isiEdit.account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      JournalEntry.getAccount(indek,i);
      
    }else if(id_kolom==('description_'+i+'_'+indek)){
      isiEdit.description=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('debit_'+i+'_'+indek)){
      isiEdit.debit=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('credit_'+i+'_'+indek)){
      isiEdit.credit=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    sum_debit+=parseFloat(baru[i].debit);
    sum_credit+=parseFloat(baru[i].credit);

  }
  bingkai[indek].journal_detail=isi;
  bingkai[indek].sum_debit=sum_debit;
  bingkai[indek].sum_credit=sum_credit;
  JournalEntry.calculate(indek);
}

JournalEntry.setJob=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data);
  JournalEntry.setCell(indek,id_kolom);
}

JournalEntry.createExecute=(indek)=>{

  var journal_detail=JSON.stringify(bingkai[indek].journal_detail);

  db.execute(indek,{
    query:"INSERT INTO journal_entry"
    +"(admin_name,company_id"
    +",journal_no,date,description,detail)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("journal_no_"+indek)+"'"
    +",'"+getEV("journal_date_"+indek)+"'"
    +",'"+getEV("journal_note_"+indek)+"'"
    +",'"+journal_detail+"'"
    +")"
  });
}

JournalEntry.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM journal_entry "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_no='"+bingkai[indek].journal_no+"' "
  },(paket)=>{
    if(paket.err.id==0 || paket.count>0) {
      var d=objectOne(paket.fields,paket.data);
      setEV("journal_date_"+indek, d.date);
      setEV("journal_date_fake_"+indek, tglWest(d.date));
      setEV("journal_no_"+indek, d.journal_no);
      setEV("journal_note_"+indek, d.description);
      JournalEntry.setRows(indek, JSON.parse (d.detail) ) ;
      message.none(indek);
    }
    return callback();
  });
}

JournalEntry.formUpdate=(indek,journal_no)=>{
  bingkai[indek].journal_no=journal_no;
  JournalEntry.form.modeUpdate(indek);
}

JournalEntry.updateExecute=(indek)=>{

  var journal_detail=JSON.stringify(bingkai[indek].journal_detail);

  db.execute(indek,{
    query:"UPDATE journal_entry "
      +" SET journal_no='"+getEV("journal_no_"+indek)+"', "
      +" date='"+getEV("journal_date_"+indek)+"', "
      +" description='"+getEV("journal_note_"+indek)+"', "
      +" detail='"+journal_detail+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_no='"+bingkai[indek].journal_no+"' "
  },(p)=>{
    if(p.err.id==0) JournalEntry.finalPath(indek);
  });  
}

JournalEntry.formDelete=(indek,journal_no)=>{
  bingkai[indek].journal_no=journal_no;
  JournalEntry.form.modeDelete(indek);
}

JournalEntry.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM journal_entry "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_no='"+bingkai[indek].journal_no+"'"
  },(p)=>{
    if(p.err.id==0) JournalEntry.finalPath(indek);
  });
}

JournalEntry.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM journal_entry "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR detail LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

JournalEntry.search=(indek)=>{
  JournalEntry.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date, journal_no, description, amount, "
        +" user_name,date_modified"
        +" FROM journal_entry"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND journal_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR detail LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      JournalEntry.readShow(indek);
    });
  });
}

JournalEntry.exportExecute=(indek)=>{
  var table_name=JournalEntry.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

JournalEntry.importExecute=function(indek){
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<d.length;i++){
    db.run(indek,{
      query:"INSERT INTO journal_entry"
      +"(admin_name,company_id,"
      +"journal_no,date,description,detail)"
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

JournalEntry.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT journal_no,date,description,amount,"
      +" user_name,date_modified"
      +" FROM journal_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,journal_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    JournalEntry.selectShow(indek);
  });
}

JournalEntry.selectShow=(indek)=>{
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
      +'<th colspan="2">Date</th>'
      +'<th>Ref.</th>'
      +'<th>Amount</th>'
      +'<th>Description</th>'
      +'<th>User</th>'
      +'<th colspan="2">Modified</th>'
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
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].journal_no+'</td>'
        +'<td align="right">'+formatSerebuan(d[x].amount)+'</td>'
        +'<td align="left">'+xHTML(str10(d[x].description))+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek, p);
}

JournalEntry.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({  
        query:"DELETE FROM journal_entry "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND journal_no = '"+d[i].journal_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

JournalEntry.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM journal_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_no='"+getEV('journal_no_'+indek)+"'"
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

JournalEntry.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('journal_no_'+indek).value;
  document.getElementById('journal_no_'+indek).value=id;
  document.getElementById('journal_no_'+indek).focus();
  //--disabled
  document.getElementById('journal_no_'+indek).disabled=false;
}

JournalEntry.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{JournalEntry.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{JournalEntry.properties(indek);})
  }
}




// eof: 577;514;628;642;660;699;702;709;706;715;

