/*
 * name: budiono;
 * date: may-18, 17:22, sun-2025; #55; journal_type,;
 * edit: dec-25, 12:55, thu-2025; #85; report-std;
 */ 

'use strict';

var RptCashDisbursementsJournal={}
  
RptCashDisbursementsJournal.table_name='rpt_cash_disbursements_journal';
RptCashDisbursementsJournal.title='Cash Disbursements';
RptCashDisbursementsJournal.period=new PeriodLook(RptCashDisbursementsJournal);
RptCashDisbursementsJournal.account=new AccountLook(RptCashDisbursementsJournal);

RptCashDisbursementsJournal.show=(tiket)=>{
  tiket.modul=RptCashDisbursementsJournal.table_name;
  tiket.menu.name=RptCashDisbursementsJournal.title;
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

    RptCashDisbursementsJournal.preview(indek);
  }else{
    show(baru);
  }
}

RptCashDisbursementsJournal.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCashDisbursementsJournal.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptCashDisbursementsJournal.display(indek);
  };
}

RptCashDisbursementsJournal.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var account_name=bingkai[indek].rpt.filter.account_name;
  
  function getGeneralLedger(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var account_id=bingkai[indek].rpt.filter.account_id || "" ;
    var reference=bingkai[indek].rpt.filter.reference || "" ;
    
    var sql="SELECT date,account_id,reference,description"
      +",debit,credit,row_id"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_type=3"  //cash_disbursements_journal=3;
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
      RptCashDisbursementsJournal.display(indek);
    });
  });
}

RptCashDisbursementsJournal.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCashDisbursementsJournal.proses(indek); });
  toolbar.filter(indek,()=>{ RptCashDisbursementsJournal.filter(indek); });
  toolbar.print(indek,()=>{ RptCashDisbursementsJournal.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.general_ledger);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // date
    90, // reference
    90, // account_id
    200, // description
    110, // debit
    110, // credit
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
          +s.setTitle( RptCashDisbursementsJournal.title )
          +s.setFromTo( filter.from , filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Date')
          +s.setHeader(L[1], W[1], "left", 'Reference')
          +s.setHeader(L[2], W[2], "left", 'Account ID')
          +s.setHeader(L[3], W[3], "left", 'Description')
          +s.setHeader(L[4], W[4], "right", 'Debit Amount')
          +s.setHeader(L[5], W[5], "right", 'Credit Amount')
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
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].debit) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].credit) )

        html+='<br>';
        
        reference=h2[i].reference;
        date=h2[i].date;
        
        total_dbt+=parseFloat(h2[i].debit);
        total_crt+=parseFloat(h2[i].credit);
      }
      html+=''
        +s.setTotalA(L[3],W[3], "right", '<b><i>Total</b></i>' )
        +s.setTotalA(L[4],W[4], "right", '<b><i>'+ribuan(total_dbt)+'</b></i>' )
        +s.setTotalA(L[5],W[5], "right", '<b><i>'+ribuan(total_crt)+'</b></i>' )
      
      html+='<br>'
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( (a.date).concat(a.reference.toLowerCase(),a.row_id,a.debit) === 
    (b.date).concat(b.reference.toLowerCase(),b.row_id,b.debit) ){
      return 0;
    }
    else{
      if( (a.date).concat(a.reference.toLowerCase(),a.row_id,a.debit) < 
        (b.date).concat(b.reference.toLowerCase(),b.row_id,b.debit) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptCashDisbursementsJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptCashDisbursementsJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptCashDisbursementsJournal.filterExecute(indek); });
  RptCashDisbursementsJournal.formFilter(indek);
}

RptCashDisbursementsJournal.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'    
      +'<li><label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
        +' id="btn_period_'+indek+'" '
        +' onclick="RptCashDisbursementsJournal.period.getPaging(\''+indek+'\''
        +',\'period_id_'+indek+'\')"'
        +' class="btn_find"></button>'
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
        +'<label>Account ID</label>'
        +'<input type="text" '
          +' id="account_id_'+indek+'" '
          +' onchange="RptCashDisbursementsJournal.getAccount(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="RptCashDisbursementsJournal.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,-1)"'
          +' class="btn_find">'
        +'</button>'
      +'</li>'
      +'<li>'
        +'<label>Account Name</label>'
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

RptCashDisbursementsJournal.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCashDisbursementsJournal.getPeriod(indek);
}

RptCashDisbursementsJournal.getPeriod=(indek)=>{
  RptCashDisbursementsJournal.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
}

RptCashDisbursementsJournal.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.account_id);
  RptCashDisbursementsJournal.getAccount(indek);
};

RptCashDisbursementsJournal.getAccount=(indek)=>{
  message.none(indek);
  RptCashDisbursementsJournal.account.getOne(indek,
    getEV('account_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('account_name_'+indek, d.name);
    }else{
      setEV('account_name_'+indek, '');
    }
  });
}


RptCashDisbursementsJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "reference": getEV("reference_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCashDisbursementsJournal.preview(indek);
}

RptCashDisbursementsJournal.print=(indek)=>{
  alert('print !!!');
}


// eof: 298;336;
