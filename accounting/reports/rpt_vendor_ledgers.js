/*
 * name: budiono;
 * date: jun-13, 11:25, fri-2025; #59; cos_amount; vendor_ledgers;
 * edit: dec-28, 17:19, sun-2025; #85; vendor_ledger;
 */

'use strict';

var RptVendorLedgers={}
  
RptVendorLedgers.table_name='rpt_vendor_ledgers';
RptVendorLedgers.title='Vendor Ledgers';
RptVendorLedgers.period=new PeriodLook(RptVendorLedgers);

RptVendorLedgers.show=(tiket)=>{
  tiket.modul=RptVendorLedgers.table_name;
  tiket.menu.name=RptVendorLedgers.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "vendor_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptVendorLedgers.preview(indek);
  }else{
    show(baru);
  }
}

RptVendorLedgers.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptVendorLedgers.proses(indek);
  } else {  
    RptVendorLedgers.display(indek);
  };
};

RptVendorLedgers.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var vendor_id=bingkai[indek].rpt.filter.vendor_id;
  var vendor_name=bingkai[indek].rpt.filter.vendor_name;

  function getBeginReceivePayment(callback){
    var from=bingkai[indek].rpt.filter.from;
    var sql="SELECT vendor_id"            // 0
      +",vendor_name"                     // 1
      +",SUM(trans_amount) AS amount" // 2
      +",SUM(discount) AS discount" // 3
      +" FROM receive_payment"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND trans_date < '"+from+"'"
      if(vendor_id!=""){
        sql+=" AND vendor_id='"+vendor_id+"'"
      }
      sql+=" GROUP BY vendor_id,vendor_name";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.begin_receive_payment=h;
      return callback();
    });
  }
  
  function getReceivePayment(callback){
    var sql="SELECT vendor_id" // 0
      +",vendor_name"          // 1
      +",trans_date"             // 2
      +",trans_no"               // 3
      +",table_name"             // 4
      +",trans_amount" // 5
      +",discount " // 6
      +" FROM receive_payment"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND trans_date between '"+from+"' AND '"+to+"'"
      if(vendor_id!=""){
        sql+=" AND vendor_id='"+vendor_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receive_payment=h;
      return callback();
    });
  }

  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.receive_payment).rows;
    var b=JSON.parse(bingkai[indek].rpt.begin_receive_payment).rows;
    var f=["vendor_id","vendor_name",
      "date","trans_no","type",
      "debit","credit","balance"
    ];
    var i=0;
    var r=[];
    var debit
    var credit;
    var balance=0;
    var trans_no;
    var discount=0;
    
    for(i=0;i<a.length;i++){
      debit=0;
      credit=0;
      discount=Number(a[i][6]);
      balance=Number(a[i][5])
      if(Number(a[i][5])>0){
        debit=Number(a[i][5]);
      }else{
        credit=Number(a[i][5])*-1;
      }
      
      r.push([
        a[i][0], // 0-vendor_id
        a[i][1], // 1-vendor_name
        a[i][2], // 2-date
        a[i][3], // 3-reference
        a[i][4], // 4-table_name
        debit,   // 5-debit
        credit+discount,  // 6-credit
        balance-discount  // 7-balance       
      ]);
    }
    
    // begin
    for(i=0;i<b.length;i++){
      discount=Number(b[i][3]);
      debit=0;
      credit=0;
      balance=Number(b[i][2]);
      
      if(Number(b[i][2])>0){
        debit=Number(b[i][2]);
      }else{
        credit=Number(b[i][2])*-1;
      }
      
      r.push([
        b[i][0],   // 0-vendor_id
        b[i][1],   // 1-vendor_name
        "",        // 2-date
        "beg_bal", // 3-reference
        "",        // 4-table_name
        debit,     // 5-debit
        credit+discount,    // 6-credit
        balance-discount    // 7-balance       
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
    
    getBeginReceivePayment(()=>{
      getReceivePayment(()=>{
        getJoinArray(()=>{
          RptVendorLedgers.display( indek );
        });
      });
    });
  });
};

RptVendorLedgers.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptVendorLedgers.proses(indek); });
  toolbar.filter(indek,()=>{ RptVendorLedgers.filter(indek); });
  toolbar.print(indek,()=>{ RptVendorLedgers.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // vendor_id
    90, // name
    90, // date
    90, // trans_no
    50, // type
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
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d
          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptVendorLedgers.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Vendor ID')
          +s.setHeader(L[1], W[1], "left", 'Vendor Name')
          +s.setHeader(L[2], W[2], "left", 'Date')
          +s.setHeader(L[3], W[3], "left", 'Trans No.')
          +s.setHeader(L[4], W[4], "left", 'Type')
          +s.setHeader(L[5], W[5], "right", 'Debit Amt')
          +s.setHeader(L[6], W[6], "right", 'Credit Amt')
          +s.setHeader(L[7], W[7], "right", 'Balance')            
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var vendor_id;
      var balance=0;
      var td=0,tc=0,tb=0;

      for(i=0;i<h2.length;i++){
        if(vendor_id!=h2[i].vendor_id){
          if(i>0){
            html+="<br>"
          };
          balance=0;
        }
        balance+=Number(h2[i].balance);
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].vendor_id )
          +s.setLabel(L[1], W[1], "left", h2[i].vendor_name )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].date) )
          +s.setLabel(L[3], W[3], "left", h2[i].trans_no )
          +s.setLabel(L[4], W[4], "left", h2[i].type )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].debit) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].credit) )
          +s.setLabel(L[7], W[7], "right", ribuan(balance) )
          
        html+='<br>';
        
        vendor_id=h2[i].vendor_id;
        td+=Number(h2[i].debit);
        tc+=Number(h2[i].credit);
        tb+=Number(h2[i].balance);
      }
      html+=''
        +s.setTotalA(L[5], W[5], "right", ribuan(td) )
        +s.setTotalA(L[6], W[6], "right", ribuan(tc) )
        +s.setTotalA(L[7], W[7], "right", ribuan(tb) )
        +'<br>';
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( String(a.vendor_id).concat(a.date) === 
      String(b.vendor_id).concat(b.date) ){
      return 0;
    }
    else{
      if( String(a.vendor_id).concat(a.date) < 
        String(b.vendor_id).concat(b.date) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptVendorLedgers.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptVendorLedgers.preview(indek); });
  toolbar.preview(indek,()=>{ RptVendorLedgers.filterExecute(indek); });
  RptVendorLedgers.formFilter(indek);
};

RptVendorLedgers.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' id="btn_period_'+indek+'" '
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
        +'<input type="text" id="vendor_id_'+indek+'">'
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
};

RptVendorLedgers.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptVendorLedgers.preview(indek);
};

RptVendorLedgers.print=(indek)=>{};

// 364;
