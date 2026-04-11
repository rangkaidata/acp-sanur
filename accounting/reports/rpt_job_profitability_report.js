/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 */

'use strict';

var RptJobProfitability={}
  
RptJobProfitability.table_name='rpt_job_profitability_report';
RptJobProfitability.title='Job Profitability Report';
RptJobProfitability.period=new PeriodLook(RptJobProfitability);

RptJobProfitability.show=(tiket)=>{
  tiket.modul=RptJobProfitability.table_name;
  tiket.menu.name=RptJobProfitability.title;
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

    RptJobProfitability.preview(indek);
  }else{
    show(baru);
  }
}

RptJobProfitability.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobProfitability.proses(indek);
  } else {  
    RptJobProfitability.display(indek);
  };
};

RptJobProfitability.proses=(indek)=>{
  
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
  
  function getJobActivityBegin(callback){
    
  }
  
  function getJobActivity(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var sql="SELECT job_id,phase_id,cost_id"
      +",gl_account_id,act_revenue,act_expenses"
      +" FROM job_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+to+"'"
//      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receive_inventory=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.receive_inventory).rows;
    var f=[
      "job_id","phase_id","cost_id",
      "gl_account_id","act_revenue","act_expenses",
      "profit_value","profit_percent"
    ];
    var i=0;
    var r=[];
    var profit
    
    for(i=0;i<a.length;i++){
      profit=Number(a[i][4])-Number(a[i][5]);
      r.push([
        a[i][0], // job_id
        a[i][1], // phase_id
        a[i][2], // cost_id
        a[i][3], // gl_account_id
        a[i][4], // act_rev
        a[i][5], // act_exp
        profit,  // profit_value
        0,       // profit_percent
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
        RptJobProfitability.display( indek );
      });
    });
  });
};

RptJobProfitability.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobProfitability.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobProfitability.filter(indek); });
  toolbar.print(indek,()=>{ RptJobProfitability.print(indek); });
  
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
    80, // 3-gl_account_id
    90, // 4-act_revenue
    90, // 5-act_expenses
    90, // 6-profit_value
    60, // 7-profit_percent
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
          +s.setTitle( RptJobProfitability.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'Phase ID')
            +s.setHeader(L[2], W[2], "left", 'Cost ID')
            +s.setHeader(L[3], W[3], "left", 'GL Acc. ID')
            +s.setHeader(L[4], W[4], "right", 'Act.Rev')
            +s.setHeader(L[5], W[5], "right", 'Act.Exp')
            +s.setHeader(L[6], W[6], "right", 'Profit')
            +s.setHeader(L[7], W[7], "right", 'Profit %')
            
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var subtot_expenses=0, subtot_revenue=0, subtot_profit=0;
      var tot_expenses=0, tot_revenue=0, tot_profit=0;
      var job_id;
      var profit_percent=0;

      for(i=0;i<h2.length;i++){
        if(i==0){
          job_id=h2[i].job_id;
          html+=''
            +s.setLabel(L[0], W[0], "left", job_id )
        }
        if(job_id!=h2[i].job_id){
          profit_percent=0;
          if(subtot_revenue!=0){
            profit_percent=100-((subtot_expenses/subtot_revenue)*100);
          }
          
          html+=""
            +s.setSubTotal(L[4], W[4], "right", ribuan(subtot_revenue) )
            +s.setSubTotal(L[5], W[5], "right", ribuan(subtot_expenses) )
            +s.setSubTotal(L[6], W[6], "right", ribuan(subtot_profit) )
            +s.setSubTotal(L[7], W[7], "center", ribuan(profit_percent) )
            +"<br>"
            +s.setLabel(L[0], W[0], "left", job_id )
            
          subtot_revenue=0;
          subtot_expenses=0;
          subtot_profit=0;
        }
        
        html+=''
          
          +s.setLabel(L[1], W[1], "left", h2[i].phase_id )
          +s.setLabel(L[2], W[2], "left", h2[i].cost_id )
          +s.setLabel(L[3], W[3], "left", h2[i].gl_account_id )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].act_revenue) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].act_expenses) )
          +s.setLabel(L[6], W[6], "right", "" )
          +s.setLabel(L[7], W[7], "right", ribuan(h2[i].profit_percent) )
        html+='<br>';
        
        job_id=h2[i].job_id;
        
        subtot_revenue+=Number(h2[i].act_revenue);
        subtot_expenses+=Number(h2[i].act_expenses);
        subtot_profit+=Number(h2[i].profit_value);
        
        tot_revenue+=Number(h2[i].act_revenue);
        tot_expenses+=Number(h2[i].act_expenses);
        tot_profit+=Number(h2[i].profit_value);

      }
      profit_percent=0;
      if(subtot_revenue!=0){
        profit_percent=100-((subtot_expenses/subtot_revenue)*100)
      }

      html+=''
        +s.setSubTotal(L[4], W[4], "right", ribuan(subtot_revenue) )
        +s.setSubTotal(L[5], W[5], "right", ribuan(subtot_expenses) )
        +s.setSubTotal(L[6], W[6], "right", ribuan(subtot_profit) )
        +s.setSubTotal(L[7], W[7], "right", ribuan(profit_percent) )
        +'<br>';
        
      profit_percent=0;
      if(tot_revenue!=0){
        profit_percent=100-((tot_expenses/tot_revenue)*100)
      }
      html+=''
        +s.setTotal(L[4], W[4], "right", ribuan(tot_revenue) )
        +s.setTotal(L[5], W[5], "right", ribuan(tot_expenses) )
        +s.setTotal(L[6], W[6], "right", ribuan(tot_profit) )
        +s.setTotal(L[7], W[7], "right", ribuan(profit_percent) )
        +'<br>'
        
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

RptJobProfitability.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobProfitability.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobProfitability.filterExecute(indek); });
  RptJobProfitability.formFilter(indek);
};

RptJobProfitability.formFilter=(indek)=>{
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

RptJobProfitability.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptJobProfitability.getPeriod(indek);
};

RptJobProfitability.getPeriod=(indek)=>{
  RptJobProfitability.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptJobProfitability.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobProfitability.preview(indek);
};

RptJobProfitability.print=(indek)=>{};

