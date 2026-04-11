/*
 * name: budiono;
 * date: jun-19, 19:19, thu-2025; #61; 
 */

'use strict';

var RptRetainedEarnings={}
  
RptRetainedEarnings.table_name='rpt_retained_earnings';
RptRetainedEarnings.title='Retained Earnings';
RptRetainedEarnings.period=new PeriodLook(RptRetainedEarnings);

RptRetainedEarnings.show=(tiket)=>{
  tiket.modul=RptRetainedEarnings.table_name;
  tiket.menu.name=RptRetainedEarnings.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "from": "",
      "to": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptRetainedEarnings.preview(indek);
  }else{
    show(baru);
  }
}

RptRetainedEarnings.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptRetainedEarnings.proses(indek);
  } else {  
    RptRetainedEarnings.display(indek);
  };
};

RptRetainedEarnings.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  
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
      d=JSON.parse(h);
      if(d.rows.length>0){
        if(bingkai[indek].rpt.filter.from==""){
          var d=objectMany(d.fields,d.rows);
          bingkai[indek].rpt.filter.from=d[0].start_date;
          from=d[0].start_date;
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
          to=tglSekarang();
        }
      }
      return callback();
    });
  }
  
  function getAA(callback){// 2-equity
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND account_class=2"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_aa=h;
      return callback();
    });
  }
  
  function getAB(callback){// 3-income
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND account_class=3"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_ab=h;
      return callback();
    });
  }
  
  function getAC(callback){// 4-cost of sales
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND account_class=4"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_ac=h;
      return callback();
    });
  }
  
  function getAD(callback){// 5-expense
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND account_class=5"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_ad=h;
      return callback();
    });
  }
  
  function getAE(callback){// 6-other income
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND account_class=6"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_ae=h;
      return callback();
    });
  }

  function getAF(callback){// 7-other expense
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND account_class=7"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_af=h;
      return callback();
    });
  }
//--begin--//    
  function getBA(callback){// 2-equity
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" AND account_class=2"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_ba=h;
      return callback();
    });
  }
  
  function getBB(callback){// 3-income
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" AND account_class=3"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_bb=h;
      return callback();
    });
  }
  
  function getBC(callback){// 4-cost of sales
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" AND account_class=4"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_bc=h;
      return callback();
    });
  }
  
  function getBD(callback){// 5-expense
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" AND account_class=5"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_bd=h;
      return callback();
    });
  }
  
  function getBE(callback){// 6-other income
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" AND account_class=6"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_be=h;
      return callback();
    });
  }
  
  function getBF(callback){// 7-other expense
    var sql="SELECT account_class,SUM(balance) AS balance"
      +" FROM general_ledger"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
      +" AND account_class=7"
      +" GROUP BY account_class"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_bf=h;
      return callback();
    });
  }

  function getJoinArray(callback){
    var aa=JSON.parse(bingkai[indek].rpt.data_aa).rows;
    var ab=JSON.parse(bingkai[indek].rpt.data_ab).rows;
    var ac=JSON.parse(bingkai[indek].rpt.data_ac).rows;
    var ad=JSON.parse(bingkai[indek].rpt.data_ad).rows;
    var ae=JSON.parse(bingkai[indek].rpt.data_ae).rows;
    var af=JSON.parse(bingkai[indek].rpt.data_af).rows;
    
    var ba=JSON.parse(bingkai[indek].rpt.data_ba).rows;
    var bb=JSON.parse(bingkai[indek].rpt.data_bb).rows;
    var bc=JSON.parse(bingkai[indek].rpt.data_bc).rows;
    var bd=JSON.parse(bingkai[indek].rpt.data_bd).rows;
    var be=JSON.parse(bingkai[indek].rpt.data_be).rows;
    var bf=JSON.parse(bingkai[indek].rpt.data_bf).rows;

    var f=["class_id","begin","current"];
    var i=0;
    var r=[];
    
    for(i=0;i<aa.length;i++){
      r.push([
        aa[i][0], //class
        0,
        aa[i][1], //balance
      ]);
    }
    
    for(i=0;i<ab.length;i++){
      r.push([
        ab[i][0], //class
        0,
        ab[i][1], //balance
      ]);
    }
    
    for(i=0;i<ac.length;i++){
      r.push([
        ac[i][0], //class
        0,
        ac[i][1], //balance
      ]);
    }
    
    for(i=0;i<ad.length;i++){
      r.push([
        ad[i][0], //class
        0,
        ad[i][1], //balance
      ]);
    }
    
    for(i=0;i<ae.length;i++){
      r.push([
        ae[i][0], //class
        0,
        ae[i][1], //balance
      ]);
    }
    
    for(i=0;i<af.length;i++){
      r.push([
        af[i][0], //class
        0,
        af[i][1], //balance
      ]);
    }
    
    // begin
    for(i=0;i<ba.length;i++){
      r.push([
        ba[i][0], //class
        ba[i][1], //begin
        0,
      ]);
    }
    
    for(i=0;i<bb.length;i++){
      r.push([
        bb[i][0], //class
        bb[i][1], //begin
        0,
      ]);
    }
    
    for(i=0;i<bc.length;i++){
      r.push([
        bc[i][0], //class
        bc[i][1], //begin
        0,
      ]);
    }
    
    for(i=0;i<bd.length;i++){
      r.push([
        bd[i][0], //class
        bd[i][1], //begin
        0,
      ]);
    }
    
    for(i=0;i<be.length;i++){
      r.push([
        be[i][0], //class
        be[i][1], //begin
        0,
      ]);
    }
    
    for(i=0;i<bf.length;i++){
      r.push([
        bf[i][0], //class
        bf[i][1], //begin
        0,
      ]);
    }

    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  function getSumArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.join_array).rows;
    var f=JSON.parse(bingkai[indek].rpt.join_array).fields;
    var r=[];
    var i,j;
    var ada=0;
    
    for(i=0;i<a.length;i++){
      ada=0;
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){// group class;
          ada=1;
          r[j][1]+=Number(a[i][1]);
          r[j][2]+=Number(a[i][2]);
        };
      };
      if(ada==0){
        r.push([
          a[i][0],
          a[i][1],
          a[i][2],
        ])
      }
    }

    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getAA(()=>{
      getAB(()=>{
        getAC(()=>{
          getAD(()=>{
            getAE(()=>{
              getAF(()=>{
                getBA(()=>{
                  getBB(()=>{
                    getBC(()=>{
                      getBD(()=>{
                        getBE(()=>{
                          getBF(()=>{
                            getJoinArray(()=>{
                              getSumArray(()=>{
                                RptRetainedEarnings.display( indek );
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptRetainedEarnings.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptRetainedEarnings.proses(indek); });
  toolbar.filter(indek,()=>{ RptRetainedEarnings.filter(indek); });
  toolbar.print(indek,()=>{ RptRetainedEarnings.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // class
    90, // name
    90, // beginning
    90, // current
    90, // ending
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
          +s.setTitle( RptRetainedEarnings.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Class ID')
            +s.setHeader(L[1], W[1], "left", 'Name')
            +s.setHeader(L[2], W[2], "right", 'Beginning')
            +s.setHeader(L[3], W[3], "right", 'Current')
            +s.setHeader(L[4], W[4], "right", 'Ending')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var ta=0;
      var tb=0;
      var tc=0

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].class_id )
          +s.setLabel(L[1], W[1], "left", array_account_class[h2[i].class_id] )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].begin*-1) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].current*-1) )
        html+='<br>';
        
        ta+=Number(h2[i].begin);
        tb+=Number(h2[i].current);
        tc+=Number(h2[i].begin)+Number(h2[i].current);
      }
      html+=''
        +s.setTotalA(L[2], W[2], "right", ribuan(ta*-1) )
        +s.setTotalA(L[3], W[3], "right", ribuan(tb*-1) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tc*-1) )
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
    if( a.class_id === b.class_id ){
      return 0;
    }
    else{
      if( a.class_id < b.class_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptRetainedEarnings.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptRetainedEarnings.preview(indek); });
  toolbar.preview(indek,()=>{ RptRetainedEarnings.filterExecute(indek); });
  RptRetainedEarnings.formFilter(indek);
};

RptRetainedEarnings.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
        
      +'<li><label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
        +' id="btn_period_'+indek+'" '
        +' onclick="RptCheckRegister.period.getPaging(\''+indek+'\''
        +',\'period_id_'+indek+'\')"'
        +' class="btn_find"></button>'

        +'</li>'
    
      +'<li><label>From</label>'
        +'<input type="date" id="from_'+indek+'">'
        +'</li>'
        
      +'<li><label>To</label>'
        +'<input type="date" id="to_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id );
  setEV('from_'+indek, bingkai[indek].rpt.filter.from );
  setEV('to_'+indek, bingkai[indek].rpt.filter.to );
};

RptRetainedEarnings.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptRetainedEarnings.getPeriod(indek);
};

RptRetainedEarnings.getPeriod=(indek)=>{
  RptGLAccountSummary.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptRetainedEarnings.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptRetainedEarnings.preview(indek);
};

RptRetainedEarnings.print=(indek)=>{};



//eof: 292;
