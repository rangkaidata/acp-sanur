/*
 * name: budiono;
 * code: H5;
 * path: /accounting/purchases/vendor_checks.js;
 * --------------------------------------------;
 * date: nov 17, 06:44, fri-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jul-20, 11:13, sat-2024; r9;
 * edit: aug-09, 12:45, fri-2024; r11;
 * edit: sep-29, 08:52, sun-2024; r19;
 * edit: oct-08, 18:26, tue-2024; #20;
 * edit: nov-09, 13:05, sat-2024; #25;
 * edit: nov-28, 12:55, thu-2024; #27; add locker();
 * edit: dec-02, 15:55, mon-2024; #27;2;
 * edit: dec-18, 10:25, wed-2024; #31; properties;
 * edit: dec-29, 22:43, sun-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 22:03, mon-2025; #41; file_blok;
 * edit: mar-13, 17:04, thu-2025; #43; deep-folder;
 * edit: mar-26, 23:04, wed-2025; #45; ctables;cstructure;
 * edit: aug-16, 10:55, sat-2025; #68; 
 * edit: oct-26, 18:18, sun-2025; #80; 
 */

'use strict';

var VendorChecks={
  table_name:'vendor_checks',
}

VendorChecks.form=new ActionForm2(VendorChecks);
VendorChecks.vendor=new VendorLook(VendorChecks);
VendorChecks.account=new AccountLook(VendorChecks);
VendorChecks.job=new JobLook(VendorChecks);

VendorChecks.show=(karcis)=>{
  karcis.modul=VendorChecks.table_name;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      VendorChecks.getDefault(indek);
      VendorChecks.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

VendorChecks.getDefault=(indek)=>{
  VendorDefaults.getDefault(indek);
}

VendorChecks.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM vendor_checks"
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

VendorChecks.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  VendorChecks.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,check_no,amount,name,"
        +" cash_account_id, vendor_id,"
        +" user_name,date_modified"
        +" FROM vendor_checks "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,check_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VendorChecks.readShow(indek);
    });
  })
}

VendorChecks.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Date</th>'
      +'<th>Check #</th>'
      +'<th>Amount</th>'
      +'<th>Vendor Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].check_no+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="VendorChecks.formUpdate(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].check_no+'\');">'
          +'</button>'
          +'</td>'
          
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="VendorChecks.formDelete(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].check_no+'\');">'
          +'</button>'
          +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  VendorChecks.form.addPagingFn(indek);
}

VendorChecks.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"'
      +' style="margin-bottom:1rem;">'
      +'</div>'
      
    +'<form autocomplete="off">'

    +'<div'
      +' style="display:grid;'
      +'grid-template-columns:repeat(3,1fr);'
      +'margin-bottom:20px;">'
      
      +'<div style="padding-right:1rem;">'
        +'<ul>'
        +'<li><label>Vendor ID</label>'
          +'<input type="text"'
          +' id="vendor_id_'+indek+'"'
          +' size="15"'
          +' onchange="VendorChecks.getVendor(\''+indek+'\')">'
          
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="VendorChecks.vendor.getPaging(\''+indek+'\''
          +',\'vendor_id_'+indek+'\')">'
          +'</button>'
          +'</li>'
          
        +'<li><label>Name</label>'
          +'<input type="text"'
          +' id="name_'+indek+'">'
          +'</li>'
          
        +'<li><label>Address</label>'
          +'<input type="text"'
          +' id="street_1_'+indek+'">'
          +'</li>'
          
        +'<li><label>&nbsp;</label>'
          +'<input type="text"'
          +' id="street_2_'+indek+'">'
          +'</li>'
          
        +'<li><label>City</label>'
          +'<input type="text"'
          +' id="city_'+indek+'"'
          +' size="9">'
          +'</li>'
          
        +'<li><label>State</label>'
          +'<input type="text"'
          +' id="state_'+indek+'"'
          +' size="5">'
          +'</li>'
          
        +'<li><label>Zip</label>'
          +'<input type="text"'
          +' id="zip_'+indek+'"'
          +' size="5">'
          +'</li>'
          
        +'<li><label>Country</label>'
          +'<input type="text"'
          +' id="country_'+indek+'"'
          +' size="9">'
          +'</li>'
          
        +'<li><label>Memo</label>'
          +'<input type="text"'
          +' id="check_memo_'+indek+'"'
          +' size="9">'
          +'</li>'
        
        +'</ul>'
      +'</div>'
      
      +'<div style="padding-right:1rem;">'
        +'<ul>'
        +'<li><label>Check No.<i class="required"> *</i>'
          +'</label>&nbsp;<input type="text"'
          +' id="check_no_'+indek+'"'
          +' size="9">'
          +'</li>'
          
        +'<li><label>Date</label>&nbsp;'
          +'<input type="date"'
            +' id="check_date_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'check_date\')"'
            +' style="display:none;">'
          +'<input type="text"'
            +' id="check_date_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'check_date\')"'
            +' size="9">'
        +'</li>'
          
        +'<li><label>Amount</label>&nbsp;'
          +'<input type="text"'
          +' id="check_amount_'+indek+'"'
          +' onfocus="this.select()"'
          +' size="9"'
          +' style="text-align:center">'
          +'</li>'
          
        +'</ul>'
      +'</div>'
      
      +'<div style="padding-right:1rem;">'
        +'<label style="display:block;">'
          +'Cash Acc. ID<i class="required"> *</i>'
          +'</label>'
          
        +'<input type="text"'
        +' id="cash_account_id_'+indek+'"'
        +' onchange="VendorChecks.getAccount(\''+indek+'\''
        +',\'cash_account_id_'+indek+'\',\'cash\')"'
        +' size="9">'
        
        +'<button type="button"'
        +' id="btn_find"'
        +' onclick="VendorChecks.account.getPaging(\''+indek+'\''
        +',\'cash_account_id_'+indek+'\''
        +',-1'
        +',\''+CLASS_ASSET+'\')">'
        +'</button>'
        
        +'<br><input type="text"'
        +' id="cash_account_name_'+indek+'"'
        +' size="12"'
        +' disabled>'
      +'</div>'
    +'</div>'
    
    +'<div '
      +'style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;">'
      
    +'<div style="padding-right:1rem;">'
      +'<ul>'
      +'<li><label>Expense Acct. ID<i class="required"> *</i></label>'
        +'<input type="text"'
        +' id="expense_account_id_'+indek+'"'
        +' onchange="VendorChecks.getAccount(\''+indek+'\''
        +',\'expense_account_id_'+indek+'\',\'expense\')"'
        +' size="9">'
        
        +'<button type="button"'
        +' id="btn_find"'
        +' onclick="VendorChecks.account.getPaging(\''+indek+'\''
        +',\'expense_account_id_'+indek+'\''
        +',-1'
        +',\''+CLASS_EXPENSE+'\')">'
        +'</button>'
        
        +'<input type="text"'
        +' id="expense_account_name_'+indek+'"'
        +' size="12"'
        +' disabled>'
        +'</li>'

      +'</ul>'
    +'</div>'
    +'<div style="padding-right:1rem;">'
      +'<label>Job ID</label>'

        +'<input type="text"'
        +' id="job_phase_cost_'+indek+'"'
        +' size="20">'

        +'<button type="button"'
        +' id="btn_find"'
        +' onclick="VendorChecks.job.getPaging(\''+indek+'\''
        +',\'job_phase_cost_'+indek+'\')">'
        +'</button>'
    +'</div>'
    +'</div>'
    +'</form>'
    +'<p><i class="required">* Requred.</i></p>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);

  document.getElementById('vendor_id_'+indek).focus();
  document.getElementById('check_date_'+indek).value=tglSekarang();
  document.getElementById('check_date_fake_'+indek).value=tglWest(tglSekarang());

  VendorChecks.setDefault(indek);
}

VendorChecks.setVendor=(indek,data)=>{
  setEV('vendor_id_'+indek, data.vendor_id);
  VendorChecks.getVendor(indek);
}

VendorChecks.getVendor=(indek)=>{
  VendorChecks.vendor.getOne(indek,
    getEV('vendor_id_'+indek),
  (p)=>{
    if(p.err.id==0 && p.count>0){
      var d=objectOne(p.fields,p.data);
      var va=JSON.parse(d.address);

      setEV('name_'+indek, d.name);
      setEV('check_memo_'+indek, d.account);
      
      setEV('street_1_'+indek, va.street_1);
      setEV('street_2_'+indek, va.street_2);
      setEV('city_'+indek, va.city);
      setEV('state_'+indek, va.state);
      setEV('zip_'+indek, va.zip);
      setEV('country_'+indek, va.country);
    }
  });
}

VendorChecks.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].baris;

  setEV(id_kolom, d.account_id);
  VendorChecks.getAccount(indek, id_kolom, nama_kolom);
}

VendorChecks.getAccount=(indek,id_kolom,nama_kolom)=>{
  VendorChecks.account.getOne(indek,
    getEV(id_kolom),
  (paket)=>{
    let nm_account=undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data)
      nm_account=d.name;
    }
    switch(id_kolom){
      case "cash_account_id_"+indek:
        setEV('cash_account_name_'+indek, nm_account);
        break;
      case "expense_account_id_"+indek:
        setEV('expense_account_name_'+indek, nm_account);
        break;

      default:
        alert(id_kolom+' undefined!. ')
    }
  });
}

VendorChecks.setJob=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data);
}

VendorChecks.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  setEV('cash_account_id_'+indek, d.cash_account_id);
  setEV('cash_account_name_'+indek, d.cash_account_name);
  setEV('expense_account_id_'+indek, d.gl_account_id);
  setEV('expense_account_name_'+indek, d.gl_account_name);
}

VendorChecks.createExecute=(indek)=>{
  var address={
    "name":getEV("name_"+indek),
    "street_1":getEV("street_1_"+indek),
    "street_2":getEV("street_2_"+indek),
    "city":getEV("city_"+indek),
    "state":getEV("state_"+indek),
    "zip":getEV("zip_"+indek),
    "country":getEV("country_"+indek)
  }
  db.execute(indek,{
    query:"INSERT INTO vendor_checks"
      +"(admin_name,company_id,vendor_id,name,address,memo"
      +",check_no,date,amount"
      +",cash_account_id,expense_account_id,job_phase_cost)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("vendor_id_"+indek)+"'"
      +",'"+getEV("name_"+indek)+"'"
      +",'"+JSON.stringify(address)+"'"
      +",'"+getEV("check_memo_"+indek)+"'"
      +",'"+getEV("check_no_"+indek)+"'"
      +",'"+getEV("check_date_"+indek)+"'"
      +",'"+getEV("check_amount_"+indek)+"'"
      +",'"+getEV("cash_account_id_"+indek)+"'"
      +",'"+getEV("expense_account_id_"+indek)+"'"
      +",'"+getEV("job_phase_cost_"+indek)+"'"
      +")"
  });
}

VendorChecks.readOne=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM vendor_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"' "
      +" AND check_no='"+bingkai[indek].check_no+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      var d=objectOne(paket.fields,paket.data);
      var ca=JSON.parse(d.address);
      
      setEV("vendor_id_"+indek, d.vendor_id);
      setEV("name_"+indek, ca.name);
      setEV("street_1_"+indek, ca.street_1);
      setEV("street_2_"+indek, ca.street_2);
      setEV("city_"+indek, ca.city);
      setEV("state_"+indek, ca.state);
      setEV("zip_"+indek, ca.zip);
      setEV("country_"+indek, ca.country);
      
      setEV("check_memo_"+indek, d.memo);      
      setEV('check_no_'+indek, d.check_no);
      setEV('check_date_'+indek, d.date);
      setEV('check_amount_'+indek, d.amount);
      setEV("cash_account_id_"+indek, d.cash_account_id);
      setEV("cash_account_name_"+indek, d.cash_account_name);
      setEV("expense_account_id_"+indek, d.expense_account_id);
      setEV("expense_account_name_"+indek, d.expense_account_name);
      setEV("job_phase_cost_"+indek, d.job_phase_cost);      
      message.none(indek);
    }
    return callback();
  });
}

VendorChecks.formUpdate=(indek,cash_account_id,check_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].check_no=check_no;
  VendorChecks.form.modeUpdate(indek);
}

VendorChecks.updateExecute=(indek)=>{
  var address={
    "name":getEV("name_"+indek),
    "street_1":getEV("street_1_"+indek),
    "street_2":getEV("street_2_"+indek),
    "city":getEV("city_"+indek),
    "state":getEV("state_"+indek),
    "zip":getEV("zip_"+indek),
    "country":getEV("country_"+indek)
  }
  
  db.execute(indek,{
    query:"UPDATE vendor_checks "
      +" SET vendor_id='"+getEV("vendor_id_"+indek)+"', "
      +" name='"+getEV("name_"+indek)+"', "
      +" address='"+JSON.stringify(address)+"', "
      +" memo='"+getEV("check_memo_"+indek)+"', "
      +" check_no='"+getEV("check_no_"+indek)+"', "
      +" date='"+getEV("check_date_"+indek)+"', "
      +" amount='"+getEV("check_amount_"+indek)+"', "
      +" cash_account_id='"+getEV("cash_account_id_"+indek)+"', "
      +" expense_account_id='"+getEV("expense_account_id_"+indek)+"', "
      +" job_phase_cost='"+getEV("job_phase_cost_"+indek)+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"' "
      +" AND check_no='"+bingkai[indek].check_no+"' "
  },(p)=>{
    if(p.err.id==0) {
      bingkai[indek].cash_account_id=getEV("cash_account_id_"+indek);
      bingkai[indek].check_no=getEV("check_no_"+indek);
      VendorChecks.deadPath(indek);
    }
  });
}

VendorChecks.formDelete=(indek,cash_account_id,check_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].check_no=check_no;
  VendorChecks.form.modeDelete(indek);
}

VendorChecks.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM vendor_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"' "
      +" AND check_no='"+bingkai[indek].check_no+"' "
  },(p)=>{
    if(p.err.id==0) VendorChecks.deadPath(indek);
  });
}

VendorChecks.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM vendor_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND check_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

VendorChecks.search=(indek)=>{
  VendorChecks.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,check_no,amount,name,cash_account_id,"
        +" user_name,date_modified"
        +" FROM vendor_checks "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND check_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      VendorChecks.readShow(indek);
    });
  });
}

VendorChecks.exportExecute=(indek)=>{
  var table_name=VendorChecks.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

VendorChecks.importExecute=(indek)=>{
  var n=0;
  var m="<h4>Message Proccess:</h4>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO vendor_checks"
      +"(admin_name,company_id,vendor_id,name,address,memo"
      +",check_no,date,amount"
      +",cash_account_id,expense_account_id,job_phase_cost) "
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // vendor_id
      +",'"+d[i][2]+"'" // name
      +",'"+d[i][3]+"'" // address
      +",'"+d[i][4]+"'" // memo
      +",'"+d[i][5]+"'" // check_no
      +",'"+d[i][6]+"'" // date
      +",'"+d[i][7]+"'" // amount
      +",'"+d[i][8]+"'" // cash_account_id
      +",'"+d[i][9]+"'" // expense_account_id
      +",'"+d[i][10]+"'" // job_phase_cost
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

VendorChecks.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT date,check_no,amount,name,cash_account_id, "
      +" user_name,date_modified "
      +" FROM vendor_checks"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,check_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    VendorChecks.selectShow(indek);
  });
}

VendorChecks.selectShow=(indek)=>{
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
      +'<th colspan="2">Date</th>'
      +'<th>Check #</th>'
      +'<th>Amount</th>'
      +'<th>Name</th>'
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
        +' name="checked_'+indek+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+tglWest(d[x].date)+'</td>'
      +'<td align="left">'+d[x].check_no+'</td>'
      +'<td align="left">'+ribuan(d[x].amount)+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
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

VendorChecks.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM vendor_checks "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"' "
          +" AND check_no='"+d[i].check_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

VendorChecks.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM vendor_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"'"
      +" AND check_no='"+getEV('check_no_'+indek)+"' "
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

VendorChecks.duplicate=(indek)=>{
  var id='copy_of '+getEV('check_no_'+indek);
  setEV('check_no_'+indek,id);
  focus('check_no_'+indek);
}

VendorChecks.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VendorChecks.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VendorChecks.properties(indek);})
  }
}




// eof: 641;671;697;756;733;742;
