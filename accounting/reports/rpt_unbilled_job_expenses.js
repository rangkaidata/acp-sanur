/*
 * name: budiono;
 * date: may-30, 20:58, fri-2025; #56;  job_activity
 */

'use strict';

var RptUnbilledJobExpenses={}
  
RptUnbilledJobExpenses.table_name='rpt_unbilled_job_expenses';
RptUnbilledJobExpenses.title='Unbilled Job Expenses';
RptUnbilledJobExpenses.period=new PeriodLook(RptUnbilledJobExpenses);

RptUnbilledJobExpenses.show=(tiket)=>{
  tiket.modul=RptUnbilledJobExpenses.table_name;
  tiket.menu.name=RptUnbilledJobExpenses.title;
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

    RptUnbilledJobExpenses.preview(indek);
  }else{
    show(baru);
  }
}

RptUnbilledJobExpenses.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptUnbilledJobExpenses.proses(indek);
  } else {  
    RptUnbilledJobExpenses.display(indek);
  };
};

RptUnbilledJobExpenses.proses=(indek)=>{
  
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
    var sql="SELECT job_id,gl_account_id,phase_id,cost_id"
      +",reference,date,description,act_expenses,act_revenue"
      +" FROM job_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND table_name != 'job_begins'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.job_activity=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.job_activity).rows;
    var f=["job_id","gl_account_id","phase_id","cost_id","reference","date","description","activity"];
    var i=0;
    var r=[];
    var activity=0;
    
    for(i=0;i<a.length;i++){
      
      activity=Number(a[i][7])-Number(a[i][8])
      
      if(parseInt(activity*100)/100!=0){
        r.push([
          a[i][0], // 0-job_id
          a[i][1], // 1-gl_account_id
          a[i][2], // 2-phase_id
          a[i][3], // 3-cost_id
          a[i][4], // 4-reference
          a[i][5], // 5-date
          a[i][6], // 6-description
          activity // 7-activity
        ]);
      };
    };
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getJobActivity(()=>{
      getJoinArray(()=>{
        RptUnbilledJobExpenses.display( indek );
      });
    });
  });
};

RptUnbilledJobExpenses.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptUnbilledJobExpenses.proses(indek); });
  toolbar.filter(indek,()=>{ RptUnbilledJobExpenses.filter(indek); });
  toolbar.print(indek,()=>{ RptUnbilledJobExpenses.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    45, // 0-job_id
    80, // 1-gl_account_id
    90, // 2-phase_id
    90, // 3-cost_id
    90, // 4-reference
    80, // 5-date
    100, // 6-description
    90, // 7-activity
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
          +s.setTitle( RptUnbilledJobExpenses.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'GL.Acct.ID')
            +s.setHeader(L[2], W[2], "left", 'Phase ID')
            +s.setHeader(L[3], W[3], "left", 'Cost ID')
            +s.setHeader(L[4], W[4], "left", 'Reference')
            +s.setHeader(L[5], W[5], "left", 'Date')
            +s.setHeader(L[6], W[6], "left", 'Description')
            +s.setHeader(L[7], W[7], "right", 'Activity')

            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var total=0;
      var subtotal=0;
      var job_id;
      var X=120;

      for(i=0;i<h2.length;i++){
        if(i==0){
          job_id=h2[i].job_id;
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].job_id )
            +'<br>'
        }
        if(job_id!=h2[i].job_id){
          html+=''
            +s.setSubTotal(L[5], X, "left", 'Total ['+job_id+']' )
            +s.setSubTotal(L[7], W[7], "right", ribuan(subtotal) )
            +'<br>'
            +s.setLabel(L[0], X, "left", h2[i].job_id )
            +'<br>'
          subtotal=0;
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].gl_account_id )
          +s.setLabel(L[2], W[2], "left", h2[i].phase_id )
          +s.setLabel(L[3], W[3], "left", h2[i].cost_id )
          +s.setLabel(L[4], W[4], "left", h2[i].reference )
          +s.setLabel(L[5], W[5], "left", tglWest(h2[i].date) )
          +s.setLabel(L[6], W[6], "left", h2[i].description )
          +s.setLabel(L[7], W[7], "right", ribuan(h2[i].activity) )
          
        html+='<br>';
        
        subtotal+=Number(h2[i].activity);
        total+=Number(h2[i].activity);
        
        job_id=h2[i].job_id;
      }
      html+=''
        +s.setSubTotal(L[5], X, "left", 'Total ['+job_id+']' )
        +s.setSubTotal(L[7], W[7], "right", ribuan(subtotal) )
        +'<br>'
        +s.setTotalA(L[5], X, "left", 'Report Total' )
        +s.setTotalA(L[7], W[7], "right", ribuan(total) )
        
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

RptUnbilledJobExpenses.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptUnbilledJobExpenses.preview(indek); });
  toolbar.preview(indek,()=>{ RptUnbilledJobExpenses.filterExecute(indek); });
  RptUnbilledJobExpenses.formFilter(indek);
};

RptUnbilledJobExpenses.formFilter=(indek)=>{
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

RptUnbilledJobExpenses.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptUnbilledJobExpenses.getPeriod(indek);
};

RptUnbilledJobExpenses.getPeriod=(indek)=>{
  RptUnbilledJobExpenses.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptUnbilledJobExpenses.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptUnbilledJobExpenses.preview(indek);
};

RptUnbilledJobExpenses.print=(indek)=>{};




//eof:299;352;
