/*
 * name: budiono;
 * date: may-16, 16:22, fri-2025; new report;
 * edit: dec-29, 16:17, mon-2025; #86; report-std;
 */

'use strict';

var RptBuyerReport={}
  
RptBuyerReport.table_name='rpt_buyer_report';
RptBuyerReport.title='Buyer Report';

RptBuyerReport.show=(tiket)=>{
  tiket.modul=RptBuyerReport.table_name;
  tiket.menu.name=RptBuyerReport.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "date":"",
      "item_id": "",
      "item_name": "",
    },
    "refresh":false,
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
      
    RptBuyerReport.preview(indek);
  }else{
    show(baru);
  }
}

RptBuyerReport.preview=(indek)=>{

  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });

  if(bingkai[indek].rpt.refresh==false){
    RptBuyerReport.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptBuyerReport.display(indek);
  };
}

RptBuyerReport.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var date=bingkai[indek].rpt.filter.date;
  var item_id=bingkai[indek].rpt.filter.item_id;
  
  function getItems(callback){
    var sql="SELECT item_id,name,vendor_id,vendor_name,buyer_id"
      +" FROM items"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.items=h;
      return callback();
    });    
  }
    
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    date=bingkai[indek].rpt.filter.date;

    getItems(()=>{
      RptBuyerReport.display(indek);
    });
  });
}

RptBuyerReport.display=(indek)=>{
  toolbar.refresh(indek,()=>{ RptBuyerReport.proses(indek); });
  toolbar.filter(indek,()=>{ RptBuyerReport.filter(indek); });
  toolbar.print(indek,()=>{ RptBuyerReport.print(indek); });

  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.items );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    150, // 0-item id
    220, // 1-item name
    100, // 2-buyer id
    100, // 3-vendor id
    150, // 3-vendor name
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

/*
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.items);
  var h=objectMany(d.fields,d.rows);
  
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'  
// page 1
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'
        
          +'<p style="text-align:center;font-size:20px;font-weight:bolder;border:0px solid grey;line-height:1;">'
            +company.rows[0][1]
            +'</p>'
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'+RptBuyerReport.title+'</p>'
          +'<p>&nbsp;</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'            
          +setTR(10)            
            +setTH(100, "left", 'Item ID')
            +setTH(250, "left", 'Item Description')
            +setTH(80, "left", 'Buyer ID')
            +setTH(80, "left", 'Vendor ID')
            +setTH(80, "left", 'Vendor Name')

            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
      //--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'
*/
  var html=''
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d
          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptBuyerReport.title )
          +s.setNone()
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Item ID')
          +s.setHeader(L[1], W[1], "left", 'Item Description')
          +s.setHeader(L[2], W[2], "left", 'Buyer ID')
          +s.setHeader(L[3], W[3], "left", 'Vendor ID')
          +s.setHeader(L[4], W[4], "left", 'Vendor Name')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e
      
      var h2=h.sort( sortByID );

      for(var i=0;i<h2.length;i++){        
        html+=''
          +setLabel(L[0], W[0], "left", h2[i].item_id )
          +setLabel(L[1], W[1], "left", h2[i].name )
          +setLabel(L[2], W[2], "left", h2[i].buyer_id )
          +setLabel(L[3], W[3], "left", h2[i].vendor_id )
          +setLabel(L[4], W[4], "left", h2[i].vendor_name )
          +'<br>';
      }
      html+='</div>'
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

RptBuyerReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptBuyerReport.preview(indek); });
  RptBuyerReport.formFilter(indek);
}

RptBuyerReport.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>No Filter</label></li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
}

RptBuyerReport.print=(indek)=>{
  
}
