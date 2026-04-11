/*
 * name: budiono;
 * date: may-18, 21:20, sun-2025; #55; 
 */

'use strict';

var RptProfitabilityReport={}
  
RptProfitabilityReport.table_name='rpt_inventory_profitability_report';
RptProfitabilityReport.title='Inventory Profitability Report';

RptProfitabilityReport.show=(tiket)=>{
  tiket.modul=RptProfitabilityReport.table_name;
  tiket.menu.name=RptProfitabilityReport.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "item_id": "",
      "item_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptProfitabilityReport.preview(indek);
  }else{
    show(baru);
  }
}

RptProfitabilityReport.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptProfitabilityReport.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptProfitabilityReport.display(indek);
  };
};

RptProfitabilityReport.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var item_id=bingkai[indek].rpt.filter.item_id;
  
  function getItemCosting(callback){
    
    var sql="SELECT item_id,SUM(quantity) AS quantity"
      +",SUM(total_sales) AS total_sales"
      +",SUM(total_cost) AS total_cost"
      +" FROM item_costing"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date between '"+from+"' AND '"+to+"'"
      +" AND total_sales !=0"
    if(item_id!=""){
      sql+=" AND item_id='"+item_id+"'";
    }
    sql+=" GROUP BY item_id";
    
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.item_costing=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.item_costing).rows;
    var n=[];
    var m=[];
    var gross_profit=0;
    var profit=0;
    var sum_gross_profit=0;
    
    for(var i=0;i<a.length;i++){
        gross_profit=(a[i][2]*-1)-(a[i][3]*-1);
        profit=(gross_profit/(a[i][2]*-1))*100;
        n.push([
          a[i][0], // item_id
          a[i][1]*-1, // quantity
          a[i][2]*-1, // total_sales
          a[i][3]*-1, // total_cost
          gross_profit,// 4-gross_profit
          profit,// 5-percent_profit
          0, //  6-percent_contribution
        ]);
        sum_gross_profit+=gross_profit;
    }
    
    // percent of contribution
    for(i=0;i<n.length;i++){
      n[i][6]=(n[i][4]/sum_gross_profit)*100;
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      "fields":[
        "item_id",
        "quantity",
        "total_sales",
        "total_cost",
        "gross_profit",
        "percent_profit",
        "percent_total"
      ],
      "rows":n,
    });
    
    return callback();
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getItemCosting(()=>{
      getJoinArray(()=>{
        RptProfitabilityReport.display(indek);
      });
    });
  });
};

RptProfitabilityReport.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptProfitabilityReport.proses(indek); });
  toolbar.filter(indek,()=>{ RptProfitabilityReport.filter(indek); });
  toolbar.print(indek,()=>{ RptProfitabilityReport.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.join_array);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90, // 0-itemid
    90, // 1-unit sold
    90, // 2-sales
    90, // 3-cost
    90, // 4-gross profit
    90, // 5-profit %
    90, // 6-% of total
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
  var X=200;

  var html=''
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d
          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptProfitabilityReport.title )
          +s.setFromTo( filter.from , filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'

          +s.setHeader(L[0], W[0], "left", 'Item ID')
          +s.setHeader(L[1], W[1], "left", 'Unit Sold')
          +s.setHeader(L[2], W[2], "left", 'Sales')
          +s.setHeader(L[3], W[3], "left", 'Cost')
          +s.setHeader(L[4], W[4], "left", 'Gross Profit')
          +s.setHeader(L[5], W[5], "left", 'Profit (%)')
          +s.setHeader(L[6], W[6], "left", '% of Total')
          +'<br>'
/*
          +setTR(10)            
            +setTH(120,  "left", 'Item ID')
            +setTH(85,  "left", 'Unit Sold')
            +setTH(85,  "left", 'Sales')
            +setTH(85, "left", 'Cost')
            +setTH(85, "center", 'Gross Profit')
            +setTH(85, "center", 'Profit (%)')
            +setTH(85, "center", '% of Total')
            +'<br>'
*/            
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );
      var sum_quantity=0;
      var sum_sales=0;
      var sum_cost=0;
      var sum_gross_profit=0;
      var sum_percent_total=0;

      for(var i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0],W[0], "left", h2[i].item_id )
          +s.setLabel(L[1],W[1], "right", ribuan(h2[i].quantity) )
          +s.setLabel(L[2],W[2], "right", ribuan(h2[i].total_sales) )
          +s.setLabel(L[3],W[3], "right", ribuan(h2[i].total_cost) )
          +s.setLabel(L[4],W[4], "right", ribuan(h2[i].gross_profit) )
          +s.setLabel(L[5],W[5], "right", ribuan(h2[i].percent_profit) )
          +s.setLabel(L[6],W[6], "right", ribuan(h2[i].percent_total) )
        html+='<br>';
        
        sum_quantity+=h2[i].quantity;
        sum_sales+=h2[i].total_sales;
        sum_cost+=h2[i].total_cost;
        sum_gross_profit+=h2[i].gross_profit;
        sum_percent_total+=h2[i].percent_total;
      }
      html+=''
        +s.setTotalA( L[1],W[1], "right", ribuan(sum_quantity) )
        +s.setTotalA( L[2],W[2], "right", ribuan(sum_sales) )
        +s.setTotalA( L[3],W[3], "right", ribuan(sum_cost) )
        +s.setTotalA( L[4],W[4], "right", ribuan(sum_gross_profit) )
        +s.setTotalA( L[6],W[6], "right", ribuan(sum_percent_total) )
        +'<br>'
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( a.percent_total === b.percent_total ){
      return 0;
    }
    else{
      if( a.percent_total < b.percent_total ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptProfitabilityReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptProfitabilityReport.preview(indek); });
  toolbar.preview(indek,()=>{ RptProfitabilityReport.filterExecute(indek); });
  RptProfitabilityReport.formFilter(indek);
};

RptProfitabilityReport.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'    
      +'<li>'
        +'<label>Period</label>'
        +'<input type="text" id="period_id_'+indek+'" size="17">'
        +'<button type="button" '
          +' onclick="LookTable.period.getPaging(\''+indek+'\''
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
      +'<li>'
        +'<label>Item ID</label>'
        +'<input type="text" id="item_id_'+indek+'">'
        +'<button type="button" '
          +' onclick="LookTable.item.getPaging(\''+indek+'\''
          +',\'item_id_'+indek+'\')"'
          +' class="btn_find">'
        +'</button>'
        +'<input type="text" id="item_name_'+indek+'" disabled>'
      +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('period_id_'+indek, bingkai[indek].rpt.filter.period_id ); 
  setEV('from_'+indek, bingkai[indek].rpt.filter.from ); 
  setEV('to_'+indek, bingkai[indek].rpt.filter.to ); 
  setEV('item_id_'+indek, bingkai[indek].rpt.filter.item_id ); 
};

RptProfitabilityReport.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  RptProfitabilityReport.getPeriod(indek);
};

RptProfitabilityReport.getPeriod=(indek)=>{
  RptProfitabilityReport.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
};

RptProfitabilityReport.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV('period_id_'+indek),
    "from": getEV('from_'+indek),
    "to": getEV("to_"+indek),
    "item_id": getEV("item_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptProfitabilityReport.preview(indek);
};

RptProfitabilityReport.print=(indek)=>{};


// eof: 
