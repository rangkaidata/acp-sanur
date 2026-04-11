/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 */

'use strict';

var RptVendorManagement={}
  
RptVendorManagement.table_name='rpt_vendor_management';
RptVendorManagement.title='Vendor Management Detail';
RptVendorManagement.period=new PeriodLook(RptVendorManagement);

RptVendorManagement.show=(tiket)=>{
  tiket.modul=RptVendorManagement.table_name;
  tiket.menu.name=RptVendorManagement.title;
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
  } else {  
    RptVendorManagement.display(indek);
  };
};

RptVendorManagement.proses=(indek)=>{
  
  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
    
  content.html(indek,html);
  
  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      d=JSON.parse(h);
      if(d.rows.length>0){
        if(bingkai[indek].rpt.filter.from==""){
          var d=objectMany(d.fields,d.rows);
          bingkai[indek].rpt.filter.from=d[0].start_date;
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
        }
      }
      return callback();
    });
  }
  
  function getReceiveInventory(callback){
    var sql="SELECT vendor_id,vendor_name AS name"
      +" FROM receive_inventory"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receive_inventory=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.receive_inventory).rows;
    var f=["vendor_id","name"];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //vendor_id
        a[i][1], //name
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getReceiveInventory(()=>{
      getJoinArray(()=>{
        RptVendorManagement.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
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
    90, // vendor_id
    90, // name
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
    +'<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
    
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptVendorManagement.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Vendor ID')
            +s.setHeader(L[1], W[1], "left", 'Vendor Name')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].vendor_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
        html+='<br>';
      }
      html+=''
        +'<br>';
        
      html+='</div>'
// end-detail

    html+='</div>'
  +'</div>';
  content.html(indek,html);

  var cv=document.getElementById("cv_"+indek);
  var ctx=cv.getContext("2d");

  for(i=1;i<L.length;i++){
    ctx.beginPath();
    ctx.moveTo(L[i],0);
    ctx.lineTo(L[i],45);
    ctx.strokeStyle="grey";
    ctx.stroke();
  }
  
  ctx.beginPath();
  ctx.rect(0,0,L[L.length-1],25); // x,y,width,height
  ctx.strokeStyle="grey";
  ctx.stroke();

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
    +'<ul>'
    
      +'<li><label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
        +' id="btn_period_'+indek+'" '
        +' onclick="RptCheckRegister.period.getPaging(\''+indek+'\''
        +',\'period_id_'+indek+'\')"'
        +' class="btn_find"></button>'

        +'</li>'
    
      +'<li><label>From</label>'
        +'<input type="date" id="from_'+indek+'">'
        +'</li>'
        
      +'<li><label>To</label>'
        +'<input type="date" id="to_'+indek+'">'
        +'</li>'
        
      +'<li><label>Vendor ID</label>'
        +'<input type="text" id="vendor_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('vendor_id_'+indek, bingkai[indek].rpt.filter.vendor_id ); 
};

RptVendorManagement.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptVendorManagement.getPeriod(indek);
};

RptVendorManagement.getPeriod=(indek)=>{
  RptVendorManagement.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptVendorManagement.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptVendorManagement.preview(indek);
};

RptVendorManagement.print=(indek)=>{};



//eof: 292;
