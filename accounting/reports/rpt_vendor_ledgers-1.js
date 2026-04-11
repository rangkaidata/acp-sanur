/*
 * name: budiono;
 * date: jun-13, 11:25, fri-2025; #59; cos_amount; vendor_ledgers;
 */

'use strict';

var RptVendorLedgers={}
  
RptVendorLedgers.table_name='rpt_vendor_ledgers';
RptVendorLedgers.title='Vendor Ledgers';
RptVendorLedgers.period=new PeriodLook(RptVendorLedgers);

RptVendorLedgers.show=(tiket)=>{
  tiket.modul=RptVendorLedgers.table_name;
  tiket.menu.name=RptVendorLedgers.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "vendor_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptVendorLedgers.preview(indek);
  }else{
    show(baru);
  }
}

RptVendorLedgers.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptVendorLedgers.proses(indek);
  } else {  
    RptVendorLedgers.display(indek);
  };
};

RptVendorLedgers.proses=(indek)=>{
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
          from=d[0].start_date;
        }
        if(bingkai[indek].rpt.filter.to==""){
          to=tglSekarang();
        }
      }
      return callback();
    });
  }
  

  

  
  function get_a(callback){
    var sql="SELECT vendor_id" // 0
      +",name"                 // 1
      +",date"                 // 2  
      +",invoice_no"           // 3  
      +",amount"               // 4  
      +" FROM vendor_begins_detail"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
 function get_b(callback){// vendor_begins_begin
    var sql="SELECT vendor_id" // 0
      +",name"                 // 1
      +",date"                 // 2  
      +",invoice_no"           // 3  
      +",amount"               // 4  
      +" FROM vendor_begins_detail"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_b=h;
      return callback();
    });
  }
  
  function get_c(callback){// receive_inventory
    var sql="SELECT vendor_id"
      +",vendor_name"
      +",date"
      +",receive_no"
      +",amount_paid"
      +",amount"
      +" FROM receive_inventory"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_c=h;
      return callback();
    });
  }
  
  function get_d(callback){
    var sql="SELECT vendor_id"
      +",vendor_name"
      +",date"
      +",receive_no"
      +",amount_paid"
      +",amount"
      +" FROM receive_inventory"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_d=h;
      return callback();
    });
  }
  
  function get_e(callback){
    var sql="SELECT vendor_id"
      +",name"
      +",date"
      +",credit_no"
      +",amount"
      +" FROM vendor_credits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_e=h;
      return callback();
    });
  }
  
  function get_f(callback){
    var sql="SELECT vendor_id"
      +",name"
      +",date"
      +",credit_no"
      +",amount"
      +" FROM vendor_credits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_f=h;
      return callback();
    });
  }
  
  function get_g(callback){
    var sql="SELECT vendor_id" //0
      +",name"                 //1
      +",date"                 // 2
      +",payment_no"           //3
      +",amount"               //4 
      +",detail"                //5
      +",receive_detail"         //6
      +" FROM payments"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_g=h;
      return callback();
    });
  }
  
  function get_h(callback){
    var sql="SELECT vendor_id" //0
      +",name"                 //1
      +",date"                 // 2
      +",payment_no"           //3
      +",amount"               //4 
      +",detail"                //5
      +",receive_detail"         //6
      +" FROM payments"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_h=h;
      return callback();
      
    });
  }
  
  function getJoinArray(callback){
    var da=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var db=JSON.parse(bingkai[indek].rpt.data_b).rows;
    var dc=JSON.parse(bingkai[indek].rpt.data_c).rows;
    var dd=JSON.parse(bingkai[indek].rpt.data_d).rows;
    var de=JSON.parse(bingkai[indek].rpt.data_e).rows;
    var df=JSON.parse(bingkai[indek].rpt.data_f).rows;
    var dg=JSON.parse(bingkai[indek].rpt.data_g).rows;
    var dh=JSON.parse(bingkai[indek].rpt.data_h).rows;
    
    var f=["vendor_id",
      "name",
      "date",
      "trans_no",
      "type",
      "debit_amt",
      "credit_amt",
      "balance"
    ];
    var i,j;
    var r=[];
    var balance=0;
    var d;
    
    // vendor_begins (begin);
    for(i=0;i<da.length;i++){
      r.push([
        da[i][0],     //0- vendor_id
        da[i][1],     //1- name
        "",   //2- date
        "Balance", //3- trans_no
        "",       //4- type
        0,           //5- debit
        0, //6- credit
        da[i][4], //7- balance
      ]);
    };
    
    // vendor_begins (trans);
    for(i=0;i<db.length;i++){
      r.push([
        db[i][0],     //0- vendor_id
        db[i][1],     //1- name
        db[i][2],   //2- date
        db[i][3], //3- trans_no
        "BEG",       //4- type
        0,           //5- debit
        db[i][4], //6- credit
        db[i][4], //7- balance
      ]);
    };
    
    // purchase invoices (trans)
    for(i=0;i<dc.length;i++){
      balance=Number(dc[i][5])-Number(dc[i][4])
      r.push([
        dc[i][0], //0- vendor_id
        dc[i][1], //1- name
        dc[i][2], //2- date
        dc[i][3], //3- trans_no
        "INV",  //4- type
        dc[i][4], //5- debit
        dc[i][5], //6- credit
        balance, //7- balance
      ]);
    }
    
    // purchase invoices (begin)
    for(i=0;i<dd.length;i++){
      balance=Number(dd[i][5])-Number(dd[i][4])
      r.push([
        dd[i][0], //0- vendor_id
        dd[i][1], //1- name
        "", //2- date
        "Balance", //3- trans_no
        "",  //4- type
        0, //5- debit
        0, //6- credit
        balance, //7- balance
      ]);
    }

    // vendor credit memos (de-trans)
    balance=0;
    for(i=0;i<de.length;i++){
      r.push([
        de[i][0], //0- vendor_id
        de[i][1], //1- name
        de[i][2], //2- date
        de[i][3], //3- trans_no
        "VCM",  //4- type
        de[i][4], //5- debit
        0,       //6- credit
        Number(de[i][4])*-1, //7- balance
      ]);
    }
    
    // vendor credit memos (df-begin)
    balance=0;
    for(i=0;i<df.length;i++){
      r.push([
        df[i][0], //0- vendor_id
        df[i][1], //1- name
        "",       //2- date
        "Balance",       //3- trans_no
        "",       //4- type
        0,        //5- debit
        0,        //6- credit
        Number(df[i][4])*-1, //7- balance
      ]);
    }
    
    // payments (dg-trans)
    var amount;
    
    for(i=0;i<dg.length;i++){
          
      // payment_detail
      d=JSON.parse(dg[i][5]);
      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          r.push([
            dg[i][0],     //0- vendor_id
            dg[i][1],     //1- name
            dg[i][2],     //2- date
            dg[i][3],     //3- trans_no
            "PAY",       //4- type
            d[j].amount,           //5- debit
            d[j].amount, //6- credit
            0,     //7- balance
          ]);
        }
      };
      
      // receive_detail amount
      d=JSON.parse(dg[i][6]);
      for(j=0;j<d.length;j++){
        if(Number(d[j].amount_paid)!=0){
          amount=Number(d[j].amount_paid)+Number(d[j].discount)
          r.push([
            dg[i][0], //0- vendor_id
            dg[i][1], //1- name
            dg[i][2], //2- date
            dg[i][3], //3- trans_no
            "PAY",   //4- type
            amount,  //5- debit
            0,       //6- credit
            amount*-1,  //7- balance
          ]);
        }
        
        // discount
        if(Number(d[j].discount)!=0){
          r.push([
            dg[i][0], //0- vendor_id
            dg[i][1], //1- name
            dg[i][2], //2- date
            dg[i][3], //3- trans_no
            "PAY",   //4- type
            d[j].discount,  //5- debit
            d[j].discount,       //6- credit
            0,  //7- balance
          ]);
        }
      };
    };
    
    // payments (dh-begin)
    
    for(i=0;i<dh.length;i++){
/*          
      // payment_detail
      d=JSON.parse(dh[i][5]);
      for(j=0;j<d.length;j++){
        if(d[j].amount!=0){
          r.push([
            dh[i][0],     //0- vendor_id
            dh[i][1],     //1- name
            "",     //2- date
            "",     //3- trans_no
            "",       //4- type
            d[j].amount,           //5- debit
            d[j].amount, //6- credit
            0,     //7- balance
          ]);
        }
      };
*/      
      // receive_detail amount
      d=JSON.parse(dh[i][6]);
      for(j=0;j<d.length;j++){
        if(Number(d[j].amount_paid)!=0){
          amount=Number(d[j].amount_paid)+Number(d[j].discount)
          r.push([
            dh[i][0], //0- vendor_id
            dh[i][1], //1- name
            "", //2- date
            "Balance", //3- trans_no
            "",   //4- type
            0,  //5- debit
            0,       //6- credit
            amount*-1,  //7- balance
          ]);
        }
/*        
        // discount
        if(Number(d[j].discount)!=0){
          r.push([
            dh[i][0], //0- vendor_id
            dh[i][1], //1- name
            dh[i][2], //2- date
            dh[i][3], //3- trans_no
            "PAY",   //4- type
            d[j].discount,  //5- debit
            d[j].discount,       //6- credit
            0,  //7- balance
          ]);
        }
*/        
      };
    };

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
        if(a[i][0]==r[j][0]){
          if(a[i][2]==r[j][2]){
            if(a[i][3]==r[j][3]){
              ada=1;
              r[j][5]+=Number(a[i][5]);
              r[j][6]+=Number(a[i][6]);
              r[j][7]+=Number(a[i][7]);
            }
          }
        }
      }
      if(ada==0){
        r.push([
          a[i][0],
          a[i][1],
          a[i][2],
          a[i][3],
          a[i][4],
          a[i][5],
          a[i][6],
          a[i][7],
        ]);
      }
    }
    
    
    bingkai[indek].rpt.sum_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();    
  }
  
  getCompany(()=>{
    get_a(()=>{
      get_b(()=>{
        get_c(()=>{
          get_d(()=>{
            get_e(()=>{
              get_f(()=>{
                get_g(()=>{
                  get_h(()=>{  
                    getJoinArray(()=>{
                      getSumArray(()=>{
                        RptVendorLedgers.display( indek );
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

RptVendorLedgers.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptVendorLedgers.proses(indek); });
  toolbar.filter(indek,()=>{ RptVendorLedgers.filter(indek); });
  toolbar.print(indek,()=>{ RptVendorLedgers.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // vendor_id
    90, // name
    90, // date
    90, // trans_no
    50, // type
    90, // debit
    90, // credit
    90, // balance
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
          +s.setTitle( RptVendorLedgers.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Vendor ID')
            +s.setHeader(L[1], W[1], "left", 'Vendor Name')
            +s.setHeader(L[2], W[2], "left", 'Date')
            +s.setHeader(L[3], W[3], "left", 'Trans No.')
            +s.setHeader(L[4], W[4], "left", 'Type')
            +s.setHeader(L[5], W[5], "right", 'Debit Amt')
            +s.setHeader(L[6], W[6], "right", 'Credit Amt')
            +s.setHeader(L[7], W[7], "right", 'Balance')
            
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var vendor_id;
      var balance=0;
      var td=0,tc=0,tb=0;

      for(i=0;i<h2.length;i++){
        if(vendor_id!=h2[i].vendor_id){
          if(i>0){
            html+="<br>"
          };
          balance=0;
        }
        balance+=Number(h2[i].balance);
        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].vendor_id )
          +s.setLabel(L[1], W[1], "left", h2[i].name )
          +s.setLabel(L[2], W[2], "left", tglWest(h2[i].date) )
          +s.setLabel(L[3], W[3], "left", h2[i].trans_no )
          +s.setLabel(L[4], W[4], "left", h2[i].type )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].debit_amt) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].credit_amt) )
          +s.setLabel(L[7], W[7], "right", ribuan(balance) )
          
        html+='<br>';
        
        vendor_id=h2[i].vendor_id;
        td+=Number(h2[i].debit_amt);
        tc+=Number(h2[i].credit_amt);
        tb+=Number(h2[i].balance);
      }
      html+=''
        +s.setTotalA(L[5], W[5], "right", ribuan(td) )
        +s.setTotalA(L[6], W[6], "right", ribuan(tc) )
        +s.setTotalA(L[7], W[7], "right", ribuan(tb) )
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
    if( String(a.vendor_id).concat(a.date) === String(b.vendor_id).concat(b.date) ){
      return 0;
    }
    else{
      if( String(a.vendor_id).concat(a.date) < String(b.vendor_id).concat(b.date) ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptVendorLedgers.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptVendorLedgers.preview(indek); });
  toolbar.preview(indek,()=>{ RptVendorLedgers.filterExecute(indek); });
  RptVendorLedgers.formFilter(indek);
};

RptVendorLedgers.formFilter=(indek)=>{
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
        
      +'<li><label>Vendor ID</label>'
        +'<input type="text" id="vendor_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('vendor_id_'+indek, bingkai[indek].rpt.filter.vendor_id ); 
};

RptVendorLedgers.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptVendorLedgers.getPeriod(indek);
};

RptVendorLedgers.getPeriod=(indek)=>{
  RptVendorLedgers.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptVendorLedgers.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptVendorLedgers.preview(indek);
};

RptVendorLedgers.print=(indek)=>{};

