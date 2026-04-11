/*
 * name: budiono;
 * date: may-16, 14:16, fri-2025; #54; report;
 */ 

'use strict';

var RptBomsReport={}
  
RptBomsReport.table_name='rpt_boms_report';
RptBomsReport.title='Bill of Materials Report';
RptBomsReport.period=new PeriodLook(RptBomsReport);

RptBomsReport.show=(tiket)=>{
  tiket.modul=RptBomsReport.table_name;
  tiket.menu.name=RptBomsReport.title;
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

    RptBomsReport.preview(indek);
  }else{
    show(baru);
  }
}

RptBomsReport.preview=(indek)=>{
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptBomsReport.proses(indek);
  } else {  
    RptBomsReport.display(indek);
  };
}

RptBomsReport.proses=(indek)=>{
  
  function getCompany(callback){
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      return callback();
    });
  }
  
  function getBoms(callback){
    var and_item_id="";
    
    if(bingkai[indek].rpt.filter.item_id!=""){
      and_item_id=" AND item_id='"+bingkai[indek].rpt.filter.item_id+"'"
    }
    
    var sql="SELECT item_id,item_name,detail"
      +" FROM boms"
      +" WHERE company_id='"+bingkai[indek].company.id+"'";
      + and_item_id;
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.boms=h;
      return callback();
    });
  }
  
  function getItemCosting(callback){
    var date=bingkai[indek].rpt.filter.date;
    var sql="SELECT item_id,SUM(quantity) AS quantity"
      +",SUM(total_cost) AS total_cost"
      +" FROM item_costing"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND date <='"+date+"'"
      +" GROUP BY item_id";
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.item_costing=h;
      return callback();
    });
  }
  
  function joinArray(callback){
    var b=JSON.parse(bingkai[indek].rpt.item_costing).rows;
    var a=JSON.parse(bingkai[indek].rpt.boms).rows;
    var n=[];// new array
    var d;
    var new_d=[];
    var i,j,k;
    var on_hand=0;
    var est_cost=0;
    var total_cost=0;
    
    for(i=0;i<a.length;i++){
      new_d=[];
      d=JSON.parse(a[i][2]);
      // tambah qty_on_hand & est_cost;
      for(j=0;j<d.length;j++){
        
        on_hand=0;
        est_cost=0;
        total_cost=0;
        
        for(k=0;k<b.length;k++){
          if(b[k][0]==d[j].item_id){
            on_hand+=parseFloat(b[k][1]);// quantity
            total_cost+=parseFloat(b[k][2]);// total_cost
          }
        }
        
        if(on_hand>0){
          est_cost=(total_cost/on_hand)*Number(d[j].qty_needed);
        }
        
        new_d.push({
          item_id:d[j].item_id,
          item_name:d[j].item_name,
          qty_needed: d[j].qty_needed,
          qty_on_hand: on_hand,
          est_cost: est_cost,
        });
      };
      
      on_hand=0;
      
      for(k=0;k<b.length;k++){// header
        if(b[k][0]==a[i][0]){
          on_hand+=parseFloat(b[k][1]);// quantity
        }
      }
      
      n.push([
        a[i][0], // item_id
        a[i][1], // name
        JSON.stringify(new_d), // detail
        on_hand, // new column,
      ]);
    };
    
    var m={
      fields: ["item_id","name","detail","qty_on_hand"],
      rows: n,
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify(m);

    return callback();
  }

  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
  content.html(indek,html);

  getCompany(()=>{
    getBoms(()=>{
      getItemCosting(()=>{
        joinArray(()=>{
          RptBomsReport.display(indek);
        });
      });
    });
  });
  
  bingkai[indek].rpt.refresh=true;// sudah refresh
}

RptBomsReport.display=(indek)=>{
  
  toolbar.filter(indek,()=>{ RptBomsReport.filter(indek); });
  toolbar.print(indek,()=>{ RptBomsReport.print(indek); });
    
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
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'+RptBomsReport.title+'</p>'
          +'<p style="text-align:center;font-weight:bolder;line-height:1.5;font-size:14px;">'
            +'As of '+tglWest(filter.date)
          +'</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'
          +setTR(10)            
            +setTH(100, "left", 'Item ID')
            +setTH(250, "left", 'Item Description')
            +setTH(80, "left", 'Qty Needed')
            +setTH(80, "left", 'Qty on Hand')
            +setTH(80, "left", 'Est Cost')

            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
//--detail

      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      var h2=h.sort( sortByID );
      var d=[];
      var j;
      var total_cost=0;

      for(var i=0;i<h2.length;i++){
        d=JSON.parse(h2[i].detail);
        
        html+=''
          +setLabel(5, 100,  "left", h2[i].item_id )
          +setLabel(120, 250,  "left", h2[i].name )
          +setLabel(465+5, 90, "right", ribuan(h2[i].qty_on_hand) )
          +'<br>';
        
        total_cost=0;
        for(j=0;j<d.length;j++){
          html+=''
            +setLabel(15, 100,  "left", d[j].item_id )
            +setLabel(115+5, 250,  "left", d[j].item_name )
            +setLabel(370+5, 90, "right", ribuan(d[j].qty_needed) )
            +setLabel(465+5, 90, "right", ribuan(d[j].qty_on_hand) )
            +setLabel(560+5, 90, "right", ribuan(d[j].est_cost) )
            +'<br>';

          total_cost+=parseFloat( d[j].est_cost );

        }
        // total_cost
        html+=''
          +setLabel(115+5,300, "right", "<b><i>Est Cost: [ "+h2[i].item_id+" ]</i></b>" )
          +setLabel(560+5, 90, "right", '<b><i>'+ribuan(total_cost)+'</i></b>' )
          +'<br>';
      }
      html+='<br>'      
      html+='</div>'

// end-detail;

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

RptBomsReport.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptBomsReport.preview(indek); });
  toolbar.preview(indek,()=>{ RptBomsReport.filterExecute(indek); });
  RptBomsReport.formFilter(indek);
}

RptBomsReport.formFilter=(indek)=>{
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

RptBomsReport.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "item_id": getEV("item_id_"+indek),
    "date": getEV("date_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptBomsReport.preview(indek);
}

RptBomsReport.print=(indek)=>{
  alert('print !!!');
}
