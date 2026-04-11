/*
 * name: budiono;
 * date: may-10, 17:49, sat-2025; #report;
 * edit: sep-22, 14:06, mon-2025; #pattern;
 * edit: dec-21, 17:00, sun-2025; #85; report-report recode;
 */

'use strict';

var RptGeneralJournal={}
  
RptGeneralJournal.table_name='rpt_general_journal';
RptGeneralJournal.title='General Journal';
RptGeneralJournal.period=new PeriodLook(RptGeneralJournal);
RptGeneralJournal.account=new AccountLook(RptGeneralJournal);

RptGeneralJournal.show=(tiket)=>{
  tiket.modul=RptGeneralJournal.table_name;
  tiket.menu.name=RptGeneralJournal.title;
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

    RptGeneralJournal.preview(indek);

  }else{
    show(baru);
  }
}

RptGeneralJournal.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptGeneralJournal.proses(indek);
  } else {  
    RptGeneralJournal.display(indek);
  };
}

RptGeneralJournal.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var account_id=bingkai[indek].rpt.filter.account_id;  
  var account_name=bingkai[indek].rpt.filter.account_name;  

  function getA(callback){
    var sql="SELECT date,journal_no,description,detail,amount"
      +" FROM journal_entry"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function joinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=[
      "date",
      "account_id",
      "reference",
      "description",
      "debit_amt",
      "credit_amt"
    ];
    var r=[];
    var d=[];
    var i,j;
    
    for(i=0;i<a.length;i++){
      d=JSON.parse(a[i][3]);
      
      for(j=0;j<d.length;j++){
        r.push([
          a[i][0], // date
          d[j].account_id, // account_id
          a[i][1], // reference

          d[j].description, // description
          d[j].debit, // debit_amt
          d[j].credit, // credit_amt
        ]);
      }
    }

    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });

    return callback();
  }

  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;
    getA(()=>{
      joinArray(()=>{    
        RptGeneralJournal.display(indek);
      });
    });
  });
  bingkai[indek].rpt.refresh=true;// sudah refresh
}

RptGeneralJournal.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptGeneralJournal.proses(indek); });
  toolbar.filter(indek,()=>{ RptGeneralJournal.filter(indek); });
  toolbar.print(indek,()=>{ RptGeneralJournal.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    80,  // date
    90,  // account id
    90,  // reference
    200, // description
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
          +s.setTitle( RptGeneralJournal.title )
          +s.setFromTo( filter.from, filter.to)
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Date')
          +s.setHeader(L[1], W[1], "left", 'Account ID')
          +s.setHeader(L[2], W[2], "left", 'Reference')
          +s.setHeader(L[3], W[3], "left", 'Description')
          +s.setHeader(L[4], W[4], "right", 'Debit Amt')
          +s.setHeader(L[5], W[5], "right", 'Credit Amt')
          +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div class="report-detail">';//e
      
      var h2=h.sort( sortByID );
      var dbt_tot=0;
      var crt_tot=0;
      var reference='';
      var date='';

      for(i=0;i<h2.length;i++){
        if(h2[i].reference!=reference){
          if(i>0) html+='<br>';
          
          html+=''
            +s.setLabel(L[0], W[0], "left", tglEast(h2[i].date) )  
            +s.setLabel(L[2], W[2], "left", h[i].reference )
        }
        html+=''
          +s.setLabel(L[1], W[1], "left", h2[i].account_id )
          +s.setLabel(L[3], W[3], "left", h[i].description )
          +s.setLabel(L[4], W[4], "right", ribuan(h[i].debit_amt) )
          +s.setLabel(L[5], W[5], "right", ribuan(h[i].credit_amt) )

        html+='<br>';

        reference=h2[i].reference;
        date=h2[i].date;

        dbt_tot+=Number(h2[i].debit_amt);
        crt_tot+=Number(h2[i].credit_amt);
      }        
      html+=''
        +s.setTotal(L[3], W[3], "left", 'Total' )
        +s.setTotal(L[4], W[4], "right", ribuan(dbt_tot) )
        +s.setTotal(L[5], W[5], "right", ribuan(crt_tot) )
// end-detail

    html+='</div>'// e
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
    if( String(a.date).concat(a.reference)
    ===String(b.date).concat(b.reference)){
      return 0;
    }
    else{
      if( String(a.date).concat(a.reference) 
      < String(b.date).concat(b.reference)){
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptGeneralJournal.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptGeneralJournal.preview(indek); });
  toolbar.preview(indek,()=>{RptGeneralJournal.filterExecute(indek); });
  RptGeneralJournal.formFilter(indek);
}

RptGeneralJournal.formFilter=(indek)=>{
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
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
}


RptGeneralJournal.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptGeneralJournal.getPeriod(indek);
}

RptGeneralJournal.getPeriod=(indek)=>{
  RptGeneralJournal.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
}

RptGeneralJournal.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
  }
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptGeneralJournal.filter(indek); });
  toolbar.print(indek,()=>{RptGeneralJournal.print(indek); });
  RptGeneralJournal.proses(indek);
}

RptGeneralJournal.print=(indek)=>{
  alert('print !!!');
}


// eof: 147;265;325;
