/*
 * auth: budiono;
 * file: 45;
 * path: /accounting/payrolls/employee_begins.js;
 * ---------------------------------------------;
 * date: sep-30, 07:09, sat-2023; new;
 * edit: jan-31, 08:19, wed-2024; re-write w class;
 * edit: sep-14, 16:34, sat-2024; r19;
 * edit: sep-18, 17:19, wed-2024; r19;
 * edit: nov-26, 09:32, tue-2024; #27: add locker;
 * edit: dec-01, 23:01, sun-2024; #27; 
 * edit: dec-27, 11:13, fri-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 12:21, sun-2025; #41; file_id;
 * edit: mar-12, 14:51, wed-2025; #43; deep-folder;
 * edit: mar-20, 12:34, wed-2025; #45; ctables;cstructure;
 * edit: jun-05, 12:51, thu-2025; #57; payroll_fields;
 * edit: jun-10, 14:04, tue-2025; #57; accrue_fields;
*/

'use strict';

var EmployeeBegins={}

EmployeeBegins.table_name='employee_begins';
EmployeeBegins.form=new ActionForm2(EmployeeBegins);
EmployeeBegins.grid=new Grid(EmployeeBegins);
EmployeeBegins.employeev=new EmployeeLook(EmployeeBegins);
EmployeeBegins.account=new AccountLook(EmployeeBegins);
EmployeeBegins.payrollField=new PayrollFieldLook(EmployeeBegins);
EmployeeBegins.pay={};
EmployeeBegins.employee={};
EmployeeBegins.company={};
EmployeeBegins.accrue={};

EmployeeBegins.show=(karcis)=>{
  karcis.modul=EmployeeBegins.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newEmp=new BingkaiUtama(karcis);
    var indek=newEmp.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        EmployeeBegins.form.modePaging(indek);
        EmployeeDefaults.getDefault(indek);
      });
    });
  }else{
    show(baru);
  }
}

EmployeeBegins.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM employee_begins"
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

EmployeeBegins.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  EmployeeBegins.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT employee_id,employee_name,net_amount,"
        +" user_name,date_modified"
        +" FROM employee_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY employee_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      EmployeeBegins.readShow(indek);
    });
  })
}

EmployeeBegins.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Employee ID</th>'
      +'<th>Name</th>'
      +'<th>Net Amount</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
      +'<th colspan=2>Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    var gd=getDecimal(indek);
    for(x in d){
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].employee_id+'</td>'
      +'<td align="left">'+xHTML(d[x].employee_name)+'</td>'
      +'<td align="right">'+d[x].net_amount+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'
        +tglInt(d[x].date_modified)
        +'</td>'
      +'<td align="center">'

      +'<button type="button"'
        +' id="btn_change"'
        +' onclick="EmployeeBegins.formUpdate(\''+indek+'\''
        +',\''+d[x].employee_id+'\');">'
        +'</button>'
        +'</td>'
        
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_delete"'
        +' onclick="EmployeeBegins.formDelete(\''+indek+'\''
        +',\''+d[x].employee_id+'\');">'
        +'</button>'
        +'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  EmployeeBegins.form.addPagingFn(indek);
}

EmployeeBegins.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +'<div id="msg_'+indek+'"'
        +' style="margin-bottom:1rem;line-height:1.5rem;">'
      +'</div>'
      
      +'<form autocomplete="off">'
      
      +'<div style="float:left;">'
        +'<ul>'    
          +'<li><label>Employee ID'
            +'<i style="color:red">&nbsp;*</i>:'
            +'</label>'
            +'<input type="text"'
              +' id="employee_id_'+indek+'"'
              +' onchange="EmployeeBegins.getEmployee(\''+indek+'\')"'
              +' size="12">'
            +'<button type="button"'
              +' id="employee_btn_'+indek+'" '
              +' class="btn_find"'
              +' onclick="EmployeeBegins.employeev.getPaging(\''+indek+'\''
              +',\'employee_id_'+indek+'\',-1)">'
            +'</button>'
          +'</li>'
          +'<li><label>&nbsp;</label>'
            +'<input type="text"'
            +' id="name_'+indek+'" disabled>'
          +'</li>'
          +'<li><label>Net Amount:</label>'
            +'<input type="text"'
            +' id="net_amount_'+indek+'"'
            +' style="text-align:right;"'
            +' size="9" disabled>'
          +'</li>'
        +'</ul>'
      +'</div>'
      
      +'<div style="float:left;margin-left:50px;margin-bottom:50px;">'
        +'<ul>'
          +'<li>'
            +'<label>Cash Account'
              +'<i style="color:red">&nbsp;*</i>:'
            +'</label>'
            +'<input type="text"'
              +' id="cash_account_id_'+indek+'"'
              +' size="9">'
              
            +'<button type="button"'
              +' id="btn_find" '
              +' onclick="EmployeeBegins.account.getPaging(\''+indek+'\''
              +',\'cash_account_id_'+indek+'\''
              +',-1'
              +',\''+CLASS_ASSET+'\''
              +')">'
            +'</button>'
          +'</li>'
          +'<li>'
            +'<label>&nbsp;</label>'
            +'<input type="text"'
              +' id="cash_account_name_'+indek+'" disabled>'
          +'</li>'
            
          +'<li>'
            +'<label>Pay Method:</label>'
              +'<select id="pay_method_'+indek+'" disabled>'
              +getEmployeePayMethod(indek)
              +'</select>'
          +'</li>'
        +'</ul>'
      +'</div>'
      
      +'<div style="clear:left;">'
        +'<details open>'
        +'<summary>Pay Field</Summary>'
          +'<div id="pay_field_'+indek+'"></div>'
        +'</details>'
      
        +'<details open>'
          +'<summary>Employee Field</Summary>'
          +'<div id="employee_field_'+indek+'"></div>'
        +'</details>'
      
        +'<details open>'
          +'<summary>Company Field</Summary>'
          +'<div id="company_field_'+indek+'"></div>'
        +'</details>'
      
        +'<details open>'
          +'<summary>Accrue Fields</Summary>'
          +'<div id="accrue_field_'+indek+'"></div>'
        +'</details>'
      +'</div>'

      +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('employee_id_'+indek).focus();
  
  if(metode=MODE_CREATE) EmployeeBegins.setDefault(indek);
}

EmployeeBegins.setDefault=(indek)=>{

  bingkai[indek].sum_pay=0;
  bingkai[indek].sum_employee=0;
  bingkai[indek].sum_company=0;
  
  var d=bingkai[indek].data_default;
  bingkai[indek].pay_frequency=d.pay_frequency;
  
  setEV('cash_account_id_'+indek, d.cash_account_id);
  setEV('cash_account_name_'+indek, d.cash_account_name);
  setEI('pay_method_'+indek, d.pay_method);

  EmployeeBegins.pay.setRows(indek,[]);
  EmployeeBegins.employee.setRows(indek, d.employee_field );
  EmployeeBegins.company.setRows(indek, d.company_field);
  EmployeeBegins.accrue.setRows(indek, d.accrue_field);
}
/*
EmployeeBegins.getPayInfo = (indek) => {
  var o = document.getElementById('pay_method_'+indek);
  var a = bingkai[indek].data_default;
  if (o.selectedIndex == 0) {
    Employees.pay.setRows(indek,a.salary_field);
  } else {
    Employees.pay.setRows(indek,a.hourly_field);
  };
}
*/  
EmployeeBegins.pay.setRows = (indek,isi) => {
  
  if(isi === undefined) isi=[];    
  var panjang = isi.length;
  var html = EmployeeBegins.pay.tableHead(indek);
  var sum_amount=0;
  var i;

  bingkai[indek].pay_field=isi;

  for (i=0; i<panjang; i++) {
    sum_amount+=Number(isi[i].amount);

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="pay_field_name_'+i+'_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' size="10"'
          +' onchange="EmployeeBegins.getField(\''+indek+'\''
          +',\'pay_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' onfocus="this.select()"'
          +' style="text-align:left">'
      +'</td>'
      
      +'<td>'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="EmployeeBegins.payrollField.getPaging(\''+indek+'\''
          +',\'pay_field_name_'+i+'_'+indek+'\','+i+''
          +',0);">'
        +'</button>'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" disabled'
          +' id="pay_expense_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].expense_account_id+'"'
          +' size="8"'
          +' style="text-align:center;" >'
      +'</td>'
      
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="pay_amount_'+i+'_'+indek+'"'
          +' value="'+isi[i].amount+'"'
          +' size="8"'
          +' style="text-align:center;"'
          +' onchange="EmployeeBegins.pay.setCell(\''+indek+'\''
          +',\'pay_amount_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'
      
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_add"'
        +' onclick="EmployeeBegins.pay.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
        +' onclick="EmployeeBegins.pay.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
      
    +'</tr>';
  }
  
  html+=EmployeeBegins.pay.tableFoot(indek);
  
  document.getElementById('pay_field_'+indek).innerHTML=html;
  if(panjang==0) EmployeeBegins.pay.addRow(indek,0);

  bingkai[indek].sum_pay=sum_amount;
  EmployeeBegins.calculateNetAmount( indek );
}

EmployeeBegins.pay.tableHead=(indek)=>{
  return '<table style="display:block;">'
    +'<caption class="required" id="title_pay_info_'+indek+'">'
      +'</caption>'
    +'<thead>'
      +'<tr>'
        +'<th colspan="3">Field Name</th>'
        +'<th>Expense Account</th>'
        +'<th>Amount</th>'
        +'<th>Action</th>'
      +'</tr>'
    +'</thead>';
}

EmployeeBegins.pay.tableFoot=(indek)=>{
  return '<tfoot>'
      +'<tr>'
        +'<td colspan="4" align="right">'
          +'<strong>Total:</strong>'
        +'</td>'
        +'<td align="center">'
          +'<strong><label id="sum_pay_'+indek+'"></strong>'
        +'</td>'
        +'<td>&nbsp;</td>'
      +'</tr>'
    +'</tfoot>'
  +'</table>';
}

EmployeeBegins.pay.addRow = (indek,baris) => {
  var oldBasket = [];
  var newBasket = [];
  var i;
  
  oldBasket = bingkai[indek].pay_field;
  for (i=0; i<oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  EmployeeBegins.pay.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.expense_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }
}

EmployeeBegins.pay.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].pay_field;
  var newBasket=[];
  var i;
  
  EmployeeBegins.pay.setRows(indek,oldBasket);
  
  for(i=0; i<oldBasket.length; i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    };
  };
  EmployeeBegins.pay.setRows(indek,newBasket);
};

EmployeeBegins.pay.setCell = (indek,id_kolom) => {
  var isi = bingkai[indek].pay_field;
  var baru = [];
  var isiEdit = {};
  var i;
  var sum_amount=0;
  
  for (i=0; i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom == ('pay_field_name_'+i+'_'+indek)){
      isiEdit.field_name = getEV(id_kolom);
      baru.push(isiEdit);
      
    } else if (id_kolom == ('pay_expense_account_id_'+i+'_'+indek)){
      isiEdit.expense_account_id = getEV(id_kolom);
      baru.push(isiEdit);
            
    } else if (id_kolom == ('pay_amount_'+i+'_'+indek)){
      isiEdit.amount = getEV(id_kolom);
      baru.push(isiEdit);
      
    } else {
      baru.push(isi[i]);
    }
    sum_amount+=Number(baru[i].amount)
  }
  bingkai[indek].sum_pay=Number(sum_amount);
  EmployeeBegins.calculateNetAmount( indek );
}

EmployeeBegins.employee.setRows = (indek,isi) => {
  
  if(isi===undefined)isi=[];    
  var panjang=isi.length;
  var html=EmployeeBegins.employee.tableHead(indek);
  var sum_amount=0;
  var i;
  
  bingkai[indek].employee_field=isi;
  
  for (var i=0;i<panjang;i++){
    sum_amount+=Number(isi[i].amount);

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="employee_field_name_'+i+'_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' onchange="EmployeeBegins.getField(\''+indek+'\''
          +',\'employee_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' size="10"'
          +' style="text-align:left">'
      +'</td>'
    
      +'<td>'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="EmployeeBegins.payrollField.getPaging(\''+indek+'\''
          +',\'employee_field_name_'+i+'_'+indek+'\','+i+''
          +',1);">'
        +'</button>'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" disabled'
          +' id="employee_liability_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].liability_account_id+'"'
          +' size="8"'
          +' style="text-align:center;">'
      +'</td>'
            
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="employee_amount_'+i+'_'+indek+'"'
          +' value="'+isi[i].amount+'"'
          +' onchange="EmployeeBegins.employee.setCell(\''+indek+'\''
          +',\'employee_amount_'+i+'_'+indek+'\')" '
          +' size="5"'
          +' style="text-align:center;">'
      +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="EmployeeBegins.employee.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
          +' id="btn_remove"'
          +' onclick="EmployeeBegins.employee.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
    +'</tr>';
  }
  
  html+=EmployeeBegins.employee.tableFoot(indek);
  
  document.getElementById('employee_field_'+indek).innerHTML=html;
  if(panjang==0) EmployeeBegins.employee.addRow(indek,0);
  
  bingkai[indek].sum_employee=sum_amount;
  EmployeeBegins.calculateNetAmount( indek );
}

EmployeeBegins.employee.tableHead=(indek)=>{
  return '<table style="display:block;">'
  +'<thead>'
    +'<tr>'
      +'<th colspan="3">Field Name</th>'
      +'<th>Liability Acc. ID</th>'
      +'<th>Amount</th>'
      +'<th colspan"2">Action</th>'
    +'</tr>'
  +'</thead>';
}

EmployeeBegins.employee.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td colspan=4 align="right">'
        +'<strong>Total:</strong>'
      +'</td>'
      +'<td align="center">'
        +'<strong>'
        +'<label id="sum_employee_'+indek+'"></label>'
        +'</strong>'
      +'</td>'
      +'<td>&nbsp;</td>'
    +'</tr>'
  +'</tfoot>'
  +'</table>';
}

EmployeeBegins.employee.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var i;
  
  oldBasket=bingkai[indek].employee_field;
  for (i=0; i<oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if (i == baris) newRow(newBasket);
  }
  if (oldBasket.length == 0) newRow(newBasket);
  EmployeeBegins.employee.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.liability_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }
}

EmployeeBegins.employee.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].employee_field;
  var baru = [];
  var isiEdit = {};
  var i;
  var sum_amount=0;
  
  for (i=0; i<isi.length; i++) {
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
  bingkai[indek].sum_employee=sum_amount;
  EmployeeBegins.calculateNetAmount( indek );
}

EmployeeBegins.employee.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].employee_field;
  var newBasket=[];
  
  EmployeeBegins.employee.setRows(indek,oldBasket);
  for(let i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  EmployeeBegins.employee.setRows(indek,newBasket);
}

EmployeeBegins.company.setRows=(indek,isi)=>{
  
  if(isi===undefined)isi=[];    
  var html=EmployeeBegins.company.tableHead(indek);
  var amount=0;
  var i;
  
  bingkai[indek].company_field=isi;
  
  for (i=0; i<isi.length; i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="company_field_name_'+i+'_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' onchange="EmployeeBegins.getField(\''+indek+'\''
          +',\'company_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' onfocus="this.select()"'
          +' style="text-align:left"'
          +' size="10">'
      +'</td>'
    
      +'<td>'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="EmployeeBegins.payrollField.getPaging(\''+indek+'\''
          +',\'company_field_name_'+i+'_'+indek+'\','+i+''
          +',2);">'
        +'</button>'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" disabled'
          +' id="company_liability_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].liability_account_id+'"'
          +' style="text-align:center;"'
          +' size="8">'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" disabled'
          +' id="company_expense_account_id_'+i+'_'+indek+'"'
          +' value="'+isi[i].expense_account_id+'"'
          +' style="text-align:center;"'
          +' size="8">'
      +'</td>'

      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="company_amount_'+i+'_'+indek+'"'
          +' value="'+isi[i].amount+'"'
          +' onchange="EmployeeBegins.company.setCell(\''+indek+'\''
          +',\'company_amount_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()"'
          +' style="text-align:center"'
          +' size="5">'
      +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="EmployeeBegins.company.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
        +' onclick="EmployeeBegins.company.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
    +'</tr>';
    amount+=Number(isi[i].amount)
  };
  html += EmployeeBegins.company.tableFoot(indek);
  bingkai[indek].sum_company=amount;
  document.getElementById('company_field_'+indek).innerHTML = html;
  if ( isi.length == 0) EmployeeBegins.company.addRow(indek,0);
  
  setiH("sum_company_"+indek, bingkai[indek].sum_company);
}

EmployeeBegins.company.tableHead=(indek)=>{
  return '<table style="display:block;">'
  +'<thead>'
    +'<tr>'
      +'<th colspan="3">Field Name</th>'
      +'<th>Liability Account</th>'
      +'<th>Expense Account</th>'
      +'<th>Amount</th>'
      +'<th>Action</th>'
    +'</tr>'
  +'</thead>';
}

EmployeeBegins.company.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td colspan="5" align="right"><b>Total:</b></td>'
      +'<td align="center">'
        +'<strong>'
          +'<label id="sum_company_'+indek+'"></label>'
        +'</strong>'
      +'</td>'
      +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
  +'</table>';
}

EmployeeBegins.company.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var i;
  
  oldBasket=bingkai[indek].company_field;
  for (i=0; i<oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if (i == baris) newRow(newBasket);
  }
  if (oldBasket.length == 0) newRow(newBasket);
  EmployeeBegins.company.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.liability_account_id='';
    myItem.expense_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }
}

EmployeeBegins.company.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].company_field;
  var baru = [];
  var isiEdit = {};
  var i;
  var amount=0;

  for (i=0; i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('company_field_name_'+i+'_'+indek)){
      isiEdit.field_name=getEV(id_kolom);
      baru.push(isiEdit);
            
    }else if(id_kolom==('company_liability_account_id_'+i+'_'+indek)){
      isiEdit.liability_account_id=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('company_expense_account_id_'+i+'_'+indek)){
      isiEdit.expense_account_id=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('company_amount_'+i+'_'+indek)){
      isiEdit.amount=getEV(id_kolom);
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
    amount+=Number(baru[i].amount);
  }
  bingkai[indek].sum_company=amount;
  setiH("sum_company_"+indek, bingkai[indek].sum_company );
}

EmployeeBegins.company.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].company_field;
  var newBasket=[];
  var i;
  
  EmployeeBegins.company.setRows(indek,oldBasket);
  for (i=0; i<oldBasket.length; i++) {
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  EmployeeBegins.company.setRows(indek,newBasket);
}

EmployeeBegins.calculateNetAmount=(indek)=>{
  var gross_amount=Number(bingkai[indek].sum_pay);
  var deduction_amount=Number(bingkai[indek].sum_employee);
  var net_amount=gross_amount-deduction_amount;
  
  if(document.getElementById('sum_pay_'+indek)){
    setiH("sum_pay_"+indek, gross_amount);
  }
  
  if(document.getElementById('sum_employee_'+indek)){
    setiH("sum_employee_"+indek, deduction_amount)
  };
    
  if(document.getElementById('net_amount_'+indek)){
    setEV('net_amount_'+indek, net_amount);
  }
}

EmployeeBegins.setEmployee=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  EmployeeBegins.getEmployee(indek);
}

EmployeeBegins.getEmployee=(indek)=>{

  EmployeeBegins.employeev.getOne(indek,
  getEV('employee_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('name_'+indek, d.name);
      setEI('pay_method_'+indek, d.pay_method );
      
      EmployeeBegins.pay.setRows(indek, JSON.parse(d.pay_field) );
      EmployeeBegins.employee.setRows(indek, JSON.parse(d.employee_field) );
      EmployeeBegins.company.setRows(indek, JSON.parse(d.company_field) );
      
    }else{
      setEV('name_'+indek, '');
      setEI('pay_method_'+indek, 0);
      
      EmployeeBegins.pay.setRows(indek,[] );
      EmployeeBegins.employee.setRows(indek,[] );
      EmployeeBegins.company.setRows(indek,[] );
      EmployeeBegins.accrue.setRows(indek,[] );
    }
    EmployeeBegins.calculateNetAmount( indek );
  });
}

EmployeeBegins.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  setEV(id_kolom, data.account_id);
 
  switch(nama_kolom){
    case "cash":
      break;
    case "gl":
      EmployeeBegins.pay.setCell(indek,id_kolom);
      break;
    case "employee":
      EmployeeBegins.employee.setCell(indek,id_kolom);
      break;
    case "liability":
      EmployeeBegins.company.setCell(indek,id_kolom);
      break;
    case "expense":
      EmployeeBegins.company.setCell(indek,id_kolom);
      break;
  }
}

EmployeeBegins.createExecute=(indek)=>{

  var pay_field=JSON.stringify(bingkai[indek].pay_field);
  var employee_field=JSON.stringify(bingkai[indek].employee_field);
  var company_field=JSON.stringify(bingkai[indek].company_field);
  var accrue_field=JSON.stringify(bingkai[indek].accrue_field);

  db.execute(indek,{
    query:"INSERT INTO employee_begins"
      +"(admin_name,company_id,"
      +" employee_id,cash_account_id,"
      +" pay_field,employee_field,company_field,accrue_field)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("employee_id_"+indek)+"'"
      +",'"+getEV("cash_account_id_"+indek)+"'"
      +",'"+pay_field+"'"
      +",'"+employee_field+"'"
      +",'"+company_field+"'"
      +",'"+accrue_field+"'"
      +")"
  });
}

EmployeeBegins.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT *"
      +" FROM employee_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('employee_id_'+indek, d.employee_id);
      setEV('name_'+indek, d.employee_name);
      setEV('cash_account_id_'+indek, d.cash_account_id);
      setEV('cash_account_name_'+indek, d.cash_account_name);
      
      setEI('pay_method_'+indek, d.pay_method);
      setEV('net_amount_'+indek, ribuan(d.net_amount) );
      
      EmployeeBegins.pay.setRows(indek, JSON.parse( d.pay_field) );
      EmployeeBegins.employee.setRows(indek, JSON.parse( d.employee_field ) );
      EmployeeBegins.company.setRows(indek, JSON.parse( d.company_field ) );
      EmployeeBegins.accrue.setRows(indek, JSON.parse( d.accrue_field ) );
    }
    message.none(indek);
    return callback();
  })
}

EmployeeBegins.formUpdate=(indek,employee_id)=>{
  bingkai[indek].employee_id=employee_id;
  EmployeeBegins.form.modeUpdate(indek);
}

EmployeeBegins.updateExecute=(indek)=>{
  var pay_field=JSON.stringify(bingkai[indek].pay_field);
  var employee_field=JSON.stringify(bingkai[indek].employee_field);
  var company_field=JSON.stringify(bingkai[indek].company_field);
  var accrue_field=JSON.stringify(bingkai[indek].accrue_field);
  
  db.execute(indek,{
    query:"UPDATE employee_begins"
      +" SET employee_id='"+getEV("employee_id_"+indek)+"',"
      +" cash_account_id='"+getEV("cash_account_id_"+indek)+"',"
      +" pay_field='"+pay_field+"',"
      +" employee_field='"+employee_field+"',"
      +" company_field='"+company_field+"',"
      +" accrue_field='"+accrue_field+"'"
      
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(p)=>{
    if(p.err.id==0) EmployeeBegins.finalPath(indek);
  });
}

EmployeeBegins.formDelete=(indek,employee_id)=>{
  bingkai[indek].employee_id=employee_id;
  EmployeeBegins.form.modeDelete(indek);
}

EmployeeBegins.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM employee_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(p)=>{
    if(p.err.id==0) EmployeeBegins.finalPath(indek);
  });
}

EmployeeBegins.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM employee_begins "
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" AND employee_id LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

EmployeeBegins.search=(indek)=>{
  EmployeeBegins.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT employee_id,employee_name,net_amount,"
        +" user_name,date_modified "
        +" FROM employee_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND employee_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR employee_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      EmployeeBegins.readShow(indek);
    });
  });
}

EmployeeBegins.exportExecute=(indek)=>{
  var table_name=EmployeeBegins.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

EmployeeBegins.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT employee_id,employee_name,net_amount,"
      +" user_name,date_modified "
      +" FROM employee_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY employee_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    EmployeeBegins.selectShow(indek);
  });
}

EmployeeBegins.selectShow=(indek)=>{
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
      +'<th colspan="2">Employee ID</th>'
      +'<th>Name</th>'
      +'<th>Net Amount</th>'
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
        +' name="checked_'+indek+'" >'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].employee_id+'</td>'
      +'<td align="left">'+xHTML(d[x].employee_name)+'</td>'
      +'<td align="center">'+ribuan(d[x].net_amount)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

EmployeeBegins.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM employee_begins"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND employee_id='"+d[i].employee_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

EmployeeBegins.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO employee_begins"
        +"(admin_name,company_id,"
        +" employee_id,cash_account_id,"
        +" pay_field,employee_field,company_field,accrue_field)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // employee_id
        +",'"+d[i][2]+"'" // cash_account_id
        +",'"+d[i][3]+"'" // pay_field
        +",'"+d[i][4]+"'" // employee_field
        +",'"+d[i][5]+"'" // company_field
        +",'"+d[i][6]+"'" // accrue_field
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

EmployeeBegins.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM employee_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+getEV('employee_id_'+indek)+"'"
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

EmployeeBegins.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('employee_id_'+indek).value;
  document.getElementById('employee_id_'+indek).value=id;
  document.getElementById('employee_id_'+indek).focus();
  //--disabled
  document.getElementById('employee_id_'+indek).disabled=false;
  document.getElementById('employee_btn_'+indek).disabled=false;
}

EmployeeBegins.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{EmployeeBegins.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{EmployeeBegins.properties(indek);})
  }
}

EmployeeBegins.setField=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, data.field_name);
  EmployeeBegins.getField(indek,id_kolom,baris);
}

EmployeeBegins.getField=(indek_,id_kolom_,baris_)=>{

  this.indek=indek_;
  this.id_kolom=id_kolom_;
  this.baris=baris_;
  var nilai=getEV(this.id_kolom)
  
  setEV(id_kolom, nilai);// isi text;

  EmployeeBegins.payrollField.getOne(this.indek,
    nilai,
  (paket)=>{
    
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);    
      switch (id_kolom){
        case "pay_field_name_"+baris+'_'+indek:
          // update display
          setEV('pay_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          
          // update array
          EmployeeBegins.pay.setCell(indek,id_kolom);
          EmployeeBegins.pay.setCell(indek,'pay_expense_account_id_'+baris+'_'+indek);
          break;

        case "employee_field_name_"+baris+'_'+indek:
          setEV('employee_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          EmployeeBegins.employee.setCell(indek,id_kolom);
          EmployeeBegins.employee.setCell(indek,'employee_liability_account_id_'+baris+'_'+indek);
          break;          
          
        case "company_field_name_"+baris+'_'+indek:
          setEV('company_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          setEV('company_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          EmployeeBegins.company.setCell(indek,id_kolom);
          EmployeeBegins.company.setCell(indek,'company_liability_account_id_'+baris+'_'+indek);
          EmployeeBegins.company.setCell(indek,'company_expense_account_id_'+baris+'_'+indek);
          break;          
          
        case "accrue_field_name_"+baris+'_'+indek:
          EmployeeBegins.accrue.setCell(indek,id_kolom);
          break;          
          
        default:
          alert(id_kolom+' belum kedaftar.');
      }
    } else {
      // tidak terdaftar;
    }
  });
}

EmployeeBegins.accrue.setRows = (indek,isi) => {
  
  if(isi === undefined) isi=[];    
  var panjang = isi.length;
  var html = EmployeeBegins.accrue.tableHead(indek);
  var i;

  bingkai[indek].accrue_field=isi;

  for (i=0; i<panjang; i++) {

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_field_name_'+i+'_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' size="10"'
          +' onchange="EmployeeBegins.getField(\''+indek+'\''
          +',\'accrue_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' onfocus="this.select()"'
          +' style="text-align:left">'
      +'</td>'
      
      +'<td>'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="EmployeeBegins.payrollField.getPaging(\''+indek+'\''
          +',\'accrue_field_name_'+i+'_'+indek+'\','+i+''
          +',3);">'
        +'</button>'
      +'</td>'
      
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_given_'+i+'_'+indek+'"'
          +' value="'+isi[i].given+'"'
          +' size="5"'
          +' style="text-align:center;"'
          +' onchange="EmployeeBegins.accrue.setCell(\''+indek+'\''
          +',\'accrue_given_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_taken_'+i+'_'+indek+'"'
          +' value="'+isi[i].taken+'"'
          +' size="5"'
          +' style="text-align:center;"'
          +' onchange="EmployeeBegins.accrue.setCell(\''+indek+'\''
          +',\'accrue_taken_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" >'
      +'</td>'
            
      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="EmployeeBegins.accrue.addRow(\''+indek+'\','+i+')" >'
        +'</button>'        
        +'<button type="button"'
          +' id="btn_remove"'
          +' onclick="EmployeeBegins.accrue.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
      
    +'</tr>';
  }
  
  html+=EmployeeBegins.accrue.tableFoot(indek);
  document.getElementById('accrue_field_'+indek).innerHTML=html;
  if(panjang==0) EmployeeBegins.accrue.addRow(indek,0);
}

EmployeeBegins.accrue.tableHead=(indek)=>{
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

EmployeeBegins.accrue.tableFoot=(indek)=>{
  return '<tfoot>'
      +'<tr>'
        +'<td>&nbsp;</td>'
      +'</tr>'
    +'</tfoot>'
  +'</table>';
}

EmployeeBegins.accrue.addRow = (indek,baris) => {
  var oldBasket = [];
  var newBasket = [];
  var i;
  
  oldBasket = bingkai[indek].accrue_field;
  for (i=0; i<oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  EmployeeBegins.accrue.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.given=0;
    myItem.taken=0;
    newBas.push(myItem);        
  }
}

EmployeeBegins.accrue.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].accrue_field;
  var newBasket=[];
  var i;
  
  EmployeeBegins.accrue.setRows(indek,oldBasket);
  
  for(i=0; i<oldBasket.length; i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    };
  };
  EmployeeBegins.accrue.setRows(indek,newBasket);
};

EmployeeBegins.accrue.setCell = (indek,id_kolom) => {

  var isi = bingkai[indek].accrue_field;
  var baru = [];
  var isiEdit = {};
  var i;
  
  for (i=0; i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom == ('accrue_field_name_'+i+'_'+indek)){
      isiEdit.field_name = getEV(id_kolom);
      baru.push(isiEdit);
                  
    } else if (id_kolom == ('accrue_given_'+i+'_'+indek)){
      isiEdit.given = getEV(id_kolom);
      baru.push(isiEdit);
      
    } else if (id_kolom == ('accrue_taken_'+i+'_'+indek)){
      isiEdit.taken = getEV(id_kolom);
      baru.push(isiEdit);
      
    } else {
      baru.push(isi[i]);
    }
  }
}



// eof: 1001;1100;1112;1148;1151;1158;
