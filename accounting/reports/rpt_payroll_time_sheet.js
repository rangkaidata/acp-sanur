/*
 * name: budiono;
 * date: jul-21, 12:36, mon-2025; #64; 
 */

'use strict';

var RptPayrollTimeSheet={}
  
RptPayrollTimeSheet.table_name='rpt_payroll_time_sheet';
RptPayrollTimeSheet.title='Payroll Time Sheet';
RptPayrollTimeSheet.period=new PeriodLook(RptPayrollTimeSheet);

RptPayrollTimeSheet.show=(tiket)=>{
  tiket.modul=RptPayrollTimeSheet.table_name;
  tiket.menu.name=RptPayrollTimeSheet.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptPayrollTimeSheet.preview(indek);
  }else{
    show(baru);
  }
}

RptPayrollTimeSheet.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPayrollTimeSheet.proses(indek);
  } else {  
    RptPayrollTimeSheet.display(indek);
  };
};

RptPayrollTimeSheet.proses=(indek)=>{
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  
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
          from=d[0].start_date;
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
          to=tglSekarang();
        }
      }
      return callback();
    });
  }
  
  function getA(callback){
    var sql="SELECT record_id,record_name"
      +",ticket_no,date,daily_detail,weekly_detail"
      +" FROM time_tickets"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=[
      "employee_id",
      "name",
      "ticket_no",
      "date",
      "payroll_used",
      "unit_duration"
    ];
    var i=0;
    var r=[];
    var d;
    
    for(i=0;i<a.length;i++){
      d=JSON.parse(a[i][4]);
      r.push([
        a[i][0], // employee_id
        a[i][1], // name
        a[i][2], // ticket_no
        a[i][3], // date
        d.used_in_payroll,
        d.unit_duration
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getA(()=>{
      getJoinArray(()=>{
        RptPayrollTimeSheet.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptPayrollTimeSheet.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptPayrollTimeSheet.proses(indek); });
  toolbar.filter(indek,()=>{ RptPayrollTimeSheet.filter(indek); });
  toolbar.print(indek,()=>{ RptPayrollTimeSheet.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    120, // employee_id
    90, // ticket_no
    90, // date
    90, // payroll_used
    90, // unit_duration;
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
          +s.setTitle( RptPayrollTimeSheet.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Employee ID')
//            +s.setHeader(L[1], W[1], "left", 'Name')
            +s.setHeader(L[1], W[1], "left", 'Ticket No.')
            +s.setHeader(L[2], W[2], "left", 'Date')
            +s.setHeader(L[3], W[3], "left", 'Payroll Used')
            +s.setHeader(L[4], W[4], "left", 'Unit Duration')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var employee_id;
      var X=300;
      var sub_total=0;

      for(i=0;i<h2.length;i++){
        if(employee_id!=h2[i].employee_id){
          if(i>0){
            html+=''
              +s.setSubTotal(L[4], W[4], "right", ribuan(sub_total) )
              +'<br>'
          }
          html+=''
            +s.setLabel(L[0], X, "left", h2[i].name )  
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].employee_id );
        }
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].ticket_no )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].date) )
          +s.setLabel(L[3], W[3], "left", h2[i].payroll_used )
          +s.setLabel(L[4], W[4], "right", h2[i].unit_duration )

        html+='<br>';
        employee_id=h2[i].employee_id;
        sub_total+=Number(h2[i].unit_duration);
      }
      html+=''
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
    if( String(a.employee_id).concat(a.date) === String(b.employee_id).concat(b.date) ){
      return 0;
    }
    else{
      if( String(a.employee_id).concat(a.date) < String(b.employee_id).concat(b.date) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptPayrollTimeSheet.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptPayrollTimeSheet.preview(indek); });
  toolbar.preview(indek,()=>{ RptPayrollTimeSheet.filterExecute(indek); });
  RptPayrollTimeSheet.formFilter(indek);
};

RptPayrollTimeSheet.formFilter=(indek)=>{
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

    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
};

RptPayrollTimeSheet.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptPayrollTimeSheet.getPeriod(indek);
};

RptPayrollTimeSheet.getPeriod=(indek)=>{
  RptPayrollTimeSheet.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptPayrollTimeSheet.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPayrollTimeSheet.preview(indek);
};

RptPayrollTimeSheet.print=(indek)=>{};



//eof: 292;
