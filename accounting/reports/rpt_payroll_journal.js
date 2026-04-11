/*
 * name: budiono;
 * date: may-18, 17:38, sun-2025; #55; journal_type,; (copy Paste saja, sesama journal)
 */ 

'use strict';

var RptPayrollJournal={}
  
RptPayrollJournal.table_name='rpt_payroll_journal';
RptPayrollJournal.title='Payroll Journal';
RptPayrollJournal.period=new PeriodLook(RptPayrollJournal);

RptPayrollJournal.show=(tiket)=>{
  tiket.modul=RptPayrollJournal.table_name;
  tiket.menu.name=RptPayrollJournal.title;
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

    RptPayrollJournal.preview(indek);
  }else{
    show(baru);
  }
}

RptPayrollJournal.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPayrollJournal.proses(indek);
  } else {  
    RptPayrollJournal.display(indek);
  };
}

RptPayrollJournal.proses=(indek)=>{

  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      d=JSON.parse(h);
      if(d.rows.length>0){
        if(bingkai[indek].rpt.filter.from==""){
          var d=objectMany(d.fields,d.rows);
          bingkai[indek].rpt.filter.from=d[0].start_date;
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
        }
      }
      return callback();
    });
  }
  
  function getGeneralLedger(callback){
    var from=bingkai[indek].rpt.filter.from;
    var to=bingkai[indek].rpt.filter.to;
    var account_id=bingkai[indek].rpt.filter.account_id || "" ;
    var reference=bingkai[indek].rpt.filter.reference || "" ;
    
    var sql="SELECT date,account_id,reference,description"
      +",debit,credit,row_id"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND journal_type=5"  //purchase_journal=3;
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
  
  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
    
  content.html(indek,html);
  
  getCompany(()=>{
    getGeneralLedger(()=>{
      RptPayrollJournal.display(indek);
    });
  });
  
  bingkai[indek].rpt.refresh=true;
}

RptPayrollJournal.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptPayrollJournal.proses(indek); });
  toolbar.filter(indek,()=>{ RptPayrollJournal.filter(indek); });
  toolbar.print(indek,()=>{ RptPayrollJournal.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.general_ledger);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptPayrollJournal.title )
          +s.setFromTo( filter.from , filter.to )
          
          +'<table style="width:100%;">'
          +setTR(10)            
            +setTH(80,  "left", 'Date')
            +setTH(80,  "left", 'Reference#')
            +setTH(80,  "left", 'Account ID')
            +setTH(250, "left", 'Description')
            +setTH(85, "center", 'Debit Amt')
            +setTH(85, "center", 'Credit Amt')
            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

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
            +setLabel(5, 90,  "left", tglWest(h2[i].date) )
            +setLabel(100, 95, "left", h2[i].reference );
        }
        
        if(reference==h2[i].reference && date==h2[i].date){
          
        }else{
          html+='<br>'
            +setLabel(5, 90,  "left", tglWest(h2[i].date) )
            +setLabel(100, 95, "left", h2[i].reference );
        }
        
        html+=''
          +setLabel(200, 80, "left", h2[i].account_id )
          +setLabel(285, 260, "left", h2[i].description )
          +setLabel(550, 95, "right", ribuan(h2[i].debit) )
          +setLabel(650, 95, "right", ribuan(h2[i].credit) )

        html+='<br>';
        
        reference=h2[i].reference;
        date=h2[i].date;
        
        total_dbt+=parseFloat(h2[i].debit);
        total_crt+=parseFloat(h2[i].credit);
      }
      html+=''
        +setTotalA(285,260, "right", '<b><i>Total</b></i>' )
        +setTotalA(550,95, "right", '<b><i>'+ribuan(total_dbt)+'</b></i>' )
        +setTotalA(650,95, "right", '<b><i>'+ribuan(total_crt)+'</b></i>' )
      
      html+='<br>'
      html+='</div>'
// end-detail

    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  function sortByID(a,b){ // sort multidimensi;
    if( (a.date).concat(a.reference.toLowerCase(),a.row_id,a.debit_amt) === (b.date).concat(b.reference.toLowerCase(),b.row_id,b.debit_amt) ){
      return 0;
    }
    else{
      if( (a.date).concat(a.reference.toLowerCase(),a.row_id,a.debit_amt) < (b.date).concat(b.reference.toLowerCase(),b.row_id,b.debit_amt) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptPayrollJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptPayrollJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptPayrollJournal.filterExecute(indek); });
  RptPayrollJournal.formFilter(indek);
}

RptPayrollJournal.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
    
      +'<li><label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
        +' id="btn_period_'+indek+'" '
        +' onclick="RptGeneralLedger.period.getPaging(\''+indek+'\''
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
        
      +'<li><label>Account ID</label>'
        +'<input type="text" id="account_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('reference_'+indek, bingkai[indek].rpt.filter.reference ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
}

RptPayrollJournal.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptPayrollJournal.getPeriod(indek);
}

RptPayrollJournal.getPeriod=(indek)=>{
  RptPayrollJournal.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
}

RptPayrollJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "reference": getEV("reference_"+indek),
    "account_id": getEV("account_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPayrollJournal.preview(indek);
}

RptPayrollJournal.print=(indek)=>{
  alert('print !!!');
}


// eof: 298;
