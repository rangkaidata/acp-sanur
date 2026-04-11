/*
 * name: budiono;
 * date: may-10, 08:12, sat-2025; #report;
 * edit: dec-29, 14:56, mon-2025; #report-std;
 */

'use strict';

var RptAssemblyList={}
  
RptAssemblyList.table_name='rpt_assembly_list';
RptAssemblyList.title='Assembly List';

RptAssemblyList.show=(tiket)=>{
  tiket.modul=RptAssemblyList.table_name;
  tiket.menu.name=RptAssemblyList.title;
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
      
    RptAssemblyList.preview(indek);
  }else{
    show(baru);
  }
}

RptAssemblyList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });

  if(bingkai[indek].rpt.refresh==false){
    RptAssemblyList.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptAssemblyList.display(indek);
  };
}

RptAssemblyList.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var date=bingkai[indek].rpt.filter.date;
  var item_id=bingkai[indek].rpt.filter.item_id;
  
  function getBoms(callback){
    var sql="SELECT item_id,item_name,detail"
      +" FROM boms"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.boms=h;
      return callback();
    });
  }

  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    date=bingkai[indek].rpt.filter.date;

    getBoms(()=>{
      RptAssemblyList.display(indek);
    });
  });
}

RptAssemblyList.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptAssemblyList.proses(indek); });
  toolbar.filter(indek,()=>{ RptAssemblyList.filter(indek); });
  toolbar.print(indek,()=>{ RptAssemblyList.print(indek); });

  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.boms );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    200, // 0-item description
    130, // 2-component id
    200, // 3-component name
    90, // 4-qty needed
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
          +s.setHeader(L[2], W[2], "left", 'Componen Description')
          +s.setHeader(L[3], W[3], "right", 'Qty Needed')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e
      
      var h2=h.sort( sortByID );
      var dt;
      for(var i=0;i<h2.length;i++){
        
        dt=JSON.parse(h2[i].detail);
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].item_id
            +'<br>'+h2[i].item_name
           )          
          //+s.setLabel(L[1], W[1], "left", h2[i].item_name )
        
        for(var j=0;j<dt.length;j++){
          html+=''
            +s.setLabel(L[1], W[1], "left", dt[j].item_id )          
            +s.setLabel(L[2], W[2], "left", dt[j].item_name )
            +s.setLabel(L[3], W[3], "right", dt[j].qty_needed )
            +'<br>';
        } 
        html+='<br>';
      }
      html+=''
      html+='</div>'
    +'</div>'
  +'</div>'  
  content.html(indek,html);
  
  renderLine(indek,L);
    
  function sortByID(a,b){ // sort multidimensi;
    if(a.item_id === b.item_id){
      return 0;
    }
    else{
      if( a.item_id < b.item_id) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
  
}

RptAssemblyList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptAssemblyList.preview(indek); });
  RptAssemblyList.formFilter(indek);
}

RptAssemblyList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>No Filter</label></li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
}

RptAssemblyList.print=(indek)=>{
  
}


// eof: 153;
