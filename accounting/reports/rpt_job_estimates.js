/*
 * name: budiono;
 * date: may-27, 15:33, tue-2025; #56; job_activity; 
 */

'use strict';

var RptJobEstimates={}
  
RptJobEstimates.table_name='rpt_job_estimates';
RptJobEstimates.title='Job Estimates';
RptJobEstimates.period=new PeriodLook(RptJobEstimates);

RptJobEstimates.show=(tiket)=>{
  tiket.modul=RptJobEstimates.table_name;
  tiket.menu.name=RptJobEstimates.title;
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

    RptJobEstimates.preview(indek);
  }else{
    show(baru);
  }
}

RptJobEstimates.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobEstimates.proses(indek);
  } else {  
    RptJobEstimates.display(indek);
  };
};

RptJobEstimates.proses=(indek)=>{
  
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
  
  function getJobs(callback){
    var job_id=bingkai[indek].rpt.filter.job_id;
    var sql="SELECT job_id,name,detail"
      +" FROM jobs"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      if(job_id!=""){
        sql+=" AND job_id='"+job_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receive_inventory=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.receive_inventory).rows;
    var f=["job_id","name","phase_id","cost_id","unit","expenses"];
    var i,j,d;
    var r=[];
    
    for(i=0;i<a.length;i++){
      d=JSON.parse( a[i][2] );
      
      for(j=0;j<d.length;j++){
        if(d[j].units!=0 || d[j].expenses!=0){
          r.push([
            a[i][0], //job_id
            a[i][1], //name
            d[j].phase_id,
            d[j].cost_id,
            d[j].units,
            d[j].expenses,
          ]);
        };
      }
    };
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getJobs(()=>{
      getJoinArray(()=>{
        RptJobEstimates.display( indek );
      });
    });
  });
};

RptJobEstimates.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobEstimates.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobEstimates.filter(indek); });
  toolbar.print(indek,()=>{ RptJobEstimates.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    100, // job_id
    120, // phase_id
    120, // cost_id
    100, // est_exp_units
    100, // est_expenses
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
          +s.setTitle( RptJobEstimates.title )
          +s.setAsof( filter.date )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'Phase ID')
            +s.setHeader(L[2], W[2], "left", 'Cost ID')
            +s.setHeader(L[3], W[3], "right", 'Est.Exp.Units')
            +s.setHeader(L[4], W[4], "right", 'Est.Expenses')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var job_id;
      var subtot_unit=0
      var subtot_expenses=0
      var X=200;
      var tot_unit=0,tot_expenses=0;

      for(i=0;i<h2.length;i++){
        if(i==0){
          job_id=h2[i].job_id;
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
        }
        if(job_id!=h2[i].job_id){
          html+=''
            +s.setSubTotal(L[2], W[2], "left", '<b>Total ['+job_id+']</b>' )
            +s.setSubTotal(L[3], W[3], "right", ribuan(subtot_unit) )
            +s.setSubTotal(L[4], W[4], "right", ribuan(subtot_expenses) )
            +'<br><br>'
            +s.setLabel(L[0], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
            
            subtot_expenses=0;
            subtot_unit=0;
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].phase_id )
          +s.setLabel(L[2], W[2], "left", h2[i].cost_id )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].unit) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].expenses) )

        html+='<br>';
        
        job_id=h2[i].job_id;
        
        subtot_unit+=Number(h2[i].unit);
        subtot_expenses+=Number(h2[i].expenses);
        tot_unit+=Number(h2[i].unit);
        tot_expenses+=Number(h2[i].expenses);
      }
      html+=''
        +'<br>'
        +s.setSubTotal(L[2], W[2], "left", '<b>Total ['+job_id+']</b>' )
        +s.setTotal(L[3], W[3], "right", ribuan(subtot_unit) )
        +s.setTotal(L[4], W[4], "right", ribuan(subtot_expenses) )
        +'<br>'
        +s.setTotalA(L[3], W[3], "right", ribuan(tot_unit) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_expenses) )
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

RptJobEstimates.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobEstimates.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobEstimates.filterExecute(indek); });
  RptJobEstimates.formFilter(indek);
};

RptJobEstimates.formFilter=(indek)=>{
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



RptJobEstimates.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobEstimates.preview(indek);
};

RptJobEstimates.print=(indek)=>{};



// eof: 317;
