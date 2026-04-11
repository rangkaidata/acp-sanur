/*
 * name: budiono;
 * date: may-18, 16:59, sun-2025; #55; journal_type;
 * edit: dec-24, 12:30, wed-2025; #85; report-std;
 */ 

'use strict';

var RptSalesJournal={}
  
RptSalesJournal.table_name='rpt_sales_journal';
RptSalesJournal.title='Sales Journal';
RptSalesJournal.period=new PeriodLook(RptSalesJournal);
RptSalesJournal.account=new AccountLook(RptSalesJournal);

RptSalesJournal.show=(tiket)=>{
  tiket.modul=RptSalesJournal.table_name;
  tiket.menu.name=RptSalesJournal.title;
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

    RptSalesJournal.preview(indek);
  }else{
    show(baru);
  }
}

RptSalesJournal.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptSalesJournal.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptSalesJournal.display(indek);
  };
}

RptSalesJournal.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var account_name=bingkai[indek].rpt.filter.account_name;
  var reference=bingkai[indek].rpt.filter.reference;
  
  function getGeneralLedger(callback){  
    var sql="SELECT date,account_id,reference,description"
      +",debit,credit,row_id"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_type=2" //sales_journal=2;
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
  
  function getSumArray(callback){
    var f=JSON.parse(bingkai[indek].rpt.general_ledger).fields;
    var a=JSON.parse(bingkai[indek].rpt.general_ledger).rows;
    var i,j;
    var r=[];
    var ada;
    
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<r.length;j++){
        if(a[i][1]==r[j][1]){//account_id
          if(a[i][2]==r[j][2]){//reference
            r[j][4]+=Number(a[i][4]);
            r[j][5]+=Number(a[i][5]);
            ada=1;
          }
        }
      }
      if(ada==0){
        r.push([
          a[i][0], //date
          a[i][1], //account_id
          a[i][2], //reference
          a[i][3], //descript
          Number(a[i][4]), //debit
          Number(a[i][5]), //credit
          a[i][6], // row
        ]);
      }
    }
    
    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: r,
    });
    
    return callback();

  }
   
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getGeneralLedger(()=>{
//      getSumArray(()=>{
        RptSalesJournal.display(indek);
      });
//    });
  });
}

RptSalesJournal.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptSalesJournal.proses(indek); });
  toolbar.filter(indek,()=>{ RptSalesJournal.filter(indek); });
  toolbar.print(indek,()=>{ RptSalesJournal.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.general_ledger);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // date
    90,  // reference
    100, // account ID
    120, // description
    90, // debit
    90, // credit
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
          +s.setTitle( RptSalesJournal.title )
          +s.setFromTo( filter.from , filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Date')
          +s.setHeader(L[1], W[1], "left", 'Reference')
          +s.setHeader(L[2], W[2], "left", 'Account ID')
          +s.setHeader(L[3], W[3], "right", 'Description')
          +s.setHeader(L[4], W[4], "right", 'Debit')
          +s.setHeader(L[5], W[5], "right", 'Credit')
          +'<br>'

        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var reference;
      var date;
      var total_dbt=0;
      var total_crt=0;
      var i;

      for(i=0;i<h2.length;i++){
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
        
        total_dbt+=Number(h2[i].debit);
        total_crt+=Number(h2[i].credit);
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
  
  renderLine(indek,L)
  
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

RptSalesJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptSalesJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptSalesJournal.filterExecute(indek); });
  RptSalesJournal.formFilter(indek);
}

RptSalesJournal.formFilter=(indek)=>{
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
            +' onclick="RptSalesJournal.period.getPaging(\''+indek+'\''
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
          +'<label>Account ID</label>'
          +'<input type="text" '
            +' id="account_id_'+indek+'" '
            +' onchange="RptSalesJournal.getAccount(\''+indek+'\')">'
          +'<button type="button" '
            +' id="btn_customer_'+indek+'" '
            +' onclick="RptSalesJournal.account.getPaging(\''+indek+'\''
            +',\'account_id_'+indek+'\')"'
            +' class="btn_find">'
          +'</button>'
        +'</li>'
        +'<li>'
          +'<label>Account Name</label>'
          +'<input type="text" '
          +' id="account_name_'+indek+'" disabled>'
        +'</li>'
        +'<li>'
          +'<label>Reference</label>'
          +'<input type="text" '
          +' id="reference_'+indek+'">'
        +'</li>'
      +'</ul>'
    +'</div>'
  content.html(indek,html);

  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
  setEV('account_name_'+indek, bingkai[indek].rpt.filter.account_name );
  setEV('reference_'+indek, bingkai[indek].rpt.filter.reference );
}

RptSalesJournal.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptSalesJournal.getPeriod(indek);
}

RptSalesJournal.getPeriod=(indek)=>{
  RptSalesJournal.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
}

RptSalesJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "reference": getEV("reference_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptSalesJournal.preview(indek);
}

RptSalesJournal.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  RptSalesJournal.getAccount(indek);
};

RptSalesJournal.getAccount=(indek)=>{
  message.none(indek);
  RptSalesJournal.account.getOne(indek,
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

RptSalesJournal.print=(indek)=>{
  alert('print !!!');
}


// eof: 296;
