/*
 * name: budiono;
 * date; may-15, 08:16, thu-2025; #54; report;
 */ 

'use strict';

var RptInventoryStock={}
  
RptInventoryStock.table_name='rpt_inventory_stock';
RptInventoryStock.title='Inventory Stock Status Report';
RptInventoryStock.period=new PeriodLook(RptInventoryStock);

RptInventoryStock.show=(tiket)=>{
  tiket.modul=RptInventoryStock.table_name;
  tiket.menu.name=RptInventoryStock.title;
  tiket.rpt={
    "filter":{
      "date": "",
      "item_id":"",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptInventoryStock.preview(indek);
  }else{
    show(baru);
  }
}

RptInventoryStock.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptInventoryStock.proses(indek);
  } else {  
    RptInventoryStock.display(indek);
  };
}

RptInventoryStock.proses=(indek)=>{
  
  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      var d=JSON.parse(h);
      if(d.rows.length>0){
        if(bingkai[indek].rpt.filter.date==""){
          bingkai[indek].rpt.filter.date=tglSekarang();
        }
      }
      return callback();
    });
  }
  
  function getItems(callback){
    var sql="SELECT item_id,name,class,minimum_stock,reorder_quantity"
      +",location_id"
      +" FROM items"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND class=0 OR class=5";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.items=h;
      return callback();
    });
  }
  
  function getStock(callback){
    var date=bingkai[indek].rpt.filter.date
    var sql="SELECT item_id,location_id,quantity"
      +" FROM item_costing"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <= '"+date+"'";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.stock=h;
      return callback();
    });
  }
  
  function joinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.items).rows;
    var b=JSON.parse(bingkai[indek].rpt.stock).rows;
    var n={
      fields:[],
      rows:[],
    };
    var stock=0;
    
    n.fields=JSON.parse(bingkai[indek].rpt.items).fields;
    n.fields.push("stock");// tambah kolom stock;
    n.rows=[];
    
    
    for(var i=0;i<a.length;i++){
      stock=0;
      for(var j=0;j<b.length;j++){
        if(a[i][0]==b[j][0]){// item_id
          if(a[i][5]==b[j][1]){// location_id
            stock+=parseFloat( b[j][2] );
          }
        }
      }
      n.rows.push(
        [
          a[i][0], // item_id
          a[i][1], // name
          a[i][2], // class
          a[i][3], // min_stck
          a[i][4], // reorder_qty
          a[i][5], // location_id
          stock,
        ]
      );
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      rows: n.rows,
      fields: n.fields,
    })
    
    return callback();
  }
  
  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
  content.html(indek,html);

  getCompany(()=>{
    getItems(()=>{
      getStock(()=>{
        joinArray(()=>{
          RptInventoryStock.display(indek);
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;// sudah refresh
}

RptInventoryStock.display=(indek)=>{
  toolbar.filter(indek,()=>{ RptInventoryStock.filter(indek); });
  toolbar.print(indek,()=>{ RptInventoryStock.print(indek); });
    
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.join_array);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'
        
          +'<p style="text-align:center;font-size:20px;font-weight:bolder;border:0px solid grey;line-height:1;">'
            +company.rows[0][1]
            +'</p>'
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'+RptInventoryStock.title+'</p>'
          +'<p style="text-align:center;font-weight:bolder;line-height:1.5;font-size:14px;">As of '+tglWest(filter.date)+'</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'
          +setTR(10)            
            +setTH(230, "left", 'Item ID<br>Item Description')
            +setTH( 60, "left", 'Class')
            +setTH( 75, "left", 'Qty on Hand')
            +setTH(90, "right", 'Min Stock')
            +setTH(90, "right", 'Reorder Qty')
            +setTH(90, "left", 'Location ID')

            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
//--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'
      
      let h2=h.sort( sortByID );

      for(var i=0;i<h2.length;i++){

        html+=''
          +setLabel(   5,  200, "left", h2[i].item_id )
          +setLabel( 250, 90,  "left", array_item_class[h2[i].class] )
          +setLabel( 320,  95, "right", ribuan(h2[i].stock) )
          +setLabel( 420, 100, "right", ribuan(h2[i].minimum_stock) )
          +setLabel( 520, 100, "right", ribuan(h2[i].reorder_quantity) )
          +setLabel( 640, 100, "left", h2[i].location_id )
          +'<br>'
          +setLabel(   5,  250, "left", h[i].name )
          +'<br>'
      }
      html+='<br>'      
      html+='</div>'
// end-detail
      
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  function sortByID(a,b){ // sort multidimensi;
    if( a.item_id.toLowerCase() === b.item_id.toLowerCase() ){
      return 0;
    }
    else{
      if( a.item_id.toLowerCase() < b.item_id.toLowerCase() ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

RptInventoryStock.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptInventoryStock.preview(indek); });
  toolbar.preview(indek,()=>{ RptInventoryStock.filterExecute(indek); });
  RptInventoryStock.formFilter(indek);
}

RptInventoryStock.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
    
      +'<li><label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
        +'</li>'

      +'<li><label>Item ID</label>'
        +'<input type="text" id="item_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('item_id_'+indek, bingkai[indek].rpt.filter.item_id ); 
}

RptInventoryStock.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV("date_"+indek),
    "item_id": getEV("item_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptInventoryStock.preview(indek);
}

RptInventoryStock.print=(indek)=>{
  alert('print !!!');
}



// eof: 270;
