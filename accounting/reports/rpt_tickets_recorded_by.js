/*
 * name: budiono;
 * date: jul-20, 20:48, sun-2025; #64; 
 */

'use strict';

var RptTicketsRecordedBy={}
  
RptTicketsRecordedBy.table_name='rpt_tickets_recorded_by';
RptTicketsRecordedBy.title='Tickets Recorded By';
RptTicketsRecordedBy.period=new PeriodLook(RptTicketsRecordedBy);

RptTicketsRecordedBy.show=(tiket)=>{
  tiket.modul=RptTicketsRecordedBy.table_name;
  tiket.menu.name=RptTicketsRecordedBy.title;
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

    RptTicketsRecordedBy.preview(indek);
  }else{
    show(baru);
  }
}

RptTicketsRecordedBy.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptTicketsRecordedBy.proses(indek);
  } else {  
    RptTicketsRecordedBy.display(indek);
  };
};

RptTicketsRecordedBy.proses=(indek)=>{
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  
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
          from=d[0].start_date;
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
          to=tglSekarang();
        }
      }
      return callback();
    });
  }

  function getA(callback){
    var sql="SELECT record_id,record_name"
      +",record_mode,ticket_no,date"
      +",type,daily_detail,weekly_detail"
      +" FROM time_tickets"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){
    var sql="SELECT record_id"
      +",record_name"
      +",record_mode"
      +",ticket_no"
      +",date"
      +",item_id"
      +",billing_amount"
      +" FROM expense_tickets"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var f=[
      "record_id",
      "name",
      "record_mode",
      "ticket_no",
      "date",
      "type",
      "item_id",
      "billing_amount"
    ];
    var i=0;
    var r=[];
    var d;
    
    // time_tickets - daily_detail;

    for(i=0;i<a.length;i++){
      d=JSON.parse(a[i][6])
      r.push([
        a[i][0], //0-record_id
        a[i][1], //1-name
        a[i][2], //2-record_mode
        a[i][3], //3-ticket_no
        a[i][4], //4-date
        "Time", //5-ticket_type
        d.item_id, //6-item_id
        d.billing_amount, //7-billing_amount
      ]);
    }
    
    // expense_tickets
    for(i=0;i<b.length;i++){
      r.push([
        b[i][0],   //0-record_id
        b[i][1],   //1-name
        b[i][2],   //2-record_mode
        b[i][3],   //3-ticket_no
        b[i][4],   //4-date
        "Expense", //5-ticket_type
        b[i][5],   //6-item_id
        b[i][6],   //7-billing_amount
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getA(()=>{
      getB(()=>{
        getJoinArray(()=>{
          RptTicketsRecordedBy.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptTicketsRecordedBy.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptTicketsRecordedBy.proses(indek); });
  toolbar.filter(indek,()=>{ RptTicketsRecordedBy.filter(indek); });
  toolbar.print(indek,()=>{ RptTicketsRecordedBy.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    130, // record_id
    90, // ticket_no
    80, // date
    80, // ticket_type
    150, // item_id
    100, // billing_amount
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
          +s.setTitle( RptTicketsRecordedBy.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Record ID')
            +s.setHeader(L[1], W[1], "left", 'Ticket No.')
            +s.setHeader(L[2], W[2], "left", 'Ticket Date')
            +s.setHeader(L[3], W[3], "left", 'Ticket Type')
            +s.setHeader(L[4], W[4], "left", 'Item ID')
            +s.setHeader(L[5], W[5], "right", 'Billing Amount')
            
            +'<br>'
        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var record_id;
      var X=300

      for(i=0;i<h2.length;i++){
        if(record_id!=h2[i].record_id){
          if(i>0){
            html+=''
              +'<br>';
          }
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].name+' - ['+array_record_by[h2[i].record_mode]+']' )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].record_id )
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].ticket_no )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].date) )
          +s.setLabel(L[3], W[3], "left", h2[i].type )
          +s.setLabel(L[4], W[4], "left", h2[i].item_id )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].billing_amount) )
          
        html+='<br>';
        record_id=h2[i].record_id;
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
    if( String(a.record_id).concat(a.date,a.ticket_no) === String(b.record_id).concat(b.date,b.ticket_no) ){
      return 0;
    }
    else{
      if( String(a.record_id).concat(a.date,a.ticket_no) < String(b.record_id).concat(b.date,b.ticket_no) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptTicketsRecordedBy.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptTicketsRecordedBy.preview(indek); });
  toolbar.preview(indek,()=>{ RptTicketsRecordedBy.filterExecute(indek); });
  RptTicketsRecordedBy.formFilter(indek);
};

RptTicketsRecordedBy.formFilter=(indek)=>{
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

RptTicketsRecordedBy.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptTicketsRecordedBy.getPeriod(indek);
};

RptTicketsRecordedBy.getPeriod=(indek)=>{
  RptTicketsRecordedBy.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptTicketsRecordedBy.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptTicketsRecordedBy.preview(indek);
};

RptTicketsRecordedBy.print=(indek)=>{};



// eof: 378;
