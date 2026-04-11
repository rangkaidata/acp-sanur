/*
 * name: budiono;
 * date: aug-19, 11:05, tue-2025; #69;
 * edit: nov-29, 09:26, sat-2025; #82;
 */
 
var sqlFields={
  
  company:"company_id,name,address,phone,mobile,fax,website,"
    +"email_address,fiscal_year,start_date,decimal_places,"
    +"currency_id,company_logo",
    
  accounts:"company_id,account_id,name,class,inactive",
  
  journal_entry:"company_id,journal_no,date,description,detail",
  
  period: "company_id,period_id,end_date,note",
  
  budgets:"company_id,account_id,detail",
  
  account_begins:"company_id,account_id,debit,credit",

  ship_methods:"company_id,ship_id,name,inactive",
  
  vendor_begins:"company_id,vendor_id,detail",

  vendors:"company_id,vendor_id,name,inactive,contact,account,"
    +"address,type,phone,mobile,fax,email,website,gl_account_id,"
    +"tax,ship_id,discount_terms,credit_limit,custom_fields",

  purchase_orders:"company_id,vendor_id,po_no,date,"
    +"status,good_thru,ship_address,"
    +"ship_id,discount_terms,ap_account_id,detail,note",
    
  items:"company_id,item_id,name,name_for_sales,"
    +"name_for_purchases,"
    +"class, inactive,"
    +"unit_measure,type,location_id,unit_cost,"
    +"sales_account_id,inventory_account_id,wage_account_id,"
    +"cogs_account_id,income_account_id,"
    +"cost_method,tax_id,"
    +"minimum_stock,reorder_quantity,vendor_id,buyer_id,"
    +"custom_fields",    
    
  locations:"company_id,location_id,name,inactive,type",    

  taxes:"company_id,tax_id,name,inactive,calculate",

  receives:"company_id,vendor_id,"
    +" invoice_no,date,ship_address,ship_id,"
    +" discount_terms,ap_account_id,"
    +" detail,po_no,po_detail,"
    +" amount_paid,note",
    
  cost_codes:"company_id,cost_id,name,inactive,type",
    
  phases:"company_id,phase_id,name,inactive,use_cost,type",

  jobs:"company_id,job_id,name,inactive,"
    +"supervisor,customer_id,start_date,end_date,"
    +"type,po_number,percent_complete,"
    +"use_phases,"
    +"expenses,revenues,"
    +"detail,custom_fields",

  customers:"company_id,customer_id,name,inactive,"
    +"contact,address,"
    +"type,phone,mobile,fax,email,web,"
    +"sales_rep_id,sales_account_id,customer_po,"
    +"ship_id,resale,discount_terms,credit_limit,"
    +"finance_charges,custom_fields",

  sales_taxes:"company_id,sales_tax_id,name,inactive,tax_freight,"
    +"detail,rate",

  employees:"company_id,employee_id,name,inactive,"
      +"is_sales_rep,is_buyer,is_supervisor,"
      +"address,"
      +"social_security,type,phone,mobile,email,"
      +"birth_date,gender,marital_status,"
      +"pension,deffered,"
      +"hired_date,raise_date,terminated_date,"
      +"pay_method,pay_frequency,"
      +"pay_rate,pay_hour,"
      +"pay_field,employee_field,company_field,accrue_field,"
      +"custom_fields",

  payments:"company_id,vendor_id,name,address,memo,"
    +"payment_no,date,cash_account_id,"
    +"detail,invoice_detail,discount_account_id,"
    +"note",

  void_payments:"company_id,cash_account_id,payment_no,"
    +"void_no,date,note",

  item_begins:"company_id,item_id,detail,"
    +"quantity,unit_cost,total_cost",

  prices:"company_id,item_id,unit_price,detail",
  
  boms:"company_id,item_id,detail,note",
  
  builds:"company_id,item_id,quantity,"
    +"date,build_no,employee_id,reason",  
  
  adjustments:"company_id,adjustment_no,date,detail,"
    +"employee_id,reason",  

  customer_begins:"company_id,customer_id,detail",
  
  sales_orders:"company_id,quote_no,customer_id,"
    +"so_no,date,status,ship_address,"
    +"customer_po,ship_id,discount_terms,sales_rep_id,"
    +"detail,"
    +"ar_account_id,sales_tax_id,"
    +"freight_account_id,freight_amount,note",

  invoices:"company_id,quote_no,customer_id,invoice_no,date,ship_address,"
    +"customer_po,ship_id,ship_date,discount_terms,sales_rep_id,"
    +"detail,so_no,so_detail,ticket_detail,"
    +"ar_account_id,sales_tax_id,"
    +"freight_account_id,freight_amount,paid_at_sale,note",

  receipts:"company_id,"
    +"deposit_no,customer_id,name,address,receipt_no,date,reference,"
    +"pay_method_id,cash_account_id,detail,"
    +"sales_rep_id,sales_tax_id,"
    +"invoice_detail,discount_account_id,"
    +"note",

  pay_methods:"company_id,pay_method_id,name,inactive",
  
  void_invoices:"company_id,customer_id,invoice_no,void_no,date,note",
  
  payroll_entry:"company_id,employee_id,"
    +"payroll_no,date,cash_account_id,pay_period,"
    +"pay_field,employee_field,company_field,accrue_field,"
    +"custom_field",  








  

  currencies:"company_id,currency_id,inactive,base",

  payroll_fields:"company_id,field_name,description,inactive,"
    +"class,liability_account_id,expense_account_id",
    
  exchange_rates:"company_id,currency_id,date,rate",
 
  quotes:"company_id,customer_id,"
    +" quote_no,date,good_thru,ship_address, "
    +" customer_po,ship_id,discount_terms,sales_rep_id, "
    +" detail, "
    +" ar_account_id,sales_tax_id,freight_account_id,freight_amount, "
    +" note",
    
  time_tickets:"company_id,record_mode,record_id,"
    +" ticket_no,date,type,daily_detail,weekly_detail",
    
  expense_tickets:"company_id,record_mode,record_id,"
    +"ticket_no,date,item_id,"
    +"customerby_mode,customerby_id,"
    +"reimbursable,ticket_description,internal_memo,"
    +"quantity,billing_status,billing_amount",
    
  converts:"company_id,customer_id,"
    +"quote_no,modul_id,convert_no,note",

  job_begins:"company_id,job_id,detail",
  
  employee_begins:"company_id,employee_id,cash_account_id,"
    +"pay_field,employee_field,company_field,accrue_field",


    
  unbuilds:"company_id,item_id,quantity,"
    +"date,unbuild_no,employee_id,reason",
    
  moves:"company_id,to_location_id,location_id,move_no,date,detail,"
    +"employee_id,note",

  customer_credits:"company_id,"
    +"customer_id,credit_no,date,"
    +"customer_po,discount_terms,sales_rep_id,"
    +"return_authorization,detail,invoice_no,invoice_detail,"
    +"ar_account_id,sales_tax_id,"
    +"freight_account_id,freight_amount,note",
    
  vendor_checks:"company_id,vendor_id,name,address,memo,"
    +"check_no,date,amount, "
    +"cash_account_id,expense_account_id,job_phase_cost",
    
  vendor_credits:"company_id,vendor_id,credit_no,date,"
    +"discount_terms,return_authorization,ap_account_id,"
    +"detail,invoice_no,invoice_detail,note",

  void_checks:"company_id,cash_account_id,check_no,void_no,date,note",
  
  deposits:"company_id,cash_account_id,"
    +"deposit_no,date,detail,custom_field",
    
  reconcile:"company_id,cash_account_id,date,detail",
  
  account_defaults:"company_id,fiscal_year,gl_account_id,period_id",
  
  customer_defaults:"company_id, "
    +"gl_account_id, discount_account_id, ar_account_id, "
    +"cash_account_id, pay_method_id, discount_terms, credit_limit, "
    +"finance_charges",
    
  vendor_defaults:"company_id,gl_account_id, discount_account_id,"
    +"ap_account_id, cash_account_id,"
    +"discount_terms,credit_limit",
    
  item_defaults:"company_id,cost_method,tax_id,location_id,"
    +"item_class,detail,freight_account_id",
    
  employee_defaults:"company_id,cash_account_id,"
    +"pay_method,hourly_field,salary_field,employee_field,"
    +"company_field,accrue_field",
    
  close_period:"company_id,period_id",
  
  close_fiscal:"company_id,end_date", //58; 
  
  path:"table_name,path", 
  
  my_menu:"menu_sort,menu_parent,menu_id,menu_name,menu_type,"
    +"menu_access,menu_path",
    
  labels:"label_id,name",
  
  notes:"note_id,title,note,labels,pinned",
  
  lists: "list_id,name",
  
  tasks:"task_id,task,detail,date,sub_tasks,favorited,"
    +"completed,list_id",
    
  contacts: "user_name,full_name",
  
  groups: "group_id,name,members",
  
  quota: "user_name,type,amount,note",
  
  users:"user_name,user_fullname,user_password,email_address,"
    +"mobile_number,user_photo",
    
  blockchain:"hash,date,modul,metode,user_name,admin_name,timestamp,"
    +"timestamp2,previous_hash,acak,index,data",
    
  tables:"table_id,zone,part,permission",
  
  structure:"row_id,table_id,column_id,data_type,primary_key,not_null,"
    +"input_mode,input_id,foreign_key",
  
  trash:"index,modul,data,user_name,date_trashed",
  
  small_query:"name,sql",
  
  properties:"file_id,name,type,parent,locked,path,query,data,admin_name",
  
  setting:"timeout_login,warn_out_of_stock,user_option,company_id,"
    +"page_rows",
    
  close_po: "company_id,vendor_id,po_no,comment",
  
  close_so: "company_id,customer_id,so_no,comment",
  
  collections: "key,val",

}

function sqlDatabase2(indek,table_name){
  var sql='';
  var fields='';
  var ada=true;
  
  switch(table_name){
    case "company"://01
      fields=sqlFields.company;
      break;
      
    case "currencies"://02
      fields=sqlFields.currencies;
      break;

    case "accounts"://03
      fields=sqlFields.accounts;
      break;
      
    case "locations"://04
      fields=sqlFields.locations;
      break;
      
    case "taxes"://05
      fields=sqlFields.taxes;
      break;

    case "ship_methods"://06
      fields=sqlFields.ship_methods;
      break;
      
    case "pay_methods"://07
      fields=sqlFields.pay_methods;
      break;
          
    case "cost_codes"://08
      fields=sqlFields.cost_codes;
      break;
      
    case "phases"://09
      fields=sqlFields.phases;
      break;
      
    case "period"://10
      fields=sqlFields.period;
      break;
      
    case "payroll_fields"://11
      fields=sqlFields.payroll_fields;
      break;
    
    case "sales_taxes": //12
      fields=sqlFields.sales_taxes;
      break;
      
    case "exchange_rates": //13;
      fields=sqlFields.exchange_rates;
      break;
      
    case "budgets": //14;
      fields=sqlFields.budgets;
      break;
    
    case "employees"://15;
      fields=sqlFields.employees;
      break;
      
    case "vendors"://16;
      fields=sqlFields.vendors;
      break;
      
    case "items"://17;
      fields=sqlFields.items;
      break;

    case "customers"://18;
      fields=sqlFields.customers;
      break;
    
    case "prices"://19;
      fields=sqlFields.prices;
      break;    
      
    case "boms"://20;
      fields=sqlFields.boms;
      break;    
      
    case "jobs"://21;
      fields=sqlFields.jobs;
      break;    
    
    case "purchase_orders"://22
      fields=sqlFields.purchase_orders;
      break;        
      
    case "quotes"://23;
      fields=sqlFields.quotes;
      break;        
      
    case "time_tickets"://24;
      fields=sqlFields.time_tickets;
      break;        
      
    case "expense_tickets"://25;
      fields=sqlFields.expense_tickets;
      break;        
      
    case "converts"://26;
      fields=sqlFields.converts;
      break;        
      
    case "sales_orders"://27;
      fields=sqlFields.sales_orders;
      break;

    case "account_begins"://28;
      fields=sqlFields.account_begins;
      break;
      
    case "item_begins"://29;
      fields=sqlFields.item_begins;
      break;
      
    case "vendor_begins"://30;
      fields=sqlFields.vendor_begins;
      break;
      
    case "customer_begins"://31;
      fields=sqlFields.customer_begins;
      break;
      
    case "job_begins"://32;
      fields=sqlFields.job_begins;
      break;

    case "employee_begins"://33;
      fields=sqlFields.employee_begins;
      break;

    case "journal_entry"://34;
      fields=sqlFields.journal_entry;
      break;
      
    case "payroll_entry"://35;
      fields=sqlFields.payroll_entry;
      break;
      
    case "receives"://36;
      fields=sqlFields.receives;
      break;    
      
    case "payments"://37;
      fields=sqlFields.payments;
      break;

    case "builds"://38;
      fields=sqlFields.builds;
      break;
      
    case "unbuilds"://39;
      fields=sqlFields.unbuilds;
      break;
      
    case "moves"://40;
      fields=sqlFields.moves;
      break;
      
    case "adjustments"://41;
      fields=sqlFields.adjustments;
      break;

    case "invoices"://42;
      fields=sqlFields.invoices;
      break;
      
    case "void_invoices"://43;
      fields=sqlFields.void_invoices;
      break;
      
    case "customer_credits"://44;
      fields=sqlFields.customer_credits;
      break;
      
    case "receipts"://45;
      fields=sqlFields.receipts;
      break;
      
    case "vendor_checks"://46;
      fields=sqlFields.vendor_checks;
      break;
      
    case "vendor_credits"://47;
      fields=sqlFields.vendor_credits;
      break;
      
    case "void_payments"://48;
      fields=sqlFields.void_payments;
      break;
      
    case "void_checks"://49;
      fields=sqlFields.void_checks;
      break;
      
    case "deposits"://50;
      fields=sqlFields.deposits;
      break;
      
    case "reconcile"://51;
      fields=sqlFields.reconcile;
      break;
      
    case "account_defaults"://52;
      fields=sqlFields.account_defaults;
      break;
      
    case "customer_defaults"://53;
      fields=sqlFields.customer_defaults;
      break;
      
    case "vendor_defaults"://54;
      fields=sqlFields.vendor_defaults;
      break;
      
    case "item_defaults"://55;
      fields=sqlFields.item_defaults;
      break;
      
    case "employee_defaults"://56;
      fields=sqlFields.employee_defaults;
      break;
      
    case "close_period"://57;
      fields=sqlFields.close_period;
      break;
      
    case "close_fiscal"://58;
      fields=sqlFields.lock_period;
      break;
      
    case "close_po"://59;
      fields=sqlFields.close_po;
      break;
      
    case "close_so"://60;
      fields=sqlFields.close_so;
      break;

    default:
      alert(table_name+', belum terdaftar di sql_database_2.js');
      ada=false;
  }

  if(ada){
    sql+= "SELECT "+fields
      +" FROM " +table_name
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'";
      
    // persyaratan untuk backup;
    
    if(table_name=="currencies"){// tdk perlu base currency
      sql+=" AND base =0";
    }
    
    if(table_name=="invoices"){// void_invoices tdk perlu
      sql+=" AND total > 0";
    }
    
    if(table_name=="payments"){// void_payments tdk perlu
      sql+=" AND amount > 0";
    }
    
    if(table_name=="vendor_checks"){// void_checks tdk perlu
      sql+=" AND amount > 0";
    }
    return sql;
  }
}


function sqlDatabase3(indek,table_name){
  var sql='';
  var fields='';
  var ada=true;
  
  switch(table_name){
// apps
    case "path": //1;
      fields=sqlFields.path;
      break;

    case "my_menu": //2;
      fields=sqlFields.my_menu;
      break;
      
    case "labels": //3;
      fields=sqlFields.labels;
      break;
      
    case "notes": //4;
      fields=sqlFields.notes;
      break;
      
    case "lists": //5;
      fields=sqlFields.lists;
      break;
      
    case "tasks": //6;
      fields=sqlFields.tasks;
      break;
      
    case "contacts": //7;
      fields=sqlFields.contacts;
      break;
      
    case "groups": // 8;
      fields=sqlFields.groups;
      break;
// system      
  
    case "quota": // 9;
      fields=sqlFields.quota;
      break;
      
    case "users": // 10;
      fields=sqlFields.users;
      break;
      
    case "blockchain": // 11
      fields=sqlFields.blockchain;
      break;
      
    case "tables": // 12
      fields=sqlFields.tables;
      break;
      
    case "structure": // 13
      fields=sqlFields.structure;
      break;
      
    case "trash": // 14
      fields=sqlFields.trash;
      break;
      
    case "small_query": // 15
      fields=sqlFields.small_query;
      break;
      
    case "properties": // 16
      fields=sqlFields.properties;
      break;
      
    case "setting": // 17
      fields=sqlFields.setting;
      break;
      
    case "collections": // 17
      fields=sqlFields.collections;
      break;

    default:
      alert(table_name+', belum terdaftar di sql_database_3.js');
      ada=false;
  }

  if(ada){
    sql+= "SELECT "+fields
      +" FROM " +table_name;
    return sql;
  }
}



// eof: 417;560;631;
