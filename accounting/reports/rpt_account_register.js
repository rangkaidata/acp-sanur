/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 * edit: jul-08, 16:24, tue-2025; #63; 
 */

'use strict';

var RptAccountRegister={}
  
RptAccountRegister.table_name='rpt_account_register';
RptAccountRegister.title='Account Register';
RptAccountRegister.period=new PeriodLook(RptAccountRegister);

RptAccountRegister.show=(tiket)=>{
  tiket.modul=RptAccountRegister.table_name;
  tiket.menu.name=RptAccountRegister.title;
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

    RptAccountRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptAccountRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptAccountRegister.proses(indek);
  } else {  
    RptAccountRegister.display(indek);
  };
};

RptAccountRegister.proses=(indek)=>{
  var account_id=bingkai[indek].rpt.filter.account_id;
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
    var sql="SELECT date,reference,source,description"
      +",bank_credit,bank_debit,hide,reconcile_date"
      +" FROM cash"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND hide=1"
      +" AND reconcile_date=''"// belum di reconcile;
      +" AND cash_account_id='"+account_id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){// campur yg sudah & belum reconcile
    var sql="SELECT SUM(bank_credit) AS bank_credit"
      +",SUM(bank_debit) AS bank_debit"
      +" FROM cash"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" AND hide=1"
      +" AND cash_account_id='"+account_id+"'"
      +" GROUP BY cash_account_id"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function getC(callback){
    var sql="SELECT debit,credit"
      +" FROM account_begins"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+account_id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_c=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var c=JSON.parse(bingkai[indek].rpt.data_c).rows;
    var f=[
      "date",
      "reference",
      "type",
      "description",
      "begin",
      "deposit",
      "withdrawal",
      "hide",
      "reconcile"
    ];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], // date
        a[i][1], // reference
        a[i][2], // source/type
        a[i][3], // description
        0,       // begin 
        Number(a[i][4]), // deposit
        Number(a[i][5]), // withdrawal
        a[i][6], // hide
        a[i][7], // reconcile
      ]);
    }
    
    var balance=0;
    for(i=0;i<b.length;i++){
      balance+=Number(b[i][0])-Number(b[i][1]);
      r.push([
        "", // date
        "", // reference
        "", // source/type
        "", // description
        balance, // begin
        0,       // deposit
        0,       // withdrawal
        1,   // hide
        "",  // reconcile
      ]);
    }
    
    balance=0;
    for(i=0;i<c.length;i++){
      balance+=Number(c[i][0])-Number(c[i][1]);
      r.push([
        "",      // 0-date
        "",      // 1-reference
        "",      // 2-source/type
        "",      // 3-description
        balance, // 4-begin
        0,       // 5-deposit
        0,       // 6-withdrawal
        1,       // 7-hide
        "",      // 8-reconcile
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
    var r=[];
    var i=0,j=0;
    var ada=0;
    
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){     // date
          if(a[i][1]==r[j][1]){   // reference
            if(a[i][3]==r[j][3]){ // description
              r[j][4]+=a[i][4];   // begin
              r[j][5]+=a[i][5];   // deposit
              r[j][6]+=a[i][6];   // withdrawal
              ada=1;
            };
          };
        };
      };

      if(ada==0){
        r.push([
          a[i][0],
          a[i][1],
          a[i][2],
          a[i][3],
          a[i][4],
          a[i][5],
          a[i][6],
          a[i][7],
          a[i][8],// reconcile
        ])
      };
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
        getC(()=>{
          getJoinArray(()=>{
            getSUMArray(()=>{
              RptAccountRegister.display( indek );
            })
          });
        });
      });
    });
  });
  bingkai[indek].rpt.refresh=true;
};

RptAccountRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptAccountRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptAccountRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptAccountRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    85,  // date
    90,  // trans no
    50,  // type
    100,  // trans desc
    110, // deposit amt
    110, // withrawal amt
    110, // balance
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
          +s.setTitle( RptAccountRegister.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Date')
            +s.setHeader(L[1], W[1], "left", 'Trans No.')
            +s.setHeader(L[2], W[2], "left", 'Type')
            +s.setHeader(L[3], W[3], "left", 'Description')
            +s.setHeader(L[4], W[4], "right", 'Deposit Amt')
            +s.setHeader(L[5], W[5], "right", 'Withdrawal Amt')
            +s.setHeader(L[6], W[6], "right", 'Balance')
//            +s.setHeader(L[7], W[7], "right", 'Reconcile')
          +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var sum_deposit=0;
      var sum_withdrawal=0;
      var balance=0;

      for(i=0;i<h2.length;i++){
        balance+=Number(h2[i].begin)
          +Number(h2[i].deposit)
          -Number(h2[i].withdrawal);
        
        html+=''
          +s.setLabel(L[0], W[0], "left", tglWest(h2[i].date) )
          +s.setLabel(L[1], W[1], "left", h2[i].reference )
          +s.setLabel(L[2], W[2], "left", h2[i].type )
          +s.setLabel(L[3], W[3], "left", h2[i].description )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].deposit) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].withdrawal) )
          +s.setLabel(L[6], W[6], "right", ribuan(balance) )
//          +s.setLabel(L[7], W[7], "left", tglWest(h2[i].reconcile) )
        html+='<br>';
        
        sum_deposit+=Number(h2[i].deposit);
        sum_withdrawal+=Number(h2[i].withdrawal);
        
      }
      html+=''
        +s.setTotalA(L[4], W[4], "right", ribuan(sum_deposit) )
        +s.setTotalA(L[5], W[5], "right", ribuan(sum_withdrawal) )
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

RptAccountRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptAccountRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptAccountRegister.filterExecute(indek); });
  RptAccountRegister.formFilter(indek);
};

RptAccountRegister.formFilter=(indek)=>{
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

RptAccountRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptAccountRegister.getPeriod(indek);
};

RptAccountRegister.getPeriod=(indek)=>{
  RptAccountRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptAccountRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptAccountRegister.preview(indek);
};

RptAccountRegister.print=(indek)=>{};



//eof: 292;459;
