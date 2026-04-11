/*
 * auth: budiono;
 * code: H4;
 * path: accounting/purchases/void_payments.js;
 * -------------------------------------------;
 * date: nov-16, 17:22, thu-2023; new;
 * -----------------------------; hapyy new year 2024;
 * edit: jan-21, 22:54, sun-2024; mringkas;
 * edit: jul-18, 16:55, thu-2024; r9;
 * edit: sep-28, 15:48, sat-2024; r19;
 * edit: nov-28, 12:27, thu-2024; #27; add locker();
 * edit: dec-02, 15:51, mon-2024; #27;2;
 * edit: dec-18, 09:56, wed-2024; #31; properties;
 * edit: dec-29, 22:31, sun-2024; #32; +properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 17:57, mon-2025; #41; file_id;
 * edit: mar-13, 16:31, thu-2025; #43; deep-folder;
 * edit: mar-26, 22:58, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:43, thu-2025; #50; can export to CSV;
 * edit: aug-16, 10:48, sat-2025; #68; date obj;
*/

'use struct';

var VoidPayments={}

VoidPayments.table_name='void_payments';
VoidPayments.form=new ActionForm2(VoidPayments);
VoidPayments.payment=new PaymentLook(VoidPayments);
VoidPayments.hideSaveAs=true;

VoidPayments.show=(karcis)=>{

  karcis.modul=VoidPayments.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      VoidPayments.getDefault(indek);
      VoidPayments.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

VoidPayments.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
}

VoidPayments.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM void_payments"
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

VoidPayments.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  VoidPayments.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT void_no,date,amount,name,cash_account_id,"
        +" user_name,date_modified"
        +" FROM void_payments "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VoidPayments.readShow(indek);
    });
  })
}

VoidPayments.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table>'
    +'<tr>'
      +'<th colspan="2">Void #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x
    for(x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].void_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="VoidPayments.formDelete(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].void_no+'\');">'
          +'</button>'
          +'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  if(READ_PAGING) VoidPayments.form.addPagingFn(indek);
}

VoidPayments.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  
  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"'
    +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off">'
    
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;">'
      
      +'<div>'      
        +'<ul>'
        +'<li><label>Payment No.</label>'
          +'<input type="text"'
          +' id="payment_no_'+indek+'"'
          +' size="9"'
          +' disabled>'
              +'<button type="button" id="btn_find" '
              +' onclick="VoidPayments.payment.getPaging(\''+indek+'\''
              +',\'payment_no_'+indek+'\',-1)">'
              +'</button>'
          +'</li>'

        +'<li><label>Payment Date</label>'
          +'<input type="text"'
          +' id="payment_date_'+indek+'"'
          +' size="9"'
          +' disabled>'
          +'</li>'
        +'<li><label>Amount</label>'
          +'<input type="text"'
          +' id="payment_amount_'+indek+'"'
          +' disabled'
          +' size="9"'
          +' style="text-align:center;">'
          +'</li>'
          
        +'<li><label>Cash Acc. ID</label>'
          +'<input type="text" '
          +' id="cash_account_id_'+indek+'"'
          +'  size="9"'
          +' disabled>'
          +'</li>'
        +'</ul>'
      +'</div>'
      
      +'<div>'
        +'<ul>'
          +'<li><label>Void No.</label>'
            +'<input type="text"'
            +' id="void_no_'+indek+'"'
            +' size="9">'
          +'</li>'
          +'<li><label>Date</label>'
            +'<input type="date" '
              +' id="void_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'void_date\')"'
              +' style="display:none;">'
            +'<input type="text" '
              +' id="void_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'void_date\')"'
              +' size="9">'
          +'</li>'
          +'<li><label>Note:</label>'
            +'<input type="text"'
            +' id="void_note_'+indek+'"'
            +' size="20">'
          +'</li>'
        +'</ul>'
      +'</div>'

    +'</div>'
    +'</form>'
  +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('void_no_'+indek).focus();
  document.getElementById('void_date_'+indek).value=tglSekarang();
  document.getElementById('void_date_fake_'+indek).value=tglWest(tglSekarang());
  
  if(metode=MODE_CREATE) VoidPayments.setDefault(indek);
}

VoidPayments.setDefault=(indek)=>{
  
}

VoidPayments.setPayment=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom, data.payment_no );
  setEV('cash_account_id_'+indek, data.cash_account_id );
  setEV('payment_date_'+indek, tglWest(data.date) );
  setEV('payment_amount_'+indek, data.amount);
  
  setEV('void_no_'+indek, data.payment_no+'V');
  setEV('void_date_'+indek, data.date);
  setEV('void_note_'+indek, 'some note void...');
}

VoidPayments.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO void_payments"
      +"(admin_name,company_id"
      +",cash_account_id,payment_no,void_no,date,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('cash_account_id_'+indek)+"'"
      +",'"+getEV('payment_no_'+indek)+"'"
      +",'"+getEV('void_no_'+indek)   +"'"
      +",'"+getEV('void_date_'+indek) +"'"
      +",'"+getEV('void_note_'+indek) +"'"
      +")"
  });
}

VoidPayments.readOne=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM void_payments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('void_no_'+indek, d.void_no);
      setEV('void_date_'+indek, d.date);
      setEV('void_date_fake_'+indek, tglWest(d.date));
      setEV('void_note_'+indek, d.note);

      setEV('payment_no_'+indek,d.payment_no);
      setEV('payment_date_'+indek,tglWest(d.payment_date) );
      setEV('payment_amount_'+indek, d.amount);
      setEV('cash_account_id_'+indek,d.cash_account_id);      
      message.none(indek);
    }
    return callback();
  });
}

VoidPayments.formDelete=(indek,cash_account_id,void_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].void_no=void_no;
  VoidPayments.form.modeDelete(indek);
}

VoidPayments.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM void_payments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
  },(p)=>{
    if(p.err.id==0) VoidPayments.deadPath(indek);
  });
}

VoidPayments.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM void_payments "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND void_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

VoidPayments.search=(indek)=>{
  VoidPayments.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT void_no,date,amount,name,cash_account_id,"
        +" user_name,date_modified"
        +" FROM void_payments"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND void_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      VoidPayments.readShow(indek);
    });
  });
}

VoidPayments.exportExecute=(indek)=>{
  var table_name=VoidPayments.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

VoidPayments.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var jok=0,jerr=0;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO void_payments"
      +"(admin_name,company_id"
      +",cash_account_id,payment_no"
      +",void_no,date,note"
      +") "
      +" VALUES"
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'" 
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +",'"+d[i][3]+"'"
      +",'"+d[i][4]+"'"
      +",'"+d[i][5]+"'"
      +")"
    },(paket)=>{  
      paket.err.id==0?jok++:jerr++;
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar2(indek,n,j,m,jok,jerr);
    });
  }
  
  if(j==0){
    document.getElementById('btn_import_all_'+indek).disabled=false;
    toolbar.wait(indek,END);
    statusbar.ready(indek);
  }
}

VoidPayments.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT void_no,date,amount,name,cash_account_id, "
      +" user_name,date_modified"
      +" FROM void_payments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,void_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    VoidPayments.selectShow(indek);
  });
}

VoidPayments.selectShow=(indek)=>{
  const p=bingkai[indek].paket;
  const d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<table>'
  +'<tr>'
    +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
    +'</td>'
    +'<th colspan="2">Void #</th>'
    +'<th>Date</th>'
    +'<th>Amount</th>'
    +'<th>Vendor/Payee</th>'
    +'<th>Owner</th>'
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
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].void_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'
          +Number(d[x].amount).toFixed(2)+'</td>'
        +'<td align="left">'+d[x].name+'</td>'
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

VoidPayments.deleteAllExecute=(indek)=>{
  const r=bingkai[indek].paket;
  const d=objectMany(r.fields,r.data);
  const e=document.getElementsByName('checked_'+indek);
  const c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM void_payments "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"' "
          +" AND void_no='"+d[i].void_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
} 

VoidPayments.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM void_payments "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"' "
      +" AND void_no='"+getEV('void_no_'+indek)+"' "
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

VoidPayments.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VoidPayments.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VoidPayments.properties(indek);})
  }
}




// eof: 375;333;439;492;494;495;499;496;
