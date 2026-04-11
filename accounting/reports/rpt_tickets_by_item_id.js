/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 */

'use strict';

var RptTicketsbyItemID={}
  
RptTicketsbyItemID.table_name='rpt_tickets_by_item_id';
RptTicketsbyItemID.title='Tickets by Item ID';
RptTicketsbyItemID.period=new PeriodLook(RptTicketsbyItemID);

RptTicketsbyItemID.show=(tiket)=>{
  tiket.modul=RptTicketsbyItemID.table_name;
  tiket.menu.name=RptTicketsbyItemID.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":""
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptTicketsbyItemID.preview(indek);
  }else{
    show(baru);
  }
}

RptTicketsbyItemID.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptTicketsbyItemID.proses(indek);
  } else {  
    RptTicketsbyItemID.display(indek);
  };
};

RptTicketsbyItemID.proses=(indek)=>{
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
    var sql="SELECT daily_detail,weekly_detail"
      +",ticket_no,date,record_id"
      +" FROM time_tickets"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){
    var sql="SELECT item_id,item_name"
      +",ticket_no,date,record_id,billing_amount"
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
      "item_id",
      "description",
      "ticket_no",
      "date",
      "recorded_by",
      "unit_duration",
      "billing_amount"
    ];
    var i=0;
    var r=[];
    var d;
    
    // time_ticket - daily_detail;
    for(i=0;i<a.length;i++){
      d=JSON.parse(a[i][0]);
      
      r.push([
        d.item_id,        // item_id
        d.item_name,      // description
        a[i][2],          // ticket_no
        a[i][3],          // ticket_date
        a[i][4],          // recorded_by
        d.unit_duration,  // unit_duration
        d.billing_amount, // billing_amount
      ]);
    }

    // expense_ticket;
    for(i=0;i<b.length;i++){
      r.push([
        b[0][0], // item_id
        b[0][1], // description
        b[i][2], // ticket_no
        b[i][3], // ticket_date
        b[i][4], // recorded_by
        0,       // unit_duration
        b[i][5], // billing_amount
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
          RptTicketsbyItemID.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptTicketsbyItemID.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptTicketsbyItemID.proses(indek); });
  toolbar.filter(indek,()=>{ RptTicketsbyItemID.filter(indek); });
  toolbar.print(indek,()=>{ RptTicketsbyItemID.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    160, // 0-item_id
    80, // 2-ticket_number
    90, // 3-ticket_date
    110, // 4-recorded_by
    90, // 5-unit_duration
    110, // 6-billing_amount
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
          +s.setTitle( RptTicketsbyItemID.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Item ID')
            +s.setHeader(L[1], W[1], "left", 'Ticket No.')
            +s.setHeader(L[2], W[2], "left", 'Date')
            +s.setHeader(L[3], W[3], "left", 'Recorded by')
            +s.setHeader(L[4], W[4], "right", 'Unit Duration')
            +s.setHeader(L[5], W[5], "right", 'Billing Amount')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var item_id;
      var tot=0,sub_tot=0;
      var X=300

      for(i=0;i<h2.length;i++){

        if(item_id!=h2[i].item_id){
          if(i>0){
            html+=''
              +s.setSubTotal(L[5], W[5], "right", ribuan(sub_tot) )
              +'<br>'
            sub_tot=0;
          };
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].description )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].item_id )
        };

        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].ticket_no )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].date) )
          +s.setLabel(L[3], W[3], "left", h2[i].recorded_by )
          +s.setLabel(L[4], W[4], "right", h2[i].unit_duration )
          +s.setLabel(L[5], W[5], "right", h2[i].billing_amount )

        html+='<br>';
        item_id=h2[i].item_id;
        sub_tot+=Number(h2[i].billing_amount);
        tot+=Number(h2[i].billing_amount);
      }
      html+=''
        +s.setSubTotal(L[5], W[5], "right", ribuan(sub_tot) )
        +'<br>'
        +s.setTotalA(L[5], W[5], "right", ribuan(tot) )
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
    if( String(a.item_id).concat(a.ticket_no) === String(b.item_id).concat(b.ticket_no) ){
      return 0;
    }
    else{
      if( String(a.item_id).concat(a.ticket_no) < String(b.item_id).concat(b.ticket_no) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptTicketsbyItemID.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptTicketsbyItemID.preview(indek); });
  toolbar.preview(indek,()=>{ RptTicketsbyItemID.filterExecute(indek); });
  RptTicketsbyItemID.formFilter(indek);
};

RptTicketsbyItemID.formFilter=(indek)=>{
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

RptTicketsbyItemID.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptTicketsbyItemID.getPeriod(indek);
};

RptTicketsbyItemID.getPeriod=(indek)=>{
  RptTicketsbyItemID.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptTicketsbyItemID.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek)
  }
  bingkai[indek].rpt.refresh=false;
  RptTicketsbyItemID.preview(indek);
};

RptTicketsbyItemID.print=(indek)=>{};



//eof: 292;
