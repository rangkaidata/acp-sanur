/*
 * name: budiono;
 * date; may-15, 16:31, thu-2025; #54; report;
 */
  
'use strict';

var RptPhysical={}
  
RptPhysical.table_name='rpt_physical_inventory';
RptPhysical.title='Physical Inventory List';
RptPhysical.period=new PeriodLook(RptPhysical);

RptPhysical.show=(tiket)=>{
  tiket.modul=RptPhysical.table_name;
  tiket.menu.name=RptPhysical.title;
  tiket.rpt={
    "filter":{
      "date": tglSekarang(),
      "item_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptPhysical.preview(indek);
  }else{
    show(baru);
  }
}

RptPhysical.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPhysical.proses(indek);
  } else {  
    RptPhysical.display(indek);
  };
}

RptPhysical.proses=(indek)=>{
  
  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      return callback();
    });
  }
  
  function getItems(callback){
    var and_item_id="";
    
    if(bingkai[indek].rpt.filter.item_id!=""){
      and_item_id=" AND item_id='"+bingkai[indek].rpt.filter.item_id+"'"
    }
    
    var sql="SELECT item_id,name,unit_measure,location_id"
      +" FROM items"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND class=0 OR class=5"
      + and_item_id;
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.items=h;
      return callback();
    });
  }

  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
  content.html(indek,html);

  getCompany(()=>{
    getItems(()=>{
      RptPhysical.display(indek);
    });
  });
  
  bingkai[indek].rpt.refresh=true;// sudah refresh
}

RptPhysical.display=(indek)=>{
  
  toolbar.filter(indek,()=>{ RptPhysical.filter(indek); });
  toolbar.print(indek,()=>{ RptPhysical.print(indek); });
    
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.items);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'
        
          +'<p style="text-align:center;font-size:20px;font-weight:bolder;border:0px solid grey;line-height:1;">'
            +company.rows[0][1]
            +'</p>'
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'+RptPhysical.title+'</p>'
          +'<p style="text-align:center;font-weight:bolder;line-height:1.5;font-size:14px;">As of '+tglWest(filter.date)+'</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'
          +setTR(10)            
            +setTH(180, "left", 'Item ID')
            +setTH(200, "left", 'Item Description')
            +setTH(80, "left", 'Unit Measure')
            +setTH(80, "left", 'Location ID')
            +setTH(80, "left", 'Count')
            +setTH(80, "left", 'By')

            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
//--detail

      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );

      for(var i=0;i<h2.length;i++){
        html+=''
          +setLabel(5, 180,  "left", h2[i].item_id )
          +setLabel(190, 200,  "left", h2[i].name )
          +setLabel(400, 90, "left", h2[i].unit_measure )
          +setLabel(500, 80, "left", h2[i].location_id )
          +setLabel(590, 80, "center", "___________" )
          +setLabel(690, 80, "center", "___________" )
          +'<br>';
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

RptPhysical.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptPhysical.preview(indek); });
  toolbar.preview(indek,()=>{ RptPhysical.filterExecute(indek); });
  RptPhysical.formFilter(indek);
}

RptPhysical.formFilter=(indek)=>{
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
  
  setEV('item_id_'+indek, bingkai[indek].rpt.filter.item_id ); 
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
}

RptPhysical.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "item_id": getEV("item_id_"+indek),
    "date": getEV("date_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPhysical.preview(indek);
}

RptPhysical.print=(indek)=>{
  alert('print !!!');
}


// eof: 210;
