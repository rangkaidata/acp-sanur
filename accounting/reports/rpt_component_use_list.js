/*
 * name: budiono;
 * date: may-14, 10:45, wed-2025; #45; reports;
 * edit: dec-29, 21:01, mon-2025; #86; 
 */ 

'use strict';

var RptComponentUseList={}
  
RptComponentUseList.table_name='rpt_component_use_list';
RptComponentUseList.title='Component Use List';

RptComponentUseList.show=(tiket)=>{
  tiket.modul=RptComponentUseList.table_name;
  tiket.menu.name=RptComponentUseList.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "date":"",
      "item_id": "",
      "item_name": "",
    },
    "refresh": false,
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptComponentUseList.preview(indek);
  }else{
    show(baru);
  }
}

RptComponentUseList.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptComponentUseList.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptComponentUseList.display(indek);
  };
}

RptComponentUseList.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var date=bingkai[indek].rpt.filter.date;
  var item_id=bingkai[indek].rpt.filter.item_id;
    
  function getComponenUseList(callback){
    const sql="SELECT item_id,item_name,detail"
      +" FROM boms"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.component_use_list=h;
      return callback();
    });
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    date=bingkai[indek].rpt.filter.date;

    getComponenUseList(()=>{
      RptComponentUseList.display(indek);
    });
  });
}

RptComponentUseList.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptComponentUseList.proses(indek); });
  toolbar.filter(indek,()=>{ RptComponentUseList.filter(indek); });
  toolbar.print(indek,()=>{ RptComponentUseList.print(indek); });

  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.component_use_list );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    200, // 0-item
    200, // 1-component
    90, // 2-qty required
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
          +s.setTitle( RptAssemblyList.title )
          +s.setNone()
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Item ID')
          +s.setHeader(L[1], W[1], "left", 'Component ID')
          +s.setHeader(L[2], W[2], "right", 'Qty Required')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      let h2=h.sort( sortByID );
      let c;

      for(var i=0;i<h2.length;i++){
        c=JSON.parse(h2[i].detail);
        for(var j=0;j<c.length;j++){
          html+=''
            +s.setLabel(L[0],W[0],  "left", c[j].item_id )
            +s.setLabel(L[1],W[1],  "left", h2[i].item_id )
            +s.setLabel(L[2],W[2],  "center", ribuan(c[j].qty_needed) )
            +'<br>'
            +s.setLabel(L[0],W[0],  "left", c[j].item_name )
            +s.setLabel(L[1],W[1],  "left", h2[i].item_name )
          html+='<br>';
        };
      }
      html+='<br>'
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( a.item_id.toLowerCase() === b.item_id.toLowerCase() ){
      return 0;
    }
    else{
      if( a.item_id.toLowerCase() < b.item_id.toLowerCase() ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptComponentUseList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptComponentUseList.preview(indek); });
  RptComponentUseList.formFilter(indek);
}

RptComponentUseList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>No Filter</label></li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
}



// eof: 163;178;
