/*
 * name: budiono;
 * date: may-27, 15:34, tue-2025; #56; job_activity; 
 */

'use strict';

var RptJobList={}
  
RptJobList.table_name='rpt_job_list';
RptJobList.title='Job List';
RptJobList.period=new PeriodLook(RptJobList);

RptJobList.show=(tiket)=>{
  tiket.modul=RptJobList.table_name;
  tiket.menu.name=RptJobList.title;
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

    RptJobList.preview(indek);
  }else{
    show(baru);
  }
}

RptJobList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobList.proses(indek);
  } else {  
    RptJobList.display(indek);
  };
};

RptJobList.proses=(indek)=>{
  
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
    var sql="SELECT job_id,name,start_date,end_date"
      +",customer_id,po_number,percent_complete"
      +" FROM jobs"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
      if(job_id!=""){
        sql+=" AND job_id='"+job_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.jobs=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.jobs).rows;
    var f=["job_id","name","starting","ending","customer_id",
      "po_number","percent_complete"
    ];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //job_id
        a[i][1], //name
        a[i][2], //starting
        a[i][3], //ending
        a[i][4], //customer_id
        a[i][5], //po_number
        a[i][6], //percent_complete
        
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getJobs(()=>{
      getJoinArray(()=>{
        RptJobList.display( indek );
      });
    });
  });
};

RptJobList.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobList.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobList.filter(indek); });
  toolbar.print(indek,()=>{ RptJobList.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // job_id
    200, // name
    80, // starting
    80, // ending
    90, // customer_id
    90, // po_number
    80, // percent_complete
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
          +s.setTitle( RptJobList.title )
          +"<p>&nbsp;</p>"
          +"<p>Filter</p>"

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'Job Name')
            +s.setHeader(L[2], W[2], "left", 'Starting')
            +s.setHeader(L[3], W[3], "left", 'Ending')
            +s.setHeader(L[4], W[4], "left", 'Customer ID')
            +s.setHeader(L[5], W[5], "left", 'PO Number')
            +s.setHeader(L[6], W[6], "left", '% Complete')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].job_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].starting) )
          +s.setLabel(L[3], W[3], "left", tglWest(h2[i].ending) )
          +s.setLabel(L[4], W[4], "left", h2[i].customer_id )
          +s.setLabel(L[5], W[5], "left", h2[i].po_number )
          +s.setLabel(L[6], W[6], "center", h2[i].percent_complete )
        html+='<br>';
      }
      html+=''
        +'<br>'
        +'~';
        
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

RptJobList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobList.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobList.filterExecute(indek); });
  RptJobList.formFilter(indek);
};

RptJobList.formFilter=(indek)=>{
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


RptJobList.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobList.preview(indek);
};

RptJobList.print=(indek)=>{};

