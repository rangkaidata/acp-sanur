/*
 * name: budiono;
 * date: may-21, 17:49, wed-2025; #55; 
 */

'use strict';

var RptItemPurchased={}
RptItemPurchased.table_name='rpt_item_purchased';
RptItemPurchased.title='Item Purchased from Vendors';

RptItemPurchased.show=(tiket)=>{
  tiket.modul=RptItemPurchased.table_name;
  tiket.menu.name=RptItemPurchased.title;
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

    RptItemPurchased.preview(indek);
  }else{
    show(baru);
  }
}

RptItemPurchased.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptItemPurchased.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptItemPurchased.display(indek);
  };
};

RptItemPurchased.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var vendor_id=bingkai[indek].rpt.filter.vendor_id;
  var vendor_name=bingkai[indek].rpt.filter.vendor_name;
  
  function getReceive(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var vendor_id=bingkai[indek].rpt.filter.vendor_id || "";
    var sql="SELECT vendor_id,vendor_name,detail,po_detail"
      +" FROM receives"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    if(vendor_id!=""){
      sql+=" AND vendor_id='"+vendor_id+"'";
    }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receive_inventory=h;
      return callback();
    });
  }
  
  function getPayment(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var vendor_id=bingkai[indek].rpt.filter.vendor_id || "";
    var sql="SELECT vendor_id,name,detail"
      +" FROM payments"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    if(vendor_id!=""){
      sql+=" AND vendor_id='"+vendor_id+"'";
    }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.payments=h;
      return callback();
    });
  }
  
  function getVendorCredit(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var vendor_id=bingkai[indek].rpt.filter.vendor_id || "";
    var sql="SELECT vendor_id,vendor_name,detail,invoice_detail"
      +" FROM vendor_credits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    if(vendor_id!=""){
      sql+=" AND vendor_id='"+vendor_id+"'";
    }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.vendor_credit=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.receive_inventory).rows;
    var b=JSON.parse(bingkai[indek].rpt.payments).rows;
    var v=JSON.parse(bingkai[indek].rpt.vendor_credit).rows;
    var f=["vendor_id","vendor_name","item_id","item_name","quantity","amount"];
    var c=[];
    var i=0;
    var j=0;
    var d;
    
    for(i=0;i<a.length;i++){// receive_inventory
      // detail receive
      d=JSON.parse(a[i][2]);
      
      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          c.push([
            a[i][0], // vendor_id
            a[i][1], // vendor_name
            d[j].item_id, // item_id
            d[j].description, // item_name
            d[j].quantity, // quantity
            d[j].amount // amount
          ]);
        }
      }
      
      // detail po
      d=JSON.parse(a[i][3]);
      
      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          c.push([
            a[i][0], // vendor_id
            a[i][1], // vendor_name
            d[j].item_id, // item_id
            d[j].description, // item_name
            d[j].received, // quantity
            d[j].amount // amount
          ]);
        }
      }
    }
    
    // payments
    for(i=0;i<b.length;i++){
      // detail
      d=JSON.parse(b[i][2]);
      
      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          c.push([
            b[i][0], // vendor_id
            b[i][1], // vendor_name
            d[j].item_id, // item_id
            d[j].description, // item_name
            d[j].quantity, // quantity
            d[j].amount // amount
          ]);
        }
      }
    }
    
    // vendor_credits
    for(i=0;i<v.length;i++){
      // detail
      d=JSON.parse(v[i][2]);
      
      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          c.push([
            v[i][0], // vendor_id
            v[i][1], // vendor_name
            d[j].item_id, // item_id
            d[j].description, // item_name
            d[j].quantity*-1, // quantity
            d[j].amount*-1 // amount
          ]);
        }
      }
      // receive_detail
      d=JSON.parse(v[i][3]);
      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          c.push([
            v[i][0], // 0-vendor_id
            v[i][1], // 1-vendor_name
            d[j].item_id, // 2-item_id
            d[j].description, // 3-item_name
            d[j].returned*-1, // 4-quantity
            d[j].amount*-1 // 5-amount
          ]);
        }
      }
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields:f,
      rows:c
    });
    
    return callback();
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.join_array).rows;
    var f=JSON.parse(bingkai[indek].rpt.join_array).fields;
    var c=[]
    var i=0;
    var j=0;
    var ada=0;
    
    for(i=0;i<a.length;i++) {
      
      ada=0;// reset;
      
      for(j=0;j<c.length;j++) {
        
        if(a[i][0]==c[j][0] ) { // vendor_id
          if(a[i][2]==c[j][2] ) { // item_id
            if(a[i][3]==c[j][3] ) { // item_name
              c[j][4]+=a[i][4];// add qty
              c[j][5]+=a[i][5];// add amount
              ada=1;
            }
          }
        }
        
      }
      if(ada==0){// new 
        c.push([
          a[i][0], // 0-vendor_id
          a[i][1], // 1-vendor_name
          a[i][2], // 2-item_id
          a[i][3], // 3-item_name
          a[i][4], // 4-quantity
          a[i][5]  // 5-amount
        ]);
      }
    }
    
    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: c
    });
    
    return callback();
  }

  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getReceive(()=>{
      getPayment(()=>{
        getVendorCredit(()=>{
          getJoinArray(()=>{
            getSumArray(()=>{
              RptItemPurchased.display(indek);
            });
          });
        });
      });
    });
  });
};

RptItemPurchased.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptItemPurchased.proses(indek); });
  toolbar.filter(indek,()=>{ RptItemPurchased.filter(indek); });
  toolbar.print(indek,()=>{ RptItemPurchased.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  // width
  var W=[
    90, // vendor_id
    90, // item_id
    200, // description
    90, // qty
    100,// amount
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
          +s.setTitle( RptItemPurchased.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Vendor ID')
          +s.setHeader(L[1], W[1], "left", 'Item ID')
          +s.setHeader(L[2], W[2], "left", 'Description')
          +s.setHeader(L[3], W[3], "center", 'Quantity')
          +s.setHeader(L[4], W[4], "center", 'Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var amount=0;
      var total_qty=0;
      var sub_total=0;
      var sub_total_qty=0;
      var vendor_id='';

      for(i=0;i<h2.length;i++){
        
        if(i==0){
          vendor_id=h2[i].vendor_id;
          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].vendor_id );
        }
        
        if(vendor_id==h2[i].vendor_id){
          // sama
        }else{
          html+=''
            +s.setSubTotal(L[3], W[3], "right", ribuan(sub_total_qty) )
            +s.setSubTotal(L[4], W[4], "right", ribuan(sub_total) )
            +'<br>'
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].vendor_id );
          
          sub_total=0;
          sub_total_qty=0;
        }
                
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].item_id )
          +s.setLabel(L[2], W[2], "left", h2[i].item_name )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].quantity) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].amount) )
        html+='<br>';
        
        
        total_qty+=Number(h2[i].quantity);
        amount+=Number(h2[i].amount);
        
        
        sub_total+=Number(h2[i].amount);
        sub_total_qty+=Number(h2[i].quantity);
        
        vendor_id=h2[i].vendor_id;
      }
      html+=''
        +s.setSubTotal(L[3], W[3], "right", ribuan(sub_total_qty) )
        +s.setSubTotal(L[4], W[4], "right", ribuan(sub_total) )
        +'<br>'
        +s.setTotalA(L[3], W[3], "right", ribuan0( total_qty ) )
        +s.setTotalA(L[4], W[4], "right", ribuan0( amount ) )
        +'<br>'
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( a.vendor_id === b.vendor_id ){
      return 0;
    }
    else{
      if( a.vendor_id < b.vendor_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptItemPurchased.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptItemPurchased.preview(indek); });
  toolbar.preview(indek,()=>{ RptItemPurchased.filterExecute(indek); });
  RptItemPurchased.formFilter(indek);
};

RptItemPurchased.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
      +'<ul>'    
        +'<li><label>Period</label>'
          +'<input type="text" id="period_id_'+indek+'" size="17">'
          +'<button type="button" '
          +' id="btn_period_'+indek+'" '
          +' onclick="LookTable.period.getPaging(\''+indek+'\''
          +',\'period_id_'+indek+'\')"'
          +' class="btn_find"></button>'
        +'</li>'
        +'<li><label>From</label>'
          +'<input type="date" id="from_'+indek+'">'
        +'</li>'
        +'<li><label>To</label>'
          +'<input type="date" id="to_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<label>Vendor ID:</label>'
          +'<input type="text" '
            +' id="vendor_id_'+indek+'" '
            +' size="17"'
            +' onchange="LookTable.getVendor(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_account_'+indek+'" '
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

RptItemPurchased.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptItemPurchased.preview(indek);
};

RptItemPurchased.print=(indek)=>{
  
};

// eof:515;472;
