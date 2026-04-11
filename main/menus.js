
/*
 * name: budiono;
 * date: sep 03, 08:50, sun-2023; new; 117;
 * edit: sep-04, 11:48, mon-2023; add; 272;
 * edit: sep-05, 09:54, tue-2023; add; 351;
 * edit: sep-06, 20:56, wed-2023; 
 * edit: sep-11, 12:13, mon-2023; add items;
 * edit: sep-14, 16:37, thu-2023; 
 * edit: sep-17, 08:23, sun-2023; xHTML;
 * edit: sep-25, 12:13, mon-2023; start report;
 * edit: sep-27, 13:27, wed-2023; begin account;vendor;
 * edit: oct-12, 09:12, thu-2023; journal_entry;
 * edit: oct-16, 21:52, mon-2023; job_balances;
 * edit: oct-26, 09:16, thu-2023; purchase_orders;
 * edit: oct-27, 16;06, fri-2023; receive_inventory;
 * edit: nov-16, 08:23, thu-2023; payments;
 * edit: nov-16, 17:23, thu-2023; void_payments;
 * edit: dec-01, 11:18, fri-2023; quotes;
 * edit: dec-01, 20:49, fri-2023; convert_quotes;
 * -----------------------------; happy new year 2024;
 * edit: jan-31, 10:04, thu-2024; payroll_entry;
 * edit: feb-04, 16:16, sun-2024; time_tickets;
 * edit: feb-05, 11:57, mon-2024; expense_tickets;
 * edit: feb-19, 11:07, mon-2024; account_defaults;
 * edit: feb-19, 20:56, mon-2024; budgets;
 * edit: feb-28, 08:48, mon-2024; query, clipboard and trash;
 * edit: mar-17, 15:04, sun-2024; tables;
 * edit: mar-24, 09:23, sun-2024; default->setting; setting->system;
 * edit: mar-26, 22:42, tue-2024; quota;
 * edit: oct-04, 11:23, fri-2024; redeem;
 * edit: nov-06, 13:09, wed-2024; close_period;
 * -----------------------------; happy new year 2025;
 * edit: jan-13, 16:28, mon-2025; #34; apps+group
 * edit: feb-05, 23:44, wed-2025; #39; modif menu;
 * edit: feb-06, 16:49, thu-2025; #39; menu_custom;
 * edit: mar-22, 13:45, sat-2025; #44; my_menu;
 * edit: mar-23, 13:39, sun-2025; #45; tables;
 * edit: may-02, 14:25, fri-2025; #53; currencies;exchange_rates
 * edit: jun-02, 15:07, mon-2025; #56; add payroll_fields;
 * ---percobaan pertama file form dipisah dgn file tabel---
 * edit: jun-28, 17:26, sat-2025; #62; reconcile;
 * ---kembali ke normal 
 * edit: jul-12, 22:02, sat-2025; #63; employee_balances;
 * edit: sep-15, 10:22, mon-2025; #74; my_menu;
 * edit: oct-19, 18:05, sun-2025; #80; receive_inventory==>purchase_invoices;
 * edit: nov-16, 16;12, sun-2025; #81; tambah page404;
 * -----------------------------; happy new year 2026;
 * edit: jan-06, 13:31, tue-2026; #87; the matrix;
 */ 

'use strict';

Menu.url="menu";
Menu.my_menu={
  field:[],
  data:[],
};
Menu.menu_master={
  field:[],
  data:[],  
}

Menu.lokal=function(){
  Menu.invite=[];
  Menu.master=[];
  
  const tree=[
    {parent:'',id:'register',name:'Register',type:2,folder:'',by_user:0},
    {parent:'',id:'login',name:'Login',type:2,folder:'',by_user:0},
    {parent:'',id:'forgot',name:'Forgot Password','type':2,folder:'',by_user:0},
    {parent:'',id:'redeem',name:'Redeem','type':2,folder:'',by_user:0},
  ];
  Menu.ready(tree,-1);
}

Menu.ready=function(tree,dir){
  var arr={
    "id": bingkai[0].invite.id,
    "data": tree,
    "admin_name": bingkai[0].invite.admin_name,
    "directory": dir
  }
  Menu.invite.push(arr);
  
  for (var x in tree){
    if (tree[x].parent==''){// menu_parent;
      if(tree[x].by_user==0){// by master menu NOT by my_menu
        arr={
          'id':tree[x].id,
          'name':tree[x].name,
          'type':tree[x].type,
          'parent':tree[x].parent,
          'folder':tree[x].folder,
        };
        datanya[0].submenu.push(arr);
      }
    }
  }
  
  ui.setMenuBar();
  ui.recentlyApp();
  ui.changeMenuBarTitle(xHTML(bingkai[0].login.full_name) );
  
  var group_id;
  if(bingkai[0].group.id==bingkai[0].login.name){
    group_id='root';
  }else{
    group_id=bingkai[0].group.id;
  }
  
  bingkai[0].folder=bingkai[0].login.name
    +'@'+group_id+': '

  document.getElementById('window').style.visibility='visible';
}

Menu.klik=function(nomer){

  const tiket=antrian[nomer];
  console.log('menu.klik: '+tiket.menu.id);

  Menu.type(tiket);

  switch(tiket.menu.type){
    case 0:
    case 1:
      Menu.showFolder(tiket);// bentuk folder
      break;
    case 2:
    case 3:
      Menu.showForm(tiket);// bentuk form
      break;
    default:
      console.log('Menu.modulKlik: '+tiket.menu.type);
  }
}

Menu.type=function(tiket){// ambil tipe
  Menu.access(tiket);
  for(var x=0;x<tiket.menu.data.length;x++){
    if (tiket.menu.data[x].id==tiket.menu.id){
      tiket.menu.type=tiket.menu.data[x].type;
    }
  }
}

Menu.access=function(tiket){// ambil access menu
  console.log(Menu.invite.length);
  
  for(var i=0;i<Menu.invite.length;i++){
    // convert dulu [array] to $string;
    if( String(Menu.invite[i].id)==String(tiket.invite.id) ){
      tiket.menu.data=Menu.invite[i].data;
    }
  }

  if(tiket.menu.data==undefined){
    tiket.menu.data=[];
  }
}

Menu.showForm=function(tiket){  
  Menu.active.id=tiket.menu.id;
  Menu.active.name=tiket.menu.name;
  
  switch(tiket.menu.id){
    // MENU: non-login
    case 'register':Register.show(tiket);break;
    case 'login':
      if(bingkai[0].login.id==null){
        Login.show(tiket);
      }else{
        Logout.show(tiket);break;
      }
      break;
//    case 'logout':Logout.show(tiket);break;
    case 'forgot':Forgot.show(tiket);break;
    case 'redeem':Redeem.show(tiket);break;
    
    // HOME
    case 'home':Home.show(tiket);break;
    
    // company
    case 'company':Company.show(tiket);break;
    case 'invite':Users.show(tiket);break;
    case 'company_information':CompanyProfile.show(tiket);break;
    case 'backup':Backup.show(tiket);break;
    case 'restore':Restore.show(tiket);break;
    case 'fiscal_year':FiscalYear.show(tiket);break;
    case 'reports':Reports.show(tiket);break;
    case 'currencies':Currencies.show(tiket);break;
    case 'exchange_rates':ExchangeRates.show(tiket);break;
    case 'collections':Collections.show(tiket);break;

    // apps
    case 'notes':Notes.show(tiket);break;
    case 'tasks':Tasks.show(tiket);break;
    case 'messages':Messages.show(tiket);break;
    case 'contacts':Contacts.show(tiket);break;
    case 'notifications':Notifications.show(tiket);break;
    case 'calendar':Calendar.show(tiket);break;
    case 'calculator':Calculator.show(tiket);break;
    case 'labels':Labels.show(tiket);break;
    case 'lists':Lists.show(tiket);break;
    case 'groups':Groups.show(tiket);break;
    case 'rooms':Rooms.show(tiket);break;
    
    // network
    case 'network':Network.show(tiket);break;
    
    // system
    case 'blok':Blockchain.show(tiket);break;
    case 'setting':Setting.show(tiket);break;
    case 'users':UserProfile.show(tiket);break;
    case 'clipboard':Clipboard.show(tiket);break;
    case 'trash':Trash.show(tiket);break;
    case 'small_query':SmallQuery.show(tiket);break;
    case 'tables': Tables.show(tiket);break;
    case 'quota': Quota.show(tiket);break;
    case 'locker': Locker.show(tiket);break;
    case 'files': Files.show(tiket);break;
    case 'my_menu':MyMenu.show(tiket);break;
    case 'path':MyPath.show(tiket);break;
    case 'sessions':Sessions.show(tiket);break;
    
    // directory
    case 'folders':Folders.show(tiket);break;
    
    // admin
    case 'user_levels':UserLevels.show(tiket);break;
    case 'send_emails':SendEmails.show(tiket);break;
    
    // folder/jobs
    case 'cost_codes':Costs.show(tiket);break;
    case 'phases':Phases.show(tiket);break;
    case 'jobs':Jobs.show(tiket);break;
    case 'job_begins':JobBegins.show(tiket);break;
    case 'job_balances':JobBalances.show(tiket);break;
    
    // folder/ledgers
    case 'accounts':Accounts.show(tiket);break;
    case 'period':Periods.show(tiket);break;
    case 'account_begins':AccountBegins.show(tiket);break;
    case 'account_balances':AccountBalances.show(tiket);break;
    case 'journal_entry':JournalEntry.show(tiket);break;
    case 'account_defaults':AccountDefaults.show(tiket);break;
    case 'budgets':Budgets.show(tiket);break;
    case 'close_period':ClosePeriod.show(tiket);break;
    
    // folder/inventory
    case 'locations':Locations.show(tiket);break;
    case 'taxes':ItemTaxes.show(tiket);break;
    case 'ship_methods':ShipVia.show(tiket);break;
    case 'item_defaults':ItemDefaults.show(tiket);break;
    case 'items':Items.show(tiket);break;
    case 'prices':Prices.show(tiket);break;
    case 'boms':Boms.show(tiket);break;
    case 'item_begins':ItemBegins.show(tiket);break;
    case 'item_balances':ItemBalances.show(tiket);break;
    case 'builds':Builds.show(tiket);break;
    case 'unbuilds':Unbuilds.show(tiket);break;
    case 'moves':Moves.show(tiket);break;
    case 'adjustments':Adjustments.show(tiket);break;
    
    // folder/sales
    case 'pay_methods':PayMethods.show(tiket);break;
    case 'sales_taxes':SalesTax.show(tiket);break;
    case 'customer_defaults':CustomerDefaults.show(tiket);break;
    case 'customers':Customers.show(tiket);break;
    case 'customer_begins':CustomerBegins.show(tiket);break;
    case 'customer_balances':CustomerBalances.show(tiket);break;
    case 'quotes':Quotes.show(tiket);break;
    case 'converts':ConvertQuotes.show(tiket);break;
    case 'sales_orders':SalesOrders.show(tiket);break;
    case 'invoices':Invoices.show(tiket);break;
    case 'void_invoices':VoidInvoices.show(tiket);break;
    case 'receipts':Receipts.show(tiket);break;
    case 'deposits':Deposits.show(tiket);break;
    case 'customer_credits':CustomerCredits.show(tiket);break;
    case 'close_so':CloseSO.show(tiket);break;
    
    // folder/purchases
    case 'vendor_defaults':VendorDefaults.show(tiket);break;
    case 'vendors':Vendors.show(tiket);break;
    case 'vendor_begins':VendorBegins.show(tiket);break;
    case 'vendor_balances':VendorBalances.show(tiket);break;
    case 'purchase_orders':PurchaseOrders.show(tiket);break;
    case 'receives':ReceiveInventory.show(tiket);break;
    case 'payments':Payments.show(tiket);break;
    case 'void_payments':VoidPayments.show(tiket);break;
    case 'vendor_checks':VendorChecks.show(tiket);break;
    case 'void_checks':VoidChecks.show(tiket);break;
    case 'vendor_credits':VendorCredits.show(tiket);break;
    case 'close_po': ClosePO.show(tiket);break;
    
    // folder/payroll
    case 'employee_defaults':EmployeeDefaults.show(tiket);break;
    case 'employees':Employees.show(tiket);break;
    case 'payroll_period':PayrollPeriods.show(tiket);break;
    case 'employee_begins':EmployeeBegins.show(tiket);break;
    case 'payroll_entry':PayrollEntry.show(tiket);break;
    case 'payroll_fields':PayrollFields.show(tiket);break;
    case 'employee_balances':EmployeeBalances.show(tiket);break;
    case 'void_payroll':VoidPayroll.show(tiket);break;
    
    // time and expense
    case "time_tickets":TimeTickets.show(tiket);break;
    case "expense_tickets":ExpenseTickets.show(tiket);break;
    // folder/report/ledger
    case 'rpt_chart_01':RptChart01.show(tiket);break;
    case 'change_password': ChangePassword.show(tiket);break;
    
    // form pertama perpisahan dgn tabel;
    case 'frm_reconcile':
      FrmReconcile.show(tiket);break;


    default:alert('Form "'+tiket.menu.id+'" undefined in'
      +' [menus.js]');
      
      if(tiket.home.id!=""){
        // ini khusus untuk hapus home; bila ada home id 'undefined';
        // tidak terdaftar di menu utama;
        Home.page404(tiket.parent,tiket.home.id,tiket.menu.id);
      }
  }
}

Menu.active={
  id:null,
  name:null,
}

// add: sep-04, 11:49, 

Menu.server=function(){// 
  Menu.invite=[];
  bingkai[0].modul='menu';
  bingkai[0].directory=0;

  Menu.getMaster(()=>{
    Menu.getMyMenu(()=>{
      Menu.menuDisplay(0);
    });
  });
}

Menu.getMaster=(callback)=>{
  db.run(0,{
    query:"SELECT "
      +" menu_parent,menu_id,menu_name,menu_type"
      +" FROM menu"
  },(paket)=>{
    if(paket.count>0){
      Menu.master_menu=paket;
    }
    return callback();
  })
}

Menu.getMyMenu=(callback)=>{
  db.run(0,{
    query:"SELECT "
      +" menu_parent,menu_id,menu_name,menu_type"
      +" FROM my_menu"
      +" ORDER BY menu_sort"
  },(paket)=>{
    if(paket.count>0){
      Menu.my_menu=paket;
      return callback();
    } else {
      // folder my_menu
      mkdir(0,'my_menu',(h)=>{
        Menu.createMyMenu(()=>{// create dulu, broh !!!
          Menu.getMyMenu2(()=>{
            return callback();
          });
        });
      });
    }
  })  
}

Menu.getMyMenu2=(callback)=>{
  db.run(0,{
    query:"SELECT "
      +" menu_parent,menu_id,menu_name,menu_type"
      +" FROM my_menu"
      +" ORDER BY menu_sort"
  },(paket)=>{
    if(paket.count>0){
      Menu.my_menu=paket;
    }
    return callback();
  })  
}

Menu.createMyMenu=(selesai)=>{
  //sort, parent, id, menu, type, 
  var k=0;
  var list=[
    // root
    [1,'','accounting','Accounting', 0],

    // menu header company
    [1,'/accounting','sales','Sales', 1],
    [2,'/accounting','purchases','Purchases', 1],
    [3,'/accounting','ledgers','General Ledger', 1],
    [4,'/accounting','payrolls','Payrolls', 1],
    [5,'/accounting','inventory','Inventory', 1],
    [6,'/accounting','time_and_expense','Time and Expense', 1],
    [7,'/accounting','job_costing','Job Costing', 1],
    [8,'/accounting','banking','Banking', 1],
    [9,'/accounting','productions','Productions', 1],
//    [10,'/accounting','voids','Void Transactions', 1],
    [10,'/accounting','defaults','Default Information', 1],
    [11,'/accounting','closing','Backup and Restore Data', 1],
    [12,'/accounting','databases','Databases', 1],
    [13,'/accounting','invite','Manage Users', 2],
    [14,'/accounting','company_information','Company Information', 3],
    [15,'/accounting','reports','Reports', 2],

    // menu sub sales
    [ 1,'/accounting/sales','customers','Customers',2],
    [ 2,'/accounting/sales','customer_begins','Customer Beginning Balances',2],
    [ 3,'/accounting/sales','quotes','Sales Quotes',2],
    [ 4,'/accounting/sales','sales_orders','Sales Orders',2],
    [ 5,'/accounting/sales','invoices','Invoices',2],
    [ 6,'/accounting/sales','receipts','Receipts',2],
    [ 7,'/accounting/sales','customer_credits','Customer Credit Memos',2],
    [ 8,'/accounting/sales','void_invoices','Void Invoices',2],
    [ 9,'/accounting/sales','close_so','Close Sales Orders',2],
    [10,'/accounting/sales','customer_balances','Customer Balances',3],

    // menu sub purchases
    [ 1,'/accounting/purchases','vendors','Vendors',2],
    [ 2,'/accounting/purchases','vendor_begins','Vendor Beginning Balances',2],
    [ 3,'/accounting/purchases','purchase_orders','Purchase Orders',2],
    [ 4,'/accounting/purchases','receives','Receive Inventory',2],
    [ 5,'/accounting/purchases','payments','Payments',2],
    [ 6,'/accounting/purchases','vendor_credits','Vendor Credit Memos',2],
    [ 7,'/accounting/purchases','void_payments','Void Payments',2],
    [ 8,'/accounting/purchases','close_po','Close Purchase Orders',2],
    [ 9,'/accounting/purchases','vendor_balances','Vendor Balances',3],
    
    // menu sub general ledgers
    [ 1,'/accounting/ledgers','accounts','Chart of Accounts',2],
    [ 2,'/accounting/ledgers','account_begins','Account Beginning Balances',2],
    [ 3,'/accounting/ledgers','journal_entry','Journal Entry',2],
    [ 4,'/accounting/ledgers','budgets','Budgets',2],
    [ 5,'/accounting/ledgers','period','Accounting Period',2], //perubahan #1; periods>period;
    [ 6,'/accounting/ledgers','close_period','Close Period',2],
    [ 7,'/accounting/ledgers','account_balances','Account Balances',3],
    
    // menu sub payroll;
    [ 1,'/accounting/payrolls','employees','Employees',2],
    [ 2,'/accounting/payrolls','employee_begins','Employee Beginning Balances',2],
    [ 3,'/accounting/payrolls','payroll_entry','Payroll Entry',2],
    [ 4,'/accounting/payrolls','payroll_fields','Payroll Fields',2],
    [ 5,'/accounting/payrolls','void_payroll','Void Payroll',2],    
    [ 6,'/accounting/payrolls','employee_balances','Employee Balances',3],

    // menu sub-inventory;
    [ 1,'/accounting/inventory','items','Inventory Items',2],
    [ 2,'/accounting/inventory','item_begins','Inventory Beginning Balances',2],
    [ 3,'/accounting/inventory','prices','Item Prices',2],
    [ 4,'/accounting/inventory','boms','Bill of Materials',2],
    [ 5,'/accounting/inventory','builds','Build Assemblies',2],
    [ 6,'/accounting/inventory','unbuilds','Unbuild Assemblies',2],
    [ 7,'/accounting/inventory','moves','Inventory Movement',2],
    [ 8,'/accounting/inventory','adjustments','Inventory Adjustments',2],
    [ 9,'/accounting/inventory','item_balances','Inventory Balances',3],

    // menu sub time and expense
    [ 1,'/accounting/time_and_expense','time_tickets','Time Tickets',2],
    [ 2,'/accounting/time_and_expense','expense_tickets','Expense Tickets',2],
    
    // menu sub job costing
    [ 1,'/accounting/job_costing','jobs','Jobs',2],
    [ 2,'/accounting/job_costing','job_begins','Job Beginning Balances',2],
    [ 3,'/accounting/job_costing','phases','Phases',2],
    [ 4,'/accounting/job_costing','cost_codes','Cost Codes',2],
    [ 5,'/accounting/job_costing','job_balances','Job Balances',3],

    // menu sub-banking
    [ 1,'/accounting/banking','deposits','Deposits',2],
    [ 2,'/accounting/banking','vendor_checks','Vendor Checks',2],
    [ 3,'/accounting/banking','frm_reconcile','Account Reconciliation',2],
    [ 4,'/accounting/banking','void_checks','Void Checks',2],    
    
    // menu sub-productions
    [ 1,'/accounting/productions','forecast','Sales Forecast',2],
    [ 2,'/accounting/productions','schedule','Production Schedule',2],
    [ 3,'/accounting/productions','requirements','Requirements Planning',2],
    [ 4,'/accounting/productions','requisition','Purchase Requisition',2],
    [ 5,'/accounting/productions','work_order','Work Order',2],
    [ 6,'/accounting/productions','process','Work in Process',3],
    
    // menu sub-voids 
    
    
    
    
    
    // menu sub-defaults
    [ 1,'/accounting/defaults','customer_defaults','Customer Defaults',2],
    [ 2,'/accounting/defaults','vendor_defaults','Vendor Defaults',2],
    [ 3,'/accounting/defaults','account_defaults','Account Defaults',2],
    [ 4,'/accounting/defaults','employee_defaults','Employee Defaults',2],
    [ 5,'/accounting/defaults','item_defaults','Inventory Defaults',2],

    [ 6,'/accounting/defaults','sales_taxes','Sales Taxes',2],   // sales_taxes not sales tax
    [ 7,'/accounting/defaults','pay_methods','Payment Methods',2],
    [ 8,'/accounting/defaults','locations','Item Locations',2],
    [ 9,'/accounting/defaults','taxes','Taxes',2],
    [10,'/accounting/defaults','ship_methods','Ship Methods',2],
    [11,'/accounting/defaults','currencies','Currencies', 2], //app
    [12,'/accounting/defaults','exchange_rates','Exchange Rates', 2],
    
    // menu sub-closing
    [ 1,'/accounting/closing','backup','Backup Data', 2],
    [ 2,'/accounting/closing','restore','Restore Data', 2],
    [ 3,'/accounting/closing','fiscal_year','Fiscal Year', 2],
  ];
  
  var pesan='<h2 style="margin-left:5rem;">Please wait, initialize table my_menu ...</h2>';
  var pesan2='';
  
  function prosess_iterasi(j,callback){
    db.run(0,{
      query:"INSERT INTO my_menu"
        +"(menu_sort,menu_parent,menu_id,menu_name,menu_type)"
        +" VALUES "
        +"( "+list[j][0]      // sort
        +",'"+list[j][1]+"'" // parent
        +",'"+list[j][2]+"'" // id
        +",'"+list[j][3]+"'" // name
        +", "+list[j][4]     // type
        +")"
    },(p)=>{
      j++;
      if(j<(list.length)){
        
        pesan2='<i style="margin-left:5rem;">['
          +j+' of '+list.length+'] - '
          +list[j][2]+'</i><br>'
          +pesan2;
        
        setiH('pertamax',pesan+pesan2);

        prosess_iterasi(j,()=>{
          return callback();
        });
      }
      if(j==list.length) return callback();// here!!!
    });
  }
  
  prosess_iterasi(0,()=>{
    setiH('pertamax','');

    // for first folder: add company to home
    mkdir(0,'/home',()=>{
      db.run(0,{
        query:"INSERT INTO home"
          +"(home_id,menu_id,menu_name,menu_type,"
          +"admin_name,company_id,company_name,parent"
          +") VALUES "
          +"('12345',"
          +"'company',"
          +"'Company',"
          +"'2',"
          +"'"+bingkai[0].admin.name+"','','','')"
      },(paket)=>{
        return selesai();  
      });
    });
  });
}

Menu.menuDisplay=()=>{
  var d1=Menu.master_menu;
  var d=objectMany(d1.fields,d1.data);
  var m=[];
  var i;
  
  // master menu;
  for(i=0;i<d.length;i++){
    m.push({
      'parent': d[i].menu_parent,
      'id': d[i].menu_id,
      'name': d[i].menu_name,
      'type': d[i].menu_type,
      'by_user': 0,
      'folder':'',
    })
  }
  
  // add new my_menu [customize by user client];
  var d2=Menu.my_menu;
  var d3=objectMany(d2.fields,d2.data);
  for(i=0;i<d3.length;i++){
    m.push({
      'parent': d3[i].menu_parent,
      'id': d3[i].menu_id,
      'name': d3[i].menu_name,
      'type': d3[i].menu_type,
      'by_user': 1,
      'folder':'',
    })
  }

  Menu.ready(m,0);// 
  Menu.tampilkanHome(0);
  document.getElementById('menu_bar_title').style.display="inline";
}

Menu.tampilkanHome=function(indek){
  var m=Menu.invite[0].data;
  var t={
    "id":"",
    "name":"",
    "folder":"",
  }
  for(var i=0;i<m.length;i++){
    if(m[i].id=="home"){
      t.id=m[i].id;
      t.name=m[i].name;
      t.folder=m[i].folder;
    }
  }
  
  const tiket=JSON.parse(JSON.stringify(bingkai[0]));// destruct arr
  tiket.parent=0;
  tiket.menu.id=t.id;
  tiket.menu.name=t.name;
  tiket.menu.folder=t.folder;
  
  tiket.folder=bingkai[0].folder;
  antrian.push(tiket);
  Menu.klik(antrian.length-1);  
}

Menu.more=function(indek){
  const x=JSON.parse(JSON.stringify(bingkai[indek]));
  x.baru=true;
  More.show(x);
}

Menu.ikon2=function(a){
  switch(parseInt(a)){
    case 0:
      return '&#127974;'; // home
    break;

    case 1:
      return '&#128193;'; // folder
      //return '<b style="color:grey;">&#x1F5BF;</b>'; // folder dark
      //return '<b style="color:lightgrey;">&#x1F5BF;</b>'; // folder white
    break;
    
    case 2:
      return '&#128221;';// paper with pencil (Application)
      //return '&#x1F5D0;';// paper with pencil (Application)
      //return '<b style="color:grey;">&#x1F5CD;</b>';// paper with pencil (Application)
    break;
    
    case 3:
      return '&#128195;';// paper roll (document/file)
      //return '&#x1F5CE;';// paper roll (document/file)
    break;
  }
}

Menu.showFolder=function(tiket){
  tiket.bisa.tambah=0;

  var baru=exist(tiket);
  if(baru==-1){
    const tampil=new BingkaiUtama(tiket);
    const indek=tampil.show();
    Menu.dataFolder(indek);
  }else{
    show(baru);
  }
}

Menu.dataFolder=function(indek){
  var html='';
  var jml=0;
  var paket=bingkai[indek].menu.data;
  var my_parent=String(bingkai[indek].menu.parent).concat("/",bingkai[indek].menu.id);

  for (var x in paket){
    if (paket[x].parent==my_parent){
      const tiket=JSON.parse(JSON.stringify(bingkai[indek]));// desctruction!!;
      tiket.home.id='';
      tiket.menu.id=paket[x].id;
      tiket.menu.name=paket[x].name;
      tiket.menu.parent=my_parent;
      tiket.menu.folder=paket[x].folder
      tiket.parent=indek;

      antrian.push(tiket);

      html+='<div style="width:6.5rem;'
        +'height:7.5rem;'
        +'word-wrap:inherit;'
        +'text-overflow:ellipsis;'
        +'overflow:hidden;'
        +'margin:0.1rem;'
        +'float:left;'
        +'border:0px;'
        +'border-radius:5%;'
        +'white-space:normal;text-align:center;'
        +'"'
        +'id="'+paket[x].id+'"'
        +' onclick="Menu.klik(\''+(antrian.length-1)+'\');"'
        +' onMouseOver="this.style.backgroundColor=\'lightgrey\'" '
        +' onMouseOut="this.style.backgroundColor=\'white\'">'
        
        +'<div style="font-size:2.1rem;">'+Menu.ikon2(paket[x].type)+'</div>'
        +paket[x].name
      +'</div>'      
      jml++;
    }
  }
  if(jml==0){
    html='<div align="center">'
      +'<h1>Folder is Empty</h1>'
      +'<p>Menu ID: <b>['+bingkai[indek].menu.id+']</b></p>'
      +'</div>';
  }
  content.html(indek,html);
    
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>{
    const x=JSON.parse(JSON.stringify(bingkai[indek]));
    x.baru=true;
    More.show(x);
  });

  statusbar.html(indek,jml+" items.");
}

Menu.ikon3=function(menu_name){
  switch (menu_name){
    case "Exit":
      return "&#128164; ";
      break;

    default:
      return "&#127974; "+menu_name;
  }
}

Menu.klikAppDrawer=function(nomer){
  const tiket=antrian[nomer];
  console.log('menu.klik: '+tiket.menu.id);
  Menu.type(tiket);
  Menu.showAppDrawer(tiket);// bentuk app drawer
  
}

Menu.showAppDrawer=function(tiket){
  tiket.bisa.tambah=0;
  var baru=exist(tiket);
  if(baru==-1){
    const tampil=new BingkaiUtama(tiket);
    const indek=tampil.show();
    Menu.dataAppDrawer(indek);
  }else{
    show(baru);
  }
}

Menu.dataAppDrawer=function(indek){
  var html='';
  var jml=0;
  const paket=bingkai[indek].menu.data;

  
  for (var x in paket){
    if (paket[x].type==2 || paket[x].type==3){
      const tiket=JSON.parse(JSON.stringify(bingkai[indek]));
      // tiket.baru=true;
      tiket.home.id='';
      tiket.menu.id=paket[x].id;
      tiket.menu.name=paket[x].name;
      tiket.menu.folder=paket[x].folder;
      tiket.parent=indek;
      
      antrian.push(tiket);

      html+='<div style="width:6.5rem;'
        +'height:6.5rem;'
        +'word-wrap:inherit;'
        +'text-overflow:ellipsis;'
        +'overflow:hidden;'
        +'margin:0.1rem;'
        +'float:left;'
        +'border:0px;'
        +'border-radius:5%;'
        +'white-space:normal;text-align:center;'
        +'"'
        +'id="'+paket[x].id+'"'
        +' onclick="Menu.klik(\''+(antrian.length-1)+'\');"'
        +' onMouseOver="this.style.backgroundColor=\'lightgrey\'"'
        +' onMouseOut="this.style.backgroundColor=\'white\'">'
        +'<div style="font-size:2.1rem;">'
          +Menu.ikon2(paket[x].type)
        +'</div>'
        +''+paket[x].name+''
      +'</div>'      
      jml++;
    }
  }
  if(jml==0){
    html='<div align="center">'
      +'<h1>Folder is Empty</h1>'
      +'<p>Menu ID: <b>['+bingkai[indek].menu.id+']</b></p>'
      +'</div>';
  }
  content.html(indek,html);
    
  toolbar.hide(indek);
  toolbar.more(indek,()=>{
    const x=JSON.parse(JSON.stringify(bingkai[indek]));
    x.baru=true;
    More.show(x);
  });

  statusbar.html(indek,jml+" items.");
}



// eof:556;615;761;773;826;
