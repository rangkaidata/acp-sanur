/*
 * name: budiono;
 * date: aug-12, 17:45, tue-2025; #66;  
 */

'use strict';

var RptSalesRepReports={}
  
RptSalesRepReports.table_name='rpt_sales_rep_reports';
RptSalesRepReports.title='Sales Rep Reports';
RptSalesRepReports.period=new PeriodLook(RptSalesRepReports);

RptSalesRepReports.show=(tiket)=>{
  tiket.modul=RptSalesRepReports.table_name;
  tiket.menu.name=RptSalesRepReports.title;
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

    RptSalesRepReports.preview(indek);
  }else{
    show(baru);
  }
}

RptSalesRepReports.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptSalesRepReports.proses(indek);
  } else {  
    RptSalesRepReports.display(indek);
  };
};

RptSalesRepReports.proses=(indek)=>{
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  
  function getA(callback){
    var sql="SELECT sales_rep_id,customer_name,total,tax_amount"
      +" FROM invoices"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from+"' AND '"+to+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=["sales_rep_id","customer_name","sales_amt","non_comm_amt",
      "percent_of_total"];
    var i=0;
    var r=[];
    var sales_amount=0;
    
    for(i=0;i<a.length;i++){
      sales_amount=Number(a[i][2])-Number(a[i][3]);
      r.push([
        a[i][0], //vendor_id
        a[i][1], //name
        sales_amount, // sales_amount 
        sales_amount, // non-comm-amt;
        0,// percent_of_total
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
    var i=0,j=0;
    var r=[];
    var ada=false;
    var total_sales=0;
    
    for(i=0;i<a.length;i++){
      ada=false;
      for(j=0;j<r.length;j++){
        if(a[i][0]==r[j][0]){
          if(a[i][1]==r[j][1]){
            ada=true;
            r[j][2]+=Number(a[i][2]);
            r[j][3]+=Number(a[i][3]);
          }
        }
      }
      if(ada==false){
        r.push([
          a[i][0], //0-sales_rep
          a[i][1], //1-customer+name
          Number(a[i][2]), // 2=sales_amount 
          Number(a[i][3]), // 3-non-comm-amt;
          0, // 4-percent_of_total
        ]);
      }
      total_sales+=Number(a[i][3]);
    }
    
    for(i=0;i<r.length;i++){
      r[i][4]=(Number(r[i][3])/total_sales)*100;
    }
    
    bingkai[indek].rpt.sum_array=JSON.stringify({
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
      getJoinArray(()=>{
        getSumArray(()=>{
          RptSalesRepReports.display( indek );
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;
};

RptSalesRepReports.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptSalesRepReports.proses(indek); });
  toolbar.filter(indek,()=>{ RptSalesRepReports.filter(indek); });
  toolbar.print(indek,()=>{ RptSalesRepReports.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.sum_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // sales_rep_id
    130, // customer_name
    90, // comm_amt
    110, // non_comm_amt
    90, // total_sales
    90, // percent_of_total
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
          +s.setTitle( RptSalesRepReports.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Sales Rep ID')
          +s.setHeader(L[1], W[1], "left", 'Customer Name')
          +s.setHeader(L[2], W[2], "right", 'Comm Amt')
          +s.setHeader(L[3], W[3], "right", 'Non-Comm Amt')
          +s.setHeader(L[4], W[4], "right", 'Total Sales')
          +s.setHeader(L[5], W[5], "right", '% of total')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e
      
      var h2=h.sort( sortByID );
      var tot_sales_amt=0;
      var tot_non_comm_amt=0;
      var tot_percent=0;

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].sales_rep_id )
          +s.setLabel(L[1], W[1], "left", h2[i].customer_name )
          +s.setLabel(L[2], W[2], "right", ribuan(0) )
          +s.setLabel(L[3], W[3], "right", ribuan(h2[i].non_comm_amt) )
          +s.setLabel(L[4], W[4], "right", ribuan(h2[i].sales_amt) )
          +s.setLabel(L[5], W[5], "right", ribuan(h2[i].percent_of_total) )
          
        html+='<br>';
        
        tot_sales_amt+=Number(h2[i].sales_amt);
        tot_non_comm_amt+=Number(h2[i].non_comm_amt);
        tot_percent+=Number(h2[i].percent_of_total)
      }
      html+=''
        +s.setTotalA(L[1], W[1], "left", "Grand Total" )
        +s.setTotalA(L[3], W[3], "right", ribuan(tot_non_comm_amt) )
        +s.setTotalA(L[4], W[4], "right", ribuan(tot_sales_amt) )
        +s.setTotalA(L[5], W[5], "right", ribuan(tot_percent) )
        
        +'<br>';
        
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);

  renderLine(indek,L);

  function sortByID(a,b){ // sort multidimensi;
    if( a.customer_name === b.customer_name ){
      return 0;
    }
    else{
      if( a.customer_name < b.customer_name ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptSalesRepReports.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptSalesRepReports.preview(indek); });
  toolbar.preview(indek,()=>{ RptSalesRepReports.filterExecute(indek); });
  RptSalesRepReports.formFilter(indek);
};

RptSalesRepReports.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
      +'<ul>'    
        +'<li>'
          +'<label>Period</label>'
          +'<input type="text" '
            +' id="period_id_'+indek+'" '
            +' size="17">'
          +'<button type="button" '
            +' id="btn_period_'+indek+'" '
            +' onclick="RptSalesRepReports.period.getPaging(\''+indek+'\''
            +',\'period_id_'+indek+'\')"'
            +' class="btn_find">'
          +'</button>'
        +'</li>'
        +'<li>'
          +'<label>From</label>'
          +'<input type="date" '
            +' id="from_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<label>To</label>'
          +'<input type="date" '
            +' id="to_'+indek+'">'
        +'</li>'
      +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 

};

RptSalesRepReports.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptSalesRepReports.getPeriod(indek);
};

RptSalesRepReports.getPeriod=(indek)=>{
  RptSalesRepReports.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptSalesRepReports.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptSalesRepReports.preview(indek);
};

RptSalesRepReports.print=(indek)=>{};



//eof: 292;
