/*
 * name: budiono;
 * date: may-18, 17:31, sun-2025; #55; journal_type,;
 * edit: dec-25, 16:48, thu-2025; #85; report-std;
 */ 

'use strict';

var RptPurchaseJournal={}  
RptPurchaseJournal.table_name='rpt_purchase_journal';
RptPurchaseJournal.title='Purchase Journal';

RptPurchaseJournal.show=(tiket)=>{
  tiket.modul=RptPurchaseJournal.table_name;
  tiket.menu.name=RptPurchaseJournal.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "account_id": "",
      "account_name": "",
      "reference": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptPurchaseJournal.preview(indek);
  }else{
    show(baru);
  }
}

RptPurchaseJournal.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPurchaseJournal.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptPurchaseJournal.display(indek);
  };
}

RptPurchaseJournal.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var account_name=bingkai[indek].rpt.filter.account_name;
  var reference=bingkai[indek].rpt.filter.reference;
  
  function getGeneralLedger(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var account_id=bingkai[indek].rpt.filter.account_id || "" ;
    var reference=bingkai[indek].rpt.filter.reference || "" ;
    
    var sql="SELECT date,account_id,reference,description"
      +",debit,credit,row_id"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_type=4"  //purchase_journal=3;
      +" AND date between '"+from+"' AND '"+to+"'";
    if(account_id!=""){
      sql+=" AND account_id='"+account_id+"'";
    }
    if(reference!=""){
      sql+=" AND reference='"+reference+"'";
    }
    
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.general_ledger=h;
      return callback();
    });
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getGeneralLedger(()=>{
      RptPurchaseJournal.display(indek);
    });
  });
}

RptPurchaseJournal.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptPurchaseJournal.proses(indek); });
  toolbar.filter(indek,()=>{ RptPurchaseJournal.filter(indek); });
  toolbar.print(indek,()=>{ RptPurchaseJournal.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.general_ledger);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  // width
  var W=[
    90, // date
    90, // reference
    90, // account ID
    200, // description
    100,// debit amount
    100,// credit amount
  ];
  // left
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
          +s.setTitle( RptPurchaseJournal.title )
          +s.setFromTo( filter.from , filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          
          +s.setHeader(L[0], W[0], "left", 'Date')
          +s.setHeader(L[1], W[1], "left", 'Reference')
          +s.setHeader(L[2], W[2], "left", 'Account ID')
          +s.setHeader(L[3], W[3], "left", 'Description')
          +s.setHeader(L[4], W[4], "left", 'Debit Amount')
          +s.setHeader(L[5], W[5], "left", 'Credit Amount')

          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var reference;
      var date;
      var total_dbt=0;
      var total_crt=0;

      for(var i=0;i<h2.length;i++){
        if(i==0){
          reference=h2[i].reference;
          date=h2[i].date;
          html+=''
            +s.setLabel(L[0], W[0], "left", tglWest(h2[i].date) )
            +s.setLabel(L[1], W[1], "left", h2[i].reference )
        }
        
        if(reference==h2[i].reference && date==h2[i].date){
          
        }else{
          html+='<br>'
            +s.setLabel(L[0], W[0], "left", tglWest(h2[i].date) )
            +s.setLabel(L[1], W[1], "left", h2[i].reference )
        }
        
        html+=''
          +s.setLabel(L[2], W[2], "left", h2[i].account_id )
          +s.setLabel(L[3], W[3], "left", h2[i].description )
          +s.setLabel(L[4], W[4], "right", h2[i].debit )
          +s.setLabel(L[5], W[5], "right", h2[i].credit )

        html+='<br>';
        
        reference=h2[i].reference;
        date=h2[i].date;
        
        total_dbt+=parseFloat(h2[i].debit);
        total_crt+=parseFloat(h2[i].credit);
      }
      html+=''        
        +s.setTotalA(L[3], W[3], "right", 'Total' )
        +s.setTotalA(L[4], W[4], "right", ribuan(total_dbt) )
        +s.setTotalA(L[5], W[5], "right", ribuan(total_crt) );
      html+='<br>'
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( (a.date).concat(a.reference.toLowerCase(),a.row_id,a.debit_amt) === 
      (b.date).concat(b.reference.toLowerCase(),b.row_id,b.debit_amt) ){
      return 0;
    }
    else{
      if( (a.date).concat(a.reference.toLowerCase(),a.row_id,a.debit_amt) < 
        (b.date).concat(b.reference.toLowerCase(),b.row_id,b.debit_amt) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptPurchaseJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptPurchaseJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptPurchaseJournal.filterExecute(indek); });
  RptPurchaseJournal.formFilter(indek);
}

RptPurchaseJournal.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'    
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' id="btn_period_'+indek+'" '
          +' onclick="LookTable.period.getPaging(\''+indek+'\''
          +',\'period_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
      +'</li>'
      +'<li><label>From</label>'
        +'<input type="date" id="from_'+indek+'">'
      +'</li>'
      +'<li><label>To</label>'
        +'<input type="date" id="to_'+indek+'">'
      +'</li>'  
      +'<li><label>Reference</label>'
        +'<input type="text" id="reference_'+indek+'">'
      +'</li>'  
      +'<li>'
        +'<label>Account ID:</label>'
        +'<input type="text" '
          +' id="account_id_'+indek+'" '
          +' size="17"'
          +' onchange="LookTable.getAccount(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="LookTable.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,-1)"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" '
          +' id="account_name_'+indek+'" disabled>'
      +'</li>'
    +'</ul>'
  +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('reference_'+indek, bingkai[indek].rpt.filter.reference ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
  setEV('account_name_'+indek, bingkai[indek].rpt.filter.account_name ); 
}


RptPurchaseJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "reference": getEV("reference_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPurchaseJournal.preview(indek);
}

RptPurchaseJournal.print=(indek)=>{
  alert('print !!!');
}


// eof: 298;
