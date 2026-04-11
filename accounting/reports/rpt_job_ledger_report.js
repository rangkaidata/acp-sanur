/*
 * name: budiono;
 * date: may-30, 11:32, fri-2025; #56;  
 */

'use strict';

var RptJobLedger={}
  
RptJobLedger.table_name='rpt_job_ledger_report';
RptJobLedger.title='Job Ledger Report';
RptJobLedger.period=new PeriodLook(RptJobLedger);

RptJobLedger.show=(tiket)=>{
  tiket.modul=RptJobLedger.table_name;
  tiket.menu.name=RptJobLedger.title;
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

    RptJobLedger.preview(indek);
  }else{
    show(baru);
  }
}

RptJobLedger.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobLedger.proses(indek);
  } else {  
    RptJobLedger.display(indek);
  };
};

RptJobLedger.proses=(indek)=>{
  
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
    var sql="SELECT job_id,phase_id,cost_id,gl_account_id,date,"
      +"description,reference,act_expenses,act_revenue"
      +" FROM job_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.job_activity=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.job_activity).rows;
    var f=["job_id","phase_id","cost_id",
      "gl_account_id","date","description","reference",
      "debit","credit","net"
    ];
    var i=0;
    var r=[];
    var net=0;
    
    for(i=0;i<a.length;i++){

      net=Number(a[i][7])-Number(a[i][8]);

      r.push([
        a[i][0], // job_id
        a[i][1], // phase_id
        a[i][2], // cost_id
        a[i][3], // gl_acc_id
        a[i][4], // date
        a[i][5], // description
        a[i][6], // reference
        a[i][7], // debit
        a[i][8], // credit
        net, // net
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
        RptJobLedger.display( indek );
      });
    });
  });
};

RptJobLedger.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobLedger.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobLedger.filter(indek); });
  toolbar.print(indek,()=>{ RptJobLedger.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-job_id
    90, // 1-phase_id
    90, // 2-cost_id
    90, // 3-gl_account_id
    90, // 4-date
    150, // 5-description
    90, // 6-reference
    90, // 7-debit
    90, // 8-credit
    90, // 9-net
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
    +'<div class="a42land" id="cetak2">'// a4;
    
      +'<div class="a42c">'// header
        +'<div style="width:100%;background:white;display:block;">'

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptJobLedger.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=1122 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'Phase ID')
            +s.setHeader(L[2], W[2], "left", 'Cost ID')
            +s.setHeader(L[3], W[3], "left", 'GL Account')
            +s.setHeader(L[4], W[4], "left", 'Date')
            +s.setHeader(L[5], W[5], "left", 'Description')
            +s.setHeader(L[6], W[6], "left", 'Reference')
            +s.setHeader(L[7], W[7], "right", 'Debit')
            +s.setHeader(L[8], W[8], "right", 'Credit')
            +s.setHeader(L[9], W[9], "right", 'Net')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div class="a42d">'

      var h2=h.sort( sortByID );
      var t_credit=0;
      var t_debit=0;
      var t_net=0;
      var st_debit=0;
      var st_credit=0;
      var st_net=0;
      var job_id;

      for(i=0;i<h2.length;i++){
        if(i==0){
          job_id=h2[i].job_id;
          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
        }
        if(job_id!=h2[i].job_id){
          html+=''
            +s.setSubTotal(L[5], W[5], "left", 'Total ['+job_id+']' )
            +s.setSubTotal(L[7], W[7], "right", ribuan(st_debit) )
            +s.setSubTotal(L[8], W[8], "right", ribuan(st_credit) )
            +s.setSubTotal(L[9], W[9], "right", ribuan(st_net) )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
            
            st_debit=0;
            st_credit=0;
            st_net=0;
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].phase_id )
          +s.setLabel(L[2], W[2], "left", h2[i].cost_id )
          +s.setLabel(L[3], W[3], "left", h2[i].gl_account_id )
          +s.setLabel(L[4], W[4], "left", tglWest(h2[i].date) )
          +s.setLabel(L[5], W[5], "left", h2[i].description )
          +s.setLabel(L[6], W[6], "left", h2[i].reference )
          +s.setLabel(L[7], W[7], "right", ribuan(h2[i].debit) )
          +s.setLabel(L[8], W[8], "right", ribuan(h2[i].credit) )
          +s.setLabel(L[9], W[9], "right", ribuan(h2[i].net) )

        html+='<br>';
        
        t_debit+=Number(h2[i].debit);
        t_credit+=Number(h2[i].credit);
        t_net+=Number(h2[i].net);
        
        st_debit+=Number(h2[i].debit);
        st_credit+=Number(h2[i].credit);
        st_net+=Number(h2[i].net);
        
        job_id=h2[i].job_id;
      }
      html+=''
        +s.setSubTotal(L[5], W[5], "left", 'Total ['+job_id+']' )
        +s.setSubTotal(L[7], W[7], "right", ribuan(st_debit) )
        +s.setSubTotal(L[8], W[8], "right", ribuan(st_credit) )
        +s.setSubTotal(L[9], W[9], "right", ribuan(st_net) )
        +'<br>'
        +s.setTotalA(L[5], W[5], "left", 'Report Total' )
        +s.setTotalA(L[7], W[7], "right", ribuan(t_debit) )
        +s.setTotalA(L[8], W[8], "right", ribuan(t_credit) )
        +s.setTotalA(L[9], W[9], "right", ribuan(t_net) )
        +'<br><br>'
        
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

RptJobLedger.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobLedger.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobLedger.filterExecute(indek); });
  RptJobLedger.formFilter(indek);
};

RptJobLedger.formFilter=(indek)=>{
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

RptJobLedger.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptJobLedger.getPeriod(indek);
};

RptJobLedger.getPeriod=(indek)=>{
  RptJobLedger.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptJobLedger.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobLedger.preview(indek);
};

RptJobLedger.print=(indek)=>{};




// eof: 290;375;
