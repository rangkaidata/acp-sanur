
/* 
 * name: budiono;
 * file: D4;
 * path: /accounting/sales/customer_defaults.js;
 * date: sep-11, 16:09, mon-2023; new;
 * edit: sep-12, 12:18, tue-2023; 
 * edit: sep-16, 11:14, sat-2023; 
 * edit: sep-18, 16:25, mon-2023; 
 * edit: sep-19, 21:33, tue-2023;
 * -----------------------------; happy new year 2024;
 * edit: jan-08, 16:13, mon-2024; with oop;
 * edit: jan-10, 15:11, wed-2024; re-write with class;
 * edit: may-15, 14:35, wed-2024; use basic sql;
 * edit: may-17, 16:33, fri-2024; okeh;
 * edit: jun-26, 22:15, wed-2024; r3;
 * edit: jul-27, 22:51, sat-2024; r11;
 * edit: sep-10, 16:37, tue-2024; r18;
 * edit: dec-23, 17:21, mon-2024; #32; properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-20, 17:17, thu-2025; #41 file_blok;
 * edit: mar-11, 15:25, tue-2025; #43; deep folder;
 * edit: mar-25, 23:21, tue-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:06, thu-2025; #50; export to csv;
 * edit: nov-20, 18:12, thu-2025; #81; numeric;
 */ 
 
'use strict';

var CustomerDefaults={};

CustomerDefaults.table_name='customer_defaults';
CustomerDefaults.account=new AccountLook(CustomerDefaults);
CustomerDefaults.payMethod=new PayMethodLook(CustomerDefaults);

CustomerDefaults.show=(karcis)=>{
  karcis.modul=CustomerDefaults.table_name;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    var indek=newVen.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        CustomerDefaults.formUpdate(indek);
      });
    });
  }else{
    show(baru);
  }
}

CustomerDefaults.formEntry=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<form autocomplete="off">' 
    +'<details open>'
    +'<summary>Customer Accounts</summary>'
      +'<ul>'
        +'<li>'
          +'<label>GL Sales Acct.</label>'
          +'<input type="text" style="text-align:center;"'
            +' id="gl_account_id_'+indek+'"'
            +' onchange="CustomerDefaults.getAccount(\''+indek+'\''
            +',\'gl_account_id_'+indek+'\',\'gl\')"'
            +' size="8">'
          +'<button type="button"'
            +' id="btn_gl_account_id_'+indek+'" class="btn_find"'
            +' onclick="CustomerDefaults.account.getPaging(\''+indek+'\''
            +',\'gl_account_id_'+indek+'\',-1'
            +',\''+CLASS_INCOME+'\');">'
          +'</button>'
          +'<input type="text" id="gl_account_name_'+indek+'"'
            +' disabled>'
        +'</li>'
        +'<li>'
          +'<label>Discount Acct.</label>'
          +'<input type="text"'
            +' style="text-align:center;"'
            +' id="discount_account_id_'+indek+'"'
            +' onchange="CustomerDefaults.getAccount(\''+indek+'\''
            +',\'discount_account_id_'+indek+'\',\'discount\')"'
            +' size="8">'
          +'<button type="button"'
            +' id="btn_discount_account_id_'+indek+'" '
            +' class="btn_find" '
            +' onclick="CustomerDefaults.account.getPaging(\''+indek+'\''
            +',\'discount_account_id_'+indek+'\',-1'
            +',\''+CLASS_INCOME+'\');">'
          +'</button>'
          +'<input type="text" '
            +' id="discount_account_name_'+indek+'" disabled>'      
        +'</li>'
        +'<li>'
          +'<label>AR Account.</label>'
          +'<input type="text"'
            +' style="text-align:center;"'
            +' id="ar_account_id_'+indek+'"'
            +' onchange="CustomerDefaults.getAccount(\''+indek+'\''
            +',\'ar_account_id_'+indek+'\',\'ar\')"'
            +' size="8">'        
          +'<button type="button" '
            +' id="btn_ar_account_id_'+indek+'" '
            +' class="btn_find" '
            +' onclick="CustomerDefaults.account.getPaging(\''+indek+'\''
            +',\'ar_account_id_'+indek+'\',-1'
            +',\''+CLASS_ASSET+'\');">'
          +'</button>'
          +'<input type="text"'
            +' id="ar_account_name_'+indek+'"'
            +' disabled>'
        +'</li>'
        +'<li>'
          +'<label>Cash Account.</label>'
          +'<input type="text"'
            +' style="text-align:center;"'
            +' id="cash_account_id_'+indek+'"'
            +' onchange="CustomerDefaults.getAccount(\''+indek+'\''
            +',\'cash_account_id_'+indek+'\',\'cash\')"'
            +' size="8">'
          +'<button type="button" '
            +' id="btn_cash_account_id_'+indek+'" '
            +' class="btn_find" '
            +' onclick="CustomerDefaults.account.getPaging(\''+indek+'\''
            +',\'cash_account_id_'+indek+'\',-1'
            +',\''+CLASS_ASSET+'\');">'
          +'</button>'          
          +'<input type="text"'
            +' id="cash_account_name_'+indek+'"disabled>'
        +'</li>'
        +'<li>'
          +'<label>Paymt Method</label>'
          +'<input type="text"'
            +' style="text-align:center;"'
            +' id="pay_method_id_'+indek+'"'
            +' size="8">'
          +'<button type="button" '
            +' id="btn_pay_method_id_'+indek+'" '
            +' class="btn_find" '
            +' onclick="CustomerDefaults.payMethod.getPaging(\''+indek+'\''
            +',\'pay_method_id_'+indek+'\',-1)">'
          +'</button>'
        +'</li>'
      +'</ul>'
    +'</details>'
    
    +'<details open>'
    +'<summary>Payment Terms</summary>'
      +'<ul>'

      +'<li><label>Standar Terms:</label>'
        +'<select id="type_'+indek+'" '
          +' onchange="CustomerDefaults.mode(\''+indek+'\')">'
          +getDataTermsType(indek)
        +'</select>'
        +'</li>'

      +'<li><label>Net due in: </label>'
          +'<input type="text" '
          +' id="due_in_'+indek+'" size="5"'
          +' onchange="CustomerDefaults.calculateTerms(\''+indek+'\');"'
          +' style="text-align:center;"></li>'
          
        +'<li><label>Discount in: </label>'
          +'<input type="text" '
          +' id="discount_in_'+indek+'" size="5"'
          +' onchange="CustomerDefaults.calculateTerms(\''+indek+'\');"'
          +' style="text-align:center;"></li>'
          
        +'<li><label>Discount %: </label>'
          +'<input type="text"'
          +' id="discount_percent_'+indek+'" size="5"'
          +' onchange="CustomerDefaults.calculateTerms(\''+indek+'\');"'
          +' style="text-align:center;"></li>'
          
        +'<li><label>Displayed: </label>'
          +'<input type="text"'
          +' id="displayed_'+indek+'"'
          +' size="15"'
          +' style="text-align:center;"'
          +' disabled></li>'

      +'</ul>'
    +'</details>'
    
    +'<details open>'
    +'<summary>Credit Limit</summary>'
      +'<ul>'
      +'<li><label>Limit:</label>'
        +'<input type="text" '
        +' id="credit_limit_'+indek+'" size="5"'
        +' style="text-align:center;"></li>'
      +'<li>'
        +'<label>Finance Charges:</label>'
        +'<label><input type="checkbox" '
        +' id="finance_charges_'+indek+'"></label>'
      +'</li>'

      +'</ul>'
    +'</details>'
    +'</form>'
    +'</div>'

  content.html(indek,html);
  statusbar.ready(indek);
  CustomerDefaults.view(indek,true);
}

CustomerDefaults.view=(indek,lock)=>{
  document.getElementById('gl_account_id_'+indek).disabled=lock;
  document.getElementById('discount_account_id_'+indek).disabled=lock;
  document.getElementById('ar_account_id_'+indek).disabled=lock;
  document.getElementById('cash_account_id_'+indek).disabled=lock;
  document.getElementById('pay_method_id_'+indek).disabled=lock;
  document.getElementById('type_'+indek).disabled=lock;
  document.getElementById('discount_percent_'+indek).disabled=lock;
  document.getElementById('discount_in_'+indek).disabled=lock;
  document.getElementById('due_in_'+indek).disabled=lock;
  document.getElementById('displayed_'+indek).disabled=lock;
  document.getElementById('credit_limit_'+indek).disabled=lock;
  document.getElementById('finance_charges_'+indek).disabled=lock;
  // button
  document.getElementById('btn_gl_account_id_'+indek).disabled=lock;
  document.getElementById('btn_discount_account_id_'+indek).disabled=lock;
  document.getElementById('btn_ar_account_id_'+indek).disabled=lock;
  document.getElementById('btn_cash_account_id_'+indek).disabled=lock;
  document.getElementById('btn_pay_method_id_'+indek).disabled=lock;
}

CustomerDefaults.mode=(indek)=>{
  var mode=document.getElementById('type_'+indek).value;
  document.getElementById('discount_percent_'+indek).disabled=true;
  document.getElementById('discount_in_'+indek).disabled=true;
  document.getElementById('due_in_'+indek).disabled=true;

  document.getElementById('discount_percent_'+indek).value=0;
  document.getElementById('discount_in_'+indek).value=0;
  document.getElementById('due_in_'+indek).value=0;

  switch(Number(mode)){
  case 0:
    document.getElementById('displayed_'+indek).value="C.O.D";
    break;
  case 1:
    document.getElementById('displayed_'+indek).value="Prepaid";
    break;
  default:
    document.getElementById('discount_percent_'+indek).disabled=false;
    document.getElementById('discount_in_'+indek).disabled=false;
    document.getElementById('due_in_'+indek).disabled=false;
    CustomerDefaults.calculateTerms(indek);
  }
}

CustomerDefaults.calculateTerms=(indek)=>{
  document.getElementById('displayed_'+indek).value
    =document.getElementById('discount_percent_'+indek).value+'% '
    +document.getElementById('discount_in_'+indek).value+', Net '
    +document.getElementById('due_in_'+indek).value+' Days';
}

CustomerDefaults.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * FROM customer_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      var t=JSON.parse(d.discount_terms);
      
      setEV('gl_account_id_'+indek, d.gl_account_id);
      setEV('gl_account_name_'+indek, d.gl_account_name);
      setEV('discount_account_id_'+indek, d.discount_account_id);
      setEV('discount_account_name_'+indek, d.discount_account_name);
      setEV('ar_account_id_'+indek, d.ar_account_id);
      setEV('ar_account_name_'+indek, d.ar_account_name);
      setEV('cash_account_id_'+indek, d.cash_account_id);
      setEV('cash_account_name_'+indek, d.cash_account_name);
      setEV('pay_method_id_'+indek, d.pay_method_id);

      setEI('type_'+indek, t.type);
      setEV('due_in_'+indek, t.due_in);
      setEV('discount_in_'+indek, t.discount_in);
      setEV('discount_percent_'+indek, t.discount_percent);
      setEV('displayed_'+indek, t.displayed);

      setEV('credit_limit_'+indek, d.credit_limit);
      setEC('finance_charges_'+indek, d.finance_charges);      
    };
    message.none(indek);
    return callback();
  });
}

CustomerDefaults.formUpdate=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.refresh(indek,()=>CustomerDefaults.formUpdate(indek));
  toolbar.more(indek,()=>Menu.more(indek));
  CustomerDefaults.formEntry(indek);
  CustomerDefaults.readOne(indek,()=>{
    toolbar.edit(indek,()=>{CustomerDefaults.formEdit(indek);});
    toolbar.download(indek,()=>{CustomerDefaults.formExport(indek);});
    toolbar.upload(indek,()=>{CustomerDefaults.formImport(indek);});
  });
}

CustomerDefaults.formEdit=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{CustomerDefaults.formUpdate(indek);});
  toolbar.save(indek,()=>CustomerDefaults.saveExecute(indek));
  toolbar.delet(indek,()=>CustomerDefaults.deleteExecute(indek));
  toolbar.properties(indek,()=>CustomerDefaults.properties(indek));
//  alert('edit')
  CustomerDefaults.view(indek,false);
}

CustomerDefaults.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  
  setEV(id_kolom, data.account_id);
  CustomerDefaults.getAccount(indek,id_kolom,nama_kolom);
}

CustomerDefaults.getAccount=(indek,id_kolom)=>{
  CustomerDefaults.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    let nm_account=txt_undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      nm_account=d.name;
    }
    switch(id_kolom){
      case "gl_account_id_"+indek:
        setEV('gl_account_name_'+indek, nm_account);
        break;
      case "ar_account_id_"+indek:
        setEV('ar_account_name_'+indek, nm_account);
        break;
      case "cash_account_id_"+indek:
        setEV('cash_account_name_'+indek, nm_account);
        break;
      case "discount_account_id_"+indek:
        setEV('discount_account_name_'+indek, nm_account);
        break;
      default:
        alert('['+id_kolom+'] undefined in [customer_defaults.js]')
    }
  });
}

CustomerDefaults.setPayMethod=(indek,d)=>{
  setEV('pay_method_id_'+indek, d.pay_method_id);
}

CustomerDefaults.saveExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT * FROM customer_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.count==0){
      CustomerDefaults.createExecute(indek);
    }else{
      CustomerDefaults.updateExecute(indek);
    }
  });
}

CustomerDefaults.createExecute=(indek)=>{
  
  var discount_terms=JSON.stringify({
    'type': getEI('type_'+indek),
    'due_in': getEV('due_in_'+indek),
    'discount_in': getEV('discount_in_'+indek),
    'discount_percent': getEV('discount_percent_'+indek),
    'displayed':getEV('displayed_'+indek),
  });
  
  db.execute(indek,{
    query:"INSERT INTO customer_defaults "
    +" (admin_name,company_id,"
    +" gl_account_id,discount_account_id,ar_account_id,"
    +" cash_account_id,pay_method_id,discount_terms,credit_limit,"
    +" finance_charges) "
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV('gl_account_id_'+indek)+"'"
    +",'"+getEV('discount_account_id_'+indek)+"'"
    +",'"+getEV('ar_account_id_'+indek)+"'"
    +",'"+getEV('cash_account_id_'+indek)+"'"
    +",'"+getEV('pay_method_id_'+indek)+"'"
    +",'"+discount_terms+"'"
    +",'"+getEV('credit_limit_'+indek)+"'"
    +",'"+getEC('finance_charges_'+indek)+"'"
    +")"
  },(p)=>{
    if(p.err.id==0){
      bingkai[indek].metode=MODE_CREATE;
      CustomerDefaults.bentukAkhir(indek);
    }
  });
}

CustomerDefaults.updateExecute=(indek)=>{
  
  var discount_terms=JSON.stringify({
    'type':getEI('type_'+indek),
    'due_in':getEV('due_in_'+indek),
    'discount_in':getEV('discount_in_'+indek),
    'discount_percent':getEV('discount_percent_'+indek),
    'displayed':getEV('displayed_'+indek),
  })
  
  db.execute(indek,{
    query:"UPDATE customer_defaults "
      +" SET gl_account_id='"+getEV('gl_account_id_'+indek)+"', "
      +" discount_account_id='"+getEV('discount_account_id_'+indek)+"', "
      +" ar_account_id='"+getEV('ar_account_id_'+indek)+"', "
      +" cash_account_id='"+getEV('cash_account_id_'+indek)+"', "
      +" pay_method_id='"+getEV('pay_method_id_'+indek)+"', "
      +" discount_terms='"+discount_terms+"', "
      +" credit_limit="+getEV('credit_limit_'+indek)+", "
      +" finance_charges='"+getEC('finance_charges_'+indek)+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.err.id==0){
      bingkai[indek].metode=MODE_UPDATE;
      CustomerDefaults.bentukAkhir(indek);
    }
  });
}

CustomerDefaults.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM customer_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.err.id==0){
      bingkai[indek].metode=MODE_DELETE;
      CustomerDefaults.bentukAkhir(indek);
    }
  });
}

CustomerDefaults.formExport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>CustomerDefaults.formUpdate(indek));
  CustomerDefaults.exportExecute(indek);
}

CustomerDefaults.exportExecute=(indek)=>{
  var sql={
    "select": "company_id,gl_account_id,discount_account_id,"
      +"ar_account_id,cash_account_id,pay_method_id,"
      +"discount_terms,credit_limit,finance_charges ",
    "from": "customer_defaults",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'customer_defaults');
}

CustomerDefaults.formImport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{CustomerDefaults.formUpdate(indek);});
  iii.uploadJSON(indek);
}

CustomerDefaults.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO customer_defaults "
      +" (admin_name,company_id,gl_account_id,discount_account_id,"
      +" ar_account_id,cash_account_id,pay_method_id,"
      +" discount_terms,credit_limit,finance_charges) "
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // gl_account_id
      +",'"+d[i][2]+"'" // discount_account_id
      +",'"+d[i][3]+"'" // ar_account_id
      +",'"+d[i][4]+"'" // cash_account_id
      +",'"+d[i][5]+"'" // pay_method_id
      +",'"+d[i][6]+"'" // discount_terms
      +",'"+d[i][7]+"'" // credit_limit
      +",'"+d[i][8]+"'" // finance_charges
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

CustomerDefaults.getDefault=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM customer_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"    
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      d.discount_terms=JSON.parse(d.discount_terms);
      bingkai[indek].data_default=d;
    }else{
      bingkai[indek].data_default={
        'gl_account_id':'',
        'gl_account_name':'',
        'discount_account_id':'',
        'discount_account_name':'',
        'ar_account_id':'',
        'ar_account_name':'',
        'cash_account_id':'',
        'cash_account_name':'',
        'pay_method_id':'',
        'discount_terms':{
          'date': "",
          'amount': 0,
          'type':0,
          'due_in':'',
          'discount_in':0,
          'discount_percent':0,
          'displayed':''
        },
        'credit_limit':0,
        'finance_charges':false
      }
    }
  });
}

CustomerDefaults.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM customer_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

CustomerDefaults.bentukAkhir=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{CustomerDefaults.formUpdate(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{CustomerDefaults.properties(indek);})
  }
}




// eof: 410;487;482;480;485;496;564;554;559;556;582;
