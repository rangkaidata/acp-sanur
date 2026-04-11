/*
 * name: budiono;
 * date: jun-18, 17:31, wed-2025; #61; 
 * edit: dec-31, 08:25, wed-2025; #86; report-std;
 */

'use strict';

var RptIncomeStatement={}
  
RptIncomeStatement.table_name='rpt_income_statement';
RptIncomeStatement.title='Income Statement';

RptIncomeStatement.show=(tiket)=>{
  tiket.modul=RptIncomeStatement.table_name;
  tiket.menu.name=RptIncomeStatement.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "date": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptIncomeStatement.preview(indek);
  }else{
    show(baru);
  }
}

RptIncomeStatement.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptIncomeStatement.proses(indek);
  } else {  
    RptIncomeStatement.display(indek);
  };
};

RptIncomeStatement.proses=(indek)=>{
  var date=bingkai[indek].rpt.filter.date;
  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
    
  content.html(indek,html);
  
  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
/*      
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
*/      
      return callback();
    });
  }
  
  function get_a(callback){// income class
    var sql="SELECT account_id,account_name,account_class"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+date+"'"
      +" AND account_class=3 " // income;
      +" GROUP BY account_id,account_name,account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function get_b(callback){// cost of sales class
    var sql="SELECT account_id,account_name,account_class"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+date+"'"
      +" AND account_class=4 "
      +" GROUP BY account_id,account_name,account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function get_c(callback){// expenses class
    var sql="SELECT account_id,account_name,account_class"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+date+"'"
      +" AND account_class=5 "
      +" GROUP BY account_id,account_name,account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_c=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var b=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var c=JSON.parse(bingkai[indek].rpt.data_c).rows;
    var f=["account_id","name","class","balance"];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){// income
      r.push([
        a[i][0], //id
        a[i][1], //name
        a[i][2], //class
        Number(a[i][3])*-1, //balance
      ]);
    };

    for(i=0;i<b.length;i++){// cost of sales
      r.push([
        b[i][0], //id
        b[i][1], //name
        b[i][2], //class
        b[i][3], //balance
      ]);
    };
    
    for(i=0;i<c.length;i++){// expenses
      r.push([
        c[i][0], //id
        c[i][1], //name
        c[i][2], //class
        c[i][3], //balance
      ]);
    };

    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    get_a(()=>{
      get_b(()=>{
        get_c(()=>{
          getJoinArray(()=>{
            RptIncomeStatement.display( indek );
          });
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptIncomeStatement.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptIncomeStatement.proses(indek); });
  toolbar.filter(indek,()=>{ RptIncomeStatement.filter(indek); });
  toolbar.print(indek,()=>{ RptIncomeStatement.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-id
    150, // 1-name
    90, // 2-class
    90, // 3-balance
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
    +'<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
    
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'

          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptIncomeStatement.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Account ID')
            +s.setHeader(L[1], W[1], "left", 'Description')
            +s.setHeader(L[2], W[2], "left", 'Class')
            +s.setHeader(L[3], W[3], "right", 'Balance')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var kelas;
      var t_income=0;
      var t_cos=0;
      var t_expense=0;
      var t_net=0;

      for(i=0;i<h2.length;i++){
        
        if(kelas!=h2[i].class){
          if(i>0){
            html+=''
//              +'<br>';
          }
          if(kelas==3){
            html+=''
              +s.setSubTotal(L[3], W[3], "right", ribuan(t_income) )
              +'<br><br>'
          }
          if(kelas==4){
            html+=''
              +s.setSubTotal(L[3], W[3], "right", ribuan(t_cos) )
              +'<br><br>'
          }
          
//          t_income=0;
//          t_cos=0;
//          t_expense=0;
        }
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].account_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "left", h2[i].class )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].balance) )
          
        html+='<br>';
        kelas=h2[i].class;
        if(kelas==3) t_income+=Number(h2[i].balance);
        if(kelas==4) t_cos+=Number(h2[i].balance);
        if(kelas==5) t_expense+=Number(h2[i].balance);
      }
      html+=''
        +s.setSubTotal(L[3], W[3], "right", ribuan(t_expense) )
        +'<br>'
        +s.setLabel(L[0], W[0], "left", "<strong>Net Income</strong>" )
        +s.setTotalA(L[3], W[3], "right", ribuan(t_income-t_cos-t_expense) )
        
      html+='</div>'
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
    if( a.account_id === b.account_id ){
      return 0;
    }
    else{
      if( a.account_id < b.account_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptIncomeStatement.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptIncomeStatement.preview(indek); });
  toolbar.preview(indek,()=>{ RptIncomeStatement.filterExecute(indek); });
  RptIncomeStatement.formFilter(indek);
};

RptIncomeStatement.formFilter=(indek)=>{
  var html='<div>'
  +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
      +'</li>'  
    +'</ul>'
  +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
};

RptIncomeStatement.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptIncomeStatement.preview(indek);
};

RptIncomeStatement.print=(indek)=>{};



// eof: 292;
