/*
 * name: budiono;
 * date: dec-29, 14:15, mon-2025; #86; 
 */ 

'use strict';

var RptAssembliesJournal={}
  
RptAssembliesJournal.table_name='rpt_assemblies_journal';
RptAssembliesJournal.title='Assemblies Journal';

RptAssembliesJournal.show=(tiket)=>{
  tiket.modul=RptAssembliesJournal.table_name;
  tiket.menu.name=RptAssembliesJournal.title;
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

    RptAssembliesJournal.preview(indek);
  }else{
    show(baru);
  }
}

RptAssembliesJournal.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptAssembliesJournal.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptAssembliesJournal.display(indek);
  };
}

RptAssembliesJournal.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var reference=bingkai[indek].rpt.filter.reference;
  
  function getGeneralLedger(callback){
    var sql="SELECT date,account_id,reference,description,"
      +"debit,credit,table_name"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND table_name='builds'"
      +" AND date between '"+from+"' AND '"+to+"'";
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
      RptAssembliesJournal.display(indek);
    });
  });
}

RptAssembliesJournal.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptAssembliesJournal.proses(indek); });
  toolbar.filter(indek,()=>{ RptAssembliesJournal.filter(indek); });
  toolbar.print(indek,()=>{ RptAssembliesJournal.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.general_ledger );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // account_id
    200, // reference
    90, // debit
    90, // credit
    90, // table_name
    90  // asembly qty
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
          +s.setTitle( RptAssembliesJournal.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height="50" class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Date<br>Account ID')
          +s.setHeader(L[1], W[1], "left", 'Reference<br>Description')
          +s.setHeader(L[2], W[2], "right", 'Debit')
          +s.setHeader(L[3], W[3], "right", 'Credit')
          +s.setHeader(L[4], W[4], "left", 'Table name')
          +s.setHeader(L[5], W[5], "right", 'Assembly Qty')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail-dua">';//e

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
            +'<br>';
        }
        
        if(reference==h2[i].reference && date==h2[i].date){
          
        }else{
          html+='<br>'
            +s.setLabel(L[0], W[0], "left", tglWest(h2[i].date) )
            +s.setLabel(L[1], W[1], "left", h2[i].reference )
            +'<br>';
        }
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].account_id )
          +s.setLabel(L[1], W[1], "left", h2[i].description )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].debit) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].credit) )
          +s.setLabel(L[4], W[4], "center", h2[i].table_name )
          +s.setLabel(L[5], W[5], "right", ribuan(0) )
        html+='<br>';
        
        reference=h2[i].reference;
        date=h2[i].date;
        total_dbt+=parseFloat(h2[i].debit);
        total_crt+=parseFloat(h2[i].credit);
      }
      html+=''
        +s.setTotalA(L[2], W[2], "right", '<b><i>'+ribuan(total_dbt)+'</b></i>' )
        +s.setTotalA(L[3], W[3], "right", '<b><i>'+ribuan(total_crt)+'</b></i>' )
      
      html+='<br>'
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine2(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( (a.date).concat(a.reference,a.account_id,a.credit).toLowerCase() === 
    (b.date).concat(b.reference,b.account_id,b.credit).toLowerCase() ){
      return 0;
    }
    else{
      if( (a.date).concat(a.reference,a.account_id,a.credit).toLowerCase() < 
      (b.date).concat(b.reference,b.account_id,b.credit).toLowerCase() ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptAssembliesJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptAssembliesJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptAssembliesJournal.filterExecute(indek); });
  RptAssembliesJournal.formFilter(indek);
}

RptAssembliesJournal.formFilter=(indek)=>{
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
        +'<input type="text" id="account_id_'+indek+'"'
          +' onchange="LookTable.getAccount(\''+indek+'\')">'
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

RptAssembliesJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptAssembliesJournal.preview(indek);
}

RptAssembliesJournal.print=(indek)=>{
  alert('print !!!');
}


// eof:275;
