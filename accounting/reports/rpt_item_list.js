/*
 * name: budiono;
 * date: may-09, 16:03, fri-2025; new report;
 */

'use strict';

var RptItemList={}
  
RptItemList.table_name='rpt_item_list';
RptItemList.title='Item List';

RptItemList.show=(tiket)=>{
  tiket.modul=RptItemList.table_name;
  tiket.menu.name=RptItemList.title;
  tiket.rpt={
    "filter":{
      "period":"",
      "date":"",
      "item_id": "",
    },
    refresh:false,
    
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
      
    RptItemList.preview(indek);
  }else{
    show(baru);
  }
}

RptItemList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptItemList.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptItemList.display(indek);
  };
}

RptItemList.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var date=bingkai[indek].rpt.filter.date;
  var item_id=bingkai[indek].rpt.filter.item_id;  
  
  function getItems(callback){
    var sql="SELECT item_id,name,class,inactive,type"
      +" FROM items"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.items=h;
      return callback();
    });    
  }
  
  function getQtyonHand(callback){
    var sql="SELECT item_id,location_id,quantity"
      +" FROM item_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.qty_on_hand=h;
      return callback();
    });    
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    date=bingkai[indek].rpt.filter.date;

    getItems(()=>{
      getQtyonHand(()=>{
        RptItemList.display(indek);
      });
    });
  });
}

RptItemList.display=(indek)=>{
  toolbar.refresh(indek,()=>{ RptItemList.proses(indek); });
  toolbar.filter(indek,()=>{ RptItemList.filter(indek); });
  toolbar.print(indek,()=>{ RptItemList.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.items );
  var d2=JSON.parse( bingkai[indek].rpt.qty_on_hand );
  var onhand=objectMany(d2.fields,d2.rows);
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    110, // item_id
    200, // item_name
    90, // class
    90, // Active
    90, // Type
    90  // On Hand
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
          +s.setTitle( RptItemList.title )
          +s.setNone()
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height="25" class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Item ID')
          +s.setHeader(L[1], W[1], "left", 'Item Name')
          +s.setHeader(L[2], W[2], "left", 'Item Class')
          +s.setHeader(L[3], W[3], "left", 'Active')
          +s.setHeader(L[4], W[4], "left", 'Item Type')
          +s.setHeader(L[5], W[5], "right", 'Qty on Hand')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e
      
      var qty_on_hand=0;
      
      var h2=h.sort( sortByID );
      var i,j;

      for(i=0;i<h2.length;i++){
        qty_on_hand=0;
        for(j=0;j<onhand.length;j++){
          if(onhand[j].item_id==h2[i].item_id){
            qty_on_hand+=Number(onhand[j].quantity);
          }
        }
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].item_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "left", default_item_class[h2[i].class] )
          +s.setLabel(L[3], W[3], "left", array_inactive[h2[i].inactive] )
          +s.setLabel(L[4], W[4], "left", h2[i].type )
          +s.setLabel(L[5], W[5], "right", ribuan(qty_on_hand) )
          
          +'<br>';
      }
      html+='<i>~end of line~<i>'
      html+='</div>'
      // end-detail
    +'</div>'
  +'</div>'  
  content.html(indek,html);
  
  renderLine(indek,L);
  
  
  function sortByID(a,b){ // sort multidimensi;
    
    if(a.item_id.toLowerCase() === b.item_id.toLowerCase()){
      return 0;
    }
    else{
      if(a.item_id.toLowerCase() < b.item_id.toLowerCase()) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptItemList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptItemList.preview(indek); });
  RptItemList.formFilter(indek);
}

RptItemList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>No Filter</label></li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
}

RptItemList.print=(indek)=>{
  
}
