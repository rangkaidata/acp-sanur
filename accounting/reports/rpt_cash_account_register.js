/*
 * name: budiono;
 * date: aug-12, 14:46, tue-2025; #66;
 * edit: dec-20, 21:22, sat-2025; #84; prototype B;
 */

'use strict';

var RptCashAccountRegister={}
  
RptCashAccountRegister.table_name='rpt_cash_account_register';
RptCashAccountRegister.title='Cash Account Register';
RptCashAccountRegister.period=new PeriodLook(RptCashAccountRegister);
RptCashAccountRegister.account=new AccountLook(RptCashAccountRegister);

RptCashAccountRegister.show=(tiket)=>{
  tiket.modul=RptCashAccountRegister.table_name;
  tiket.menu.name=RptCashAccountRegister.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "account_id": "",
      "account_name": ""
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    getRptDefault(indek,()=>{
      RptCashAccountRegister.filter(indek);
    });
    
  }else{
    show(baru);
  }
}

RptCashAccountRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCashAccountRegister.proses(indek);
  } else {  
    RptCashAccountRegister.display(indek);
  };
};

RptCashAccountRegister.proses=(indek)=>{
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
    var sql="SELECT date,reference,credit,debit,balance,table_name"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){
    var sql="SELECT SUM(credit) AS credit"
      +",SUM(debit) AS debit"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
      +" AND date < '"+from+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var f=["date","reference","payment_amt","receipt_amt","balance",
      "table_name"];
    var i=0;
    var r=[];
    
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], // date
        a[i][1], // reference
        a[i][2], // payment_amt
        a[i][3], // receipt_amt
        a[i][4], // balance
        a[i][5], // table_name
      ]);
    }
    
    var dbt,crt;
    
    for(i=0;i<b.length;i++){
      dbt=0;
      crt=0;
      if(Number(b[i][2])>0){
        dbt=b[i][2];
      }else{
        crt=Number(b[i][2])*-1;
      }
      
      r.push([
        "", // date
        "", // reference
        crt, // payment_amt
        dbt, // receipt_amt
        b[i][2], // balance
        "begins", // table_name
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
          RptCashAccountRegister.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptCashAccountRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCashAccountRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptCashAccountRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptCashAccountRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // date
    90, // reference
    90, // table_name
    90, // payment_amt
    90, // receipt_amt
    90, // balance
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
    +'<div class="report">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;    
      +'<div class="report-sticky">'
        +'<div class="report-paper">'

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptCashAccountRegister.title )
          +s.setFromToText( filter.from, 
            filter.to, 
            filter.account_id+' - '+filter.account_name 
          )

          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'

            +s.setHeader(L[0], W[0], "left", 'Date')
            +s.setHeader(L[1], W[1], "left", 'Reference')
            +s.setHeader(L[2], W[2], "left", 'Source')
            +s.setHeader(L[3], W[3], "right", 'Payment Amt')
            +s.setHeader(L[4], W[4], "right", 'Receipt Amt')
            +s.setHeader(L[5], W[5], "right", 'Balance')
            +'<br>'
        +'</div>'
      +'</div>'
      
//--start-detail
      +'<div class="report-detail">';

      var h2=h.sort( sortByID );
      var balance=0;
      var payment_amt=0,receipt_amt=0;

      for(i=0;i<h2.length;i++){
        
        balance+=Number(h2[i].balance);
        
        html+=''
          +s.setLabel(L[0], W[0], "left", tglWest(h2[i].date) )
          +s.setLabel(L[1], W[1], "left", h2[i].reference )
          +s.setLabel(L[2], W[2], "left", h2[i].table_name )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].payment_amt) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].receipt_amt) )
          +s.setLabel(L[5], W[5], "right", ribuan(balance) )

        html+='<br>';
        
        if(h2[i].date!=""){
          payment_amt+=Number(h2[i].payment_amt);
          receipt_amt+=Number(h2[i].receipt_amt);
        }
      }
      html+=''
        +s.setTotalA(L[2], W[2], "left", 'Total' )
        +s.setTotalA(L[3], W[3], "right", ribuan(payment_amt) )
        +s.setTotalA(L[4], W[4], "right", ribuan(receipt_amt) )
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
    if( String(a.date).concat(a.reference) === 
        String(b.date).concat(b.reference) ){
      return 0;
    }
    else{
      if( String(a.date).concat(a.reference) < 
          String(b.date).concat(b.reference) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptCashAccountRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCashAccountRegister.preview(indek); });
  toolbar.preview(indek,()=>{ 
    RptCashAccountRegister.filterExecute(indek); 
  });
  RptCashAccountRegister.formFilter(indek);
};

RptCashAccountRegister.formFilter=(indek)=>{

  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Period:</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' id="btn_period_'+indek+'" '
          +' onclick="RptCashAccountRegister.period.getPaging(\''+indek+'\''
          +',\'period_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
      +'</li>'
      +'<li>'
        +'<label>From:</label>'
        +'<input type="date" id="from_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>To:</label>'
        +'<input type="date" id="to_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Cash Account ID:</label>'
        +'<input type="text" id="account_id_'+indek+'" size="17"'
          +' onchange="RptCashAccountRegister.getAccount(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="RptCashAccountRegister.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,\''+CLASS_ASSET+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" id="account_name_'+indek+'" disabled>'
      +'</li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
};

RptCashAccountRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  dbFunc.getPeriod(indek,d.period_id,(d)=>{
    setEV('from_'+indek, d.start_date);
    setEV('to_'+indek, d.end_date) ;

    bingkai[indek].rpt.filter.from=d.start_date;
    bingkai[indek].rpt.filter.to=d.end_date;
  });
};

RptCashAccountRegister.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.account_id);
  RptCashAccountRegister.getAccount(indek);
};

RptCashAccountRegister.filterExecute=(indek)=>{
  var account_id=getEV("account_id_"+indek);
  var account_name=getEV("account_name_"+indek);

  if(account_id==''){
    pesanSalah2(indek,3,['cash_account_id'],[''])
    return;
  }
  
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": account_id,
    "account_name": account_name,
  }
  bingkai[indek].rpt.refresh=false;
  RptCashAccountRegister.preview(indek);
};

RptCashAccountRegister.getAccount=(indek)=>{
  message.none(indek);
  RptCashAccountRegister.account.getOne(indek,
    getEV('account_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('account_name_'+indek, d.name);
    }else{
      setEV('account_name_'+indek, '');
    }
  });
}

RptCashAccountRegister.print=(indek)=>{};



//eof: 368;
