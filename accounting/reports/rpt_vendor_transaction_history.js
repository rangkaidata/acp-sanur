/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 * edit: dec-28, 20:28, sun-2025; #85; report-std;
 */

'use strict';

var RptVendorTransaction={}
  
RptVendorTransaction.table_name='rpt_vendor_transaction';
RptVendorTransaction.title='Vendor Transaction History';

RptVendorTransaction.show=(tiket)=>{
  tiket.modul=RptVendorTransaction.table_name;
  tiket.menu.name=RptVendorTransaction.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "vendor_id": "",
      "vendor_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    RptVendorTransaction.preview(indek);
  }else{
    show(baru);
  }
}

RptVendorTransaction.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptVendorTransaction.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptVendorTransaction.display(indek);
  };
};

RptVendorTransaction.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var vendor_id=bingkai[indek].rpt.filter.vendor_id;
  
  function getReceiveInventory(callback){
    var sql="SELECT vendor_id"     //col-0
      +",vendor_name AS name"      //col-1
      +",invoice_no" //col-2
      +",invoice_no AS trans_no"   //col-3 
      +",date"                     //col-4
      +",amount"                   //col-5
      +" FROM receives"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      if(vendor_id!=""){
        sql+=" AND vendor_id='"+vendor_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receive_inventory=h;
      return callback();
    });
  }
  
  function getPayments( callback ){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var vendor_id=bingkai[indek].rpt.filter.vendor_id;
    var sql="SELECT vendor_id" //col-0
      +",name"                 //col-1
      +",payment_no"           //col-2
      +",date"                 //col-3
      +",invoice_detail"       //col-4
      +" FROM payments"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      if(vendor_id!=""){
        sql+=" AND vendor_id='"+vendor_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.payments=h;
      return callback();
    });
  }
  
  function getVendorCredits( callback ){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var vendor_id=bingkai[indek].rpt.filter.vendor_id;
    var sql="SELECT vendor_id" //col-0
      +",vendor_name"          //col-1
      +",credit_no"            //col-2
      +",date"                 //col-3
      +",invoice_no"           //col-4
      +",amount"               //col-5
      +" FROM vendor_credits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      if(vendor_id!=""){
        sql+=" AND vendor_id='"+vendor_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.vendor_credits=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var f=[
      "vendor_id",
      "name",
      "invoice_no",
      "trans_no",
      "date",
      "amount",
      "table_name"
    ];
    var a=JSON.parse(bingkai[indek].rpt.receive_inventory).rows;
    var b=JSON.parse(bingkai[indek].rpt.payments).rows;
    var c=JSON.parse(bingkai[indek].rpt.vendor_credits).rows;
    var i=0,j=0,k=0;
    var n=[];// new array;
    
    // purchase_invoice
    for(i=0;i<a.length;i++){
      n.push([
        a[i][0],  // col-0: vendor_id
        a[i][1],  // col-1: name
        a[i][2],  // col-2: invoice_no 
        a[i][3],  // col-3: trans_no
        a[i][4],  // col-4: date
        a[i][5],  // col-5: amount
        "Invoice" // col-6: table_name 
      ]);
    }
    
    var ada=0;
    var d;
    
    // payments
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<b.length;j++){
        
        if(a[i][0]==b[j][0]){
          d=JSON.parse(b[j][4]);
          
          for(k=0;k<d.length;k++){
            if(a[i][2]==d[k].invoice_no){
              ada=1;// exist: push payment;
              n.push([
                a[i][0],          // col-0: vendor_id
                a[i][1],          // col-1: name
                d[k].invoice_no,  // col-2: invoice_no
                b[j][2],          // col-3: payment_no
                b[j][3],          // col-4: payment_date
                (d[k].amount_paid+d[k].discount)*-1, 
                                  // col-5: payment_amount
                "Payment"         // col-6: table_name
              ])
            }
          }
        }
      }
    }
    
    // vendor_credits
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<c.length;j++){
        if(a[i][0]==c[j][0]){   // vendor_id
          if(a[i][2]==c[j][4]){ // invoice_no
            n.push([
              a[i][0],       // col-0: vendor_id
              a[i][1],       // col-1: name
              c[j][4],       // col-2: invoice_no
              c[j][2],       // col-3: credit_no
              c[j][3],       // col-4: credit_date
              c[j][5]*-1,    // col-5: credit_amount
              "Credit Memos" // col-6: table_name
            ])
          }
        }
      }
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      "fields":f,
      "rows": n
    });
    
    return callback();
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getReceiveInventory(()=>{
      getPayments(()=>{
        getVendorCredits(()=>{
          getJoinArray(()=>{
            RptVendorTransaction.display( indek );
          });
        });
      });
    });
  });
};

RptVendorTransaction.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptVendorTransaction.proses(indek); });
  toolbar.filter(indek,()=>{ RptVendorTransaction.filter(indek); });
  toolbar.print(indek,()=>{ RptVendorTransaction.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    200, // col-0: vendor_id
    90, // col-2: invoice_no
    90, // col-3: table_name
    90, // col-4: trans_no
    85, // col-5: date
    120  // col-6: amount
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
  var X=200;

  var html=''
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d
          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptVendorTransaction.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Vendor')
          +s.setHeader(L[1], W[1], "left", 'Invoice No.')
          +s.setHeader(L[2], W[2], "left", 'Table Name')
          +s.setHeader(L[3], W[3], "left", 'Trans No.')
          +s.setHeader(L[4], W[4], "left", 'Date')
          +s.setHeader(L[5], W[5], "right", 'Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e
      
      var h2=h.sort( sortByID );
      var vendor_id='';
      var invoice_no='';
      var sub_total=0;
      var sub_total_b=0;
      var total=0;
      

      for(i=0;i<h2.length;i++){
        if(i==0){
          vendor_id=h2[i].vendor_id;
          invoice_no=h2[i].invoice_no;
          html+=s.setLabel(L[0], W[0], "left", h2[i].vendor_id )
            +'<br>'
            +s.setLabel(L[0], X, "left", h2[i].name )
        }
        // summary/group
        if(vendor_id!=h2[i].vendor_id){
          html+=""
            +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total) )
            +"<br>"
            +s.setLabel(L[1], 300, "left", '<b>Total transaction ['+vendor_id+']:</b>' )
            +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total_b) )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].vendor_id )
            +'<br>'
            +s.setLabel(L[0], X, "left", h2[i].name )
            sub_total=0;
            sub_total_b=0;
        }else{
          if(invoice_no!=h2[i].invoice_no){
            html+=''
              +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total) )
              +'<br>';
            sub_total=0;
          };
        };
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].invoice_no )
          +s.setLabel(L[2], W[2], "left", h2[i].table_name )
          +s.setLabel(L[3], W[3], "left", h2[i].trans_no )
          +s.setLabel(L[4], W[4], "left", tglWest(h2[i].date) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].amount) )
        html+='<br>';
        
        vendor_id=h2[i].vendor_id;
        invoice_no=h2[i].invoice_no;
        sub_total+=Number(h2[i].amount);
        sub_total_b+=Number(h2[i].amount);
        total+=Number(h2[i].amount);
      }
      html+=''
        +s.setSubTotal(L[5], W[5], "right", ribuan0(sub_total) )
        +'<br>'
        +s.setLabel(L[2], 100, "left", '<b>Report Total</b>' )
        +s.setTotalA(L[5], W[5], "right", ribuan0(total) )
        +'<br>';   
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( (a.vendor_id).concat(a.invoice_no) === 
      (b.vendor_id).concat(b.invoice_no) ){
      return 0;
    }
    else{
      if( (a.vendor_id).concat(a.invoice_no) < 
        (b.vendor_id).concat(b.invoice_no) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptVendorTransaction.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptVendorTransaction.preview(indek); });
  toolbar.preview(indek,()=>{ RptVendorTransaction.filterExecute(indek); });
  RptVendorTransaction.formFilter(indek);
};

RptVendorTransaction.formFilter=(indek)=>{
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
        +'<label>Vendor ID</label>'
        +'<input type="text" id="vendor_id_'+indek+'"'
          +' onchange="LookTable.getVendor(\''+indek+'\');">'
        +'<button type="button" '
          +' onclick="LookTable.vendor.getPaging(\''+indek+'\''
          +',\'vendor_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" id="vendor_name_'+indek+'" disabled>'
      +'</li>'
    +'</ul>'
  +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('vendor_id_'+indek, bingkai[indek].rpt.filter.vendor_id ); 
  setEV('vendor_name_'+indek, bingkai[indek].rpt.filter.vendor_name ); 
};

RptVendorTransaction.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptVendorTransaction.preview(indek);
};

RptVendorTransaction.print=(indek)=>{};


// eof: 
