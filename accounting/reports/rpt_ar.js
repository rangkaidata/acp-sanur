/*
 * auth: budiono;
 * date: Dec-03, 22:24, tue-2024; #28; files;
 * edit: may-07, 11:35, wed-2025; #35; 
 * edit: dec-22, 13:48, mon-2025; #85; report_std;
 */ 

'use strict';

var RptAR={}
  
RptAR.table_name='ar';
RptAR.title='Aged Receivables';
RptAR.form=new ActionForm2(RptAR);
RptAR.customer=new CustomerLook(RptAR);

RptAR.show=(tiket)=>{
  tiket.modul=Calculator.table_name;
  tiket.menu.name=RptAR.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "date":"",
      "customer_id": "",
      "customer_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    RptAR.preview(indek);
  }else{
    show(baru);
  }
}

RptAR.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    bingkai[indek].rpt.refresh=true;
    RptAR.proses(indek);
  }else{
    RptAR.display(indek);
  }
}

RptAR.proses=(indek)=>{
  var date=bingkai[indek].rpt.filter.date;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  
  function getA(callback){
    var sql="SELECT customer_id,invoice_no,invoice_date,amount_due"
      +" FROM invoice_receipt_sum"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND invoice_date <='"+date+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=[
      "customer_id",
      "invoice_no",
      "invoice_date",
      "q30",
      "q60",
      "q90",
      "qover90",
      "amount_due"
    ];
    var i=0;
    var r=[];
    var d2;
    var d3;
    var q30,q60,q90,qover90;
    var d 
    
    for(i=0;i<a.length;i++){
      
      d=new Date(date);
      d2=new Date(a[i][2]);

      
      d3=dateDiff(d,d2);
      
      q30=0;
      q60=0;
      q90=0;
      qover90=0;

      if(parseInt(d3.days)<31){
        q30=Number(a[i][3]);
      }
      if(parseInt(d3.days)>30 && parseInt(d3.days)<61){
        q60=Number(a[i][3]);
      }
      
      if(parseInt(d3.days)>60 && parseInt(d3.days)<91){
        q90=Number(a[i][3]);
      }

      if(parseInt(d3.days)>90){
        qover90=Number(a[i][3]);
      }
      
      r.push([
        a[i][0], // customer_id
        a[i][1], // invoice_no
        a[i][2], // invoice_date
        q30, // 0-30
        q60, // 30-60
        q90, // 60-90
        qover90, // over90
        a[i][3], // amount_due
      ]);
    }
    
    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getRptDefault(indek,()=>{
    date=bingkai[indek].rpt.filter.date;
    customer_id=bingkai[indek].rpt.filter.customer_id;
    getA(()=>{
      getSumArray(()=>{
        RptAR.display(indek);
      });
    });
  });
}

RptAR.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptAR.proses(indek); });
  toolbar.filter(indek,()=>{ RptAR.filter(indek); });
  toolbar.print(indek,()=>{ RptAR.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.sum_array);
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // customer_id
    90, // invoice_no
    90,  // 030
    90,  // 3060
    90,  // 6090
    90,  // over90
    90,  // amount_due
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
    +'<div class="report">' //a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">' //b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'//d

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptAR.title )
          +s.setAsof2( filter.date,"")

          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
  
            +s.setHeader(L[0], W[0], "left", 'Customer ID')
            +s.setHeader(L[1], W[1], "left", 'Invoice No.')
            +s.setHeader(L[2], W[2], "right", '0 - 30')
            +s.setHeader(L[3], W[3], "right", '30 - 60')
            +s.setHeader(L[4], W[4], "right", '60 - 90')
            +s.setHeader(L[5], W[5], "right", 'Over 90')
            +s.setHeader(L[6], W[6], "right", 'Amount Due')
            +'<br>'
            
        +'</div>'// d
      +'</div>'//c

//--detail
      +'<div class="report-detail">';//e
        var i;
        var next_customer_id;

        var sum_q30=0
        var sum_q60=0
        var sum_q90=0
        var sum_qover90=0
        var sum_amount_due=0;
        
        var tot_q30=0
        var tot_q60=0
        var tot_q90=0
        var tot_qover90=0
        var tot_amount_due=0

        for(i=0;i<h.length;i++){
          html+=''
            +s.setLabel(L[0], W[0], "left", h[i].customer_id )
            +s.setLabel(L[1], W[1], "left", h[i].invoice_no )
            +s.setLabel(L[2], W[2], "right", h[i].q30 )
            +s.setLabel(L[3], W[3], "right", h[i].q60 )
            +s.setLabel(L[4], W[4], "right", h[i].q90 )
            +s.setLabel(L[5], W[5], "right", h[i].qover90 )
            +s.setLabel(L[6], W[6], "right", h[i].amount_due )
          html+='<br>';
          
          sum_q30+=Number(h[i].q30);
          sum_q60+=Number(h[i].q60);
          sum_q90+=Number(h[i].q90);
          sum_qover90+=Number(h[i].qover90);
          sum_amount_due+=Number(h[i].amount_due);
          //total
          tot_q30+=Number(h[i].q30);
          tot_q60+=Number(h[i].q60);
          tot_q90+=Number(h[i].q90);
          tot_qover90+=Number(h[i].qover90);
          tot_amount_due+=Number(h[i].amount_due);
          
          // footer
          next_customer_id="";
          if(i<h.length-1){
            next_customer_id=h[i+1].customer_id;
          }
          
          if(h[i].customer_id!=next_customer_id){
            html+=subTotal(2,sum_q30);
            html+=subTotal(3,sum_q60);
            html+=subTotal(4,sum_q90);
            html+=subTotal(5,sum_qover90);
            html+=subTotal(6,sum_amount_due);
            html+='<br>';
            // reset
            sum_q30=0;
            sum_q60=0;
            sum_q90=0;
            sum_qover90=0;
            sum_amount_due=0;
          }
        }
        html+='<br>'
          +s.setTotalA(L[0], 300, "left", "Report Total" )
          +s.setTotalA(L[2], W[2], "right", tot_q30 )
          +s.setTotalA(L[3], W[3], "right", tot_q60 )
          +s.setTotalA(L[4], W[4], "right", tot_q90 )
          +s.setTotalA(L[5], W[5], "right", tot_qover90 )
          +s.setTotalA(L[6], W[6], "right", tot_amount_due )
        +'</div>'// e'
    +'</div>';//b
  +'</div>';//a
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

  function subTotal(baris,nilai){
    // sub total
    var s2=new rptHTML();
    return  s2.setSubTotal(L[baris], W[baris], "right", nilai );
  }
}

RptAR.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptAR.preview(indek); });
  toolbar.preview(indek,()=>{ RptAR.filterExecute(indek); });
  RptAR.formFilter(indek);
}

RptAR.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Date:</label>'
        +'<input type="date" id="date_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Customer ID:</label>'
        +'<input type="text" '
          +' id="customer_id_'+indek+'" '
          +' size="17"'
          +' onchange="RptAR.getCustomer(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="RptAR.customer.getPaging(\''+indek+'\''
          +',\'customer_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" '
          +' id="customer_name_'+indek+'" disabled>'
      +'</li>'
    +'<ul>'
    +'</div>'

  content.html(indek,html);
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('customer_id_'+indek, bingkai[indek].rpt.filter.customer_id ); 
  setEV('customer_name_'+indek, bingkai[indek].rpt.filter.customer_name ); 
}

RptAR.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptAR.getCustomer(indek);
};


RptAR.getCustomer=(indek)=>{
  message.none(indek);
  RptAR.customer.getOne(indek,
    getEV('customer_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_name_'+indek, d.name);
    }else{
      setEV('customer_name_'+indek, '');
    }
  });
}

RptAR.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
    "customer_id": getEV('customer_id_'+indek),
    "customer_name": getEV('customer_name_'+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptAR.preview(indek);
};




/*
 * 1rem - 16px;
 * 1.5em - 20px;
 * 2rem - 32px;
 * 0.5rem - 8px;
 */ 


// eof: 311;
