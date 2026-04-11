/*
 * name: budiono;
 * date: dec-30, 15:50, tue-2025; #86; report-std;
 */ 

'use strict';

var RptInventoryAdjustmentJournal={}
  
RptInventoryAdjustmentJournal.table_name='rpt_inventory_adjustment_journal';
RptInventoryAdjustmentJournal.title='Inventory Adjustment Journal';

RptInventoryAdjustmentJournal.show=(tiket)=>{
  
  tiket.modul=RptInventoryAdjustmentJournal.table_name;
  tiket.menu.name=RptInventoryAdjustmentJournal.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "reference": "",
      "account_id": "",
      "account_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptInventoryAdjustmentJournal.preview(indek);
  }else{
    show(baru);
  }
}

RptInventoryAdjustmentJournal.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptInventoryAdjustmentJournal.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptInventoryAdjustmentJournal.display(indek);
  };
}

RptInventoryAdjustmentJournal.proses=(indek)=>{

  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var reference=bingkai[indek].rpt.filter.reference;  
  
  function getGeneralLedger(callback){
    var sql="SELECT account_id,account_name,date,reference,debit,credit"
      +",description"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_type=9 "
      +" AND date between '"+from+"' and '"+to+"'";
    if(account_id!=""){
      sql+=" AND account_id='"+account_id+"'";
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
      RptInventoryAdjustmentJournal.display(indek);
    });
  });
  
  bingkai[indek].rpt.refresh=true;// sudah refresh
}

RptInventoryAdjustmentJournal.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{RptInventoryAdjustmentJournal.proses(indek); });
  toolbar.filter(indek,()=>{RptInventoryAdjustmentJournal.filter(indek); });
  toolbar.print(indek,()=>{RptInventoryAdjustmentJournal.print(indek); });

  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.general_ledger );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-Date
    90, // 1-Account ID
    90, // 2-Reference
    90, // 3-Quantity
    90, // 4-Description
    90, // 5-debit
    90, // 6-credit
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
  var X=200;

  var html=''
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d
          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptInventoryAdjustmentJournal.title )
          +s.setNone()
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Date')
          +s.setHeader(L[1], W[1], "left", 'Account ID')
          +s.setHeader(L[2], W[2], "left", 'Reference')
          +s.setHeader(L[3], W[3], "right", 'Quantity')
          +s.setHeader(L[4], W[4], "left", 'Description')
          +s.setHeader(L[5], W[5], "right", 'Debit Amount')
          +s.setHeader(L[6], W[6], "right", 'Credit Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var total_debit=0;
      var total_credit=0;
      
      var h2=h.sort( sortByID );
      
      for(var i=0;i<h2.length;i++){
        
        html+=''
          +s.setLabel(L[0],W[0],"left", tglWest(h2[i].date) )
          +s.setLabel(L[1],W[1],"left", h2[i].account_id )
          +s.setLabel(L[2],W[2],"left", h2[i].reference )
          +s.setLabel(L[3],W[3],"right",0 )
          +s.setLabel(L[4],W[4],"left", h2[i].description )
          +s.setLabel(L[5],W[5],"right",ribuan(h2[i].debit) )
          +s.setLabel(L[6],W[6],"right",ribuan(h2[i].credit) )
        html+='<br>';
        
        total_debit+=parseFloat(h2[i].debit);
        total_credit+=parseFloat(h2[i].credit);
      }
      html+='<br>'
        +s.setTotalA(L[4],W[4], "left", '<b>Total</b>' )
        +s.setTotalA(L[5],W[5], "right", '<b>'+ribuan(total_debit)+'</b>' )
        +s.setTotalA(L[6],W[6], "right", '<b>'+ribuan(total_debit)+'</b>' )
      
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( a.date.toLowerCase() === b.date.toLowerCase() ){
      return 0;
    }
    else{
      if( a.date.toLowerCase() < b.date.toLowerCase() ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptInventoryAdjustmentJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptInventoryAdjustmentJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptInventoryAdjustmentJournal.filterExecute(indek); });
  RptInventoryAdjustmentJournal.formFilter(indek);
}

RptInventoryAdjustmentJournal.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'    
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' onclick="LookTable.period.getPaging(\''+indek+'\''
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
        +'<label>Account ID</label>'
        +'<input type="text" id="account_id_'+indek+'">'
        +'<button type="button" '
          +' onclick="LookTable.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,-1)"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" id="account_name_'+indek+'" disabled>'
      +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
  setEV('account_name_'+indek, bingkai[indek].rpt.filter.account_name ); 
}

RptInventoryAdjustmentJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptInventoryAdjustmentJournal.preview(indek);
}

RptInventoryAdjustmentJournal.print=(indek)=>{
  alert('print !!!');
}

