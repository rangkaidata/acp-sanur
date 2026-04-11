/*
 * name: budiono;
 * date: may-20, 15:54, tue-2025; #55; 
 * edit: dec-25, 15:17, thu-2025; #85; report-std;
 */

'use strict';

var RptCashRequirements={}
  
RptCashRequirements.table_name='rpt_cash_requirements';
RptCashRequirements.title='Cash Requirements';
RptCashRequirements.period=new PeriodLook(RptCashRequirements);
RptCashRequirements.vendor=new VendorLook(RptCashRequirements);

RptCashRequirements.show=(tiket)=>{
  tiket.modul=RptCashRequirements.table_name;
  tiket.menu.name=RptCashRequirements.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "date":"",
      "vendor_id": "",
      "vendor_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptCashRequirements.preview(indek);
  }else{
    show(baru);
  }
}

RptCashRequirements.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCashRequirements.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptCashRequirements.display(indek);
  };
};

RptCashRequirements.proses=(indek)=>{
  
  var date=bingkai[indek].rpt.filter.date;
  var vendor_id=bingkai[indek].rpt.filter.vendor_id;

  function getCashRequirements (callback){
    var vendor_id=bingkai[indek].rpt.filter.vendor_id || "" ;
    var date=bingkai[indek].rpt.filter.date;
    var sql="SELECT vendor_id"
      +",invoice_no"
      +",invoice_date AS date"
      +",date_due"
      +",amount_due"
      +",discount"
      +" FROM receive_payment_sum"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND amount_due != 0"
      +" AND date_due <= '"+date+"'"
      if(vendor_id!=""){
        sql+=" AND vendor_id='"+vendor_id+"'";
      }

    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.cash_requirements=h;
      return callback();
    });
  }
  
  getRptDefault(indek,()=>{
    date=bingkai[indek].rpt.filter.date;
    
    getCashRequirements(()=>{
      RptCashRequirements.display(indek);
    });
  });
};

RptCashRequirements.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptCashRequirements.proses(indek); });
  toolbar.filter(indek,()=>{ RptCashRequirements.filter(indek); });
  toolbar.print(indek,()=>{ RptCashRequirements.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.cash_requirements );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // vendor_id
    90, // invoice_no
    90,  // date
    90,  // date_due
    90,  // amount_due
    90,  // disc_amt
    90,  // age
    90,  // closing
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
          +s.setTitle( RptCashRequirements.title )
          +s.setAsof( filter.date )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Vendor ID')
          +s.setHeader(L[1], W[1], "left", 'Invoice')
          +s.setHeader(L[2], W[2], "left", 'Date')
          +s.setHeader(L[3], W[3], "left", 'Date Due')
          +s.setHeader(L[4], W[4], "right", 'Amount Due')
          +s.setHeader(L[5], W[5], "right", 'Disc Amt')
          +s.setHeader(L[6], W[6], "center", 'Age')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var date_diff=0;
      var date_now=new Date( filter.date );
      var date_due;
      var vendor_id="";
      var sub_total=0;
      var report_total=0

      for(var i=0;i<h2.length;i++){
        date_due=new Date( h2[i].date_due );
        date_diff=dateDiff(date_now,date_due).days;
        
        if(i==0){
          vendor_id=h2[i].vendor_id;
          html+=s.setLabel(L[0],W[0], "left", h2[i].vendor_id )
//            +setLabel(L_1, 150, "left", h2[i].name )
            +'<br>';
        }
        
        if(vendor_id==h2[i].vendor_id){
          
        }else{
          
          html+=''
            +s.setTotal(L[4],W[4], "right", ribuan(sub_total) )    
            +'<br>'
            +s.setLabel(L[0],W[0], "left", h2[i].vendor_id )
//            +setLabel(L_1, 150, "left", h2[i].name )
            +'<br>';
          sub_total=0;
        }
        
        html+=''
          +s.setLabel(L[1],W[1], "left", h2[i].invoice_no )
          +s.setLabel(L[2],W[2], "left", tglWest(h2[i].date) )
          +s.setLabel(L[3],W[3], "left", tglWest(h2[i].date_due) )
          +s.setLabel(L[4],W[4], "right", ribuan(h2[i].amount_due) )
          +s.setLabel(L[5],W[5], "right", ribuan(h2[i].discount) )
          +s.setLabel(L[6],W[6], "right", date_diff )
        html+='<br>';
        
        vendor_id=h2[i].vendor_id;
        
        sub_total+=Number(h2[i].amount_due);
        report_total+=Number(h2[i].amount_due);
      }
      html+=''
        +s.setTotal(L[4],W[4], "right", ribuan(sub_total) )
        +'<br>'
        +s.setTotalA(L[4],W[4], "right", ribuan0(report_total) )
        +'<br>'
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

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

RptCashRequirements.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCashRequirements.preview(indek); });
  toolbar.preview(indek,()=>{ RptCashRequirements.filterExecute(indek); });
  RptCashRequirements.formFilter(indek);
};

RptCashRequirements.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Vendor ID:</label>'
        +'<input type="text" '
          +' id="vendor_id_'+indek+'" '
          +' size="17"'
          +' onchange="RptCashRequirements.getVendor(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="RptCashRequirements.vendor.getPaging(\''+indek+'\''
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
};

RptCashRequirements.setVendor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.vendor_id);
  RptCashRequirements.getVendor(indek);
};

RptCashRequirements.getVendor=(indek)=>{
  message.none(indek);
  RptCashRequirements.vendor.getOne(indek,
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

RptCashRequirements.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCashRequirements.preview(indek);
};

RptCashRequirements.print=(indek)=>{};


// eof: 309;291;
