/*
 * name: budiono;
 * date: jul-10, 15:35, thu-2025; #63; 
 */

'use strict';

var RptOutstandingChecks={}
  
RptOutstandingChecks.table_name='rpt_outstanding_checks';
RptOutstandingChecks.title='Outstanding Checks';
RptOutstandingChecks.period=new PeriodLook(RptOutstandingChecks);

RptOutstandingChecks.show=(tiket)=>{
  tiket.modul=RptOutstandingChecks.table_name;
  tiket.menu.name=RptOutstandingChecks.title;
  tiket.rpt={
    "filter":{
      "date": tglSekarang(),
      "account_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptOutstandingChecks.preview(indek);
  }else{
    show(baru);
  }
}

RptOutstandingChecks.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptOutstandingChecks.proses(indek);
  } else {  
    RptOutstandingChecks.display(indek);
  };
};

RptOutstandingChecks.proses=(indek)=>{
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
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
        }
      }
      return callback();
    });
  }

  function getA(callback){
    var sql="SELECT reference,date,description,bank_debit"
      +" FROM cash"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+account_id+"'"
      +" AND hide=1"
      +" AND reconcile_date=''"// belum reconcile
      +" AND bank_debit>0" 
      +" AND source != 1" //--> khusus receipt dan check, bukan Journal entry;
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=["reference","date","description","bank_debit"];
    var i=0;
    var r=[];

    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], // reference;
        a[i][1], // date;
        a[i][2], // description;
        a[i][3], // bank_debit;
      ]);
    };
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getA(()=>{
      getJoinArray(()=>{
        RptOutstandingChecks.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptOutstandingChecks.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptOutstandingChecks.proses(indek); });
  toolbar.filter(indek,()=>{ RptOutstandingChecks.filter(indek); });
  toolbar.print(indek,()=>{ RptOutstandingChecks.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // 0-trans_no
    90,  // 1-date
    200, // 2-description
    90,  // 3-amount
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
          +s.setTitle( RptOutstandingChecks.title )
          +s.setAsof2( filter.date, filter.account_id )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Reference')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Description')
            +s.setHeader(L[3], W[3], "left", 'Amount')

            +'<br>'
        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var total=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].reference )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].description )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].bank_debit) )
        html+='<br>';
        
        total+=Number(h2[i].bank_debit);
      }
      html+=''
        +s.setTotalA(L[3], W[3], "right", ribuan(total) )
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

RptOutstandingChecks.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptOutstandingChecks.preview(indek); });
  toolbar.preview(indek,()=>{ RptOutstandingChecks.filterExecute(indek); });
  RptOutstandingChecks.formFilter(indek);
};

RptOutstandingChecks.formFilter=(indek)=>{
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

RptOutstandingChecks.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptOutstandingChecks.getPeriod(indek);
};

RptOutstandingChecks.getPeriod=(indek)=>{
  RptOutstandingChecks.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptOutstandingChecks.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptOutstandingChecks.preview(indek);
};

RptOutstandingChecks.print=(indek)=>{};



//eof: 292;
