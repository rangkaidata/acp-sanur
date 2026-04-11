/*
 * name: budiono;
 * date: may-28, 15:50, wed-2025; #56; job_activity;
 */

'use strict';

var RptJobRegister={}
  
RptJobRegister.table_name='rpt_job_register';
RptJobRegister.title='Job Register';
RptJobRegister.period=new PeriodLook(RptJobRegister);

RptJobRegister.show=(tiket)=>{
  tiket.modul=RptJobRegister.table_name;
  tiket.menu.name=RptJobRegister.title;
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

    RptJobRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptJobRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptJobRegister.proses(indek);
  } else {  
    RptJobRegister.display(indek);
  };
};

RptJobRegister.proses=(indek)=>{
  
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
//      +" AND date <= '"+to+"'"
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
      "gl_account_id","amount","totals"
    ];
    var i=0;
    var r=[];
    var profit
    
    for(i=0;i<a.length;i++){
      profit=Number(a[i][4])-Number(a[i][5]);
      
      // amount=a[i][5]-a[i][4]
      r.push([
        a[i][0], // job_id
        a[i][1], // phase_id
        a[i][2], // cost_id
        a[i][3], // gl_account_id
        profit*-1, // amount
        0,  // totals
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
        RptJobRegister.display( indek );
      });
    });
  });
};

RptJobRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptJobRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptJobRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptJobRegister.print(indek); });
  
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
    90, // 4-amount
    90, // 5-totals
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
          +s.setTitle( RptJobRegister.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Job ID')
            +s.setHeader(L[1], W[1], "left", 'Phase ID')
            +s.setHeader(L[2], W[2], "left", 'Cost ID')
            +s.setHeader(L[3], W[3], "left", 'GL Acc. ID')
            +s.setHeader(L[4], W[4], "right", 'Amount')
            +s.setHeader(L[5], W[5], "right", 'Totals')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var subtot=0;
      var tot=0;
      var job_id;

      for(i=0;i<h2.length;i++){
        if(i==0){
          job_id=h2[i].job_id;
          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
        }
        if(job_id!=h2[i].job_id){
          
          html+=""
            +s.setSubTotal(L[3], 200, "left", "Total ["+job_id+"]" )
            +s.setSubTotal(L[5], W[5], "right", ribuan(subtot) )
            +"<br>"
            +s.setLabel(L[0], W[0], "left", h2[i].job_id )
            
          subtot=0;
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].phase_id )
          +s.setLabel(L[2], W[2], "left", h2[i].cost_id )
          +s.setLabel(L[3], W[3], "left", h2[i].gl_account_id )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].amount) )
        html+='<br>';
        
        job_id=h2[i].job_id;
        
        subtot+=Number(h2[i].amount);
        tot+=Number(h2[i].amount);
      }

      html+=''
        +s.setSubTotal(L[3], 200, "left", "Total ["+job_id+"]" )
        +s.setSubTotal(L[5], W[5], "right", ribuan(subtot) )
        +'<br>';
        
      html+=''
        +s.setTotalA(L[3], 200, "left", "Report Total" )
        +s.setTotalA(L[5], W[5], "right", ribuan(tot) )
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

RptJobRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptJobRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptJobRegister.filterExecute(indek); });
  RptJobRegister.formFilter(indek);
};

RptJobRegister.formFilter=(indek)=>{
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

RptJobRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptJobRegister.getPeriod(indek);
};

RptJobRegister.getPeriod=(indek)=>{
  RptJobRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptJobRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "job_id": getEV("job_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptJobRegister.preview(indek);
};

RptJobRegister.print=(indek)=>{};



// eof: 390;
