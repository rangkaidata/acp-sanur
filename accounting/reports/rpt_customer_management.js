/*
 * name: budiono;
 * date: may-23, 15:08, thu-2025; #55; 
 * edit: dec-23, 18:11, tue-2025; #85; report-std;
 */

'use strict';

var RptCustomerManagement={}
  
RptCustomerManagement.table_name='rpt_customer_management';
RptCustomerManagement.title='Customer Management Detail';
RptCustomerManagement.period=new PeriodLook(RptCustomerManagement);
RptCustomerManagement.customer=new CustomerLook(RptCustomerManagement);

RptCustomerManagement.show=(tiket)=>{
  tiket.modul=RptCustomerManagement.table_name;
  tiket.menu.name=RptCustomerManagement.title;
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

    RptCustomerManagement.preview(indek);
  }else{
    show(baru);
  }
}

RptCustomerManagement.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    bingkai[indek].rpt.refresh=true;
    RptCustomerManagement.proses(indek);
  } else {  
    RptCustomerManagement.display(indek);
  };
};

RptCustomerManagement.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;
  
  function getInvoices(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT "
      +" customer_id"   // col-1
      +",customer_name" // col-2
      +",invoice_no"   // col-3
      +",date_due"     // col-4
      +",total"        // col-5
      +" FROM invoices" 
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
      
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.invoices=h;
      return callback();
    });
  }
  
  function getReceipts( callback ){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT "
      +" customer_id"    // col-0
      +",name"  // col-1
      +",invoice_detail" // col-2
      +" FROM receipts" 
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date >= '"+from+"'";// diatas from
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      };
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receipts=h;
      return callback();
    });
  }
  
  function getCustomerCredits( callback ){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT "
      +" customer_id"   // col-0
      +",customer_name" // col-1
      +",invoice_no"    // col-2
      +",total"         // col-3
      +" FROM customer_credits" 
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date >= '"+from+"'";// diatas from
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      };
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
      "date_due",
      "amount",
      "status"
    ];
    var i=0,j=0,k=0;
    var r=[];
    
    // invoices
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //0-customer_id
        a[i][1], //1-name
        a[i][2], //2-invoice_no
        a[i][3], //3-date_due
        Number(a[i][4]), //4-amount
        "Unpaid" //5-status
      ]);
    }

    // receipts
    var d;
    for(i=0;i<r.length;i++){
      for(j=0;j<b.length;j++){
        
        if(r[i][0]==b[j][0]){
          
          d=JSON.parse( b[j][2] );
          
          for(k=0;k<d.length;k++){
            if(r[i][2]==d[k].invoice_no){// exists;
              r[i][4]+=Number(d[k].amount_paid)+Number(d[k].discount)*-1;
              r[i][5]="Partially Paid";
              if(parseInt(r[i][4]*100)==0){// pembulatan
                r[i][4]=0;
                r[i][5]="Full paid";
              }
            }
          }
        }        
      }
    }

    // customer_credits
    for(i=0;i<r.length;i++){
      for(j=0;j<c.length;j++){
        if(r[i][0]==c[j][0]){ // customer_id
          if(r[i][2]==c[j][2]){ // invoice_no
            r[i][4]+=Number(c[j][3])*-1; // amount
            r[i][5]="Void (" +c[j][3]+")";
            if(parseInt(r[i][4]*100)==0){// pembulatan
              r[i][4]=0;
              r[i][5]="Full paid";
            }
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
            RptCustomerManagement.display( indek );
          });
        });
      });
    });
  });
};

RptCustomerManagement.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCustomerManagement.proses(indek); });
  toolbar.filter(indek,()=>{ RptCustomerManagement.filter(indek); });
  toolbar.print(indek,()=>{ RptCustomerManagement.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    120,  // customer_id
    190, // name
    85,  // invoice_no
    90,  // date_due
    100, // remaining amount
    90,  // status
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
          +s.setTitle( RptCustomerManagement.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Customer ID')
          +s.setHeader(L[1], W[1], "left", 'Customer Name')
          +s.setHeader(L[2], W[2], "left", 'Invoice No.')
          +s.setHeader(L[3], W[3], "left", 'Date Due')
          +s.setHeader(L[4], W[4], "right", 'Remaining')
          +s.setHeader(L[5], W[5], "left", 'Days To Pay')
          +'<br>'

        +'</div>'//d
      +'</div>'//c
      
//--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var customer_id="";
      var sub_total=0;
      var total=0;
      var X=200;

      for(i=0;i<h2.length;i++){
        if(i==0){
          customer_id=h2[i].customer_id;
          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
            +s.setLabel(L[1], W[1], "left", h2[i].name )
        };
        if(customer_id!=h2[i].customer_id){
          html+=''
            +s.setSubTotal(L[2], X, "left", 'Subtotal ['+customer_id+']' )
            +s.setSubTotal(L[4], W[4], "right", ribuan(sub_total) )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
            +s.setLabel(L[1], W[1], "left", h2[i].name )
          sub_total=0;
        }
        
        html+=''
          +s.setLabel(L[2], W[2], "left", h2[i].invoice_no )
          +s.setLabel(L[3], W[3], "left", tglWest(h2[i].date_due) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].amount) )
          +s.setLabel(L[5], W[5], "status", h2[i].status )
        html+='<br>';
        
        customer_id=h2[i].customer_id;
        sub_total+=Number(h2[i].amount);
        total+=Number(h2[i].amount);
      }
      html+=''
        +s.setSubTotal(L[2], X, "left", 'Subtotal ['+customer_id+']' )
        +s.setSubTotal(L[4], W[4], "right", ribuan(sub_total) )
        +'<br>'
        +s.setTotalA(L[2], X, "left", 'Total' )
        +s.setTotalA(L[4], W[4], "right", ribuan(total) )
        +'<br>';
        
      html+='</div>'
    +'</div>'
  +'</div>';
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

RptCustomerManagement.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCustomerManagement.preview(indek); });
  toolbar.preview(indek,()=>{ RptCustomerManagement.filterExecute(indek); });
  RptCustomerManagement.formFilter(indek);
};

RptCustomerManagement.formFilter=(indek)=>{
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
            +' onchange="RptCustomerManagement.getCustomer(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptCustomerManagement.customer.getPaging(\''+indek+'\''
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

RptCustomerManagement.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCustomerManagement.getPeriod(indek);
};

RptCustomerManagement.getPeriod=(indek)=>{
  RptCustomerManagement.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptCustomerManagement.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCustomerManagement.preview(indek);
};

RptCustomerManagement.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptCustomerManagement.getCustomer(indek);
};

RptCustomerManagement.getCustomer=(indek)=>{
  message.none(indek);
  RptCustomerManagement.customer.getOne(indek,
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

RptCustomerManagement.print=(indek)=>{};

// eof: 305;455;
