/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 */

'use strict';

var RptTicketListingByCustomer={}
  
RptTicketListingByCustomer.table_name='rpt_ticket_listing_by_customer';
RptTicketListingByCustomer.title='Ticket Listing by Customer';
RptTicketListingByCustomer.period=new PeriodLook(RptTicketListingByCustomer);

RptTicketListingByCustomer.show=(tiket)=>{
  tiket.modul=RptTicketListingByCustomer.table_name;
  tiket.menu.name=RptTicketListingByCustomer.title;
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

    RptTicketListingByCustomer.preview(indek);
  }else{
    show(baru);
  }
}

RptTicketListingByCustomer.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptTicketListingByCustomer.proses(indek);
  } else {  
    RptTicketListingByCustomer.display(indek);
  };
};

RptTicketListingByCustomer.proses=(indek)=>{
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
    var sql="SELECT daily_detail"
      +" FROM time_tickets"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){
    var sql="SELECT customer_id,customer_name"
      +",item_id,item_name,billing_amount"
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
      "customer_id",
      "customer_name",
      "item_id",
      "item_name",
      "billing_amount"
    ];
    var i=0,j=0;
    var r=[];
    var d;
    
    for(i=0;i<a.length;i++){
      d=JSON.parse(a[i][0]);
      r.push([
        d.customer_id_2,  // 0-customer_id
        d.customer_name_2,// 1-customer_name
        d.item_id,        // 2-item_id
        d.item_name,      // 3-item_name
        d.billing_amount, // 4-billing_amount
      ]);
    };
    
    for(i=0;i<b.length;i++){
      r.push([
        b[i][0], // 0-customer_id
        b[i][1], // 1-customer_name
        b[i][2], // 2-item_id
        b[i][3], // 3-item_name
        b[i][4], // 4-billing_amount
      ]);
    };

    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });

    return callback();
  }
  
  function getSUMArray(callback){

    var a=JSON.parse(bingkai[indek].rpt.join_array).rows;
    var f=JSON.parse(bingkai[indek].rpt.join_array).fields;
    var i=0,j=0;
    var r=[];
    var ada=0;

    for(i=0;i<a.length;i++){
      ada=0

      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){   //0-customer_id
          if(a[i][2]==r[j][2]){ //2-item_id
            ada=1;
            r[j][4]+=Number(a[i][4]);
          }
        }
      }

      if(ada==0){
        r.push([
          a[i][0],
          a[i][1],
          a[i][2],
          a[i][3],
          Number(a[i][4])
        ]);
      }
    };

    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }

  getCompany(()=>{
    getA(()=>{
      getB(()=>{
        getJoinArray(()=>{
          getSUMArray(()=>{
            RptTicketListingByCustomer.display( indek );
          });
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptTicketListingByCustomer.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptTicketListingByCustomer.proses(indek); });
  toolbar.filter(indek,()=>{ RptTicketListingByCustomer.filter(indek); });
  toolbar.print(indek,()=>{ RptTicketListingByCustomer.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    120, // 0-customer_id
    160, // 2-item_id
    200, // 3-item_description
    110, // 4-billing amount
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
          +s.setTitle( RptTicketListingByCustomer.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Customer ID')
            +s.setHeader(L[1], W[1], "left", 'Item ID')
            +s.setHeader(L[2], W[2], "left", 'Item Description')
            +s.setHeader(L[3], W[3], "right", 'Billing Amount')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var customer_id;
      var sub_tot=0;
      var tot=0;
      var X=300;

      for(i=0;i<h2.length;i++){
        
        if(customer_id!=h2[i].customer_id){
          if(i>0){
            html+=''
              +s.setSubTotal(L[3], W[3], "right", ribuan(sub_tot) )
              +'<br>';
              
          }
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].customer_name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
          sub_tot=0;
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].item_id )
          +s.setLabel(L[2], W[2], "left", h2[i].item_name )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].billing_amount) )

        html+='<br>';
        customer_id=h2[i].customer_id;
        sub_tot+=Number(h2[i].billing_amount);
        tot+=Number(h2[i].billing_amount);
      }
      html+=''
        +s.setSubTotal(L[3], W[3], "right", ribuan(sub_tot) )
        +'<br>'
        +s.setTotalA(L[3], W[3], "right", ribuan(tot) )
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
    if( a.customer_id === b.customer_id ){
      return 0;
    }
    else{
      if( a.customer_id < b.customer_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptTicketListingByCustomer.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptTicketListingByCustomer.preview(indek); });
  toolbar.preview(indek,()=>{ RptTicketListingByCustomer.filterExecute(indek); });
  RptTicketListingByCustomer.formFilter(indek);
};

RptTicketListingByCustomer.formFilter=(indek)=>{
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

RptTicketListingByCustomer.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptTicketListingByCustomer.getPeriod(indek);
};

RptTicketListingByCustomer.getPeriod=(indek)=>{
  RptTicketListingByCustomer.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptTicketListingByCustomer.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptTicketListingByCustomer.preview(indek);
};

RptTicketListingByCustomer.print=(indek)=>{};



//eof: 292;
