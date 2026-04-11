/*
 * name: budiono;
 * date: may-18, 16:44, sun-2025; #55; journal_type;
 */ 

'use strict';

var RptCashReceiptsJournal={}
  
RptCashReceiptsJournal.table_name='rpt_cash_receipts_journal';
RptCashReceiptsJournal.title='Cash Receipts Journal';
RptCashReceiptsJournal.period=new PeriodLook(RptCashReceiptsJournal);

RptCashReceiptsJournal.show=(tiket)=>{
  tiket.modul=RptCashReceiptsJournal.table_name;
  tiket.menu.name=RptCashReceiptsJournal.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "account_id": "",
      "reference": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    RptCashReceiptsJournal.preview(indek);
  }else{
    show(baru);
  }
}

RptCashReceiptsJournal.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCashReceiptsJournal.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptCashReceiptsJournal.display(indek);
  };
}

RptCashReceiptsJournal.proses=(indek)=>{
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
    
    var sql="SELECT date,account_id,reference,description,"
      +"debit,credit,row_id"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_type=1" //code cash_receipt_journal=1;
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
    account_id=bingkai[indek].rpt.filter.account_id;
    account_name=bingkai[indek].rpt.filter.account_name;
    reference=bingkai[indek].rpt.filter.reference;

    getGeneralLedger(()=>{
      RptCashReceiptsJournal.display(indek);
    });
  });
}

RptCashReceiptsJournal.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCashReceiptsJournal.proses(indek); });
  toolbar.filter(indek,()=>{ RptCashReceiptsJournal.filter(indek); });
  toolbar.print(indek,()=>{ RptCashReceiptsJournal.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.general_ledger);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    80,  // date
    60,  // account_id
    90,  // reference
    250, // description
    90,  // debit amount
    90,  // credit amount
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
          +s.setTitle( RptCashReceiptsJournal.title )
          +s.setFromTo( filter.from , filter.to )
          
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          
          +s.setHeader(L[0], W[0], "left", 'Date')
          +s.setHeader(L[1], W[1], "left", 'Account ID')
          +s.setHeader(L[2], W[2], "left", 'Reference')
          +s.setHeader(L[3], W[3], "left", 'Description')
          +s.setHeader(L[4], W[4], "right", 'Debit')
          +s.setHeader(L[5], W[5], "right", 'Credit')
          +'<br>'

        +'</div>'//d
      +'</div>'//c
      
      //--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var reference;
      var date;
      var total_dbt=0;
      var total_crt=0;

      for(i=0;i<h2.length;i++){
        
        if(i>0){
          if(h2[i].reference!=h2[i-1].reference){
            html+=''
              +s.setLabel(L[0], W[0], "left", tglEast(h2[i].date) )
              +s.setLabel(L[2], W[2], "left", h2[i].reference )
              
          }
        } else{
          html+=''
            +s.setLabel(L[0], W[0], "left", tglEast(h2[i].date) )
            +s.setLabel(L[2], W[2], "left", h2[i].reference );
        }
        
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].account_id )
          +s.setLabel(L[3], W[3], "left", h2[i].description )
          +s.setLabel(L[4], W[4], "right", h2[i].debit )
          +s.setLabel(L[5], W[5], "right", h2[i].credit )
        html+='<br>';
        
        total_dbt+=Number(h2[i].debit);
        total_crt+=Number(h2[i].credit);
        
        // footer
        reference="";
        date="";
        if(i<h2.length-1){// new line
          reference=h2[i+1].reference;
          date=h2[i+1].date;
        }
        
        if(h2[i].reference!=reference){// beda
          if(h2[i].date!=date){
            html+=''
              +'<br>'
          }
        }
      }
      html+=''
        +s.setTotalA(L[4], W[4], "right", ribuan(total_dbt) )
        +s.setTotalA(L[5], W[5], "right", ribuan(total_crt) )
        +'<br>'
        +'</div>'
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

RptCashReceiptsJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptCashReceiptsJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptCashReceiptsJournal.filterExecute(indek); });
  RptCashReceiptsJournal.formFilter(indek);
}

RptCashReceiptsJournal.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' id="btn_period_'+indek+'" '
          +' onclick="RptGeneralLedger.period.getPaging(\''+indek+'\''
          +',\'period_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
      +'</li>'
      +'<li>'
        +'<label>From</label>'
        +'<input type="date" id="from_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>To</label>'
        +'<input type="date" id="to_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Reference</label>'
        +'<input type="text" id="reference_'+indek+'">'
      +'</li>'
        
      +'<li>'
        +'<label>Account ID</label>'
        +'<input type="text" id="account_id_'+indek+'">'
        +'<input type="text" id="account_name_'+indek+'" disabled>'
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

RptCashReceiptsJournal.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCashReceiptsJournal.getPeriod(indek);
}

RptCashReceiptsJournal.getPeriod=(indek)=>{
  RptCashReceiptsJournal.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
}

RptCashReceiptsJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "reference": getEV("reference_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptCashReceiptsJournal.preview(indek);
}

RptCashReceiptsJournal.print=(indek)=>{
  alert('print !!!');
}


function renderLine(indek,L){
  var cv=document.getElementById("cv_"+indek);
  var ctx=cv.getContext("2d");
  var i=0;

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

}

// eof: 296;
