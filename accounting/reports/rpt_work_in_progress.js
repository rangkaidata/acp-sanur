/*
 * name: budiono;
 * date: may-28, 16:58, wed-2025; #56; job_activity; 
 */

'use strict';

var RptWorkinProgress={}
  
RptWorkinProgress.table_name='rpt_work_in_progress';
RptWorkinProgress.title='Work in Progress';
RptWorkinProgress.period=new PeriodLook(RptWorkinProgress);

RptWorkinProgress.show=(tiket)=>{
  tiket.modul=RptWorkinProgress.table_name;
  tiket.menu.name=RptWorkinProgress.title;
  tiket.rpt={
    "filter":{
      "date":tglSekarang(),
      "job_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptWorkinProgress.preview(indek);
  }else{
    show(baru);
  }
}

RptWorkinProgress.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptWorkinProgress.proses(indek);
  } else {  
    RptWorkinProgress.display(indek);
  };
};

RptWorkinProgress.proses=(indek)=>{
  
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
    var sql="SELECT job_id,est_revenue,est_expenses"
      +",act_revenue,act_expenses"
      +" FROM job_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.job_activity=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.job_activity).rows;
    var f=["job_id","est_rev","est_exp","est_profit","act_rev","act_exp","exp_percent","ear_rev"];
    var i=0;
    var r=[];
    var est_profit=0;
    var exp_percent=0;
    
    for(i=0;i<a.length;i++){
      est_profit=Number(a[i][1])-Number(a[i][2]);
      exp_percent=0;
      if(Number(a[i][2])!=0){
        exp_percent=Number(a[i][4])/Number(a[i][2])
      }
      r.push([
        a[i][0],    // 0-job_id
        a[i][1],    // 1-est_rev
        a[i][2],    // 2-est_exp
        est_profit, // 3-est_profit
        a[i][3],    // 4-act_rev
        a[i][4],    // 5-act_exp
        exp_percent,// 6-exp_percent
        0,          // 7-ear_rev
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  function getPercent(act_exp,est_exp){
    var exp_percent=0;
    if(Number(act_exp)!=0){
      exp_percent=(Number(act_exp)/Number(est_exp))*100;
    }
    return exp_percent;
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.join_array).rows;
    var f=JSON.parse(bingkai[indek].rpt.join_array).fields;
    var r=[];
    var i,j;
    var ada=0;
    
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){
          r[j][1]+=Number(a[i][1]);
          r[j][2]+=Number(a[i][2]);
          r[j][3]+=Number(a[i][3]);
          r[j][4]+=Number(a[i][4]);
          r[j][5]+=Number(a[i][5]);
          r[j][6]+=getPercent( r[j][5],r[j][2] )
          r[j][7]+=Number(a[i][7]);
          ada=1;
        }
      }
      if(ada==0){// new
        r.push([
          a[i][0],
          Number(a[i][1]),
          Number(a[i][2]),
          Number(a[i][3]),
          Number(a[i][4]),
          Number(a[i][5]),
          getPercent( a[i][5],a[i][2] ),
          Number(a[i][7]),
        ]);
      }
    }
    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getJobActivity(()=>{
      getJoinArray(()=>{
        getSumArray(()=>{
          RptWorkinProgress.display( indek );
        });
      });
    });
  });
};

RptWorkinProgress.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptWorkinProgress.proses(indek); });
  toolbar.filter(indek,()=>{ RptWorkinProgress.filter(indek); });
  toolbar.print(indek,()=>{ RptWorkinProgress.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    80, // job_id
    90, // est_rev
    90, // est_exp
    90, // est_profit
    90, // act_exp
    90, // exp_percent
    90, // ear_exp;
    90, // act_rev
    90, // under_over
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
    +'<div class="a42land" id="cetak2" style="margin:0 auto;">'// a4;
    
      +'<div style="position:sticky;'
        +'width:297mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptWorkinProgress.title )
          +s.setAsof( filter.date )

          +'<canvas id="cv_'+indek+'" width=1122.52 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "right", 'Est.Rev')
            +s.setHeader(L[2], W[2], "right", 'Est.Exp')
            +s.setHeader(L[3], W[3], "right", 'Est.Profit')
            +s.setHeader(L[4], W[4], "right", 'Act.Exp')
            +s.setHeader(L[5], W[5], "right", '% Exp')
            +s.setHeader(L[6], W[6], "right", 'Earned.Exp')
            +s.setHeader(L[7], W[7], "right", 'Act.Rev')
            +s.setHeader(L[8], W[8], "right", 'Under/Over')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var earned_exp=0;
      var exp_percent=0;
      var under_over=0;
      
      var tot_est_rev=0;
      var tot_est_exp=0;
      var tot_est_profit=0;
      var tot_act_exp=0;
      var tot_exp_percent=0;
      var tot_ear_rev=0;
      var tot_act_rev=0;
      var tot_under_over=0;
      

      for(i=0;i<h2.length;i++){

        earned_exp=getEarned(h2[i].est_rev,h2[i].est_exp,h2[i].act_exp);
        exp_percent=getPercent(h2[i].act_exp,h2[i].est_exp);
        under_over=Number(earned_exp)-Number(h2[i].act_rev)

        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].job_id )
          +s.setLabel(L[1], W[1], "right", ribuan(h2[i].est_rev) )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].est_exp) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].est_profit) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].act_exp ) )
          +s.setLabel(L[5], W[5], "right", ribuan(exp_percent ) )
          +s.setLabel(L[6], W[6], "right", ribuan(earned_exp ) )
          +s.setLabel(L[7], W[7], "right", ribuan(h2[i].act_rev ) )
          +s.setLabel(L[8], W[8], "right", ribuan(under_over) )
          
          tot_est_rev+=Number(h2[i].est_rev);
          tot_est_exp+=Number(h2[i].est_exp);
          tot_est_profit+=Number(h2[i].est_profit);
          tot_act_exp+=Number(h2[i].act_exp);
          tot_exp_percent+=Number(h2[i].exp_percent);
          tot_act_rev+=Number(h2[i].act_rev);
          tot_under_over+=Number(under_over);
        html+='<br>';
      }
      tot_exp_percent=0;
      if(tot_act_exp!=0){
        tot_exp_percent=(tot_act_exp/tot_est_exp)*100;
      }
      tot_ear_rev=0;
      if(tot_est_profit!=0){
        tot_ear_rev=tot_est_rev/(tot_est_exp/tot_act_exp);
      }
      html+=''
        +s.setTotalA(L[1], W[1], "right", ribuan(tot_est_rev) )
        +s.setTotalA(L[2], W[2], "right", ribuan(tot_est_exp) )
        +s.setTotalA(L[3], W[3], "right", ribuan(tot_est_profit) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_act_exp) )
        +s.setTotalA(L[5], W[5], "right", ribuan(tot_exp_percent) )
        +s.setTotalA(L[6], W[6], "right", ribuan(tot_ear_rev) )
        +s.setTotalA(L[7], W[7], "right", ribuan(tot_act_rev) )
        +s.setTotalA(L[8], W[8], "right", ribuan(tot_under_over) )
        
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
  
  function getPercent(act_exp,est_exp){
    var exp_percent=0;
    if(Number(act_exp)!=0){
      exp_percent=(Number(act_exp)/Number(est_exp))*100;
    }
    return exp_percent;
  }
  
  function getEarned(est_rev,est_exp,act_exp){
    //(est_exp/act_exp)/est_rev
    let ear_rev=0;
    if(Number(act_exp)!=0){
      ear_rev=Number(est_rev)/(Number(est_exp)/Number(act_exp));
      //ear_rev=(Number(est_exp)/Number(act_exp));
    }
    return Number(ear_rev);
  }
};

RptWorkinProgress.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptWorkinProgress.preview(indek); });
  toolbar.preview(indek,()=>{ RptWorkinProgress.filterExecute(indek); });
  RptWorkinProgress.formFilter(indek);
};

RptWorkinProgress.formFilter=(indek)=>{
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


RptWorkinProgress.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptWorkinProgress.preview(indek);
};

RptWorkinProgress.print=(indek)=>{};

