/*
 * name: budiono;
 * date: jun-19, 10:36, thu-2025; #61; financial_statements
 */

'use strict';

var RptGLAccountSummary={}
  
RptGLAccountSummary.table_name='rpt_gl_account_summary';
RptGLAccountSummary.title='GL Account Summary';
RptGLAccountSummary.period=new PeriodLook(RptGLAccountSummary);

RptGLAccountSummary.show=(tiket)=>{
  tiket.modul=RptGLAccountSummary.table_name;
  tiket.menu.name=RptGLAccountSummary.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from": "",
      "to": "",
      "account_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptGLAccountSummary.preview(indek);
  }else{
    show(baru);
  }
}

RptGLAccountSummary.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptGLAccountSummary.proses(indek);
  } else {  
    RptGLAccountSummary.display(indek);
  };
};

RptGLAccountSummary.proses=(indek)=>{
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
    var sql="SELECT account_id,account_name"
      +",SUM(debit) AS debit_amt"
      +",SUM(credit) AS credit_amt"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" GROUP BY account_id,account_name";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getB(callback){
    var sql="SELECT account_id,account_name"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" GROUP BY account_id,account_name";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var f=[
      "account_id", // 0
      "name",       // 1
      "begin_amt",  // 2
      "debit_amt",  // 3
      "credit_amt", // 4
      "net_amt",    // 5
      "end_amt"  // 6 
    ];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //0- account_id
        a[i][1], //1- name
        0,       //2- begin
        a[i][2], //3- debit
        a[i][3], //4- credit
        a[i][4], //5- net
        a[i][4], //6- ending
      ]);
    }
    
    for(i=0;i<b.length;i++){
      r.push([
        b[i][0], //0- account_id
        b[i][1], //1- name
        b[i][2], //2- begin
        0,       //3- debit
        0,       //4- credit
        0,       //5- net
        b[i][2], //6- ending
      ]);
    }

    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.join_array).rows;
    var f=JSON.parse(bingkai[indek].rpt.join_array).fields;
    var i,j;
    var r=[];
    var ada=0;
    
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){// ada
          ada=1;
          r[j][2]+=Number(a[i][2]);
          r[j][3]+=Number(a[i][3]);
          r[j][4]+=Number(a[i][4]);
          r[j][5]+=Number(a[i][5]);
          r[j][6]+=Number(a[i][6]);
        }
      }
      if(ada==0){
        r.push([
          a[i][0],
          a[i][1],
          Number(a[i][2]),
          Number(a[i][3]),
          Number(a[i][4]),
          Number(a[i][5]),
          Number(a[i][6]),
        ])
      }
    }

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
          getSumArray(()=>{
            RptGLAccountSummary.display( indek );
          });
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptGLAccountSummary.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptGLAccountSummary.proses(indek); });
  toolbar.filter(indek,()=>{ RptGLAccountSummary.filter(indek); });
  toolbar.print(indek,()=>{ RptGLAccountSummary.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // account_id
    90, // name
    90, // begin
    90, // debit
    90, // credit
    90, // net
    90, // ending
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
          +s.setTitle( RptGLAccountSummary.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Account ID')
            +s.setHeader(L[1], W[1], "left", 'Name')
            +s.setHeader(L[2], W[2], "right", 'Beginning')
            +s.setHeader(L[3], W[3], "right", 'Debit')
            +s.setHeader(L[4], W[4], "right", 'Credit')
            +s.setHeader(L[5], W[5], "right", 'Net')
            +s.setHeader(L[6], W[6], "right", 'Ending')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var tb=0;
      var td=0;
      var tc=0;
      var tn=0;
      var te=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].account_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].begin_amt) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].debit_amt) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].credit_amt) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].net_amt) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].end_amt) )
          
        html+='<br>';
        tb+=Number(h2[i].begin_amt);
        td+=Number(h2[i].debit_amt);
        tc+=Number(h2[i].credit_amt);
        tn+=Number(h2[i].net_amt);
        te+=Number(h2[i].end_amt);
      }
      html+=''
        +s.setTotalA(L[2], W[2], "right", ribuan(tb) )
        +s.setTotalA(L[3], W[3], "right", ribuan(td) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tc) )
        +s.setTotalA(L[5], W[5], "right", ribuan(tn) )
        +s.setTotalA(L[6], W[6], "right", ribuan(te) )
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
    if( a.account_id === b.account_id ){
      return 0;
    }
    else{
      if( a.account_id < b.account_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptGLAccountSummary.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptGLAccountSummary.preview(indek); });
  toolbar.preview(indek,()=>{ RptGLAccountSummary.filterExecute(indek); });
  RptGLAccountSummary.formFilter(indek);
};

RptGLAccountSummary.formFilter=(indek)=>{
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

RptGLAccountSummary.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptGLAccountSummary.getPeriod(indek);
};

RptGLAccountSummary.getPeriod=(indek)=>{
  RptGLAccountSummary.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptGLAccountSummary.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptGLAccountSummary.preview(indek);
};

RptGLAccountSummary.print=(indek)=>{};




// eof: 292;238;419;
