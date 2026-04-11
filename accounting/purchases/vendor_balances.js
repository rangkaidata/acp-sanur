/*
 * auth: budiono;
 * code: ...
 * path: /accounting/purchases/vendor_balances.js;
 * ----------------------------------------------;
 * date: oct-02, 16:45, mon-2023; new;
 * edit: oct-04, 17:58, wed-2023; 
 * edit: oct-15, 20:01, sun-2023; 
 * edit: nov-20, 08:24, mon-2023; format ribuan;
 * -----------------------------; happy new year 2024;
 * edit: oct-16, 16:54, wed-2024; #22;
 * -----------------------------; happy new year 2025;
 * edit: mar-28, 14:22, fri-2025; #45; ctables;cstructure;
 * edit: apr-20, 16:38, sun-2025; #50; download;
*/

'use strict';

var VendorBalances={}

VendorBalances.url='vendor_balances';
VendorBalances.form=new ActionForm2(VendorBalances);

VendorBalances.show=(karcis)=>{
  karcis.modul=VendorBalances.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    var indek=newVen.show();
    VendorBalances.form.modePaging(indek);
  }else{
    show(baru);
  }
}

VendorBalances.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +",SUM(amount_due) AS ar_total"
      +" FROM vendor_balances"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND amount_due != 0" // NOT EQUAL
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].ar_total=paket.data[0][1];
    }
    return callback()
  });
}

VendorBalances.readPaging=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ ui.CLOSE(); });
  toolbar.refresh(indek,()=>{ VendorBalances.readPaging(indek) });
  toolbar.search(indek,()=>{ VendorBalances.form.modeSearch(indek); });
  toolbar.download(indek,()=>{ VendorBalances.form.modeExport(indek); });
  toolbar.more(indek,()=>{ Menu.more(indek) });
  
  bingkai[indek].metode=MODE_READ;
  VendorBalances.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,name,amount_due"
        +" FROM vendor_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND amount_due != 0"
        +" ORDER BY vendor_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VendorBalances.readShow(indek);
    });
  })
}

VendorBalances.readShow=(indek)=>{
  var subtotal=0;
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Vendor ID</th>'
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
        +'<td>'+d[x].vendor_id+'</td>'
        +'<td>'+xHTML(d[x].name)+'</td>'
        +'<td align="right">'+ribuan(d[x].amount_due)+'</td>'

        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_detail"'
          +' onclick="VendorBalances.formDetail(\''+indek+'\''
          +',\''+d[x].vendor_id+'\');">'
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
  html+='</table>'
    +'</div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  VendorBalances.form.addPagingFn(indek);// #here
}

VendorBalances.formDetail=(indek,vendor_id)=>{
  bingkai[indek].vendor_id=vendor_id;
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>VendorBalances.readPaging(indek));
  VendorBalances.readOne(indek);
}

VendorBalances.readOne=(indek)=>{
  db.run(indek,{
    query:"SELECT vendor_id,"
      +" invoice_no, invoice_date,amount_due"
      +" FROM receive_payment_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
      +" AND amount_due != 0"
      +" ORDER BY invoice_date,invoice_no"
  },(p)=>{
    var subtotal=0;
    var d=objectMany(p.fields,p.data);
    var n=bingkai[indek].paging.offset;  

    var html='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
    
    html+='<table border=1>'
      +'<tr>'
      +'<th colspan="2">Vendor ID</th>'
      +'<th>Invoice #</th>'
      +'<th>Date</th>'
      +'<th>Amount Due</th>'
      +'</tr>';
      
    if (p.err.id===0){
      for (var x in d) {
        subtotal+=Number(d[x].amount_due);
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td>'+d[x].vendor_id+'</td>'
          +'<td>'+d[x].invoice_no+'</td>'
          +'<td>'+tglWest(d[x].invoice_date)+'</td>'
          +'<td align="right">'+ribuan(d[x].amount_due)+'</td>'
          +'</tr>';
      }
      html+='<tr>'
        +'<td colspan="4" align="right"><b>Subtotal</b></td>'
        +'<td align="right"><b>'+ribuan(subtotal)+'</b></td></tr>'
    }
    html+='</table></div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek, p);
    statusbar.message(indek, p); 
  });
}

VendorBalances.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM vendor_balances "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

VendorBalances.search=(indek)=>{
  VendorBalances.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,name,amount_due"
        +" FROM vendor_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      VendorBalances.readShow(indek);
    });
  });
}

VendorBalances.exportExecute=(indek)=>{
  var sql={
    "select": "vendor_id,name,amount_due",
    "from": "vendor_balances",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "order_by": "vendor_id",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'vendor_balances');
}




// eof; 167;231;245;
