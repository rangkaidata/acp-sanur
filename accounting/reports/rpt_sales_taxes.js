/*
 * name: budiono;
 * date: may-24, 16:04, sat-2025; #55; 
 */

'use strict';

var RptSalesTaxes={}
  
RptSalesTaxes.table_name='rpt_sales_taxes';
RptSalesTaxes.title='Sales Taxes';
RptSalesTaxes.period=new PeriodLook(RptSalesTaxes);

RptSalesTaxes.show=(tiket)=>{
  tiket.modul=RptSalesTaxes.table_name;
  tiket.menu.name=RptSalesTaxes.title;
  tiket.rpt={
    "filter":{},
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptSalesTaxes.preview(indek);
  }else{
    show(baru);
  }
}

RptSalesTaxes.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptSalesTaxes.proses(indek);
  } else {  
    RptSalesTaxes.display(indek);
  };
};

RptSalesTaxes.proses=(indek)=>{
  
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
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
        }
      }
      return callback();
    });
  }
  
  function getSalesTaxes(callback){
    var sql="SELECT sales_tax_id"
      +",name"
      +",detail"
      +",tax_freight"
      +" FROM sales_taxes"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.sales_taxes=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.sales_taxes).rows;
    var f=["sales_tax_id","name","description","rate","account_id","freight"];
    var i=0,j=0;
    var r=[];
    var d=[];
    
    for(i=0;i<a.length;i++){
      d=JSON.parse(a[i][2]);
      for(j=0;j<d.length;j++){
        r.push([
          a[i][0],           //0: id
          a[i][1],           //1: name
          d[j].description,  //2: description
          d[j].rate,         //3: rate
          d[j].gl_account_id,//4: account_id
          a[i][3],           //5: freight
        ]);
      };
    };
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getCompany(()=>{
    getSalesTaxes(()=>{
      getJoinArray(()=>{
        RptSalesTaxes.display( indek );
      });
    });
  });
};

RptSalesTaxes.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptSalesTaxes.proses(indek); });
  toolbar.filter(indek,()=>{ RptSalesTaxes.filter(indek); });
  toolbar.print(indek,()=>{ RptSalesTaxes.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-id
    150, // 1-name
    100, // 2-description
    80, // 3-rate
    80, // 4-account_id
    80, // 5-freight
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
          +s.setTitle( RptSalesTaxes.title )
          +"<p>&nbsp;</p>"

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid grey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Sales Tax ID')
            +s.setHeader(L[1], W[1], "left", 'Name')
            +s.setHeader(L[2], W[2], "left", 'Description')
            +s.setHeader(L[3], W[3], "center", 'Tax Rate')
            +s.setHeader(L[4], W[4], "left", 'Account ID')
            +s.setHeader(L[5], W[5], "center", 'Tax Freight')
            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var sales_tax_id="";
      var sub_total=0;
      var X=200;

      for(i=0;i<h2.length;i++){
        if(i==0){
          sales_tax_id=h2[i].sales_tax_id;
          html+=""
            +s.setLabel(L[0], W[0], "left", h2[i].sales_tax_id )
            +s.setLabel(L[1], W[1], "left", h2[i].name )
        }
        if(sales_tax_id!=h2[i].sales_tax_id){
          html+=""  
            +s.setSubTotal(L[3], W[3], "center", ribuan(sub_total) )
            +"<br><br>"
            +s.setLabel(L[0], W[0], "left", h2[i].sales_tax_id )
            +s.setLabel(L[1], W[1], "left", h2[i].name )
          sub_total=0;
        }
        
        html+=''

          +s.setLabel(L[2], W[2], "left", h2[i].description )
          +s.setLabel(L[3], W[3], "center", ribuan(h2[i].rate) )
          +s.setLabel(L[4], W[4], "left", h2[i].account_id )
          +s.setLabel(L[5], W[5], "center", array_no_yes[ h2[i].freight ] )
        html+='<br>';
        
        sales_tax_id=h2[i].sales_tax_id;
        sub_total+=Number(h2[i].rate)
      }
      html+=''
        +s.setSubTotal(L[3], W[3], "center", ribuan(sub_total) )
        +'<br>'
        
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

  function sortByID(a,b){ // sort multidimensi;
    if( a.vendor_id === b.vendor_id ){
      return 0;
    }
    else{
      if( a.vendor_id < b.vendor_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptSalesTaxes.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptSalesTaxes.preview(indek); });
  toolbar.preview(indek,()=>{ RptSalesTaxes.filterExecute(indek); });
  RptSalesTaxes.formFilter(indek);
};

RptSalesTaxes.formFilter=(indek)=>{
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

RptSalesTaxes.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptSalesTaxes.getPeriod(indek);
};

RptSalesTaxes.getPeriod=(indek)=>{
  RptSalesTaxes.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptSalesTaxes.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "vendor_id": getEV("vendor_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptSalesTaxes.preview(indek);
};

RptSalesTaxes.print=(indek)=>{};

