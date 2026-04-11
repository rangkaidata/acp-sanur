/*
 * name: budiono;
 * date: may-10, 07:45, sat-2025; #report;
 */

'use strict';

var RptPhaseList={}
  
RptPhaseList.table_name='rpt_phase_list';
RptPhaseList.title='Phase List';
RptPhaseList.form=new ActionForm2(RptAR);

RptPhaseList.show=(tiket)=>{
  tiket.modul=RptPhaseList.table_name;
  tiket.menu.name=RptPhaseList.title;
  tiket.rpt={
    "filter":{
      "phase_id": "",
    }
  };
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
      
    RptPhaseList.preview(indek);
  }else{
    show(baru);
  }
}

RptPhaseList.preview=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek); });
  toolbar.filter(indek,()=>{RptPhaseList.filter(indek); });
  toolbar.print(indek,()=>{RptPhaseList.print(indek); });
  RptPhaseList.proses(indek);
}

RptPhaseList.proses=(indek)=>{
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
  
  function getPhases(callback){
    sql={
      "select":"phase_id,name,inactive,use_cost,type",
      "from": "phases",
      "where": "company_id='"+bingkai[indek].company.id+"'",
      "order_by": "phase_id",
    }
    DownloadRows.run(indek,sql,(h)=>{
      bingkai[indek].rpt.phases=h;
      return callback();
    });
  }

  getCompany(()=>{
    getPhases(()=>{
      RptPhaseList.showReport(indek);
    });
  });
}

RptPhaseList.showReport=(indek)=>{
  var company=JSON.parse(bingkai[indek].rpt.company);
  var d=JSON.parse(bingkai[indek].rpt.phases);
  var data=objectMany(d.fields,d.rows);
  var html='<div style="position:relative;display:block;margin:0 auto;width:95%;margin-top:10px;border:0px solid red;">'  
// page 1
    +'<div class="a42" id="cetak2" style="margin:0 auto;">'// a4;
      +'<div style="position:sticky;width:210mm;margin-top:0;padding:0;">'// header
        +'<div style="width:100%;background:white;display:block;">'
        
          +'<p style="text-align:center;font-size:20px;font-weight:bolder;border:0px solid grey;line-height:1;">'
            +company.rows[0][1]
            +'</p>'
          
          +'<p style="text-align:center;font-weight:bolder;line-height:0.1;font-size:16px;">'+RptPhaseList.title+'</p>'
          +'<p>&nbsp;</p>'
          +'Filter: <br>'
          
          +'<table style="width:100%;">'
          +'<tr style="height:10px;">'
            +'<th style="width:120px;text-align:left;"><div>Phase ID</div></th>'
            +'<th style="width:220px;">Phase Description</th>'
            +'<th style="width:80px;">Cost Type</th>'
            +'<th style="width:80px;">Cost Codes</th>'
            +'<th style="width:80px;">Active</th>'
            +'<th>~</th>'
          +'</tr>'
          +'</table>'
          
        +'</div>'
      +'</div>'
      
      //--detail
      +'<div style="position:relative;overflow-y:auto;height:400px;margin-top:10px;border:0px solid blue;">'

      for(var i=0;i<data.length;i++){
        html+='<span style="left:5px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+data[i].phase_id+'</span>'
          +'<span style="left:140px;position:absolute;border:0px solid grey;width:200px;text-align:left;overflow:hidden;">'+data[i].name+'</span>'
          +'<span style="left:380px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+array_cost_type[data[i].type]+'</span>'
          +'<span style="left:470px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+array_yes_no[data[i].use_cost]+'</span>'
          +'<span style="left:570px;position:absolute;border:0px solid grey;width:95px;text-align:left;">'+array_yes_no[data[i].inactive]+'</span>'
          +'<br>';
      }
      html+='<i>~end of line~<i>'
      html+='</div>'
      // end-detail
    +'</div>'
  +'</div>'  

  content.html(indek,html);
}

RptPhaseList.filter=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{RptPhaseList.preview(indek); });
  RptPhaseList.formFilter(indek);
}

RptPhaseList.formFilter=(indek)=>{
  var html='<div>'
    +'<ul>'
      +'<li><label>No Filter</label></li>'
    +'</ul>'
    +'</div>'
  content.html(indek,html);
}

RptPhaseList.print=(indek)=>{
  
}
