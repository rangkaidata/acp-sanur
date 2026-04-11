/*
 * name: budiono;
 * date: may-10, 20:13, sat-2025; #report;
 * edit: dec-21, 18:22, sun-2025; #85; report_std;
 */

'use strict';

var RptGeneralLedger={}
  
RptGeneralLedger.table_name='rpt_general_ledger';
RptGeneralLedger.title='General Ledger';
RptGeneralLedger.period=new PeriodLook(RptGeneralLedger);

RptGeneralLedger.show=(tiket)=>{
  tiket.modul=RptGeneralLedger.table_name;
  tiket.menu.name=RptGeneralLedger.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "account_id": "",
      "account_name": "",
      "start_date":"",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    RptGeneralLedger.preview(indek);
  }else{
    show(baru);
  }
}

RptGeneralLedger.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    bingkai[indek].rpt.refresh=true;
    RptGeneralLedger.proses(indek);
  } else {  
    RptGeneralLedger.display(indek);
  };
}

RptGeneralLedger.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var account_name=bingkai[indek].rpt.filter.account_name;
    
  function getA(callback){
    var sql="SELECT account_id,SUM(balance) AS balance_amt"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <'"+from+"'"
    if(account_id!="") {
      sql+=" AND account_id='"+account_id+"'"
    }
    sql+=" GROUP BY account_id";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });    
  }
  
  function getB(callback){
    var sql="SELECT account_id,date,reference,table_name"
      +",description,debit,credit"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from+"' AND '"+to+"'"
    if(account_id!="") {
      sql+=" AND account_id='"+account_id+"'"
    }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });    
  }

  function joinArray(callback){
    var f=[
      "account_id",
      "date",
      "reference",
      "table_name",
      "description",
      "debit_amt",
      "credit_amt",
      "balance"
    ];
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var c=[];
    var r=[];
    var i;
    var date=bingkai[indek].rpt.filter.start_date;
    
    var debit=0,credit=0,balance=0;
    
    for(i=0;i<a.length;i++){// table begin push to trans
      balance=parseFloat(a[i][1]);
      debit=0;credit=0;
      if(balance>0){
        debit=balance;
      }else{
        credit=balance*-1;
      }

      r.push([
        a[i][0],//account_id,
        "",//date,
        'beg_bal',//reference,
        '',//table_name,
        'Beginning Balance',//description,
        0,//debit,//sum_debit,
        0,//credit,//sum_credit
        balance,//balance
      ]);
    };

    for(i=0;i<b.length;i++){
      r.push([
        b[i][0], //account_id,
        b[i][1], //date,
        b[i][2], //reference,
        b[i][3], //table_name,
        b[i][4], //description,
        b[i][5], //sum_debit,
        b[i][6], //sum_credit
        0, //balance
      ]);
    };

    var join_array={
      "fields":f,
      "rows": r
    }

    bingkai[indek].rpt.join_array=JSON.stringify(join_array);
    
    return callback();
  }

  getRptDefault(indek,()=>{  
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;
    account_id=bingkai[indek].rpt.filter.account_id;
    account_name=bingkai[indek].rpt.filter.account_name;
    getA(()=>{
      getB(()=>{
        joinArray(()=>{
          RptGeneralLedger.display(indek);
        });
      });
    });
  });
}

RptGeneralLedger.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{RptGeneralLedger.proses(indek); });
  toolbar.filter(indek,()=>{RptGeneralLedger.filter(indek); });
  toolbar.print(indek,()=>{RptGeneralLedger.print(indek); });
    
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    80,  // account id
    60,  // date
    90,  // reference
    50,  // table_name
    150, // description
    90,  // debit amount
    90,  // credit amount
    90,  // balance
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
          +s.setTitle( RptGeneralLedger.title )
          +s.setFromTo( filter.from, filter.to)
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Account ID')
          +s.setHeader(L[1], W[1], "left", 'Date')
          +s.setHeader(L[2], W[2], "left", 'Reference')
          +s.setHeader(L[3], W[3], "left", 'Source')
          +s.setHeader(L[4], W[4], "left", 'Description')
          +s.setHeader(L[5], W[5], "right", 'Debit')
          +s.setHeader(L[6], W[6], "right", 'Credit')
          +s.setHeader(L[7], W[7], "right", 'Balance')
          +'<br>'
          
        +'</div>'//d
      +'</div>'//c
      
      //--detail
      +'<div class="report-detail">';//e
      
      var sub_total_debit=0;
      var sub_total_credit=0;
      var sub_total_cross=0;
      var sub_total_balance=0;
      var sub_total_balance_begin=0;

      var h2=h.sort( sortByID );
      var account_id;
      var i;
      var w=300;
      
      for(i=0;i<h2.length;i++){
        
        if(i==0){
          account_id=h2[i].account_id;
        }
        
        if(account_id==h2[i].account_id){// same
          // 
        }else{ // beda
          sub_total_balance=sub_total_debit-sub_total_credit;
          sub_total_balance_begin+=Number(sub_total_balance);
          html+='<br>'
            +s.setSubTotal(L[4], W, "left", '<b>Current Change</b>' )
            +s.setSubTotal(L[5], W[5], "right", ribuan(sub_total_debit) )
            +s.setSubTotal(L[6], W[6], "right", ribuan(sub_total_credit) )
            +s.setSubTotal(L[7], W[7], "right", ribuan(sub_total_balance) )
            +'<br>'
            +s.setSubTotal(L[4], W, "left", '<b>Ending Balance</b>' )
            +s.setSubTotal(L[7], W[7], "right", '<b>'+ribuan(sub_total_balance_begin)+' </b>' )
            +'<br><br>';

          sub_total_debit=0;
          sub_total_credit=0;
          sub_total_balance=0;
          sub_total_balance_begin=0;
        }
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].account_id )
          +s.setLabel(L[1], W[1], "left", tglEast(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].reference )
          +s.setLabel(L[3], W[3], "left", kode_modul(h2[i].table_name) )
          +s.setLabel(L[4], W[4], "left", h2[i].description )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].debit_amt) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].credit_amt) )
          +s.setLabel(L[7], W[7], "right", ribuan(h2[i].balance) )

        html+='<br>';        
        
        account_id=h2[i].account_id;
        
        sub_total_debit+=parseFloat(h2[i].debit_amt);
        sub_total_credit+=parseFloat(h2[i].credit_amt);
        sub_total_balance_begin+=Number(h2[i].balance);
      }
// same      
      sub_total_balance=sub_total_debit-sub_total_credit;
      sub_total_balance_begin+=Number(sub_total_balance);
      html+='<br>'

        +s.setSubTotal(L[4], W, "left", '<b>Current Change</b>' )
        +s.setSubTotal(L[5], W[5], "right", ribuan(sub_total_debit) )
        +s.setSubTotal(L[6], W[6], "right", ribuan(sub_total_credit) )
        +s.setSubTotal(L[7], W[7], "right", ribuan(sub_total_balance) )
        +'<br>'
        +s.setSubTotal(L[4], W, "left", '<b>Ending Balance</b>' )
        +s.setSubTotal(L[7], W[7], "right", '<b>'+ribuan(sub_total_balance_begin)+' </b>' )
        +'<br><br>';
      
      
      html+='</div>'
      +'</div>'
    +'</div>';
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
  
  function sortByID(a,b){ // sort multidimensi;
    if( String(a.account_id).toLowerCase().concat(a.date)  ===  String(b.account_id).toLowerCase().concat(b.date)){
//    if( String(a.account_id).concat(a.date)  ===  String(b.account_id).concat(b.date) ){
      return 0;
    }
    else{
      if( String(a.account_id).toLowerCase().concat(a.date) <  String(b.account_id).toLowerCase().concat(b.date)) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }

  function kode_modul(k){
    var kode=k
    switch(k){
      case "invoices": kode="INVC"; break;
      case "receipts": kode="RCPT"; break;
      case "payments": kode="PYMT"; break;
      case "receive_inventory": kode="PURC"; break;
      case "receives": kode="PURC"; break;
      case "payroll_entry": kode="PYRL"; break;
      case "journal_entry": kode="GJRL"; break;
      case "customer_credits": kode="CCMS"; break;
      case "void_payroll": kode="VPYL"; break;
      
      default:
//        alert(k);
    }
    return kode;
  }
}

RptGeneralLedger.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptGeneralLedger.preview(indek); });
  toolbar.preview(indek,()=>{RptGeneralLedger.filterExecute(indek); });
  RptGeneralLedger.formFilter(indek);
}

RptGeneralLedger.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' id="btn_period_'+indek+'" '
          +' onclick="RptGeneralJournal.period.getPaging(\''+indek+'\''
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
        
      +'<li><label>Account ID</label>'
        +'<input type="text" id="account_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
}


RptGeneralLedger.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptGeneralLedger.getPeriod(indek);
}

RptGeneralLedger.getPeriod=(indek)=>{
  RptGeneralLedger.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
}

RptGeneralLedger.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptGeneralLedger.preview(indek);
}

RptGeneralLedger.print=(indek)=>{
  alert('print !!!');
}


// eof: 147;265;409;443;
