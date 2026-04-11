/*
 * name: budiono;
 * date: jul-09, 21:37, wed-2025;  
 */

'use strict';

var RptDepositsinTransit={}
  
RptDepositsinTransit.table_name='rpt_deposits_in_transit';
RptDepositsinTransit.title='Deposits in Transit';
RptDepositsinTransit.period=new PeriodLook(RptDepositsinTransit);

RptDepositsinTransit.show=(tiket)=>{
  tiket.modul=RptDepositsinTransit.table_name;
  tiket.menu.name=RptDepositsinTransit.title;
  tiket.rpt={
    "filter":{
      "date":tglSekarang(),
      "account_id": "10200-00",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptDepositsinTransit.preview(indek);
  }else{
    show(baru);
  }
}

RptDepositsinTransit.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptDepositsinTransit.proses(indek);
  } else {  
    RptDepositsinTransit.display(indek);
  };
};

RptDepositsinTransit.proses=(indek)=>{
  var cash_account_id=bingkai[indek].rpt.filter.account_id;
  
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
    var sql="SELECT reference,date,cash_no,description,bank_credit"
      +" FROM cash"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+cash_account_id+"'"
      +" AND reconcile_date=''"// belum reconcile;
      +" AND hide=1"
      +" AND bank_credit>0"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){
    var sql="SELECT deposit_no,detail"
      +" FROM deposits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+cash_account_id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var f=[
      "deposit_no",
      "date",
      "receipt_no",
      "description",
      "receipt_amt",
      "deposit_amt"
    ];
    var i=0,j=0,k=0;
    var r=[];
    var ada=0;
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], // 0-deposit_no
        a[i][1], // 1-date
        a[i][2], // 2-receipt_no
        a[i][3], // 3-description
        0,       // 4-receipt_amt
        a[i][4], // 5-deposit_amt
      ]);
    }
    
    
    var d=[];
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<b.length;j++){
        if(a[i][0]==b[j][0]){
          d=JSON.parse(b[j][1]);
          for(k=0;k<d.length;k++){
            ada=1;
            r.push([
              a[i][0], // deposit no
              a[i][1], // deposit date
              d[k].receipt_no, // receipt_no
              d[k].customer_name, // description
              d[k].receipt_amount, // receipt_amount
              0, // deposit_amount;
            ]);
          }
        }
      }
      // tanpa deposit;
      if(ada==0){
        r.push([
          a[i][0], // deposit no
          a[i][1], // deposit date
          a[i][2], // receipt_no
          a[i][3], // description
          a[i][4], // receipt_amount
          0,       // deposit_amount;
        ]);        
      }
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
          // getSUMArray(()=>{
          RptDepositsinTransit.display( indek );
          //});
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptDepositsinTransit.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptDepositsinTransit.proses(indek); });
  toolbar.filter(indek,()=>{ RptDepositsinTransit.filter(indek); });
  toolbar.print(indek,()=>{ RptDepositsinTransit.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // deposit_no
    90, // date
    90, // reference
    150, // description
    90, // transaction_amt
    90, // deposit_amt
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
          +s.setTitle( RptDepositsinTransit.title )
          +s.setAsof( filter.date )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Deposit No.')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Receipt No.')
            +s.setHeader(L[3], W[3], "left", 'Description')
            +s.setHeader(L[4], W[4], "right", 'Receipt Amt.')
            +s.setHeader(L[5], W[5], "right", 'Deposit Amt.')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var tot_deposit=0;
      var tot_receipt=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].deposit_no )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].receipt_no )
          +s.setLabel(L[3], W[3], "left", h2[i].description )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].receipt_amt) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].deposit_amt) )
        html+='<br>';
        
        tot_deposit+=Number(h2[i].deposit_amt);
        tot_receipt+=Number(h2[i].receipt_amt);
      }
      html+=''
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_receipt) )
        +s.setTotalA(L[5], W[5], "right", ribuan(tot_deposit) )
        
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
    if( a.date === b.date ){
      return 0;
    }
    else{
      if( a.date < b.date ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptDepositsinTransit.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptDepositsinTransit.preview(indek); });
  toolbar.preview(indek,()=>{ RptDepositsinTransit.filterExecute(indek); });
  RptDepositsinTransit.formFilter(indek);
};

RptDepositsinTransit.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
        +'</li>'
        
      +'<li><label>Account ID</label>'
        +'<input type="text" id="account_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
};

RptDepositsinTransit.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptDepositsinTransit.preview(indek);
};

RptDepositsinTransit.print=(indek)=>{};



//eof: 292;
