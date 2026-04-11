/*
 * name: budiono;
 * code: ...
 * path: /accounting/sales/customer_balances.js;
 * --------------------------------------------;
 * date: oct-02, 16:31, mon-2023; new;
 * edit: oct-16, 09:42, mon-2023; 
 * edit: dec-04, 17:56, mon-2023; ribuan;
 * -----------------------------; happy new year 2024;
 * edit: oct-10, 14:43, thu-2024; #21;
 * edit: oct-11, 16:08, thu-2024; #22;
 * -----------------------------; happt new year 2025;
 * edit: mar-28, 14:34, fri-2025; #45; ctables;cstructures;
 * edit: apr-12, 16:42, sat-2025; #46; tes-data;
 * edit: apr-20, 16:37, sun-2025; #50; download;
 */

'use strict';

var CustomerBalances={}

CustomerBalances.url='customer_balances';
CustomerBalances.form=new ActionForm2(CustomerBalances);

CustomerBalances.show=(karcis)=>{
  karcis.modul=CustomerBalances.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    var indek=newVen.show();
    CustomerBalances.form.modePaging(indek);
  }else{
    show(baru);
  }
}

CustomerBalances.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +",SUM(amount_due) AS ar_total"
      +" FROM customer_balances"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].ar_total=paket.data[0][1];
    }
    return callback()
  });
}

CustomerBalances.readPaging=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE();});  
  toolbar.search(indek,()=>{CustomerBalances.form.modeSearch(indek)});
  toolbar.refresh(indek,()=>{CustomerBalances.readPaging(indek)});
  toolbar.download(indek,()=>{CustomerBalances.form.modeExport(indek)});
  toolbar.more(indek,()=>{Menu.more(indek)});
  
  bingkai[indek].metode=MODE_READ;
  CustomerBalances.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,customer_name,amount_due"
        +" FROM customer_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY customer_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      CustomerBalances.readShow(indek);
    });
  })
}

CustomerBalances.readShow=(indek)=>{
  var subtotal=0;
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
  
  html+='<table border=1>'
    +'<tr>'
    +'<th colspan="2">Customer ID</th>'
    +'<th>Name</th>'
    +'<th>Balance</th>'
    +'<th colspan="2">Action</th>'
    +'</tr>';
    
  if (p.err.id===0){
    for (var x in d) {
      n++;
      subtotal+=Number(d[x].amount_due);
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td>'+d[x].customer_id+'</td>'
        +'<td>'+xHTML(d[x].customer_name)+'</td>'
        +'<td align="right">'+ribuan(d[x].amount_due)+'</td>'

        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_detail"'
          +' onclick="CustomerBalances.formDetail(\''+indek+'\''
          +',\''+d[x].customer_id+'\');">'
          +'</button>'
          +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
    html+='<tr>'
        +'<td align="right" colspan="3"><b>Subtotal</b></td>'
        +'<td align="right"><b>'+ribuan(subtotal)+'</b>'
        +'<td colspan="2">&nbsp;</td>'
      +'</tr>'
      +'<tr>'
        +'<td align="right" colspan="3"><b>Total</b></td>'
        +'<td align="right"><b>'+ribuan(bingkai[indek].ar_total)+'</b>'
        +'<td colspan="2">&nbsp;</td>'
      +'</tr>'
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek, p);
  CustomerBalances.form.addPagingFn(indek);// #here
}

CustomerBalances.formDetail=(indek,customer_id)=>{
  bingkai[indek].customer_id=customer_id;
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>CustomerBalances.readPaging(indek));
  CustomerBalances.readOne(indek);
}

CustomerBalances.readOne=(indek)=>{

  db.run(indek,{
    query:"SELECT customer_id, ar_account_id,"
      +" invoice_no, invoice_date,amount_due"
      +" FROM invoice_receipt_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
  },(p)=>{

    var d=objectMany(p.fields,p.data);
    var n=bingkai[indek].paging.offset;  
    
    var html='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
    
    html+='<table border=1>'
      +'<tr>'
      +'<th colspan="2">Customer ID</th>'
      +'<th>AR Account ID</th>'
      +'<th>Invoice #</th>'
      +'<th>Date</th>'
      +'<th>Amount Due</th>'
      +'</tr>';
      
    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td>'+d[x].customer_id+'</td>'
          +'<td>'+d[x].ar_account_id+'</td>'
          +'<td>'+d[x].invoice_no+'</td>'
          +'<td>'+tglWest(d[x].invoice_date)+'</td>'
          +'<td align="right">'+ribuan(d[x].amount_due)+'</td>'
          +'</tr>';
      }
    }
    html+='</table></div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek, p);
    statusbar.message(indek, p); 
  });
}

CustomerBalances.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM customer_balances "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

CustomerBalances.search=(indek)=>{
  CustomerBalances.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,customer_name,amount_due"
        +" FROM customer_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      CustomerBalances.readShow(indek);
    });
  });
}

CustomerBalances.exportExecute=(indek)=>{
  var sql={
    "select": "customer_id,customer_name,amount_due",
    "from": "customer_balances",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "order_by": "customer_id",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'customer_balances');
}



// eof; 160;226;241;242;
