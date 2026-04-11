/*
 * name: budiono;
 * date: may-31, 08:47, sat-2025; #56; 
 */

'use strict';

var RptPayrollCheckRegister={}
  
RptPayrollCheckRegister.table_name='rpt_payroll_check_register';
RptPayrollCheckRegister.title='Payroll Check Register';
RptPayrollCheckRegister.period=new PeriodLook(RptPayrollCheckRegister);

RptPayrollCheckRegister.show=(tiket)=>{
  tiket.modul=RptPayrollCheckRegister.table_name;
  tiket.menu.name=RptPayrollCheckRegister.title;
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

    RptPayrollCheckRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptPayrollCheckRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPayrollCheckRegister.proses(indek);
  } else {  
    RptPayrollCheckRegister.display(indek);
  };
};

RptPayrollCheckRegister.proses=(indek)=>{
  
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
    var employee_id=bingkai[indek].rpt.filter.employee_id;
    var sql="SELECT payroll_no,date,employee_name,net_amount"
      +" FROM payroll_entry"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
      if(employee_id!=""){
        sql+=" AND employee_id='"+employee_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.payroll_entry=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.payroll_entry).rows;
    var f=["reference","date","name","amount"];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], // 0-reference
        a[i][1], // 1-date
        a[i][2], // 2-name
        a[i][3], // 3-amount
      ]);
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
        RptPayrollCheckRegister.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptPayrollCheckRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptPayrollCheckRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptPayrollCheckRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptPayrollCheckRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-reference
    90, // 1-date
    150, // 2-name
    90, // 3-amount
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
          +s.setTitle( RptPayrollCheckRegister.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Reference')
            +s.setHeader(L[1], W[1], "left", 'Date')
            +s.setHeader(L[2], W[2], "left", 'Name')
            +s.setHeader(L[3], W[3], "right", 'Amount')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var tot=0;
      var subtot=0;
      var date;

      for(i=0;i<h2.length;i++){
        if(i==0){
          date=h2[i].date
        }
        if(date!=h2[i].date){
          html+=""
            +s.setSubTotal(L[3], W[3], "right", ribuan(subtot) )
            +"<br>"
            
          subtot=0;
        }
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].reference )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].name )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].amount) )
          
        html+='<br>';
        
        tot+=Number( h2[i].amount );
        subtot+=Number( h2[i].amount );
        date=h2[i].date;
      }
      html+=''
        +s.setSubTotal(L[3], W[3], "right", ribuan(subtot) )
        +"<br>"
        +s.setTotalA(L[3], W[3], "right", ribuan(tot) )
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
    if( (a.date).concat(a.reference) === (b.date).concat(b.reference) ){
      return 0;
    }
    else{
      if( (a.date).concat(a.reference) < (b.date).concat(b.reference) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptPayrollCheckRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptPayrollCheckRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptPayrollCheckRegister.filterExecute(indek); });
  RptPayrollCheckRegister.formFilter(indek);
};

RptPayrollCheckRegister.formFilter=(indek)=>{
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

RptPayrollCheckRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptPayrollCheckRegister.getPeriod(indek);
};

RptPayrollCheckRegister.getPeriod=(indek)=>{
  RptPayrollCheckRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptPayrollCheckRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "employee_id": getEV("employee_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPayrollCheckRegister.preview(indek);
};

RptPayrollCheckRegister.print=(indek)=>{};




//eof:290;
