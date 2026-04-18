/*
 * name: budiono;
 * date: sep-04, 15:17, mon-2023; new; 69;
 * edit: sep-06, 20:55, wed-2023; 
 * edit: sep-11, 15:39, mon-2023; 
 * edit: sep-12, 22:17, tue-2023;
 * edit: sep-14, 17:10, thu-2023;
 * edit: sep-16, 21:25, sat-2023;
 * edit: sep-20, 11:03, wed-2023;
 * edit: sep-27, 15:26, wed-2023;
 * edit: sep-28, 17:57, thu-2023; 
 * edit: nov-16, 08:28, thu-2023;
 * edit: nov-18, 15:24, sat-2023;
 * edit: dec-01, 11:32, fri-2023;
 * edit: dec-11, 11:54, mon-2023;
 * -----------------------------; happy new year 2024;
 * edit: feb-22, 10:38, thu-2024; 
 * edit: apr-18, 22:23, thu-2024; invite.id='' default;
 * edit: sep-02, 12:41, mon-2024; r14;
 * -----------------------------; happy new year 2025;
 * edit: jan-07, 11:52, tue-2025; #34;
 * edit: jan-09, 15:18, thu-2025; #34;
 * edit: jan-13, 12:09, mon-2025; contacts, groups;
 * edit: feb-06, 13:08, thu-2025; #39; +directory;
 * edit: sep-28, 14:28, sun-2025; #77; decimal_places;
 * -----------------------------; happy new year 2026;
 * edit: apr-14, 19:06, tue-2026; #93; subdomain api0.rangkaidata.com
 */

'use strict';

//====SETTING KONEKSI KE DATABASE SERVER/LOKAL========//
const config_local={
  url:'http://localhost:8080/',
}
const config_server={
  url:'https://www.api0.rangkaidata.com/',
}
/* GANTI DISINI UNTUK KONEKSI KE SERVER ATAU KE LOKAL */
const config=config_server;
//const config=config_local;
//====================================================//
const document_title="Rangkai Data";
//====================================================//
const xhr={};
const BEGIN=true;
const END=false
const MODE_CREATE='Create Data [C]';
const MODE_READ='Read Data [R]';
const MODE_UPDATE='Update Data [U]';
const MODE_DELETE='Delete Data [D]';
const MODE_RESULT='Search Result [S]';
const MODE_EXPORT='Export Data [E]';
const MODE_IMPORT='Import Data [I]';
const MODE_SEARCH='Text to Search [T]';
const MODE_VIEW='View Data [V]';
const MODE_SELECT='Select Data [X]';
const txt_undefined="<undefined>";
//====================================================//

const array_posting_methods=[
  "Real Time Posting",
  "Batch Posting"
]
const array_accounting_methods=[
  "Cash Basis",
  "Accrual"
]
const array_expired_mode=[
  "15 Minute",
  "1 Hour",
  "8 Hour",
  "24 Hour",
  "Never Expired"
];

const CLASS_ALL=-1;
const CLASS_ASSET=0;
const CLASS_LIABILITY=1;
const CLASS_EQUITY=2;
const CLASS_INCOME=3;
const CLASS_COST_OF_SALES=4;
const CLASS_COS=4;
const CLASS_EXPENSE=5;
const CLASS_OTHER_INCOME=6;
const CLASS_OTHER_EXPENSE=7;

const array_account_class=[
   "Asset"
  ,"Liability"
  ,"Equity"
  ,"Income"
  ,"Cost of Sales"
  ,"Expense"
  ,"Other Income"
  ,"Other Expense"
]

const array_inactive=[
  "Active",
  "Inactive",
];

const array_yes_no=[
  "Yes",
  "No",
]

const array_no_yes=[
  "No",
  "Yes",
]

const array_cost_type=[
   "Labor"
  ,"Materials"
  ,"Equipment"
  ,"Subcontractors"
  ,"Other"
]
const array_location_type=[
  "0-Purchases",
  "1-Production",
  "2-Sales",
  "3-Non-Stock [Supplier]"
]
const array_network_status=[
  "Waiting",
  "Join",
  "Leave"
]
const array_cost_method=[
   "FIFO"
  ,"LIFO"
  ,"Average"
]
const default_item_class=[
  "Stock",// 0
  "Non-stock item",// 1
  "Description only",// 2
  "Service",// 3
  "Labor",// 4
  "Assembly",// 5
  "Activity item",// 6
  "Charge item"// 7
]

const array_item_class=[
  "Stock",// 0
  "Non-stock item",// 1
  "Description only",// 2
  "Service",// 3
  "Labor",// 4
  "Assembly",// 5
  "Activity item",// 6
  "Charge item"// 7
]

const default_terms=[
  "C.O.D", // #0
  "Prepaid", // #1
  "Due in number of days",// #2
  "Due on day of month", // #3
  "Due at end of month", // #4
]
const array_pay_frequency=[
  "Weekly",
  "Bi-weekly",
  "Semi-monthly",
  "Monthly",
  "Annualy"
];
const array_field_type=[
  "Addition",
  "Deduction"
];
const array_formula=[
  "0-None",
  "1-FIT",
  "2-FICA EE",
  "3-MEDICARE",
  "4-SIT",
  "5-401K EE",
  "6-FICA ER",
  "7-FUTA ER",
  "8-SUI ER",
  "9-401K ER"
]
const array_employee_class=[
   "Employee"
  ,"Sales Rep"
]
const array_employee_filling_status=[
   "Single"
  ,"Married"
  ,"Head/Household"
  ,"Not Required"
  ,"Married/Jointly"
  ,"Married/Separately"
  ,"Qualifying Widow(er)"
  ,"Married/2 Incomes"
  ,"Special A"
  ,"Special B"
  ,"Special C"
  ,"Special D"
  ,"Special E"
  ,"Special F"
  ,"Special G"
  ,"Special H"
]
const array_employee_pay_method=[
  "Salary",
  "Hourly-Hours per Pay Period",
  "Hourly-Time Ticket Hours"
]
const array_marital_status=[
  "Married",
  "Single",
  "Divorced",
  "Widowed",
  "Other",
]
const array_pay_method=[
  'Salaried',
  'Hourly',
  'Hourly'
];

const array_user_level=[
  "User",
  "Email",
  "Mirror",
];

const array_invoice_status=[
  "Unpaid", //0
  "Partially Paid",//1
  "Paid in Full", //2
  "Past Due",//3
  "Void"//4
];

const array_page_limit=[
  "10 rows",
  "20 rows",
  "50 rows",
  "100 rows"
]

const array_page_limit_int=[
  10,
  20,
  50,
  100
]

const array_record_by=[
  "Employee",
  "Vendor"
]

const array_ticket_type=[
  "Daily",
  "Weekly"
]

const array_customer_by=[
  "Customer",
  "Job",
  "Administrative"
]

const array_pay_level=[
  "Regular",
  "Overtime",
  "Special"
];

const array_billing_type=[
  "Employee rate",
  "Activity rate",
  "Override rate",
  "Flat fee"
];

const array_billing_status=[
  "Billable",
  "Non-Billable",
  "No Charge",
  "Hold"
]

const array_time_option=[
  "Manual Timed Entry",
  "Timed Duration"
]

const array_quota_type=[
  "Begin",
  "Add",
  "Send",
  "Redeem"
]

const array_file_type=[
  "root",
  "folder",
  "application",
  "json",
  "image",
  "text",
]

const array_message_option=[
  "Direct Message",
  "Group Message",
]

const array_directory=[
  "Accounting",
  "Production",
]

const array_decimal_places=[
  "0",
  "0.0",
  "0.00",
  "0.000",
  "0.0000",
];

const array_payroll_field_class=[
  "Salary Fields",
  "Employee Fields",
  "Company Fields",
  "Accrue Fields",
]

const array_menu_type=[
  "Root",        // read only
  "Folder",      // read and write;
  "Application", // read and write;
  "File",        // read only
]

const array_menu_access=[
  "No Access",
  "Can Read",
  "Can Create",
  "Can Edit"
]

const array_menu_group=[
  "Table",
  "Query",
  "Form",
  "Report"
]

const array_message_send_method=[
  "Message create in sender. (0 send)",
  "Message create in room. (1 send)",
//  "Message create in receipent. (n send)"
]

const array_journal_type=[
  "Beginning Balances", // 0
  "Cash Receipts Journal", // 1
  "Sales Journal",         // 2
  "Cash Disbursements Journal", // 3
  "Purchase Journal",      // 4
  "Payroll Journal",       // 5
  "General Journal",       // 6
  "Build Journal",         // 7
  "Unbuild Journal",       // 8
  "Adjustment Journal",    // 9
  "COGS Journal"           // 10
];

const journal_type={
  "Beginning Journal": 0,
  "Cash Receipts Journal": 1,
  "Sales Journal": 2,
  "Cash Disbursements Journal": 3,
  "Purchase Journal": 3,
  "Payroll Journal": 5,
  "General Journal": 6,
  "Build Journal": 7,
  "Unbuild Journal": 8,
  "Adjustments Journal": 9,
  "COGS Journal": 10,
}

const array_currencies=[
  ["IDR", "Rupiah"],
  ["USD", "US Dollar"],
  ["EUR", "Euro"],
  ["JPY", "Yen"],
  ["AUD", "Australian Dollar"],
  ["BND", "Brunei Dollar"],
  ["HKD", "Hong Kong Dollar"],
  ["INR", "Indian Rupee"],
  ["MYR", "Malaysian Ringgit"],
  ["PHP", "Philippine Peso"],
  ["RUB", "Russian Rubie"],
  ["SAR", "Saudi Riyal"],
  ["SGD", "Singapore Dollar"],
  ["THB", "Baht"],
  ["TRY", "Turkish Lira"],
  ["GBP", "Pund Sterling"],
  ["VND", "Dong"],
  ["CNY", "Yuan Renminbi"]
]

const data_fields=[
  // master id
  ['record_id','Record ID'],
  ['process_id','Process ID'],
  ['modul_id','Modul ID'],
  ['user_name','User Name'],
  ['retype_passcode','Retype Passcode'],
  ['user_fullname','User Full Name'],
  ['user_password','Password'],
  ['confirm_password','Comfirm Password'],
  ['login_id','Login ID'],
  ['home_id','Home ID'],
  ['company_id','Company ID'],
  ['end_date','End Date'],
  ['start_date','Start Date'],
  ['account_id','Account ID'],
  ['tax_id','Tax ID'],
  ['location_id','Location ID'],
  ['to_location_id','To Location ID'],
  ['phase_id','Phase ID'],
  ['cost_id','Cost ID'],
  ['ship_id','Ship VIA'],
  ['pay_method_id','Pay Method ID'],
  ['invite_id','Invite ID'],
  
  ['item_id','Item ID'],
  ['sub_item_id','Sub Item ID'],
  ['job_id','Job ID'],
  ['sales_tax_id','Sales Tax ID'],
  ['employee_id','Employee ID'],
  ['vendor_id','Vendor ID'],
  ['customer_id','Customer ID'],
  ['sales_rep_id','Sales Rep ID'],
  ['note_id','Note ID'],
  ['email_address','Email Address'],
  ['period_active','Current Period'],
  
  ['sales_account_id','Sales Account ID'],
  ['inventory_account_id','Inventory Account ID'],
  ['cogs_account_id','COGS Account ID'],
  ['income_account_id','Income Account ID'],
  ['gl_account_id','GL Account ID'],
  ['discount_account_id','Discount Account ID'],
  ['ap_account_id','AP Account ID'],
  ['ar_account_id','AR Account ID'],
  ['cash_account_id','Cash Account ID'],
  ['freight_account_id','Freight Account ID'],
  ['liability_account_id','Liability Account ID'],
  ['expense_account_id','Expense Account ID'],
  
  ['date','Date'],
  ['description','Description'],
  ['returned','Returned'],
  ['remaining','Remaining'],

  // modul
  ['account_defaults','Account Defaults'],
  ['customer_defaults','Customer Defaults'],
  ['item_defaults','Item Defaults'],
  ['vendor_defaults','Vendor Defaults'],
  ['employee_defaults','Employee Defaults'],
  ['prices','Item Prices'],
  ['boms','Bill of Materials'],
  ['journal_entry','Journal Entry'],
  ['builds','Build Assemblies'],
  ['unbuilds','Unbuild Assemblies'],
  ['moves','Movement'],
  ['invoices','Sales Invoice'],
  
  // begin
  ['balance_no','Balance No'],
  ['account_begins','Account Beginning'],
  ['vendor_begins','Vendor Beginning'],
  ['customer_begins','Customer Beginning'],
  ['job_begins','Job Beginning'],
  ['item_begins','Item Beginning'],
  ['employee_begins','Employee Beginning'],
  ['field_name','Field Name'],
  
  // transaction number
  ['journal_no','Journal No.'],
  ['build_no','Build No.'],
  ['unbuild_no','Unbuild No.'],
  ['move_no','Move No.'],
  ['adjustment_no','Adjustment No.'],
  ['po_no','PO No.'],
  ['receive_no','Receive No.'],
  ['payment_no','Payment No.'],
  ['void_no','Void No.'],
  ['check_no','Check No.'],
  ['credit_no','Credit No.'],
  ['invoice_no','Invoice No.'],
  ['quote_no','Quote No.'],
  ['convert_to','Convert to'],
  ['convert_no','Convert No.'],
  ['so_no','SO No.'],
  ['shipped','Shipped'],
  ['receipt_no','Receipt No.'],
  ['unit_cost','Unit Cost'],
  ['quantity','Quantity'],
  ['on_hand','On Hand'],
  ['payroll_no','Payroll No.'],
  ['ticket_no','Ticket No.'],
  ['charge_item_id','Charge Item ID'],
  ['activity_item_id','Activity Item ID'],
  ["deposit_no","Deposit No."],
  ["receive_inventory","Receive No."],
  ["amount","Amount"],
  ["amount_returned","Amount Returned"],
  ["record_lock","Record Lock"],
  ["period_id","Period ID"],
  ["budgets","Budget"],
  ["remaining_amount","Remaining amount"],
  ["customer_credit_no","credit_no"],
  ["operator_2","Operator 2"],
  ["column_name","Column Name"],
  ["select_column","SELECT column"],
  ["from","FROM"],
  ["query_name","Query Name"],
  ["vendor_defaults","Vendor Defaults"],
  ['reference_no','Reference No.'],
  ['bom_no','BOM No.'],
  // SQL
  ['sql_statement','SQL Statement'],
  ['table_name','Table Name'],
  ['column_name','Column Name'],
  ['sql_clause','SQL Clause'],
  ['sql_keyword','SQL Keyword'],
  ['sql_operator','SQL Operator'],
  ['value','Value'],
  ['sql_parse','SQL Parse'],
  ['where_column','Where Column'],
  ['column','Column'],
  ['sql_syntax','Syntax near...'],
  ['set_column','SET Column'],
  
  ['modul','Modul'],
  ['index','Index'],
  ['account_balances','Account Balances'],
  ['sql_route','Route SQL'],
  
  ['received','Received'],
  ['quote_no','Quote No.'],
  ['discount','Discount'],
  ['discount_due','Discount due'],
  
  ['current_password','Current Password'],
  ['new_password','New Password'],
  ['retype_password','Retype Password'],
  ['user_login','User Login'],
  ['block_size','Block Size'],
  ['block_free','Block Free'],
  ['token','Token'],
  ['admin_name','Admin Name'],
  
  ['amount_paid','Amount Paid'],
  ['amount_due','Amount Due'],
  ['close_period','Close Period'],
  ['lock_id','Locker ID'],
  ['table_id','Table ID'],
  ['folder','Folder'],
  ['list_id','List ID'],
  ['file','File'],
  ['name','Name'],
  ['label_id','Label ID'],
  ['path','Path'],
  ['labels','Labels'],
  ['lists','Lists'],
  ['ship_methods','Ship Methods'],
  ['reset_code','Reset Code'],
  ['task_id','Task ID'],
  ['notes','Notes'],
  ['contact_name','Contact Name'],
  ['group_id','Group ID'],
  ['message_to','Message to'],
  ['message_with','Message with'],
  ['your_name','Your name as member'],
  ['admin','Who admin'],
  ['properties','File properties'],
  ['currency_id','Currency ID'],
  
  ['payroll_entry','Payroll Entry'],
  ['vendor_credits','Vendor Credit'],
  ['deposit','Deposit'],
  ['reconcile_date','Reconcile Date'],
  ['buyer_id','Buyer ID'],
  ['payroll_field','Payroll Field'],
  
  ['reconcile_account','Account Reconciliation'],
  ['file_id','File ID'],
  ['file_path','File Path'],
  ['close_so','Close SO'],
  ['close_po','Close PO'],
  ['key','Key'],
  ['duration','Duration'],
  ['bus_id','Bus ID'],
  ['room_id','Room ID'],
  ['message_bus','New Message'],
];


//----variable

var objPop;
var nBebas={
  gimana:false,
  indek:-1
}
var content={};
var recent_count=0;
var bingkai_posisi=[{
  indek:0,
  dead:0,
  name:''
}];
var Drag={};
var Resize={};
var global={
  login_blok:null,
  tabPasif:0,
  klik:true,
}
var layar={
  lebar:0,
  tinggi:0,
}
var ui={
  zindek:0,
  global_url:'',
  menu_bar_show:false,
  modal:false,
  warna:{
    form:'#F5F5F5',
    toolbar:'#F5F5F5',
  },
  titlebar:{
    tinggi:1.7,
    warna:"#d0d3d4",
  },
  unit:'rem',
};
var datanya=[
  {
    "id":"home",
    "name":"&#9776",
    "submenu":[],
    "status":"1",
    "display":"inline-block"
  },
  {
    "id":"window",
    "name":"Recent",
    "submenu":[],
    "status":"1",
    "display":"none"
  }
];
var Menu=[];
//var lebarDef=(window.innerWidth/100*75)/parseFloat(getComputedStyle(document.documentElement).fontSize); //60
//var tinggiDef=(window.innerHeight/100*85)/parseFloat(getComputedStyle(document.documentElement).fontSize); //35

var lebarDef=(document.documentElement.clientWidth/100*75)/parseFloat(getComputedStyle(document.documentElement).fontSize); //60
//var tinggiDef=(document.documentElement.clientHeight/100*85)/parseFloat(getComputedStyle(document.documentElement).fontSize); //35
var tinggiDef=(document.documentElement.clientHeight/100*90)/parseFloat(getComputedStyle(document.documentElement).fontSize); //35
var bingkai=[{
  parent:0,
  nama:'',
  modul:'',
  server:{
    url:config.url,
    image:config.image,
  },
  login:{
    id:null,
    name:'Your Name',
    full_name:'Your Full Name',
  },
  company:{
    id:'',
    name:'',
    decimal: 1,
  },
  admin:{
    name:null,
  },
  invite:{
    id:null,
    name:null,
  },
  network:{
    admin_name:null,
    company_id:null,
  },
  content:false,
  menu:{
    id:null,
    name:null,
    type:null,
    data:[],
  },
  group:{
    id:'net',
  },
  paket:[],
  paging:{
    page:1,
    limit:10,
    select:0
  },
  closed:1,
  status:1,
  letak:{
    tengah:1, //[0=random;1=tengah;2=maksimal]
    atas:3.50,
    kiri:3.50,
  },
  ukuran:{
    lebar:lebarDef,
    tinggi:tinggiDef,
  },
  bisa:{
    hilang:1,
    tutup:1,
    kecil:1,
    besar:1,
    sedang:1,
    tambah:1,
    gerak:1,
    ubah:1,
  },
  modal:0,
//  child_free:true,
  have_child:false,
  pop_up:false,
  look_up:false,
  path:'',
  folder:'',
  statusbar:{
    ada:1,
    tinggi:3.00,
  },
  titlebar:{
    ada:1,
    tinggi:1.50,
    warna:""
  },
  toolbar:{
    ada:1,
    tinggi:1.90,
    warna:'#F5F5F5',
    button:{
      atas:0.1,
      kiri:0.25,
      tinggi:1.50,
    }
  },
  warna:'#F5F5F5',
  unit:"rem",
  baru:false,
  home:{
    id:'',
    name:'',
  },
  directory:{
    index:0,
  },
  var:{},
}];
var antrian=[];
var message={};
var db={};
var db1={};
var db3={};
var iii={}
var objPop={};
var paging_limit=[];
//--
var SELECT_ALL=false;//old deprekete
var READ_PAGING=false;//old deprekete
var PAGING=true;// new var fresh
//--


// eof: 218;615;782;
