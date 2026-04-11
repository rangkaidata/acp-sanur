/*
 * name: budiono;
 * date: jul-19, 16:21, sat-2025; #64; rpt
 */

'use strict';

var RptTimeTicketRegister={}
  
RptTimeTicketRegister.table_name='rpt_time_ticket_register';
RptTimeTicketRegister.title='Time Ticket Register';
RptTimeTicketRegister.period=new PeriodLook(RptTimeTicketRegister);

RptTimeTicketRegister.show=(tiket)=>{
  tiket.modul=RptTimeTicketRegister.table_name;
  tiket.menu.name=RptTimeTicketRegister.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptTimeTicketRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptTimeTicketRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptTimeTicketRegister.proses(indek);
  } else {  
    RptTimeTicketRegister.display(indek);
  };
};

RptTimeTicketRegister.proses=(indek)=>{
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
    var sql="SELECT ticket_no,"
      +" date,"
      +" record_id,"
      +" daily_detail"
      +" FROM time_tickets"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=[
      "ticket_no",
      "date",
      "recorded_by",
      "item_id",
      "customer_id",
      "billing_status",
      "billing_amount"
    ];
    var i=0;
    var r=[];
    var d;
    
    for(i=0;i<a.length;i++){
      
      d=JSON.parse(a[i][3]);
      
      r.push([
        a[i][0],          // 0-ticket_no
        a[i][1],          // 1-date
        a[i][2],          // 2-record_id
        d.item_id,        // 3-item_id
        d.customer_id,    // 4-customer_id
        d.billing_status, // 5-billing_status
        d.billing_amount, // 6-billing_amount
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
      getJoinArray(()=>{
        RptTimeTicketRegister.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptTimeTicketRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptTimeTicketRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptTimeTicketRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptTimeTicketRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    80, // ticket_no
    85, // date
    100, // recorded
    120, // item ID
    100, // customer_id
    90, // billing_status
    110, // billing_amount
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
          +s.setTitle( RptTimeTicketRegister.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Ticket No.')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Recorded by')
            +s.setHeader(L[3], W[3], "left", 'Item ID')
            +s.setHeader(L[4], W[4], "left", 'Customer ID')
            +s.setHeader(L[5], W[5], "left", 'Billing Status')
            +s.setHeader(L[6], W[6], "left", 'Billing Amount')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].ticket_no )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].recorded_by )
          +s.setLabel(L[3], W[3], "left", h2[i].item_id )
          +s.setLabel(L[4], W[4], "left", h2[i].customer_id )
          +s.setLabel(L[5], W[5], "left", array_billing_status[h2[i].billing_status] )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].billing_amount) )
          
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
    if( String(a.date).concat(a.ticket_no) === String(b.date).concat(b.ticket_no) ){
      return 0;
    }
    else{
      if( String(a.date).concat(a.ticket_no) < String(b.date).concat(b.ticket_no) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptTimeTicketRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptTimeTicketRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptTimeTicketRegister.filterExecute(indek); });
  RptTimeTicketRegister.formFilter(indek);
};

RptTimeTicketRegister.formFilter=(indek)=>{
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

    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
};

RptTimeTicketRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptTimeTicketRegister.getPeriod(indek);
};

RptTimeTicketRegister.getPeriod=(indek)=>{
  RptTimeTicketRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptTimeTicketRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptTimeTicketRegister.preview(indek);
};

RptTimeTicketRegister.print=(indek)=>{};



//eof: 327;
