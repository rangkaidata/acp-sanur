/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 * edit: dec-28, 20:17, sun-2025; #85; report-std;
 */
 
 /*
  * Report ini dibuat dengan sangat pelan-pelan, karena keren banget!!
  * PENUH PENGHAYATAN ... wkwk...
  * faktor yg bikin keren itu:
  * --------------------------------------------------------------------
  * 1 bukan diolah dgn database/sql, tapi dengan array loop javascript;
  * 2 menjadi beban client side, bukan beban server side;
  * 3 beban server side hanya ada saat pengambilan data utama (table);
  * 4 dgn begini beberapa table server bisa dihapus/dikurangi saja;
  * 5 langsung diolah dengan penggabungan rows array;
  * --------------------------------------------------------------------
  */ 

'use strict';

var RptVendorManagement={}
  
RptVendorManagement.table_name='rpt_vendor_management';
RptVendorManagement.title='Vendor Management Detail';

RptVendorManagement.show=(tiket)=>{
  tiket.modul=RptVendorManagement.table_name;
  tiket.menu.name=RptVendorManagement.title;
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

    RptVendorManagement.preview(indek);
  }else{
    show(baru);
  }
}

RptVendorManagement.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptVendorManagement.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptVendorManagement.display(indek);
  };
};

RptVendorManagement.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var vendor_id=bingkai[indek].rpt.filter.vendor_id;
  
  function getReceiveInventory(callback){
    var sql="SELECT vendor_id,vendor_name AS name"
      +",invoice_no,amount,date_due,discount_terms"
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
  
  function getPayments(callback){
    var sql="SELECT vendor_id,name"
      +",invoice_detail"
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
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.receive_inventory).rows;
    var p=JSON.parse(bingkai[indek].rpt.payments).rows;
    var f=["vendor_id","name","invoice_no","amount","date_due",
      "terms","status"];
    var i=0;
    var j=0;
    var k=0;
    var r=[];
    
    // array receive_inventory
    var terms;
    for(i=0;i<a.length;i++){
      terms=JSON.parse(a[i][5]).displayed;
      r.push([
        a[i][0],  //0-vendor_id
        a[i][1],  //1-name
        a[i][2],  //2-invoice_no
        a[i][3],  //3-amount
        a[i][4],  //4-date_due
        terms,    //5-terms
        "Unpaid", //6-status
      ]);
    }
    
    // array payments
    var d;
    var ada=0

    for(i=0;i<r.length;i++){
      ada=0;
      for(j=0;j<p.length;j++){
        
        if(r[i][0]==p[j][0]){  
          d=JSON.parse(p[j][2])// detail_payment
          for(k=0;k<d.length;k++){
            
            if( d[k].invoice_no==r[i][2] ){ //exist
              ada=1;
              r[i][3]-=Number(d[k].amount_paid+d[k].discount);
              r[i][6]="Partially Paid";
              if(r[i][3]==0){
                r[i][6]="Full paid";
              }
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

    getReceiveInventory(()=>{
      getPayments(()=>{
        getJoinArray(()=>{
          RptVendorManagement.display( indek );
        });
      });
    });
  });
};

RptVendorManagement.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptVendorManagement.proses(indek); });
  toolbar.filter(indek,()=>{ RptVendorManagement.filter(indek); });
  toolbar.print(indek,()=>{ RptVendorManagement.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // vendor_id
    100, // invoice_no
    100, // net to pay
    90,  // status
    90, // date_due
    130, // terms
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
          +s.setTitle( RptVendorManagement.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Vendor ID')
          +s.setHeader(L[1], W[1], "left", 'Invoice NO.')
          +s.setHeader(L[2], W[2], "left", 'Net to Pay')
          +s.setHeader(L[3], W[3], "left", 'Days to Pay')
          +s.setHeader(L[4], W[4], "left", 'Date Due')
          +s.setHeader(L[5], W[5], "left", 'Terms')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var vendor_id='';
      var X=300;
      var sub_total=0;
      var total=0;

      for(i=0;i<h2.length;i++){
        
        if(i==0){
          vendor_id=h2[i].vendor_id;
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].vendor_id )
        }
        
        if(vendor_id==h2[i].vendor_id){
          // same
        }else{
          html+=''
            //+'<br>'// sub_total;
            +s.setTotal(L[2], W[2], "right", ribuan(sub_total) )
            +'<br><br>'
            +s.setLabel(L[0], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].vendor_id )
          sub_total=0;
        }
        
        html+=''
          //+s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[1], W[1], "left", h2[i].invoice_no )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].amount) )
          +s.setLabel(L[3], W[3], "left", h2[i].status )
          +s.setLabel(L[4], W[4], "left", tglWest(h2[i].date_due) )
          +s.setLabel(L[5], W[5], "left", h2[i].terms )
        html+='<br>';
        
        vendor_id=h2[i].vendor_id;
        sub_total+=Number(h2[i].amount);
        total+=Number(h2[i].amount);
      }
      html+=''
        +s.setTotal(L[2], W[2], "right", ribuan(sub_total) )
        +'<br>'
        +s.setTotalA(L[2], W[2], "right", ribuan(total) )
        +'<br>';
        
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

RptVendorManagement.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptVendorManagement.preview(indek); });
  toolbar.preview(indek,()=>{ RptVendorManagement.filterExecute(indek); });
  RptVendorManagement.formFilter(indek);
};

RptVendorManagement.formFilter=(indek)=>{
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
        +'<input type="text" id="vendor_id_'+indek+'"'
          +' onchange="LookTable.getVendor(\''+indek+'\')">'
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

RptVendorManagement.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptVendorManagement.preview(indek);
};

RptVendorManagement.print=(indek)=>{};

// 380;364;
