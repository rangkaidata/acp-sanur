/*
 * name: budiono;
 * date: may-26, 19:43, mon-2025; #56; job_activity; 
 */

'use strict';

var RptJobRevenue={}
  
RptJobRevenue.table_name='rpt_job_revenue';
RptJobRevenue.title='Estimated Job Revenue';
RptJobRevenue.period=new PeriodLook(RptJobRevenue);

RptJobRevenue.show=(tiket)=>{
  tiket.modul=RptJobRevenue.table_name;
  tiket.menu.name=RptJobRevenue.title;
  tiket.rpt={
    "filter":{
      "date": "",
      "job_id": "",
    },
    "refresh":false
  };

  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptJobRevenue.preview(indek);
  }else{
    show(baru);
  }
}

RptJobRevenue.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobRevenue.proses(indek);
  } else {  
    RptJobRevenue.display(indek);
  };
};

RptJobRevenue.proses=(indek)=>{
  
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
      if(bingkai[indek].rpt.filter.date==""){
        bingkai[indek].rpt.filter.date=tglSekarang();
      }
      return callback();
    });
  }
  
  function getJobBalances(callback){
    var date=bingkai[indek].rpt.filter.date;
    var job_id=bingkai[indek].rpt.filter.job_id;
    var sql="SELECT job_id" // col-0
      +",phase_id"          // col-1
      +",cost_id"           // col-2

      +",est_revenue"      // col-3
      +",act_revenue"      // col-4
      
      +" FROM job_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
      if(job_id!=""){
        sql+=" AND job_id='"+job_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.job_balances=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.job_balances).rows;
    var f=[
      "job_id",      // col-0
      "name",        // col-1
      "phase_id",    // col-2
      "cost_id",     // col-3
      "est_revenue",     // col-4
      "act_revenue", // col-5
      "diff_revenue" // col-6
    ];
    var i=0;
    var d;
    var diff=0;
    var r=[];
    
    // job
    for(i=0;i<a.length;i++){
      diff=(Number(a[i][3])-Number(a[i][4]))*-1;
      
      r.push([
        a[i][0],       //0-job_id
        "",            //1-name
        a[i][1],       //2-phase_id
        a[i][2],       //3-cost_id
        a[i][3],       //4-est_revenue
        a[i][4],       //5-act_revenue
        diff, //6-diff_revenue
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    bingkai[indek].rpt.refresh=true;
    
    return callback();
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.join_array).rows;
    var f=JSON.parse(bingkai[indek].rpt.join_array).fields;
    var n=[];
    var i,j;
    var ada=0;
    
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<n.length;j++){
        if(a[i][0]==n[j][0]){// sum job_id
          if(a[i][2]==n[j][2]){// sum phase_id
            if(a[i][3]==n[j][3]){// sum cost_id
              ada=1; // edit
              n[j][4]+=Number(a[i][4]);
              n[j][5]+=Number(a[i][5]);
              n[j][6]+=Number(a[i][6]);
            }
          }
        } 
      }
      if(ada==0){// new
        n.push([
          a[i][0],
          a[i][1],
          a[i][2],
          a[i][3],
          Number(a[i][4]),
          Number(a[i][5]),
          Number(a[i][6]),
        ])
      }
    }

    bingkai[indek].rpt.sum_array=JSON.stringify({
      "fields":f,
      "rows":n
    });
    
    return callback();
  }

  getCompany(()=>{
    getJobBalances(()=>{
      getJoinArray(()=>{
        getSumArray(()=>{
          RptJobRevenue.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptJobRevenue.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobRevenue.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobRevenue.filter(indek); });
  toolbar.print(indek,()=>{ RptJobRevenue.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    130, // 0-id
    110, // 1-cost
    90,  // 2-est_expenses
    90,  // 3-act_expenses
    90,  // 4-diff_expenses
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
          +s.setTitle( RptJobRevenue.title )
          +s.setAsof( filter.date )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgray;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID, Phase ID')
            +s.setHeader(L[1], W[1], "left", 'Cost ID')
            +s.setHeader(L[2], W[2], "left", 'Est.Revenue')
            +s.setHeader(L[3], W[3], "left", 'Act.Revenue')
            +s.setHeader(L[4], W[4], "left", 'Diff.Revenue')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var job_id="";
      var phase_id="";
      var X=200;
      
      var subtot_est=0,subtot_act=0,subtot_diff=0;
      var tot_est=0,tot_act=0,tot_diff=0;

      for(i=0;i<h2.length;i++){
        if(i==0){
          job_id=h2[i].job_id;
          phase_id=h2[i].phase_id;
          html+=""
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
            +s.setLabel(L[1], X, "left", h2[i].name )
            +"<br>";
        }
        if(job_id!=h2[i].job_id){
          html+="<br>"
            +s.setSubTotal(L[2], W[2], "right", ribuan(subtot_est) )
            +s.setSubTotal(L[3], W[3], "right", ribuan(subtot_act) )
            +s.setSubTotal(L[4], W[4], "right", ribuan(subtot_diff) )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
            +s.setLabel(L[1], X, "left", h2[i].name )
            +"<br>";
            
            subtot_est=0;
            subtot_act=0;
            subtot_diff=0;
        }
        
        html+=''
          +s.setLabel(L[0]+10, W[0], "left", h2[i].phase_id )
          +s.setLabel(L[1], W[1], "left", h2[i].cost_id )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].est_revenue) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].act_revenue) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].diff_revenue) )
          
        html+='<br>';

        job_id=h2[i].job_id;
        phase_id=h2[i].phase_id;

        subtot_est+=Number(h2[i].est_revenue);
        subtot_act+=Number(h2[i].act_revenue);
        subtot_diff+=Number(h2[i].diff_revenue);
        
        tot_est+=Number(h2[i].est_revenue);
        tot_act+=Number(h2[i].act_revenue);
        tot_diff+=Number(h2[i].diff_revenue);
      }
      html+=''
        +s.setSubTotal(L[2], W[2], "right", ribuan(subtot_est) )
        +s.setSubTotal(L[3], W[3], "right", ribuan(subtot_act) )
        +s.setSubTotal(L[4], W[4], "right", ribuan(subtot_diff) )
        +'<br>'
        +s.setTotalA(L[2], W[2], "right", ribuan(tot_est) )
        +s.setTotalA(L[3], W[3], "right", ribuan(tot_act) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_diff) )
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
    ctx.strokeStyle="gray";
    if(i!=1){
      ctx.stroke();
    }
  }
  
  ctx.beginPath();
  ctx.rect(0,0,L[L.length-1],25); // x,y,width,height
  ctx.strokeStyle="gray";
  ctx.stroke();

  function sortByID(a,b){ // sort multidimensi;
    if( (a.job_id).concat(a.phase_id) === (b.job_id).concat(b.phase_id) ){
      return 0;
    }
    else{
      if( (a.job_id).concat(a.phase_id) < (b.job_id).concat(b.phase_id) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptJobRevenue.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobRevenue.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobRevenue.filterExecute(indek); });
  RptJobRevenue.formFilter(indek);
};

RptJobRevenue.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'

      +'<li><label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
        +'</li>'
                
      +'<li><label>Job ID</label>'
        +'<input type="text" id="job_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('job_id_'+indek, bingkai[indek].rpt.filter.job_id ); 
};

RptJobRevenue.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobRevenue.preview(indek);
};

RptJobRevenue.print=(indek)=>{};



// eof: 372;
