/*
 * name: budiono;
 * date: may-24, 10:41, sat-2025; #55; 
 * edit: dec-21, 11:09, wed-2025; #85; report-std;
 */

'use strict';

var RptInvoiceRegister={}
  
RptInvoiceRegister.table_name='rpt_invoice_registre';
RptInvoiceRegister.title='Invoice Register';
RptInvoiceRegister.period=new PeriodLook(RptInvoiceRegister);
RptInvoiceRegister.customer=new CustomerLook(RptInvoiceRegister);

RptInvoiceRegister.show=(tiket)=>{
  tiket.modul=RptInvoiceRegister.table_name;
  tiket.menu.name=RptInvoiceRegister.title;
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

    RptInvoiceRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptInvoiceRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptInvoiceRegister.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptInvoiceRegister.display(indek);
  };
};

RptInvoiceRegister.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;
  
  function getInvoices(callback){
    var sql="SELECT invoice_no,date,customer_name,total"
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
  
  function getCustomerCredits(callback){
    var sql="SELECT credit_no,date,customer_name,total"
      +" FROM customer_credits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.customer_credits=h;
      return callback();
    });
  }
  
  function getJoinArray( callback ) {
    var f=JSON.parse(bingkai[indek].rpt.invoices).fields;
    var a=JSON.parse(bingkai[indek].rpt.invoices).rows;
    var b=JSON.parse(bingkai[indek].rpt.customer_credits).rows;
    var i=0;
    
    for(i=0;i<b.length;i++){
      a.push([
        b[i][0], // credit_no
        b[i][1], // date
        b[i][2], // customer_name
        b[i][3]*-1, // amount
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: a,
    });
    
    return callback();
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;
    getInvoices(()=>{
      getCustomerCredits(()=>{
        getJoinArray(()=>{
          RptInvoiceRegister.display( indek );
        });
      });
    });
  });
};

RptInvoiceRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptInvoiceRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptInvoiceRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptInvoiceRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // invoice_no
    90,  // date
    230, // name
    120, // total
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
          +s.setTitle( RptInvoiceRegister.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Invoice No')
          +s.setHeader(L[1], W[1], "left", 'Date')
          +s.setHeader(L[2], W[2], "left", 'Name')
          +s.setHeader(L[3], W[3], "right", 'Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
//--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var total=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].invoice_no )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].customer_name )
          +s.setLabel(L[3], W[3], "right", ribuan0(h2[i].total) )
        html+='<br>';
        
        total+=Number( h2[i].total );
      }
      html+=''
        +s.setTotalA(L[3], W[3], "right", ribuan0(total) )
        +'<br>';        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( (a.date).concat(a.customer_id,a.invoice_no) === 
      (b.date).concat(b.customer_id,b.invoice_no) ){
      return 0;
    }
    else{
      if( (a.date).concat(a.customer_id,a.invoice_no) < 
        (b.date).concat(b.customer_id,b.invoice_no) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptInvoiceRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptInvoiceRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptInvoiceRegister.filterExecute(indek); });
  RptInvoiceRegister.formFilter(indek);
};

RptInvoiceRegister.formFilter=(indek)=>{
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
            +' onchange="RptInvoiceRegister.getCustomer(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptInvoiceRegister.customer.getPaging(\''+indek+'\''
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

RptInvoiceRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptInvoiceRegister.getPeriod(indek);
};

RptInvoiceRegister.getPeriod=(indek)=>{
  RptInvoiceRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptInvoiceRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptInvoiceRegister.preview(indek);
};

RptInvoiceRegister.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptInvoiceRegister.getCustomer(indek);
};

RptInvoiceRegister.getCustomer=(indek)=>{
  message.none(indek);
  RptInvoiceRegister.customer.getOne(indek,
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


RptInvoiceRegister.print=(indek)=>{};


// eof: 285;323;330;
