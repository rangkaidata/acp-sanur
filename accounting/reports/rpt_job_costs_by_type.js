/*
 * name: budiono;
 * date: may-30, 07:47, fri-2025; #55; one of us 
 */

'use strict';

var RptJobCostsbyType={}
  
RptJobCostsbyType.table_name='rpt_job_costs_by_type';
RptJobCostsbyType.title='Job Costs by Type';
RptJobCostsbyType.period=new PeriodLook(RptJobCostsbyType);

RptJobCostsbyType.show=(tiket)=>{
  tiket.modul=RptJobCostsbyType.table_name;
  tiket.menu.name=RptJobCostsbyType.title;
  tiket.rpt={
    filter:{
      date:tglSekarang(),
      job_id:"",
    },
    refresh:false
  };
  
  var baru=exist(tiket);
  if (baru==-1) {
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptJobCostsbyType.preview(indek);
  } else {
    show(baru);
  }
}

RptJobCostsbyType.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobCostsbyType.proses(indek);
  } else {  
    RptJobCostsbyType.display(indek);
  };
};

RptJobCostsbyType.proses=(indek)=>{
  
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
    var sql="SELECT job_id,phase_id,cost_id"
      +",est_unit,act_unit,est_expenses,act_expenses"
      +" FROM job_balances"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND table_name !='job_begins'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.job_activity=h;
      return callback();
    });
  }
  
  function getJob(callback){
    var sql="SELECT job_id,use_phases"
      +" FROM jobs"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.jobs=h;
      return callback();
    });
  }
  
  function getCost(callback){
    var sql="SELECT cost_id,type"
      +" FROM cost_codes"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.cost_codes=h;
      return callback();
    });
  }
  
  function getPhases(callback){
    var sql="SELECT phase_id,type"
      +" FROM phases"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.phases=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.job_activity).rows;
    var f=["job_id","cost_type",
      "est_unit","act_unit","diff_unit",
      "est_exp","act_exp","diff_exp"];
    var c=JSON.parse(bingkai[indek].rpt.cost_codes).rows;
    var b=JSON.parse(bingkai[indek].rpt.jobs).rows;
    var p=JSON.parse(bingkai[indek].rpt.phases).rows;
    var i,j,k;
    var r=[];
    var diff_unit;
    var diff_exp;
    var type,use_phases;
    
    for(i=0;i<a.length;i++){
      
      diff_unit=Number(a[i][3])-Number(a[i][4]);
      diff_exp=Number(a[i][5])-Number(a[i][6]);
      
      type=-1;
      
      for(j=0;j<p.length;j++){// phases
        if(a[i][1]==p[j][0]){
          type=p[j][1];
        }
      }
      
      for(j=0;j<c.length;j++){// cost_codes
        if(a[i][2]==c[j][0]){
          type=c[j][1];
        }
      }
      
      use_phases=0;
      
      for(k=0;k<c.length;k++){// job
        if(a[i][0]==b[k][0]){// job
          use_phases=b[k][1];
        }
      }
      
      if(use_phases==1){
        if(type>-1){
          r.push([
            a[i][0],   // 0-job_id
            type,      // 1-name
            a[i][3],   // 2-est_unit
            a[i][4],   // 3-act_unit
            diff_unit, // 4-diff_unit
            a[i][5],   // 5-est_exp
            a[i][6],   // 6-act_exp
            diff_exp,  // 7-diff_exp
          ]);
        };
      };
    };
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields:f,
      rows:r
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
        if(a[i][0]==r[j][0]){
          if(a[i][1]==r[j][1]){
            ada=1;
            r[j][2]+=Number(a[i][2]);
            r[j][3]+=Number(a[i][3]);
            r[j][4]+=Number(a[i][4]);
            r[j][5]+=Number(a[i][5]);
            r[j][6]+=Number(a[i][6]);
            r[j][7]+=Number(a[i][7]);
          };
        };
      };
      if(ada==0){
        r.push([
          a[i][0],
          a[i][1],
          Number(a[i][2]),
          Number(a[i][3]),
          Number(a[i][4]),
          Number(a[i][5]),
          Number(a[i][6]),
          Number(a[i][7]),
        ]);
      };
    };
    
    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields:f,
      rows:r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getJobActivity(()=>{
      getJob(()=>{
        getCost(()=>{
          getPhases(()=>{
            getJoinArray(()=>{
              getSumArray(()=>{
                RptJobCostsbyType.display(indek);
              });
            });
          });
        });
      });
    });
  });
};

RptJobCostsbyType.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobCostsbyType.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobCostsbyType.filter(indek); });
  toolbar.print(indek,()=>{ RptJobCostsbyType.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    45, // 0:vendor_id
    85, // 1-name
    95, // 2-est_units
    95, // 3-act_units
    95, // 4-diff_units       
    95, // 5-est_expepens
    95, // 6-act_expenses
    95, // 7-diff_expenses
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
          +s.setTitle( RptJobCostsbyType.title )
          +s.setAsof( filter.date )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'Cost Type')
            +s.setHeader(L[2], W[2], "right", 'Est.Exp.Units')
            +s.setHeader(L[3], W[3], "right", 'Act.Exp.Units')
            +s.setHeader(L[4], W[4], "right", 'Diff.Exp.Units')
            +s.setHeader(L[5], W[5], "right", 'Est.Expenses')
            +s.setHeader(L[6], W[6], "right", 'Act.Expenses')
            +s.setHeader(L[7], W[7], "right", 'Diff.Expenses')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var tot_est_unit=0,tot_act_unit=0,tot_diff_unit=0;
      var tot_est_exp=0,tot_act_exp=0,tot_diff_exp=0;
      var subtot_est_unit=0,subtot_act_unit=0,subtot_diff_unit=0;
      var subtot_est_exp=0,subtot_act_exp=0,subtot_diff_exp=0;
      var job_id;
      var X=200;

      for(i=0;i<h2.length;i++){
        if(i==0){
          job_id=h2[i].job_id;
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].job_id )
            +'<br>'
        }
        if(job_id!=h2[i].job_id){
          html+=''
            +s.setSubTotal(L[1], W[1], "left", 'Total' )
            +s.setSubTotal(L[2], W[2], "left", ribuan(subtot_est_unit) )
            +s.setSubTotal(L[3], W[3], "right", ribuan(subtot_act_unit) )
            +s.setSubTotal(L[4], W[4], "right", ribuan(subtot_diff_unit) )
            +s.setSubTotal(L[5], W[5], "right", ribuan(subtot_est_exp) )
            +s.setSubTotal(L[6], W[6], "right", ribuan(subtot_act_exp) )
            +s.setSubTotal(L[7], W[7], "right", ribuan(subtot_diff_exp) )
            +'<br><br>'
            +s.setLabel(L[0], X, "left", h2[i].job_id )
            +'<br>'

            subtot_est_unit=0;;
            subtot_act_unit=0;
            subtot_diff_unit=0;
            subtot_est_exp=0;;
            subtot_act_exp=0;
            subtot_diff_exp=0;
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", array_cost_type[h2[i].cost_type] )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].est_unit) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].act_unit) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].diff_unit) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].est_exp) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].act_exp) )
          +s.setLabel(L[7], W[7], "right", ribuan(h2[i].diff_exp) )
        html+='<br>';
        
        tot_est_unit+=Number(h2[i].est_unit);
        tot_act_unit+=Number(h2[i].act_unit);
        tot_diff_unit+=Number(h2[i].diff_unit);
        
        tot_est_exp+=Number(h2[i].est_exp);
        tot_act_exp+=Number(h2[i].act_exp);
        tot_diff_exp+=Number(h2[i].diff_exp);
        
        subtot_est_unit+=Number(h2[i].est_unit);
        subtot_act_unit+=Number(h2[i].act_unit);
        subtot_diff_unit+=Number(h2[i].diff_unit);
        
        subtot_est_exp+=Number(h2[i].est_exp);
        subtot_act_exp+=Number(h2[i].act_exp);
        subtot_diff_exp+=Number(h2[i].diff_exp);
        
        job_id=h2[i].job_id;
      }
      html+=''
          +s.setSubTotal(L[1], W[1], "left", 'Total' )
          +s.setSubTotal(L[2], W[2], "right", ribuan(subtot_est_unit) )
          +s.setSubTotal(L[3], W[3], "right", ribuan(subtot_act_unit) )
          +s.setSubTotal(L[4], W[4], "right", ribuan(subtot_diff_unit) )
          +s.setSubTotal(L[5], W[5], "right", ribuan(subtot_est_exp) )
          +s.setSubTotal(L[6], W[6], "right", ribuan(subtot_act_exp) )
          +s.setSubTotal(L[7], W[7], "right", ribuan(subtot_diff_exp) )
          +'<br>'
          +s.setTotalA(L[1], W[1], "left", 'Report Total' )
          +s.setTotalA(L[2], W[2], "right", ribuan(tot_est_unit) )
          +s.setTotalA(L[3], W[3], "right", ribuan(tot_act_unit) )
          +s.setTotalA(L[4], W[4], "right", ribuan(tot_diff_unit) )
          +s.setTotalA(L[5], W[5], "right", ribuan(tot_est_exp) )
          +s.setTotalA(L[6], W[6], "right", ribuan(tot_act_exp) )
          +s.setTotalA(L[7], W[7], "right", ribuan(tot_diff_exp) )
          
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
    if( (a.job_id).concat(a.cost_type) === (b.job_id).concat(b.cost_type) ){
      return 0;
    }
    else{
      if( (a.job_id).concat(a.cost_type) < (b.job_id).concat(b.cost_type) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptJobCostsbyType.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobCostsbyType.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobCostsbyType.filterExecute(indek); });
  RptJobCostsbyType.formFilter(indek);
};

RptJobCostsbyType.formFilter=(indek)=>{
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


RptJobCostsbyType.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobCostsbyType.preview(indek);
};

RptJobCostsbyType.print=(indek)=>{};



// eof:253;465;
