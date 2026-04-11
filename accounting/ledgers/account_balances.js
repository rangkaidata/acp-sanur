/*
 * auth: budiono;
 * code: ...
 * path: /accounting/ledgers/account_balances.js;
 * ---------------------------------------------;
 * date: oct-02, 16:25, mon-2023; new
 * edit: oct-04, 12:26, wed-2023; xHTML;
 * edit: oct-06, 17:37, fri-2023; neraca saldo;
 * edit: oct-14, 08:08, sat-2023; 
 * edit: oct-19, 22:02, thu-2023; xHTML;
 * edit: dec-23, 17:15, sat-2023; 
 * -----------------------------; happy new year 2024;
 * edit: jan-25, 15:40, thu-2024; perubahan balance_no->reference_no
 * edit: oct-25, 16:45, fri-2024; #24; general_ledger;
 * -----------------------------; happy new year 2025;
 * edit: mar-28, 14:08, fri-2025; #45; ctables;cstructure;
 * edit: apr-19, 16:58, sat-2025; #50; export_gl;
 * edit: sep-17, 19:19, wed-2025; #75; ciamik soro;
*/

'use strict';

var AccountBalances={}
var AccountBalances2={}

AccountBalances.table_name='account_balances';
AccountBalances.form=new ActionForm2(AccountBalances);
AccountBalances2.form=new ActionForm2(AccountBalances2);

AccountBalances.show=(tiket)=>{
  tiket.modul=AccountBalances.table_name;
  tiket.bisa.tambah=1;

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    AccountBalances.form.modePaging(indek);
  }else{
    show(baru);
  }  
}

AccountBalances.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +",SUM(debit) AS dbt"
      +",SUM(credit) AS crt"
      +" FROM account_balances"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].debit_total=paket.data[0][1];
      bingkai[indek].credit_total=paket.data[0][2];
    }
    return callback()
  });
}

AccountBalances.readPaging=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE();});  
  toolbar.search(indek,()=>{AccountBalances.form.modeSearch(indek)});
  toolbar.refresh(indek,()=>{AccountBalances.readPaging(indek)});
  toolbar.download(indek,()=>{AccountBalances.form.modeExport(indek)});
  toolbar.more(indek,()=>{Menu.more(indek)});
  
  bingkai[indek].metode=MODE_READ;
  
  AccountBalances.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id,account_name,account_class"
        +",SUM(balance) AS balance"
        +" FROM general_ledger"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
//        +" AND date<='2010-03-31'"
        +" GROUP BY account_id,account_name,account_class"
        +" ORDER BY account_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },(p)=>{
      PAGING=true;
      AccountBalances.getTotal(indek,(h)=>{
        bingkai[indek].debit_total=h.debit;
        bingkai[indek].credit_total=h.credit;
        AccountBalances.readShow(indek);  
      });
    });
  })
}

AccountBalances.getTotal=(indek,okeh)=>{
  
  var data=[];
  var o=0;
  
  function prosess_iterasi(j,callback){
    o=100*j;
    db.run(0,{
      query:"SELECT SUM(debit) AS dbt,"
        +" SUM(credit) as crt,"
        +" SUM(balance) AS bal"
        +" FROM general_ledger"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" GROUP BY account_id,account_name,account_class"
        +" LIMIT 100"
        +" OFFSET "+o
    },(p)=>{
      j++;
      if(p.count==0){
        return callback();
      } else {
        data.push(...p.data);
        prosess_iterasi(j,()=>{
          return callback();
        });
      }
    });
  }
  
  prosess_iterasi(0,()=>{
    var a=0;
    var b=0;
    var c=0;
    var bal=0;
    
    for(a=0;a<data.length;a++){
      bal=Number(data[a][2]);
      if(bal>0){
        b+=Number(bal);
      }else{
        c+=Number(bal)*-1;
      }
    }

    return okeh({
      debit: b,
      credit: c
    })
  });
}

AccountBalances.readShow=(indek)=>{
  var sum_dbt=0, dbt=0;
  var sum_crt=0, crt=0;
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var tot_dbt=Number(bingkai[indek].debit_total);
  var tot_crt=Number(bingkai[indek].credit_total);
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
    +'<th colspan="2">Account ID</th>'
    +'<th>Account Name</th>'
    +'<th>Account Class</th>'
    +'<th>Debit</th>'
    +'<th>Credit</th>'
    +'<th colspan="2">Action</th>';
    
    if (p.err.id===0){      
      for (var x in d){
        
        dbt=0;
        crt=0;

        if(Number(d[x].balance)>0){
          dbt=d[x].balance;
          sum_dbt+=Number(dbt);
        }else{
          crt=d[x].balance*-1;
          sum_crt+=Number(crt);
        }
        
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].account_id+'</td>'
        +'<td align="left">'+xHTML(d[x].account_name)+'</td>'
        +'<td align="center">'+array_account_class[d[x].account_class]+'</td>'
        +'<td align="right">'+ribuan(dbt)+'</td>'
        +'<td align="right">'+ribuan(crt)+'</td>'

        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_detail" '
          +' onclick="AccountBalances.formView(\''+indek+'\''
          +' ,\''+d[x].account_id+'\');">'
          +'</button>'
          +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
      }
    }
    // sum
    html+='<tr>'
      +'<td align="right" colspan="4"><strong>Subtotal</strong></td>'
      +'<td align="right"><strong>'+ribuan(sum_dbt)+'</strong></td>'
      +'<td align="right"><strong>'+ribuan(sum_crt)+'</strong></td>'
      +'<td colspan="2">&nbsp;</td>'
      +'</tr>'
      +'<tr>'
      +'<td align="right" colspan="4"><strong>Balance</strong></td>'
      +'<td align="right"><strong>'+ribuan(tot_dbt)+'</strong></td>'
      +'<td align="right"><strong>'+ribuan(tot_crt)+'</strong></td>'
      +'<td colspan="2">&nbsp;</td>'
      +'</tr>'
      +'</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  AccountBalances.form.addPagingFn(indek);
  
}

AccountBalances.formView=(indek,account_id)=>{
  bingkai[indek].account_id=account_id;

  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.refresh(indek,()=>{AccountBalances.readOne(indek);});
  toolbar.back(indek,()=>AccountBalances.readPaging(indek));
  AccountBalances2.readPaging(indek);
}

AccountBalances2.readPaging=(indek)=>{  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.refresh(indek,()=>{AccountBalances2.readPaging(indek);});
  toolbar.back(indek,()=>AccountBalances.readPaging(indek));
  toolbar.download(indek,()=>AccountBalances2.form.modeExport(indek));
  
  AccountBalances2.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id,account_name,account_class,"
        +" date,reference,description,"
        +" debit,credit,balance,"
        +" table_name"
        +" FROM general_ledger"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND account_id='"+bingkai[indek].account_id+"'"
        +" ORDER BY date,reference,row_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset

    },(p)=>{
      PAGING=true;
      AccountBalances2.readShow(indek);
    });
  })
}

AccountBalances2.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM general_ledger"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" AND account_id='"+bingkai[indek].account_id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}


AccountBalances2.readShow=(indek)=>{
  var o=bingkai[indek].paging.offset;
  var p=bingkai[indek].paket;
  var sum_dbt=0;
  var sum_crt=0;
  var sum_bal=0;
  var d=objectMany(p.fields,p.data);
  var n=0;
  var title="";

  var html='<div style="padding:0.5rem;">'
    +content.message(indek)
    +pagingLimit(indek)
    +content.title(indek)
  
  html+='<table border=1>'
    +'<caption>'
    +'<h2 id="title_'+indek+'">&nbsp;</h2>'
    +'</caption>'
    +'<tr>'
    +'<th colspan="2">Date</th>'
    +'<th>Reference #</th>'
    +'<th>Description</th>'
    +'<th>Debit</th>'
    +'<th>Credit</th>'
    +'<th>Balance</th>'
    +'<th>Source</th>'
    +'</tr>';
    
  if (p.err.id===0){
    for (var x in d) {
      o++;
      sum_dbt+=Number(d[x].debit);
      sum_crt+=Number(d[x].credit);
      sum_bal+=Number(d[x].balance);
      
      title=d[x].account_id 
        +' - '+d[x].account_name
        +' ('+array_account_class[d[x].account_class]+')';
      html+='<tr>'
        +'<td>'+o+'</td>'
        +'<td>'+tglWest(d[x].date)+'</td>'
        +'<td>'+d[x].reference+'</td>'
        +'<td>'+xHTML(d[x].description)+'</td>'
        
        +'<td align="right">'+ribuan(d[x].debit)+'</td>'
        +'<td align="right">'+ribuan(d[x].credit)+'</td>'
        +'<td align="right">'+ribuan(d[x].balance)+'</td>'
        +'<td align="left">'+d[x].table_name+'</td>'
        +'</tr>';
    }
    html+='<tr>'
      +'<td colspan="4" align="right"><b>Ending Balance</b></td>'
      +'<td align="right"><b>'+ribuan(sum_dbt)+'</b></td>'
      +'<td align="right"><b>'+ribuan(sum_crt)+'</b></td>'
      +'<td align="right"><b>'+ribuan(sum_bal)+'</b></td>'
      +'<td>&nbsp;</td>'
      +'</tr>'
  }
  html+='</table></div>';
  content.html(indek,html);
  setiH('title_'+indek, '<b>'+title+'</b>');
  if(p.err.id!=0) content.infoPaket(indek, p);
  statusbar.message(indek, p); 
  AccountBalances2.form.addPagingFn(indek);
}

AccountBalances.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM account_balances "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR account_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

AccountBalances.search=(indek)=>{
  AccountBalances.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id,account_name,account_class,balance"
        +" FROM account_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR account_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      AccountBalances.readShow(indek);
    });
  });
}

AccountBalances.exportExecute=(indek)=>{
/*  
  var sql={
    "select": "account_id,account_name,account_class,debit,credit,balance",
    "from": "account_balances",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "order_by": "account_id",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'account_balances');
  
//  var table_name=Boms.table_name;
*/
  var sql="SELECT account_id,account_name,account_class,debit,credit,balance"
    +" FROM account_balances"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
  DownloadEmpat.display(indek,sql,"account_balances");
}

AccountBalances2.exportExecute=(indek)=>{
/*  
  var sql={
    "select": "account_id,account_name,account_class,"
      +" date,reference,description,"
      +" debit,credit,balance,"
      +" table_name",
    "from": "general_ledger",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+bingkai[indek].account_id+"'",
    "order_by": "date,reference,row_id",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'general_ledger');
*/
  var sql="SELECT account_id,account_name,account_class,"
    +"date,reference,description,"
    +"debit,credit,balance"
    +" FROM general_ledger"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" AND account_id='"+bingkai[indek].account_id+"'"
  DownloadEmpat.display(indek,sql,"general_ledger");
}

/*

AccountBalances2.search=(indek)=>{}





*/


// eof: 277;281;342;354;415;
