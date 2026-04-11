/*
 * name: budiono;
 * date: jul-10, 17:22, thu-2025; #copy dari outstanding_checks
 */

'use strict';

var RptOtherOutstanding={}
  
RptOtherOutstanding.table_name='rpt_other_outstanding_items';
RptOtherOutstanding.title='Other Outstanding Items';
RptOtherOutstanding.period=new PeriodLook(RptOtherOutstanding);

RptOtherOutstanding.show=(tiket)=>{
  tiket.modul=RptOtherOutstanding.table_name;
  tiket.menu.name=RptOtherOutstanding.title;
  tiket.rpt={
    "filter":{
      "date": tglSekarang(),
      "account_id": "10200-00",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptOtherOutstanding.preview(indek);
  }else{
    show(baru);
  }
}

RptOtherOutstanding.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptOtherOutstanding.proses(indek);
  } else {  
    RptOtherOutstanding.display(indek);
  };
};

RptOtherOutstanding.proses=(indek)=>{
  var date=bingkai[indek].rpt.filter.date;
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
      +" AND source=1" //--> khusus Journal entry;
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
        RptOtherOutstanding.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptOtherOutstanding.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptOtherOutstanding.proses(indek); });
  toolbar.filter(indek,()=>{ RptOtherOutstanding.filter(indek); });
  toolbar.print(indek,()=>{ RptOtherOutstanding.print(indek); });
  
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
    100,  // 3-amount
    100, // 4-balance
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
          +s.setTitle( RptOtherOutstanding.title )
          +s.setAsof2( filter.date, filter.account_id )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Reference')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Description')
            +s.setHeader(L[3], W[3], "right", 'Amount')
            +s.setHeader(L[4], W[4], "right", 'Balance')

            +'<br>'
        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var total=0;
      var balance=0;

      for(i=0;i<h2.length;i++){
        balance+=Number(h2[i].bank_debit);
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].reference )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].description )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].bank_debit) )
          +s.setLabel(L[4], W[4], "right", ribuan(balance) )
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

RptOtherOutstanding.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptOtherOutstanding.preview(indek); });
  toolbar.preview(indek,()=>{ RptOtherOutstanding.filterExecute(indek); });
  RptOtherOutstanding.formFilter(indek);
};

RptOtherOutstanding.formFilter=(indek)=>{
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
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.data ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
};


RptOtherOutstanding.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptOtherOutstanding.preview(indek);
};

RptOtherOutstanding.print=(indek)=>{};



//eof: 292;281;
