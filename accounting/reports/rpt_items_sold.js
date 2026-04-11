/*
 * name: budiono;
 * date: jun-12, 11:49, thu-2025; #58;
 * edit: dec-24, 11:31, wed-2025; #85; report-std;
 */

'use strict';

var RptItemsSold={}
  
RptItemsSold.table_name='rpt_items_sold';
RptItemsSold.title='Items Sold to Customers';
RptItemsSold.period=new PeriodLook( RptItemsSold );
RptItemsSold.customer=new CustomerLook(RptItemsSold);

RptItemsSold.show=(tiket)=>{
  tiket.modul=RptItemsSold.table_name;
  tiket.menu.name=RptItemsSold.title;
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

    RptItemsSold.preview(indek);
  }else{
    show(baru);
  }
}

RptItemsSold.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptItemsSold.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptItemsSold.display(indek);
  };
};

RptItemsSold.proses=(indek)=>{

  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;

  function getInvoices(callback){
    var sql="SELECT customer_id,customer_name,detail,so_detail"
      +" FROM invoices"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from+"' AND '"+to+"'"
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.invoices=h;
      return callback();
    });
  }
  
  function getCustomerCredit(callback){
    var sql="SELECT customer_id,customer_name,invoice_detail"
      +" FROM customer_credits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from+"' AND '"+to+"'"
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.customer_credits=h;
      return callback();
    });
  }

  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.invoices).rows;
    var b=JSON.parse(bingkai[indek].rpt.customer_credits).rows;
    var f=[
      "customer_id","name","item_id","qty","amount",
      "cos_amount","gross_profit","gross_margin"
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
            a[i][0],         //customer_id
            a[i][1],         //name
            d[j].item_id,    // item_id
            d[j].quantity,   // qty
            d[j].amount,     // amount
            d[j].cos_amount,  // cos_amount
            gross_profit,
            gross_margin,
          ]);
        };
      }
      
      d=JSON.parse(a[i][3]);// so_detail
      
      for(j=0;j<d.length;j++){
        if(Number(d[j].amount)!=0){ 
          
          gross_profit=Number(d[j].amount)-Number(d[j].cos_amount)
          gross_margin=gross_profit/Number(d[j].amount)*100;
          
          r.push([
            a[i][0],      // customer_id
            a[i][1],       // name
            d[j].item_id, // item_id
            d[j].shipped, // qty
            d[j].amount,   // amount
            d[j].cos_amount, // cos_amount
            gross_profit,
            gross_margin,
          ]);
        }
      }
    }
    
    // customer_credits    
    for(i=0;i<b.length;i++){
      
      d=JSON.parse(b[i][2]);// invoice_detail
      
      for(j=0;j<d.length;j++){
        if(Number(d[j].amount)!=0){

          gross_profit=Number(d[j].amount)-Number(d[j].cos_amount);
          gross_margin=gross_profit/Number(d[j].amount)*100;
          
          r.push([
            b[i][0],         //customer_id
            b[i][1],         //name
            d[j].item_id,    // item_id
            Number(d[j].returned)*-1,   // qty
            Number(d[j].amount)*-1,     // amount
            d[j].cos_amount*-1,  // cos_amount
            gross_profit*-1,
            gross_margin*-1,
          ]);
        };
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
      getCustomerCredit(()=>{
        getJoinArray(()=>{
          RptItemsSold.display( indek );
        });
      });
    });
  });
};

RptItemsSold.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptItemsSold.proses(indek); });
  toolbar.filter(indek,()=>{ RptItemsSold.filter(indek); });
  toolbar.print(indek,()=>{ RptItemsSold.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // id
    100, // item_id
    80, // qty
    100, // amount
    100, // cos_amount
    100, // gross_profit
    100, // gross_margin
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
          +s.setTitle( RptItemsSold.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Customer ID')
          +s.setHeader(L[1], W[1], "left", 'Item ID')
          +s.setHeader(L[2], W[2], "right", 'Qty')
          +s.setHeader(L[3], W[3], "right", 'Amount')
          +s.setHeader(L[4], W[4], "right", 'Cost of Sales')
          +s.setHeader(L[5], W[5], "right", 'Gross Profit')
          +s.setHeader(L[6], W[6], "right", 'Margin')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      
//--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var sum_qty=0, tot_qty=0;
      var sum_amount=0, tot_amount=0;
      var sum_cos=0, tot_cos=0;
      var sum_profit=0, tot_profit=0;
      var sum_margin=0, tot_margin=0;
      var customer_id;
      var X=300;

      for(i=0;i<h2.length;i++){
        if(customer_id!=h2[i].customer_id){
          if(i>0){
            sum_margin=sum_profit/sum_amount*100;
            html+=''
              +s.setSubTotal(L[2], W[2], "right", ribuan(sum_qty) )
              +s.setSubTotal(L[3], W[3], "right", ribuan(sum_amount) )
              +s.setSubTotal(L[4], W[4], "right", ribuan(sum_cos) )
              +s.setSubTotal(L[5], W[5], "right", ribuan(sum_profit) )
              +s.setSubTotal(L[6], W[6], "right", ribuan(sum_margin) )
              +'<br>'
            sum_qty=0;
            sum_amount=0;
            sum_cos=0;
            sum_profit=0;
          }
          
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
        }

        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].item_id )
          +s.setLabel(L[2], W[2], "right", h2[i].qty )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].amount) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].cos_amount) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].gross_profit) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].gross_margin) )
          
        html+='<br>';
        
        customer_id=h2[i].customer_id;
        sum_qty+=Number(h2[i].qty);
        sum_amount+=Number(h2[i].amount);
        sum_cos+=Number(h2[i].cos_amount);
        sum_profit+=Number(h2[i].gross_profit);
        
        tot_qty+=Number(h2[i].qty);
        tot_amount+=Number(h2[i].amount);
        tot_cos+=Number(h2[i].cos_amount);
        tot_profit+=Number(h2[i].gross_profit);
      }
      
      sum_margin=sum_profit/sum_amount*100;
      tot_margin=tot_profit/tot_amount*100;
      
      html+=''
        +s.setSubTotal(L[2], W[2], "right", ribuan(sum_qty) )
        +s.setSubTotal(L[3], W[3], "right", ribuan(sum_amount) )
        +s.setSubTotal(L[4], W[4], "right", ribuan(sum_cos) )
        +s.setSubTotal(L[5], W[5], "right", ribuan(sum_profit) )
        +s.setSubTotal(L[6], W[6], "right", ribuan(sum_margin) )
        +'<br>';
      
      html+=''
        +s.setLabel (L[0], W[0], "right", '<strong>Report Totals</strong>' )
        +s.setTotalA(L[2], W[2], "right", ribuan(tot_qty) )
        +s.setTotalA(L[3], W[3], "right", ribuan(tot_amount) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_cos) )
        +s.setTotalA(L[5], W[5], "right", ribuan(tot_profit) )
        +s.setTotalA(L[6], W[6], "right", ribuan(tot_margin) )
        +'<br>';
        
      html+='</div>'
    +'</div>'
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
};

RptItemsSold.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptItemsSold.preview(indek); });
  toolbar.preview(indek,()=>{ RptItemsSold.filterExecute(indek); });
  RptItemsSold.formFilter(indek);
};

RptItemsSold.formFilter=(indek)=>{
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
            +' onchange="RptItemsSold.getCustomer(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptItemsSold.customer.getPaging(\''+indek+'\''
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

RptItemsSold.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptItemsSold.getPeriod(indek);
};

RptItemsSold.getPeriod=(indek)=>{
  RptItemsSold.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptItemsSold.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptItemsSold.preview(indek);
};

RptItemsSold.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptItemsSold.getCustomer(indek);
};

RptItemsSold.getCustomer=(indek)=>{
  message.none(indek);
  RptItemsSold.customer.getOne(indek,
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


RptItemsSold.print=(indek)=>{};




// eof:293;408;461;
