/*
 * name: budiono;
 * date: may-15, 15:44, thu-2025; #54; report
 */ 

'use strict';

var RptPriceList={}
  
RptPriceList.table_name='rpt_price_list';
RptPriceList.title='Item Price List';
RptPriceList.period=new PeriodLook(RptPriceList);

RptPriceList.show=(tiket)=>{
  tiket.modul=RptPriceList.table_name;
  tiket.menu.name=RptPriceList.title;
  tiket.rpt={
    "filter":{
      "item_id": "",
      "date": tglSekarang(),
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();

    RptPriceList.preview(indek);
  }else{
    show(baru);
  }
}

RptPriceList.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptPriceList.proses(indek);
  } else {  
    RptPriceList.display(indek);
  };
}

RptPriceList.proses=(indek)=>{
  
  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      return callback();
    });
  }
  
  function getPriceList(callback){
    var and_item_id="";
    
    if(bingkai[indek].rpt.filter.item_id!=""){
      and_item_id=" AND item_id='"+bingkai[indek].rpt.filter.item_id+"'"
    }
    
    var sql="SELECT item_id,item_name,unit_price,detail"
      +" FROM prices"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      + and_item_id;
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.price_list=h;
      return callback();
    });
  }

  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
  content.html(indek,html);

  getCompany(()=>{
    getPriceList(()=>{
      RptPriceList.display(indek);
    });
  });
  
  bingkai[indek].rpt.refresh=true;// sudah refresh
}

RptPriceList.display=(indek)=>{
  
  toolbar.filter(indek,()=>{ RptPriceList.filter(indek); });
  toolbar.print(indek,()=>{ RptPriceList.print(indek); });
    
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.price_list);
  var h=objectMany(d.fields,d.rows);
  var filter=bingkai[indek].rpt.filter;
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'
        
          +'<p style="text-align:center;font-size:20px;font-weight:bolder;border:0px solid grey;line-height:1;">'
            +company.rows[0][1]
            +'</p>'
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'+RptPriceList.title+'</p>'
          +'<p style="text-align:center;font-weight:bolder;line-height:1.5;font-size:14px;">As of '+tglWest(filter.date)+'</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'
          +setTR(10)            
            +setTH(180, "left", 'Item ID')
            +setTH(200, "left", 'Item Description')
            +setTH(80, "left", 'Tax Type')
            +setTH(80, "right", 'Level')
            +setTH(80, "right", 'Unit Price')

            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
//--detail

      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var dtl=[];
      var j=0;

      for(var i=0;i<h2.length;i++){
        dtl=JSON.parse(h2[i].detail);
        html+=''
          +setLabel(5, 190,  "left", h2[i].item_id )
          +setLabel(200, 200,  "left", h2[i].item_name )
          +setLabel(410, 90, "left", "-" )
//          +setLabel(510, 90, "right", "Level 1" )
          +setLabel(600, 90, "right", ribuan(h2[i].unit_price) )
          +'<br>';
          for(j=0;j<dtl.length;j++){
            if(dtl[j].unit_price!="0"){
              html+=setLabel(510, 90, "right", "Level "+(j+1) )
                +setLabel(600, 90, "right", ribuan(dtl[j].unit_price) )
                +'<br>';
            }
          }
          html+='<br>';
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

RptPriceList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptPriceList.preview(indek); });
  toolbar.preview(indek,()=>{ RptPriceList.filterExecute(indek); });
  RptPriceList.formFilter(indek);
}

RptPriceList.formFilter=(indek)=>{
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

RptPriceList.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "item_id": getEV("item_id_"+indek),
    "date": getEV("date_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptPriceList.preview(indek);
}

RptPriceList.print=(indek)=>{
  alert('print !!!');
}
