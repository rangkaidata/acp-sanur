/*
 * name: budiono;
 * date: may-21, 14:30, wed-2025; #55; 
 */

'use strict';

var RptCheckRegister={}
  
RptCheckRegister.table_name='rpt_check_register';
RptCheckRegister.title='Check Register';
RptCheckRegister.period=new PeriodLook(RptCheckRegister);

RptCheckRegister.show=(tiket)=>{
  tiket.modul=RptCheckRegister.table_name;
  tiket.menu.name=RptCheckRegister.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptCheckRegister.preview(indek);
  }else{
    show(baru);
  }
}

RptCheckRegister.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptCheckRegister.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptCheckRegister.display(indek);
  };
};

RptCheckRegister.proses=(indek)=>{
  var account_id=bingkai[indek].rpt.filter.account_id;
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  
  function getPayment(callback){
    var sql="SELECT payment_no AS check_no,date,name as payee"
      +",cash_account_id,amount"
      +" FROM payments"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.payments=h;
      return callback();
    });
  }
  
  function getPayroll(callback){
    var sql="SELECT payroll_no AS check_no,date,employee_name as payee"
      +",cash_account_id,net_amount"
      +" FROM payroll_entry"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.payroll_entry=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.payments).rows;
    var b=JSON.parse(bingkai[indek].rpt.payroll_entry).rows;
    var f=["check_no","date","payee","cash_account_id","amount","source"];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], // payment_no
        a[i][1], // date
        a[i][2], // name
        a[i][3], // cash_account_id
        a[i][4], // amount
        "payments"
      ]);
    };
    
    for(i=0;i<b.length;i++){
      r.push([
        b[i][0], // payroll_no
        b[i][1], // date
        b[i][2], // name
        b[i][3], // cash_account_id
        b[i][4], // amount
        "payroll_entry"
      ]);
    };
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields:f,
      rows:r
    });
    
    return callback();
  }

  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getPayment(()=>{
      getPayroll(()=>{  
        getJoinArray(()=>{
          RptCheckRegister.display(indek);
        });
      });
    });
  });
};

RptCheckRegister.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptCheckRegister.proses(indek); });
  toolbar.filter(indek,()=>{ RptCheckRegister.filter(indek); });
  toolbar.print(indek,()=>{ RptCheckRegister.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[ // width
    90, // check no
    90, // date
    200,// payee
    100,// cash account
    110, // amount
    90 // source
  ];
  var L=[];// left
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
          +s.setTitle( RptCheckRegister.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Check NO.')
          +s.setHeader(L[1], W[1], "left", 'Date')
          +s.setHeader(L[2], W[2], "left", 'Payee')
          +s.setHeader(L[3], W[3], "left", 'Cash Account')
          +s.setHeader(L[4], W[4], "right", 'Amount')
          +s.setHeader(L[5], W[5], "left", 'Source')            
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var amount=0;

      for(i=0;i<h2.length;i++){
                
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].check_no )
          +s.setLabel(L[1], W[1], "left", tglWest(h2[i].date) )
          +s.setLabel(L[2], W[2], "left", h2[i].payee )
          +s.setLabel(L[3], W[3], "left", h2[i].cash_account_id )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].amount) )
          +s.setLabel(L[5], W[5], "left", h2[i].source )

        html+='<br>';
        
        amount+=Number(h2[i].amount);
      }
      html+=''
        +s.setTotalA(L[3], W[3], "left", "Total" )
        +s.setTotalA(L[4], W[4], "right", ribuan0(amount) )
        +'<br>'
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( a.date === b.date ){
      return 0;
    }
    else{
      if( a.date < b.date ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptCheckRegister.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptCheckRegister.preview(indek); });
  toolbar.preview(indek,()=>{ RptCheckRegister.filterExecute(indek); });
  RptCheckRegister.formFilter(indek);
};

RptCheckRegister.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'    
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' id="btn_period_'+indek+'" '
          +' onclick="RptCheckRegister.period.getPaging(\''+indek+'\''
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
    +'</ul>'
  +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
};

RptCheckRegister.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptCheckRegister.getPeriod(indek);
};

RptCheckRegister.getPeriod=(indek)=>{
  RptCheckRegister.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptCheckRegister.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek)
  }
  bingkai[indek].rpt.refresh=false;
  RptCheckRegister.preview(indek);
};

RptCheckRegister.print=(indek)=>{
  
};


// eof: 324;300;
// report pertama yg menggunakan kolom;dan memaksimalkan sisi client.
