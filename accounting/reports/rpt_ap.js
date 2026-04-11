/*
 * auth: budiono;
 * date: Dec-03, 22:24, tue-2024; #28; files;
 * edit: may-07, 11:35, wed-2025; #35; 
 * edit: dec-25, 10:17, thu-2025; #85; report-std;
 */ 

'use strict';

var RptAP={}
  
RptAP.table_name='ap';
RptAP.title='Aged Payables';
RptAP.form=new ActionForm2(RptAP);
RptAP.vendor=new VendorLook(RptAP);

RptAP.show=(tiket)=>{
  tiket.modul=Calculator.table_name;
  tiket.menu.name=RptAP.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "date":"",
      "vendor_id": "",
      "vendor_name": ""
    },
    "refresh":false,
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
      
    RptAP.preview(indek);
  }else{
    show(baru);
  }
}

RptAP.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });

  if(bingkai[indek].rpt.refresh==false){
    RptAP.proses(indek);
    bingkai[indek].rpt.refresh=true;
  }else{
    RptAP.display(indek);
  }

}

RptAP.proses=(indek,callback)=>{
  
  var date=bingkai[indek].rpt.filter.date;
  var vendor_id=bingkai[indek].rpt.filter.vendor_id;
  
  function getA(callback){
    var sql="SELECT vendor_id,invoice_no,date_due,amount_due,"
      +"ap_account_id,amount_due"
      +" FROM receive_payment_sum"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND invoice_date <='"+date+"'";
      if(vendor_id!=""){
        sql+=" AND vendor_id='"+vendor_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.ap=h;
      return callback();
    });
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.ap).rows;
    var f=[
      "vendor_id",
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
        a[i][0], // vendor_id
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

    getA(()=>{
      getSumArray(()=>{
        RptAP.display(indek);
      });
    });
  });
}

RptAP.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptAP.proses(indek); });
  toolbar.filter(indek,()=>{ RptAP.filter(indek); });
  toolbar.print(indek,()=>{ RptAP.print(indek); });

  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.sum_array);
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // vendor_id
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
          +s.setTitle( RptAP.title )
          +s.setAsof2( filter.date,"")

          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
  
            +s.setHeader(L[0], W[0], "left", 'Vendor ID')
            +s.setHeader(L[1], W[1], "left", 'Invoice No.')
            +s.setHeader(L[2], W[2], "right", '0 - 30')
            +s.setHeader(L[3], W[3], "right", '30 - 60')
            +s.setHeader(L[4], W[4], "right", '60 - 90')
            +s.setHeader(L[5], W[5], "right", 'Over 90')
            +s.setHeader(L[6], W[6], "right", 'Amount Due')
            +'<br>'
            
        +'</div>'// d
      +'</div>'//c
    
      +'<div class="report-detail">';//e
        var i;
        var vendor_id;

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
            +s.setLabel(L[0], W[0], "left", h[i].vendor_id )
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
          vendor_id="";
          if(i<h.length-1){
            vendor_id=h[i+1].vendor_id;
          }
          
          if(h[i].vendor_id!=vendor_id){
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
  
  renderLine(indek,L);

  function subTotal(baris,nilai){
    // sub total
    var s2=new rptHTML();
    return  s2.setSubTotal(L[baris], W[baris], "right", nilai );
  }

}

RptAP.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptAP.preview(indek); });
  toolbar.preview(indek,()=>{RptAP.filterExecute(indek); });
  RptAP.formFilter(indek);
}

RptAP.formFilter=(indek)=>{
  
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li><label>Date As of</label>'
        +'<input type="date" id="date_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Vendor ID:</label>'
        +'<input type="text" '
          +' id="vendor_id_'+indek+'" '
          +' size="17"'
          +' onchange="RptAP.getVendor(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="RptAP.vendor.getPaging(\''+indek+'\''
          +',\'vendor_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" '
          +' id="vendor_name_'+indek+'" disabled>'
      +'</li>'

    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('vendor_id_'+indek, bingkai[indek].rpt.filter.vendor_id ); 
  setEV('vendor_name_'+indek, bingkai[indek].rpt.filter.vendor_name ); 
}

RptAP.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek)
  }
  bingkai[indek].rpt.refresh=false;
  RptAP.preview(indek);
}

RptAP.setVendor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.vendor_id);
  RptAP.getVendor(indek);
};


RptAP.getVendor=(indek)=>{
  message.none(indek);
  RptAP.vendor.getOne(indek,
    getEV('vendor_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('vendor_name_'+indek, d.name);
    }else{
      setEV('vendor_name_'+indek, '');
    }
  });
}


RptAP.print=(indek)=>{
  alert('cetak');
}

RptAP.cetak=()=>{
  var a=document.getElementById('cetak').innerHTML;
  var w=window.open();
  w.document.write('<style>body{left:0;top:0;font-size:12px;}</style>');
  w.document.write(a);
  w.print();
  w.close();
  
}

/*
 * 1rem - 16px;
 * 1.5em - 20px;
 * 2rem - 32px;
 * 0.5rem - 8px;
 */ 



// eof: 
