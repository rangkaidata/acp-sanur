/*
 * name: budiono;
 * date: may-31, 11:51, sun-2025; #56; 
 */

'use strict';

var RptPayrollRegister={}
  
RptPayrollRegister.table_name='rpt_payroll_register';
RptPayrollRegister.title='Payroll Register';
RptPayrollRegister.period=new PeriodLook(RptPayrollRegister);

RptPayrollRegister.show=(tiket)=>{
  tiket.modul=RptPayrollRegister.table_name;
  tiket.menu.name=RptPayrollRegister.title;
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

    RptPayrollRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptPayrollRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPayrollRegister.proses(indek);
  } else {  
    RptPayrollRegister.display(indek);
  };
};

RptPayrollRegister.proses=(indek)=>{
  
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
  
  function getPayrollEntry(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var sql="SELECT "
      +" employee_id"   // 0
      +",employee_name"          // 1
      +",pay_field"  // 2
      +",net_amount"        // 3
      +",employee_field" // 4
      +",date"          // 5
      +",payroll_no"     // 6
      
      +" FROM payroll_entry"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.receive_inventory=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.receive_inventory).rows;
    var f=["employee_id","name",
      "pay_type","pay_hour",
      "pay_amount","net_amount",
      "field_name","amount",
      "date","reference"
    ];
    var i,j,k;
    var r=[];
    var pay_type,pay_hour,pay_amount;
    var d;
    
    for(i=0;i<a.length;i++){
      
      pay_type='';
      pay_hour=0;
      pay_amount=0;

      d=JSON.parse( a[i][2] );

      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          pay_type=d[j].field_name;
          if(d[j].rate==0){
            pay_hour="";
          } else {
            pay_hour=d[j].salary;
          }
          pay_amount=d[j].amount;
        }
      }

      d=JSON.parse( a[i][4] );

      for(j=0;j<d.length;j++){
        r.push([
          a[i][0],        // 0-employee_id;
          a[i][1],        // 1-name;
          pay_type,       // 2-pay_type;
          pay_hour,       // 3-pay_hour;
          pay_amount,     // 4-pay_amount;
          a[i][3],        // 5-net_amount;
          d[j].field_name,// 6-field_name;
          d[j].amount,    // 7-amount;
          a[i][5],        // 8-date;
          a[i][6],        // 9-reference;
        ]);
      }
    }

    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getPayrollEntry(()=>{
      getJoinArray(()=>{
        RptPayrollRegister.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptPayrollRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptPayrollRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptPayrollRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptPayrollRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    80, // 0-reference
    80, // 1-date
    60, // 2-pay_type
    60, // 3-pay_hour
    90, // 4-pay_amount
    90, // 5-field_name
    90, // 6-amount
    90, // 7-net_amount
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
          +s.setTitle( RptPayrollRegister.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Reference')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Pay Type')
            +s.setHeader(L[3], W[3], "right", 'Pay Hr')
            +s.setHeader(L[4], W[4], "right", 'Pay Amt')
            +s.setHeader(L[5], W[5], "left", 'Field')
            +s.setHeader(L[6], W[6], "right", 'Amount')
            +s.setHeader(L[7], W[7], "right", 'Net Amt')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var employee_id;
      var X=200;
      var subtot=0;

      for(i=0;i<h2.length;i++){
        if(i==0){
          employee_id=(h2[i].employee_id).concat(h2[i].date,h2[i].reference);
          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].employee_id )
            +s.setLabel(L[1], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].reference )
            +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
            +s.setLabel(L[2], W[2], "left", h2[i].pay_type )
            +s.setLabel(L[3], W[3], "right", ribuan(h2[i].pay_hour) )
            +s.setLabel(L[4], W[4], "right", ribuan(h2[i].pay_amount) )
            +s.setLabel(L[7], W[7], "right", ribuan(h2[i].net_amount) )            
        }
        if(employee_id!=(h2[i].employee_id).concat(h2[i].date,h2[i].reference) ){
          html+=''
            +s.setSubTotal(L[6], W[6], "right", ribuan(subtot) )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].employee_id )
            +s.setLabel(L[1], X, "left", h2[i].name )
            +'<br>'
            +s.setLabel(L[0], W[0], "left", h2[i].reference )
            +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
            +s.setLabel(L[2], W[2], "left", h2[i].pay_type )
            +s.setLabel(L[3], W[3], "right", ribuan(h2[i].pay_hour) )
            +s.setLabel(L[4], W[4], "right", ribuan(h2[i].pay_amount) )
            +s.setLabel(L[7], W[7], "right", ribuan(h2[i].net_amount) )            
            
            subtot=0;
        }
        
        html+=''
          +s.setLabel(L[5], W[5], "left", h2[i].field_name )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].amount) )
          
        html+='<br>';
        
        employee_id=(h2[i].employee_id).concat(h2[i].date,h2[i].reference);
        subtot+=Number(h2[i].amount);
      }
      html+=''
        +s.setSubTotal(L[6], W[6], "right", ribuan(subtot) )
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
    if( (a.employee_id).concat(a.date,a.reference) === (b.employee_id).concat(b.date,b.reference) ){
      return 0;
    }
    else{
      if( (a.employee_id).concat(a.date,a.reference) < (b.employee_id).concat(b.date,b.reference) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptPayrollRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptPayrollRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptPayrollRegister.filterExecute(indek); });
  RptPayrollRegister.formFilter(indek);
};

RptPayrollRegister.formFilter=(indek)=>{
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

RptPayrollRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptPayrollRegister.getPeriod(indek);
};

RptPayrollRegister.getPeriod=(indek)=>{
  RptPayrollRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptPayrollRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "employee_id": getEV("employee_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPayrollRegister.preview(indek);
};

RptPayrollRegister.print=(indek)=>{};



//eof:292;
