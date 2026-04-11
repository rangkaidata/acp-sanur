/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 * edit: jul-08, 16:19, tue-2025; #63; 
 */

'use strict';

var RptAccountReconciliation={}
  
RptAccountReconciliation.table_name='rpt_account_reconciliation';
RptAccountReconciliation.title='Account Reconciliation';
RptAccountReconciliation.period=new PeriodLook(RptAccountReconciliation);

RptAccountReconciliation.show=(tiket)=>{
  tiket.modul=RptAccountReconciliation.table_name;
  tiket.menu.name=RptAccountReconciliation.title;
  tiket.rpt={
    filter:{
      period_id: "",
      from: "",
      to: "",
      account_id: "",
      account_name: "",
    },
    refresh:false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    //RptAccountReconciliation.preview(indek);
    //RptAccountReconciliation.filter(indek);
    RptAccountReconciliation.getFilter(indek,()=>{
      RptAccountReconciliation.preview(indek);
    });
  }else{
    show(baru);
  }
}

RptAccountReconciliation.getFilter=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT key,val FROM collections"
      +" WHERE key='rpt_filter'"
  },(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      bingkai[indek].rpt.filter=JSON.parse(d.val)
    }
    return callback()
  });
}

RptAccountReconciliation.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptAccountReconciliation.proses(indek);
  } else {  
    RptAccountReconciliation.display(indek);
  };
};

RptAccountReconciliation.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var account_name=bingkai[indek].rpt.filter.account_name;
  

  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
  content.html(indek,html);
  
  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      d=JSON.parse(h);
      if(d.rows.length>0){
        if(bingkai[indek].rpt.filter.from==""){
          var d=objectMany(d.fields,d.rows);
          bingkai[indek].rpt.filter.from=d[0].start_date;
          from=d[0].start_date;
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
          to=tglSekarang();
        }
      }
      return callback();
    });
  }
  
  function getA(callback){// beginning GL
    var sql="SELECT sum(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
      +" AND date<'"+from+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){// cash receipts
    var sql="SELECT sum(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND journal_type=1"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function getC(callback){// cash disbursements
    var sql="SELECT sum(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND journal_type=3"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_c=h;
      return callback();
    });
  }
  
  function getC2(callback){// payroll_entry=5
    var sql="SELECT sum(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND journal_type=5"
    DownloadEmpat.run(indek,sql,(h)=>{
//      alert(JSON.stringify(h))
      bingkai[indek].rpt.data_c2=h;
      return callback();
    });
  }
  
  function getD(callback){// journal_entry
    var sql="SELECT sum(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND journal_type=6"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_d=h;
      return callback();
    });
  }

// :::source:::
// 0=deposits
// 1=journal_entry
// 2=receipts
// 3=invoices
// 4=void_invoices
// 5=payments
// 6=void_payments
// 7=checks
// 8=void_checks
// 9=[free]
// 10=payroll_entry
// 11=void_payroll
// 0-11=reconcile (mengikuti transaksi)

//---cash
  function getE(callback){// deposit_transit (credit)
    var sql="SELECT date,reference,bank_credit,description"
      +" FROM cash"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+account_id+"'"
      +" AND hide=1"
      +" AND reconcile_date=''"
      +" AND bank_credit>0"
      +" AND source != 1" // bukan journal_entry
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_e=h;
      return callback();
    });
  }
  
  function getG(callback){// outstanding_checks (debit)s
    var sql="SELECT date,reference,bank_debit,description"
      +" FROM cash"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+account_id+"'"
      +" AND hide=1"
      +" AND reconcile_date=''"
      +" AND bank_debit>0"
      +" AND source != 1" // bukan journal_entry
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_g=h;
      return callback();
    });
  }
   
  function getH(callback){// journal_entry (debit-credit)
    var sql="SELECT date,reference,bank_debit,bank_credit,description"
      +" FROM cash"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+account_id+"'"
      +" AND hide=1"
      +" AND reconcile_date=''"
      +" AND source=1"// harus journal_entry
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_h=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var c=JSON.parse(bingkai[indek].rpt.data_c).rows;
    var c2=JSON.parse(bingkai[indek].rpt.data_c2).rows;
    var d=JSON.parse(bingkai[indek].rpt.data_d).rows;
    var e=JSON.parse(bingkai[indek].rpt.data_e).rows;
    var g=JSON.parse(bingkai[indek].rpt.data_g).rows;
    var h=JSON.parse(bingkai[indek].rpt.data_h).rows;
    
    var f=["group","n","field_name","date","reference","debit","credit","balance"];
    var i=0;
    var r=[];
    var ending_balance=0;
    
    for(i=0;i<a.length;i++){
      r.push([
        0,
        0,
        "Beginning GL Balance",
        "",
        "",
        0,
        0,
        a[i][0],
      ]);
      ending_balance+=Number(a[i][0]);
    }
    
    // receipts
    for(i=0;i<b.length;i++){
      r.push([
        0,
        1,
        "Cash Receipts",
        "",
        "",
        0,
        0,
        b[i][0],
      ]);
      ending_balance+=Number(b[i][0]);
    }
    
    // payment+check
    for(i=0;i<c.length;i++){
      if(Number(c[i][0]) != 0){
        r.push([
          0,
          2,
          "Cash Disbursements",
          "",
          "",
          0,
          0,
          c[i][0],
        ]);
      }
      ending_balance+=Number(c[i][0]);
      
    }
    
    // payroll
    for(i=0;i<c2.length;i++){
      r.push([
        0,
        2,
        "Cash Disbursements",
        "",
        "",
        0,
        0,
        c2[i][0],
      ]);
      ending_balance+=Number(c2[i][0]);
    }
    
    // other
    for(i=0;i<d.length;i++){
      r.push([
        0,
        4,
        "Other",
        "",
        "",
        0,
        0,
        d[i][0],
      ]);
      ending_balance+=Number(d[i][0]);
    }

// cash unreconcile;
    for(i=0;i<e.length;i++){// deposits
      r.push([
        1,
        6,
        e[i][3],
        e[i][0],
        e[i][1],
        0,
        e[i][2],
        Number(e[i][2])*-1,
      ]);
    }

    for(i=0;i<g.length;i++){// outstanding checks
      r.push([
        2,
        7,
        g[i][3],
        g[i][0],
        g[i][1],
        g[i][2],
        0,
        Number(g[i][2]),
      ]);
    }
    
    for(i=0;i<h.length;i++){// journal_entry
      r.push([
        3,
        8,
        h[i][4],
        h[i][0],
        h[i][1],
        h[i][2],
        h[i][3],
        Number(h[i][2])-Number(h[i][3]),
      ]);
    }

    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
//  getCompany(()=>{
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;
    
    getA(()=>{
      getB(()=>{
        getC(()=>{
        getC2(()=>{
          getD(()=>{
            getE(()=>{
              getG(()=>{
                getH(()=>{
                  getJoinArray(()=>{
                    RptAccountReconciliation.display( indek );
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
  
  bingkai[indek].rpt.refresh=true;
};

RptAccountReconciliation.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptAccountReconciliation.proses(indek); });
  toolbar.filter(indek,()=>{ RptAccountReconciliation.filter(indek); });
  toolbar.print(indek,()=>{ RptAccountReconciliation.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    150, // field_name
    90, // date
    90, // reference
    90, // debit
    90, // credit
    90, // balance
  ];
  var L=[];
  var k=5;
  
  for(i=0;i<W.length;i++){
    if(i==0) {
      L.push(k);
    }
    k+=(Number(W[i])+10);
    L.push( k );
  }

  var html=''
//    +'<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
//    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
    
//      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
//        +'<div style="width:100%;background:white;display:block;">'
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptAccountReconciliation.title )
          +s.setFromTo( filter.from, filter.to )

//          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'

            +s.setHeader(L[0], W[0], "left", 'Field Name')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Reference')
            +s.setHeader(L[3], W[3], "right", 'Debit')
            +s.setHeader(L[4], W[4], "right", 'Credit')
            +s.setHeader(L[5], W[5], "right", 'Balance')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div class="report-detail">';//e
//      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var group=-1;
      var sum_total=0;
      var total=0;
      var X=300;
      var group_id=[
        "Ending GL Balance",
        "Deposits in transit",
        "Outstanding Checks",
        "Other"
      ];

      for(i=0;i<h2.length;i++){
        if(group!=h2[i].group){
          if(i!=0){
            html+=''
              +s.setSubTotal(L[2], X, "left", group_id[group] )
              +s.setSubTotal(L[5], W[5], "right", ribuan(sum_total) )
              +'<br>'
              +s.setLabel(L[0], X, "left", '<b>'+group_id[h2[i].group]+'</b>' )
              +'<br>'
          }
          sum_total=0;
        }
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].field_name )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].reference )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].debit) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].credit) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].balance) )
        html+='<br>';
        
        group=h2[i].group;

        sum_total+=Number(h2[i].balance);
        total+=Number(h2[i].balance);
      }
      html+=''
        +s.setSubTotal(L[2], X, "left", group_id[3] )
        +s.setSubTotal(L[5], W[5], "right", ribuan(sum_total) )
        +'<br><br>'
        +s.setTotalA(L[2], 300, "left", 'Unreconciled Difference' )
        +s.setTotalA(L[5], W[5], "right", ribuan(total) )
        +'<br>';
        
      html+='</div>'
// end-detail

    html+='</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);

/*
  var cv=document.getElementById("cv_"+indek);
  var ctx=cv.getContext("2d");

  for(i=1;i<L.length;i++){
    ctx.beginPath();
    ctx.moveTo(L[i],0);
    ctx.lineTo(L[i],45);
    ctx.strokeStyle="grey";
    ctx.stroke();
  }
  
  ctx.beginPath();
  ctx.rect(0,0,L[L.length-1],25); // x,y,width,height
  ctx.strokeStyle="grey";
  ctx.stroke();
*/
  function sortByID(a,b){ // sort multidimensi;
    if( String(a.n).concat(a.date) === String(b.n).concat(b.date) ){
      return 0;
    }
    else{
      if( String(a.n).concat(a.date) < String(b.n).concat(b.date) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptAccountReconciliation.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptAccountReconciliation.preview(indek); });
  toolbar.preview(indek,()=>{ RptAccountReconciliation.filterExecute(indek); });
  RptAccountReconciliation.formFilter(indek);
};

RptAccountReconciliation.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
    
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' onclick="LookTable.period.getPaging(\''+indek+'\''
          +',\'period_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
      +'</li>'
    
      +'<li>'
        +'<label>From</label>'
        +'<input type="date" id="from_'+indek+'">'
      +'</li>'
        
      +'<li>'
        +'<label>To</label>'
        +'<input type="date" id="to_'+indek+'">'
      +'</li>'
        
      +'<li>'
        +'<label>Account ID</label>'
        +'<input type="text" id="account_id_'+indek+'"'
        +' onchange="LookTable.getAccount(\''+indek+'\')">'

        +'<button type="button" '
          +' onclick="LookTable.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,-1)"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" id="account_name_'+indek+'" disabled>'

      +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
  setEV('account_name_'+indek, bingkai[indek].rpt.filter.account_name );
};

RptAccountReconciliation.filterExecute=(indek)=>{
  var o={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.filter=o;
  bingkai[indek].rpt.refresh=false;
  RptAccountReconciliation.preview(indek);
};

RptAccountReconciliation.print=(indek)=>{};




//eof: 292;537;
