
/*
 * name: budiono;
 * date: jul-12, 11:12, sat-2025; #63; 
 */

'use strict';

var EmployeeBalances={}

EmployeeBalances.url='employee_balances';
EmployeeBalances.form=new ActionForm2(EmployeeBalances);

EmployeeBalances.show=(karcis)=>{
  karcis.modul=EmployeeBalances.url;
  karcis.have_child=true;

  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    EmployeeBalances.form.modePaging(indek);
  }else{
    show(baru);
  }
}

EmployeeBalances.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(employee_id) AS count,"
    +" SUM(net_amount) AS net_amount"
    +" FROM employee_balances"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" GROUP BY employee_id"
  },(paket)=>{
    bingkai[indek].count=0;
    var x=0;
    var y=0;
    var d;
    if(paket.err.id==0){
      d=objectMany(paket.fields,paket.data);
      bingkai[indek].count=paket.data[0][0];
    }
    
    //total
    for(var i=0;i<d.length;i++){
      y+=Number(d[i].net_amount)
    }
    
    bingkai[indek].net_amt=y;
    
    return callback()
  });
}

EmployeeBalances.readPaging=(indek)=>{
/*  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE();});  
  toolbar.search(indek,()=>{EmployeeBalances.form.modeSearch(indek)});
  toolbar.download(indek,()=>{EmployeeBalances.form.modeExport(indek)});
  toolbar.refresh(indek,()=>{EmployeeBalances.readPaging(indek)});
  toolbar.more(indek,()=>{Menu.more(indek)});
*/
  bingkai[indek].metode=MODE_READ;
  EmployeeBalances.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT employee_id,employee_name,"
        +" SUM(gross_amount) AS gross_amount,"
        +" SUM(deduction_amount) AS deduction_amount"
        +" FROM employee_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" GROUP BY employee_id,employee_name"
        +" ORDER BY employee_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      EmployeeBalances.readShow(indek);
    });
  });
};

EmployeeBalances.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var total_amount=bingkai[indek].net_amt;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)  
    +'<table border=0>'
    +'<tr>'
      +'<th colspan="2">Employee ID</th>'
      +'<th>Employee Name</th>'
      +'<th>Amount</th>'
      +'<th colspan="2">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var net_amount=0;
    var total=0;
    for (var x in d) {
      net_amount=Number(d[x].gross_amount)-Number(d[x].deduction_amount);
      total+=Number(net_amount);
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].employee_id+'</td>'
        +'<td align="left">'+d[x].employee_name+'</td>'
        +'<td align="right">'+ribuan(net_amount)+'</td>'

        +'<td align="center"><button type="button" id="btn_detail" '
          +' onclick="EmployeeBalances2.formDetail(\''+indek+'\''
          +',\''+d[x].employee_id+'\''
          +');"></button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    };
  };
  html+='<tr>'
      +'<td colspan="3" align="right">Subtotal: </td>'
      +'<td align="right"><strong>'+ribuan(total)+'</strong></td>'
      +'<td colspan="2">&nbsp;</td>'
    +'</tr>'
    +'<tr>'
      +'<td colspan="3" align="right">Total: </td>'
      +'<td align="right"><strong>'+ribuan(total_amount)+'</strong></td>'
      +'<td colspan="2">&nbsp;</td>'  
    +'</tr>'
  html+='</table></div>';

  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  EmployeeBalances.form.addPagingFn(indek);
}

var EmployeeBalances2={}
EmployeeBalances2.form=new ActionForm2(EmployeeBalances2);

EmployeeBalances2.formDetail=(indek,employee_id)=>{
  bingkai[indek].employee_id=employee_id;
  EmployeeBalances2.form.modePaging(indek);
}

EmployeeBalances2.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM employee_balances"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" AND employee_id='"+bingkai[indek].employee_id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

EmployeeBalances2.readPaging=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{EmployeeBalances.form.modePaging(indek);});  
  toolbar.download(indek,()=>{EmployeeBalances2.form.modeExport(indek)});
  toolbar.refresh(indek,()=>{EmployeeBalances2.readPaging(indek)});

  bingkai[indek].metode=MODE_READ;
  EmployeeBalances2.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,reference,field_name"
        +",gross_amount,deduction_amount,net_amount"
        +",given,taken,remaining"
        +" FROM employee_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND employee_id='"+bingkai[indek].employee_id+"'"
        +" ORDER BY employee_id,date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      EmployeeBalances2.readShow(indek);
    });
  });
};

EmployeeBalances2.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=0>'
    +'<tr>'
      +'<th colspan="2">Date</th>'
      +'<th>Reference</th>'
      +'<th>Field Name</th>'
      +'<th>Gross Amount</th>'
      +'<th>Deduction Amount</th>'
      +'<th>Net Amount</th>'
      +'<th>Given</th>'
      +'<th>Taken</th>'
      +'<th>Remaining</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].reference+'</td>'
        +'<td align="left">'+d[x].field_name+'</td>'
        +'<td align="right">'+ribuan(d[x].gross_amount)+'</td>'
        +'<td align="right">'+ribuan(d[x].deduction_amount)+'</td>'
        +'<td align="right">'+ribuan(d[x].net_amount)+'</td>'
        +'<td align="right">'+d[x].given+'</td>'
        +'<td align="right">'+d[x].taken+'</td>'
        +'<td align="right">'+d[x].remaining+'</td>'
        +'</tr>';
    };
  };
  html+='</tr>'
  html+='</table></div>';

  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  EmployeeBalances2.form.addPagingFn(indek);
}


// eof:
