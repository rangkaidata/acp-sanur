/*
 * auth: budiono;
 * code: J4;
 * path: /accounting/time_and_expense/expense_tickets.js;
 * -----------------------------------------------------;
 * date: feb-05, 11:58, mon-2024; new;
 * edit: aug-24, 19:34, sat-2024; r13; 
 * edit: oct-07, 21:25, mon-2024; #20;
 * edit: oct-30, 20:33, wed-2024; #24;
 * edit: nov-29, 11:16, fri-2024; #27; add locker();
 * -----------------------------; happy new year 2025;
 * edit: jan-01, 22:14, wed-2025; #32; properties+duplicate;
 * edit: feb-26, 16:30, wed-2025; #41; file_id;
 * edit: mar-15, 18:03, sat-2025; #43; deep-folder;
 * edit: mar-27, 13:34, thu-2025; #45; ctables;cstructure;
 * edit: aug-18, 20:06, mon-2025; #68; date obj;
 * edit: nov-12, 14:53, wed-2025; #80; 
*/

'use strict';

var ExpenseTickets={}

ExpenseTickets.table_name='expense_tickets';
ExpenseTickets.form=new ActionForm2(ExpenseTickets);
ExpenseTickets.employee=new EmployeeLook(ExpenseTickets);
ExpenseTickets.vendor=new VendorLook(ExpenseTickets);
ExpenseTickets.item=new ChargeItemLook(ExpenseTickets);
ExpenseTickets.customer=new CustomerLook(ExpenseTickets);
ExpenseTickets.job=new JobLook(ExpenseTickets);

ExpenseTickets.show=(karcis)=>{
  karcis.modul=ExpenseTickets.table_name;
  karcis.child_free=false;

  var baru=exist(karcis);
  if(baru==-1){
    var newCus=new BingkaiUtama(karcis);
    var indek=newCus.show();
    createFolder(indek,()=>{
      ExpenseTickets.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

ExpenseTickets.getDefault=(indek)=>{
  
}

ExpenseTickets.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM expense_tickets"
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

ExpenseTickets.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ExpenseTickets.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,ticket_no,billing_amount,record_name,"
        +" user_name,date_modified"
        +" FROM expense_tickets"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,ticket_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ExpenseTickets.readShow(indek);
    });
  })
}

ExpenseTickets.readShow=(indek)=>{
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
      +'<th>Ticket #</th>'
      +'<th>Name</th>'
      +'<th>Billing Amount</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tglEast(d[x].date)+'</td>'
        +'<td align="left">'+d[x].ticket_no+'</td>'
        +'<td align="left">'+d[x].record_name+'</td>'
        +'<td align="right">'+(d[x].billing_amount)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="ExpenseTickets.formUpdate(\''+indek+'\''
          +',\''+d[x].ticket_no+'\');">'
          +'</button></td>'
          
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="ExpenseTickets.formDelete(\''+indek+'\''
          +',\''+d[x].ticket_no+'\');">'
          +'</button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ExpenseTickets.form.addPagingFn(indek);
}

ExpenseTickets.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>'
      +'<select id="recordby_mode_'+indek+'"'
        +' onchange="ExpenseTickets.changeRecordByMode(\''+indek+'\')">'
        +getDataRecordBy(indek)
        +'</select>'
      +'</label>'
      
      +'<input type="text" '
        +' id="recordby_id_'+indek+'" '
        +' onchange="ExpenseTickets.getRecordByMode(\''+indek+'\')"'
        +' size="9">'
      
      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="ExpenseTickets.setRecordByMode(\''+indek+'\')">'
      +' </button>'
      
      +'<input type="text" '
        +' id="recordby_name_'+indek+'" '
        +' size="20">'
      
      +'</li>'
    +'</ul>'
    
    +'<div style="display:grid'
      +';grid-template-columns: repeat(2,1fr)'
      +';padding-bottom:3px;padding-top:10px;">'
      
      +'<div>'
        +'<label>Ticket Number: </label>'
          +'<input type="text" '
          +' id="ticket_no_'+indek+'" '
          +' size="9">'
      +'</div>'
        
      +'<div>'
        +'<label>Ticket Date: </label>'
          +'<input type="date" '
            +' id="ticket_date_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'ticket_date\')"'
            +' style="display:none;">'
          +'<input type="text" '
            +' id="ticket_date_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'ticket_date\')"'
            +' size="9">'
      +'</div>'

    +'</div>'
    +'<hr>'
    +'<ul>'
    +'<li><label>Charge Item: </label>'
      +'<input type="text" '
      +' id="charge_item_id_'+indek+'" '
      +' onchange="ExpenseTickets.getChargeItem(\''+indek+'\')"'
      +' size="9">'
      
      +'<button type="button"'
      +' id="btn_find" '
      +' onclick="ExpenseTickets.item.getPaging(\''+indek+'\''
      +',\'charge_item_id_'+indek+'\')">'
      +' </button>'
      
      +'<input type="text" '
      +' id="charge_item_name_'+indek+'" '
      +' size="20">'
    +'</li>'
      
    +'<li><label><select id="customer_mode_'+indek+'"'
      +' onchange="ExpenseTickets.changeCustomerMode(\''+indek+'\')">'
      +getDataCustomerBy(indek)
      +'</select></label>'
      
      +'<input type="text" '
      +' id="customer_id_'+indek+'" '
      +' onChange="ExpenseTickets.getCustomerMode(\''+indek+'\')"'
      +' size="9">'
      
      +'<button type="button"'
      +' id="btn_find" '
      +' onclick="ExpenseTickets.setCustomerMode(\''+indek+'\')">'
      +' </button>'
      
      +'<input type="text" '
      +' id="customer_name_'+indek+'" '
      +' size="20">'
      +'</li>'
    
    +'<li><label>'
      +'<input type="checkbox" id="reimbursable_'+indek+'">'
      +' Reimbursable to Employee'
      +'</label>'
      +'</li>'
    +'</ul>'
    
    +'<p>Ticket Description<br>'
      +'<textarea id="ticket_description_'+indek+'"'
      +' cols="70" rows="1" spellcheck="false">'
      +'</textarea></p>'
      
    +'<p>Internal Memo<br>'
      +'<textarea id="internal_memo_'+indek+'"'
      +' cols="70" rows="1" spellcheck="false">'
      +'</textarea></p>'
      
      
    +'<div style="display:grid'
      +';grid-template-columns: repeat(5,1fr)'
      +';padding-bottom:20px;">'
      
      +'<div>'
        +'<label style="display:block;">Quantity</label>'
        +'<input type="text" '
        +' id="quantity_'+indek+'"'
        +' onchange="ExpenseTickets.calculateAmount(\''+indek+'\',0)"'
        +' style="text-align:center;"'
        +' size="5">'
      +'</div>'

      +'<div>'
        +'<label style="display:block;">Unit Price</label>'
        +'<input type="text" '
        +' id="unit_price_'+indek+'"'
        +' onchange="ExpenseTickets.calculateAmount(\''+indek+'\',1)"'
        +' style="text-align:center;"'
        +' size="7">'
      +'</div>'
      
      +'<div>'
        +'<label style="display:block;">Billing Status</label>'
        +'<select id="billing_status_'+indek+'">'
          +getDataBillingStatus(indek)
        +'</select>'
        
      +'</div>'
    
      +'<div>'
        +'<label style="display:block;">Billing Amount</label>'
        +'<input type="text" '
        +' id="billing_amount_'+indek+'"'
        +' onchange="ExpenseTickets.calculateAmount(\''+indek+'\',2)"'
        +' style="text-align:center;"'
        +' size="7">'
      +'</div>'
      
      +'<div>~f5</div>'
    +'</div>'
      
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('recordby_id_'+indek).focus();
  document.getElementById('ticket_date_'+indek).value=tglSekarang();
  document.getElementById('ticket_date_fake_'+indek).value=tglWest(tglSekarang());
}

ExpenseTickets.changeRecordByMode=(indek)=>{
  setEV('recordby_id_'+indek,'');
  setEV('recordby_name_'+indek,'');
}

ExpenseTickets.setRecordByMode=(indek)=>{
  var kode=parseInt(document.getElementById('recordby_mode_'+indek).value);
  if(kode==0){
    ExpenseTickets.employee.getPaging(indek,'recordby_id_'+indek);
  }else if(kode==1){
    ExpenseTickets.vendor.getPaging(indek,'recordby_id_'+indek);
  }  
}

ExpenseTickets.setEmployee=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  ExpenseTickets.getEmployee(indek);
}

ExpenseTickets.getEmployee=(indek)=>{
  setEV('recordby_name_'+indek, "");
  ExpenseTickets.employee.getOne(indek,
  getEV('recordby_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('recordby_name_'+indek, d.name);
    }
  });
}

ExpenseTickets.setVendor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.vendor_id);
  ExpenseTickets.getVendor(indek);
}

ExpenseTickets.getVendor=(indek)=>{
  setEV('recordby_name_'+indek, "");
  ExpenseTickets.vendor.getOne(indek,
  getEV('recordby_id_'+indek),
  (p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEV('recordby_name_'+indek, d.name);
    }
  });
}

ExpenseTickets.setChargeItem=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.item_id);
  ExpenseTickets.getChargeItem(indek);
}

ExpenseTickets.getChargeItem=(indek)=>{
  setEV('charge_item_name_'+indek, "");
  ExpenseTickets.item.getOne(indek,
  getEV('charge_item_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('charge_item_name_'+indek, d.name);
    }
  });
}

ExpenseTickets.setCustomerMode=(indek)=>{
  var kode=parseInt(document.getElementById('customer_mode_'+indek).value);
  if(kode==0){
    ExpenseTickets.customer.getPaging(indek,'customer_id_'+indek);
  }else if(kode==1){
    ExpenseTickets.job.getPaging(indek,'customer_id_'+indek);
  }else{
    
  }
}

ExpenseTickets.getCustomerMode=(indek)=>{
  var kode=parseInt(document.getElementById('customer_mode_'+indek).value);
  if(kode==0){
    ExpenseTickets.getCustomer(indek);
  }else if(kode==1){
    // ExpenseTickets.getJob(indek);
  }else{
    // 
  }
}

ExpenseTickets.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  ExpenseTickets.getCustomer(indek);
}

ExpenseTickets.getCustomer=(indek)=>{
  setEV('customer_name_'+indek, "");
  ExpenseTickets.customer.getOne(indek,
  getEV('customer_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_name_'+indek, d.name);
    }
  });
}

ExpenseTickets.getJob=(indek)=>{
  setEV('customer_name_'+indek, "");
  ExpenseTickets.job.getOne(indek,
  getEV('customer_id_'+indek),
  (paket)=>{
    console.log(paket);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_name_'+indek, d.name);
    }
  });
}

ExpenseTickets.changeCustomerMode=(indek)=>{
  setEV('customer_id_'+indek,'');
  setEV('customer_name_'+indek,'');
}

ExpenseTickets.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d);
}

ExpenseTickets.getRecordByMode=(indek)=>{
  var kode=parseInt(document.getElementById('recordby_mode_'+indek).value);
  if(kode==0){
    ExpenseTickets.getEmployee(indek);
  }else if(kode==1){
    ExpenseTickets.getVendor(indek);
  }  
}

ExpenseTickets.calculateAmount=(indek,kolom)=>{
  var qty=parseFloat(getEV('quantity_'+indek));
  var unit_price=parseFloat(getEV('unit_price_'+indek));
  var amount=parseFloat(getEV('billing_amount_'+indek));

  if(kolom==0){
    if(unit_price==0 || isNaN(unit_price)){
      (amount==0 || isNaN(amount))?proses("A"):proses("B");
    }else{
      proses("C");
    }
  }
  if(kolom==1){
    if(qty==0 || isNaN(qty)){
      (amount==0|| isNaN(amount))?proses("D"):proses("E");
    }else{
      proses("C");
    }
  }
  if(kolom==2){
    if(unit_price==0 || isNaN(unit_price)){
      (qty==0 || isNaN(qty))?proses('A'):proses('B');
    }else{
      proses("E");
    }
  }
  
  function proses(kode){
    console.log(kode);
    switch (kode){
      case "A":
        setEV('unit_price_'+indek,0);
        break;
      case "B":
        setEV('unit_price_'+indek,amount/qty);
        break;
      case "C":
        setEV('billing_amount_'+indek,qty*unit_price);
        break;
      case "D":
        setEV('quantity_'+indek,0);
        break;  
      case "E":
        setEV('quantity_'+indek,amount/unit_price);
        break;
      default:
        alert('out condition');
    }
  }
}

ExpenseTickets.createExecute=(indek)=>{

  db.execute(indek,{
    query:"INSERT INTO expense_tickets "
      +"(admin_name,company_id,record_mode,record_id"
      +",ticket_no,date,item_id"
      +",customerby_mode,customerby_id"
      +",reimbursable,ticket_description,internal_memo"
      +",quantity,billing_status,billing_amount)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEI("recordby_mode_"+indek)+"'"
      +",'"+getEV("recordby_id_"+indek)+"'"
      +",'"+getEV("ticket_no_"+indek)+"'"
      +",'"+getEV("ticket_date_"+indek)+"'"
      +",'"+getEV("charge_item_id_"+indek)+"'"
      +",'"+getEI("customer_mode_"+indek)+"'"
      +",'"+getEV("customer_id_"+indek)+"'"
      +",'"+getEC("reimbursable_"+indek)+"'"
      +",'"+getEV("ticket_description_"+indek)+"'"
      +",'"+getEV("internal_memo_"+indek)+"'"
      +",'"+getEV("quantity_"+indek)+"'"
      +",'"+getEI("billing_status_"+indek)+"'"
      +",'"+getEV("billing_amount_"+indek)+"'"
      +")"
  });
}

ExpenseTickets.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM expense_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEI('recordby_mode_'+indek, d.record_mode);
      setEV('recordby_id_'+indek, d.record_id);
      setEV('recordby_name_'+indek, d.record_name);
      setEV('ticket_no_'+indek, d.ticket_no);
      setEV('ticket_date_'+indek, d.date);
      setEV('ticket_date_fake_'+indek, tglWest(d.date));
      setEV('charge_item_id_'+indek, d.item_id);
      setEV('charge_item_name_'+indek, d.item_name);
      setEI('customer_mode_'+indek, d.customerby_mode);
      setEV('customer_id_'+indek, d.customerby_id);
      setEV('customer_name_'+indek, d.customerby_name);
      setEC('reimbursable_'+indek, d.reimbursable);
      setEV('ticket_description_'+indek, d.ticket_description);
      setEV('internal_memo_'+indek, d.internal_memo);
      setEV('quantity_'+indek, d.quantity);
      setEV('unit_price_'+indek, d.unit_price);
      setEI('billing_status_'+indek, d.billing_status);
      setEV('billing_amount_'+indek, d.billing_amount);

      message.none(indek);
    }
    return callback();
  });
}

ExpenseTickets.formUpdate=(indek,ticket_no)=>{
  bingkai[indek].ticket_no=ticket_no;
  ExpenseTickets.form.modeUpdate(indek);
}

ExpenseTickets.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE expense_tickets"
      +" SET record_mode='"+getEI("recordby_mode_"+indek)+"',"
      +" record_id='"+getEV("recordby_id_"+indek)+"',"
      +" ticket_no='"+getEV("ticket_no_"+indek)+"',"
      +" date='"+getEV("ticket_date_"+indek)+"',"
      +" item_id='"+getEV("charge_item_id_"+indek)+"',"
      +" customerby_mode='"+getEI("customer_mode_"+indek)+"',"
      +" customerby_id='"+getEV("customer_id_"+indek)+"',"
      +" reimbursable='"+getEC("reimbursable_"+indek)+"',"
      +" ticket_description='"+getEV("ticket_description_"+indek)+"',"
      +" internal_memo='"+getEV("internal_memo_"+indek)+"',"
      +" quantity='"+getEV("quantity_"+indek)+"',"
      +" billing_status='"+getEI("billing_status_"+indek)+"',"
      +" billing_amount='"+getEV("billing_amount_"+indek)+"' "

      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
  },(p)=>{
    if(p.err.id==0){
      ExpenseTickets.deadPath(indek);
      bingkai[indek].ticket_no=getEV('ticket_no_'+indek);
    }
  });
}

ExpenseTickets.formDelete=(indek,ticket_no)=>{
  bingkai[indek].ticket_no=ticket_no;
  ExpenseTickets.form.modeDelete(indek);
}

ExpenseTickets.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM expense_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
  },(p)=>{
    if(p.err.id==0) ExpenseTickets.deadPath(indek);
  });
}

ExpenseTickets.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM expense_tickets "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR record_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ExpenseTickets.search=(indek)=>{
  ExpenseTickets.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,ticket_no,billing_amount,record_name,"
        +" user_name,date_modified "
        +" FROM expense_tickets"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND ticket_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR record_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ExpenseTickets.readShow(indek);
    });
  });
}

ExpenseTickets.exportExecute=(indek)=>{
  var table_name=ExpenseTickets.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

ExpenseTickets.importExecute=(indek)=>{
  var n=0;
  var m='<p>[Start]</p>';
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO expense_tickets "
        +"(admin_name,company_id,record_mode,record_id"
        +",ticket_no,date,item_id"
        +",customerby_mode,customerby_id"
        +",reimbursable,ticket_description,internal_memo"
        +",quantity,billing_status,billing_amount)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // record_mode
        +",'"+d[i][2]+"'" // record_id
        +",'"+d[i][3]+"'" // ticket_no
        +",'"+d[i][4]+"'" // date
        +",'"+d[i][5]+"'" // charge_item
        +",'"+d[i][6]+"'" // customerby
        +",'"+d[i][7]+"'" // customerby_id
        +",'"+d[i][8]+"'" // reimbursable
        +",'"+d[i][9]+"'" // description
        +",'"+d[i][10]+"'" // memo
        +",'"+d[i][11]+"'" // quantity
        +",'"+d[i][12]+"'" // status
        +",'"+d[i][13]+"'" // amount
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

ExpenseTickets.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT date,ticket_no,billing_amount,record_name,"
      +" user_name,date_modified"
      +" FROM expense_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,ticket_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ExpenseTickets.selectShow(indek);
  });
}

ExpenseTickets.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th>'
      +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
        +'</th>'
      +'<th colspan="2">Date</th>'
      +'<th>Ticket #</th>'
      +'<th>Name</th>'
      +'<th>Billing Amount</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<th>'
        +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
          +'</th>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+tglEast(d[x].date)+'</td>'
        +'<td align="left">'+d[x].ticket_no+'</td>'
        +'<td align="left">'+d[x].record_name+'</td>'
        +'<td align="right">'+d[x].billing_amount+'</td>'
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

ExpenseTickets.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM expense_tickets"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND ticket_no='"+d[i].ticket_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

ExpenseTickets.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM expense_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
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

ExpenseTickets.duplicate=(indek)=>{
  var id='copy_of '+getEV('ticket_no_'+indek);
  setEV('ticket_no_'+indek,id);
  focus('ticket_no_'+indek);
}

ExpenseTickets.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ExpenseTickets.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ExpenseTickets.properties(indek);})
  }
}




// eof: 686;629;744;830;808;812;
