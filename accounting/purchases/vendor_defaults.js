/*
 * auth: budiono;
 * file: 31
 * path: /accounting/purchases/vendor_defaults.js;
 * date: sep-11, 15:32, mon-2023; new;
 * edit: sep-16, 10:15, sat-2023; mod size;
 * -----------------------------; happy new year 2024;
 * edit: jan-04, 11:52, thu-2024; new account_look.js;
 * edit: jan-09, 17:42, tue-2024; with class;
 * edit: apr-26, 10:37, fri-2024; dengan basic sql;
 * edit: may-10, 16:27, fri-2024; okeh;
 * edit: jun-26, 16:56, wed-2024; r3;
 * edit: jul-27, 21:10, sat-2024; r11;
 * edit: sep-10, 20:50, tue-2024; r18;
 * edit: dec-23, 16:36, mon-2024; #32; properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-19, 10:07, wed-2025; #41 file_id;
 * edit: mar-11, 15:00, tue-2025; #43; deep folder;
 * edit: mar-25, 19:03, tue-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:50, thu-2025; #50; can export to csv;
 * edit: nov-20, 17:45, thu-2025; #81; numeric;
 */ 
 
'use strict';

var VendorDefaults={};

VendorDefaults.table_name='vendor_defaults';
VendorDefaults.account=new AccountLook(VendorDefaults);

VendorDefaults.show=(karcis)=>{
  karcis.modul=VendorDefaults.table_name;

  var baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    var indek=newVen.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        VendorDefaults.formUpdate(indek);
      });
    });
  }else{
    show(baru);
  }
}

VendorDefaults.formEntry=(indek)=>{
  // biasakan menulis dengan lengkap:
  // contoh discount, bukan disingkat disc, tetapi tetap discount
  // karena sering terjadi kesalahan link antara kolom.

 bingkai[indek].metode=MODE_UPDATE;
  var html='<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<form autocomplete="off">'
    +'<details open>'
    +'<summary>Vendor Accounts</summary>'
      +'<ul>'

      +'<li><label>Purchase Acct.:</label>'

        +'<input type="text"'
        +' id="gl_account_id_'+indek+'"'
        +' name="element_disabled_'+indek+'"'
        +' onchange="VendorDefaults.getAccount(\''+indek+'\''
        +',\'gl_account_id_'+indek+'\')"'
        +' style="text-align:center;"'
        +' size="8" >'

        +'<button type="button" id="btn_find" '
          +' name="element_disabled_'+indek+'"'
          +' onclick="VendorDefaults.account.getPaging(\''+indek+'\''
          +',\'gl_account_id_'+indek+'\',-1'
          +',\''+CLASS_EXPENSE+'\')">'
        +'</button>'
        
        +'<input type="text" '
        +' id="gl_account_name_'+indek+'" disabled>'
        
        +'</li>'
      
      +'<li><label>Discount Acct.:</label>'
        +'<input type="text"'
        +' id="discount_account_id_'+indek+'"'
        +' name="element_disabled_'+indek+'"'
        +' onchange="VendorDefaults.getAccount(\''+indek+'\''
        +',\'discount_account_id_'+indek+'\')"'
        +' style="text-align:center;"'
        +' size="8" >'

        +'<button type="button" '
        +' id="discount_account_btn_'+indek+'" '
        +' class="btn_find" '
        +' name="element_disabled_'+indek+'"'
        +' onclick="VendorDefaults.account.getPaging(\''+indek+'\''
        +',\'discount_account_id_'+indek+'\',-1'
        +',\''+CLASS_EXPENSE+'\')">'
        +'</button>'
        
        +'<input type="text" '
        +' id="discount_account_name_'+indek+'" disabled>'
        +'</li>'
        
      +'<li><label>A/P Account.:</label>'
        +'<input type="text" '
        +' id="ap_account_id_'+indek+'" '
        +' name="element_disabled_'+indek+'"'
        +' onchange="VendorDefaults.getAccount(\''+indek+'\''
        +',\'ap_account_id_'+indek+'\')"'
        +' style="text-align:center;"'
        +' size="8" >'
        
        +'<button type="button" '
        +' class="btn_find" '
        +' id="ap_account_btn_'+indek+'"'
        +' name="element_disabled_'+indek+'"'
        +' onclick="VendorDefaults.account.getPaging(\''+indek+'\''
        +',\'ap_account_id_'+indek+'\',-1'
        +',\''+CLASS_LIABILITY+'\')">'
        +'</button>'
        
        +'<input type="text" '
        +' id="ap_account_name_'+indek+'" disabled>'
        +'</li>'
        
      +'<li><label>Cash Account.:</label>'
        +'<input type="text" '
        +' id="cash_account_id_'+indek+'" '
        +' name="element_disabled_'+indek+'"'
        +' onchange="VendorDefaults.getAccount(\''+indek+'\''
        +',\'cash_account_id_'+indek+'\')"'
        +' style="text-align:center;"'
        +' size="8" >'
        
        +'<button type="button" '
        +' id="cash_account_btn_'+indek+'"'
        +' class="btn_find" '
        +' name="element_disabled_'+indek+'"'
        +' onclick="VendorDefaults.account.getPaging(\''+indek+'\''
        +',\'cash_account_id_'+indek+'\',-1'
        +',\''+CLASS_ASSET+'\')">'
        +'</button>'
        
        +'<input type="text" '
        +' id="cash_account_name_'+indek+'" disabled>'
        +'</li>'
      +'</ul>'
    +'</details>'
    
    +'<details open>'
    +'<summary>Payment Terms</summary>'
      +'<ul>'

      +'<li><label>Standar Terms:</label>'
        +'<select id="type_'+indek+'"'
          +' name="element_disabled_'+indek+'"'
          +' onchange="VendorDefaults.mode(\''+indek+'\');">'
          +getDataTermsType(indek)
        +'</select>'
        +'</li>'

      +'<li><label>Net due in: </label>'
          +'<input type="text" '
          +' id="due_in_'+indek+'" '
          +' name="element_disabled2_'+indek+'"'
          +' onchange="VendorDefaults.calculateTerms(\''+indek+'\');"'
          +' size="9" style="text-align:center;">'
          +'</li>'
          
        +'<li><label>Discount in: </label>'
          +'<input type="text" '
          +' id="discount_in_'+indek+'"'
          +' name="element_disabled2_'+indek+'"'
          +' onchange="VendorDefaults.calculateTerms(\''+indek+'\');"'
          +' size="9" style="text-align:center;">'
          +'</li>'
          
        +'<li><label>Discount %: </label>'
          +'<input type="text" '
          +' id="discount_percent_'+indek+'" '
          +' name="element_disabled2_'+indek+'"'
          +' onchange="VendorDefaults.calculateTerms(\''+indek+'\');"'
          +'size="9" style="text-align:center;">'
          +'</li>'
          
        +'<li><label>Displayed: </label>'
          +'<input type="text"'
          +' id="displayed_'+indek+'"'
          +' size="15"'
          +' style="text-align:center;" disabled>'
          +'</li>'

      +'</ul>'
    +'</details>'
    
    +'<details open>'
    +'<summary>Credit Limit</summary>'
      +'<ul>'
      +'<li><label>Limit:</label>'
        +'<input type="text" '
        +' id="credit_limit_'+indek+'" '
        +' name="element_disabled_'+indek+'"'
        +' style="text-align:center;" size="9">'
        +'</li>'

      +'</ul>'
    +'</details>'
    +'</form>'
    +'</div>'

  content.html(indek,html);
  statusbar.ready(indek);
}

VendorDefaults.view=(indek,lock)=>{
  var d=document.getElementsByName('element_disabled_'+indek);
  var d2=document.getElementsByName('element_disabled2_'+indek);
  var n;
  
  d.forEach((x)=>{
    n=x.id;
    document.getElementById(n).disabled=lock;
  });
  
  if(lock){
    d2.forEach((x)=>{
      n=x.id;
      document.getElementById(n).disabled=lock;
    });
  }else{
    VendorDefaults.mode2(indek);
  }
}

VendorDefaults.mode=(indek)=>{
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
      VendorDefaults.calculateTerms(indek);
  }
}

VendorDefaults.mode2=(indek)=>{
  var mode=document.getElementById('type_'+indek).value;
  document.getElementById('discount_percent_'+indek).disabled=true;
  document.getElementById('discount_in_'+indek).disabled=true;
  document.getElementById('due_in_'+indek).disabled=true;

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
      VendorDefaults.calculateTerms(indek);
  }
}

VendorDefaults.calculateTerms=(indek)=>{
  document.getElementById('displayed_'+indek).value
    =document.getElementById('discount_percent_'+indek).value+'% '
    +document.getElementById('discount_in_'+indek).value+', Net '
    +document.getElementById('due_in_'+indek).value+' Days';
}

VendorDefaults.formUpdate=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.refresh(indek,()=>VendorDefaults.formUpdate(indek));
  toolbar.more(indek,()=>Menu.more(indek));
  VendorDefaults.formEntry(indek);
  VendorDefaults.readOne(indek,()=>{
    toolbar.edit(indek,()=>{VendorDefaults.formEdit(indek);});
    toolbar.download(indek,()=>{VendorDefaults.formExport(indek);});
    toolbar.upload(indek,()=>{VendorDefaults.formImport(indek);});
      VendorDefaults.view(indek,true);
  });
}

VendorDefaults.formEdit=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VendorDefaults.formUpdate(indek);});
  toolbar.save(indek,()=>VendorDefaults.saveExecute(indek));
  toolbar.delet(indek,()=>VendorDefaults.deleteExecute(indek));
  toolbar.properties(indek,()=>VendorDefaults.properties(indek));
  VendorDefaults.view(indek,false);
}

VendorDefaults.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * FROM vendor_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      var f=JSON.parse(d.discount_terms);

      setEV('gl_account_id_'+indek, d.gl_account_id);
      setEV('gl_account_name_'+indek, d.gl_account_name);
        
      setEV('discount_account_id_'+indek, d.discount_account_id);
      setEV('discount_account_name_'+indek, d.discount_account_name);
      setEV('ap_account_id_'+indek, d.ap_account_id);
      setEV('ap_account_name_'+indek, d.ap_account_name);
      setEV('cash_account_id_'+indek, d.cash_account_id);
      setEV('cash_account_name_'+indek, d.cash_account_name);
        
      setEI('type_'+indek, f.type);
      setEV('due_in_'+indek, f.due_in);
      setEV('discount_in_'+indek, f.discount_in);
      setEV('discount_percent_'+indek, f.discount_percent);
      setEV('displayed_'+indek, f.displayed);

      setEV('credit_limit_'+indek, d.credit_limit);
    };
    message.none(indek);
    return callback();
  });
}

VendorDefaults.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  
  setEV(id_kolom, data.account_id);
  VendorDefaults.getAccount(indek,id_kolom,nama_kolom);
}

VendorDefaults.getAccount=(indek,id_kolom,alias)=>{
  VendorDefaults.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    var nm_account=txt_undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      nm_account=d.name;
    }
    switch(id_kolom){
      case "gl_account_id_"+indek:
        setEV('gl_account_name_'+indek, nm_account);
        break;
      case "ap_account_id_"+indek:
        setEV('ap_account_name_'+indek, nm_account);
        break;
      case "cash_account_id_"+indek:
        setEV('cash_account_name_'+indek, nm_account);
        break;
      case "discount_account_id_"+indek:
        setEV('discount_account_name_'+indek, nm_account);
        break;
      default:
        alert(id_kolom+' undefined in [vendor_defaults.js]')
    }
  });
}

VendorDefaults.saveExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM vendor_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.count==0){
      VendorDefaults.createExecute(indek);
    }else{
      VendorDefaults.updateExecute(indek);
    }
  });
}

VendorDefaults.createExecute=(indek)=>{

  var discount_terms=JSON.stringify({
    'type':getEI('type_'+indek),
    'due_in': getEV('due_in_'+indek),
    'discount_in': getEV('discount_in_'+indek),
    'discount_percent':getEV('discount_percent_'+indek),
    'displayed':getEV('displayed_'+indek),
  })

  db.execute(indek,{
    query:"INSERT INTO vendor_defaults"
    +" (admin_name,company_id, gl_account_id, discount_account_id,"
    +" ap_account_id, cash_account_id,"
    +" discount_terms,credit_limit)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV('gl_account_id_'+indek)+"'"
    +",'"+getEV('discount_account_id_'+indek)+"'"
    +",'"+getEV('ap_account_id_'+indek)+"'"
    +",'"+getEV('cash_account_id_'+indek)+"'"
    +",'"+discount_terms+"'"
    +",'"+getEV('credit_limit_'+indek)+"'"
    +")"
  },(p)=>{
    bingkai[indek].metode=MODE_CREATE;
    if(p.err.id==0) VendorDefaults.bentukAkhir(indek);
  });
}

VendorDefaults.updateExecute=(indek)=>{

  var discount_terms=JSON.stringify({
    'type':getEI('type_'+indek),
    'due_in': getEV('due_in_'+indek),
    'discount_in': getEV('discount_in_'+indek),
    'discount_percent': getEV('discount_percent_'+indek),
    'displayed': getEV('displayed_'+indek),     
  })
  
  db.execute(indek,{
    query:"UPDATE vendor_defaults "
      +" SET gl_account_id='"+getEV('gl_account_id_'+indek)+"', "
      +" discount_account_id='"+getEV('discount_account_id_'+indek)+"', "
      +" ap_account_id='"+getEV('ap_account_id_'+indek)+"', "
      +" cash_account_id='"+getEV('cash_account_id_'+indek)+"', "
      +" discount_terms='"+discount_terms+"', "
      +" credit_limit="+getEV('credit_limit_'+indek)

      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    bingkai[indek].metode=MODE_UPDATE;
    if(p.err.id==0) VendorDefaults.bentukAkhir(indek);
  });
}

VendorDefaults.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM vendor_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    bingkai[indek].metode=MODE_DELETE;
    if(p.err.id==0) VendorDefaults.bentukAkhir(indek);
  });
}

VendorDefaults.formExport=function(indek){
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>VendorDefaults.formUpdate(indek));
  VendorDefaults.exportExecute(indek);
}

VendorDefaults.exportExecute=(indek)=>{
  var sql={
    "select": "company_id,gl_account_id,discount_account_id,"
      +"ap_account_id,cash_account_id,"
      +"discount_terms,credit_limit",
    "from": "vendor_defaults",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'vendor_defaults');
}

VendorDefaults.formImport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VendorDefaults.formUpdate(indek);});
  iii.uploadJSON(indek);
}

VendorDefaults.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO vendor_defaults "
      +"(admin_name,company_id,gl_account_id,discount_account_id,"
      +" ap_account_id,cash_account_id,discount_terms,"
      +" credit_limit)"
      +" VALUES"
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'" 
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +",'"+d[i][3]+"'"
      +",'"+d[i][4]+"'"
      +",'"+d[i][5]+"'"
      +",'"+d[i][6]+"'" 
      +")"     
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

VendorDefaults.getDefault=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM vendor_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      
      bingkai[indek].data_default=d;
      // parse;
      bingkai[indek].data_default.discount_terms=
        JSON.parse(d.discount_terms);
    }else{
      bingkai[indek].data_default={
        'gl_account_id':'',
        'gl_account_name':'',
        'discount_account_id':'',
        'discount_account_name':'',
        'ap_account_id':'',
        'ap_account_name':'',
        'cash_account_id':'',
        'cash_account_name':'',
        'discount_terms':{
          'type':0,
          'due_in':'',
          'discount_in':0,
          'discount_percent':0,
          'displayed':''
        },
        'credit_limit':0
      }
    }
    // default;
    bingkai[indek].discount_terms=
      bingkai[indek].data_default.discount_terms;
  });
}

VendorDefaults.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM vendor_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

VendorDefaults.bentukAkhir=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VendorDefaults.formUpdate(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VendorDefaults.properties(indek);})
  }
}



// eof:391;403;420;456;449;458;536;522;524;598;
