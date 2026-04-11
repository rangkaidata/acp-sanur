/*
 * name: budiono
 * date: sep-12, 13:07, tue-2023; new;
 * -----------------------------; happy new year 2024
 * edit: jan-08, 09:14, mon-2024; mringkas;
 * edit: jan-10, 14:49, wed-2024; re-write with class;
 * edit: may-20, 16:41, mon-2024; basic sql;
 * edit: jun-28, 21:53, fri-2024; r3;
 * edit: jul-02, 12:42, tue-2024; r4;
 * edit: jul-28, 16:51, sun-2024; r11;
 * edit: sep-10, 21:38, tue-2024; r18;
 * edit: dec-24, 10:11, tue-2024; #32; properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-21, 11:41, fri-2025; #42; file_id;
 * edit: mar-11, 15:37, tue-2025; #43; deep_folder;
 * edit: mar-25, 23:24, tue-2025; #45; ctables;cstructure;
 * edit: jun-03, 10:24, tue-2025; #57; payroll_fields;
 * edit: jun-10, 11:41, tue-2025; #57; accrue_field (given,taken);
 */

'use strict';

var EmployeeDefaults={};

EmployeeDefaults.table_name='employee_defaults';
EmployeeDefaults.hourly={};
EmployeeDefaults.salary={};
EmployeeDefaults.employee={};
EmployeeDefaults.company={};
EmployeeDefaults.accrue={};
EmployeeDefaults.account=new AccountLook(EmployeeDefaults);
EmployeeDefaults.payrollField=new PayrollFieldLook(EmployeeDefaults);

EmployeeDefaults.show=(karcis)=>{
  karcis.modul=EmployeeDefaults.table_name;
//  karcis.bisa.tambah=1;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newPay=new BingkaiUtama(karcis);
    var indek=newPay.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        EmployeeDefaults.formUpdate(indek);
      });
    });
  }else{
    show(baru);
  }
}

EmployeeDefaults.formEntry=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +content.message(indek)
      +'<form autocomplete="off">' 
      
        +'<details open>'
          +'<summary>Account</summary>'

          +'<ul>'
          +'<li><label>Cash Account:</label>'
            +'<input type="text"'
            +' id="cash_account_id_'+indek+'"'
            +' onchange="EmployeeDefaults.getAccount(\''+indek+'\''
            +',\'cash_account_id_'+indek+'\',-1)"'
            +' size="8" style="text-align:center;">'

            +'<button type="button"'
            +' id="cash_account_btn_'+indek+'" '
            +' class="btn_find"'
            +' onclick="EmployeeDefaults.account.getPaging(\''+indek+'\''
            +',\'cash_account_id_'+indek+'\',-1'
            +',\''+CLASS_ASSET+'\');">'
            +'</button>'

            +'<input type="text" '
            +' id="cash_account_name_'+indek+'" disabled>'

            +'</li>'
          +'<li><label>Pay Method:</label>'
            +'<select id="pay_method_'+indek+'">'
              +getEmployeePayMethod(indek)
            +'</select>'
          +'</li>'
          +'</ul>'

        +'</details>'
        
        +'<details open>'
          +'<summary>Hourly Field</summary>'
          +'<div id="hourly_field_'+indek+'" style="width:0;"></div>'
        +'</details>'  
        
        +'<details open>'
          +'<summary>Salary Field</summary>'
          +'<div id="salary_field_'+indek+'" style="width:0;"></div>'
        +'</details>'
        
        +'<details open>'
          +'<summary>Employee Field</summary>'          
          +'<div id="employee_field_'+indek+'" style="width:0;"></div>'
        +'</details>'

        +'<details open>'
          +'<summary>Company Field</summary>'
          +'<div id="company_field_'+indek+'" style="width:0;"></div>'
        +'</details>'
        
        +'<details open>'
          +'<summary>Accrue Field</summary>'
          +'<div id="accrue_field_'+indek+'" style="width:0;"></div>'
        +'</details>'

      +'</form>'
    +'</div>'

  content.html(indek,html);
  statusbar.ready(indek);
  
}

EmployeeDefaults.view=(indek,lock)=>{
  document.getElementById('cash_account_id_'+indek).disabled=lock;
  document.getElementById('cash_account_btn_'+indek).disabled=lock;
  document.getElementById('pay_method_'+indek).disabled=lock;
  
  var b=document.getElementsByName('element_disabled_'+indek);
  var i;

  b.forEach((x)=>{
    x.disabled=lock;
  })
}

EmployeeDefaults.readOne=(indek,callback)=>{
  EmployeeDefaults.hourly.setRows(indek,[]);
  EmployeeDefaults.salary.setRows(indek,[]);
  EmployeeDefaults.employee.setRows(indek,[]);
  EmployeeDefaults.company.setRows(indek,[]);
  EmployeeDefaults.accrue.setRows(indek,[]);

  db.execute(indek,{
    query:"SELECT * "
      +" FROM employee_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      
      var a=objectOne(paket.fields,paket.data);
      
      setEV('cash_account_id_'+indek,a.cash_account_id);
      setEV('cash_account_name_'+indek,a.cash_account_name);
      setEV('pay_method_'+indek,a.pay_method);
      
      EmployeeDefaults.hourly.setRows(indek,JSON.parse(a.hourly_field));
      EmployeeDefaults.salary.setRows(indek,JSON.parse(a.salary_field));
      EmployeeDefaults.employee.setRows(indek,JSON.parse(a.employee_field));
      EmployeeDefaults.company.setRows(indek,JSON.parse(a.company_field));
      EmployeeDefaults.accrue.setRows(indek,JSON.parse(a.accrue_field));

    }
    EmployeeDefaults.view(indek,true);
    message.none(indek);
    return callback();
  });
}

EmployeeDefaults.formUpdate=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.refresh(indek,()=>EmployeeDefaults.formUpdate(indek));
  toolbar.more(indek,()=>Menu.more(indek));
  EmployeeDefaults.formEntry(indek);
  EmployeeDefaults.readOne(indek,()=>{
    toolbar.edit(indek,()=>{EmployeeDefaults.formEdit(indek);});
    toolbar.download(indek,()=>{EmployeeDefaults.formExport(indek);});
    toolbar.upload(indek,()=>{EmployeeDefaults.formImport(indek);});
  });
}

EmployeeDefaults.formEdit=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{EmployeeDefaults.formUpdate(indek);});
  toolbar.save(indek,()=>EmployeeDefaults.saveExecute(indek));
  toolbar.delet(indek,()=>EmployeeDefaults.deleteExecute(indek));
  toolbar.properties(indek,()=>EmployeeDefaults.properties(indek));
  EmployeeDefaults.view(indek,false);
}

EmployeeDefaults.hourly.setRows=(indek,isi)=>{  
  if(isi===undefined)isi=[];    
  var panjang=isi.length;
  
  var html=EmployeeDefaults.hourly.tableHead(indek);
  
  bingkai[indek].hourly_field=isi;
  
  for (var i=0;i<panjang;i++){

    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="hourly_field_name_'+i+'_'+indek+'"'
      +' name="element_disabled_'+indek+'"'
      +' value="'+isi[i].field_name+'"'
      +' onchange="EmployeeDefaults.getField(\''+indek+'\''
      +',\'hourly_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:left"'
      +' size="10">'
      +'</td>'
      
    +'<td><button type="button"'
      +' id="hourly_field_btn_'+i+'_'+indek+'" '
      +' class="btn_find" '
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.payrollField.getPaging(\''+indek+'\''
      +',\'hourly_field_name_'+i+'_'+indek+'\','+i+''
      +',0);">'
      +'</button>'
      +'</td>'
    
    +'<td  align="center" style="padding:0;margin:0;">'
    +'<input type="text" disabled'
      +' id="hourly_expense_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].expense_account_id+'"'
      +' onchange="EmployeeDefaults.hourly.setCell(\''+indek+'\''
      +',\'hourly_expense_account_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:center;"'
      +' size="8">'
      +'</td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.hourly.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
      +' id="btn_remove"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.hourly.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }
  html+=EmployeeDefaults.hourly.tableFoot(indek);
  document.getElementById('hourly_field_'+indek).innerHTML=html;
  if(panjang==0)EmployeeDefaults.hourly.addRow(indek,0);
}

EmployeeDefaults.hourly.tableHead=(indek)=>{
  return '<table>'
  +'<thead>'
    +'<tr>'
    +'<th colspan="3">Field Name</th>'
    +'<th>Expense Acc. ID</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
  +'</thead>';
}

EmployeeDefaults.hourly.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan=5>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

EmployeeDefaults.hourly.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  
  oldBasket=bingkai[indek].hourly_field;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  EmployeeDefaults.hourly.setRows(indek,newBasket);
  
  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.expense_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }
}

EmployeeDefaults.hourly.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].hourly_field;
  var newBasket=[];
  
  EmployeeDefaults.hourly.setRows(indek,oldBasket);
  for(let i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  EmployeeDefaults.hourly.setRows(indek,newBasket);
}

EmployeeDefaults.salary.setRows=(indek,isi)=>{

  if(isi===undefined)isi=[];    
  var panjang=isi.length;
  var html=EmployeeDefaults.salary.tableHead(indek);
  
  bingkai[indek].salary_field=isi;
  
  for (var i=0;i<panjang;i++){

    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
    +'<input type="text" '
      +' id="salary_field_name_'+i+'_'+indek+'"'
      +' name="element_disabled_'+indek+'"'
      +' value="'+isi[i].field_name+'"'
      +' onchange="EmployeeDefaults.getField(\''+indek+'\''
      +',\'salary_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:left"'
      +' size="10">'
    +'</td>'
      
    +'<td><button type="button"'
      +' id="btn_find" '
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.payrollField.getPaging(\''+indek+'\''
      +',\'salary_field_name_'+i+'_'+indek+'\','+i+''
      +',0);">'
      +'</button>'
      +'</td>'
    
    +'<td  align="center" style="padding:0;margin:0;">'
    +'<input type="text" disabled'
      +' id="salary_expense_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].expense_account_id+'"'
      +' style="text-align:center;"'
      +' size="8">'
      +'</td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.salary.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
      +' id="btn_remove"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.salary.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }
  
  html+=EmployeeDefaults.salary.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('salary_field_'+indek).innerHTML=html;
  
  if(panjang==0)EmployeeDefaults.salary.addRow(indek,0);
}

EmployeeDefaults.salary.tableHead=(indek)=>{
  return '<table>'
  +'<thead>'
    +'<tr>'
    +'<th colspan="3">Field Name</th>'
    +'<th>Expense Acc. ID</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
  +'</thead>';
}

EmployeeDefaults.salary.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan=5>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

EmployeeDefaults.salary.addRow=(indek,baris)=>{

  var oldBasket=[];
  var newBasket=[];
  
  oldBasket=bingkai[indek].salary_field;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  EmployeeDefaults.salary.setRows(indek,newBasket);
  
  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBasket.length+1;
    myItem.field_name='';
    myItem.expense_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }  
}

EmployeeDefaults.salary.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].salary_field;
  var newBasket=[];
  
  EmployeeDefaults.salary.setRows(indek,oldBasket);
  for(let i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  EmployeeDefaults.salary.setRows(indek,newBasket);
}

EmployeeDefaults.salary.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].salary_field;
  var baru = [];
  var isiEdit = {};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('salary_field_name_'+i+'_'+indek)){
      isiEdit.field_name=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
            
    }else if(id_kolom==('salary_expense_account_id_'+i+'_'+indek)){
      isiEdit.expense_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
  }
}

EmployeeDefaults.employee.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];    
  var panjang=isi.length;
  var html=EmployeeDefaults.employee.tableHead(indek);
  bingkai[indek].employee_field=isi;

  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="employee_field_name_'+i+'_'+indek+'"'
      +' name="element_disabled_'+indek+'"'
      +' value="'+isi[i].field_name+'"'
      +' size="10" '
      +' style="text-align:left"'
      +' onchange="EmployeeDefaults.getField(\''+indek+'\''
      +',\'employee_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
      +' onfocus="this.select()">'
      +'</td>'
      
    +'<td><button type="button"'
      +' id="btn_find" '
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.payrollField.getPaging(\''+indek+'\''
      +',\'employee_field_name_'+i+'_'+indek+'\','+i+''
      +',1);">'
      +'</button>'
      +'</td>'

    +'<td  align="center" style="padding:0;margin:0;">'
    +'<input type="text" disabled'
      +' id="employee_liability_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].liability_account_id+'"'
      +' style="text-align:center;"'
      +' size="8">'
      +'</td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.employee.addRow(\''+indek+'\','+i+')" >'
      +'</button>'

      +'<button type="button"'
      +' id="btn_remove"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.employee.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }

  html+=EmployeeDefaults.employee.tableFoot(indek);
  document.getElementById('employee_field_'+indek).innerHTML=html;
  if(panjang==0)EmployeeDefaults.employee.addRow(indek,0);
}

EmployeeDefaults.employee.tableHead=(indek)=>{
  return '<table>'
  +'<thead>'
    +'<tr>'
    +'<th colspan="3">Field Name</th>'
    +'<th>Liability Acc. ID</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
  +'</thead>';
}

EmployeeDefaults.employee.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

EmployeeDefaults.employee.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  
  oldBasket=bingkai[indek].employee_field;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  EmployeeDefaults.employee.setRows(indek,newBasket);

  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.liability_account_id='';
    myItem.amount=0;
    newBas.push(myItem);
  }
}

EmployeeDefaults.employee.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].employee_field;
  var newBasket=[];

  EmployeeDefaults.employee.setRows(indek,oldBasket);
  for(let i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  EmployeeDefaults.employee.setRows(indek,newBasket);
}

EmployeeDefaults.employee.setCell=(indek,id_kolom)=>{
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

EmployeeDefaults.company.setRows=(indek,isi)=>{

  if(isi===undefined)isi=[];    
  var panjang=isi.length;
  var html=EmployeeDefaults.company.tableHead(indek);
  bingkai[indek].company_field=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="company_field_name_'+i+'_'+indek+'"'
      +' name="element_disabled_'+indek+'"'
      +' value="'+isi[i].field_name+'"'
      +' onchange="EmployeeDefaults.getField(\''+indek+'\''
      +',\'company_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:left"'
      +' size="10" >'
      +'</td>'
      
    +'<td><button type="button"'
      +' id="btn_find" '
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.payrollField.getPaging(\''+indek+'\''
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
      
    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.company.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
      +' id="btn_remove"'
      +' name="element_disabled_'+indek+'"'
      +' onclick="EmployeeDefaults.company.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
  }
  html+=EmployeeDefaults.company.tableFoot(indek);
  document.getElementById('company_field_'+indek).innerHTML=html;
  if(panjang==0)EmployeeDefaults.company.addRow(indek,0);
}

EmployeeDefaults.company.tableHead=(indek)=>{
  return '<table>'
  +'<thead>'
    +'<tr>'
    +'<th colspan="3">Field Name</th>'
    +'<th>Liability Acc. ID</th>'
    +'<th>Expense Acc. ID</th>'
    +'<th>Add / Remove</th>'
    +'</tr>'
  +'</thead>';
}

EmployeeDefaults.company.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

EmployeeDefaults.company.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  
  oldBasket=bingkai[indek].company_field;
  
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  EmployeeDefaults.company.setRows(indek,newBasket);

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

EmployeeDefaults.company.setCell=(indek,id_kolom)=>{
  
  var isi=bingkai[indek].company_field;
  var baru=[];
  var isiEdit={};

  for (var i=0;i<isi.length; i++){
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

    }else{
      baru.push(isi[i]);
    }
  }
}

EmployeeDefaults.company.removeRow=(indek,number)=>{
  
  var oldBasket=bingkai[indek].company_field;
  var newBasket=[];
  
  EmployeeDefaults.company.setRows(indek,oldBasket);
  for(let i=0;i<oldBasket.length;i++){
    if (i!=(number)) newBasket.push(oldBasket[i]);
  }
  EmployeeDefaults.company.setRows(indek,newBasket);
}

EmployeeDefaults.setAccount=(indek,data)=>{

  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  document.getElementById(id_kolom).value=data.account_id;

  switch (id_kolom){
    case "cash_account_id_"+indek:
      document.getElementById('cash_account_name_'+indek).value=data.name;
      break;
      
    case "hourly_expense_account_id_"+baris+'_'+indek:
      setEV(id_kolom,data.account_id);
      EmployeeDefaults.hourly.setCell(indek,id_kolom); 
      break;
      
    case "salary_expense_account_id_"+baris+'_'+indek:
      setEV(id_kolom, data.account_id);
      EmployeeDefaults.salary.setCell(indek,id_kolom); 
      break;
      
    case "employee_liability_account_id_"+baris+'_'+indek:
      setEV(id_kolom, data.account_id);
      EmployeeDefaults.employee.setCell(indek,id_kolom); 
      break;
      
    case "company_liability_account_id_"+baris+'_'+indek:
      setEV(id_kolom, data.account_id);
      EmployeeDefaults.company.setCell(indek,id_kolom); 
      break;
      
    case "company_expense_account_id_"+baris+'_'+indek:
      setEV(id_kolom, data.account_id);
      EmployeeDefaults.company.setCell(indek,id_kolom); 
      break;
      
    default:
      alert(id_kolom+' belum kedaftar.')
  }
}

EmployeeDefaults.getAccount=(indek_,id_kolom_,baris_)=>{
  this.indek=indek_;
  this.id_kolom=id_kolom_;
  this.baris=baris_;
  
  setEV('cash_account_name_'+this.indek, txt_undefined);

  EmployeeDefaults.account.getOne(this.indek,
    document.getElementById(this.id_kolom).value,
  (paket)=>{
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('cash_account_name_'+this.indek, d.name);
    }
  });
}

EmployeeDefaults.saveExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM employee_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.count==0){
      EmployeeDefaults.createExecute(indek);
    }else{
      EmployeeDefaults.updateExecute(indek);
    }
  });
}

EmployeeDefaults.createExecute=(indek)=>{

  var hourly_field=JSON.stringify(bingkai[indek].hourly_field);
  var salary_field=JSON.stringify(bingkai[indek].salary_field);
  var employee_field=JSON.stringify(bingkai[indek].employee_field);
  var company_field=JSON.stringify(bingkai[indek].company_field);
  var accrue_field=JSON.stringify(bingkai[indek].accrue_field);

  db.execute(indek,{
    query:"INSERT INTO employee_defaults "
    +" (admin_name,company_id,cash_account_id"
    +",pay_method"
    +",hourly_field,salary_field"
    +",employee_field,company_field,accrue_field)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV('cash_account_id_'+indek)+"'"
    +",'"+getEV('pay_method_'+indek)+"'"
    +",'"+hourly_field+"'"
    +",'"+salary_field+"'"
    +",'"+employee_field+"'"
    +",'"+company_field+"'"
    +",'"+accrue_field+"'"
    +")"
  },(p)=>{
    if(p.err.id==0){
      bingkai[indek].metode=MODE_CREATE;
      EmployeeDefaults.endForm(indek);
    }
  });
}

EmployeeDefaults.updateExecute=(indek)=>{
  
  var hourly_field=JSON.stringify(bingkai[indek].hourly_field);
  var salary_field=JSON.stringify(bingkai[indek].salary_field);
  var employee_field=JSON.stringify(bingkai[indek].employee_field);
  var company_field=JSON.stringify(bingkai[indek].company_field);
  var accrue_field=JSON.stringify(bingkai[indek].accrue_field);

  db.execute(indek,{
    query:"UPDATE employee_defaults "
      +" SET cash_account_id='"+getEV('cash_account_id_'+indek)+"', "
      +" pay_method='"+getEI('pay_method_'+indek)+"', "
      +" hourly_field='"+hourly_field+"', "
      +" salary_field='"+salary_field+"', "
      +" employee_field='"+employee_field+"', "
      +" company_field='"+company_field+"',"
      +" accrue_field='"+accrue_field+"' "
      
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.err.id==0){
      bingkai[indek].metode=MODE_UPDATE;
      EmployeeDefaults.endForm(indek);
    }
  });
}

EmployeeDefaults.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM employee_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.err.id==0){
      bingkai[indek].metode=MODE_DELETE;
      EmployeeDefaults.endForm(indek);
    }
  });
}

EmployeeDefaults.formExport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>EmployeeDefaults.formUpdate(indek));
  EmployeeDefaults.exportExecute(indek);
}

EmployeeDefaults.exportExecute=(indek)=>{
  var sql="SELECT company_id, cash_account_id, pay_method, "
    +" hourly_field,salary_field,employee_field,company_field"
    +" FROM employee_defaults "
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'";
  
  DownloadEmpat.display(indek,sql,'employee_defaults');
}

EmployeeDefaults.formImport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{EmployeeDefaults.formUpdate(indek);});
  iii.uploadJSON(indek);
}

EmployeeDefaults.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO employee_defaults"
      +" (admin_name,company_id,"
      +" cash_account_id,pay_method,hourly_field,"
      +" salary_field,employee_field,company_field,"
      +"accrue_field)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +",'"+d[i][3]+"'"
      +",'"+d[i][4]+"'"
      +",'"+d[i][5]+"'"
      +",'"+d[i][6]+"'"
      +",'"+JSON.stringify([])+"'"
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

EmployeeDefaults.getDefault=(indek)=>{

  db.run(indek,{
    query:"SELECT * "
      +" FROM employee_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      
      bingkai[indek].data_default=d;
      
      bingkai[indek].data_default.hourly_field=JSON.parse(d.hourly_field);
      bingkai[indek].data_default.salary_field=JSON.parse(d.salary_field);
      bingkai[indek].data_default.employee_field=JSON.parse(d.employee_field);
      bingkai[indek].data_default.company_field=JSON.parse(d.company_field);
      bingkai[indek].data_default.accrue_field=JSON.parse(d.accrue_field);
    }else{
      bingkai[indek].data_default={
        'cash_account_id':'',
        'cash_account_name':'',
        'pay_method': 0,
        'hourly_field':[{
          'row_id':0,
          'field_name':'',
          'expense_account_id':'',
          'rate':0,
          'salary':0,
          'amount':0
        }],
        'salary_field':[{
          'row_id':0,
          'field_name':'',
          'expense_account_id':'',
          'rate':0,
          'salary':0,
          'amount':0
        }],
        'employee_field':[{
          'row_id':0,
          'field_name':'',
          'liability_account_id':'',
          'amount':0
        }],
        'company_field':[{
          'row_id':0,
          'field_name':'',
          'liability_account_id':'',
          'expense_account_id':'',
          'amount':0
        }],
        'accrue_field':[{
          'row_id':0,
          'field_name':'',
          'given':0,
          'taken':0,
        }],
      }
    }
    bingkai[indek].pay_method=bingkai[indek].data_default.pay_method;
  });  
}

EmployeeDefaults.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM employee_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    };
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

EmployeeDefaults.endForm=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{EmployeeDefaults.formUpdate(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{EmployeeDefaults.properties(indek);})
  }
}

EmployeeDefaults.setField=(indek,data)=>{

  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  document.getElementById(id_kolom).value=data.field_name;
  
  setEV(id_kolom,data.field_name);
  EmployeeDefaults.getField(indek,id_kolom,baris);

}

EmployeeDefaults.getField=(indek_,id_kolom_,baris_)=>{

  this.indek=indek_;
  this.id_kolom=id_kolom_;
  this.baris=baris_;

  EmployeeDefaults.payrollField.getOne(this.indek,
    document.getElementById(this.id_kolom).value,
  (paket)=>{
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      
      switch (id_kolom){
        case "hourly_field_name_"+baris+'_'+indek:
          // update display
          setEV('hourly_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          
          // update array
          EmployeeDefaults.hourly.setCell(indek,id_kolom);
          EmployeeDefaults.hourly.setCell(indek,'hourly_expense_account_id_'+baris+'_'+indek);
          break;
          
        case "salary_field_name_"+baris+'_'+indek:
          setEV('salary_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          EmployeeDefaults.salary.setCell(indek,id_kolom);
          EmployeeDefaults.salary.setCell(indek,'salary_expense_account_id_'+baris+'_'+indek);
          break;          
          
        case "employee_field_name_"+baris+'_'+indek:
          setEV('employee_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          EmployeeDefaults.employee.setCell(indek,id_kolom);
          EmployeeDefaults.employee.setCell(indek,'employee_liability_account_id_'+baris+'_'+indek);
          break;          
          
        case "company_field_name_"+baris+'_'+indek:
          setEV('company_liability_account_id_'+baris+'_'+indek,d.liability_account_id);
          setEV('company_expense_account_id_'+baris+'_'+indek,d.expense_account_id);
          
          EmployeeDefaults.company.setCell(indek,id_kolom);
          EmployeeDefaults.company.setCell(indek,'company_liability_account_id_'+baris+'_'+indek);
          EmployeeDefaults.company.setCell(indek,'company_expense_account_id_'+baris+'_'+indek);
          break;          
          
        case "accrue_field_name_"+baris+'_'+indek:
          EmployeeDefaults.accrue.setCell(indek,id_kolom);
          break;          
          
        default:
          alert(id_kolom+' belum kedaftar.');
      }
    }
  });
}

EmployeeDefaults.hourly.setCell=(indek,id_kolom)=>{
  
  var isi=bingkai[indek].hourly_field;
  var baru = [];
  var isiEdit = {};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('hourly_field_name_'+i+'_'+indek)){
      isiEdit.field_name=getEV(id_kolom);
      baru.push(isiEdit);
            
    }else if(id_kolom==('hourly_expense_account_id_'+i+'_'+indek)){
      isiEdit.expense_account_id=getEV(id_kolom);
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
  }
}

EmployeeDefaults.accrue.setRows=(indek,isi)=>{  
  
  if(isi===undefined)isi=[];
  var html=EmployeeDefaults.accrue.tableHead(indek);
  var i;
  
  bingkai[indek].accrue_field=isi;
  
  for (i=0;i<isi.length;i++){

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
    
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="accrue_field_name_'+i+'_'+indek+'"'
          +' name="element_disabled_'+indek+'"'
          +' value="'+isi[i].field_name+'"'
          +' onchange="EmployeeDefaults.getField(\''+indek+'\''
          +',\'accrue_field_name_'+i+'_'+indek+'\',\''+i+'\')" '
          +' onfocus="this.select()"'
          +' style="text-align:left"'
          +' size="10">'
      +'</td>'
      
      +'<td>'
        +'<button type="button"'
          +' id="btn_find" '
          +' name="element_disabled_'+indek+'"'
          +' onclick="EmployeeDefaults.payrollField.getPaging(\''+indek+'\''
          +',\'accrue_field_name_'+i+'_'+indek+'\','+i+''
          +',3);">'
        +'</button>'
      +'</td>'
    
      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' name="element_disabled_'+indek+'"'
          +' onclick="EmployeeDefaults.accrue.addRow(\''+indek+'\''
          +','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
          +' id="btn_remove"'
          +' name="element_disabled_'+indek+'"'
          +' onclick="EmployeeDefaults.accrue.removeRow(\''+indek+'\''
          +','+i+')" >'
        +'</button>'
      +'</td>'
    +'</tr>';
  }
  html+=EmployeeDefaults.accrue.tableFoot(indek);
  document.getElementById('accrue_field_'+indek).innerHTML=html;
  if(isi.length==0) EmployeeDefaults.accrue.addRow(indek,0);
  
}

EmployeeDefaults.accrue.tableHead=(indek)=>{
  return '<table>'
  +'<thead>'
    +'<tr>'
      +'<th colspan="3">Field Name</th>'
      +'<th>Add/Remove</th>'
    +'</tr>'
  +'</thead>';
}

EmployeeDefaults.accrue.tableFoot=(indek)=>{
  return '<tfoot>'
      +'<tr>'
        +'<td colspan=5>&nbsp;</td>'
      +'</tr>'
    +'</tfoot>'
  +'</table>';
}

EmployeeDefaults.accrue.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var i;
  
  oldBasket=bingkai[indek].accrue_field;
  
  for(i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  EmployeeDefaults.accrue.setRows(indek,newBasket);
  
  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.field_name='';
    myItem.given=0;
    myItem.taken=0;
    newBas.push(myItem);
  }
}

EmployeeDefaults.accrue.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].accrue_field;
  var newBasket=[];
  var i;
  
  EmployeeDefaults.accrue.setRows(indek,oldBasket);
  for(i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  EmployeeDefaults.accrue.setRows(indek,newBasket);
}

EmployeeDefaults.accrue.setCell=(indek,id_kolom)=>{
  
  var isi=bingkai[indek].accrue_field;
  var baru = [];
  var isiEdit = {};
  var i;

  for (i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('accrue_field_name_'+i+'_'+indek)){
      isiEdit.field_name=getEV(id_kolom);
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
  }
}


// eof: 1023;972;1012;1035;1099;1098;1102;
