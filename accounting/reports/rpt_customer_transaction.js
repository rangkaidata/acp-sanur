/*
 * name: budiono;
 * date: may-23, 20:19, fri-2025; #55; 
 * edit: dec-24, 10:31, wed-2025; #85; report-std;
 */

'use strict';

var RptCustomerTransaction={}
  
RptCustomerTransaction.table_name='rpt_customer_transaction';
RptCustomerTransaction.title='Customer Transaction History';
RptCustomerTransaction.period=new PeriodLook(RptCustomerTransaction);
RptCustomerTransaction.customer=new CustomerLook(RptCustomerTransaction);

RptCustomerTransaction.show=(tiket)=>{
  tiket.modul=RptCustomerTransaction.table_name;
  tiket.menu.name=RptCustomerTransaction.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "customer_id": "",
      "customer_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptCustomerTransaction.preview(indek);
  }else{
    show(baru);
  }
}

RptCustomerTransaction.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCustomerTransaction.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptCustomerTransaction.display(indek);
  };
};

RptCustomerTransaction.proses=(indek)=>{

  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;
  
  function getInvoices(callback){
    var sql="SELECT customer_id"
      +",customer_name"
      +",invoice_no"
      +",date"
      +",total"
      +" FROM invoices"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.invoices=h;
      return callback();
    });
  }
  
  function getReceipts(callback){
    var from=bingkai[indek].rpt.filter.from;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT customer_id" // col-0
      +",name"                   // col-1
      +",receipt_no"             // col-2
      +",date"                   // col-3
      +",invoice_detail"         // col-4     
      +" FROM receipts"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date >= '"+from+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receipts=h;
      return callback();
    });
  }
  
  function getCustomerCredits( callback ){
    var from=bingkai[indek].rpt.filter.from;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT customer_id" // col-0
      +",customer_name"          // col-1
      +",invoice_no"             // col-2
      +",credit_no"              // col-3
      +",date"                   // col-4
      +",total"                  // col-5
      +" FROM customer_credits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date >= '"+from+"'"
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.customer_credits=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.invoices).rows;
    var b=JSON.parse(bingkai[indek].rpt.receipts).rows;
    var c=JSON.parse(bingkai[indek].rpt.customer_credits).rows;
    var f=[
      "customer_id",
      "name",
      "invoice_no",
      "date",
      "amount",
      "table_name",
      "trans_no"
    ];
    var i=0,j=0,k=0;
    var r=[];
    
    // invoices
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //col-0: customer_id
        a[i][1], //col-1: name
        a[i][2], //col-2: invoice_no
        a[i][3], //col-3: date
        a[i][4], //col-4: amount
        "Invoice", //col-5: table_name
        a[i][2],    //col-6: trans_no
      ]);
    }
    
    // receipts
    var d;
    for(i=0;i<a.length;i++){
      for(j=0;j<b.length;j++){
        if(a[i][0]==b[j][0]){ // customer_id
          d=JSON.parse( b[j][4] );
          for(k=0;k<d.length;k++){
            if(a[i][2]==d[k].invoice_no){ // invoice_no
              r.push([
                a[i][0],   // col-0: customer_id
                a[i][1],   // col-1: name
                a[i][2],   // col-2: invoice_no
                b[j][3],   // col-3: receipt_date
                (d[k].amount_paid+d[k].discount)*-1, // col-4: amount
                "Receipt", // col-5: table_name
                b[j][2]    // col-6: receipt_no
              ]);
            }
          }
        }
      }
    }
    
    // customer_credits
    for(i=0;i<a.length;i++){
      for(j=0;j<c.length;j++){
        if(a[i][0]==c[j][0]){ // customer_id
//          alert(a[i][2]+' vs '+c[j][2]);
          if(a[i][2]==c[j][2]){ // invoice_no
            r.push([
              a[i][0],        // col-0: customer_id
              a[i][1],        // col-1: name
              a[i][2],        // col-2: invoice_no
              c[j][4],        // col-3: credit_date
              (c[j][5])*-1,   // col-4: amount
              "Credit Memos", // col-5: table_name
              c[j][3]         // col-6: credit_no
            ]);
          }
        }
      }
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
    getInvoices(()=>{
      getReceipts(()=>{
        getCustomerCredits(()=>{
          getJoinArray(()=>{
            RptCustomerTransaction.display( indek );
          });
        });
      });
    });
  });
};

RptCustomerTransaction.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCustomerTransaction.proses(indek); });
  toolbar.filter(indek,()=>{ RptCustomerTransaction.filter(indek); });
  toolbar.print(indek,()=>{ RptCustomerTransaction.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    100,  // customer_id
    100, // invoice_no
    100, // table_name
    100,  // trans_no
    85,  // date
    120, // amount
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
          +s.setTitle( RptCustomerTransaction.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Customer ID')
          +s.setHeader(L[1], W[1], "left", 'Invoice No.')
          +s.setHeader(L[2], W[2], "left", 'Table Name')
          +s.setHeader(L[3], W[3], "left", 'Trans No.')
          +s.setHeader(L[4], W[4], "left", 'Date')
          +s.setHeader(L[5], W[5], "right", 'Amount')          
          +'<br>'

        +'</div>'//d
      +'</div>'//c
      
//--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var customer_id="";
      var invoice_no="";
      var sub_total=0;
      var sub_total_b=0;
      var total=0;
      var X=200;

      for(i=0;i<h2.length;i++){
        if(i==0){
          customer_id=h2[i].customer_id;
          invoice_no=h2[i].invoice_no;
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
        }
        if(customer_id!=h2[i].customer_id){
          html+=''
            +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total_b) )
            +'<br>'
            +s.setLabel(L[3], X, "left", '<b>Subtotal [ '+customer_id+' ]</b>' )
            +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total) )
            +'<br><br>'
            +s.setLabel(L[0], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
            
          sub_total=0;
          sub_total_b=0;
        }else{
          if(invoice_no!=h2[i].invoice_no){
            html+=''
//              +'<br>'
              +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total_b) )
              +'<br>'
            sub_total_b=0;
          }
        }
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].invoice_no )
          +s.setLabel(L[2], W[2], "left", h2[i].table_name )
          +s.setLabel(L[3], W[3], "left", h2[i].trans_no )
          +s.setLabel(L[4], W[4], "left", tglWest(h2[i].date) )
          +s.setLabel(L[5], W[5], "right", ribuan0(h2[i].amount) )
          
        html+='<br>';
        
        customer_id=h2[i].customer_id;
        invoice_no=h2[i].invoice_no;
        sub_total+=Number(h2[i].amount);
        sub_total_b+=Number(h2[i].amount);
        total+=Number(h2[i].amount);
      }
      html+=''
        +s.setLabel(L[3], X, "left", '<b>Subtotal [ '+customer_id+' ]</b>' )
        +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total) )
        +'<br>'
        +s.setLabel(L[3], X, "left", '<b>Report Total</b>' )
        +s.setTotalA(L[5], W[5], "right", ribuan0(total) )
        +'<br>'
        
      html+='</div>'
// end-detail

    html+='</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( (a.customer_id).concat(a.invoice_no,a.date) === 
      (b.customer_id).concat(b.invoice_no,b.date) ){
      return 0;
    }
    else{
      if( (a.customer_id).concat(a.invoice_no,a.date) < 
        (b.customer_id).concat(b.invoice_no,b.date) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptCustomerTransaction.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCustomerTransaction.preview(indek); });
  toolbar.preview(indek,()=>{ RptCustomerTransaction.filterExecute(indek); });
  RptCustomerTransaction.formFilter(indek);
};

RptCustomerTransaction.formFilter=(indek)=>{
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
          +' onchange="RptCustomerTransaction.getCustomer(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_customer_'+indek+'" '
          +' onclick="RptCustomerTransaction.customer.getPaging(\''+indek+'\''
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
  +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('customer_id_'+indek, bingkai[indek].rpt.filter.customer_id ); 
  setEV('customer_name_'+indek, bingkai[indek].rpt.filter.customer_name ); 
};

RptCustomerTransaction.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCustomerTransaction.getPeriod(indek);
};

RptCustomerTransaction.getPeriod=(indek)=>{
  RptCustomerTransaction.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptCustomerTransaction.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCustomerTransaction.preview(indek);
};

RptCustomerTransaction.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptCustomerTransaction.getCustomer(indek);
};

RptCustomerTransaction.getCustomer=(indek)=>{
  message.none(indek);
  RptCustomerTransaction.customer.getOne(indek,
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


RptCustomerTransaction.print=(indek)=>{};


// eof: 286;454;474;
