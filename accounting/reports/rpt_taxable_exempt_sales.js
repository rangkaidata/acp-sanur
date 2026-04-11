/*
 * name: budiono;
 * date: aug-10, 16:25, sun-2025; #66;
 * edit: aug-12, 11:07, tue-2025; #66;
 */

'use strict';

var RptTaxableExemptSales={}
  
RptTaxableExemptSales.table_name='rpt_taxable_exempt_sales';
RptTaxableExemptSales.title='Taxable / Exempt Sales';
RptTaxableExemptSales.period=new PeriodLook(RptTaxableExemptSales);

RptTaxableExemptSales.show=(tiket)=>{
  tiket.modul=RptTaxableExemptSales.table_name;
  tiket.menu.name=RptTaxableExemptSales.title;
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

    RptTaxableExemptSales.preview(indek);
  }else{
    show(baru);
  }
}

RptTaxableExemptSales.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptTaxableExemptSales.proses(indek);
  } else {  
    RptTaxableExemptSales.display(indek);
  };
};

RptTaxableExemptSales.proses=(indek)=>{
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
  
  function getA(callback){
    var sql="SELECT description,tax_rate,taxable_sales,tax_amount,exempt_sales"
      +" FROM sales_tax_agency"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND invoice_date BETWEEN '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=["description","name","tax_rate","taxable_sales","tax_amount","exempt_sales","total_sales"];
    var i=0;
    var r=[];
    
    for(i=0;i<a.length;i++){
      r.push([
        a[i][0], //description
        "", //
        a[i][1], //tax_rate
        a[i][2], //taxable_sales
        a[i][3], //tax_amount
        a[i][4], //exempt_sales
        a[i][2], //total_sales
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
    var i,j;
    var r=[];
    var ada=false;
    
    for(i=0;i<a.length;i++){
      ada=false;
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){
          if(a[i][2]==r[j][2]){
            ada=true;
            r[j][3]+=a[i][3];
            r[j][4]+=a[i][4];
            r[j][5]+=a[i][5];
            r[j][6]+=a[i][6];
          }
        }
      }
      if(ada==false){
        r.push([
          a[i][0], //description
          a[i][1], // name
          a[i][2], //tax_rate
          Number(a[i][3]), //taxable_sales
          Number(a[i][4]), //tax_amount
          Number(a[i][5]), //exempt_sales
          Number(a[i][6]), //total_sales
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
    getA(()=>{
      getJoinArray(()=>{
        getSumArray(()=>{
          RptTaxableExemptSales.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptTaxableExemptSales.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptTaxableExemptSales.proses(indek); });
  toolbar.filter(indek,()=>{ RptTaxableExemptSales.filter(indek); });
  toolbar.print(indek,()=>{ RptTaxableExemptSales.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // vendor_id
    90, // name
    90, // tax_rate
    90, // taxable_sales
    90, // tax_amount
    90, // exempt_sales
    90, // total_sales
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
          +s.setTitle( RptTaxableExemptSales.title )
          +s.setFromTo( filter.from, filter.to )

          +'<canvas id="cv_'+indek+'" width=800 height=25 style="position:absolute;border:1px solid lightgrey;"></canvas>'

            +s.setHeader(L[0], W[0], "left", 'Description')
            +s.setHeader(L[1], W[1], "left", '')
            +s.setHeader(L[2], W[2], "left", 'Tax Rate')
            +s.setHeader(L[3], W[3], "left", 'Taxable Sales')
            +s.setHeader(L[4], W[4], "left", 'Tax Amount')
            +s.setHeader(L[5], W[5], "left", 'Exempt Sales')
            +s.setHeader(L[6], W[6], "left", 'Total Sales')

            +'<br>'

        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var agency_id='';

      for(i=0;i<h2.length;i++){
/*        
        if(agency_id!=h2[i].description){
          if(i>0){
            html+=''
              +'<br>';
          }
        }
*/        
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].description )
          +s.setLabel(L[1], W[1], "left", "" )
          +s.setLabel(L[2], W[2], "right", ribuan(h2[i].tax_rate) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].taxable_sales) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].tax_amount) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].exempt_sales) )
          +s.setLabel(L[6], W[6], "right", ribuan(h2[i].total_sales) )
          
        html+='<br>';
        
        agency_id=h2[i].description;
      }
      html+=''
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
    if( a.description === b.description ){
      return 0;
    }
    else{
      if( a.description < b.description ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptTaxableExemptSales.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptTaxableExemptSales.preview(indek); });
  toolbar.preview(indek,()=>{ RptTaxableExemptSales.filterExecute(indek); });
  RptTaxableExemptSales.formFilter(indek);
};

RptTaxableExemptSales.formFilter=(indek)=>{
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

RptTaxableExemptSales.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptTaxableExemptSales.getPeriod(indek);
};

RptTaxableExemptSales.getPeriod=(indek)=>{
  RptTaxableExemptSales.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptTaxableExemptSales.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptTaxableExemptSales.preview(indek);
};

RptTaxableExemptSales.print=(indek)=>{};



//eof: 306;367;
