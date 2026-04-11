/*
 * auth: budiono
 * date: sep-04, 16:34, mon-2023; new;116;
 * edit: sep-11, 12:28, mon-2023; items;
 * edit: sep-27, 13:59, wed-2023; account_begin;vendor_begins;
 * edit: sep-29, 11:00, fri-2023; job_begins;
 * edit: oct-03, 14:19, tue-2023; notes;
 * edit: oct-12, 14:50, thu-2023; journal-entry;
 * edit: oct-12, 21:25, thu-2023; builds;unbuilds;
 * edit: oct-13, 16:47, fri-2023; moves;adjustment;
 * edit: oct-27, 14:18, fri-2023; purchase_orders;
 * edit: nov-02, 13:27, thu-2023; receive_inventory;
 * edit: nov-16, 13:44, thu-2023; payments;
 * edit: nov-17, 06:39, fri-2023; void_payments;
 * edit: nov-17, 10:16, fri-2023; vendor_checks;
 * edit: nov-18, 12:28, sat-2023; void_checks;
 * edit: nov-19, 13:00, sun-2023; vendor_credits;
 * edit: dec-01, 14:33, fri-2023; quotes;
 * edit: dec-01, 21:13, fri-2023; convert_quotes;
 * edit: dec-02, 12:30, sat-2023; sales_orders;
 * edit: dec-03, 08:20, sun-2023; invoices;
 * edit: dec-03, 11:58, sun-2023; void_invoices;
 * edit: dec-04, 10:22, mon-2023; receipts;
 * -----------------------------; happy new year 2024;
 * edit: jan-31, 10:23, thu-2024; payroll_entry;
 * edit: feb-05, 09:32, mon-2024; time_tickets;
 * edit: feb-05, 12:22, mon-2024; expense_tickets;
 * edit: feb-17, 12:42, sat-2024; customer_credits;
 * edit: feb-19, 13:12, mon-2024; account_defaults;
 * edit: feb-22, 11:35, thu-2024; budgets;
 * edit: jul-25, 08:06, thu-2024; query;
 * edit: dec-10, 22:21, tue-2024; lists;
 * -----------------------------; happy new year 2025;
 * edit: jan-07, 11:48, tue-2025; tasks;
 * edit: jan-13, 12:08, mon-2025; contacts;
 * edit: jan-13, 18:13, mon-2025; groupd;
 * edit: apr-11, 10:22, fri-2025; item_tax->taxes;
 * edit: jun-02, 22:55, mon-2025; payroll_fields;
 * -----------------------------; happy new year 2026;
 * edit: jan-06, 11:46, tue-2026; close_po
 */ 

'use strict';

iii.uploadJSON=(indek)=>{
  var html='<div style="padding:0 1rem 0 1rem">'
    +content.title(indek)
    +'<h1>'+MODE_IMPORT+'</h1>'
    +'<p id="exportTable" style="display:none"></p>'
    +iii.selectFileJSON(indek)
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

iii.selectFileJSON=(indek)=>{
  var html=''
    +'<div id="hasil_'+indek+'" style="margin-top:10px;">'
      +'<h2>Step 1: Select file JSON</h2>'
      +'<p>Select File: '
      +'<input type="file" '
      +' onchange="iii.readFileJSON(this,'+indek+')"'
      +' accept=".json">'
      +'</p>'
    +'</div>';
  return html;
}

iii.readFileJSON=(input,indek)=>{
  const file=input.files[0];
  const reader=new FileReader();

  reader.readAsText(file);
  reader.onload = function() {
    //bacaDataJSON(indek,reader.result);
    bingkai[indek].dataImport=JSON.parse(reader.result);
    iii.setData(indek)
  };

  reader.onerror = function() {
    console.log(reader.error);
  };      
}

iii.setData=(indek)=>{
  var data_import=bingkai[indek].dataImport;
  var data=[];
  var arr={};
  var html;
  var tabel='';
  
  // restore data
  var d=(data_import);
  var jml=d.fields.length;
  var j;
  
  tabel="<table>";
    +'<tr>'
  
  for(var t=0;t<d.fields.length;t++){
    tabel+='<th>'+d.fields[t]+'</th>';
  }
  +'</tr>'
  
  if(jml==0){
    jml=d.data.length;
    if(jml>0){
      jml=d.data[0].length;
    }
  }
  
  for(var i=0;i<data_import.data.length;i++){
    tabel+='<tr>'
    for(j=0;j<jml;j++){
      tabel+='<td>'+tHTML(data_import.data[i][j])+'</td>';
    }
    tabel+='</tr>'
  }
  tabel+="</table>"
  
  html='<h2>Step 2: Insert Data </h2>'
    +'<button'
    +' id="btn_import_all_'+indek+'"'
    +' onclick="iii.importExecute('+indek+');">'
    +'Import Data</button>'
    +'<p id="msgImport_'+indek+'"></p>'
    +'<br>'
    +'<p>'+data_import.data.length+' rows ready.'
    +' Klik button [<b>Import Data</b>] to process.</p>'
    +'<div style="overflow-y:auto;">'
    +'<pre>'+tabel
    +'</pre></div>'
  document.getElementById('hasil_'+indek).innerHTML=html;
}


iii.importExecute=(indek)=>{
  const modul=bingkai[indek].menu.id;
  switch(modul){
    case "cost_codes":
      Costs.importExecute(indek);break;
    case "phases":
      Phases.importExecute(indek);break;
    case "accounts":
      Accounts.importExecute(indek);break;
    case "locations":
      Locations.importExecute(indek);break;
    case "item_taxes":
      ItemTaxes.importExecute(indek);break;
    case "ship_methods":
      ShipVia.importExecute(indek);break;
    case "pay_methods":
      PayMethods.importExecute(indek);break;
    case "manage_users":
      Users.importExecute(indek);break;
    case "item_defaults":
      ItemDefaults.importExecute(indek);break;
    case "items":
      Items.importExecute(indek);break;
    case "vendor_defaults":
      VendorDefaults.importExecute(indek);break;
    case "vendors":
      Vendors.importExecute(indek);break;
    case "customer_defaults":
      CustomerDefaults.importExecute(indek);break;
    case "customers":
      Customers.importExecute(indek);break;
    case "employee_defaults":
      EmployeeDefaults.importExecute(indek);break;
    case "employees":
      Employees.importExecute(indek);break;
    case "sales_taxes":
      SalesTax.importExecute(indek);break;
    case "jobs":
      Jobs.importExecute(indek);break;
    case "boms":
      Boms.importExecute(indek);break;
    case "prices":
      Prices.importExecute(indek);break;
    case "account_begins":
      AccountBegins.importExecute(indek);break;
    case "vendor_begins":
      VendorBegins.importExecute(indek);break;
    case "customer_begins":
      CustomerBegins.importExecute(indek);break;
    case "job_begins":
      JobBegins.importExecute(indek);break;
    case "item_begins":
      ItemBegins.importExecute(indek);break;
    case "employee_begins":
      EmployeeBegins.importExecute(indek);break;
    case "notes":
      Notes.importExecute(indek);break;
    case "journal_entry":
      JournalEntry.importExecute(indek);break;
    case "builds":
      Builds.importExecute(indek);break;
    case "unbuilds":
      Unbuilds.importExecute(indek);break;
    case "moves":
      Moves.importExecute(indek);break;
    case "adjustments":
      Adjustments.importExecute(indek);break;
    case "purchase_orders":
      PurchaseOrders.importExecute(indek);break;
    case "receives":
      ReceiveInventory.importExecute(indek);break;
    case "payments":
      Payments.importExecute(indek);break;
    case "void_payments":
      VoidPayments.importExecute(indek);break;
    case "vendor_checks":
      VendorChecks.importExecute(indek);break;
    case "void_checks":
      VoidChecks.importExecute(indek);break;
    case "vendor_credits":
      VendorCredits.importExecute(indek);break;
    case "quotes":
      Quotes.importExecute(indek);break;
    case "convert_quotes":
      ConvertQuotes.importExecute(indek);break;
    case "sales_orders":
      SalesOrders.importExecute(indek);break;
    case "invoices":
      Invoices.importExecute(indek);break;
    case "void_invoices":
      VoidInvoices.importExecute(indek);break;
    case "receipts":
      Receipts.importExecute(indek);break;
    case "payroll_entry":
      PayrollEntry.importExecute(indek);break;
    case "payroll_period":
      PayrollPeriods.importExecute(indek);break;
    case "time_tickets":
      TimeTickets.importExecute(indek);break;
    case "expense_tickets":
      ExpenseTickets.importExecute(indek);break;
    case "deposits":
      Deposits.importExecute(indek);break;
    case "customer_credits":
      CustomerCredits.importExecute(indek);break;
    case "account_defaults":
      AccountDefaults.importExecute(indek);break;
    case "budgets":
      Budgets.importExecute(indek);break;
    case "query":
      Query.importExecute(indek);break;
    case "documents":
      Documents.importExecute(indek);break;
    case "files":
      Files.importExecute(indek);break;
    case "lists":
      Lists.importExecute(indek);break;
    case "labels":
      Labels.importExecute(indek);break;
    case "tasks":
      Tasks.importExecute(indek);break;
    case "contacts":
      Contacts.importExecute(indek);break;
    case "groups":
      Groups.importExecute(indek);break;
    case "taxes":
      ItemTaxes.importExecute(indek);break;
    case "payroll_fields":
      PayrollFields.importExecute(indek);break;
    case "frm_reconcile":
      FrmReconcile.importExecute(indek);break;
    case "path":
      MyPath.importExecute(indek);break;
    case "my_menu":
      MyMenu.importExecute(indek);break;
    case "exchange_rates":
      ExchangeRates.importExecute(indek);break;
    case "period":
      Periods.importExecute(indek);break;
    case "close_po":
      ClosePO.importExecute(indek);break;
    case "close_so":
      CloseSO.importExecute(indek);break;
    case "collections":
      Collections.importExecute(indek);break;

    default:
      alert('['+modul +'] undefined in [import_data.js]. ');
  }
}
// eof;220;
