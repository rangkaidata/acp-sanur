/*
 * auth: budiono;
 * file: E5;
 * path: /accounting/payrolls/employees.js;
 * ---------------------------------------;
 * date: sep-12, 22:11, tue-2023; new;
 * edit: sep-19, 20:39, tue-2023; 
 * -----------------------------; happy new year 2024;
 * edit: jan-02, 10:44, tue-2024; mringkas;
 * edit: jan-08, 09:28, mon-2024; mringkas ke-2; with oop;
 * edit: jan-09, 10:26, tue-2024; remove look+getOne;
 * edit: jan-10, 15:04, wed-2024; re-write with object;
 * edit: jan-31, 08:16, wed-2024; testing;
 * edit: jun-10, 12:53, mon-2024; BasicSQL;
 * edit: jul-02, 12:43, tue-2024; r4;
 * edit: jul-30, 10:41, tue-2024; r11;
 * edit: sep-12, 11:52, thu-2024; r19;
 * edit: nov-25, 08:01, mon-2024; #27; locker;
 * edit: dec-01, 17:50, sun-2024; #27;
 * -----------------------------; happy new year 2025;
 * edit: feb-22, 16:18, sat-2025; #41; file_id;
 * edit: mar-11, 21:12, tue-2025; #43; deep-folder;
 * edit: mar-26, 00:27, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:00, thu-2025; #50; can export to csv;
 * edit: jun-04, 16:16, wed-2025; #57; payroll_fields;
 * edit: jun-05, 06:07, thu-2025; #57; 
 * edit: jun-10, 13:15, tue-2025; #57; add given+taken in accrue_field;
 * edit: aug-18, 17:35, mon-2025; #68; add date obj;
 * edit: nov-21, 06:37, fri-2025; #81; 
 */

'use strict';

var Employees={};

Employees.table_name='employees';
Employees.pay={};
Employees.employee={};
Employees.company={};
Employees.accrue={};
Employees.form=new ActionForm2(Employees);
Employees.account=new AccountLook(Employees);
Employees.payrollField=new PayrollFieldLook(Employees);

Employees.show=(karcis)=>{
  karcis.modul=Employees.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newEmp=new BingkaiUtama(karcis);
    var indek=newEmp.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Employees.form.modePaging(indek,Employees);
        Employees.getDefault(indek);
      });
    });
  }else{
    show(baru);
  }
}

Employees.getDefault=(indek)=>{
  EmployeeDefaults.getDefault(indek);
}

Employees.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM employees "
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

Employees.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Employees.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT "
        +" employee_id,name,address,pay_method, "
        +" user_name,date_modified "
        +" FROM employees "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY employee_id "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Employees.readShow(indek);
    });
  })
}

Employees.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)  
    +'<table border=1>'
      +'<tr>'
        +'<th colspan="2">Employee ID</th>'
        +'<th>Name</th>'
        +'<th>Address</th>'
        +'<th>Frequency</th>'
        +'<th>User</th>'
        +'<th>Modified</th>'
        +'<th colspan=2>Action</th>'
      +'</tr>';

    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td align="left">'+d[x].employee_id+'</td>'
          +'<td align="left">'+xHTML(d[x].name)+'</td>'
          +'<td align="left">'
            +xHTML(JSON.parse(d[x].address).street_1)+'</td>'
          +'<td align="left">'
            +array_pay_method[d[x].pay_method]+'</td>'
          +'<td align="center">'+d[x].user_name+'</td>'
          +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
          +'<td align="center">'
            +'<button type="button"'
              +' id="btn_change"'
              +' onclick="Employees.formUpdate(\''+indek+'\''
              +',\''+d[x].employee_id+'\');">'
            +'</button>'
          +'</td>'
          +'<td align="center">'
            +'<button type="button"'
            +' id="btn_delete"'
            +' onclick="Employees.formDelete(\''+indek+'\''
            +',\''+d[x].employee_id+'\');">'
            +'</button>'
          +'</td>'
        +'</tr>';
      };
    };
  html += '</table></div>';
  content.html(indek,html);
  if (p.err.id != 0) content.infoPaket(indek,p);
  Employees.form.addPagingFn(indek);
}

Employees.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +'<div id="msg_'+indek+'" '
        +' style="margin-bottom:1rem;">'
      +'</div>'
      +'<form autocomplete="off" style="padding-bottom:10rem;">'
        +'<div style="float:left;border:0px solid red;">'
          +'<ul>'
            +'<li>'
              +'<label>Employee ID:<i class="required"> *</i></label>'
              +'<input type="text"'
              +' id="employee_id_'+indek+'">'
            +'</li>'
            +'<li>'
              +'<label>Name</label>'
              +'<input type="text"'
              +' id="name_'+indek+'">'
            +'</li>'
            +'<li>'
              +'<label>&nbsp;</label>'
              +'<label>'
                +'<input type="checkbox"'
                +' id="inactive_'+indek+'">'
                +'Inactive'
              +'</label>'
            +'</li>'
          +'</ul>'
        +'</div>'
        
        +'<div style="border:0px solid blue;">'
          +'<ul>'
            +'<li>'
              +'<label>&nbsp;</label>'
              +'<label>'
                +'<input type="checkbox"'
                  +' id="is_sales_rep_'+indek+'">'
                  +'Sales Rep'
                +'</label>'
            +'</li>'      
            +'<li>'
              +'<label>&nbsp;</label>'
              +'<label>'
                +'<input type="checkbox" '
                  +' id="is_buyer_'+indek+'">'
                +'Buyer'
              +'</label>'
            +'</li>'
            +'<li>'
              +'<label>&nbsp;</label>'
              +'<label>'
              +'<input type="checkbox"'
                +' id="is_supervisor_'+indek+'">'
                +'Supervisor'+'</label>'
            +'</li>'
          +'</ul>'
        +'</div>'
    
        +'<div style="clear:left;">'
          +'<details open>'
            +'<summary>General</summary>'
            +'<div style="display:grid;'
              +'grid-template-columns:repeat(3,1fr);">'
            +'<div style="padding-right:10px;">'
            +'<ul>'
              +'<li>'
                +'<label>Address</label>&nbsp;'
                +'<input type="text"'
                  +' id="address_1_'+indek+'">'
              +'</li>'
              +'<li>'
                +'<label>&nbsp;</label>&nbsp;'
                +'<input type="text" '
                  +' id="address_2_'+indek+'">'
              +'</li>'
              +'<li><label>City</label>&nbsp;'
                +'<input type="text"'
                  +' id="city_'+indek+'">'
              +'</li>'
              +'<li>'
                +'<label>State</label>&nbsp;'
                +'<input type="text"'
                  +' id="state_'+indek+'">'
              +'</li>'
              +'<li><label>Zip</label>&nbsp;'
                +'<input type="text"'
                  +' id="zip_'+indek+'">'
              +'</li>'
              +'<li><label>Country</label>&nbsp;'
                +'<input type="text"'
                +' id="country_'+indek+'">'
              +'</li>'
          +'</ul>'
        +'</div>'
        
        +'<div style="padding-right:10px;">'
          +'<ul>'
            +'<li><label>Social Security#</label>&nbsp;'
              +'<input type="text" '
              +' id="social_security_'+indek+'"'
              +' size="9">'
            +'</li>'
            +'<li><label>Type</label>&nbsp;'
              +'<input type="text"'
              +' id="type_'+indek+'"'
              +' size="9">'
            +'</li>'
          +'</ul>'
          +'<br>'
          +'<ul>'
            +'<li><label>Phone</label>&nbsp;'
              +'<input type="text"'
              +' id="phone_'+indek+'"'
              +' size="12">'
            +'</li>'
            +'<li><label>Mobile</label>&nbsp;'
              +'<input type="text"'
              +' id="mobile_'+indek+'"'
              +' size="12">'
            +'</li>'
            +'<li><label>Email</label>&nbsp;'
              +'<input type="text"'
              +' id="email_'+indek+'"'
              +' size="20">'
            +'</li>'
            +'<li><label>Birth Date</label>&nbsp;'
              +'<input type="date"'
                +' id="birth_date_'+indek+'"'
                +' onblur="dateFakeShow('+indek+',\'birth_date\')"'
                +' style="display:none;">'
              +'<input type="text"'
                +' id="birth_date_fake_'+indek+'"'
                +' onfocus="dateRealShow('+indek+',\'birth_date\')"'
                +' size="9">'
            +'</li>'
            +'<li><label>Gender</label>&nbsp;'
              +'<select id="gender_'+indek+'">'
                +'<option>0-Male</option>'
                +'<option>1-Female</option>'
              +'</select>'
            +'</li>'
            +'<li><label>Marital Status</label>&nbsp;'
              +'<select id="marital_status_'+indek+'">'
                +'<option>0-Married</option>'
                +'<option>1-Single</option>'
                +'<option>2-Divorced</option>'
                +'<option>3-Widowed</option>'
                +'<option>4-Other</option>'
              +'</select>'
            +'</li>'
          +'</ul>'
        +'</div>'
     
        +'<div>'
          +'<ul>'
            +'<li>'
              +'<label><input type="checkbox"'
              +' id="pensiun_'+indek+'">Pension</label>'
            +'</li>'
            +'<li>'
              +'<label><input type="checkbox"'
              +' id="deffered_'+indek+'">Deffered</label>'
            +'</li>'
          +'</ul>'
          +'<br>'
          
          +'<label style="display:block;">Hired:</label>'
            +'<input type="date"'
              +' id="hired_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'hired_date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="hired_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'hired_date\')"'
              +' size="9">'
            
          +'<label style="display:block;">Raise:</label>'
            +'<input type="date"'
              +' id="raise_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'raise_date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="raise_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'raise_date\')"'
              +' size="9">'
          +'<label style="display:block;">Terminated:</label>'
            +'<input type="date"'
              +' id="terminated_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'terminated_date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="terminated_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'terminated_date\')"'
              +' size="9">'
          
        +'</div>'
      +'</div>'
      +'</details>'
    +'</div>'
    
    +'<details open>'
      +'<summary>Pay Field</summary>'    
        +'<div style="float:left;border:0px solid blue;display:block;" >'
          +'<ul>'
            +'<li><label>Pay Method</label>'
              +'<select id="pay_method_'+indek+'"'
                +' onChange="Employees.getPayInfo(\''+indek+'\')">'
                +getEmployeePayMethod(indek)
              +'</select>'
            +'</li>'
            +'<li><label>Hourly Billing</label>'
              +'<input type="text"'
              +' id="pay_rate_'+indek+'"'
              +' style="text-align:center;"'
              +' size="5">'
            +'</li>'
          +'</ul>'
        +'</div>'
      
        +'<div style="float:left;padding-left:100px;border:0px solid red;">'
          +'<ul>'
            +'<li><label>Frequency</label>'
              +'<select id="pay_frequency_'+indek+'">'
              +'<option>0-Weekly</option>'
              +'<option>1-Bi-weekly</option>'
              +'<option>2-Semi-monthly</option>'
              +'<option>3-Monthly</option>'
              +'<option>4-Annualy</option>'
              +'</select>'
            +'</li>'        
            +'<li><label>Hours Pay Periode:</label>'
              +'<input type="text"'
              +' id="pay_hour_'+indek+'"'
              +' style="text-align:center;"'
              +' size="5">'
            +'</li>'
          +'</ul>'
        +'</div>'
    
        +'<div style="clear:left;">'
          +'<div id="pay_field_'+indek+'"'
          +' style="padding-top:1rem;width:0;"></div>'
      +'</div>'
    +'</details>'
    
    +'<details open>'
      +'<summary>Employee Field</summary>'
      +'<div id="employee_field_'+indek+'"'
        +' style="width:0;">'
      +'</div>'
    +'</details>'

    +'<details open>'
      +'<summary>Company Field</summary>'
      +'<div id="company_field_'+indek+'"'
        +' style="width:0;">'
      +'</div>'
    +'</details>'
    
    +'<details open>'
      +'<summary>Accrue Field</summary>'
      +'<div id="accrue_field_'+indek+'"'
        +' style="width:0;">'
      +'</div>'
    +'</details>'
    
    +'</form>'
  +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  if(metode==MODE_CREATE){
    document.getElementById("employee_id_"+indek).focus();  
  }else{
    document.getElementById("employee_id_"+indek).disabled=true;
  }
    
  Employees.setDefault(indek);
}

Employees.setDefault=(indek)=>{
  bingkai[indek].pay_field=[];
  var a=bingkai[indek].data_default;
  
  Employees.getPayInfo(indek);
  
  // Employees.pay.setRows(indek, a.salary_field);
  Employees.employee.setRows(indek, a.employee_field);
  Employees.company.setRows(indek, a.company_field);
  Employees.accrue.setRows(indek, a.accrue_field);
  
  setEI('title_pay_info_'+indek,"Salary");  
}

Employees.pay.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  
  var panjang=isi.length;
  var html=Employees.pay.tableHead(indek);
  var i;
  
  bingkai[indek].pay_field=isi;

  for (i=0; i<panjang; i++) {
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="pay_field_name_'+i+'_'+indek+'"'
        +' value="'+isi[i].field_name+'"'
        +' size="10"'
        +' style="text-align:left"'
        +' onchange="Employees.getField(\''+indek+'\''
        +',\'pay_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
        +' onfocus="this.select()">'
    +'</td>'

    +'<td><button type="button"'
      +' class="btn_find" '
      +' onclick="Employees.payrollField.getPaging(\''+indek+'\''
      +',\'pay_field_name_'+i+'_'+indek+'\','+i+',0);">'
      +'</button>'
    +'</td>'
          
    +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text" disabled'
        +' id="pay_expense_account_id_'+i+'_'+indek+'"'
        +' name="pay_expense_account_id_'+indek+'"'
        +' value="'+isi[i].expense_account_id+'"'
        +' style="text-align:center;"'
        +' size="8">'
    +'</td>'
      
    +'<td  align="center" style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="pay_rate_'+i+'_'+indek+'"'
      +' value="'+isi[i].rate+'"'
      +' onchange="Employees.pay.setCell(\''+indek+'\''
      +',\'pay_rate_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:center;"'
      +' size="9">'
    +'</td>'
    
    +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="pay_salary_'+i+'_'+indek+'"'
        +' value="'+isi[i].salary+'"'
        +' onchange="Employees.pay.setCell(\''+indek+'\''
        +',\'pay_salary_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" '
        +' style="text-align:center;"'
        +' size="9">'
    +'</td>'

    +'<td align="center">'
      +'<button type="button"'
        +' id="btn_add"'
        +' onclick="Employees.pay.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
      +' id="btn_remove"'
        +' onclick="Employees.pay.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }
  html += Employees.pay.tableFoot(indek);
  document.getElementById('pay_field_'+indek).innerHTML=html;  
  if (panjang == 0) Employees.pay.addRow(indek,0);
}

Employees.pay.tableHead=(indek)=>{
  return '<table>'
    +'<caption class="required" id="title_pay_info_'+indek+'">'
    +'</caption>'
    +'<thead>'
      +'<tr>'
        +'<th colspan="3">Field Name</th>'
        +'<th>Expense Acc. ID</th>'
        +'<th>Rate</th>'
        +'<th>Salary</th>'
        +'<th>Add/Rem</th>'
      +'</tr>'
    +'</thead>';
}

Employees.pay.tableFoot=(indek)=>{
  return '<tfoot>'
      +'<tr>'
        +'<td colspan="7">&nbsp;</td>'
      +'</tr>'
    +'</tfoot>'
  +'</table>';
}

Employees.getPayInfo = (indek) => {
  var o = document.getElementById('pay_method_'+indek);
  var a = bingkai[indek].data_default;
  if (o.selectedIndex == 0) {
    Employees.pay.setRows(indek,a.salary_field);
  } else {
    Employees.pay.setRows(indek,a.hourly_field);
  };
  
  document.getElementById('title_pay_info_'+indek).innerHTML
  =o.options[o.selectedIndex].text;
}

Employees.pay.addRow=(indek,baris,e)=>{
  var oldBasket = [];
  var newBasket = [];
  var i;
  
  oldBasket=bingkai[indek].pay_field;
  for (i = 0; i < oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if (i == baris) Employees.pay.newRow(newBasket);
  }
  if (oldBasket.length == 0) Employees.pay.newRow(newBasket);
  Employees.pay.setRows(indek,newBasket);

}

Employees.pay.newRow = (newBasket) => {
  var myItem = {};
  myItem.row_id = newBasket.length+1;
  myItem.field_name = '';
  myItem.expense_account_id = '';
  myItem.rate = 0;
  myItem.salary = 0;
  newBasket.push(myItem);
}

Employees.pay.removeRow = (indek,number) => {
  var oldBasket = bingkai[indek].pay_field;
  var newBasket = [];
  var i;
  
  Employees.pay.setRows(indek,oldBasket);
  for (i=0; i<oldBasket.length; i++) {
    if (i != (number)) {
      newBasket.push(oldBasket[i]);
    }
  }
  Employees.pay.setRows(indek,newBasket);
}

Employees.pay.setCell = (indek,id_kolom) => {
  var isi = bingkai[indek].pay_field;
  var baru = [];
  var isiEdit = {};
  var i;
  
  for ( i=0; i<isi.length; i++) {
    isiEdit = isi[i];
    
    if (id_kolom == ('pay_field_name_'+i+'_'+indek)) {
      isiEdit.field_name = getEV(id_kolom);
      baru.push(isiEdit);
            
    } else if (id_kolom == ('pay_expense_account_id_'+i+'_'+indek)) {
      isiEdit.expense_account_id = getEV(id_kolom);
      baru.push(isiEdit);
      
    } else if (id_kolom == ('pay_rate_'+i+'_'+indek)) {
      isiEdit.rate = getEV(id_kolom);
      baru.push(isiEdit);
      
    } else if (id_kolom == ('pay_salary_'+i+'_'+indek)) {
      isiEdit.salary = getEV(id_kolom);
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
  }
  bingkai[indek].pay_field = baru;
}

Employees.employee.setRows = (indek,isi) => {
  if (isi === undefined) isi = [];    
  var panjang = isi.length;
  var html = Employees.employee.tableHead(indek);
  var i;

  bingkai[indek].employee_field = isi;
  
  for (i=0; i<panjang; i++) {
    html += '<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="employee_field_name_'+i+'_'+indek+'"'
        +' value="'+isi[i].field_name+'"'
        +' onchange="Employees.getField(\''+indek+'\''
        +',\'employee_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
        +' onfocus="this.select()"'
        +' style="text-align:left"'
        +' size="10">'
    +'</td>'
      
    +'<td><button type="button"'
      +' class="btn_find" '
      +' onclick="Employees.payrollField.getPaging(\''+indek+'\''
      +',\'employee_field_name_'+i+'_'+indek+'\','+i+',1);">'
      +'</button>'
    +'</td>'

    +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text" disabled'
        +' id="employee_liability_account_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].liability_account_id+'"'
        +' style="text-align:center;"'
        +' size="8">'
    +'</td>'
    
    +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="employee_amount_'+i+'_'+indek+'"'
        +' value="'+isi[i].amount+'"'
        +' onchange="Employees.employee.setCell(\''+indek+'\''
        +',\'employee_amount_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' style="text-align:center"'
        +' size="9">'
    +'</td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="Employees.employee.addRow(\''+indek+'\','+i+')" >'
      +'</button>'

      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="Employees.employee.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }
  html+=Employees.employee.tableFoot(indek);
  document.getElementById('employee_field_'+indek).innerHTML=html;
  if(panjang==0)Employees.employee.addRow(indek,0);
}

Employees.employee.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
      +'<tr>'
      +'<th colspan="3">Field Name</th>'
      +'<th>Liability Account</th>'
      +'<th>Amount</th>'
      +'<th>Add/Rem</th>'
      +'</tr>'
    +'</thead>';
}

Employees.employee.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Employees.employee.addRow=(indek,baris)=>{
  var oldBasket = [];
  var newBasket = [];
  var i;
  
  oldBasket = bingkai[indek].employee_field;
  for(i=0; i<oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if (i == baris) newRow(newBasket);
  }
  if (oldBasket.length == 0) newRow(newBasket);
  Employees.employee.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.liability_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }
}

Employees.employee.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].employee_field;
  var newBasket=[];
  
  Employees.employee.setRows(indek,oldBasket);
  for(let i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  Employees.employee.setRows(indek,newBasket);
}

Employees.employee.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].employee_field;
  var baru = [];
  var isiEdit = {};

  for (var i=0;i<isi.length; i++){
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
  }
}

Employees.company.setRows=(indek,isi)=>{
  
  if(isi===undefined)isi=[];    
  var panjang=isi.length;
  var html=Employees.company.tableHead(indek);
  var i;
  bingkai[indek].company_field=isi;
  
  for (i=0; i<panjang; i++) {
    html += '<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="company_field_name_'+i+'_'+indek+'"'
        +' value="'+isi[i].field_name+'"'
        
        +' onchange="Employees.getField(\''+indek+'\''
        +',\'company_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
        
        +' onfocus="this.select()"'
        +' style="text-align:left"'
        +' size="10">'
    +'</td>'
      
    +'<td><button type="button"'
      +' class="btn_find" '
      +' onclick="Employees.payrollField.getPaging(\''+indek+'\''
      +',\'company_field_name_'+i+'_'+indek+'\','+i+',2);">'
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

    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="company_amount_'+i+'_'+indek+'"'
        +' value="'+isi[i].amount+'"'
        +' onchange="Employees.company.setCell(\''+indek+'\''
        +',\'company_amount_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' style="text-align:center"'
        +' size="9">'
    +'</td>'
      
    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="Employees.company.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="Employees.company.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }
  html+=Employees.company.tableFoot(indek);
  document.getElementById('company_field_'+indek).innerHTML=html;
  if (panjang==0) Employees.company.addRow(indek,0);
}

Employees.company.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
      +'<tr>'
      +'<th colspan="3">Field Name</th>'
      +'<th>Liability Account</th>'
      +'<th>Expense Account</th>'
      +'<th>Amount</th>'
      +'<th>Add/Rem</th>'
      +'</tr>'
    +'</thead>';
}

Employees.company.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan="7">&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Employees.company.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var i;
  
  oldBasket=bingkai[indek].company_field;
  
  for(i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  Employees.company.setRows(indek,newBasket);

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

Employees.company.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].company_field;
  var baru = [];
  var isiEdit = {};
  var i;

  for (i=0; i<isi.length; i++){
    isiEdit = isi[i];
    
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
  }
}

Employees.company.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].company_field;
  var newBasket=[];
  var i;
  
  Employees.company.setRows(indek,oldBasket);
  for(i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  Employees.company.setRows(indek,newBasket);
}

Employees.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, d.account_id);

  switch (id_kolom){
    case "pay_expense_account_id_"+baris+'_'+indek:
      Employees.pay.setCell(indek,id_kolom);
      break;
    case "employee_liability_account_id_"+baris+'_'+indek:
      Employees.employee.setCell(indek,id_kolom);
      break;
    case "company_liability_account_id_"+baris+'_'+indek:
      Employees.company.setCell(indek,id_kolom);
      break;
    case "company_expense_account_id_"+baris+'_'+indek:
      Employees.company.setCell(indek,id_kolom);
      break;
    default:
      alert('['+id_kolom+'] kolom tidak terdaftar...');
  }
}

Employees.createExecute = (indek) => {

  var address=JSON.stringify({
    street_1: getEV('address_1_'+indek),
    street_2: getEV('address_2_'+indek),
    city: getEV('city_'+indek),
    state: getEV('state_'+indek),
    zip: getEV('zip_'+indek),
    country: getEV('country_'+indek)
  });
  var pay_field = JSON.stringify(bingkai[indek].pay_field);
  var employee_field = JSON.stringify(bingkai[indek].employee_field);
  var company_field = JSON.stringify(bingkai[indek].company_field);
  var accrue_field = JSON.stringify(bingkai[indek].accrue_field);
  var custom_fields = JSON.stringify(["new1","new2"]); // array
  
  db.execute(indek,{
    query:"INSERT INTO employees "
      +"(admin_name,company_id,employee_id,name,"
      +" inactive,is_sales_rep,is_buyer,is_supervisor,"
      +" address,social_security,type,phone,mobile,email,"
      +" birth_date,gender,marital_status,"
      +" pension,deffered,"
      +" hired_date,raise_date,terminated_date,"
      +" pay_method,pay_frequency,"
      +" pay_rate,pay_hour,"
      +" pay_field,employee_field,company_field,accrue_field,"
      +" custom_fields)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("employee_id_"+indek)+"'"
      +",'"+getEV("name_"+indek)+"'"
      +",'"+getEC("inactive_"+indek)+"'"
      +",'"+getEC("is_sales_rep_"+indek)+"'"
      +",'"+getEC("is_buyer_"+indek)+"'"
      +",'"+getEC("is_supervisor_"+indek)+"'"
      +",'"+address+"'"
      +",'"+getEV('social_security_'+indek)+"'"
      +",'"+getEV('type_'+indek)+"'"
      +",'"+getEV('phone_'+indek)+"'"
      +",'"+getEV('mobile_'+indek)+"'"
      +",'"+getEV('email_'+indek)+"'"
      
      +",'"+getEV('birth_date_'+indek)+"'"
      +",'"+getEI('gender_'+indek)+"'"
      +",'"+getEI('marital_status_'+indek)+"'"
      
      +",'"+getEC('pensiun_'+indek)+"'"
      +",'"+getEC('deffered_'+indek)+"'"
      
      +",'"+getEV('hired_date_'+indek)+"'"
      +",'"+getEV('raise_date_'+indek)+"'"
      +",'"+getEV('terminated_date_'+indek)+"'"
        
      +",'"+getEI('pay_method_'+indek)+"'"
      +",'"+getEI('pay_frequency_'+indek)+"'"
      +",'"+getEV('pay_rate_'+indek)+"'"
      +",'"+getEV('pay_hour_'+indek)+"'"
      
      +",'"+pay_field+"'"
      +",'"+employee_field+"'"
      +",'"+company_field+"'"
      +",'"+accrue_field+"'"
      
      +",'"+custom_fields+"'"
      +")"
  });
}

Employees.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM employees "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      
      var d=objectOne(paket.fields, paket.data);
      var dt=JSON.parse(d.address);
      
      setEV('employee_id_'+indek, d.employee_id);
      setEV('name_'+indek, d.name);
      
      setEC('inactive_'+indek, d.inactive);
      setEC('is_sales_rep_'+indek, d.is_sales_rep);
      setEC('is_buyer_'+indek, d.is_buyer);
      setEC('is_supervisor_'+indek, d.is_supervisor);
      
      setEV('address_1_'+indek, dt.street_1);
      setEV('address_2_'+indek, dt.street_2);
      setEV('city_'+indek, dt.city);
      setEV('state_'+indek, dt.state);
      setEV('zip_'+indek, dt.zip);
      setEV('country_'+indek, dt.country);
      
      setEV('social_security_'+indek, d.social_security);
      setEV('type_'+indek, d.type);
      setEV('phone_'+indek, d.phone);
      setEV('mobile_'+indek, d.mobile);
      setEV('email_'+indek, d.email);
      
      setEV('birth_date_'+indek, d.birth_date);
      setEV('birth_date_fake_'+indek, tglWest(d.birth_date));
      setEI('gender_'+indek, d.gender);
      setEI('marital_status_'+indek, d.marital_status);

      setEC('pensiun_'+indek, d.pension);
      setEC('deffered_'+indek, d.deffered);
      
      setEV('hired_date_'+indek, d.hired_date);
      setEV('hired_date_fake_'+indek, tglWest(d.hired_date));
      setEV('raise_date_'+indek, d.raise_date);
      setEV('raise_date_fake_'+indek, tglWest(d.raise_date));
      setEV('terminated_date_'+indek, d.terminated_date);
      setEV('terminated_date_fake_'+indek, tglWest(d.terminated_date));

      setEI('pay_method_'+indek, d.pay_method);
      setEI('pay_frequency_'+indek, d.pay_frequency);

      setEV('pay_rate_'+indek, d.pay_rate);
      setEV('pay_hour_'+indek, d.pay_hour);

      Employees.pay.setRows(indek, JSON.parse(d.pay_field) );
      Employees.employee.setRows(indek, JSON.parse(d.employee_field));
      Employees.company.setRows(indek, JSON.parse(d.company_field));
      Employees.accrue.setRows(indek, JSON.parse(d.accrue_field));
      
      message.none(indek);
    }
    return callback();
  });
}

Employees.formUpdate=(indek,employee_id)=>{
  bingkai[indek].employee_id=employee_id;
  Employees.form.modeUpdate(indek);
}

Employees.updateExecute=(indek)=>{

  var address=JSON.stringify({
    "street_1":getEV('address_1_'+indek),
    "street_2":getEV('address_2_'+indek),
    "city":getEV('city_'+indek),
    "state":getEV('state_'+indek),
    "zip":getEV('zip_'+indek),
    "country":getEV('country_'+indek)
  });

  var pay_field=JSON.stringify(bingkai[indek].pay_field);
  var employee_field=JSON.stringify(bingkai[indek].employee_field);
  var company_field=JSON.stringify(bingkai[indek].company_field);
  var accrue_field=JSON.stringify(bingkai[indek].accrue_field);
  var custom_fields=JSON.stringify(["edit1","edit2"]);
  
  db.execute(indek,{
    query:"UPDATE employees "
    
      +" SET name='"+getEV("name_"+indek)+"', "
      +" inactive='"+getEC("inactive_"+indek)+"', "
      +" is_sales_rep='"+getEC("is_sales_rep_"+indek)+"', "
      +" is_buyer='"+getEC("is_buyer_"+indek)+"', "
      +" is_supervisor='"+getEC("is_supervisor_"+indek)+"', "
      
      +" address='"+address+"', "
      +" social_security='"+getEV('social_security_'+indek)+"', "
      +" type='"+getEV('type_'+indek)+"', "
      +" phone='"+getEV('phone_'+indek)+"', "
      +" mobile='"+getEV('mobile_'+indek)+"', "
      +" email='"+getEV('email_'+indek)+"', "
      
      +" birth_date='"+getEV('birth_date_'+indek)+"', "
      +" gender='"+getEI('gender_'+indek)+"', "
      +" marital_status='"+getEI('marital_status_'+indek)+"', "
      
      +" pension='"+getEC('pensiun_'+indek)+"', "
      +" deffered='"+getEC('deffered_'+indek)+"', "
      
      +" hired_date='"+getEV('hired_date_'+indek)+"', "
      +" raise_date='"+getEV('raise_date_'+indek)+"', "
      +" terminated_date='"+getEV('terminated_date_'+indek)+"', "

      +" pay_method='"+getEI('pay_method_'+indek)+"', "
      +" pay_frequency='"+getEI('pay_frequency_'+indek)+"', "
      
      +" pay_rate='"+getEV('pay_rate_'+indek)+"', "
      +" pay_hour='"+getEV('pay_hour_'+indek)+"', "
      
      +" pay_field='"+pay_field+"', "
      +" employee_field='"+employee_field+"', "
      +" company_field='"+company_field+"', "
      +" accrue_field='"+accrue_field+"',"
      +" custom_fields='"+custom_fields+"'"
      
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(p)=>{
    if(p.err.id==0) Employees.endPath(indek);
  });
}

Employees.formDelete=(indek,employee_id)=>{
  bingkai[indek].employee_id=employee_id;
  Employees.form.modeDelete(indek);
}

Employees.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM employees "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(p)=>{
    if(p.err.id==0) Employees.endPath(indek);
  });
}

Employees.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM employees "
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

Employees.search=(indek)=>{
  Employees.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT employee_id,name,address,pay_method, "
        +" user_name,date_modified"
        +" FROM employees "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND employee_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Employees.readShow(indek);
    });
  });
}

Employees.exportExecute=(indek)=>{
  var table_name=Employees.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Employees.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO employees "
      +"(admin_name,company_id,"
      +" employee_id,name,inactive,"
      +" is_sales_rep,is_buyer,is_supervisor,"
      +" address,social_security,type,phone,mobile,email,"
      +" birth_date,gender,marital_status,"
      +" pension,deffered,"
      +" hired_date,raise_date,terminated_date,"
      +" pay_method,pay_frequency,"
      +" pay_rate,pay_hour,"
      +" pay_field,employee_field,company_field,accrue_field"
      +" custom_fields"
      +") VALUES ("
      +" '"+bingkai[indek].admin.name+"', "
      +" '"+bingkai[indek].company.id+"', "
      +" '"+d[i][1]+"'," // 3-id
      +" '"+d[i][2]+"'," // 4-name
      
      +" '"+d[i][3]+"'," // 5-inactive
      +" '"+d[i][4]+"'," // 6-is_sales_rep
      +" '"+d[i][5]+"'," // 7-is_buyer
      +" '"+d[i][6]+"'," // 8-is_supervisor
      
      +" '"+d[i][7]+"'," // 9-address
      +" '"+d[i][8]+"'," // 10-social_security
      +" '"+d[i][9]+"'," // 11-type
      +" '"+d[i][10]+"'," //12-phone
      +" '"+d[i][11]+"'," //13-mobile
      +" '"+d[i][12]+"'," //14-email
      
      +" '"+d[i][13]+"'," //15-birth_date
      +" '"+d[i][14]+"'," //16-gender
      +" '"+d[i][15]+"'," //17-marital_status
      
      +" '"+d[i][16]+"'," // 18-pension
      +" '"+d[i][17]+"'," // 19-deffered
      +" '"+d[i][18]+"'," // 20-hired_date
      +" '"+d[i][19]+"'," // 21-raise_date
      +" '"+d[i][20]+"'," // 22-terminated_date
      +" '"+d[i][21]+"',"  // 23-pay_method
      +" '"+d[i][22]+"'," // 24-pay-frequency
      +" '"+d[i][23]+"'," // 25-pay-rate
      +" '"+d[i][24]+"'," // 26-pay_hour
      
      +" '"+d[i][25]+"'," // 27-pay_field
      +" '"+d[i][26]+"'," // 28-employee_field
      +" '"+d[i][27]+"'," // 29-company_field
      +" '"+d[i][28]+"'," // 30-accrue_field
      +" '"+d[i][29]+"' " // 31-custom_field
      +")" // 
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Employees.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT employee_id,name,address,pay_method, "
      +" user_name,date_modified"
      +" FROM employees"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY employee_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Employees.selectShow(indek);
  });
}

Employees.selectShow=(indek)=>{
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
      +'<th colspan="2">Employee ID</th>'
      +'<th>Name</th>'
      +'<th>Address</th>'
      +'<th>Pay Method</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
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
      +'<td align="left">'+n+'</td>'
      +'<td align="left">'+d[x].employee_id+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="left">'
        +xHTML(JSON.parse(d[x].address).street_1)+'</td>'
      +'<td align="left">'
        +array_pay_method[d[x].pay_method]+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek, p);
}

Employees.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM employees"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND employee_id='"+d[i].employee_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Employees.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,employee_id,date_created"
      +" FROM employees"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+getEV('employee_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Employees.table_name,"/",
        d.company_id,"/",
        d.employee_id
      );
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Employees.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('employee_id_'+indek).value;
  document.getElementById('employee_id_'+indek).disabled=false;
  document.getElementById('employee_id_'+indek).value=id;
  document.getElementById('employee_id_'+indek).focus();
}

Employees.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Employees.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Employees.properties(indek);})
  }
}

Employees.setField=(indek,data)=>{

  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  document.getElementById(id_kolom).value=data.field_name;
  
  setEV(id_kolom,data.field_name);
  Employees.getField(indek,id_kolom,baris);

}

Employees.getField=(indek_,id_kolom_,baris_)=>{

  this.indek=indek_;
  this.id_kolom=id_kolom_;
  this.baris=baris_;

  Employees.payrollField.getOne(this.indek,
    document.getElementById(this.id_kolom).value,
  (paket)=>{
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      
      switch (id_kolom){
        case "pay_field_name_"+baris+'_'+indek:
          // update display
          setEV('pay_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          
          // update array
          Employees.pay.setCell(indek,id_kolom);
          Employees.pay.setCell(indek,'pay_expense_account_id_'+baris+'_'+indek);
          break;

        case "employee_field_name_"+baris+'_'+indek:
          setEV('employee_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          Employees.employee.setCell(indek,id_kolom);
          Employees.employee.setCell(indek,'employee_liability_account_id_'+baris+'_'+indek);
          break;          
          
        case "company_field_name_"+baris+'_'+indek:
          setEV('company_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          setEV('company_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          
          Employees.company.setCell(indek,id_kolom);
          Employees.company.setCell(indek,'company_liability_account_id_'+baris+'_'+indek);
          Employees.company.setCell(indek,'company_expense_account_id_'+baris+'_'+indek);
          break;
          
        case "accrue_field_name_"+baris+'_'+indek:
          Employees.accrue.setCell(indek,id_kolom);
          break;          
          
        default:
          alert(id_kolom+' belum kedaftar.');
      }
    }
  });
}


Employees.accrue.setRows=(indek,isi)=>{

  if(isi===undefined)isi=[];
  
  var html=Employees.accrue.tableHead(indek);
  var i;
  
  bingkai[indek].accrue_field=isi;

  for (i=0; i<isi.length; i++) {

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_field_name_'+i+'_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' size="10"'
          +' style="text-align:left"'
          +' onchange="Employees.getField(\''+indek+'\''
          +',\'accrue_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' onfocus="this.select()">'
      +'</td>'

      +'<td>'
        +'<button type="button"'
          +' class="btn_find" '
          +' onclick="Employees.payrollField.getPaging(\''+indek+'\''
          +',\'accrue_field_name_'+i+'_'+indek+'\','+i+',3);">'
        +'</button>'
      +'</td>'
        
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_given_'+i+'_'+indek+'"'
          +' value="'+isi[i].given+'"'
          +' onchange="Employees.accrue.setCell(\''+indek+'\''
          +',\'accrue_given_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" '
          +' style="text-align:center;"'
          +' size="9">'
      +'</td>'
      
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_taken_'+i+'_'+indek+'"'
          +' value="'+isi[i].taken+'"'
          +' onchange="Employees.accrue.setCell(\''+indek+'\''
          +',\'accrue_taken_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()" '
          +' style="text-align:center;"'
          +' size="9">'
      +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="Employees.accrue.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
          +' onclick="Employees.accrue.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
    +'</tr>';
  }
  html += Employees.accrue.tableFoot(indek);
  document.getElementById('accrue_field_'+indek).innerHTML=html;  
  if (isi.length == 0) Employees.accrue.addRow(indek,0);
}

Employees.accrue.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
      +'<tr>'
        +'<th colspan="3">Field Name</th>'
        +'<th>Given</th>'
        +'<th>Taken</th>'
        +'<th>Add/Remove</th>'
      +'</tr>'
    +'</thead>';
}

Employees.accrue.tableFoot=(indek)=>{
  return '<tfoot>'
      +'<tr>'
      +'<td>&nbsp;</td>'
      +'</tr>'
    +'</tfoot>'
  +'</table>';
}

Employees.accrue.addRow=(indek,baris)=>{
  var oldBasket = [];
  var newBasket = [];
  var i;
  
  oldBasket = bingkai[indek].accrue_field;
  
  for(i=0; i<oldBasket.length; i++) {
    newBasket.push(oldBasket[i]);
    if (i == baris) newRow(newBasket);
  }
  if (oldBasket.length == 0) newRow(newBasket);
  Employees.accrue.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.given=0;
    myItem.taken=0;
    newBas.push(myItem);
  }
}

Employees.accrue.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].accrue_field;
  var newBasket=[];
  var i;
  
  Employees.accrue.setRows(indek,oldBasket);
  for(i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  Employees.accrue.setRows(indek,newBasket);
}

Employees.accrue.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].accrue_field;
  var baru = [];
  var isiEdit = {};
  var i;

  for (i=0;i<isi.length; i++){
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

Employees.readCursor=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM employees"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(p)=>{
    var m=Employees.model();
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      m.employee_id=d.employee_id;
      m.name=d.name;
      m.address=JSON.parse(d.address);      
      m.social_security=d.social_security;
      m.file_id=d.file_id;
    }
    return callback(m);
  })
}

Employees.model=()=>{
  return {
    employee_id:"",
    name: "",
    address: {},
    social_security:"",
    file_id: "",
  }
}


// eof:1439;1471;1385;1367;1567;1517;1534;1546;1596;1603;1600;1646;
// 1688;
