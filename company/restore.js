/*
 * name: budiono;
 * date: feb-28, 08:49, wed-2024; new;
 * edit: apr-26, 16:16, sat-2025; #51; backup-restore;
 * edit: apr-27, 16:53, sun-2025; #51; restore button;
 * edit: apr-29, 15:17, tue-2025; #51; finishing restore;
 */
 
'use strict';

var Restore={}

Restore.form=new ActionForm2(Restore);
Restore.hideNew=true;

Restore.show=(tiket)=>{
  tiket.modul='restore';
  tiket.menu.name="Restore Company";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Restore.view(indek);
  }else{
    show(baru);
  }  
}

Restore.view=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  
  Restore.uploadJSON(indek);
}

Restore.uploadJSON=(indek)=>{
  var html='<div style="padding:0 1rem 0 1rem">'
    +content.title(indek)
    +'<p id="exportTable" style="display:none"></p>'
    +Restore.selectFileJSON(indek)
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

Restore.selectFileJSON=(indek)=>{
  var html=''
    +'<div id="hasil_'+indek+'" style="margin-top:10px;">'
      +'<h2>Step 1: Select Backup Company File</h2>'
      +'<p>Select File: '
      +'<input type="file" '
      +' onchange="Restore.readFileJSON(this,'+indek+')"'
      +' accept=".json">'
      +'</p>'
    +'</div>';
  return html;
}

Restore.readFileJSON=(input,indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Restore.view(indek);});
  toolbar.next(indek,()=>{Restore.tahap_3(indek);});
  
  const file=input.files[0];
  const reader=new FileReader();
  
  // alert(file.name);
  bingkai[indek].file_name=file.name;

  reader.readAsText(file);
  reader.onload = function() {
    bingkai[indek].data_backup=JSON.parse(reader.result);
    Restore.setData(indek)
  };

  reader.onerror = function() {
    console.log(reader.error);
  };      
}

Restore.setData=(indek)=>{
  var data_import=bingkai[indek].data_backup;
  var data=[];
  var arr={};
  var html;
  var tabel='';
  
  // restore data
  var d=(data_import.tables);
  var d2=data_import;
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
  
  for(var i=0;i<d.rows.length;i++){
    tabel+='<tr>'
    for(j=0;j<jml;j++){
      tabel+='<td>'+tHTML(d.rows[i][j])+'</td>';
    }
    tabel+='</tr>'
  }
  tabel+="</table>"
  
  html='<h2>Step 2: Read Backup File</h2>'
    +'<p>Click [<strong>Next</strong>] button to continue Restore Data.</p>'
    +'<div style="padding:5px;border:solid 1px grey;border-radius:10px;">'
      +'<p>File Name:&nbsp;<span class="quote_text">'+bingkai[indek].file_name+'</span></p>'
      +'<p>Company ID:&nbsp;<span class="quote_text">'+d2.wait_00[0].rows[0][0]+'</span></p>'
      +'<p>Company Name:&nbsp;<span class="quote_text">'+d2.wait_00[0].rows[0][1]+'</span></p>'
      +'<p>Fiscal Date:&nbsp;<span class="quote_text">'+d2.wait_00[0].rows[0][9]+'</span></p>'
      +'<p>Tables:&nbsp;<span class="quote_text">'+d.rows.length+'</span>'
      +'<p><div id="accounts_'+indek+'"></div><p>'
    +'</div>'
    +'<div style="overflow-y:auto;">'+'<pre>'+tabel+'</pre>'
    +'<p>Comment:&nbsp;<span class="quote_text">'+d.info.comment+'</span></p>'
    +'<p>Date Backup:&nbsp;<span class="quote_text">'+d.info.date+'</span></p>'
    +'</div>'
  document.getElementById('hasil_'+indek).innerHTML=html;
}

Restore.tahap_3=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Restore.view(indek);});
  toolbar.next(indek,()=>{Restore.tahap_4(indek);});

  var html='<h2>Step 3: New Company ID</h2>'
    +content.message(indek)
    +'<div style="padding:5px;border:solid 1px grey;border-radius:10px;margin-bottom:10px;">'
      +'<p>Enter New Company ID then click [<b>Next</b>] to start process.</p>'
      +'<p>New Company ID: <input type="text" id="company_id_'+indek+'" ></p>'
      +'<p id="msgImport_'+indek+'"></p>'
    +'</div>'
  document.getElementById('hasil_'+indek).innerHTML=html;
  document.getElementById('company_id_'+indek).focus();
}

Restore.viewProses=(indek)=>{
  var data_import=bingkai[indek].data_backup;
  var data=[];
  var arr={};
  var tabel='';
  
  // restore data
  var d=(data_import.tables);
  var d2=data_import;
  var jml=d.fields.length;
  var j;
  
  tabel="<table>"
    +'<tr>'
      +'<th>Row</th>'
      +'<th>Table Name</th>'
      +'<th>Status</th>'
    +'<tr>';

  if(jml==0){
    jml=d.data.length;
    if(jml>0){
      jml=d.data[0].length;
    }
  }
  
  for(var i=0;i<d.rows.length;i++){//kolom
    tabel+='<tr>'
      tabel+='<td>'+d.rows[i][0]+'</td>'
        +'<td>'+d.rows[i][1]+'</td>'
        +'<td>'
          +'<span id="'+d.rows[i][1]+'_'+indek+'">'+d.rows[i][2]
          +'</span>'
        +'</td>'
    tabel+='<tr>';
  }
  tabel+="</table>";
  
  var html='<h2>Step 4: Start Restore File</h2>'
    +content.message(indek)
    +'<div id="abc_'+indek+'"></div>'
    +'<div id="result_'+indek+'" style="overflow-y:auto;">'
    +'<pre>'+tabel+'</pre></div>'
    +'<div id="log_'+indek+'" style="overflow-y:auto;">'
  document.getElementById('hasil_'+indek).innerHTML=html;
}

var tableRes={// isi wait_00
  "company": 0,
  "accounts": 1,
  "cost_codes": 2,
  "currencies": 3,
  "locations": 4,
  "pay_methods": 5,
  "phases": 6,
  "ship_methods": 7,
  "taxes": 8,

  "account_begins":9,
  "customer_defaults":10,
  "item_defaults":11,
  "journal_entry":12, 
  "payroll_fields":13,
  "sales_taxes": 14,
  "vendor_defaults":15,
  "vendors":16,
  "employee_defaults":17,
  "employees":18,
  "exchange_rates":19,
  "vendor_begins":20,
  "customers":21,
  "employee_begins":22,
  "items":23,
  "payroll_entry":24,
  "boms":25,
  "customer_begins":26,
  "item_begins":27,
  "jobs":28,
  "prices":29,
  "expense_tickets":30,
  "job_begins":31,
  "purchase_orders":32,
  "quotes":33,
  "time_tickets":34,
  "sales_orders":35,
}

var table_wait_01={
  "void_invoices":26,
  "customer_credits":27,
  "receive_inventory":28,
  "payments":29,
  "builds":30,
  "unbuilds":31,
  "moves":32,
  "adjustments": 33,
  "invoices":34,
  "receipts":35,
  "void_payments":36,
  "vendor_credits":37,  
  "period":39,  
}

var tableRes2={// isi wait_02
  "account_defaults":0,
  "budgets":1,
  "deposits":2,
  "vendor_checks":3,
  "void_checks":4,
  "reconcile":5,
  "close_period":6,
}

var tableList=[// untuk creat folder;
  "company",
  "accounts",
  "cost_codes",
  "currencies",
  "locations",
  "pay_methods",
  "phases",
  "ship_methods",
  "taxes",
  
  "account_begins",
  "customer_defaults",
  "item_defaults",
  "journal_entry",
  "payroll_fields",
  "sales_taxes",
  "vendor_defaults",
  "vendors",
  
  "employee_defaults",
  "employees",
  "exchange_rates",
  "vendor_begins",
  
  "customers",
  "employee_begins",
  "items",
  "payroll_entry",
  
  "boms",
  "customer_begins",
  "item_begins",
  "jobs",
  "prices",
  
  "expense_tickets",
  "job_begins",
  "purchase_orders",
  "quotes",
  "time_tickets",
  
  
  "sales_orders",
  "period",
  "receives",
  "payments",
  "adjustments",
  "builds",
  "moves",
  "unbuilds",
  
  "invoices",
  "void_payments",
  
  "vendor_credits",
  "void_invoices",
  "receipts",
  "customer_credits",
  
  "account_defaults",
  "budgets",
  "deposits",
  "vendor_checks",
  "void_checks",
  "reconcile",
  "close_period"
];

Restore.createFolder=(indek,callback)=>{  
  var lst=tableList;
  var j=lst.length;
  var n=0;
  let modul_id=''
  
  function start_create_folder(indek, i2) {
    getPath(indek, tableList[i2], (h)=>{
      mkdir(indek,h.folder,(h)=>{
        setiH('abc_'+indek, 'Create folder: '+tableList[i2]);
        setiH(tableList[i2]+'_'+indek, 'folder OK.');// message
                
        i2++;
        if(i2<j){
          start_create_folder(indek, i2)// next table;
        }else{
          return callback();// finish;
        }
      })
    });
  }
  start_create_folder(indek, 0);
}

Restore.proses_01=(indek,company_id,callback)=>{ // level 1
  Restore.wait_00(indek,company_id, tableRes.company, ()=>{ // 0
    return callback();
  });
}

Restore.proses_02=(indek,company_id,callback)=>{ // level 2
  Restore.wait_00(indek,company_id, tableRes.accounts, ()=>{ // 1
    Restore.wait_00(indek,company_id, tableRes.cost_codes, ()=>{ // 2
      Restore.wait_00(indek,company_id, tableRes.currencies, ()=>{ // 3
        Restore.wait_00(indek,company_id, tableRes.locations, ()=>{ // 4
          Restore.wait_00(indek,company_id, tableRes.pay_methods, ()=>{ // 5
            Restore.wait_00(indek,company_id, tableRes.phases, ()=>{ // 6
              Restore.wait_00(indek,company_id, tableRes.ship_methods, ()=>{ // 7
                Restore.wait_00(indek,company_id, tableRes.taxes, ()=>{ // 8
                  return callback();
                });
              });
            });
          });
        });
      });
    });
  });
}
    
Restore.proses_03=(indek,company_id,callback)=>{ // level 3
  Restore.wait_00(indek,company_id, tableRes.account_begins, ()=>{ //16  
    Restore.wait_00(indek,company_id, tableRes.customer_defaults, ()=>{ // 47
      Restore.wait_00(indek,company_id, tableRes.item_defaults, ()=>{ // 49
        Restore.wait_00(indek,company_id, tableRes.journal_entry, ()=>{ //25
          Restore.wait_00(indek,company_id, tableRes.payroll_fields, ()=>{ //25  
            Restore.wait_00(indek,company_id, tableRes.sales_taxes, ()=>{ //25  
              Restore.wait_00(indek,company_id, tableRes.vendor_defaults, ()=>{ //25  
                Restore.wait_00(indek,company_id, tableRes.vendors, ()=>{ //25  
                  return callback();
                });
              });
            });
          });
        });
      });
    });
  });
}

Restore.proses_04=(indek,company_id,callback)=>{// level 4
  Restore.wait_00(indek,company_id, tableRes.employee_defaults, ()=>{ // 17
    Restore.wait_00(indek,company_id, tableRes.employees, ()=>{ // 18
      Restore.wait_00(indek,company_id, tableRes.exchange_rates, ()=>{ // 19
        Restore.wait_00(indek,company_id, tableRes.vendor_begins, ()=>{ // 20
          return callback();
        });
      });  
    });
  });
}

Restore.proses_05=(indek,company_id,callback)=>{// level 5
  Restore.wait_00(indek,company_id, tableRes.customers, ()=>{ // 21
    Restore.wait_00(indek,company_id, tableRes.employee_begins, ()=>{ // 22
      Restore.wait_00(indek,company_id, tableRes.items, ()=>{ // 23
        Restore.wait_00(indek,company_id, tableRes.payroll_entry, ()=>{ // 24
          return callback();
        });
      });
    });
  });
}

Restore.proses_06=(indek,company_id,callback)=>{// level 6
  Restore.wait_00(indek,company_id, tableRes.boms, ()=>{ // 25
    Restore.wait_00(indek,company_id, tableRes.customer_begins, ()=>{ // 26
      Restore.wait_00(indek,company_id, tableRes.item_begins, ()=>{ // 27
        Restore.wait_00(indek,company_id, tableRes.jobs, ()=>{ // 28
          Restore.wait_00(indek,company_id, tableRes.prices, ()=>{ // 29
            return callback();
          });
        });
      });
    });
  });
}

Restore.proses_07=(indek,company_id,callback)=>{// level 7
  Restore.wait_00(indek,company_id, tableRes.expense_tickets, ()=>{ // 30
    Restore.wait_00(indek,company_id, tableRes.job_begins, ()=>{ // 31
      Restore.wait_00(indek,company_id, tableRes.purchase_orders, ()=>{ // 32
        Restore.wait_00(indek,company_id, tableRes.quotes, ()=>{ // 33
          Restore.wait_00(indek,company_id, tableRes.time_tickets, ()=>{ // 34
            return callback();
          });
        });
      });
    });
  });
}

Restore.proses_08=(indek,company_id,callback)=>{// level 8
  Restore.wait_00(indek,company_id, tableRes.sales_orders, ()=>{ // 35
    return callback();
  });
}

Restore.proses_09=(indek,company_id,callback)=>{// level 9 s/d level 15
  // serialized... nomer: 36 s/d nomer: 48
  Restore.transfer_serialized(indek,company_id, ()=>{
    return callback();
  });
}

Restore.proses_16=(indek,company_id,callback)=>{// level 16 s/d level 20;
  Restore.wait_02(indek,company_id, tableRes2.account_defaults, ()=>{ // 49
    Restore.wait_02(indek,company_id, tableRes2.budgets, ()=>{ // 50
      Restore.wait_02(indek,company_id, tableRes2.deposits, ()=>{ // 51
        Restore.wait_02(indek,company_id, tableRes2.vendor_checks, ()=>{ // 52
          Restore.wait_02(indek,company_id, tableRes2.void_checks, ()=>{ // 53
            Restore.wait_02(indek,company_id, tableRes2.reconcile, ()=>{ // 54
              Restore.wait_02(indek,company_id, tableRes2.close_period, ()=>{ // 55
                return callback();
              });
            });
          });
        });
      });
    });
  });
}

Restore.transfer_serialized=(indek,company_id,callback)=>{
  let d=bingkai[indek].data_backup;
  let d1=d.wait_01;
  let c=d1.length; // total all rows;
  let t="";// table
  let f=[];// field
  let r=[];//rows
  let l=0;// loops;
  let a=[];// new array;
  let tgl=""; // date_sort ;
  let q=""; // query;
  let w_log="";
  
  bingkai[indek].total_baris+=c;
  
  if(c==0){// kosong tdk ada baris;
    // setiH(t+'_'+indek, 'complete 0 rows');
    return callback();
  }

  for(var k=0;k<c;k++){

    t=d1[k].table_name;
    f=d1[k].fields;
    r=d1[k].rows;
    tgl=d1[k].date;
    
    for (let i=0;i<r.length;i++){
      q="INSERT INTO "+t
      q+="("
      
      for(let m=0;m<f.length;m++){
        if(m<f.length-1){
          q+=f[m]+",";
        }else{
          q+=f[m];
        }
      }
      
      q+=") VALUES ("
      
      for(let j=0;j<r.length;j++){
        if(j<r.length-1){
          if(j==0){
            q+="'"+company_id+"',";
          }else{
            q+="'"+r[j]+"',";
          }
        }else{
          q+="'"+r[j]+"'";
        }
      }    
      q+=")"
    };
    a.push( [tgl,q,t] );
  };

  // sort dulu berdasarkan tanggal, kemudian di execute;
  a.sort(sortByDate);

  l=0;
  
  prosess(0,()=>{
    return callback();
  });
  
  function prosess(i2,callback2){
    setiH('abc_'+indek, a[i2][0]+', INSERT INTO '+a[i2][2]+'.. '+(i2+1)+' of '+c+' wait...');
    db.run(indek,{
      query: a[i2][1]// array sql;
    },(p)=>{
      if(p.err.id==0){
        setiH('abc_'+indek, a[i2][0]+', INSERT INTO '+a[i2][2]+'.. '+(i2+1)+' of '+c+'.');
        setiH(a[i2][2]+'_'+indek, i2+' of ');

        i2++;
        if(i2<c){// iterasi
          setiH(t+'_'+indek, 'complete '+r.length +' rows');
          prosess(i2,callback2);// next rows;
        }else{// selesai iterasi
          return callback2();
        }
      }else{
        // stop
        content.infoPaket(indek,p);
      }
    });
  }
  
  function sortByDate(a,b){ // sort multidimensi column ke-0;
    if(a[0] === b[0]){
      return 0;
    }
    else{
      if(a[0] < b[0]) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

Restore.wait_00=(indek,company_id,n,callback)=>{
  let d=bingkai[indek].data_backup;
  let c=d.length;
  let t=d.wait_00[n].table_name;
  let f=d.wait_00[n].fields;
  let r=d.wait_00[n].rows;
  let q="";
  let l=0;
  let s=[];
  
  bingkai[indek].total_baris+=r.length;
  
  if(r.length==0){// kosong tdk ada baris;
    setiH(t+'_'+indek, 'complete 0 rows');
    return callback();
  }

  for (var i=0;i<r.length;i++){
    q="INSERT INTO "+t
    q+="("
    for(let i=0;i<f.length;i++){
      if(i<f.length-1){
        q+=f[i]+",";
      }else{
        q+=f[i];
      }
    }
    q+=") VALUES ("
    for(let j=0;j<r[i].length;j++){
      if(j<r[i].length-1){
        if(j==0){
          q+="'"+company_id+"',";
        }else{
          q+="'"+r[i][j]+"',";
        }
      }else{
        q+="'"+r[i][j]+"'";
      }
    }    
    q+=")"
    s.push(q);
  }
  
  l=0;
  for( var i2=0;i2<s.length;i2++){
    db.run(indek,{
      query: s[i2]
    },(p)=>{
      if(p.err.id==0){
        setiH('abc_'+indek, 'INSERT INTO '+t+'...'+(l+1)+' of '+r.length );
        setiH(t+'_'+indek, (l+1)+' of '+r.length );
        l++;
        if(l==s.length){
          setiH(t+'_'+indek, 'complete '+r.length +' rows');
          return callback();
        }
      }else{
        // stop
        content.infoPaket(indek,p);
      }
    });
  };
}

Restore.wait_02=(indek,company_id,n,callback)=>{
  let d=bingkai[indek].data_backup;
  let c=d.length;
  let t=d.wait_02[n].table_name;
  let f=d.wait_02[n].fields;
  let r=d.wait_02[n].rows;
  let q="";
  let l=0;
  let s=[];
  
  bingkai[indek].total_baris+=r.length;
  
  if(r.length==0){// kosong tdk ada baris;
    setiH(t+'_'+indek, 'complete 0 rows');
    return callback();
  }
  
  console.log(f);

  for (var i=0;i<r.length;i++){
    q="INSERT INTO "+t
    q+="(";
    for(let m=0;m<f.length;m++){
      if(m<f.length-1){
        q+=f[m]+",";
      }else{
        q+=f[m];
      }
    }
    q+=") VALUES ("
    for(let j=0;j<r[i].length;j++){
      if(j<r[i].length-1){
        if(j==0){
          q+="'"+company_id+"',";
        }else{
          q+="'"+r[i][j]+"',";
        }
      }else{
        q+="'"+r[i][j]+"'";
      }
    }    
    q+=")"
    s.push(q);
  }
  
  l=0;
  for( var i2=0;i2<s.length;i2++){
    db.run(indek,{
      query: s[i2]
    },(p)=>{
      if(p.err.id==0){
        setiH('abc_'+indek, 'INSERT INTO '+t+'...'+(l+1)+' of '+r.length );
        setiH(t+'_'+indek, (l+1)+' of '+r.length );
        l++;
        if(l==s.length){
          setiH(t+'_'+indek, 'complete '+r.length +' rows');
          setiH('abc_'+indek,"");
          return callback();
        }
      }else{
        // stop
        content.infoPaket(indek,p);
      }
    });
  };
}

Restore.tahap_4=(indek)=>{
  let company_id=getEV('company_id_'+indek);
  if(company_id=='') {
    pesanSalah2(indek,3,['company_id'],[]);
    return ;
  }else{
    db.run(indek,{
      query:"SELECT company_id"
        +" FROM company"
        +" WHERE company_id='"+company_id+"'"
    },(p)=>{
      if(p.count>0){// already exists;
        pesanSalah2(
          indek,
          4,
          ['company_id'],
          [company_id]
        );
        return;
      }else{
        okeLanjut();
      }
    });
  }
  
  function okeLanjut(){
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{Restore.tahap_3(indek);});

    bingkai[indek].total_baris=0;
    
    Restore.viewProses(indek);

    Restore.createFolder(indek,()=>{   
      Restore.proses_01(indek,company_id,()=>{
        Restore.proses_02(indek,company_id,()=>{
          Restore.proses_03(indek,company_id,()=>{
            Restore.proses_04(indek,company_id,()=>{
              Restore.proses_05(indek,company_id,()=>{
                Restore.proses_06(indek,company_id,()=>{
                  Restore.proses_07(indek,company_id,()=>{
                    Restore.proses_08(indek,company_id,()=>{
                      Restore.proses_09(indek,company_id,()=>{ //serialized
                        Restore.proses_16(indek,company_id,()=>{
                          Restore.endofProses(indek);
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
}

Restore.endofProses=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  
  let total_baris=bingkai[indek].total_baris;
  pesanOK(indek,'restore',['rows'],[total_baris+' rows']);
}


//eof: 384;474;744;
