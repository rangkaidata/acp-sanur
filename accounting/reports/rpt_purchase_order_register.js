/*
 * name: budiono;
 * date: may-21, 11:42, wed-2025; #55; top
 * edit: dec-25, 17:41, thu-2025; #85; report-std;
 */

'use strict';

var RptPurchaseOrderRegister={}
  
RptPurchaseOrderRegister.table_name='rpt_purchase_order_register';
RptPurchaseOrderRegister.title='Purchase Order Register';

RptPurchaseOrderRegister.show=(tiket)=>{
  tiket.modul=RptPurchaseOrderRegister.table_name;
  tiket.menu.name=RptPurchaseOrderRegister.title;
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

    RptPurchaseOrderRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptPurchaseOrderRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPurchaseOrderRegister.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptPurchaseOrderRegister.display(indek);
  };
};

RptPurchaseOrderRegister.proses=(indek)=>{

  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  
  function getPurchaseOrder(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var vendor_id=bingkai[indek].rpt.filter.vendor_id || "";
    var sql="SELECT po_no,date,good_thru,vendor_id,amount"
      +" FROM purchase_orders"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    if(vendor_id!=""){
      sql+=" AND vendor_id='"+vendor_id+"'";
    }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.purchase_orders=h;
      return callback();
    });
  }

  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getPurchaseOrder(()=>{
      RptPurchaseOrderRegister.display(indek);  
    });
  });
};

RptPurchaseOrderRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptPurchaseOrderRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptPurchaseOrderRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptPurchaseOrderRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.purchase_orders );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  // width
  var W=[
    90, // po_no
    90, // date
    90, // good_thru
    90, // vendor id
    90,// amount
  ];
  // left
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
          +s.setTitle( RptPurchaseOrderRegister.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0],W[0], "left", 'PO NO.')
          +s.setHeader(L[1],W[1], "left", 'Date')
          +s.setHeader(L[2],W[2], "left", 'Good Thru')
          +s.setHeader(L[3],W[3], "left", 'Vendor ID')
          +s.setHeader(L[4],W[4], "right", 'Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var amount=0;

      for(i=0;i<h2.length;i++){
                
        html+=''
          +s.setLabel(L[0],W[0], "left", h2[i].po_no )
          +s.setLabel(L[1],W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2],W[2], "left", tglWest(h2[i].good_thru) )
          +s.setLabel(L[3],W[3], "left", h2[i].vendor_id )
          +s.setLabel(L[4],W[4], "right", ribuan(h2[i].amount) )
        html+='<br>';
        
        amount+=Number(h2[i].amount);
      }
      html+=''
        +s.setTotalA(L[4], W[4], "right", ribuan0(amount) )
        +'<br>'
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

RptPurchaseOrderRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptPurchaseOrderRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptPurchaseOrderRegister.filterExecute(indek); });
  RptPurchaseOrderRegister.formFilter(indek);
};

RptPurchaseOrderRegister.formFilter=(indek)=>{
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
        +' class="btn_find"></button>'
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
        +'<label>Vendor ID:</label>'
        +'<input type="text" '
          +' id="vendor_id_'+indek+'" '
          +' size="17"'
          +' onchange="LookTable.getVendor(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_vendor_'+indek+'" '
          +' onclick="LookTable.vendor.getPaging(\''+indek+'\''
          +',\'vendor_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" '
          +' id="vendor_name_'+indek+'" disabled>'
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

RptPurchaseOrderRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPurchaseOrderRegister.preview(indek);
};

RptPurchaseOrderRegister.print=(indek)=>{};


//eof: 247;
