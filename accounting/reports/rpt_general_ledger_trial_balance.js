/*
 * name: budiono;
 * date: sep-24, 17:20, wed-2025; #75;
 * edit: dec-21, 15:16, sun-2025; #84; ke-3
 */ 

'use strict';

var RptGLTrialBalance={}
  
RptGLTrialBalance.table_name='rpt_general_ledger';
RptGLTrialBalance.title='General Ledger Trial Balance';
RptGLTrialBalance.period=new PeriodLook(RptGLTrialBalance);
RptGLTrialBalance.account=new AccountLook(RptGLTrialBalance);

RptGLTrialBalance.show=(tiket)=>{
  tiket.modul=RptGLTrialBalance.table_name;
  tiket.menu.name=RptGLTrialBalance.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "date": "",
      "account_id": "",
      "account_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
//    dbo.getDefaultDate(indek,()=>{
      RptGLTrialBalance.preview(indek);
//    });
  }else{
    show(baru);
  }
}

RptGLTrialBalance.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptGLTrialBalance.proses(indek);
  } else {  
    RptGLTrialBalance.display(indek);
  };
}

RptGLTrialBalance.proses=(indek)=>{
  var date=bingkai[indek].rpt.filter.date;
  var account_id=bingkai[indek].rpt.filter.account_id;
  var account_name=bingkai[indek].rpt.filter.account_name;

  function getTrialBalance(callback){
    var date=bingkai[indek].rpt.filter.date;
    var account_id=bingkai[indek].rpt.filter.account_id;
    var sql="SELECT account_id,account_name,account_class,"
      +"SUM(debit) AS debit,SUM(credit) AS credit"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <='"+date+"'";
      if(account_id!=""){
        sql+=" AND account_id='"+account_id+"'";
      }
      sql+=" GROUP BY account_id,account_name,account_class";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.trial_balance=h;
      return callback();
    });
  }  

  getRptDefault(indek,()=>{
    getTrialBalance(()=>{
      RptGLTrialBalance.display(indek);
    });
  });
  
  bingkai[indek].rpt.refresh=true;// sudah refresh
}

RptGLTrialBalance.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptGLTrialBalance.proses(indek); });
  toolbar.filter(indek,()=>{ RptGLTrialBalance.filter(indek); });
  toolbar.print(indek,()=>{ RptGLTrialBalance.print(indek); });
    
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.trial_balance);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // account_id
    300, // account_description
    90,  // class
    110,  // debit
    110,  // credit
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
          +s.setTitle( RptGLTrialBalance.title )
          +s.setAsof2( filter.date,"")
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Account ID')
          +s.setHeader(L[1], W[1], "left", 'Account Description')
          +s.setHeader(L[2], W[2], "left", 'Class')
          +s.setHeader(L[3], W[3], "right", 'Debit Amount')
          +s.setHeader(L[4], W[4], "right", 'Credit Amount')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e
        var h2=h.sort( sortByID );
        var debit=0;
        var credit=0;
        var balance=0;
        var total_debit=0;
        var total_credit=0;

        for(i=0;i<h2.length;i++){
          debit=0;
          credit=0;
          balance=Number(h2[i].debit)-Number(h2[i].credit)
          if(balance<0){
            credit=balance*-1;
          }else{
            debit=balance;
          };

          html+=''
            +s.setLabel(L[0], W[0], "left", h2[i].account_id )
            +s.setLabel(L[1], W[1], "left", h2[i].account_name )
            +s.setLabel(L[2], W[2], "left", array_account_class[h2[i].account_class] )
            +s.setLabel(L[3], W[3], "right", ribuan(debit) )
            +s.setLabel(L[4], W[4], "right", ribuan(credit) )

          html+='<br>';
          
          total_debit+=Number(debit);
          total_credit+=Number(credit);
        }
        html+='<br>'        
          +s.setTotal(L[2], W[2], "left", "Total:" )
          +s.setTotal(L[3], W[3], "right", ribuan(total_debit) )
          +s.setTotal(L[4], W[4], "right", ribuan(total_credit) )
      
      html+='</div>'//e
    +'</div>'//b
  +'</div>';//a
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
    if( a.account_id.toLowerCase() === b.account_id.toLowerCase() ){
      return 0;
    }
    else{
      if( a.account_id.toLowerCase() < b.account_id.toLowerCase() ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptGLTrialBalance.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptGLTrialBalance.preview(indek); });
  toolbar.preview(indek,()=>{ RptGLTrialBalance.filterExecute(indek); });
  RptGLTrialBalance.formFilter(indek);
}

RptGLTrialBalance.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Date:</label>'
        +'<input type="date" id="date_'+indek+'">'
      +'</li>'
      +'<li>'
        +'<label>Cash Account ID:</label>'
        +'<input type="text" id="account_id_'+indek+'" size="17"'
          +' onchange="RptGLTrialBalance.getAccount(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="RptGLTrialBalance.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,\''+CLASS_ASSET+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" id="account_name_'+indek+'" disabled>'
      +'</li>'
    +'<ul>'
    +'</div>'

  content.html(indek,html);
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id); 
  setEV('account_name_'+indek, bingkai[indek].rpt.filter.account_name ); 

}

RptGLTrialBalance.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.account_id);
  RptGLTrialBalance.getAccount(indek);
};

RptGLTrialBalance.getAccount=(indek)=>{
  message.none(indek);
  RptGLTrialBalance.account.getOne(indek,
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


RptGLTrialBalance.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "account_id": getEV("account_id_"+indek),
    "account_name": getEV("account_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptGLTrialBalance.preview(indek);
}

RptGLTrialBalance.print=(indek)=>{
  alert('print !!!');
}
