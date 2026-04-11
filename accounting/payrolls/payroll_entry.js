/*
 * auth: budiono;
 * code: J1;
 * path: /accounting/payrolls/payroll_entry.js;
 * -------------------------------------------;
 * date: jan-31, 10:01, thu-2024; new;
 * edit: aug-26, 07:29, mon-2024; r13;
 * edit: oct-07, 20:21, mon-2024; #20;
 * edit: oct-29, 14:53, tue-2024; #24;
 * edit: oct-30, 07:53, wed-2024; #24;
 * edit: oct-30, 21:47, wed-2024; #24; ganti table;
 * edit: nov-29, 09:48, fri-2024; #27; add locker();
 * -----------------------------; happy new year 2025;
 * edit: jan-01, 20:19, wed-2025; #32; properties+duplicate;
 * edit: feb-25, 17:55, tue-2025; #41; file_id;
 * edit: mar-15, 17:25, sat-2025; #43; deep-folder;
 * edit: mar-27, 13:29, thu-2025; #45; ctables;cstructure;
 * edit: jun-06, 18:35, fri-2025; #57; payroll_fields;
 * edit: jun-10, 14:14, tue-2025; #57; add accrue_field;
 * edit: aug-18, 17:36, mon-2025; #68; add date obj;
 * edit: nov-10, 10:23, mon-2025; #80;
 */ 

/*
 * PRIMARY_KEY: admin_name, company_id, cash_account_id, payroll_no;
 * NOT_NULL: 1. employee_id, 2. payroll_no, 3. cash_account_id
 */ 

'use strict';

var PayrollEntry={}

PayrollEntry.hidePreview=false;
PayrollEntry.table_name='payroll_entry';
PayrollEntry.pay={};
PayrollEntry.employee={};
PayrollEntry.company={};
PayrollEntry.accrue={};
PayrollEntry.form=new ActionForm2(PayrollEntry);
PayrollEntry.grid=new Grid(PayrollEntry);
PayrollEntry.employee=new EmployeeLook(PayrollEntry);
PayrollEntry.account=new AccountLook(PayrollEntry);
PayrollEntry.payrollField=new PayrollFieldLook(PayrollEntry);

PayrollEntry.show=(karcis)=>{
  karcis.modul=PayrollEntry.table_name;
  karcis.child_free=false;
  karcis.add_param_pay_frequency=true;
  
  const baru=exist(karcis);
  if(baru==-1){
    const newEmp=new BingkaiUtama(karcis);
    const indek=newEmp.show();
    createFolder(indek,()=>{
      PayrollEntry.form.modePaging(indek);
      EmployeeDefaults.getDefault(indek);
      PayrollEntry.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

PayrollEntry.getDefault=(indek)=>{
  bingkai[indek].sum={
    pay:0,
    employee:0,
    company:0,
  };
}

PayrollEntry.changePayFrequency=(indek)=>{
  bingkai[indek].pay_frequency=getEI('pay_frequency_'+indek);
  PayrollEntry.form.modePaging(indek);
}

PayrollEntry.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM payroll_entry"
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

PayrollEntry.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  PayrollEntry.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,payroll_no,date,"
        +" net_amount,employee_name,"
        +" user_name,date_modified"
        +" FROM payroll_entry"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,payroll_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      PayrollEntry.readShow(indek);
    });
  })
}

PayrollEntry.readShow=function(indek){
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek) 
  
  html+='<table border=1>'
    +'<tr>'
      +'<th colspan="2">Payroll #</th>'
      +'<th>Date</th>'
      +'<th>Net Amount</th>'
      +'<th>Employee Name</th>'
      +'<th>Owner</th>'
      +'<th>Date Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].payroll_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+(d[x].net_amount)+'</td>'
        +'<td align="left">'+xHTML(d[x].employee_name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="PayrollEntry.formUpdate(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].payroll_no+'\');">'
          +'</button>'
          +'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="PayrollEntry.formDelete(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].payroll_no+'\');">'
          +'</button>'
          +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  PayrollEntry.form.addPagingFn(indek);
}

PayrollEntry.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"'
      +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
      
    +'<form autocomplete="off">'

    +'<div style="float:left;'
      +'margin-bottom:60px;'
      +'border:0px solid red;'
      +'margin-right:20px;">'
      +'<ul>'
        +'<li>'
          +'<label>Employee ID'
            +'<i style="color:red">*</i>'
          +'</label>'
          +'<input type="text"'
            +' id="employee_id_'+indek+'"'
            +' onchange="PayrollEntry.getEmployee(\''+indek+'\')"'
            +' size="20">'
          
          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="PayrollEntry.employee.getPaging(\''+indek+'\''
            +',\'employee_id_'+indek+'\',-1)">'
          +'</button>'
        +'</li>'
        
        +'<li><label>&nbsp;</label>'
          +'<input type="text"'
          +' id="name_'+indek+'" disabled>'
        +'</li>'
        
        +'<li><label>&nbsp;</label>'
          +'<textarea id="address_'+indek+'"'
            +' placeholder="Address"'
            +' style="resize:none;width:14.6rem;height:65px;"'
            +' spellcheck=false'
            +'  disabled>'
          +'</textarea>'
        +'</li>'
      +'</ul>'
    +'</div>'
      
    +'<div style="padding-right:20px;float:left">'
      +'<ul>'
        +'<li>'
          +'<label>Payroll No<i style="color:red">*</i></label>'
          +'<input type="text"'
            +' id="payroll_no_'+indek+'"'
            +' size="9">'
        +'</li>'

        +'<li>'
          +'<label>Date</label>'
          +'<input type="date"'
            +' id="date_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'date\')"'
            +' style="display:none;">'
          +'<input type="text"'
            +' id="date_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'date\')"'
            +' size="9">'
        +'</li>'
        
        +'<li>'
          +'<label>Amount</label>'
          +'<input type="text"'
            +' id="net_amount_'+indek+'"'
            +' style="text-align:center;"'
            +' size="9" disabled>'
        +'</li>'
      +'</ul>'
    +'</div>'

    +'<div style="float:left">'
      +'<ul>'
        +'<li>'
          +'<label>Cash Account'
            +'<i style="color:red">*</i>'
          +'</label>'
          +'<input type="text"'
            +' id="cash_account_id_'+indek+'"'
            +' size="9">'
            
          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="PayrollEntry.account.getPaging(\''+indek+'\''
            +',\'cash_account_id_'+indek+'\''
            +',-1'
            +',\''+CLASS_ASSET+'\')">'
          +'</button>'
        +'</li>'
        +'<li>'
          +'<label>&nbsp;</label>'
          +'<input type="text"'
            +' id="cash_account_name_'+indek+'" disabled>'
        +'</li>'
      
        +'<li>'
          +'<label>Pay Periode Ends</label>'
          +'<input type="date"'
            +' id="pay_period_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'pay_period\')"'
            +' style="display:none;">'
          +'<input type="text"'
            +' id="pay_period_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'pay_period\')"'
            +' size="9">'
        +'</li>'
        
        +'<li>'
          +'<label>Pay Frequency</label>'
          +'<select id="pay_frequency_'+indek+'" disabled>'
            +getDataPayFrequency(indek)
          +'</select>'
        +'</li>'
        
        +'<li>'
          +'<label>Weeks in Pay</label>'
          +'<input type="text" disabled'
            +' id="week_'+indek+'"'
            +' style="text-align:center"'
            +' size="6">'
        +'</li>'
      +'<ul>'
    +'</div>'
    
    +'<div style="clear:left;">'
      +'<details open>'
        +'<summary>Pay Field (Gross Pay)</Summary>'
        +'<div style="float:left;padding-right:50px;">'
          +'<label>Pay Method</label>'
          +'<select id="pay_method_'+indek+'"'
            +' onChange="Employees.getPayInfo(\''+indek+'\')"  disabled>'
            +getEmployeePayMethod(indek)
          +'</select>'
        +'</div>'
        +'<div style="float:left;">'
          +'<label>Pay Hour</label>'
          +'<input type="text" disabled'
            +' id="pay_hour_'+indek+'" '
            +' size="6" style="text-align:center;">'
        +'</div>'
        +'<div id="pay_field_'+indek+'" style="clear:left;">'
        +'</div>'
      +'</details>'
    +'</div>'
    
    +'<details open>'
      +'<summary>Employee Field (Deduction)</Summary>'
      +'<div id="employee_field_'+indek+'"></div>'
    +'</details>'
    
    +'<details open>'
      +'<summary>Company Field (Payroll Journal)</Summary>'
      +'<div id="company_field_'+indek+'"></div>'
    +'</details>'
    
    +'<details open>'
      +'<summary>Accrue Field (Vacation - Sick Time)</Summary>'
      +'<div id="accrue_field_'+indek+'"></div>'
    +'</details>'

    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('employee_id_'+indek).focus();
  document.getElementById('date_'+indek).value=tglSekarang();
  document.getElementById('date_fake_'+indek).value=tglWest(tglSekarang());
  document.getElementById('pay_period_'+indek).value=tglSekarang();
  document.getElementById('pay_period_fake_'+indek).value=tglWest(tglSekarang());
  
  if(metode==MODE_CREATE) PayrollEntry.setDefault(indek);
}

PayrollEntry.setDefault=(indek)=>{
  bingkai[indek].sum_gross=0;
  bingkai[indek].sum_employee=0;
  bingkai[indek].sum_payroll=0;
  
  var d=bingkai[indek].data_default;
  
  setEV('cash_account_id_'+indek, d.cash_account_id);
  setEV('cash_account_name_'+indek, d.cash_account_name);

  PayrollEntry.pay.setRows(indek,d.pay_field);
  PayrollEntry.employee.setRows(indek,d.employee_field);
  PayrollEntry.company.setRows(indek,d.company_field);
  PayrollEntry.accrue.setRows(indek,d.accrue_field);
}

PayrollEntry.pay.setRows=(indek, isi)=>{
  
  if(isi===undefined)isi=[];    
  
  var html=PayrollEntry.pay.tableHead(indek);
  var i;
  var sum_amount=0;
  var pay_method=getEI('pay_method_'+indek);
  
  bingkai[indek].pay_field=isi;
  
  for (i=0; i<isi.length; i++) {
    
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
    
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="pay_field_name_'+i+'_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' size="10"'
          +' style="text-align:left"'
          +' onchange="PayrollEntry.getField(\''+indek+'\''
          +',\'pay_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' onfocus="this.select()">'
      +'</td>'
      
      +'<td><button type="button"'
        +' class="btn_find" '
        +' onclick="PayrollEntry.payrollField.getPaging(\''+indek+'\''
        +',\'pay_field_name_'+i+'_'+indek+'\','+i+',0);">'
        +'</button>'
      +'</td>'
    
      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text" '
          +' id="pay_expense_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].expense_account_id+'"'
          +' size="12"'
          +' style="text-align:center;"'
          +' onchange="PayrollEntry.pay.setCell(\''+indek+'\''
          +',\'expense_account_id_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
        +'<button type="button" '
          +' class="btn_find" '
          +' id="liability_account_btn_'+indek+'" '
          +' onclick="PayrollEntry.account.getPaging(\''+indek+'\''
          +',\'pay_expense_account_id_'+i+'_'+indek+'\',\''+i+'\''
          +',\''+CLASS_EXPENSE+'\');">'
        +'</button>'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="rate_'+i+'_'+indek+'"'
          +' value="'+isi[i].rate+'"'
          +' size="12" '
          +' style="text-align:center;"'
          +' disabled>'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="pay_salary_'+i+'_'+indek+'"'
          +' value="'+isi[i].salary+'"'
          +' size="12"'
          +' style="text-align:center;"'
          +' onchange="PayrollEntry.pay.setCell(\''+indek+'\''
          +',\'pay_salary_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'

      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text" disabled'
          +' id="pay_amount_'+i+'_'+indek+'"'
          +' value="'+isi[i].amount+'"'
          +' size="12"'
          +' style="text-align:center;">'
      +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="PayrollEntry.pay.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
          +' onclick="PayrollEntry.pay.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'

    +'</tr>';
    sum_amount+=Number(isi[i].amount);
  }
  
  html+=PayrollEntry.pay.tableFoot(indek);
  
  document.getElementById('pay_field_'+indek).innerHTML=html;
  if(isi.length == 0) PayrollEntry.pay.addRow(indek,0);
  bingkai[indek].sum.pay=sum_amount;
  PayrollEntry.calculateNet(indek);
}

PayrollEntry.pay.tableHead=(indek)=>{
  return '<table style="display:block;">'
    +'<caption class="required" id="title_pay_info_'+indek+'">'
    +'</caption>'
    +'<thead>'
      +'<tr>'
        +'<th colspan="3">Field Name</th>'
        +'<th colspan="2">Expense Acc. ID</th>'
        +'<th>Rate</th>'
        +'<th>Salary</th>'
        +'<th>Amount</th>'
        +'<th>Action</th>'
      +'</tr>'
    +'</thead>';
}

PayrollEntry.pay.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td colspan="6" align="right">'
        +'<strong>Total</strong>'
      +'</td>'
      +'<td align="center">'
        +'<strong><i id="sum_pay_'+indek+'">0</i></strong>'
      +'</td>'
      +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
};

PayrollEntry.pay.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].pay_field;
  var baru = [];
  var isiEdit = {};
  var i;
  var sum_amount=0;
  
  for (i=0; i<isi.length; i++) {
    isiEdit=isi[i];
    
    if(id_kolom==('pay_field_name_'+i+'_'+indek)){
      isiEdit.field_name=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('pay_expense_account_id_'+i+'_'+indek)){
      isiEdit.expense_account_id=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('pay_rate_'+i+'_'+indek)){
      isiEdit.rate=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('pay_salary_'+i+'_'+indek)){
      isiEdit.salary=getEV(id_kolom);

      if(getEI('pay_method_'+indek)==0){// salary
        isiEdit.amount= Number(isiEdit.salary);
      }else{
        isiEdit.amount= Number(isiEdit.salary)*Number(isiEdit.rate);
      }
      setEV('pay_amount_'+i+"_"+indek, isiEdit.amount);
      
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    sum_amount+=Number(baru[i].amount)
  };
  bingkai[indek].sum.pay=sum_amount;
  PayrollEntry.calculateNet(indek);
}

PayrollEntry.calculateNet=(indek)=>{

  var sum_pay=bingkai[indek].sum.pay;
  var sum_employee=bingkai[indek].sum.employee;
  var net_amount=Number(sum_pay)-Number(sum_employee);
  
  setiH('sum_pay_'+indek, sum_pay)
  if(document.getElementById('sum_employee_'+indek)){
    setiH('sum_employee_'+indek, sum_employee);
  }
  setEV('net_amount_'+indek, (net_amount));
}

PayrollEntry.pay.addRow=(indek,baris)=>{
  
  var oldBasket=[];
  var newBasket=[];
  var i;
  
  oldBasket=bingkai[indek].pay_field;
  
  for(i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  PayrollEntry.pay.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.expense_account_id='';
    myItem.rate=0;
    myItem.salary=0;
    myItem.amount=0;
    newBas.push(myItem);
  }
}

PayrollEntry.pay.removeRow = (indek,number) => {
  var oldBasket = bingkai[indek].pay_field;
  var newBasket = [];
  var i;
  
  PayrollEntry.pay.setRows(indek,oldBasket);
  
  for (i=0; i<oldBasket.length; i++) {
    if (i != (number)) {
      newBasket.push(oldBasket[i]);
    }
  }     
  PayrollEntry.pay.setRows(indek,newBasket);
}

//--employee--//
PayrollEntry.employee.setRows=(indek, isi)=>{
  
  if(isi===undefined)isi=[];    
  
  var html=PayrollEntry.employee.tableHead(indek);
  var i;
  var sum_amount=0;
  
  bingkai[indek].employee_field=isi;
  
  for (i=0;i<isi.length;i++){

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
    
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="employee_field_name_'+i+'_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' size="10"'
          +' style="text-align:left"'
          +' onchange="PayrollEntry.getField(\''+indek+'\''
          +',\'employee_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' onfocus="this.select()">'
      +'</td>'

      +'<td>'
        +'<button type="button"'
          +' class="btn_find" '
          +' onclick="Employees.payrollField.getPaging(\''+indek+'\''
          +',\'employee_field_name_'+i+'_'+indek+'\','+i+',1);">'
        +'</button>'
      +'</td>'
    
      +'<td  align="center" style="padding:0;margin:0;">' 
        +'<input type="text" '
          +' id="employee_liability_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].liability_account_id+'"'
          +' onchange="PayrollEntry.employee.setCell(\''+indek+'\''
          +',\'employee_liability_account_id_'+i+'_'+indek+'\')" '
          +' size="7"'
          +' style="text-align:center;">'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
        +'<button type="button" '
          +' class="btn_find" '
          +' onclick="PayrollEntry.account.getPaging(\''+indek+'\''
          +',\'employee_liability_account_id_'+i+'_'+indek+'\',\''+i+'\''
          +',\''+CLASS_LIABILITY+'\');">'
        +'</button>'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="employee_amount_'+i+'_'+indek+'"'
          +' value="'+isi[i].amount+'"'
          +' size="7"'
          +' style="text-align:center;"'
          +' onchange="PayrollEntry.employee.setCell(\''+indek+'\''
          +',\'employee_amount_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="PayrollEntry.employee.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
          +' onclick="PayrollEntry.employee.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
    +'</tr>';
    sum_amount+=Number( isi[i].amount );
  }
  
  html+=PayrollEntry.employee.tableFoot(indek);
  document.getElementById('employee_field_'+indek).innerHTML=html;
  if(isi.length==0) PayrollEntry.employee.addRow(indek,0);
  
  bingkai[indek].sum.employee=sum_amount;
  PayrollEntry.calculateNet(indek);
}

PayrollEntry.employee.tableHead=(indek)=>{
  return '<table style="display:block;">'
  +'<thead>'
    +'<tr>'
      +'<th colspan="3">Field Name</th>'
      +'<th colspan="2">Liability Acc. ID</th>'
      +'<th>Amount</th>'
      +'<th>Action</th>'
    +'</tr>'
  +'</thead>';
}

PayrollEntry.employee.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td colspan=4 align="right">'
        +'<strong>Total</strong>'
      +'</td>'
      +'<td align="center">'
        +'<strong><i id="sum_employee_'+indek+'">0</i></strong>'
      +'</td>'
      +'<td>&nbsp;</td>'
    +'</tr>'
  +'</tfoot>'
  +'</table>';
}

PayrollEntry.employee.setCell=(indek,id_kolom)=>{
  
  var isi=bingkai[indek].employee_field;
  var baru = [];
  var isiEdit = {};
  var i;
  var sum_amount=0;
  
  for (i=0;i<isi.length; i++){

    isiEdit=isi[i];
    
    if(id_kolom==('employee_field_name_'+i+'_'+indek)){
      isiEdit.field_name=getEV(id_kolom);
      baru.push(isiEdit);
            
    }else if(id_kolom==('employee_liability_account_id_'+i+'_'+indek)){
      isiEdit.liability_account_id=getEV(id_kolom);
      baru.push(isiEdit);

    }else if(id_kolom==('employee_amount_'+i+'_'+indek)){
      isiEdit.amount=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    sum_amount+=Number(baru[i].amount);
  }
  
  bingkai[indek].sum.employee=sum_amount;
  PayrollEntry.calculateNet(indek);
}

PayrollEntry.employee.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var i;
  
  oldBasket=bingkai[indek].employee_field;
  for (i=0; i<oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if(i == baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  PayrollEntry.employee.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.liability_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }
}

PayrollEntry.employee.removeRow = (indek,number) => {
  var oldBasket = bingkai[indek].employee_field;
  var newBasket = [];
  var i;
  
  PayrollEntry.employee.setRows(indek,oldBasket);
  
  for (i=0; i<oldBasket.length; i++) {
    if (i != (number)) {
      newBasket.push(oldBasket[i]);
    }
  }
  PayrollEntry.employee.setRows(indek,newBasket);
}

function Formula(indek, field_id, nomer){
  const gaji=Number(getEV('amount_0_'+indek));
  var limit_=10500;
  
  var h=0;
  switch(nomer){
    case 0:
      h=0;
      return h;
      break;

    case 1:
      h=(gaji/12);
      return h+'-'+nomer;
      break;
      
    case 2:
      h=(gaji*6.2/100);
      return h+'-'+nomer;
      break;
      
    case 3:
      h=(gaji*1.45/100);
      return h+'-'+nomer;
      break;
      
    case 4:
      return h;
      break;
      
    case 5:// 401K
      h=(gaji*4/100);
      return h+'-'+nomer;
      break;
      
    case 6:
      h=(gaji*6.2/100);
      return h+'-'+nomer;
      break;
      
    case 7:
      //taxable_gross=
      h=(gaji*0.8/100);
      return h;
      break;
      
    case 8:// sui_er
      h=(gaji*3/100);
      return h;
      break;
      
    case 9:
      h=(gaji*4/100);
      return h+'-'+nomer;
      break;

    default:
  }
}

//-- company --//
PayrollEntry.company.setRows=(indek,isi)=>{
  
  if(isi===undefined)isi=[];    
  
  var html=PayrollEntry.company.tableHead(indek);
  var i;
  var sum_amount=0;

  bingkai[indek].company_field=isi;

  for (i=0;i<isi.length;i++) {

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="company_field_name_'+i+'_'+indek+'"'
        +' value="'+isi[i].field_name+'"'
        +' onchange="PayrollEntry.getField(\''+indek+'\''
        +',\'company_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
        +' onfocus="this.select()"'
        +' size="10"'
        +' style="text-align:left">'
      +'</td>'
      
      +'<td><button type="button"'
        +' class="btn_find" '
        +' onclick="PayrollEntry.payrollField.getPaging(\''+indek+'\''
        +',\'company_field_name_'+i+'_'+indek+'\','+i+',2);">'
        +'</button>'
      +'</td>'

      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text" '
          +' id="company_liability_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].liability_account_id+'"'
          +' onchange="PayrollEntry.company.setCell(\''+indek+'\''
          +',\'company_liability_account_id_'+i+'_'+indek+'\')" '
          +' size="7"'
          +' style="text-align:center;">'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
        +'<button type="button" '
          +' class="btn_find" '
          +' onclick="PayrollEntry.account.getPaging(\''+indek+'\''
          +',\'company_liability_account_id_'+i+'_'+indek+'\',\''+i+'\''
          +',\''+CLASS_LIABILITY+'\');">'
        +'</button>'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" '
          +' id="company_expense_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].expense_account_id+'"'
          +' onchange="PayrollEntry.company.setCell(\''+indek+'\''
          +',\'company_expense_account_id_'+i+'_'+indek+'\')" '
          +' size="7"'
          +' style="text-align:center;">'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
        +'<button type="button" '
          +' class="btn_find" '
          +' onclick="PayrollEntry.account.getPaging(\''+indek+'\''
          +',\'company_expense_account_id_'+i+'_'+indek+'\',\''+i+'\''
          +',\''+CLASS_EXPENSE+'\');">'
        +'</button>'
      +'</td>'
       
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="company_amount_'+i+'_'+indek+'"'
          +' value="'+isi[i].amount+'"'
          +' size="7"'
          +' style="text-align:center;"'
          +' onchange="PayrollEntry.company.setCell(\''+indek+'\''
          +',\'company_amount_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="PayrollEntry.company.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
          +' onclick="PayrollEntry.company.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'

    +'</tr>';
    sum_amount+=Number(isi[i].amount);
  }
  html+=PayrollEntry.company.tableFoot(indek);
  document.getElementById('company_field_'+indek).innerHTML=html;
  if(isi.length==0) PayrollEntry.company.addRow(indek,0);
  
  setiH('sum_company_'+indek, sum_amount);
}

PayrollEntry.company.tableHead=(indek)=>{
  return '<table style="display:block;">'
  +'<thead>'
    +'<tr>'
    +'<th colspan="3">Field Name</th>'
    +'<th colspan="2">Liability Acc. ID</th>'
    +'<th colspan="2">Expense Acc. ID</th>'
    +'<th>Amount</th>'
    +'<th>Action</th>'
    +'</tr>'
  +'</thead>';
}

PayrollEntry.company.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td colspan="7" align="right">'
        +'<strong>Total</strong>'
      +'</td>'
      +'<td align="center">'
        +'<strong><i id="sum_company_'+indek+'">0</i></strong>'
      +'</td>'
      +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

PayrollEntry.company.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var i;

  oldBasket=bingkai[indek].company_field;
  for(i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  PayrollEntry.company.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.liability_account_id='';
    myItem.expense_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  };
}

PayrollEntry.company.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].company_field;
  var newBasket=[];
  var i;
  
  PayrollEntry.company.setRows(indek,oldBasket);
  
  for (i=0; i<oldBasket.length; i++) {
    if (i != (number)) {
      newBasket.push(oldBasket[i]);
    }
  }
  PayrollEntry.company.setRows(indek,newBasket);
}

PayrollEntry.company.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].company_field;
  var baru = [];
  var isiEdit = {}; 
  var i;
  var sum_amount=0;
  
  for (i=0;i<isi.length; i++){
    isiEdit=isi[i];
            
    if(id_kolom==('company_liability_account_id_'+i+'_'+indek)){
      isiEdit.liability_account_id=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('company_expense_account_id_'+i+'_'+indek)){
      isiEdit.expense_account_id=getEV(id_kolom);
      baru.push(isiEdit);

    }else if(id_kolom==('company_amount_'+i+'_'+indek)){
      isiEdit.amount=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('company_field_name_'+i+'_'+indek)){
      isiEdit.field_name=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    sum_amount+=Number(baru[i].amount);
  }
  setiH('sum_company_'+indek, sum_amount);
}

PayrollEntry.setEmployee=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  PayrollEntry.getEmployee(indek);
}

PayrollEntry.getEmployee=(indek)=>{

  PayrollEntry.employee.getOne(indek,
    getEV('employee_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var address=JSON.parse(d.address);
      var pay_freq=getFrequencyWeek(indek,d.pay_frequency);
      var pay_field=JSON.parse(d.pay_field);
      var employee_field=JSON.parse(d.employee_field);
      var company_field=JSON.parse(d.company_field);

      setEV('name_'+indek, d.name);
      setEV('address_'+indek, toAddress(address));
      setEV('pay_method_'+indek, d.pay_method);
      setEI('pay_frequency_'+indek, d.pay_frequency);
      setEV('week_'+indek, pay_freq );
      setEV('pay_hour_'+indek, d.pay_hour);

      PayrollEntry.pay.setRows(indek, pay_field ); 
      PayrollEntry.employee.setRows(indek, employee_field );
      PayrollEntry.company.setRows(indek, company_field );

    }else{
      setEV('name_'+indek, '');
      setEV('address_'+indek, '');
      setEV('pay_method_'+indek, -1);
      setEI('pay_frequency_'+indek, -1);
      setEV('week_'+indek, "");
      setEV('pay_hour_'+indek, "");
      
      PayrollEntry.pay.setRows(indek,[]);
      PayrollEntry.employee.setRows(indek,[]);
      PayrollEntry.company.setRows(indek,[]);
    }
  });
}
/*
PayrollEntry.setAccount=(indek,d,i)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=
  
  setEV(id_kolom, d.account_id);
  PayrollEntry.getAccount(indek);
}*/

PayrollEntry.setAccount=(indek,data)=>{
  const id_kolom=bingkai[indek].id_kolom;
  const baris=bingkai[indek].baris;
  
  document.getElementById(id_kolom).value=data.account_id;
 
  switch (id_kolom){
    case "cash_account_id_"+indek:
      // nothing;
      break;
    case "gl_account_id_"+baris+'_'+indek:
      PayrollEntry.gross.setCell(indek,id_kolom);
      break;
    case "employee_gl_account_id_"+baris+'_'+indek:
      PayrollEntry.employee.setCell(indek,id_kolom);
      break;
    case "liability_account_id_"+baris+'_'+indek:
      PayrollEntry.payroll.setCell(indek,id_kolom);
      break;
    case "expense_account_id_"+baris+'_'+indek:
      PayrollEntry.payroll.setCell(indek,id_kolom);
      break;
      
    case "pay_expense_account_id_"+baris+'_'+indek:
      PayrollEntry.pay.setCell(indek,id_kolom);
      break;
      
    case "employee_liability_account_id_"+baris+'_'+indek:
      PayrollEntry.employee.setCell(indek,id_kolom);
      break;
      
    case "company_expense_account_id_"+baris+'_'+indek:
      PayrollEntry.company.setCell(indek,id_kolom);
      break;
    case "company_liability_account_id_"+baris+'_'+indek:
      PayrollEntry.company.setCell(indek,id_kolom);
      break;
      
    default:
      alert(id_kolom+ ' undefined.');
  }
}

PayrollEntry.createExecute=(indek)=>{
  var pay_field=JSON.stringify(bingkai[indek].pay_field);
  var employee_field=JSON.stringify(bingkai[indek].employee_field);
  var company_field=JSON.stringify(bingkai[indek].company_field);
  var accrue_field=JSON.stringify(bingkai[indek].accrue_field);
  var some_note=JSON.stringify([
    "some note for this payroll entry.","create-new"
  ]);

  db.execute(indek,{
    query:"INSERT INTO payroll_entry "
      +"(admin_name,company_id,employee_id,payroll_no,date"
      +",cash_account_id,pay_period"
      +",pay_field,employee_field,company_field,accrue_field"
      +",custom_field)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("employee_id_"+indek)+"'"
      +",'"+getEV("payroll_no_"+indek)+"'"
      +",'"+getEV("date_"+indek)+"'"
      +",'"+getEV("cash_account_id_"+indek)+"'"
      +",'"+getEV("pay_period_"+indek)+"'"
      +",'"+pay_field+"'"
      +",'"+employee_field+"'"
      +",'"+company_field+"'"
      +",'"+accrue_field+"'"
      +",'"+some_note+"'"
      +")"
  });
}

PayrollEntry.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT *"
      +" FROM payroll_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND payroll_no='"+bingkai[indek].payroll_no+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      var p=objectOne(paket.fields,paket.data);
      var address=JSON.parse(p.employee_address);
      var pay_field=JSON.parse(p.pay_field);
      var employee_field=JSON.parse(p.employee_field);
      var company_field=JSON.parse(p.company_field);
      var accrue_field=JSON.parse(p.accrue_field);
      
      setEV('employee_id_'+indek, p.employee_id);
      setEV('name_'+indek, p.employee_name);
      setEV('address_'+indek, toAddress(address));
      
      setEV('payroll_no_'+indek, p.payroll_no);
      setEV('date_'+indek, p.date);
      setEV('date_fake_'+indek, tglWest(p.date));
      setEV('net_amount_'+indek, p.net_amount);
      
      setEV('cash_account_id_'+indek,p.cash_account_id);
      setEV('cash_account_name_'+indek,p.cash_account_name);
      
      setEV('pay_period_'+indek,p.pay_period);
      setEV('pay_period_fake_'+indek,tglWest(p.pay_period));
      setEI('pay_frequency_'+indek,p.pay_frequency);
      setEV('week_'+indek,p.week);
      setEV('pay_hour_'+indek, p.pay_hour);
      
      setEI('pay_method_'+indek,p.pay_method);
      
      PayrollEntry.pay.setRows(indek, pay_field );
      PayrollEntry.employee.setRows(indek, employee_field );
      PayrollEntry.company.setRows(indek, company_field );
      PayrollEntry.accrue.setRows(indek, accrue_field );

      PayrollEntry.calculateNet(indek);
      
      message.none(indek);
    }
    return callback();
  });
} 

PayrollEntry.formUpdate=function(indek,cash_account_id,payroll_no){
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].payroll_no=payroll_no;
  PayrollEntry.form.modeUpdate(indek);
}

PayrollEntry.updateExecute=(indek)=>{
  var pay_field=JSON.stringify(bingkai[indek].pay_field);
  var employee_field=JSON.stringify(bingkai[indek].employee_field);
  var company_field=JSON.stringify(bingkai[indek].company_field);
  var accrue_field=JSON.stringify(bingkai[indek].accrue_field);
  var some_note=JSON.stringify([
    'some note for this payroll entry.','update-edit'
  ])

  db.execute(indek,{
    query: "UPDATE payroll_entry"
      +" SET employee_id='"+getEV("employee_id_"+indek)+"',"
      +" payroll_no='"+getEV("payroll_no_"+indek)+"',"
      +" date='"+getEV("date_"+indek)+"',"
      +" cash_account_id='"+getEV("cash_account_id_"+indek)+"',"
      +" pay_period='"+getEV("pay_period_"+indek)+"',"
      +" pay_field='"+pay_field+"',"
      +" employee_field='"+employee_field+"',"
      +" company_field='"+company_field+"',"
      +" accrue_field='"+accrue_field+"',"
      +" custom_field='"+some_note+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND payroll_no='"+bingkai[indek].payroll_no+"'"
  },(p)=>{
    if(p.err.id==0){
      PayrollEntry.deadPath(indek);
      bingkai[indek].cash_account_id=getEV('cash_account_id_'+indek);
      bingkai[indek].payroll_no=getEV('payroll_no_'+indek);
    }
  });
}

PayrollEntry.formDelete=(indek,cash_account_id,payroll_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].payroll_no=payroll_no;
  PayrollEntry.form.modeDelete(indek);
}

PayrollEntry.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM payroll_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND payroll_no='"+bingkai[indek].payroll_no+"'"
  },(p)=>{
    if(p.err.id==0) PayrollEntry.deadPath(indek);
  });
}

PayrollEntry.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM payroll_entry "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND payroll_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR employee_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

PayrollEntry.search=(indek)=>{
  PayrollEntry.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,payroll_no,date,net_amount,"
        +"employee_name,"
        +"user_name,date_modified "
        +" FROM payroll_entry"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND payroll_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR employee_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      PayrollEntry.readShow(indek);
    });
  });
}

PayrollEntry.exportExecute=(indek)=>{
  var table_name=PayrollEntry.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

PayrollEntry.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i;
  var jok=0,jer=0;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (i=0;i<j;i++){
//  for (i=0;i<1;i++){
    db.run(indek,{
      query:"INSERT INTO payroll_entry "
        +"(admin_name,company_id"
        +",employee_id,payroll_no,date,cash_account_id"
        +",pay_period"//,week"
        +",pay_field,employee_field,company_field,accrue_field"
        +",custom_field)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +",'"+d[i][3]+"'"
        +",'"+d[i][4]+"'"
        +",'"+d[i][5]+"'"

        +",'"+d[i][6]+"'"
        +",'"+d[i][7]+"'"
        +",'"+d[i][8]+"'"
        +",'"+d[i][9]+"'"
        +",'"+d[i][10]+"'"
//        +",'"+d[i][11]+"'"
        +")"
    },(paket)=>{  
      paket.err.id==0 ? jok++: jer++;
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar2(indek,n,j,m,jok,jer);
    });
  }
}

PayrollEntry.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT cash_account_id,date,payroll_no,net_amount,"
      +"employee_name,"
      +"user_name,date_modified"
      +" FROM payroll_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,payroll_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    PayrollEntry.selectShow(indek);
  });
}

PayrollEntry.selectShow=function(indek){
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)

  html+='<table border=1>'
  +'<tr>'
    +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
    +'</td>'
    +'<th colspan="2">Payroll #</th>'
    +'<th>Date</th>'
    +'<th>Net Amount</th>'
    +'<th>Employee Name</th>'
    +'<th>Owner</th>'
    +'<th colspan="2">Date Modified</th>'
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
      +'<td align="left">'+d[x].payroll_no+'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="right">'+d[x].net_amount+'</td>'
      +'<td align="left">'+d[x].employee_name+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

PayrollEntry.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];

  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM payroll_entry"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"'"
          +" AND payroll_no='"+d[i].payroll_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

PayrollEntry.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM payroll_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND payroll_no='"+bingkai[indek].payroll_no+"'"
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

PayrollEntry.duplicate=(indek)=>{
  var id='copy_of '+getEV('payroll_no_'+indek);
  setEV('payroll_no_'+indek,id);
  focus('payroll_no_'+indek);
}

PayrollEntry.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{PayrollEntry.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{PayrollEntry.properties(indek);})
  }
}

PayrollEntry.setField=(indek,data)=>{

  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  document.getElementById(id_kolom).value=data.field_name;
  
  setEV(id_kolom,data.field_name);
  PayrollEntry.getField(indek,id_kolom,baris);

}

PayrollEntry.getField=(indek_,id_kolom_,baris_)=>{

  this.indek=indek_;
  this.id_kolom=id_kolom_;
  this.baris=baris_;
  var nilai=getEV(this.id_kolom);
  
  PayrollEntry.payrollField.getOne(this.indek,
    nilai,
  (paket)=>{
    if(paket.count!=0){

      var d=objectOne(paket.fields,paket.data);

      switch (id_kolom){
        case "pay_field_name_"+baris+'_'+indek:
          // update display
          setEV('pay_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          
          // update array
          PayrollEntry.pay.setCell(indek,id_kolom);
          PayrollEntry.pay.setCell(indek,'pay_expense_account_id_'+baris+'_'+indek);
          break;

        case "employee_field_name_"+baris+'_'+indek:
          setEV('employee_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          PayrollEntry.employee.setCell(indek,id_kolom);
          PayrollEntry.employee.setCell(indek,'employee_liability_account_id_'+baris+'_'+indek);
          break;          
          
        case "company_field_name_"+baris+'_'+indek:
          setEV('company_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          setEV('company_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          
          PayrollEntry.company.setCell(indek,id_kolom);
          PayrollEntry.company.setCell(indek,'company_liability_account_id_'+baris+'_'+indek);
          PayrollEntry.company.setCell(indek,'company_expense_account_id_'+baris+'_'+indek);
          break;          
          
        case "accrue_field_name_"+baris+'_'+indek:
          PayrollEntry.accrue.setCell( indek,id_kolom );
          break;
          
        default:
          alert('['+id_kolom+'] belum kedaftar.');
      }

    }
  });
}

PayrollEntry.accrue.setRows=(indek, isi)=>{
  if(isi===undefined)isi=[];    
  
  var html=PayrollEntry.accrue.tableHead(indek);
  var i;
  
  bingkai[indek].accrue_field=isi;
  
  for (i=0;i<isi.length;i++){

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
    
      +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="accrue_field_name_'+i+'_'+indek+'"'
        +' value="'+isi[i].field_name+'"'
        +' onchange="PayrollEntry.getField(\''+indek+'\''
        +',\'accrue_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
        +' size="10"'
        +' style="text-align:left">'
      +'</td>'
    
      +'<td><button type="button"'
        +' class="btn_find" '
        +' onclick="PayrollEntry.payrollField.getPaging(\''+indek+'\''
        +',\'accrue_field_name_'+i+'_'+indek+'\','+i+',3);">'
        +'</button>'
      +'</td>'
      
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_given_'+i+'_'+indek+'"'
          +' value="'+isi[i].given+'"'
          +' size="7"'
          +' style="text-align:center;"'
          +' onchange="PayrollEntry.accrue.setCell(\''+indek+'\''
          +',\'accrue_given_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_taken_'+i+'_'+indek+'"'
          +' value="'+isi[i].taken+'"'
          +' size="7"'
          +' style="text-align:center;"'
          +' onchange="PayrollEntry.accrue.setCell(\''+indek+'\''
          +',\'accrue_taken_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="PayrollEntry.accrue.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
          +' onclick="PayrollEntry.accrue.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
    +'</tr>';
  }
  
  html+=PayrollEntry.accrue.tableFoot(indek);
  document.getElementById('accrue_field_'+indek).innerHTML=html;
  if(isi.length==0) PayrollEntry.accrue.addRow(indek,0);
}

PayrollEntry.accrue.tableHead=(indek)=>{
  return '<table style="display:block;">'
  +'<thead>'
    +'<tr>'
    +'<th colspan="3">Field Name</th>'
    +'<th>Given</th>'
    +'<th>Taken</th>'
    +'<th>Action</th>'
    +'</tr>'
  +'</thead>';
}

PayrollEntry.accrue.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td>&nbsp;</td>'
    +'</tr>'
  +'</tfoot>'
  +'</table>';
}

PayrollEntry.accrue.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].accrue_field;
  var baru = [];
  var isiEdit = {};
  
  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('accrue_field_name_'+i+'_'+indek)){
      isiEdit.field_name=getEV(id_kolom);
      baru.push(isiEdit);

    }else if(id_kolom==('accrue_given_'+i+'_'+indek)){
      isiEdit.given=getEV(id_kolom);
      baru.push(isiEdit);

    }else if(id_kolom==('accrue_taken_'+i+'_'+indek)){
      isiEdit.taken=getEV(id_kolom);
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
  }
}

PayrollEntry.accrue.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var i;
  
  oldBasket=bingkai[indek].accrue_field;

  for(i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  PayrollEntry.accrue.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.given=0;
    myItem.taken=0;
    newBas.push(myItem);
  }
}

PayrollEntry.accrue.removeRow = (indek,number) => {
  
  var oldBasket = bingkai[indek].accrue_field;
  var newBasket = [];
  var i;
  
  PayrollEntry.accrue.setRows(indek,oldBasket);
  
  for (i=0; i<oldBasket.length; i++) {
    if (i != (number)) {
      newBasket.push(oldBasket[i]);
    }
  }
  PayrollEntry.accrue.setRows(indek,newBasket);
}




// eof: 1137;1206;1320;1299;1303;1304;1298;1632;


/*
PayrollEntry.startDate=(indek)=>{
  db3.query(indek,'payroll_periods/read_start',{
    'pay_frequency':getEV('pay_frequency_'+indek)
  },(paket)=>{
    if (paket.err.id==0) {
      const d=paket.data;
      setEV('start_date_'+indek, tglWest(d.start_date));
    }else{
      setEV('start_date_'+indek, tglSekarang());
      message.infoPaket(indek,paket);
    }
  });
}

PayrollEntry.setPeriod=(indek, data)=>{
  const id_kolom=bingkai[indek].id_kolom;
  const nama_kolom=bingkai[indek].nama_kolom;
  setEV(id_kolom, data.period_id);
}

* */
