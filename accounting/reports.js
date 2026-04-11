/*
 * name: budiono;
 * date: dec-03, 22:56, tue-2024; 
 * edit: may-05, 16:14, mon-2025; #54; report; 
 * edit: may-15, 08:13, thu-2025; #54; report;
 * edit: may-18, 12:24, sun-2025; #55; add journal_type+unit_price;
 * edit: may-20, 08:00, tue-2025; #55; add reorder_worksheet;
 * edit: may-21, 14:34, wed-2025; #55; add check Register;
 * edit: may-21, 17:47, wed-2025; #55; add item purchased;
 * edit: may-22, 19:37, thu-2025; #55; add vendor_management_detail;
 * edit: may-23, 08:58, fri-2025; #55; add vendor_transaction_history;
 * edit: may-24, 11:29, sat-2025; #55; add invoice_register;
 * edit: may-25, 07:47, sun-2025; #55; add est_job_revenues;
 * edit: may-27, 15:32, tue-2025; #56; job_activity:: add job_estimates;
 * edit: may-28, 15:53, wed-2025; #56; job_register; work_in_progress;
 * edit: may-30, 07:43, fri-2025; #56; job_costs_by_type;
 * edit: may-31, 11:39, sat-2025; #56; payroll_check_register;
 * edit: jun-01, 17:11, sun-2025; #56; payroll_tax_report;
 * edit: jun-10, 07:36, tue-2025; #57; payroll_field;
 * edit: jun-12, 11:51, thu-2025; #58; items_sold;
 * edit: jun-13, 11:24, fri-2025; #59; cos_amount; vendor_ledgers;
 * edit: jun-18, 17:29, wed-2025; #61; add income_statement;
 * edit: jun-19, 09:59, thu-2025; #61; add gl_account_summary;
 * edit: jul-07, 11:16, mon-2025; #63; report reconcile;
 * edit: jul-08, 16:22, tue-2025; #63; account_register;
 * edit: jul-10, 15:36, thu-2025; #63; outstanding_checks;
 * edit: jul-18, 11:13, fri-2025; #64; report time/expense;
 * edit: jul-18, 15:53, fri-2025; #64; rpt expense ticket register;
 * edit: jul-19, 10:17, sat-2025; #64; rpt_ticket_listing_by_customer;
 * edit: jul-19, 16:24, sat-2025; #64; rpt_time_ticket_register;
 * edit: jul-20, 20:46, sun-2025; #64; rpt_tickets_recorded_by;
 * edit: jul-21, 12:34, mon-2025; #64; rpt_payroll_time_sheet;
 * edit: aug-10, 13:00, sat-2025; #66; tersisa 13 report;
 * edit: aug-12, 14:45, tue-2025; #66; cash_account_register;
 */
 
'use strict';

var Reports={}

Reports.form=new ActionForm2(Reports);
Reports.hideNew=true;
Reports.schema=[
  ["Accounts Receivable",
    [
      ["ar","Aged Receivables"],
      ["ar_cash_receipts_journal","Cash Receipts Journal"],
      ["ar_contact_list","Contact List"],
      ["ar_customer_ledgers","Customer Ledgers"],
      ["ar_customer_list","Customer List"],      
      ["ar_customer_management","Customer Management Detail"],
      ["ar_customer_sales_history","Customer Sales History"],
      ["ar_customer_transaction","Customer Transaction History"],
      ["ar_invoice_register","Invoice Register"],
      ["ar_items_sold","Items Sold to Customers"],
      ["ar_quote_register","Quote Register"],
      ["ar_sales_journal","Sales Journal"],
      ["","Sales Order Journal"],
      ["ar_sales_order_register","Sales Order Register"],
      ["ar_sales_order_report","Sales Order Report"],
      ["ar_sales_rep_reports","Sales Rep Reports"],
      ["ar_sales_taxes","Sales Taxes"],
      ["ar_taxable_exempt_sales","Taxable / Exempt Sales"],
    ]
  ],
  ["Accounts Payable",
    [
      ["ap","Aged Payables"], // 1
      ["ap_cash_disbursements_journal","Cash Disbursements Journal"], // 2
      ["ap_cash_requirements","Cash Requirements"],// 3
      ["ap_check_register","Check Register"], // 4
      ["ap_item_purchased","Item Purchased from Vendors"], // 5
      ["ap_purchase_journal","Purchase Journal"], // 6
      ["","Purchase Order Journal"], // 7
      ["ap_purchase_order_register","Purchase Order Register"], // 8
      ["ap_vendor_ledgers","Vendor Ledgers"],//9
      ["ap_vendor_list","Vendor List"],//10
      ["ap_vendor_management","Vendor Management Detail"],//11
      ["ap_vendor_transaction","Vendor Transaction History"],//12
    ]
  ],
  ["Payroll",
    [
      ["pr_current_earnings_report","Current Earnings Report"],
//      ["","Employee Compesation Report"],
      ["pr_employee_list","Employee List"],
      ["pr_payroll_check_register","Payroll Check Register"],
      ["pr_payroll_journal","Payroll Journal"],
      ["pr_payroll_register","Payroll Register"],
      ["pr_payroll_tax_report","Payroll Tax Report"],
      ["pr_tax_liability_report","Tax Liability Report"],
      ["pr_vacation_and_sick_time","Vacation and Sick Time Report"],
    ]
  ],
  ["General Ledger",
    [
      ["","Budget"],
      ["gl_cash_account_register","Cash Account Register"],
      ["gl_chart_of_accounts","Chart of Accounts"],
      ["gl_general_journal","General Journal"],
      ["gl_general_ledger","General Ledger"],
      ["gl_trial_balance","General Ledger Trial Balance"],
      ["","Transaction Detail By Status"],
      ["","Transaction Detail Report"],
    ]
  ],
  ["Financial Statements",
    [
      ["","Gross Profit by Departments"],
      ["fs_income_statement","Income Statement"],
      ["fs_balance_sheet","Balance Sheet"],
      ["","Cash Flow"],
      ["fs_gl_account_summary","GL Account Summary"],
      ["fs_retained_earnings","Retained Earnings"],
    ]
  ],
  ["Inventory",
    [
      ["in_assemblies_journal","Assemblies Adjustment Journal"],
      ["in_assembly_list","Assembly List"],
      ["in_boms_report","Bills of Materials Report"],
      ["in_buyer_report","Buyer Report"],
      ["in_component_use_list","Component Use List"],
      ["in_cogs_journal","Cost of Goods Sold Journal"],
      ["in_inventory_adjustment_journal","Inventory Adjustment Journal"],
      ["in_profitability_report","Inventory Profitability Report"],
      ["in_reorder_worksheet","Inventory Reorder Worksheet"],
      ["in_inventory_stock","Inventory Stock Status Report"],
      ["","Inventory Unit Activity Report"],
      ["","Inventory Valuation Report"],
      ["in_item_costing","Item Costing Report"],
      ["in_item_list","Item List"],
      ["in_price_list","Item Price List"],
      ["in_physical_inventory","Physical Inventory List"],
    ]
  ],
  ["Job Reports",
    [
      ["jr_cost_code_list","Cost Code List"],
      ["jr_job_expenses","Estimated Job Expenses"],
      ["jr_job_revenue","Estimated Job Revenue"],
      ["jr_job_costs_by_type","Job Costs by Type"],
      ["jr_job_estimates","Job Estimates"],
      ["jr_job_ledger","Job Ledger"],
      ["jr_job_list","Job List"],
      ["jr_job_profitability_report","Job Profitability Report"],
      ["jr_job_register","Job Register"],
      ["jr_job_retainage_report","Job Retainage Report"],
      ["jr_phase_list","Phase List"],
      ["jr_unbilled_job_expenses","Unbilled Job Expense"],
      ["jr_work_in_progress","Work in Progress"],
    ]
  ],
  ["Account Reconciliation",
    [
      ["rc_account_reconciliation","Account Reconciliation"],
      ["rc_account_register","Account Register"],
      ["rc_bank_deposit_report","Bank Deposit Report"],
      ["rc_deposits_in_transit","Deposits in Transit"],
      ["rc_other_outstanding_items","Other Outstanding Items"],
      ["rc_outstanding_checks","Outstanding Checks"],
    ]
  ],
  ["Time/Expense Reports",
    [
      ["te_aged_tickets","Aged Tickets"],
      ["te_employee_time","Employee Time"],
      ["te_expense_ticket","Expense Ticket Register"],
      ["te_payroll_time_sheet","Payroll Time Sheet"],
      ["te_reimbursable","Reimbursable Employee Expense"],
      ["te_ticket_listing","Ticket Listing by Customer"],
      ["te_tickets_recorded_by","Tickets Recorded By"],
      ["te_tickets_sales_invoicing","Tickets Used in Invoicing"],
      ["te_tickets_by_item_id","Tickets by Item ID"],
      ["te_time_ticket_register","Time Ticket Register"],
    ]
  ],
]


Reports.show=(tiket)=>{
  tiket.modul='reports';
  tiket.menu.name="Reports";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Reports.pageShow(indek);
  }else{
    show(baru);
  }  
}

Reports.pageShow=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek);});
  toolbar.more(indek,()=>{Menu.more(indek);});
  Reports.viewForm(indek);
};

Reports.viewForm=(indek)=>{
  var i=0,j=0;
  var d=Reports.schema;
  var html='<div style="padding:0.5em;margin-bottom:50px;">'
    +content.title(indek)
    +content.message(indek)

    for(i=0;i<d.length;i++){
      html+="<details>"
        +'<summary><big>'+d[i][0]+'</big></summary>'
        +'<ol type="1">';
        for(j=0;j<d[i][1].length;j++){
          html+='<li style="margin-bottom:5px;" >'
            +'<button type="button" '
            +' onclick="Reports.preview(\''+indek+'\',\''+d[i][1][j][0]+'\',\''+d[i][1][j][1]+'\')"'
            +' style="background-color:white;font-weight:bolder;">'
            //+'&#9900;&nbsp;'+d[i][1][j][1]+'</button>'
            +'<i style="color:grey;">&#10070;</i>&nbsp;&nbsp;'+d[i][1][j][1]+'</button>'
            +'</li>';
        }
        html+='</ol>'
          +'<hr style="color:gold;">'
          +'</details>';
    }
    html+='</div>'
  content.html(indek,html);
};

Reports.preview=(indek,rpt_code,rpt_name)=>{
  
  const tiket=JSON.parse(JSON.stringify(bingkai[indek]));// destruct arr
  tiket.parent=0;
  tiket.menu.id=rpt_code;
  tiket.menu.name=rpt_name;
  tiket.menu.folder=tiket.folder;
  
  tiket.folder=bingkai[indek].folder;
  antrian.push(tiket);
  
  Menu.active.id=tiket.menu.id;
  Menu.active.name=tiket.menu.name;
  
  // ar: accounts receivable
  // ap: accounts payable
  // pr: payroll
  // gl: general ledger
  // fs: financial statements
  // in: inventory
  // jr: job reports  
  // rc: account reconciliation
  // te: time/expense reports

  switch(rpt_code){
    // may 8;
    case "ar": RptAR.show(tiket); break;// 1
    case "ap": RptAP.show(tiket); break;// 2
    // may 9;
    case "ap_vendor_list": RptVendorList.show(tiket); break;// 1 (3)
    case "ar_customer_list": RptCustomerList.show(tiket); break;// 2 (4)
    case "pr_employee_list": RptEmployeeList.show(tiket); break;// 3 (5)
    case "in_item_list": RptItemList.show(tiket); break;// 4 (6)
    // may-10
    case "jr_cost_code_list": RptCostCodeList.show(tiket); break;// 1 (7)
    case "jr_phase_list": RptPhaseList.show(tiket); break;// 2 (8)
    case "in_assembly_list": RptAssemblyList.show(tiket); break;// 3 (9)
    case "gl_chart_of_accounts": RptChartofAccounts.show(tiket); break;// 4 (10)
    case "gl_general_journal": RptGeneralJournal.show(tiket); break;// 5 (11)
    case "gl_general_ledger": RptGeneralLedger.show(tiket); break;// 6 (12)
    // may-12
    case "gl_trial_balance": RptGLTrialBalance.show(tiket); break;// 1; (13)
    // may-14;
    case "in_component_use_list": RptComponentUseList.show(tiket); break;// 1; (14)
    case "in_inventory_adjustment_journal": RptInventoryAdjustmentJournal.show(tiket); break;// 2; (15)
    // may-15;
    case "in_inventory_stock": RptInventoryStock.show(tiket); break // 1 (16)
    case "in_item_costing": RptItemCosting.show(tiket); break // 2 (17)
    case "in_price_list": RptPriceList.show(tiket); break // 3 (18)
    case "in_physical_inventory": RptPhysical.show(tiket); break // 4 (19)
    case "in_assemblies_journal": RptAssembliesJournal.show(tiket); break // 5 (20)
    // may-16;
    case "in_boms_report": RptBomsReport.show(tiket); break // 1 (21)
    case "in_buyer_report": RptBuyerReport.show(tiket); break // 2 (22)
    // may-18;
    case "in_cogs_journal": RptCOGSJournal.show(tiket); break // 1 (23)
    case "ar_cash_receipts_journal": RptCashReceiptsJournal.show(tiket); break // 2 (24)
    case "ar_sales_journal": RptSalesJournal.show(tiket); break // 3 (25)
    case "ap_cash_disbursements_journal": RptCashDisbursementsJournal.show(tiket); break // 4 (26)
    case "ap_purchase_journal": RptPurchaseJournal.show(tiket); break // 5 (27)
    case "pr_payroll_journal": RptPayrollJournal.show(tiket); break // 6 (28)
    case "in_profitability_report": RptProfitabilityReport.show(tiket); break // 7 (29)
    // may-19;
    // may-20:
    case "in_reorder_worksheet": RptReorderWorksheet.show(tiket); break // 1 (30)
    case "ap_cash_requirements": RptCashRequirements.show(tiket); break // 2 (31)
    // may-21;
    case "ap_purchase_order_register": RptPurchaseOrderRegister.show(tiket); break // 1 (32)
    case "ap_check_register": RptCheckRegister.show(tiket); break // 2 (33)
    case "ap_item_purchased": RptItemPurchased.show(tiket); break // 3 (34)
    // may-22;
    case "ap_vendor_management": RptVendorManagement.show(tiket); break // 1 (35)
    // may-23;
    case "ap_vendor_transaction": RptVendorTransaction.show(tiket); break // 1 (36);
    case "ar_customer_management": RptCustomerManagement.show(tiket); break // 2 (37);
    case "ar_customer_transaction": RptCustomerTransaction.show(tiket); break // 3 (38);
    // may-24;
    case "ar_invoice_register": RptInvoiceRegister.show(tiket); break // 1 (39);
    case "ar_quote_register": RptQuoteRegister.show(tiket); break // 2 (40);
    case "ar_sales_order_register": RptSalesOrderRegister.show(tiket); break // 3 (41);
    case "ar_sales_order_report": RptSalesOrderReport.show(tiket); break // 4 (42);
    case "ar_sales_taxes": RptSalesTaxes.show(tiket); break // 5 (43);
    // may-25;
    case "jr_job_expenses": RptJobExpenses.show(tiket); break // 1 (44);
    case "jr_job_revenue": RptJobRevenue.show(tiket); break // 1 (45);
    // may-27, 2025;
    case "jr_job_estimates": RptJobEstimates.show(tiket); break // 1 (46);
    case "jr_job_list": RptJobList.show(tiket); break // 2 (47);
    case "jr_job_profitability_report": RptJobProfitability.show(tiket); break // 3 (48);
    // may-28, 2025;
    case "jr_job_register": RptJobRegister.show(tiket); break; // 1 (49);
    case "jr_work_in_progress": RptWorkinProgress.show(tiket); break; // 2 (50)
    // may-30, 2025;
    case "jr_job_costs_by_type": RptJobCostsbyType.show(tiket); break; // 1 (51);
    case "jr_job_ledger": RptJobLedger.show(tiket); break; // 2 (52);
    case "jr_unbilled_job_expenses": RptUnbilledJobExpenses.show(tiket); break; // 3 (53);
    case "jr_job_retainage_report": RptJobRetainageReport.show(tiket); break; // 4 (54);
    // may-31, 2025;
    case "pr_payroll_check_register": RptPayrollCheckRegister.show(tiket); break; // 1 (55);
    case "pr_payroll_register": RptPayrollRegister.show(tiket); break; // 2 (56);
    // jun-01, 2025;
    case "pr_payroll_tax_report": RptPayrollTaxReport.show(tiket); break; // 1 (57);
    // jun-02, 2025;
    case "pr_current_earnings_report": RptCurrentEarningsReport.show(tiket); break; // 1 (58);
    // jun-10, 2025; kembali ke report setelah ada tambahan payroll_field;
    case "pr_vacation_and_sick_time": RptVacationandSickTime.show(tiket); break; // 1 (59);
    // jun-11, 2025;
    case "pr_tax_liability_report": RptTaxLiabilityReport.show(tiket); break; // 1 (60);
    case "ar_customer_ledgers": RptCustomerLedgers.show(tiket); break; // 2 (61);
    // jun-12, 2025;
    case "ar_items_sold": RptItemsSold.show(tiket); break; // 1 (62);
    // jun-13, 2025;
    case "ar_customer_sales_history": RptCustomerSalesHistory.show(tiket); break; // 1 (63);
    case "ap_vendor_ledgers": RptVendorLedgers.show(tiket); break; // 2 (64);
    // jun-15, 2025;
    case "fs_balance_sheet": RptBalanceSheet.show(tiket); break; // 1 (65);
    // jun-18, 2025;
    case "fs_income_statement": RptIncomeStatement.show(tiket); break; // 1 (66);
    // jun-19, 2025;
    case "fs_gl_account_summary": RptGLAccountSummary.show(tiket); break; // 1 (67);
    case "fs_retained_earnings": RptRetainedEarnings.show(tiket); break; // 2 (68);
    // jun-20, 2025;
    case "rc_bank_deposit_report": RptBankDepositReport.show(tiket); break; // 1 (69);
    // jul-07, 2025;
    case "rc_account_reconciliation": RptAccountReconciliation.show(tiket); break; // 1 (70);
    case "rc_account_register": RptAccountRegister.show(tiket); break; // 1 (71);
    // jul-09, 2025;
    case "rc_deposits_in_transit": RptDepositsinTransit.show(tiket); break; // 1 (72);
    // jul-10, 2025;
    case "rc_outstanding_checks": RptOutstandingChecks.show(tiket); break; // 1 (73);
    case "rc_other_outstanding_items": RptOtherOutstanding.show(tiket); break; // 2 (74);
    // jul-18, 2025;
    case "te_employee_time": RptEmployeeTime.show(tiket); break; // 1(75);
    case "te_expense_ticket": RptExpenseTicket.show(tiket); break; // 1(76);
    // jul-19, 2025;
    case "te_ticket_listing": RptTicketListingByCustomer.show(tiket); break; // 1(77);
    case "te_time_ticket_register": RptTimeTicketRegister.show(tiket); break; // 1(78);
    // jul-20, 2025;
    case "te_tickets_by_item_id": RptTicketsbyItemID.show(tiket); break; // 1(79);
    case "te_tickets_recorded_by": RptTicketsRecordedBy.show(tiket); break; // 2 (80);
    // jul-21, 2025;
    case "te_payroll_time_sheet": RptPayrollTimeSheet.show(tiket); break; // 1 (81);
    // aug-08, 2025;
    case "te_reimbursable": RptReimbursable.show(tiket); break; // 1 (82);
    case "te_tickets_sales_invoicing": RptTicketsSalesInvoicing.show(tiket); break; // 2 (83);
    case "te_aged_tickets": RptAgedTickets.show(tiket); break; // 2 (84);
    // aug-10, 2025;
    case "ar_contact_list": RptContactList.show(tiket); break; // 1 (85);
    case "ar_taxable_exempt_sales": RptTaxableExemptSales.show(tiket); break; // 1 (86);
    // aug-12, 2025;
    case "gl_cash_account_register": RptCashAccountRegister.show(tiket); break; // 1 (87);
    case "ar_sales_rep_reports": RptSalesRepReports.show(tiket); break; // 2 (88);

    default:
      alert('['+rpt_code+'] belum terdaftar ');
  };
};







// eof: 265;277;283;290;317;321;340;358;372;
