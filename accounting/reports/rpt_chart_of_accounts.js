/*
 * name: budiono;
 * date: may-10, 17:37, sat-2025; #report;
 * edit: dec-21, 11:43, sun-2025; #85; report-std;prototype A
 */

'use strict';

var RptChartofAccounts={};

RptChartofAccounts.table_name='rpt_chart_of_accounts';
RptChartofAccounts.title='Chart of Accounts';

RptChartofAccounts.show=(tiket)=>{
  tiket.modul=RptChartofAccounts.table_name;
  tiket.menu.name=RptChartofAccounts.title;
  tiket.rpt={
    "filter":{
      "date":"",
      "account_id": "",
      "account_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
      
    RptChartofAccounts.preview(indek);
  }else{
    show(baru);
  }
}

RptChartofAccounts.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    bingkai[indek].rpt.refresh=true;
    RptChartofAccounts.proses(indek);
  } else {  
    RptChartofAccounts.display(indek);
  };
}

RptChartofAccounts.proses=(indek)=>{
  
  var date=bingkai[indek].rpt.filter.date;
  var account_id=bingkai[indek].rpt.filter.account_id;

  function getChartofAccounts(callback){
    var sql="SELECT account_id,name,class,inactive"
      +" FROM accounts"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
      if(account_id!=""){
        sql+=" AND account_id='"+account_id+"'"
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.chart_of_accounts=h;
      return callback();
    });
  }
  
  getRptDefault(indek,()=>{
    getChartofAccounts(()=>{
      RptChartofAccounts.display(indek);
    });
  });
}

RptChartofAccounts.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptChartofAccounts.proses(indek); });
  toolbar.filter(indek,()=>{ RptChartofAccounts.filter(indek); });
  toolbar.print(indek,()=>{ RptChartofAccounts.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.chart_of_accounts);
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // account_id
    300, // account_description
    90,  // active
    90,  // account_type
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
    +'<div class="report">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;    
      +'<div class="report-sticky">'
        +'<div class="report-paper">'

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptChartofAccounts.title )
          +s.setAsof2( filter.date,"")

          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'


            +s.setHeader(L[0], W[0], "left", 'Account ID')
            +s.setHeader(L[1], W[1], "left", 'Account Description')
            +s.setHeader(L[2], W[2], "left", 'Active')
            +s.setHeader(L[3], W[3], "left", 'Account Type')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div class="report-detail">';

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].account_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "left", array_yes_no[h[i].inactive] )
          +s.setLabel(L[3], W[3], "left", array_account_class[h[i].class] )
        html+='<br>';
      }        
// end-detail
    html+='</div>'
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
    if( String(a.account_id)===String(b.account_id)){
      return 0;
    }
    else{
      if( String(a.account_id) < String(b.account_id)){
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptChartofAccounts.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptChartofAccounts.preview(indek); });
  toolbar.preview(indek,()=>{ RptChartofAccounts.filterExecute(indek); });
  RptChartofAccounts.formFilter(indek);
}

RptChartofAccounts.formFilter=(indek)=>{
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
          +' onchange="RptCashAccountRegister.getAccount(\''+indek+'\')">'
        +'<button type="button" '
          +' id="btn_account_'+indek+'" '
          +' onclick="RptCashAccountRegister.account.getPaging(\''+indek+'\''
          +',\'account_id_'+indek+'\',-1,\''+CLASS_ASSET+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" id="account_name_'+indek+'" disabled>'
      +'</li>'
    +'<ul>'
    +'</div>'

  content.html(indek,html);
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('account_id_'+indek, bingkai[indek].rpt.filter.account_id ); 
  setEV('account_name_'+indek, bingkai[indek].rpt.filter.account_name ); 

  
}

RptChartofAccounts.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.account_id);
  RptChartofAccounts.getAccount(indek);
};

RptChartofAccounts.getAccount=(indek)=>{
  message.none(indek);
  RptChartofAccounts.account.getOne(indek,
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

RptChartofAccounts.filterExecute=(indek)=>{
  var account_id=getEV("account_id_"+indek);
  var account_name=getEV("account_name_"+indek);

  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
    "account_id": account_id,
    "account_name": account_name,
  }
  bingkai[indek].rpt.refresh=false;
  RptChartofAccounts.preview(indek);
};

RptChartofAccounts.print=(indek)=>{
  
}


// eof: 147;
