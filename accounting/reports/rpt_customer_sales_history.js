/*
 * name: budiono;
 * date: jun-13, 10:12, fri-2025; #59; cos_amount;
 * edit: dec-23, 18:13, tue-2025; #85; report_std;
 */

'use strict';

var RptCustomerSalesHistory={}
  
RptCustomerSalesHistory.table_name='rpt_customer_sales_history';
RptCustomerSalesHistory.title='Customer Sales History';
RptCustomerSalesHistory.period=new PeriodLook( RptCustomerSalesHistory );
RptCustomerSalesHistory.customer=new CustomerLook(RptCustomerSalesHistory);

RptCustomerSalesHistory.show=(tiket)=>{
  tiket.modul=RptCustomerSalesHistory.table_name;
  tiket.menu.name=RptCustomerSalesHistory.title;
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

    RptCustomerSalesHistory.preview(indek);
  }else{
    show(baru);
  }
}

RptCustomerSalesHistory.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCustomerSalesHistory.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptCustomerSalesHistory.display(indek);
  };
};

RptCustomerSalesHistory.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;
  
  function getInvoices(callback){
    var sql="SELECT customer_id,customer_name,detail,so_detail,"
      +"invoice_no"
      +" FROM invoices"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from+"' AND '"+to+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.invoices=h;
      return callback();
    });
  }

  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.invoices).rows;
    var f=[
      "customer_id",
      "name",
      "amount",
      "cos_amount",
      "gross_profit",
      "gross_margin",
      "trans_no"
    ];
    var i,j;
    var r=[];
    var d;
    var gross_profit=0;
    var gross_margin=0;
    
    for(i=0;i<a.length;i++){
      
      d=JSON.parse(a[i][2]);// invoice_detail
      
      for(j=0;j<d.length;j++){
        if(Number(d[j].amount)!=0){
          
          gross_profit=Number(d[j].amount)-Number(d[j].cos_amount);
          gross_margin=gross_profit/Number(d[j].amount)*100;
          
          r.push([
            a[i][0],         // customer_id
            a[i][1],         // name
            d[j].amount,     // amount
            d[j].cos_amount, // cos_amount
            gross_profit,    // gross_profit
            gross_margin,     // gross_margin
            a[i][4]  // trans_no
          ]);
        };
      }
      
      d=JSON.parse(a[i][3]);// so_detail
      
      for(j=0;j<d.length;j++){
        if(Number(d[j].amount)!=0){ 
          
          gross_profit=Number(d[j].amount)-Number(d[j].cos_amount)
          gross_margin=gross_profit/Number(d[j].amount)*100;
          
          r.push([
            a[i][0],         // 0-customer_id
            a[i][1],         // 1-name
            d[j].amount,     // 2-amount
            d[j].cos_amount, // 3-cos_amount
            gross_profit,    // 4-gross_profit
            gross_margin,    // 5-gross_margin
            a[i][4]          // 6-trans_no
          ]);
        }
      }
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.join_array).rows;
    var f=JSON.parse(bingkai[indek].rpt.join_array).fields;
    var i,j;
    var r=[];
    var ada=0;
    var gross_margin=0;
    
    for(i=0;i<a.length;i++){
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){
          ada=1;
          r[j][2]+=Number(a[i][2]); // amount
          r[j][3]+=Number(a[i][3]); // cos_amount
          r[j][4]+=Number(a[i][4]); // gross_profit
        }
      }
      if(ada==0){
        r.push([
          a[i][0], // customer_id
          a[i][1], // name
          a[i][2], // amount
          a[i][3], // cos_amount
          a[i][4], // gross_profit
          gross_margin, // gross_margin
          a[i][6], // trans_no
        ]);
      }
    }

    bingkai[indek].rpt.sum_array=JSON.stringify({
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
      getJoinArray(()=>{
        getSumArray(()=>{
          RptCustomerSalesHistory.display( indek );
        });
      });
    });
  });
};

RptCustomerSalesHistory.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCustomerSalesHistory.proses(indek); });
  toolbar.filter(indek,()=>{ RptCustomerSalesHistory.filter(indek); });
  toolbar.print(indek,()=>{ RptCustomerSalesHistory.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-id
    130, // 1-name
    110, // 2-amount
    110, // 3-cos_amount
    110, // 4-gross_profit
    80, // 5-gross_margin
    90, // trans_no
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
          +s.setTitle( RptCustomerSalesHistory.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Customer ID')
          +s.setHeader(L[1], W[1], "left", 'Name')
          +s.setHeader(L[2], W[2], "right", 'Amount')
          +s.setHeader(L[3], W[3], "right", 'Cost of Sales')
          +s.setHeader(L[4], W[4], "right", 'Gross Profit')
          +s.setHeader(L[5], W[5], "right", 'Margin')
          +s.setHeader(L[6], W[6], "left", 'Trans No.')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      
//--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var customer_id='';
      var tot_qty=0, tot_amount=0, tot_cos=0, 
        tot_profit=0, tot_margin=0;
      var X=200;

      for(i=0;i<h2.length;i++){

        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].amount) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].cos_amount) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].gross_profit) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].gross_margin) )
          +s.setLabel(L[6], W[6], "left", h2[i].trans_no )
          
        html+='<br>';
         
        tot_qty+=Number(h2[i].qty);
        tot_amount+=Number(h2[i].amount);
        tot_cos+=Number(h2[i].cos_amount);
        tot_profit+=Number(h2[i].gross_profit);
        
        customer_id=h2[i].customer_id;
        
        if(i<h2.length-1){
          customer_id=h2[i+1].customer_id;
          if(h2[i].customer_id!=customer_id){
            html+=''
              +'<br>';
          }
        }
        
      }
      tot_margin=tot_profit/tot_amount*100;
      
      html+=''
        +s.setLabel(L[0], X, "left", '<strong>Report totals</strong>' )
        +s.setTotalA(L[2], W[2], "right", ribuan(tot_amount) )
        +s.setTotalA(L[3], W[3], "right", ribuan(tot_cos) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_profit) )
        +s.setTotalA(L[5], W[5], "right", ribuan(tot_margin) )
        +'<br>';
        
      html+='</div>'//e
    +'</div>'//b
  +'</div>';//a
  content.html(indek,html);

  renderLine(indek,L);

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
};

RptCustomerSalesHistory.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCustomerSalesHistory.preview(indek); });
  toolbar.preview(indek,()=>{ RptCustomerSalesHistory.filterExecute(indek); });
  RptCustomerSalesHistory.formFilter(indek);
};

RptCustomerSalesHistory.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
      +'<ul>'    
        +'<li>'
          +'<label>Period</label>'
          +'<input type="text" id="period_id_'+indek+'" size="17">'
          +'<button type="button" '
            +' id="btn_period_'+indek+'" '
            +' onclick="RptCustomerSalesHistory.period.getPaging(\''+indek+'\''
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
            +' onchange="RptCustomerSalesHistory.getCustomer(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptCustomerSalesHistory.customer.getPaging(\''+indek+'\''
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

RptCustomerSalesHistory.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCustomerSalesHistory.getPeriod(indek);
};

RptCustomerSalesHistory.getPeriod=(indek)=>{
  RptCustomerSalesHistory.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptCustomerSalesHistory.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCustomerSalesHistory.preview(indek);
};

RptCustomerSalesHistory.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptCustomerSalesHistory.getCustomer(indek);
};

RptCustomerSalesHistory.getCustomer=(indek)=>{
  message.none(indek);
  RptCustomerSalesHistory.customer.getOne(indek,
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


RptCustomerSalesHistory.print=(indek)=>{};




//eof:407;
