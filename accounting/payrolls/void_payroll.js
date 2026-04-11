/*
 * name: budiono;
 * date: jan-07, 17:33, wed-2026; #87; 
 */
 
'use strict';

var VoidPayroll={}

VoidPayroll.table_name='void_payroll';
VoidPayroll.title="Void Payroll";
VoidPayroll.form=new ActionForm2(VoidPayroll);
VoidPayroll.payroll=new PayrollLook(VoidPayroll);

VoidPayroll.show=(tiket)=>{
  tiket.modul=VoidPayroll.table_name;
  tiket.menu.name=VoidPayroll.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    createFolder(indek,()=>{
      VoidPayroll.form.modePaging(indek);
    });
  }else{
    show(baru);
  }  
}


VoidPayroll.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM void_payroll"
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

VoidPayroll.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  VoidPayroll.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,void_no,date,employee_name,"
        +"payroll_amount,"
        +"user_name,date_modified"
        +" FROM void_payroll "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VoidPayroll.readShow(indek);
    });
  })
}

VoidPayroll.readShow=(indek)=>{
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
      +'<th>Name</th>'
      +'<th>Amount</th>'
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
        +'<td align="left">'+d[x].employee_name+'</td>'
        +'<td align="right">'+d[x].payroll_amount+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="VoidPayroll.formDelete(\''+indek+'\''
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
  if(READ_PAGING) VoidPayroll.form.addPagingFn(indek);
}

VoidPayroll.formEntry=(indek,metode)=>{

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
        +'<li><label>Payroll No.</label>'
          +'<input type="text"'
          +' id="payroll_no_'+indek+'"'
          +' size="9"'
          +' disabled>'
              +'<button type="button" class="btn_find" '
              +' id="payroll_btn_'+indek+'"'
              +' onclick="VoidPayroll.payroll.getPaging(\''+indek+'\''
              +',\'payroll_no_'+indek+'\',-1)">'
              +'</button>'
          +'</li>'

        +'<li><label>Payroll Date</label>'
          +'<input type="text"'
          +' id="payroll_date_'+indek+'"'
          +' size="9"'
          +' disabled>'
          +'</li>'
        +'<li><label>Amount</label>'
          +'<input type="text"'
          +' id="payroll_amount_'+indek+'"'
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
  
  if(metode==MODE_CREATE){
    // nothing
  } else {
    document.getElementById('payroll_btn_'+indek).disabled=true;
  }
}

VoidPayroll.setPayroll=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

//  setEV(id_kolom, data.payment_no );
  setEV('cash_account_id_'+indek, data.cash_account_id );
  setEV('payroll_no_'+indek, data.payroll_no );
  setEV('payroll_date_'+indek, tglWest(data.payroll_date) );
  setEV('payroll_amount_'+indek, data.payroll_amount);
  
  setEV('void_no_'+indek, data.payroll_no+'V');
  setEV('void_date_'+indek, tglSekarang());
  setEV('void_note_'+indek, 'some note void...');
}

VoidPayroll.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO void_payroll"
      +"(admin_name,company_id"
      +",cash_account_id,payroll_no,void_no,date,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('cash_account_id_'+indek)+"'"
      +",'"+getEV('payroll_no_'+indek)+"'"
      +",'"+getEV('void_no_'+indek)   +"'"
      +",'"+getEV('void_date_'+indek) +"'"
      +",'"+getEV('void_note_'+indek) +"'"
      +")"
  });
}

VoidPayroll.readOne=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM void_payroll"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      
      setEV('cash_account_id_'+indek,d.cash_account_id);      
      setEV('void_no_'+indek, d.void_no);
      setEV('void_date_'+indek, d.date);
      setEV('void_date_fake_'+indek, tglWest(d.date));
      setEV('void_note_'+indek, d.note);

      setEV('payroll_no_'+indek,d.payroll_no);
      setEV('payroll_date_'+indek,tglWest(d.payroll_date) );
      setEV('payroll_amount_'+indek, d.payroll_amount);
      
      message.none(indek);
    }
    return callback();
  });
}

VoidPayroll.formDelete=(indek,cash_account_id,void_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].void_no=void_no;
  VoidPayroll.form.modeDelete(indek);
}

VoidPayroll.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM void_payroll"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
  },(p)=>{
    if(p.err.id==0) VoidPayroll.deadPath(indek);
  });
}

VoidPayroll.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VoidPayroll.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VoidPayroll.properties(indek);})
  }
}

VoidPayroll.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM void_payroll "
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

VoidPayroll.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT void_no,date,payroll_amount,employee_name,cash_account_id, "
      +" user_name,date_modified"
      +" FROM void_payroll"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,void_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    VoidPayroll.selectShow(indek);
  });
}


VoidPayroll.selectShow=(indek)=>{
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
    +'<th>Name</th>'
    +'<th>Amount</th>'
    
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
        +'<td align="left">'+d[x].employee_name+'</td>'
        +'<td align="right">'+d[x].payroll_amount+'</td>'
        
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

VoidPayroll.deleteAllExecute=(indek)=>{
  const r=bingkai[indek].paket;
  const d=objectMany(r.fields,r.data);
  const e=document.getElementsByName('checked_'+indek);
  const c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM void_payroll "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"' "
          +" AND void_no='"+d[i].void_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
} 


// eof:

/*




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

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO void_payments"
      +"(admin_name,company_id,void_no,date,note,"
      +" cash_account_id,payment_no) "
      +" VALUES"
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'" 
      +",'"+d[i][1]+"'" // void_no
      +",'"+d[i][2]+"'" // date
      +",'"+d[i][3]+"'" // note
      +",'"+d[i][4]+"'" // cash_account_id
      +",'"+d[i][5]+"'" // payment_no
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
  
  if(j==0){
    document.getElementById('btn_import_all_'+indek).disabled=false;
    toolbar.wait(indek,END);
    statusbar.ready(indek);
  }
}












// eof: 375;333;439;492;494;495;499;496;

 */ 
