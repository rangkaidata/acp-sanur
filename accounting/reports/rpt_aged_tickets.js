/*
 * name: budiono;
 * date: aug-09, 12:36, sat-2025; #66; 
 */

'use strict';

var RptAgedTickets={}
  
RptAgedTickets.table_name='rpt_aged_tickets';
RptAgedTickets.title='Aged Tickets';
RptAgedTickets.period=new PeriodLook(RptAgedTickets);

RptAgedTickets.show=(tiket)=>{
  tiket.modul=RptAgedTickets.table_name;
  tiket.menu.name=RptAgedTickets.title;
  tiket.rpt={
    "filter":{
      "date": tglSekarang(),
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptAgedTickets.preview(indek);
  }else{
    show(baru);
  }
}

RptAgedTickets.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptAgedTickets.proses(indek);
  } else {  
    RptAgedTickets.display(indek);
  };
};

RptAgedTickets.proses=(indek)=>{
  var date=bingkai[indek].rpt.filter.date;
  
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
      return callback();
    });
  }
  
  function getA(callback){
    var sql="SELECT customer_id,ticket_no,ticket_date,amount"
      +" FROM ticket_invoice_sum"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND invoice_no='' "// belum ada invoice
      +" AND ticket_date <= '"+date+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=["customer_id","ticket_no","ticket_date","amount"];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //customer_id
        a[i][1], //ticket_no
        a[i][2], //ticket_date
        a[i][3], //amount
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
        RptAgedTickets.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptAgedTickets.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptAgedTickets.proses(indek); });
  toolbar.filter(indek,()=>{ RptAgedTickets.filter(indek); });
  toolbar.print(indek,()=>{ RptAgedTickets.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    120, // customer_id
    90, // ticket_no
    90, // ticket_date
    110, // amount
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
          +s.setTitle( RptAgedTickets.title )
          +s.setAsof( filter.date )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Customer ID')
            +s.setHeader(L[1], W[1], "left", 'Ticket No.')
            +s.setHeader(L[2], W[2], "left", 'Ticket Date')
            +s.setHeader(L[3], W[3], "left", 'Billing Amount')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var customer_id='';
      var sub_total=0;

      for(i=0;i<h2.length;i++){
        if(customer_id!=h2[i].customer_id){
          if(i>0){
            html+=''
              +s.setLabel(L[2], W[2], "left", '<strong>Total Billing</strong>' )
              +s.setSubTotal(L[3], W[3], "right", ribuan(sub_total) )
              +'<br><br>';
          }
          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
          sub_total=0;
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].ticket_no )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].ticket_date) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].amount) )
        html+='<br>';
        
        customer_id=h2[i].customer_id;
        sub_total+=Number(h2[i].amount)
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
    if( String(a.customer_id).concat(a.ticket_date) === String(b.customer_id).concat(b.ticket_date) ){
      return 0;
    }
    else{
      if( String(a.customer_id).concat(a.ticket_date) < String(b.customer_id).concat(b.ticket_date) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptAgedTickets.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptAgedTickets.preview(indek); });
  toolbar.preview(indek,()=>{ RptAgedTickets.filterExecute(indek); });
  RptAgedTickets.formFilter(indek);
};

RptAgedTickets.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
    
      +'<li><label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
};

RptAgedTickets.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptAgedTickets.preview(indek);
};

RptAgedTickets.print=(indek)=>{};



//eof: 292;
