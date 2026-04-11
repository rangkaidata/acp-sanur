/*
 * name: budiono;
 * date: may-22, 19:34, thu-2025; #55; 
 * edit: dec-24, 12:05, wed-2025; #85; report-std;
 */

'use strict';

var RptQuoteRegister={}
  
RptQuoteRegister.table_name='rpt_quote_register';
RptQuoteRegister.title='Quote Register';
RptQuoteRegister.period=new PeriodLook(RptQuoteRegister);
RptQuoteRegister.customer=new CustomerLook(RptQuoteRegister);

RptQuoteRegister.show=(tiket)=>{
  tiket.modul=RptQuoteRegister.table_name;
  tiket.menu.name=RptQuoteRegister.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "customer_id": "",
      "customer_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    RptQuoteRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptQuoteRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptQuoteRegister.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptQuoteRegister.display(indek);
  };
};

RptQuoteRegister.proses=(indek)=>{

  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var customer_id=bingkai[indek].rpt.filter.customer_id;
  var customer_name=bingkai[indek].rpt.filter.customer_name;
  
  function getQuotes(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var customer_id=bingkai[indek].rpt.filter.customer_id;
    var sql="SELECT quote_no,date,good_thru,customer_name,total"
      +" FROM quotes"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
      if(customer_id!=""){
        sql+=" AND customer_id='"+customer_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.quotes=h;
      return callback();
    });
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;
    getQuotes(()=>{
      RptQuoteRegister.display( indek );
    });
  });
};

RptQuoteRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptQuoteRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptQuoteRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptQuoteRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.quotes );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // quote_no
    90, // date
    90, // good_thru
    250, // name
    120, // amount
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
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d        
          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptQuoteRegister.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Quote No.')
          +s.setHeader(L[1], W[1], "left", 'Date')
          +s.setHeader(L[2], W[2], "left", 'Good Thru')
          +s.setHeader(L[3], W[3], "left", 'Name')
          +s.setHeader(L[4], W[4], "right", 'Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var total=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].quote_no )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].good_thru) )
          +s.setLabel(L[3], W[3], "left", h2[i].customer_name )
          +s.setLabel(L[4], W[4], "right", ribuan0(h2[i].total) )
        html+='<br>';
        
        total+=Number(h2[i].total);
      }
      html+=''
        +s.setTotalA(L[4], W[4], "right", ribuan0(total) )
        +'<br>';
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( a.date === b.date ){
      return 0;
    }
    else{
      if( a.date < b.date ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptQuoteRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptQuoteRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptQuoteRegister.filterExecute(indek); });
  RptQuoteRegister.formFilter(indek);
};

RptQuoteRegister.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
      +'<ul>'    
        +'<li>'
          +'<label>Period</label>'
          +'<input type="text" '
            +' id="period_id_'+indek+'" '
            +' size="17">'
          +'<button type="button" '
            +' id="btn_period_'+indek+'" '
            +' onclick="RptQuoteRegister.period.getPaging(\''+indek+'\''
            +',\'period_id_'+indek+'\')"'
            +' class="btn_find">'
          +'</button>'
        +'</li>'
        +'<li>'
          +'<label>From</label>'
          +'<input type="date" '
            +' id="from_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<label>To</label>'
          +'<input type="date" '
            +' id="to_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<label>Customer ID</label>'
          +'<input type="text" '
            +' id="customer_id_'+indek+'" '
            +' onchange="RptQuoteRegister.getCustomer(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptQuoteRegister.customer.getPaging(\''+indek+'\''
            +',\'customer_id_'+indek+'\')"'
            +' class="btn_find">'
          +'</button>'
        +'</li>'
        +'<li>'
          +'<label>Customer Name</label>'
          +'<input type="text" '
          +' id="customer_name_'+indek+'" disabled>'
        +'</li>'
      +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('customer_id_'+indek, bingkai[indek].rpt.filter.customer_id ); 
  setEV('customer_name_'+indek, bingkai[indek].rpt.filter.customer_name );
};

RptQuoteRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptQuoteRegister.getPeriod(indek);
};

RptQuoteRegister.getPeriod=(indek)=>{
  RptQuoteRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptQuoteRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "customer_id": getEV("customer_id_"+indek),
    "customer_name": getEV("customer_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptQuoteRegister.preview(indek);
};

RptQuoteRegister.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptQuoteRegister.getCustomer(indek);
};

RptQuoteRegister.getCustomer=(indek)=>{
  message.none(indek);
  RptQuoteRegister.customer.getOne(indek,
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


RptQuoteRegister.print=(indek)=>{};



// 285;292;
