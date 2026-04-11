/*
 * name: budiono;
 * date: may-09, 14:58, fri-2025; #54; reports;
 * edit: dec-23, 15:30, tue-2025; #85; 
 */

'use strict';

var RptCustomerList={}
  
RptCustomerList.table_name='rpt_customer_list';
RptCustomerList.title='Customer List';
RptCustomerList.form=new ActionForm2(RptAR);

RptCustomerList.show=(tiket)=>{
  tiket.modul=RptCustomerList.table_name;
  tiket.menu.name=RptCustomerList.title;
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
    RptCustomerList.preview(indek);
  }else{
    show(baru);
  }
}

RptCustomerList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });

  if(bingkai[indek].rpt.refresh==false){
    bingkai[indek].rpt.refresh=true;
    RptCustomerList.proses(indek);
  } else {  
    RptCustomerList.display(indek);
  };
}

RptCustomerList.proses=(indek)=>{
  
  function getCustomer(callback){
    var sql="SELECT customer_id,name,contact,phone,resale"
      +" FROM customers"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.customer=h;
      return callback();
    });    
  }
  
  getRptDefault(indek,()=>{
    getCustomer(()=>{
      RptCustomerList.display(indek);
    });
  });
}

RptCustomerList.display=(indek)=>{
  
  toolbar.refresh(indek,()=>{ RptCustomerList.proses(indek); });
  toolbar.filter(indek,()=>{RptCustomerList.filter(indek); });
  toolbar.print(indek,()=>{RptCustomerList.print(indek); });
    
  var s=new rptHTML();
  var company=JSON.parse( bingkai[indek].rpt.company);
  var d=JSON.parse( bingkai[indek].rpt.customer );
  var h=objectMany( d.fields,d.rows );
  var filter=bingkai[indek].rpt.filter;
  var i=0;  
  var W=[
    130, // 0-customer_id
    250, // 1-name
    150, // 2-contact
    100, // 3-phone
    90, // 4-resale
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
          +s.setTitle( RptCustomerList.title )
          +s.setNone()
          +'<canvas id="cv_'+indek+'" '
            +' width=800 height=25 class="canvas">'
          +'</canvas>'
          +s.setHeader(L[0], W[0], "left", 'Customer ID')
          +s.setHeader(L[1], W[1], "left", 'Name')
          +s.setHeader(L[2], W[2], "left", 'Bill to Contact')
          +s.setHeader(L[3], W[3], "left", 'Phone')
          +s.setHeader(L[4], W[4], "left", 'Resale No.')
          +'<br>'
          
        +'</div>'//d 
      +'</div>'//c
      
      //--detail
      +'<div class="report-detail">';//e
      for(i=0;i<h.length;i++){
        html+=''
          +s.setLabel(L[0], W[0], "left", h[i].customer_id )
          +s.setLabel(L[1], W[1], "left", h[i].name )
          +s.setLabel(L[2], W[2], "left", h[i].contact )
          +s.setLabel(L[3], W[3], "left", h[i].phone )
          +s.setLabel(L[4], W[4], "left", h[i].resale )

          +'<br>';

      }
      html+='</div>'//e
    +'</div>'//b
  +'</div>'  //a
  content.html(indek,html);
  
  renderLine(indek, L);
}

RptCustomerList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptCustomerList.preview(indek); });
  RptCustomerList.formFilter(indek);
}

RptCustomerList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>No Filter</label></li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
}

RptCustomerList.print=(indek)=>{
  alert( 'print!!!' );
}


// eof: 149;161;158;
