/*
 * name: budiono;
 * date; may-15, 10:42, thu-2025; #54; report;
 * edit: dec-31, 14:09, wed-2025; #85; report-std;
 */ 

'use strict';

var RptItemCosting={}
  
RptItemCosting.table_name='rpt_item_costing';
RptItemCosting.title='Item Costing Report';

RptItemCosting.show=(tiket)=>{
  tiket.modul=RptItemCosting.table_name;
  tiket.menu.name=RptItemCosting.title;
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

    RptItemCosting.preview(indek);
  }else{
    show(baru);
  }
}

RptItemCosting.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptItemCosting.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptItemCosting.display(indek);
  };
}

RptItemCosting.proses=(indek)=>{
  
  var period_id=bingkai[indek].rpt.filter.period_id;
  var from=bingkai[indek].rpt.filter.from;
  var to=bingkai[indek].rpt.filter.to;
  var item_id=bingkai[indek].rpt.filter.item_id;
  
  function getItemCosting(callback){
    var sql="SELECT item_id,item_name,reference,date,quantity,unit_cost"
      +",total_cost,location_id,table_name"
      +" FROM item_costing"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date BETWEEN '"+from +"' AND '"+to+"'";
      if(item_id!=""){
        sql+=" AND item_id='"+item_id+"'";
      }
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.item_costing=h;
      return callback();
    });
  }
  
  function getItemCostingBegin(callback){
    var sql="SELECT item_id,item_name,location_id"
      +",SUM(quantity) AS quantity"
      +",SUM(total_cost) AS total_cost"
      +" FROM item_costing"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date < '"+from +"'"
      if(item_id!=""){
        sql+=" AND item_id='"+item_id+"'";
      }
      sql+=" GROUP BY item_id,item_name,location_id";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.item_costing_begin=h;
      return callback();
    });
  }

  function joinArray(callback){
    var b=JSON.parse(bingkai[indek].rpt.item_costing_begin).rows;
    var n={
      fields: JSON.parse(bingkai[indek].rpt.item_costing).fields,
      rows: JSON.parse(bingkai[indek].rpt.item_costing).rows,
    };
    
    for (var i=0;i<b.length;i++){// tambah begin ke main array;
      n.rows.push([
        b[i][0], // item_id,
        b[i][1],// item_name,
        '<b>Beginning</b>', // reference,
        '', // date,
        b[i][3],// quantity,
        0, // unit_cost,
        b[i][4], // total_cost,
        b[i][2], // location_id,
        'beg_bal',// table_name
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify(n);
    return callback();
  }

  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    from=bingkai[indek].rpt.filter.from;
    to=bingkai[indek].rpt.filter.to;

    getItemCosting(()=>{
      getItemCostingBegin(()=>{
        joinArray(()=>{
          RptItemCosting.display(indek);
        });
      });
    });
  });
}

RptItemCosting.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptItemCosting.proses(indek); });
  toolbar.filter(indek,()=>{ RptItemCosting.filter(indek); });
  toolbar.print(indek,()=>{ RptItemCosting.print(indek); });
    
  var s=new rptHTML();
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.join_array);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;  
  var i=0;  
  var W=[
    90, // item_id
    200, // location
    90, // quantity
    90, // unit cost
    90, // total cost
    90  // table name
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
          +s.setTitle( RptItemCosting.title )
          +s.setFromTo( filter.from, filter.to )
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height="50" class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], X, "left", 'Item ID<br>Reference')
          +s.setHeader(L[1], W[1], "left", 'Location ID<br>Date')
          +s.setHeader(L[2], W[2], "right", 'Quantity')
          +s.setHeader(L[3], W[3], "right", 'Unit Cost')
          +s.setHeader(L[4], W[4], "right", 'Total Cost')
          +s.setHeader(L[5], W[5], "left", 'Table Name')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail-dua">';//e

      var h2=h.sort( sortByID );
      var item_id_old="";
      var sum_qty=0;
      var sum_value=0;

      for(var i=0;i<h2.length;i++){

        if(i==0){// first 
          item_id_old=h2[i].item_id;
          html+=s.setLabel(L[0],W[0], "left", item_id_old )
          html+=s.setLabel(L[1],W[1], "left", h2[i].location_id )
          +'<br>'
          +s.setLabel(L[0],X, "left", h2[i].item_name )
          +'<br>'
        }        
        
        if(item_id_old==h2[i].item_id){// sama

        }else{// beda
          html+=s.setSubTotal(L[1],W[1], "right", "Remaining" )
          html+=s.setSubTotal(L[2],W[2], "right", ribuan0(sum_qty) );
          html+=s.setSubTotal(L[4],W[4], "right", ribuan0(sum_value) );
          html+='<br><br>';
          
          html+=s.setLabel(L[0],W[0], "left", h2[i].item_id )
          html+=s.setLabel(L[1],L[1], "left", h2[i].location_id )
          +'<br>'
          +s.setLabel(L[0],X, "left", h2[i].item_name )
          +'<br>'
          
          sum_qty=0;
          sum_value=0;
        }

        html+=''
          +s.setLabel(L[0],W[0],  "left", h2[i].reference )
          +s.setLabel(L[1],W[1],  "left", tglWest(h2[i].date) )
          +s.setLabel(L[2],W[2], "right", ribuan(h2[i].quantity) )
          +s.setLabel(L[3],W[3], "right", ribuan(h2[i].unit_cost) )
          +s.setLabel(L[4],W[4], "right", ribuan(h2[i].total_cost) )
          +s.setLabel(L[5],W[5], "left", h2[i].table_name )
          +'<br>';

        item_id_old=h2[i].item_id;
        sum_qty+=parseFloat(h2[i].quantity);
        sum_value+=parseFloat(h2[i].total_cost);
      }
      html+=s.setSubTotal(L[1],W[1],  "right", "Remaining" )
      html+=s.setSubTotal(L[2],W[2], "right", ribuan0(sum_qty) );
      html+=s.setSubTotal(L[4],W[4], "right", ribuan0(sum_value) );
      html+='<br><br>'; 
      html+='</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine2(indek,L);
  
  function sortByID(a,b){ // sort multidimensi;
    if( a.item_id.toLowerCase()+a.location_id+a.date === 
      b.item_id.toLowerCase()+b.location_id+b.date ){
      return 0;
    }
    else{
      if( a.item_id.toLowerCase()+a.location_id+a.date < 
        b.item_id.toLowerCase()+b.location_id+b.date ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptItemCosting.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptItemCosting.preview(indek); });
  toolbar.preview(indek,()=>{ RptItemCosting.filterExecute(indek); });
  RptItemCosting.formFilter(indek);
}

RptItemCosting.formFilter=(indek)=>{
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
  setEV('item_name_'+indek, bingkai[indek].rpt.filter.item_name ); 
}

RptItemCosting.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "period_id": getEV("period_id_"+indek),
    "from": getEV("from_"+indek),
    "to": getEV("to_"+indek),
    "item_id": getEV("item_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptItemCosting.preview(indek);
}

RptItemCosting.print=(indek)=>{
  alert('print !!!');
}


// eof: 348;
