/*
 * name: budiono;
 * date: may-30, 21:40, fri-2025; #55; 
 */

'use strict';

var RptJobRetainageReport={}
  
RptJobRetainageReport.table_name='rpt_job_retainage_report';
RptJobRetainageReport.title='Job Retainage Report';
RptJobRetainageReport.period=new PeriodLook(RptJobRetainageReport);

RptJobRetainageReport.show=(tiket)=>{
  tiket.modul=RptJobRetainageReport.table_name;
  tiket.menu.name=RptJobRetainageReport.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "job_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptJobRetainageReport.preview(indek);
  }else{
    show(baru);
  }
}

RptJobRetainageReport.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobRetainageReport.proses(indek);
  } else {  
    RptJobRetainageReport.display(indek);
  };
};

RptJobRetainageReport.proses=(indek)=>{
  
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
  
  function getJobActivity(callback){
    var sql="SELECT job_id,gl_account_id,date,reference"
      +" FROM job_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.job_activity=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.job_activity).rows;
    var f=["job_id","gl_account_id","date","reference","rec_retain","pay_retain"];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], // job_id
        a[i][1], // gl_account_id
        a[i][2], // date
        a[i][3], // reference
        0,       // rec_retain
        0,       // pay_retain
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getJobActivity(()=>{
      getJoinArray(()=>{
        RptJobRetainageReport.display( indek );
      });
    });
  });
};

RptJobRetainageReport.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobRetainageReport.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobRetainageReport.filter(indek); });
  toolbar.print(indek,()=>{ RptJobRetainageReport.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-job_id
    90, // 1-gl_account_id
    90, // 2-date
    90, // 3-reference
    90, // 4-rec_retain
    90, // 5-pay_retain
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
          +s.setTitle( RptJobRetainageReport.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'GL.Acct.ID')
            +s.setHeader(L[2], W[2], "left", 'Date')
            +s.setHeader(L[3], W[3], "left", 'Reference')
            +s.setHeader(L[4], W[4], "left", 'Rec Retain')
            +s.setHeader(L[5], W[5], "left", 'Pay Retain')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].job_id )
          +s.setLabel(L[1], W[1], "left", h2[i].gl_account_id )
          +s.setLabel(L[2], W[2], "left", h2[i].date )
          +s.setLabel(L[3], W[3], "left", h2[i].reference )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].rec_retain) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].pay_retain) )
          
        html+='<br>';
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
    ctx.strokeStyle="black";
    ctx.stroke();
  }
  
  ctx.beginPath();
  ctx.rect(0,0,L[L.length-1],25); // x,y,width,height
  ctx.strokeStyle="black";
  ctx.stroke();

  function sortByID(a,b){ // sort multidimensi;
    if( a.job_id === b.job_id ){
      return 0;
    }
    else{
      if( a.job_id < b.job_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptJobRetainageReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobRetainageReport.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobRetainageReport.filterExecute(indek); });
  RptJobRetainageReport.formFilter(indek);
};

RptJobRetainageReport.formFilter=(indek)=>{
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
        
      +'<li><label>Job ID</label>'
        +'<input type="text" id="job_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('job_id_'+indek, bingkai[indek].rpt.filter.job_id ); 
};

RptJobRetainageReport.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptJobRetainageReport.getPeriod(indek);
};

RptJobRetainageReport.getPeriod=(indek)=>{
  RptJobRetainageReport.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptJobRetainageReport.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobRetainageReport.preview(indek);
};

RptJobRetainageReport.print=(indek)=>{};




// eof:290;308;
