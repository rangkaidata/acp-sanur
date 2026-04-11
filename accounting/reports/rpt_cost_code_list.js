/*
 * name: budiono;
 * date: may-10, 07:22, sat-2025; #report;
 */

'use strict';

var RptCostCodeList={}
  
RptCostCodeList.table_name='rpt_cost_code_list';
RptCostCodeList.title='Cost Code List';
RptCostCodeList.form=new ActionForm2(RptAR);

RptCostCodeList.show=(tiket)=>{
  tiket.modul=RptCostCodeList.table_name;
  tiket.menu.name=RptCostCodeList.title;
  tiket.rpt={
    "filter":{
      "cost_id": "",
    }
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
      
    RptCostCodeList.preview(indek);
  }else{
    show(baru);
  }
}

RptCostCodeList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  toolbar.filter(indek,()=>{RptCostCodeList.filter(indek); });
  toolbar.print(indek,()=>{RptCostCodeList.print(indek); });
  RptCostCodeList.proses(indek);
}

RptCostCodeList.proses=(indek)=>{
  var sql;
  
  function getCompany(callback){
    sql={
      "select":"company_id,name",
      "from": "company",
      "where": "company_id='"+bingkai[indek].company.id+"'"
    }
    DownloadRows.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      return callback();
    });
  }
  
  function getCostCodes(callback){
    sql={
      "select":"cost_id,name,inactive,type",
      "from": "cost_codes",
      "where": "company_id='"+bingkai[indek].company.id+"'",
      "order_by": "cost_id",
    }
    DownloadRows.run(indek,sql,(h)=>{
      bingkai[indek].rpt.cost_codes=h;
      return callback();
    });
  }

  getCompany(()=>{
    getCostCodes(()=>{
      RptCostCodeList.showReport(indek);
    });
  });
}

RptCostCodeList.showReport=(indek)=>{
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.cost_codes);
  var cost_codes=objectMany(d.fields,d.rows);
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'  
// page 1
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'
        
          +'<p style="text-align:center;font-size:20px;font-weight:bolder;border:0px solid grey;line-height:1;">'
            +company.rows[0][1]
            +'</p>'
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'+RptCostCodeList.title+'</p>'
          +'<p>&nbsp;</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'
          +'<tr style="height:10px;">'
            +'<th style="width:120px;text-align:left;"><div>Cost Code ID</div></th>'
            +'<th style="width:200px;">Cost Code Name</th>'
            +'<th style="width:120px;">Cost Type</th>'
            +'<th style="width:100px;">Active</th>'
            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
      //--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      for(var i=0;i<cost_codes.length;i++){
        html+='<span style="left:5px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+cost_codes[i].cost_id+'</span>'
          +'<span style="left:140px;position:absolute;border:0px solid grey;width:190px;text-align:left;overflow:hidden;">'+cost_codes[i].name+'</span>'
          +'<span style="left:360px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+array_cost_type[cost_codes[i].type]+'</span>'
          +'<span style="left:490px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+array_inactive[cost_codes[i].inactive]+'</span>'
//          +'<span style="left:570px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+vendors[i].phone+'</span>'
//          +'<span style="left:670px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+vendors[i].type+'</span>'
          +'<br>';
      }
      html+='<i>~end of line~<i>'
      html+='</div>'
      // end-detail
    +'</div>'
  +'</div>'  

  content.html(indek,html);
}

RptCostCodeList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptCostCodeList.preview(indek); });
  RptCostCodeList.formFilter(indek);
}

RptCostCodeList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>No Filter</label></li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
}

RptCostCodeList.print=(indek)=>{
  
}
