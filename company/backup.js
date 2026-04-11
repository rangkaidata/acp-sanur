/*
 * name: budiono;
 * date: feb-28, 08:49, wed-2024; new;
 * edit: apr-26, 11:33, sat-2025; #51; backup;
 * edit: apr-29, 12:06, tue-2025; #51; finishing backup;
 */
 
'use strict';

var Backup={}
var dataBC={
  "tables":{},
  "wait_00":[],// master paralel one table
  "wait_01":[],// transaction many table serial sort by modul and date.
  "wait_02":[],// master paralel one table until end to complete & close.
};

Backup.form=new ActionForm2(Backup);
Backup.hideNew=true;

Backup.show=(tiket)=>{
  tiket.modul='backup_data';
  tiket.menu.name="Backup Data";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Backup.formUpdate(indek);
  }else{
    show(baru);
  }  
}

Backup.formUpdate=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  Backup.formEntry(indek);
}

Backup.formEntry=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<form autocomplete="off">' 
    
    +'<div id="backup_now_'+indek+'">'
      +'<label>Company ID:</label>'
      +'<input type="text" disabled'
        +' id="company_id_'+indek+'" '
        +' value="'+bingkai[indek].company.id+'">'
      +'<br>'
      +'<label>Comment:</label>'
      +'<input type="text" '
        +' id="comment_'+indek+'" size="50">'
      +'<p>'
      +'<input type="button" '
//      +' id="backup_now_'+indek+'"'
      +' onclick="Backup.prosesSkrg(\''+indek+'\');" '
      +' value="Backup Now">'
      +'</p>'
    +'</div>'
    +'<div id="file_ready_'+indek+'"></div>'
    +'<div id="proses_info_'+indek+'" '
      +'style="white-space:normal;overflow-wrap: break-word;" >'
    +'</div>'
//    +'<div id="layar_'+indek+'"></div>'
    +'</form>'
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

Backup.company=(indek,r2)=>{// 0-company
  var sql=sqlDatabase2(indek,"company");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,0,r);
    return r2();
  });
}

Backup.accounts=(indek,r2)=>{// 1-accounts
  var sql=sqlDatabase2(indek,"accounts");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,1,r);
    return r2();
  });
}

Backup.cost_codes=(indek,r2)=>{// 2-cost_codes
  var sql=sqlDatabase2(indek,"cost_codes");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,2,r);
    return r2();
  });
}

Backup.currencies=(indek,r2)=>{// 3-currencies
  var sql=sqlDatabase2(indek,"currencies");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,3,r);
    return r2();
  });
}

Backup.locations=(indek,r2)=>{// 4-locations
  var sql=sqlDatabase2(indek,"locations");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,4,r)
    return r2();
  });
}

Backup.payMethods=(indek,r2)=>{// #5-pay_methods
  var sql=sqlDatabase2(indek,"pay_methods");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,5,r)
    return r2();
  });
}

Backup.phases=(indek,r2)=>{// 6-phases
  var sql=sqlDatabase2(indek,"phases");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,6,r)
    return r2();
  });
}

Backup.shipMethods=(indek,r2)=>{// 7-ship_methods
  var sql=sqlDatabase2(indek,"ship_methods");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,7,r)
    return r2();
  });
}

Backup.taxes=(indek,r2)=>{// 8-taxes
  var sql=sqlDatabase2(indek,"taxes");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,8,r)
    return r2();
  });
}

Backup.account_begins=(indek,r2)=>{// #9 account_begins
  var sql=sqlDatabase2(indek,"account_begins");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,9,r)
    return r2();
  });
}

Backup.customer_defaults=(indek,r2)=>{//10 customer_defaults
  var sql=sqlDatabase2(indek,"customer_defaults");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,10,r)
    return r2();
  });
}

Backup.item_defaults=(indek,r2)=>{// 11 item_defaults
  var sql=sqlDatabase2(indek,"item_defaults");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,11,r)
    return r2();
  });
}

Backup.journal_entry =(indek,r2)=>{// 12 journal_entry
  var sql=sqlDatabase2(indek,"journal_entry");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,12,r)
    return r2();
  });
}

Backup.payroll_fields=(indek,r2)=>{//13 payroll_fields
  var sql=sqlDatabase2(indek,"payroll_fields");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,13,r)
    return r2();
  });
}

Backup.sales_taxes=(indek,r2)=>{//14 sales_taxes
  var sql=sqlDatabase2(indek,"sales_taxes");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,14,r)
    return r2();
  });  
}

Backup.vendor_defaults=(indek,r2)=>{//15 vendor_defaults
  var sql=sqlDatabase2(indek,"vendor_defaults");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,15,r)
    return r2();
  });
}

Backup.vendors=(indek,r2)=>{//16 vandors
  var sql=sqlDatabase2(indek,"vendors");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,16,r)
    return r2();
  });  
}

Backup.employee_defaults=(indek,r2)=>{//17 employee_defaults
  var sql=sqlDatabase2(indek,"employee_defaults");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,17,r)
    return r2();
  });
}

Backup.employees=(indek,r2)=>{//18 employees
  var sql=sqlDatabase2(indek,"employees");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,18,r)
    return r2();
  });
}

Backup.exchange_rates=(indek,r2)=>{//19-exchange_rates
  var sql=sqlDatabase2(indek,"exchange_rates");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,19,r)
    return r2();
  });
}

Backup.vendor_begins =(indek,r2)=>{//20-vendor_begins
  var sql=sqlDatabase2(indek,"vendor_begins");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,20,r)
    return r2();
  });
}

Backup.customers=(indek,r2)=>{//21-customers
  var sql=sqlDatabase2(indek,"customers");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,21,r)
    return r2();
  });  
}

Backup.employee_begins =(indek,r2)=>{//22-employee_begins
  var sql=sqlDatabase2(indek,"employee_begins");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,22,r)
    return r2();
  });
}

Backup.items=(indek,r2)=>{//23-items
  var sql=sqlDatabase2(indek,"items");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,23,r)
    return r2();
  });  
}

Backup.payroll_entry=(indek,r2)=>{//24-payroll_entry;
  var sql=sqlDatabase2(indek,"payroll_entry");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek, 24, r)
    return r2();
  });
}

Backup.boms=(indek,r2)=>{//25-boms
  var sql=sqlDatabase2(indek,"boms");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,25,r)
    return r2();
  });  
}

Backup.customer_begins=(indek,r2)=>{//26-customer_begins
  var sql=sqlDatabase2(indek,"customer_begins");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,26,r)
    return r2();
  });
}

Backup.item_begins =(indek,r2)=>{// 27-item_begins
  var sql=sqlDatabase2(indek,"item_begins");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,27,r)
    return r2();
  });
}

Backup.jobs=(indek,r2)=>{//28-jobs
  var sql=sqlDatabase2(indek,"jobs");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,28,r)
    return r2();
  });
}

Backup.prices=(indek,r2)=>{//29-prices
  var sql=sqlDatabase2(indek,"prices");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,29,r)
    return r2();
  });  
}

Backup.expense_tickets=(indek,r2)=>{//30-expense_tickets;
  var sql=sqlDatabase2(indek,"expense_tickets");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,30,r)
    return r2();
  });
}

Backup.job_begins =(indek,r2)=>{//31-job_begins
  var sql=sqlDatabase2(indek,"job_begins");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,31,r)
    return r2();
  });
}

Backup.purchase_orders =(indek,r2)=>{//32-purchase_orders
  var sql=sqlDatabase2(indek,"purchase_orders");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,32,r)
    return r2();
  });
}

Backup.quotes =(indek,r2)=>{//33-quotes
  var sql=sqlDatabase2(indek,"quotes");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,33,r)
    return r2();
  });
}

Backup.time_tickets=(indek,r2)=>{//34-time_tickets
  var sql=sqlDatabase2(indek,"time_tickets");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,34,r)
    return r2();
  });
}

Backup.sales_orders =(indek,r2)=>{//35-sales_orders
  var sql=sqlDatabase2(indek,"sales_orders");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_00(indek,35,r)
    return r2();
  });
}

//--start stock--[36] use send_01--//

Backup.period=(indek,r2)=>{//36 period;
  var sql=sqlDatabase2(indek,"period");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek, 36, r)
    return r2();
  });
}

Backup.receive_inventory=(indek,r2)=>{//37 receives
  var sql=sqlDatabase2(indek,"receives");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,37,r)
    return r2();
  });
}

Backup.payments=(indek,r2)=>{//38 payments
  var sql=sqlDatabase2(indek,"payments");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,38,r)
    return r2();
  });
}

Backup.adjustments=(indek,r2)=>{//39-adjustments
  var sql=sqlDatabase2(indek,"adjustments");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,39,r)
    return r2();
  });
}

Backup.builds=(indek,r2)=>{//40-builds
  var sql=sqlDatabase2(indek,"builds");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,40,r)
    return r2();
  });
}

Backup.moves=(indek,r2)=>{//41-moves
  var sql=sqlDatabase2(indek,"moves");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,41,r)
    return r2();
  });
}

Backup.unbuilds=(indek,r2)=>{//42-unbuilds
  var sql=sqlDatabase2(indek,"unbuilds");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,42,r)
    return r2();
  });
}

Backup.invoices=(indek,r2)=>{//43 invoices
  var sql=sqlDatabase2(indek,"invoices");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek, 43, r)
    return r2();
  });
}

Backup.void_payments=(indek,r2)=>{//44-void_payments
  var sql=sqlDatabase2(indek,"void_payments");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek, 44, r)
    return r2();
  });
}

Backup.vendor_credits=(indek,r2)=>{//45-vendor_credits
  var sql=sqlDatabase2(indek,"vendor_credits");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek, 45, r)
    return r2();
  });
}

Backup.void_invoices=(indek,r2)=>{//46-void_invoices
  var sql=sqlDatabase2(indek,"void_invoices");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,46,r)
    return r2();
  });
}

Backup.receipts=(indek,r2)=>{//47-receipts
  var sql=sqlDatabase2(indek,"receipts");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek, 47, r)
    return r2();
  });
}

Backup.customer_credits=(indek,r2)=>{//48-customer_credits
  var sql=sqlDatabase2(indek,"customer_credits");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_01(indek,48,r)
    return r2();
  });
}
//--end stock--at 48--//


//--start send_02;--//
Backup.account_defaults=(indek,r2)=>{//49-account_defaults
  var sql=sqlDatabase2(indek,"account_defaults");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_02(indek,49,r)
    return r2();
  });
}

Backup.budgets=(indek,r2)=>{//50-budgets
  var sql=sqlDatabase2(indek,"budgets");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_02(indek,50,r)
    return r2();
  });
}

Backup.deposits=(indek,r2)=>{// #51 deposits
  var sql=sqlDatabase2(indek,"deposits");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_02(indek,51,r)
    return r2();
  });
}

Backup.vendor_checks =(indek,r2)=>{//52-vendor_check
  var sql=sqlDatabase2(indek,"vendor_checks");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_02(indek,52,r)
    return r2();
  });
}

Backup.void_checks =(indek,r2)=>{//53-void_checks
  var sql=sqlDatabase2(indek,"void_checks");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_02(indek,53,r)
    return r2();
  });
}

Backup.reconcile=(indek,r2)=>{//54-reconcile
  var sql=sqlDatabase2(indek,"reconcile");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_02(indek,54,r)
    return r2();
  });
}

Backup.close_period=(indek,r2)=>{//55-close_period
  var sql=sqlDatabase2(indek,"close_period");
  DownloadEmpat.run2(indek,sql,(r)=>{
    Backup.send_02(indek,55,r)
    return r2();
  });
}


Backup.send_00=(indek,n,r)=>{//send_00: master
  const h=JSON.parse(r);
  dataBC.wait_00.push({
    "table_name": h.table_name,
    "fields": h.fields,
    "rows": h.rows,
    "type": h.type,
    "count": h.count,
  })
  dataBC.tables.rows.push([n,h.table_name,h.rows.length]);
  setiH('proses_info_'+indek, JSON.stringify(dataBC.tables));
}

Backup.send_01=(indek,n,r)=>{ // send_01: transaction;
  const h=JSON.parse(r);
  let tgl='';
  let d=objectMany(h.fields,h.rows);
  
  dataBC.tables.rows.push([n,h.table_name,h.rows.length]);
  setiH('proses_info_'+indek, JSON.stringify(dataBC.tables));

  for(let i=0;i<h.rows.length;i++){
    switch(h.table_name){
      // (+)
      case "period": 
        tgl=String(d[i].end_date).concat('-01');
        break;
      case "receives": 
        tgl=String(d[i].date).concat('-02');
        break;      
      case "payments":
        tgl=String(d[i].date).concat('-03');
        break;
        
      // (+/-)
      case "adjustments": 
        tgl=String(d[i].date).concat('-04');
        break;
      case "builds": 
        tgl=String(d[i].date).concat('-05');
        break;
      case "moves": 
        tgl=String(d[i].date).concat('-06');
        break;      
      case "unbuilds": 
        tgl=String(d[i].date).concat('-07');
        break;      

      // (-)
      case "invoices": 
        tgl=String(d[i].date).concat('-08');
        break;
      case "void_payments": 
        tgl=String(d[i].date).concat('-09');
        break;        
      case "vendor_credits": 
        tgl=String(d[i].date).concat('-10');
        break;        
      case "void_invoices": 
        tgl=String(d[i].date).concat('-11');
        break;
      case "receipts": 
        tgl=String(d[i].date).concat('-12');
        break;
      case "customer_credits": 
        tgl=String(d[i].date).concat('-13');
        break;

      default:
        alert('date '+h.table_name+' tdk terdaftar!!!');
    }
    
    dataBC.wait_01.push({
      "date": tgl,
      "table_name": h.table_name,
      "fields": h.fields,
      "rows": h.rows[i],
      "type": h.type
    })
//    setiH('proses_info_'+indek, JSON.stringify(dataBC.tables) + ' - '+i);
  }
}

Backup.send_02=(indek,n,r)=>{    // send_02
  const h=JSON.parse(r);
  dataBC.wait_02.push({
    "table_name": h.table_name,
    "fields": h.fields,
    "rows": h.rows,
    "type": h.type,
    "count": h.count,
  })
  dataBC.tables.rows.push([n,h.table_name,h.rows.length]);
  setiH('proses_info_'+indek, JSON.stringify(dataBC.tables));
}

Backup.paralel_00=(indek,callback)=>{
  Backup.company(indek,()=>{    // 0 
    Backup.accounts(indek,()=>{   // 1
      Backup.cost_codes(indek,()=>{  // 2
        Backup.currencies(indek,()=>{ // 3
          Backup.locations(indek,()=>{  // 4
            Backup.payMethods(indek,()=>{ // 5
              Backup.phases(indek,()=>{// 6
                Backup.shipMethods(indek,()=>{ // 7
                  Backup.taxes(indek,()=>{ // 8
                    Backup.account_begins(indek,()=>{ //9
                      Backup.customer_defaults(indek,()=>{ // 10;
                        Backup.item_defaults(indek,()=>{ // 11;  
                          Backup.journal_entry(indek,()=>{ // 12; 
                            Backup.payroll_fields(indek,()=>{ // 13; 
                              return callback();
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

Backup.paralel_01=(indek,callback)=>{
  Backup.sales_taxes(indek,()=>{ // 10; 
    Backup.vendor_defaults(indek,()=>{ // 48;
      Backup.vendors(indek,()=>{ // 9; 
        Backup.employee_defaults(indek,()=>{ // 50;
          Backup.employees(indek,()=>{ // 8; 
            Backup.exchange_rates(indek,()=>{ // 8;     
              Backup.vendor_begins(indek,()=>{ // 18; 
                Backup.customers(indek,()=>{ // 14;   
                  Backup.employee_begins(indek,()=>{ // 20; 
                    Backup.items(indek,()=>{ // 11; 
                      Backup.payroll_entry(indek,()=>{ // 38; 
                        Backup.boms(indek,()=>{ // 13;     
                          Backup.customer_begins(indek,()=>{ // 19; 
                            Backup.item_begins(indek,()=>{ // 17; 
                              Backup.jobs(indek,()=>{ // 15; 
                                return callback();
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

Backup.paralel_02=(indek,callback)=>{
  Backup.prices(indek,()=>{ // 12; 
    Backup.expense_tickets(indek,()=>{ // 44; 
      Backup.job_begins(indek,()=>{ // 21; 
        Backup.purchase_orders(indek,()=>{ // 24; 
          Backup.quotes(indek,()=>{ // 22; 
            Backup.time_tickets(indek,()=>{ // 43; 
              Backup.sales_orders(indek,()=>{ // 23;     
                return callback();
              });
            });
          });
        });
      });
    });
  });
}

Backup.serial_03=(indek,callback)=>{
  Backup.period(indek,()=>{ //36; 
    Backup.receive_inventory(indek,()=>{ //37; 
      Backup.payments(indek,()=>{ //38; 
        Backup.adjustments(indek,()=>{ //39; 
          Backup.builds(indek,()=>{ //40; 
            Backup.moves(indek,()=>{ //41; 
              Backup.unbuilds(indek,()=>{ //42; 
                Backup.invoices(indek,()=>{ //43; 
                  Backup.void_payments(indek,()=>{ //44; 
                    Backup.vendor_credits(indek,()=>{ //45; 
                      Backup.void_invoices(indek,()=>{ //46; 
                        Backup.receipts(indek,()=>{ //47; 
                          Backup.customer_credits(indek,()=>{ //48; 
                            return callback();
                          });
                        });
                      });
                    });
                  });
                });
              });
            }); 
          });
        });
      });
    });
  });
}

Backup.paralel_04=(indek,callback)=>{
  Backup.account_defaults(indek,()=>{         // 49
    Backup.budgets(indek,()=>{                // 50; 
      Backup.deposits(indek,()=>{             // 51;
        Backup.vendor_checks(indek,()=>{      // 52; 
          Backup.void_checks(indek,()=>{      // 53; 
            Backup.reconcile(indek,()=>{      // 54; 
              Backup.close_period(indek,()=>{ // 55;
                return callback();
              });
            });
          });
        });
      });
    });
  });
};


Backup.prosesSkrg=(indek)=>{
  
  dataBC={
    "tables":{},
    "wait_00":[],
    "wait_01":[],
    "wait_02":[],
  };
  
  document.getElementById('backup_now_'+indek).style.display="none";
  
  dataBC.tables={
    "info":{
      "company_id":getEV('company_id_'+indek),
      "comment":getEV('comment_'+indek),
      "date":new Date(),
    },
    "fields":["row","table_name","count"],
    "rows":[],
  };

  Backup.paralel_00(indek,()=>{
    Backup.paralel_01(indek,()=>{
      Backup.paralel_02(indek,()=>{
        Backup.serial_03(indek,()=>{// transaction serial (stock)
          Backup.paralel_04(indek,()=>{
            Backup.fileReady(indek, JSON.stringify(dataBC), "backup_data");
          });
        });
      });
    });
  });
}

Backup.fileReady=(indek, paket, file_name)=>{
  bingkai[indek].paket_data_download=paket;
  
  var html='<div style="padding:0 1rem 0 1rem;">'
    +'<h1>File Ready</h1>'
    +'<br>'
    +'Silakan klik tombol berikut untuk mengunduh file backup.<br>'
    +'<p><a href="" id="export_'+indek+'">Download</a></p>'
    +'</div>';
  setiH('file_ready_'+indek,html);
      
  // Create a blob
  var blob = new Blob([paket], { type:'application/json;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  document.getElementById('export_'+indek).href=url;
  
  const a=document.getElementById('export_'+indek)
  a.setAttribute('download', file_name+'.json');
  
//  document.getElementById('layar_'+indek).innerHtml="";
//  setiH('layar_'+indek,"");

  var i;
  var data=JSON.parse(paket).tables.rows;
  var info=JSON.parse(paket).tables.info;
  var html='<div style="padding:0.5rem;">'
    +'<ul>'
      +'<li>Company ID: '+info.company_id+'</li>'
      +'<li>Comment: '+info.comment+'</li>'
      +'<li>Date: '+info.date+'</li>'
    +'</ul>'
    
    //+'<div style="width:40%">'
    +'<hr>'
    +'<ul>'
  
  for(i=0;i<data.length;i++){
    html+='' 
      +'<li>'+data[i][0]
      +'. '+data[i][1]
      +' ('+data[i][2]+' rows)'
      +'</li>'
  }
  html+='</ul></div></div>';
  setiH('proses_info_'+indek, html);
}



// eof:944;764;
