/*
 * name: budiono;
 * date: jun-01, 17:08, sun-2025; #56; 
 */

'use strict';

var RptPayrollTaxReport={}
  
RptPayrollTaxReport.table_name='rpt_payroll_tax_report';
RptPayrollTaxReport.title='Payroll Tax Report';
RptPayrollTaxReport.period=new PeriodLook(RptPayrollTaxReport);

RptPayrollTaxReport.show=(tiket)=>{
  tiket.modul=RptPayrollTaxReport.table_name;
  tiket.menu.name=RptPayrollTaxReport.title;
  tiket.rpt={
    "filter":{
      "date":tglSekarang(),
      "employee_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptPayrollTaxReport.preview(indek);
  }else{
    show(baru);
  }
}

RptPayrollTaxReport.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPayrollTaxReport.proses(indek);
  } else {  
    RptPayrollTaxReport.display(indek);
  };
};

RptPayrollTaxReport.proses=(indek)=>{
  
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
    var date=bingkai[indek].rpt.filter.date;
    var sql="SELECT employee_id,pay_field,employee_field"
      +" FROM payroll_entry"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+date+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.payroll_entry=h;
      return callback();
    });
  }

  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.payroll_entry).rows;
    var f=["employee_id","adjusted_gross","taxable_gross",
      "excess_gross","tax_amount"
    ];
    var i,j,d;
    var r=[];
    var pay_amount=0;
    var tax_amount=0;
    
    for(i=0;i<a.length;i++){
      
      pay_amount=0;      
      d=JSON.parse(a[i][1]);
      
      for(j=0;j<d.length;j++){
        pay_amount+=Number( d[j].amount );
      }

      tax_amount=0;
      d=JSON.parse(a[i][2]);
      
      for(j=0;j<d.length;j++){
        if( String(d[j].field_name).toLowerCase()=='soc_sec' ){
          tax_amount+=Number( d[j].amount );
        }
      }
      
      r.push([
        a[i][0],       // 0-employee_id
        pay_amount,    // 1-adjusted_gross
        pay_amount,    // 2-taxable_gross
        0,             // 3-excess_gross
        tax_amount, // 4-tax_amount
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
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
          ada=1;
          r[j][1]+=Number(a[i][1]);
          r[j][2]+=Number(a[i][2]);
          r[j][3]+=Number(a[i][3]);
          r[j][4]+=Number(a[i][4]);
        }
      }
      
      if(ada==0){
        r.push([
          a[i][0],
          a[i][1],
          a[i][2],
          a[i][3],
          a[i][4],
        ])
      }
    }
    
    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getPayrollEntry(()=>{
      getJoinArray(()=>{
        getSumArray(()=>{
          RptPayrollTaxReport.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptPayrollTaxReport.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptPayrollTaxReport.proses(indek); });
  toolbar.filter(indek,()=>{ RptPayrollTaxReport.filter(indek); });
  toolbar.print(indek,()=>{ RptPayrollTaxReport.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    100, // employee_id
    110, // adjusted_gross (adjusted gross)
    110, // taxable_gross (taxable gross)
    110, // excess_gross (excess gross)
    110, // tax_amount (tax amount)
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
          +s.setTitle( RptPayrollTaxReport.title )
          +s.setAsof( filter.date )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Employee ID')
            +s.setHeader(L[1], W[1], "right", 'Adj. Gross')
            +s.setHeader(L[2], W[2], "right", 'Taxable Gross')
            +s.setHeader(L[3], W[3], "right", 'Excess Gross')
            +s.setHeader(L[4], W[4], "right", 'Tax Amount')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var tot_adjusted_gross=0;
      var tot_taxable_gross=0;
      var tot_excess_gross=0;
      var tot_tax_amount=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].employee_id )
          +s.setLabel(L[1], W[1], "right", ribuan(h2[i].adjusted_gross) )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].taxable_gross) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].excess_gross) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].tax_amount) )
          
        tot_adjusted_gross+=Number(h2[i].adjusted_gross)
        tot_taxable_gross+=Number(h2[i].taxable_gross)
        tot_excess_gross+=Number(h2[i].excess_gross)
        tot_tax_amount+=Number(h2[i].tax_amount)

        html+='<br>';
      }
      html+=''
        +s.setTotalA(L[1], W[1], "right", ribuan(tot_adjusted_gross) )
        +s.setTotalA(L[2], W[2], "right", ribuan(tot_taxable_gross) )
        +s.setTotalA(L[3], W[3], "right", ribuan(tot_excess_gross) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_tax_amount) )
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

RptPayrollTaxReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptPayrollTaxReport.preview(indek); });
  toolbar.preview(indek,()=>{ RptPayrollTaxReport.filterExecute(indek); });
  RptPayrollTaxReport.formFilter(indek);
};

RptPayrollTaxReport.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'

      +'<li><label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
        +'</li>'
        
      +'<li><label>Employee ID</label>'
        +'<input type="text" id="employee_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('employee_id_'+indek, bingkai[indek].rpt.filter.employee_id ); 
};

RptPayrollTaxReport.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "employee_id": getEV("employee_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPayrollTaxReport.preview(indek);
};

RptPayrollTaxReport.print=(indek)=>{};



//eof:288;340;
