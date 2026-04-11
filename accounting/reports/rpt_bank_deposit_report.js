/*
 * name: budiono;
 * date: jun-20, 10:24, fri-2025; #61; 
 */

'use strict';

var RptBankDepositReport={}
  
RptBankDepositReport.table_name='rpt_bank_deposit_report';
RptBankDepositReport.title='Bank Deposit Report';
RptBankDepositReport.period=new PeriodLook(RptBankDepositReport);

RptBankDepositReport.show=(tiket)=>{
  tiket.modul=RptBankDepositReport.table_name;
  tiket.menu.name=RptBankDepositReport.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "account_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptBankDepositReport.preview(indek);
  }else{
    show(baru);
  }
}

RptBankDepositReport.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptBankDepositReport.proses(indek);
  } else {  
    RptBankDepositReport.display(indek);
  };
};

RptBankDepositReport.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  
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
    var sql="SELECT deposit_no,date,receipt_no,receipt_date"
      +",customer_name,receipt_amount"
      +" FROM receipt_deposit_sum"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+account_id+"'"
      +" AND receipt_date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=["deposit_no","date","receipt_no","receipt_date",
      "name","amount"
    ];
    var i,j;
    var r=[];
    var d;
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //deposit
        a[i][1], //date
        a[i][2], //receipt
        a[i][3], //date
        a[i][4], //name
        a[i][5], //amount
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
        RptBankDepositReport.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptBankDepositReport.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptBankDepositReport.proses(indek); });
  toolbar.filter(indek,()=>{ RptBankDepositReport.filter(indek); });
  toolbar.print(indek,()=>{ RptBankDepositReport.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // deposit_no
    90,  // date
    90,  // receipt_no
    90,  // receipt_date
    200, // name
    90,  // amount
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
          +s.setTitle( RptBankDepositReport.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Deposit No.')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Receipt No.')
            +s.setHeader(L[3], W[3], "left", 'Receipt Date')
            +s.setHeader(L[4], W[4], "left", 'Name')
            +s.setHeader(L[5], W[5], "right", 'Amount')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var t=0,st=0;
      var deposit_no='';

      for(i=0;i<h2.length;i++){
        if(deposit_no!=h2[i].deposit_no){
          if(i>0){
            html+=''
              +s.setSubTotal(L[4], W[4], "left", 'Total Deposit' )
              +s.setSubTotal(L[5], W[5], "right", ribuan(st) )
              +'<br><br>'
              +s.setLabel(L[0], W[0], "left", h2[i].deposit_no )
              +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          }
          st=0;
        }
        
        html+=''
          +s.setLabel(L[2], W[2], "left", h2[i].receipt_no )
          +s.setLabel(L[3], W[3], "left", tglWest(h2[i].receipt_date) )
          +s.setLabel(L[4], W[4], "left", h2[i].name )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].amount) )
        html+='<br>';
        
        t+=Number(h2[i].amount);
        st+=Number(h2[i].amount);
        deposit_no=h2[i].deposit_no;
        
      }
      html+=''
        +s.setSubTotal(L[4], W[4], "left", 'Total Deposit' )
        +s.setSubTotal(L[5], W[5], "right", ribuan(st) )
        +'<br>'
        +s.setTotalA(L[4], W[4], "left", 'Report Total' )
        +s.setTotalA(L[5], W[5], "right", ribuan(t) )
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
    if( String(a.date).concat(a.deposit_no) === String(b.date).concat(b.deposit_no) ){
      return 0;
    }
    else{
      if( String(a.date).concat(a.deposit_no) < String(b.date).concat(b.deposit_no) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptBankDepositReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptBankDepositReport.preview(indek); });
  toolbar.preview(indek,()=>{ RptBankDepositReport.filterExecute(indek); });
  RptBankDepositReport.formFilter(indek);
};

RptBankDepositReport.formFilter=(indek)=>{
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
        
      +'<li><label>Account ID</label>'
        +'<input type="text" id="account_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
};

RptBankDepositReport.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptBankDepositReport.getPeriod(indek);
};

RptBankDepositReport.getPeriod=(indek)=>{
  RptBankDepositReport.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptBankDepositReport.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptBankDepositReport.preview(indek);
};

RptBankDepositReport.print=(indek)=>{};



//eof: 292;342;
