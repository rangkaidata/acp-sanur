/*
 * name: budiono;
 * date: may-20, 07:51, tue-2025; #55;
 */

'use strict';

var RptReorderWorksheet={}
  
RptReorderWorksheet.table_name='rpt_inventory_reorder_worksheet';
RptReorderWorksheet.title='Inventory Reorder Worksheet';

RptReorderWorksheet.show=(tiket)=>{
  tiket.modul=RptReorderWorksheet.table_name;
  tiket.menu.name=RptReorderWorksheet.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "date": "",
      "item_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptReorderWorksheet.preview(indek);
  }else{
    show(baru);
  }
}

RptReorderWorksheet.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptReorderWorksheet.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptReorderWorksheet.display(indek);
  };  
};

RptReorderWorksheet.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var date=bingkai[indek].rpt.filter.date;
  var item_id=bingkai[indek].rpt.filter.item_id;
  
  function getItems(callback){
    var item_id=bingkai[indek].rpt.filter.item_id || "" ;
    var sql="SELECT item_id,vendor_id,minimum_stock,"
      +"reorder_quantity,name"
      +" FROM items"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cost_method>=0"
    if(item_id!=""){
      sql+=" AND item_id='"+item_id+"'";
    }
    
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.items=h;
      return callback();
    });
  }
  
  function getItemCosting(callback){
    var date=bingkai[indek].rpt.filter.date;
    var item_id=bingkai[indek].rpt.filter.item_id || "" ;
    var sql="SELECT item_id,SUM(quantity) AS quantity"
      +" FROM item_costing"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <='"+date+"'"
    if(item_id!=""){
      sql+=" AND item_id='"+item_id+"'";
    }
    sql+=" GROUP BY item_id";
    
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.item_costing=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.items).rows;
    var b=JSON.parse(bingkai[indek].rpt.item_costing).rows;
    var n=[];
    var on_hand=0;
    
    for(var i=0;i<a.length;i++){
      on_hand=0;
      for(var j=0;j<b.length;j++){
        if( a[i][0]==b[j][0] ){
          on_hand=Number(b[j][1]);
        }
      }
      
      if(on_hand <= Number(a[i][2]) ){// min_stock vs on_hand
        // alert(a[i][0]+' -> '+on_hand +' vs '+ a[i][2])
        n.push([
          a[i][0], // 0-item_id
          a[i][1], // 1-vendor_id
          a[i][2], // 2-minimum_stock
          a[i][3],// 3-reorder_qty
          on_hand,// 4-qty_on_hand
          0,// 5-qty_on_order
          0,// 6-qty_on_backorder
          a[i][4], // item_name 
        ])
      };
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: ["item_id","vendor_id","min_stock","reorder_qty",
        "qty_on_hand","qty_on_order","qty_on_bo","item_name"],
      rows: n
    })
    
    return callback();
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    date=bingkai[indek].rpt.filter.date;

    getItems(()=>{
      getItemCosting(()=>{
        getJoinArray(()=>{
          RptReorderWorksheet.display(indek);
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptReorderWorksheet.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptReorderWorksheet.proses(indek); });
  toolbar.filter(indek,()=>{ RptReorderWorksheet.filter(indek); });
  toolbar.print(indek,()=>{ RptReorderWorksheet.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var html=''
    

//    +'<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
//    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
    
//      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
//        +'<div style="width:100%;background:white;display:block;">'
  var i=0;  
  var W=[
    120, // 0-item id
    120, // 1-vendor id
    90, // 2-qty on order 
    90, // 3-back order
    90, // 4-min stock
    90, // 5-reorder qty
    90, // 6-qty order
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
          +s.setTitle( RptReorderWorksheet.title )
          +s.setAsof( filter.date )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=50 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0],W[0], "left", 'Item ID')
          +s.setHeader(L[1],W[1], "left", 'Vendor ID')
          +'<br>'
          +s.setHeader(L[0],X, "left", 'Description')
          +s.setHeader(L[1],W[1], "right", 'Qty on Hand')
          +s.setHeader(L[2],W[2], "left", 'Qty on Order')
          +s.setHeader(L[3],W[3], "center", 'Back Order')
          +s.setHeader(L[4],W[4], "center", 'Min Stock')
          +s.setHeader(L[5],W[5], "center", 'Reorder Qty')
          +s.setHeader(L[6],W[6], "center", 'Qty to Order')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail-dua">';//e

      var h2=h.sort( sortByID );

      for(var i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0],W[0], "left", h2[i].item_id )
          +s.setLabel(L[1],W[1], "left", h2[i].vendor_id )
          +'<br>'
          +s.setLabel(L[0],X, "left", h2[i].item_name )
          +s.setLabel(L[1],W[1], "right", ribuan(h2[i].qty_on_hand) )
          +s.setLabel(L[2],W[2], "right", ribuan(h2[i].qty_on_order) )
          +s.setLabel(L[3],W[3], "right", ribuan(h2[i].qty_on_bo) )
          +s.setLabel(L[4],W[4], "right", ribuan(h2[i].min_stock) )
          +s.setLabel(L[5],W[5], "right", ribuan(h2[i].reorder_qty) )
          +s.setLabel(L[6],W[6], "left", "_________" )
        html+='<br><br>';

      }
      html+=''
        +'<br>'
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine2(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( a.item_id === b.item_id ){
      return 0;
    }
    else{
      if( a.item_id < b.item_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptReorderWorksheet.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptReorderWorksheet.preview(indek); });
  toolbar.preview(indek,()=>{ RptReorderWorksheet.filterExecute(indek); });
  RptReorderWorksheet.formFilter(indek);
};

RptReorderWorksheet.formFilter=(indek)=>{
  var html='<div>'
  +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Item ID</label>'
        +'<input type="text" id="item_id_'+indek+'">'
      +'</li>'
    +'</ul>'
  +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('item_id_'+indek, bingkai[indek].rpt.filter.item_id ); 
};

RptReorderWorksheet.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "item_id": getEV("item_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptReorderWorksheet.preview(indek);
};

RptReorderWorksheet.print=(indek)=>{

};



// eof:231;
