/*
 * name: budiono;
 * date: may-09, 14:26, fri-2025; #54; reports;
 * date: jun-10, 08:01, tue-2025; #57; payroll_fields;
 */

'use strict';

var RptEmployeeList={}
  
RptEmployeeList.table_name='rpt_employee_list';
RptEmployeeList.title='Employee List';
RptEmployeeList.period=new PeriodLook(RptEmployeeList);

RptEmployeeList.show=(tiket)=>{
  tiket.modul=RptEmployeeList.table_name;
  tiket.menu.name=RptEmployeeList.title;
  tiket.rpt={
    "filter":{
      "employee_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptEmployeeList.preview(indek);
  }else{
    show(baru);
  }
}

RptEmployeeList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptEmployeeList.proses(indek);
  } else {  
    RptEmployeeList.display(indek);
  };
};

RptEmployeeList.proses=(indek)=>{
  
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
      return callback();
    });
  }
  
  function getEmployees(callback){
    var employee_id=bingkai[indek].rpt.filter.employee_id;
    var sql="SELECT employee_id,name,address,social_security,"
      +" marital_status,pay_method"
      +" FROM employees"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
    if(employee_id!=""){
      sql+=" AND employee_id='"+employee_id+"'";
    }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.employees=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.employees).rows;
    var f=["employee_id","name","address","social_security",
      "status","pay_method"
    ];
    var i=0;
    var r=[];
    var d;
    
    for(i=0;i<a.length;i++){
      d=JSON.parse( a[i][2] );
      r.push([
        a[i][0], //employee_id
        a[i][1], //name
        d.street_1, //address
        a[i][3], //social_security
        a[i][4], //marital_status
        a[i][5], //pay_method
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getEmployees(()=>{
      getJoinArray(()=>{
        RptEmployeeList.display( indek );
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptEmployeeList.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptEmployeeList.proses(indek); });
  toolbar.filter(indek,()=>{ RptEmployeeList.filter(indek); });
  toolbar.print(indek,()=>{ RptEmployeeList.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // vendor_id
    130, // name
    200, // address
    90, // social_security
    70, // marital_status
    85, // pay_method
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
          +s.setTitle( RptEmployeeList.title )
          +s.setNone()

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Employee ID')
            +s.setHeader(L[1], W[1], "left", 'Employee Name')
            +s.setHeader(L[2], W[2], "left", 'Address')
            +s.setHeader(L[3], W[3], "left", 'Soc. Security')
            +s.setHeader(L[4], W[4], "left", 'Marital')
            +s.setHeader(L[5], W[5], "left", 'Pay Method')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].employee_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "left", h2[i].address )
          +s.setLabel(L[3], W[3], "left", h2[i].social_security )
          +s.setLabel(L[4], W[4], "left", array_marital_status[h2[i].status] )
          +s.setLabel(L[5], W[5], "left", array_pay_method[h2[i].pay_method] )
        html+='<br>';
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
    if( a.vendor_id === b.vendor_id ){
      return 0;
    }
    else{
      if( a.vendor_id < b.vendor_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptEmployeeList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptEmployeeList.preview(indek); });
  toolbar.preview(indek,()=>{ RptEmployeeList.filterExecute(indek); });
  RptEmployeeList.formFilter(indek);
};

RptEmployeeList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>Employee ID</label>'
        +'<input type="text" id="employee_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('employee_id_'+indek, bingkai[indek].rpt.filter.employee_id ); 
  document.getElementById('employee_id_'+indek).focus();
};

RptEmployeeList.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "employee_id": getEV("employee_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptEmployeeList.preview(indek);
};

RptEmployeeList.print=(indek)=>{};




//eof: 259;
