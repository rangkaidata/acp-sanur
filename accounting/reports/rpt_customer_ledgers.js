/*
 * name: budiono;
 * date: jun-11, 16:32, wed-2025; #57; payroll_fields;
 * date: dec-23, 13:20, tue-2025; #85; 
 */

'use strict';

var RptCustomerLedgers={}
  
RptCustomerLedgers.table_name='rpt_customer_ledgers';
RptCustomerLedgers.title='Customer Ledgers';
RptCustomerLedgers.period=new PeriodLook(RptCustomerLedgers);
RptCustomerLedgers.customer=new CustomerLook(RptCustomerLedgers);

RptCustomerLedgers.show=(tiket)=>{
  tiket.modul=RptCustomerLedgers.table_name;
  tiket.menu.name=RptCustomerLedgers.title;
  tiket.rpt={
    filter:{
      period_id: "",
      from: "",
      to: "",
      customer_id: "",
      customer_name: "",
    },
    "refresh":false
  };
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptCustomerLedgers.preview(indek);
  }else{
    show(baru);
  }
}

RptCustomerLedgers.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    bingkai[indek].rpt.refresh=true;
    RptCustomerLedgers.proses(indek);
  } else {  
    RptCustomerLedgers.display(indek);
  };
};

RptCustomerLedgers.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;

  function getBeginInvoiceReceipt(callback){
    var from=bingkai[indek].rpt.filter.from;
    var sql="SELECT customer_id"            // 0
      +",customer_name"                     // 1
      +",SUM(trans_amount) AS trans_amount" // 2
      +" FROM invoice_receipt"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND trans_date < '"+from+"'"
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'"
      }
      sql+=" GROUP BY customer_id,customer_name";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.begin_invoice_receipt=h;
      return callback();
    });
  }
  
  function getInvoiceReceipt(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var sql="SELECT customer_id" // 0
      +",customer_name"          // 1
      +",trans_date"             // 2
      +",trans_no"               // 3
      +",table_name"             // 4
      +",trans_amount"           // 5
      +" FROM invoice_receipt"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND trans_date between '"+from+"' AND '"+to+"'"
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.invoice_receipt=h;
      return callback();
    });
  }

  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.invoice_receipt).rows;
    var b=JSON.parse(bingkai[indek].rpt.begin_invoice_receipt).rows;
    var f=["customer_id","customer_name",
      "date","trans_no","type",
      "debit","credit","balance"
    ];
    var i=0;
    var r=[];
    var debit
    var credit;
    var balance=0;
    var trans_no;
    
    for(i=0;i<a.length;i++){
      debit=0;
      credit=0;
      balance=Number(a[i][5])
      if(Number(a[i][5])>0){
        debit=Number(a[i][5]);
      }else{
        credit=Number(a[i][5])*-1;
      }
      
      r.push([
        a[i][0], // 0-customer_id
        a[i][1], // 1-customer_name
        a[i][2], // 2-date
        a[i][3], // 3-reference
        a[i][4], // 4-table_name
        debit,   // 5-debit
        credit,  // 6-credit
        balance  // 7-balance       
      ]);
    }
    
    for(i=0;i<b.length;i++){
      debit=0;
      credit=0;
      balance=Number(b[i][2]);
      
      if(Number(b[i][2])>0){
        debit=Number(b[i][2]);
      }else{
        credit=Number(b[i][2])*-1;
      }
      
      r.push([
        b[i][0],   // 0-customer_id
        b[i][1],   // 1-customer_name
        "",        // 2-date
        "Beg_bal", // 3-reference
        "",        // 4-table_name
        debit,     // 5-debit
        credit,    // 6-credit
        balance    // 7-balance       
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;
    
    getBeginInvoiceReceipt(()=>{
      getInvoiceReceipt(()=>{
        getJoinArray(()=>{
          RptCustomerLedgers.display( indek );
        });
      });
    });
  });
};

RptCustomerLedgers.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCustomerLedgers.proses(indek); });
  toolbar.filter(indek,()=>{ RptCustomerLedgers.filter(indek); });
  toolbar.print(indek,()=>{ RptCustomerLedgers.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-customer_id
    85, // 1-date
    90, // 2-trans_no
    55, // 3-type
    90, // 4-debit
    90, // 5-credit
    90, // 6-balance
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
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d        

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptCustomerLedgers.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'

          +s.setHeader(L[0], W[0], "left", 'Customer ID')
          +s.setHeader(L[1], W[1], "left", 'Date')
          +s.setHeader(L[2], W[2], "left", 'Trans No.')
          +s.setHeader(L[3], W[3], "left", 'Type')
          +s.setHeader(L[4], W[4], "left", 'Debit Amt')
          +s.setHeader(L[5], W[5], "left", 'Credit Amt')
          +s.setHeader(L[6], W[6], "left", 'Balance')
          +'<br>'
          
        +'</div>'//d 
      +'</div>'//c
      
//--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var balance=0;
      var customer_id;
      var X=300;
      var dbt=0,crt=0,blc=0;

      for(i=0;i<h2.length;i++){
        if(customer_id!=h2[i].customer_id){
          if(i>0){
            html+='<br>'
          }
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].customer_name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
          balance=0;
        };
        
        balance+=h2[i].balance;
        html+=''
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].trans_no )
          +s.setLabel(L[3], W[3], "left", type(h2[i].type) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].debit) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].credit) )
          +s.setLabel(L[6], W[6], "right", ribuan(balance) )
          
        html+='<br>';
        
        
        customer_id=h2[i].customer_id;
        dbt+=h2[i].debit;
        crt+=h2[i].credit;
        blc+=h2[i].balance;
        
      }
      html+=''
        +s.setTotalA(L[4], W[4], "right", ribuan(dbt) )
        +s.setTotalA(L[5], W[5], "right", ribuan(crt) )
        +s.setTotalA(L[6], W[6], "right", ribuan(blc) )
        +'<br>';
        
      html+='</div>'
// end-detail

    html+='</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek, L);

  function sortByID(a,b){ // sort multidimensi;
    if( a.customer_id === b.customer_id ){
      return 0;
    }
    else{
      if( a.customer_id < b.customer_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
  
  function type(a){
    var a2=a;
    switch(a){
      case "invoices": a2="INVOI"; break;
      case "customer_begins": a2="BEGIN"; break;
      case "receipts": a2="RECEI"; break;
      case "customer_credits": a2="CMEMO"; break;
      case "converts": a2="CCONV"; break;
      case "void_invoices": a2="CVOID"; break;
    }
    return a2;
  }
};

RptCustomerLedgers.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCustomerLedgers.preview(indek); });
  toolbar.preview(indek,()=>{ RptCustomerLedgers.filterExecute(indek); });
  RptCustomerLedgers.formFilter(indek);
};

RptCustomerLedgers.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'    
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" '
          +' id="period_id_'+indek+'" '
          +' size="17">'
        +'<button type="button" '
          +' id="btn_period_'+indek+'" '
          +' onclick="RptCheckRegister.period.getPaging(\''+indek+'\''
          +',\'period_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
      +'</li>'
      +'<li>'
        +'<label>From</label>'
        +'<input type="date" '
          +' id="from_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>To</label>'
        +'<input type="date" '
          +' id="to_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Customer ID</label>'
        +'<input type="text" '
          +' id="customer_id_'+indek+'" '
          +' onchange="RptCustomerLedgers.getCustomer(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_customer_'+indek+'" '
          +' onclick="RptCustomerLedgers.customer.getPaging(\''+indek+'\''
          +',\'customer_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
      +'</li>'
      +'<li>'
        +'<label>Customer Name</label>'
        +'<input type="text" '
        +' id="customer_name_'+indek+'" disabled>'
      +'</li>'
    +'</ul>'
    +'</div>';
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('customer_id_'+indek, bingkai[indek].rpt.filter.customer_id ); 
  setEV('customer_name_'+indek, bingkai[indek].rpt.filter.customer_name ); 
};

RptCustomerLedgers.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCustomerLedgers.getPeriod(indek);
};

RptCustomerLedgers.getPeriod=(indek)=>{
  RptCustomerLedgers.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptCustomerLedgers.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCustomerLedgers.preview(indek);
};

RptCustomerLedgers.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptCustomerLedgers.getCustomer(indek);
};

RptCustomerLedgers.getCustomer=(indek)=>{
  message.none(indek);
  RptCustomerLedgers.customer.getOne(indek,
    getEV('customer_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_name_'+indek, d.name);
    }else{
      setEV('customer_name_'+indek, '');
    }
  });
}

RptCustomerLedgers.print=(indek)=>{};



//eof: 291;442;393;
