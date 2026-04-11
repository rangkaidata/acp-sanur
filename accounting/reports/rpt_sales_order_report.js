/*
 * name: budiono;
 * date: may-24, 14:24, sat-2025; #55; 
 * edit: dec-25, 15:08, wed-2025; #85; report-std;
 */

'use strict';

var RptSalesOrderReport={};
  
RptSalesOrderReport.table_name='rpt_sales_order_report';
RptSalesOrderReport.title='Sales Order Report';
RptSalesOrderReport.period=new PeriodLook(RptSalesOrderReport);
RptSalesOrderReport.customer=new CustomerLook(RptSalesOrderReport);

RptSalesOrderReport.show=(tiket)=>{
  tiket.modul=RptSalesOrderReport.table_name;
  tiket.menu.name=RptSalesOrderReport.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "customer_id": "",
      "customer_name": ""
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptSalesOrderReport.preview(indek);
  }else{
    show(baru);
  }
}

RptSalesOrderReport.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptSalesOrderReport.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptSalesOrderReport.display(indek);
  };
};

RptSalesOrderReport.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;
  
  function getSalesOrders(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT so_no"// col-0:
      +",date"            // col-1:
      +",customer_id"     // col-2:
      +",customer_name"            // col-3:
      +",detail"          // col-4:
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
  
  function getInvoices(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT customer_id" // col-0;
      +",so_no"                  // col-1:       
      +",so_detail"              // col-2:
      +" FROM invoices"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      //+" AND date between '"+from+"' AND '"+to+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.invoices=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var f=["so_no","date","customer_id","name","item_id",
      "qty_ordered","qty_shipped","qty_remaining","state"];
    var a=JSON.parse(bingkai[indek].rpt.sales_orders).rows;
    var b=JSON.parse(bingkai[indek].rpt.invoices).rows;
    var i=0,j=0;
    var r=[];
    var d,k;
    
    for(i=0;i<a.length;i++){
      d=JSON.parse( a[i][4] );
      for(j=0;j<d.length;j++){
        r.push([
          a[i][0],      // col-0: so_no
          a[i][1],      // col-1: date
          a[i][2],      // col-2: customer_id
          a[i][3],      // col-3: name
          d[j].item_id, // col-4: item_id
          d[j].quantity,// col-5: qty_ordered
          0,            // col-6: qty_shipped
          d[j].quantity,// col-7: qty_remaining
          "???"         // col-8: state open
        ]);
      };
    };
    
    // invoices
    for(i=0;i<r.length;i++){
      for(j=0;j<b.length;j++){
        if(r[i][2]==b[j][0]){ // customer_id
          if(r[i][0]==b[j][1]){ // so_no
            d=JSON.parse(b[j][2]);
            for(k=0;k<d.length;k++){
              if(r[i][4]==d[k].item_id){// item_id
                r[i][6]=d[k].shipped;
                r[i][7]=Number(r[i][5])-Number(d[k].shipped);
              }
            }
          }
        }
      }
    }
    
    // get state
    var s=r;
    var sisa=0;
    var state=[];
    var status; 
    for(i=0;i<a.length;i++){
      sisa=0;
      status="Open";
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){// so_no
          if(a[i][2]==r[j][2]){// customer_id
            sisa+=r[j][7]; // rmaining;
          }
        }
      }
      if(sisa==0) status="Closed";
      state.push([
        a[i][0], //col-0: so_no
        a[i][2], //col-1: customer_id
        status,  //col-2: state
      ])
    }
    
    // tempel state
    for(i=0;i<r.length;i++){
      for(j=0;j<state.length;j++){
        if(state[j][0]==r[i][0]){
          if(state[j][1]==r[i][2]){
            r[i][8]=state[j][2]; // update state
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
    getSalesOrders(()=>{
      getInvoices(()=>{  
        getJoinArray(()=>{
          RptSalesOrderReport.display( indek );
        });
      });
    });
  });
};

RptSalesOrderReport.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptSalesOrderReport.proses(indek); });
  toolbar.filter(indek,()=>{ RptSalesOrderReport.filter(indek); });
  toolbar.print(indek,()=>{ RptSalesOrderReport.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // so_no
    85, // date
    90, // vendor_id
    90, // item_id
    90, // qty_ordered
    90, // qty_shipped
    100, // qty_remaining
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
          +s.setTitle( RptSalesOrderReport.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'SO No.')
          +s.setHeader(L[1], W[1], "left", 'Date')
          +s.setHeader(L[2], W[2], "left", 'Vendor ID')
          +s.setHeader(L[3], W[3], "left", 'Item ID')
          +s.setHeader(L[4], W[4], "right", 'Qty Ordered')
          +s.setHeader(L[5], W[5], "right", 'Qty Shipped')
          +s.setHeader(L[6], W[6], "right", 'Qty Remaining')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var so_no="";
      var customer_id="";
      var X=200;

      for(i=0;i<h2.length;i++){
        if(i==0){
          customer_id=h2[i].customer_id;
          so_no=h2[i].so_no;
          html+=""
            +s.setLabel(L[0], W[0], "left", h2[i].so_no )
            +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
            +s.setLabel(L[2], W[2], "left", h2[i].customer_id )
            +s.setLabel(L[3], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].state )
        }
        if( (so_no).concat(customer_id) != (h2[i].so_no).concat(h2[i].customer_id) ){
          html+=""
            +"<br>"
            +s.setLabel(L[0], W[0], "left", h2[i].so_no )
            +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
            +s.setLabel(L[2], W[2], "left", h2[i].customer_id )
            +s.setLabel(L[3], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].state )
        }
        
        html+=''
          +s.setLabel(L[3], W[3], "left", h2[i].item_id )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].qty_ordered) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].qty_shipped) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].qty_remaining) )
        html+='<br>';
        
        customer_id=h2[i].customer_id;
        so_no=h2[i].so_no;
      }
      html+=''
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

RptSalesOrderReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptSalesOrderReport.preview(indek); });
  toolbar.preview(indek,()=>{ RptSalesOrderReport.filterExecute(indek); });
  RptSalesOrderReport.formFilter(indek);
};

RptSalesOrderReport.formFilter=(indek)=>{
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
            +' onclick="RptSalesOrderReport.period.getPaging(\''+indek+'\''
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
            +' onchange="RptSalesOrderReport.getCustomer(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptSalesOrderReport.customer.getPaging(\''+indek+'\''
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

RptSalesOrderReport.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptSalesOrderReport.getPeriod(indek);
};

RptSalesOrderReport.getPeriod=(indek)=>{
  RptSalesOrderReport.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptSalesOrderReport.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptSalesOrderReport.preview(indek);
};

RptSalesOrderReport.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptSalesOrderReport.getCustomer(indek);
};

RptSalesOrderReport.getCustomer=(indek)=>{
  message.none(indek);
  RptSalesOrderReport.customer.getOne(indek,
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

RptSalesOrderReport.print=(indek)=>{};



// eof: 301;
