/*
 * name: budiono;
 * date: may-24, 12:03, sat-2025; #55; 
 * edit: dec-24, 14:48, wed-2025; #85; report-std;
 */

'use strict';

var RptSalesOrderRegister={}
  
RptSalesOrderRegister.table_name='rpt_sales_order_register';
RptSalesOrderRegister.title='Sales Order Register';
RptSalesOrderRegister.period=new PeriodLook(RptSalesOrderRegister);
RptSalesOrderRegister.customer=new CustomerLook(RptSalesOrderRegister);

RptSalesOrderRegister.show=(tiket)=>{
  tiket.modul=RptSalesOrderRegister.table_name;
  tiket.menu.name=RptSalesOrderRegister.title;
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

    RptSalesOrderRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptSalesOrderRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptSalesOrderRegister.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptSalesOrderRegister.display(indek);
  };
};

RptSalesOrderRegister.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;
  
  function getSalesOrders(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT so_no,date,customer_name,total"
      +" FROM sales_orders"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.sales_orders=h;
      return callback();
    });
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getSalesOrders(()=>{
      RptSalesOrderRegister.display( indek );
    });
  });
};

RptSalesOrderRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptSalesOrderRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptSalesOrderRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptSalesOrderRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sales_orders );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // quote_no
    90, // date
    90, // ship_by
    90, // status
    250, // name
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
          +s.setTitle( RptSalesOrderRegister.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Quote No.')
          +s.setHeader(L[1], W[1], "left", 'Date')
          +s.setHeader(L[2], W[2], "left", 'Ship By')
          +s.setHeader(L[3], W[3], "left", 'Status')
          +s.setHeader(L[4], W[4], "left", 'Name')
          +s.setHeader(L[5], W[5], "right", 'Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var total=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].so_no )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", "" )
          +s.setLabel(L[3], W[3], "left", "" )
          +s.setLabel(L[4], W[4], "left", h2[i].customer_name )
          +s.setLabel(L[5], W[5], "right", ribuan0(h2[i].total) )
        html+='<br>';
        
        total+=Number(h2[i].total);
      }
      html+=''
        +s.setTotalA(L[5], W[5], "right", ribuan0(total) )
        +'<br>';
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( a.date === b.date ){
      return 0;
    }
    else{
      if( a.date < b.date ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptSalesOrderRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptSalesOrderRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptSalesOrderRegister.filterExecute(indek); });
  RptSalesOrderRegister.formFilter(indek);
};

RptSalesOrderRegister.formFilter=(indek)=>{
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
            +' onclick="RptSalesOrderRegister.period.getPaging(\''+indek+'\''
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
            +' onchange="RptSalesOrderRegister.getCustomer(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptSalesOrderRegister.customer.getPaging(\''+indek+'\''
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

RptSalesOrderRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptSalesOrderRegister.getPeriod(indek);
};

RptSalesOrderRegister.getPeriod=(indek)=>{
  RptSalesOrderRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptSalesOrderRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptSalesOrderRegister.preview(indek);
};

RptSalesOrderRegister.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptSalesOrderRegister.getCustomer(indek);
};

RptSalesOrderRegister.getCustomer=(indek)=>{
  message.none(indek);
  RptSalesOrderRegister.customer.getOne(indek,
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

RptSalesOrderRegister.print=(indek)=>{};



// eof: 292;
