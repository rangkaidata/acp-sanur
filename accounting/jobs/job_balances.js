/*
 * name: budiono;
 * date: oct-16, 21:39, mon-2023; new;
 */

'use strict';

var JobBalances={
  url:'job_balances',
  title:'Job Balances'
}

JobBalances.form=new ActionForm2(JobBalances);

JobBalances.show=(karcis)=>{
  karcis.modul=JobBalances.url;
  karcis.menu.name=JobBalances.title;
  karcis.child_free=false;

  const baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    const indek=newVen.show();
    JobBalances.form.modePaging(indek);
  }else{
    show(baru);
  }
}

JobBalances.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM job_balances"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

JobBalances.readPaging=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE();});  
  toolbar.search(indek,()=>{JobBalances.form.modeSearch(indek)});
  toolbar.download(indek,()=>{JobBalances.form.modeExport(indek)});
  toolbar.refresh(indek,()=>{JobBalances.readPaging(indek)});
  toolbar.more(indek,()=>{Menu.more(indek)});

  bingkai[indek].metode=MODE_READ;
  JobBalances.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT job_id,phase_id,cost_id"
        +",est_expenses"
        +",est_revenue"
        +",act_expenses"
        +",act_revenue"
        +" FROM job_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY job_id,phase_id,cost_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      JobBalances.readShow(indek);
    });
  })
}

JobBalances.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=0>'
    +'<tr>'
    +'<th colspan="2">Job ID</th>'
    +'<th>Phase ID</th>'
    +'<th>Cost ID</th>'
    +'<th>Est. Expenses</th>'
    +'<th>Act. Expenses</th>'
    +'<th>Est. Revenues</th>'
    +'<th>Act. Revenues</th>'
//    +'<th colspan="1">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].job_id+'</td>'
        +'<td align="left">'+d[x].phase_id+'</td>'
        +'<td align="left">'+d[x].cost_id+'</td>'
        +'<td align="right">'+d[x].est_expenses+'</td>'
        +'<td align="right">'+d[x].act_expenses+'</td>'
        +'<td align="right">'+d[x].est_revenue+'</td>'
        +'<td align="right">'+d[x].act_revenue+'</td>'
/*          
        +'<td align="center">'
          +'<button type="button" id="btn_detail" '
          +' onclick="JobBalances.formDetail(\''+indek+'\''
          +',\''+d[x].job_id+'\''
          +',\''+d[x].phase_id+'\''
          +',\''+d[x].cost_id+'\''
          +');"></button></td>'
*/          
//        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+=''
    +'</tr>'
  html+='</table></div>';
  
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  JobBalances.form.addPagingFn(indek);
}
