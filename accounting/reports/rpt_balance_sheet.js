/*
 * name: budiono;
 * date: jun-15, 13:56, sun-2025; #61; balance sheet;
 */

'use strict';

var RptBalanceSheet={}
  
RptBalanceSheet.table_name='rpt_balance_sheet';
RptBalanceSheet.title='Balance Sheet';
RptBalanceSheet.period=new PeriodLook(RptBalanceSheet);

RptBalanceSheet.show=(tiket)=>{
  tiket.modul=RptBalanceSheet.table_name;
  tiket.menu.name=RptBalanceSheet.title;
  tiket.rpt={
    "filter":{
      "date": tglSekarang(),
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptBalanceSheet.preview(indek);
  }else{
    show(baru);
  }
}

RptBalanceSheet.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptBalanceSheet.proses(indek);
  } else {  
    RptBalanceSheet.display(indek);
  };
};

RptBalanceSheet.proses=(indek)=>{
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
      return callback();
    });
  }
  
  function get_a(callback){ // asset
    var sql="SELECT account_id,account_name,account_class"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+date+"'"
      +" AND account_class=0"
      +" GROUP BY account_id,account_name,account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function get_b(callback){ // liability
    var sql="SELECT account_id,account_name,account_class"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+date+"'"
      +" AND account_class=1"
      +" GROUP BY account_id,account_name,account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function get_c(callback){ // equity
    var sql="SELECT account_id,account_name,account_class"
      +",SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+date+"'"
      +" AND account_class=2"
      +" GROUP BY account_id,account_name,account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_c=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var da=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var db=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var dc=JSON.parse(bingkai[indek].rpt.data_c).rows;
    
    var f=["account_id","name","class","balance"];
    var i=0;
    var r=[];
    var ta=0,tb=0,tc=0,td=0;
    
    for(i=0;i<da.length;i++){
      r.push([
        da[i][0], //0-id
        da[i][1], //1-name
        da[i][2], //2-class
        da[i][3], //3-balance
      ]);
      ta+=Number(da[i][3]);
    }
    
    for(i=0;i<db.length;i++){
      r.push([
        db[i][0], //0-id
        db[i][1], //1-name
        db[i][2], //2-class
        Number(db[i][3])*-1, //3-balance
      ]);
      tb+=Number(db[i][3])*-1;
    }
    
    for(i=0;i<dc.length;i++){
      r.push([
        dc[i][0], //0-id
        dc[i][1], //1-name
        dc[i][2], //2-class
        Number(dc[i][3])*-1, //3-balance
      ]);
      tc+=Number(dc[i][3])*-1;
    }
    
    td=ta-tb-tc;
    
    r.push([
      "Z", //0-id
      "Net Income", //1-name
      2, //2-class
      (td), //3-balance
    ]);    
    
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
            RptBalanceSheet.display( indek );
          });
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptBalanceSheet.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptBalanceSheet.proses(indek); });
  toolbar.filter(indek,()=>{ RptBalanceSheet.filter(indek); });
  toolbar.print(indek,()=>{ RptBalanceSheet.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  //0-id
    250, //1-name
    60,  //2-class
    90,  //3-balance
    90,  //4-sub_total
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
          +s.setTitle( RptBalanceSheet.title )
          +s.setDate( filter.date)

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Account ID')
            +s.setHeader(L[1], W[1], "left", 'Account Name')
            +s.setHeader(L[2], W[2], "left", 'Class')
            +s.setHeader(L[3], W[3], "left", 'Balance')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var kelas;
      var t_asset=0;
      var t_liability=0;
      var t_equity=0

      for(i=0;i<h2.length;i++){
        
        if(kelas!=h2[i].class){
          if(i>0){
            //html+='<br>'
          }
          if(kelas==0){
            html+=''
              +s.setSubTotal(L[4], W[4], "right", ribuan(t_asset) )
              +'<br><br>'
          }
          if(kelas==1){
            html+=''
              +s.setSubTotal(L[3], W[3], "right", ribuan(t_liability) )
              +'<br><br>'
          }
        }
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].account_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "left", h2[i].class )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].balance) )
          
        html+='<br>';
        
        kelas=h2[i].class;
        if(kelas==0) t_asset+=Number(h2[i].balance);
        if(kelas==1) t_liability+=Number(h2[i].balance);
        if(kelas==2) t_equity+=Number(h2[i].balance);
      }
      html+=''
        +s.setSubTotal(L[3], W[3], "right", ribuan(t_equity) )
        +'<br>'
        +s.setSubTotal(L[4], W[4], "right", ribuan(t_liability+t_equity) )
        +'<br>';
        
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
    if( String(a.class).concat(a.account_id) === String(b.class).concat(b.account_id) ){
      return 0;
    }
    else{
      if( String(a.class).concat(a.account_id) < String(b.class).concat(b.account_id) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptBalanceSheet.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptBalanceSheet.preview(indek); });
  toolbar.preview(indek,()=>{ RptBalanceSheet.filterExecute(indek); });
  RptBalanceSheet.formFilter(indek);
};

RptBalanceSheet.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
    
      +'<li><label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date );
};

RptBalanceSheet.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptBalanceSheet.preview(indek);
};



RptBalanceSheet.print=(indek)=>{};

