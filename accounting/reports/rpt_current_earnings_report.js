/*
 * name: budiono;
 * date: jun-02, 09:36, mon-2025; #56;
 */

'use strict';

var RptCurrentEarningsReport={}
  
RptCurrentEarningsReport.table_name='rpt_current_earning_report';
RptCurrentEarningsReport.title='Current Earning Report';
RptCurrentEarningsReport.period=new PeriodLook(RptCurrentEarningsReport);

RptCurrentEarningsReport.show=(tiket)=>{
  tiket.modul=RptCurrentEarningsReport.table_name;
  tiket.menu.name=RptCurrentEarningsReport.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "employee_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptCurrentEarningsReport.preview(indek);
  }else{
    show(baru);
  }
}

RptCurrentEarningsReport.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCurrentEarningsReport.proses(indek);
  } else {  
    RptCurrentEarningsReport.display(indek);
  };
};

RptCurrentEarningsReport.proses=(indek)=>{
  
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

  function getBeginPayrollEntry(callback){
    var from=bingkai[indek].rpt.filter.from;
    var sql="SELECT employee_id"
      +",SUM(gross_amount) AS gross_amount"
      +",SUM(deduction_amount) AS deduction_amount"
      +",SUM(net_amount) AS net_amount"
      +" FROM payroll_entry"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" GROUP BY employee_id"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.begin_payroll_entry=h;
      return callback();
    });
  }
  
  function getPayrollEntry(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var sql="SELECT employee_id,date,payroll_no"
      +",gross_amount"
      +",deduction_amount"
      +",net_amount"
      +" FROM payroll_entry"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.payroll_entry=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.begin_payroll_entry).rows;
    var b=JSON.parse(bingkai[indek].rpt.payroll_entry).rows;
    var f=["employee_id","date","reference","gross_amount",
      "deduction_amount",
      "net_amount"
    ];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0],   // employee_id
        "",        // date
        "Beginning", // reference
        a[i][1],   // gross_amount
        a[i][2],   // deduction_amount
        a[i][3],   // net_amount
      ]);
    }
    
    for(i=0;i<b.length;i++){
      r.push([
        b[i][0],   // employee_id
        b[i][1],   // date
        b[i][2],   // reference
        b[i][3],   // gross_amount
        b[i][4],   // deduction_amount
        b[i][5],   // net_amount
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getBeginPayrollEntry(()=>{
      getPayrollEntry(()=>{
        getJoinArray(()=>{
          RptCurrentEarningsReport.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptCurrentEarningsReport.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCurrentEarningsReport.proses(indek); });
  toolbar.filter(indek,()=>{ RptCurrentEarningsReport.filter(indek); });
  toolbar.print(indek,()=>{ RptCurrentEarningsReport.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-vendor_id
    90, // 1-date
    90, // 2-reference
    90, // 3-gross_amount
    90, // 4-addition_amount
    90, // 5-deduction_amount
    90, // 6-net_amount
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
          +s.setTitle( RptCurrentEarningsReport.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Employee ID')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Reference')
            +s.setHeader(L[3], W[3], "right", 'Gross Amt')
            +s.setHeader(L[4], W[4], "right", 'Additi. Amt')
            +s.setHeader(L[5], W[5], "right", 'Deduct. Amt')
            +s.setHeader(L[6], W[6], "right", 'Net Amount')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var employee_id;
      var employee_id_new;
      var st_amount=0;
      var rt_amount=0;

      for(i=0;i<h2.length;i++){
        if(employee_id!=h2[i].employee_id){
          // sub_total
          if(i>0){
            html+=''
              +s.setSubTotal(L[6], W[6], "right", ribuan(st_amount) )
              +'<br>'
          };

          // group 1
          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].employee_id )
            +'<br>'
          st_amount=0;
        };
        
        html+=''
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].reference )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].gross_amount) )
          +s.setLabel(L[4], W[4], "right", 0 )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].deduction_amount) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].net_amount) )

        html+='<br>';
        
        st_amount+=Number(h2[i].net_amount);
        rt_amount+=Number(h2[i].net_amount);
        employee_id=h2[i].employee_id;
      }
      html+=''
        +s.setSubTotal(L[6], W[6], "right", ribuan(st_amount) )
        +'<br>'
      html+=''
        +s.setTotalA(L[6], W[6], "right", ribuan(rt_amount) )
        +'<br>'
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
    if( a.employee_id === b.employee_id ){
      return 0;
    }
    else{
      if( a.employee_id < b.employee_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptCurrentEarningsReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCurrentEarningsReport.preview(indek); });
  toolbar.preview(indek,()=>{ RptCurrentEarningsReport.filterExecute(indek); });
  RptCurrentEarningsReport.formFilter(indek);
};

RptCurrentEarningsReport.formFilter=(indek)=>{
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
        
      +'<li><label>Employee ID</label>'
        +'<input type="text" id="employee_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('employee_id_'+indek, bingkai[indek].rpt.filter.employee_id ); 
};

RptCurrentEarningsReport.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCurrentEarningsReport.getPeriod(indek);
};

RptCurrentEarningsReport.getPeriod=(indek)=>{
  RptCurrentEarningsReport.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptCurrentEarningsReport.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "employee_id": getEV("employee_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCurrentEarningsReport.preview(indek);
};

RptCurrentEarningsReport.print=(indek)=>{};




//eof:292;
