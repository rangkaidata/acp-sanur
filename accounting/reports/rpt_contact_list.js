/*
 * name: budiono;
 * date: aug-10,14:20, sun-2025; #66; all rpt;
 */

'use strict';

var RptContactList={}
  
RptContactList.table_name='rpt_contact_list';
RptContactList.title='Contact List';
RptContactList.period=new PeriodLook(RptContactList);

RptContactList.show=(tiket)=>{
  tiket.modul=RptContactList.table_name;
  tiket.menu.name=RptContactList.title;
  tiket.rpt={
    "filter":{
      "customer_id": "",
    },
    "refresh":false
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    RptContactList.preview(indek);
  }else{
    show(baru);
  }
}

RptContactList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  
  if(bingkai[indek].rpt.refresh==false){
    bingkai[indek].rpt.refresh=true;
    RptContactList.proses(indek);
  } else {  
    RptContactList.display(indek);
  };
};

RptContactList.proses=(indek)=>{
  
  function getA(callback){
    var sql="SELECT customer_id,name,contact,phone,address"
      +" FROM customers"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.data_a=h;
      return callback();
    });
  }
  
  function getJoinArray(callback){
    var a=JSON.parse(bingkai[indek].rpt.data_a).rows;
    var f=[
      "customer_id",
      "customer_name",
      "contact",
      "job_title",
      "telephone_1",
      "address_1",
      "address_2",
      "city_st_zip"
    ];
    var i=0;
    var r=[];
    var d;
    
    for(i=0;i<a.length;i++){
      d=JSON.parse(a[i][4]);
      
      r.push([
        a[i][0], //customer_id
        a[i][1], //customer_name
        a[i][2], //contacts
        "", // job_title
        a[i][3], // telephone_1
        d[0].street_1, // address_1
        "", // address_2
        d[0].city+', '+d[0].state+' '+d[0].zip, // city_st_zip
        
      ]);
    }
    
    bingkai[indek].rpt.join_array=JSON.stringify({
      fields: f,
      rows: r
    });
    
    return callback();
  }
  
  getRptDefault(indek,()=>{
    getA(()=>{
      getJoinArray(()=>{
        RptContactList.display( indek );
      });
    });
  });
  
};

RptContactList.display=(indek)=>{

  toolbar.refresh(indek,()=>{ RptContactList.proses(indek); });
  toolbar.filter(indek,()=>{ RptContactList.filter(indek); });
  toolbar.print(indek,()=>{ RptContactList.print(indek); });
  
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.join_array );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    90,  // customer_id
    130,  // customer_name
    110,  // contact
    90,  // job_title
    90,  // phone
    150, // address
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
//    +'<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'
//    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
    
//      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
//        +'<div style="width:100%;background:white;display:block;">'
    +'<div class="report">'//a
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// b
      +'<div class="report-sticky">' //c
        +'<div class="report-paper">'// d


          +s.setCompany( company.rows[0][1] )
          +s.setTitle( RptContactList.title )
          +s.setNone()

          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'


          +s.setHeader(L[0], W[0], "left", 'Customer ID')
          +s.setHeader(L[1], W[1], "left", 'Customer Name')
          +s.setHeader(L[2], W[2], "left", 'Contact')
          +s.setHeader(L[3], W[3], "left", 'Job Title')
          +s.setHeader(L[4], W[4], "left", 'Telephone 1')
          +s.setHeader(L[5], W[5], "left", 'Address')
          +'<br>'

        +'</div>'//d
      +'</div>'//c
      
//--detail
      +'<div class="report-detail">';//e

      var h2=h.sort( sortByID );

      for(i=0;i<h2.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h2[i].customer_id )
          +s.setLabel(L[1], W[1], "left", h2[i].customer_name )
          +s.setLabel(L[2], W[2], "left", h2[i].contact )
          +s.setLabel(L[3], W[3], "left", h2[i].job_title )
          +s.setLabel(L[4], W[4], "left", h2[i].telephone_1 )
          +s.setLabel(L[5], W[5], "left", h2[i].address_1 )
          +'<br>'
          +s.setLabel(L[5], W[5], "left", h2[i].city_st_zip )
        html+='<br>';
      }
      html+=''
        +'<br>';        
      +'</div>'// e
    +'</div>'//b
  +'</div>';//a
  content.html(indek,html);
  
  renderLine(indek,L);
/*
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
*/
  function sortByID(a,b){ // sort multidimensi;
    if( a.customer_id === b.customer_id ){
      return 0;
    }
    else{
      if( a.customer_id < b.customer_id ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
};

RptContactList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ RptContactList.preview(indek); });
  toolbar.preview(indek,()=>{ RptContactList.filterExecute(indek); });
  RptContactList.formFilter(indek);
};

RptContactList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>Customer ID</label>'
        +'<input type="text" id="customer_id_'+indek+'">'
        +'</li>'
        
    +'</ul>'
    +'</div>'
  content.html(indek,html);
  
  setEV('customer_id_'+indek, bingkai[indek].rpt.filter.customer_id );
};


RptContactList.filterExecute=(indek)=>{
  bingkai[indek].rpt.filter={
    "customer_id": getEV("customer_id_"+indek),
  }
  bingkai[indek].rpt.refresh=false;
  RptContactList.preview(indek);
};

RptContactList.print=(indek)=>{};



//eof: 292;281;
