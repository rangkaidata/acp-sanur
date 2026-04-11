/*
 * name: budiono;
 * date: may-18, 21:20, sun-2025; #55; 
 */

'use strict';

var RptProfitabilityReport={}
  
RptProfitabilityReport.table_name='rpt_inventory_profitability_report';
RptProfitabilityReport.title='Inventory Profitability Report';
RptProfitabilityReport.period=new PeriodLook(RptProfitabilityReport);

RptProfitabilityReport.show=(tiket)=>{
  tiket.modul=RptProfitabilityReport.table_name;
  tiket.menu.name=RptProfitabilityReport.title;
  tiket.rpt={
    "filter":{
      "period_id": "",
      "from":"",
      "to":"",
      "item_id": "",
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

RptProfitabilityReport.preview=(indek)=>{};
RptProfitabilityReport.proses=(indek)=>{};
RptProfitabilityReport.display=(indek)=>{};
RptProfitabilityReport.filter=(indek)=>{};
RptProfitabilityReport.formFilter=(indek)=>{};
RptProfitabilityReport.setPeriod=(indek)=>{};
RptProfitabilityReport.getPeriod=(indek)=>{};
RptProfitabilityReport.filterExecute=(indek)=>{};
RptProfitabilityReport.print=(indek)=>{};
