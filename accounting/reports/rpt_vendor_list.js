/*
 * name: budiono
 * date: dec-28, 17:37, sun-2025; #85; report-std;
 */

'use strict';

var RptVendorList={}
  
RptVendorList.table_name='rpt_vendor_list';
RptVendorList.title='Vendor List';
RptVendorList.form=new ActionForm2(RptAR);

RptVendorList.show=(tiket)=>{
  tiket.modul=RptVendorList.table_name;
  tiket.menu.name=RptVendorList.title;
  tiket.rpt={
    "filter":{
      "period_id":"",
      "date":"",
      "vendor_id": "",
      "vendor_name": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
      
    RptVendorList.preview(indek);
  }else{
    show(baru);
  }
}

RptVendorList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    RptVendorList.proses(indek);
    bingkai[indek].rpt.refresh=true;
  } else {  
    RptVendorList.display(indek);
  };
}

RptVendorList.proses=(indek)=>{
  var period_id =bingkai[indek].rpt.filter.period_id;
  var date=bingkai[indek].rpt.filter.data;
  var vendor_id=bingkai[indek].rpt.filter.vendor_id;
  var vendor_name=bingkai[indek].rpt.filter.vendor_name;
  
  function getVendor(callback){
    var sql="SELECT vendor_id,name,contact,account,phone,type"
      +" FROM vendors"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.vendor=h;
      return callback();
    });    
  }
  
  getRptDefault(indek,()=>{
    period_id=bingkai[indek].rpt.filter.period_id;
    date=bingkai[indek].rpt.filter.date;

    getVendor(()=>{
      RptVendorList.display(indek);
    });
  });
}

RptVendorList.display=(indek)=>{
  toolbar.refresh(indek,()=>{ RptVendorList.proses(indek); });
  toolbar.filter(indek,()=>{ RptVendorList.filter(indek); });
  toolbar.print(indek,()=>{ RptVendorList.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.vendor );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  // width
  var W=[
    100, // 0-vendor id
    200, // 1-vendor name
    110, // 2-contact
    100, // 3-account
    90, // 4-phone
    90, // 5-type
  ];
  // left
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
          +s.setTitle( RptVendorList.title )
          //+s.setFromTo( filter.from, filter.to )
          +s.setNone()
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0],W[0], "left", 'Vendor ID')
          +s.setHeader(L[1],W[1], "left", 'Vendor Name')
          +s.setHeader(L[2],W[2], "left", 'Contact')
          +s.setHeader(L[3],W[3], "left", 'Account')
          +s.setHeader(L[4],W[4], "left", 'Phone')
          +s.setHeader(L[5],W[5], "left", 'type')
          +'<br>'
        +'</div>'//d
      +'</div>'//c
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
                
        html+=''
          +s.setLabel(L[0],W[0], "left", h2[i].vendor_id )
          +s.setLabel(L[1],W[1], "left", h2[i].name )
          +s.setLabel(L[2],W[2], "left", h2[i].contact )
          +s.setLabel(L[3],W[3], "left", h2[i].account )
          +s.setLabel(L[4],W[4], "left", h2[i].phone )
          +s.setLabel(L[5],W[5], "left", h2[i].type )
        html+='<br>';
      }
      html+=''
        +'<br>'
      +'</div>'
    +'</div>'
  +'</div>';
  content.html(indek,html);
  
  renderLine(indek,L);
  
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


/*  
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'  
// page 1
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'
        
          +'<p style="text-align:center;font-size:20px;font-weight:bolder;border:0px solid grey;line-height:1;">'
            +company.rows[0][1]
            +'</p>'
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'
            +'Vendor List</p>'
          +'<p>&nbsp;</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'
          +'<tr style="height:10px;">'
            +'<th style="width:100px;text-align:left;"><div>Vendor ID</div></th>'
            +'<th style="width:200px;">Vendor Name</th>'
            +'<th style="width:120px;">Contact</th>'
            +'<th style="width:100px;">Account #</th>'
            +'<th style="width:100px;">Phone</th>'
            +'<th style="width:90px;">Vendor Type</th>'
            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
      //--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      for(var i=0;i<vendors.length;i++){
        html+='<span style="left:5px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+vendors[i].vendor_id+'</span>'
          +'<span style="left:120px;position:absolute;border:0px solid grey;width:190px;text-align:left;overflow:hidden;">'+vendors[i].name+'</span>'
          +'<span style="left:320px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+vendors[i].contact+'</span>'
          +'<span style="left:450px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+vendors[i].account+'</span>'
          +'<span style="left:570px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+vendors[i].phone+'</span>'
          +'<span style="left:670px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+vendors[i].type+'</span>'
          +'<br>';
      }
      html+='<i>~end of line~<i>'
      html+='</div>'
      // end-detail
    +'</div>'
  +'</div>'  

  content.html(indek,html);
*/  
}

RptVendorList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptVendorList.preview(indek); });
  toolbar.preview(indek,()=>{ RptVendorList.filterExecute(indek); });
  RptVendorList.formFilter(indek);
};

RptVendorList.formFilter=(indek)=>{
  var html='<div>'
    +'<div id="msg_'+indek+'"></div>'
    +'<ul>'
      +'<li>'
        +'<label>Date</label>'
        +'<input type="date" id="date_'+indek+'">'
      +'</li>'
      +'<li><label>Vendor ID</label>'
        +'<input type="text" id="vendor_id_'+indek+'">'
        +'<input type="text" id="vendor_name_'+indek+'" disabled>'
      +'</li>'
    +'</ul>'
  +'</div>'
  content.html(indek,html);
  
  setEV('date_'+indek, bingkai[indek].rpt.filter.date ); 
  setEV('vendor_id_'+indek, bingkai[indek].rpt.filter.vendor_id ); 
  setEV('vendor_name_'+indek, bingkai[indek].rpt.filter.vendor_name ); 

}

RptVendorList.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "date": getEV('date_'+indek),
    "vendor_id": getEV("vendor_id_"+indek),
    "vendor_name": getEV("vendor_name_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptVendorList.preview(indek);
};


RptVendorList.print=(indek)=>{
  
}
