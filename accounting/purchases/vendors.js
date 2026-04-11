/*
 * auth: budiono;
 * file: E1;
 * path: /accounting/purchases/vendors.js;
 * --------------------------------------;
 * date: sep-11, 15:51, mon-2023; new;
 * edit: sep-16, 15:46, sat-2023; mod create+remove;
 * edit: dec-27, 21:15, wed-2023;
 * -----------------------------; happy new year 2024;
 * edit: jan-02, 06:27, tue-2024; mringkas;
 * edit: jan-09, 18:03, tue-2024; re-write with class;
 * edit: may-21, 18:15, tue-2024; BasicSQL;
 * edit: jun-17, 19:21, mon-2024; custom_fields;
 * edit: jun-29, 08:18, sat-2024; r3;
 * edit: sep-11, 11:27, wed-2024; r18;
 * edit: sep-30, 17:28, mon-2024; #19;
 * edit: nov-24, 16:03, sun-2024; #27; add locker;
 * edit: nov-30, 19:40; sat-2024; #27; revi locker();
 * edit: dec-19, 10:46, thu-2024; #31; properties;
 * edit: dec-24, 11:36, tue-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-21, 15:52, fri-2025; #41; file_id;
 * edit: mar-11, 16:39, tue-2025; #43; deep_folder;
 * edit: mar-26, 00:08, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:12, thu-2025; #50; export to CSV;
 */ 

'use strict';

var Vendors={};

Vendors.table_name='vendors';
Vendors.form=new ActionForm2(Vendors);
Vendors.account=new AccountLook(Vendors);
Vendors.shipMethod=new ShipMethodLook(Vendors);

Vendors.show=(karcis)=>{
  karcis.modul=Vendors.table_name;
  karcis.have_child=true;// form ini punya sub form;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    var indek=newVen.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Vendors.form.modePaging(indek);
        Vendors.getDefault(indek);
      });
    });
  }else{
    show(baru);
  }
}

Vendors.getDefault=(indek)=>{
  VendorDefaults.getDefault(indek);
}

Vendors.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM vendors"
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

Vendors.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Vendors.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT"
        +" vendor_id,name,phone,"
        +" user_name,date_modified"
        +" FROM vendors"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY vendor_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Vendors.readShow(indek);
    });
  })
}

Vendors.readShow=function(indek){
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Vendor ID</th>'
      +'<th>Name</th>'
      +'<th>Phone</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';
    
  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].vendor_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+xHTML(d[x].phone)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="Vendors.formUpdate(\''+indek+'\''
          +',\''+d[x].vendor_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td  align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="Vendors.formDelete(\''+indek+'\''
          +',\''+d[x].vendor_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Vendors.form.addPagingFn(indek);
}

Vendors.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"'
      +' style="margin-bottom:1rem;"></div>'

    +'<form autocomplete="off">'
    +'<ul>'
    +'<li><label>Vendor ID<i style="color:red;">&nbsp;*</i></label>'
      +'<input type="text"'
      +' id="vendor_id_'+indek+'">'
      +'</li>'
      
    +'<li><label>Name</label>'
      +'<input type="text"'
      +' id="name_'+indek+'"'
      +' size="30">'
      +'</li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label>'
      +'<input type="checkbox"'
      +' id="inactive_'+indek+'">Inactive</label>'
      +'</li>'
    +'</ul>'

    +'<details open>'
    +'<summary>General</summary>'
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:20px;">'
    +'<div>'
      +'<ul>'
      
      +'<li><label>Contact</label>'
        +'<input type="text"'
        +' id="contact_'+indek+'"'
        +' size="10">'
        +'</li>'

      +'<li><label>Account#</label>'
        +'<input type="text"'
        +' id="account_'+indek+'"'
        +' size="10">'
        +'</li>'
        
      +'<li><label>Address</label>'
        +'<input type="text"'
        +' id="street_1_'+indek+'"'
        +' size="25">'
        +'</li>'
        
      +'<li><label>&nbsp;</label>'
        +'<input type="text"'
        +' id="street_2_'+indek+'"'
        +' size="25">'
        +'</li>'
        
      +'<li><label>City</label>'
        +'<input type="text"'
        +' id="city_'+indek+'"'
        +' size="20">'
        +'</li>'
        
      +'<li><label>State</label>'
        +'<input type="text"'
        +' id="state_'+indek+'"'
        +' size="10">'
        +'</li>'
        
      +'<li><label>ZIP</label>'
        +'<input type="text"'
        +' id="zip_'+indek+'"'
        +' size="10">'
        +'</li>'
        
      +'<li><label>Country</label>'
        +'<input type="text"'
        +' id="country_'+indek+'"'
        +' size="20">'
        +'</li>'
      +'</ul>'
    +'</div>'
    
    +'<div>'  
      +'<ul>'
      +'<li><label>Vendor Type</label>'
        +'<input type="text"'
        +' id="type_'+indek+'"'
        +' size="5">'
        +'</li>'
        
      +'<li><label>Phone</label>'
        +'<input type="text"'
        +' id="phone_'+indek+'"'
        +' size="12">'
        +'</li>'
        
      +'<li><label>Mobile</label>'
        +'<input type="text"'
        +' id="mobile_'+indek+'"'
        +' size="12">'
        +'</li>'
        
      +'<li><label>Fax</label>'
        +'<input type="text"'
        +' id="fax_'+indek+'"'
        +' size="12">'
        +'</li>'
        
      +'<li><label>E-mail</label>'
        +'<input type="text"'
        +' id="email_'+indek+'"'
        +' size="20">'
        +'</li>'
        
      +'<li><label>Web Site</label>'
        +'<input type="text"'
        +' id="website_'+indek+'"'
        +' size="20">'
        +'</li>'
        
      +'</li>'
      +'</ul>'
    +'</div>'

    +'</details>'
    
    +'<details open>'
    +'<summary>Purchase Defauts</summary>'
    +'<div style="float:left;">'
      +'<ul>'
      +'<li><label>G/L Account<i style="color:red;">&nbsp;*</i></label>'
        +'<input type="text" '
        +' id="gl_account_id_'+indek+'" '
        +' onchange="Vendors.getAccount(\''+indek+'\''
        +',\'gl_account_id_'+indek+'\');")'
        +' size="9" >'
        
        +'<button type="button" '
        +' class="btn_find" '
        +' onclick="Vendors.account.getPaging(\''+indek+'\''
        +',\'gl_account_id_'+indek+'\',-1'
        +',\''+CLASS_EXPENSE+'\');">'
        +'</button>'
        
        +'<input type="text"'
        +' id="gl_account_name_'+indek+'"'
        +' disabled>'
      +'</li>'

      +'<li><label>Tax ID #</label>'
        +'<input type="text"'
        +' id="tax_'+indek+'"'
        +' size="9">'
        +'</li>'
      
      +'<li><label>Ship Via</label>'
        +'<input type="text"'
        +' id="ship_id_'+indek+'"'
        +' size="9">'
        
        +'<button type="button"'
          +' class="btn_find"'
          +' id="btn_ship_'+indek+'"'
          +' onclick="Vendors.shipMethod.getPaging(\''+indek+'\''
          +',\'ship_id_'+indek+'\',-1)"'
        +'</button>'
        +'</li>'
        +'</ul>'
    +'</div>'

    +'<div style="float:right;width:50%;">'
      +'<ul>'
      +'<li><label>Term</label>'
        +'<input type="text"'
        +' id="displayed_'+indek+'"'
        +' disabled size="15">'
        
        +'<button type="button"'
          +' class="btn_find" '
          +' onclick="Vendors.showTerms(\''+indek+'\')"'
          +'</button>'
        +'</li>'
        
      +'<li><label>Credit limit</label>'
        +'<input type="text"'
        +' id="credit_limit_'+indek+'"'
        +' size="9">'
        +'</li>'
    
      +'</ul>'
    +'</div>'
    +'</details>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);

  if (metode===MODE_CREATE){
    document.getElementById('vendor_id_'+indek).focus();
  }else{
    document.getElementById('vendor_id_'+indek).disabled=true;
    document.getElementById('name_'+indek).focus();
  }
  
  Vendors.setDefault(indek);
}

Vendors.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  setEV('gl_account_id_'+indek, d.gl_account_id);
  setEV('gl_account_name_'+indek, d.gl_account_name);
  setEV('displayed_'+indek, d.discount_terms.displayed);
  setEV('credit_limit_'+indek, d.credit_limit);
  bingkai[indek].discount_terms=d.discount_terms;
}

Vendors.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;  
  setEV(id_kolom, data.account_id);
  Vendors.getAccount(indek,id_kolom);
}

Vendors.getAccount=(indek,id_kolom)=>{
  Vendors.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    let nm_account=undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      nm_account=d.name;
    }
    setEV('gl_account_name_'+indek, nm_account);
  });  
}

Vendors.setShipMethod=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.ship_id);
}

Vendors.setTerms=(indek)=>{
  setEV('displayed_'+indek, bingkai[indek].discount_terms.displayed);
}

Vendors.showTerms=(indek)=>{
  bingkai[indek].discount_terms.date='';// param
  bingkai[indek].discount_terms.amount=0;// param
  DiscountTerms.show(indek);
}

Vendors.createExecute=(indek)=>{
  var address=JSON.stringify({
    'name':getEV("name_"+indek),
    'street_1':getEV("street_1_"+indek),
    'street_2':getEV("street_2_"+indek),
    'city':getEV("city_"+indek),
    'state':getEV("state_"+indek),
    'zip':getEV("zip_"+indek),
    'country':getEV("country_"+indek)
  })
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var custom_fields=JSON.stringify(['some note','new vendor']);

  db.execute(indek,{
    query:"INSERT INTO vendors "
      +"(admin_name,company_id,"
      +" vendor_id,name,inactive,"
      +" contact,account,address,"
      +" type,phone,mobile,fax,email,website,"
      +" gl_account_id,tax,ship_id,"
      +" discount_terms,credit_limit,"
      +" custom_fields)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("vendor_id_"+indek)+"'"
      +",'"+getEV("name_"+indek)+"'"
      +",'"+getEC("inactive_"+indek)+"'"
      +",'"+getEV("contact_"+indek)+"'"
      +",'"+getEV("account_"+indek)+"'"
      +",'"+address+"'"
      +",'"+getEV("type_"+indek)+"'"
      +",'"+getEV("phone_"+indek)+"'"
      +",'"+getEV("mobile_"+indek)+"'"
      +",'"+getEV("fax_"+indek)+"'"
      +",'"+getEV("email_"+indek)+"'"
      +",'"+getEV("website_"+indek)+"'"
      +",'"+getEV("gl_account_id_"+indek)+"'"
      +",'"+getEV("tax_"+indek)+"'"
      +",'"+getEV("ship_id_"+indek)+"'"
      +",'"+discount_terms+"'"
      +",'"+getEV("credit_limit_"+indek)+"'"
      +",'"+custom_fields+"'"
      +")"
  });
}

Vendors.readOne=function(indek,callback){
  db.execute(indek,{
    query:"SELECT * "
      +" FROM vendors"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {

      var d=objectOne(paket.fields,paket.data);
      var da=JSON.parse(d.address);
      var dt=JSON.parse(d.discount_terms);

      setEV('vendor_id_'+indek, d.vendor_id);
      setEV('name_'+indek, d.name);
      setEC('inactive_'+indek, d.inactive);

      setEV('contact_'+indek, d.contact);
      setEV('account_'+indek, d.account);
      
      setEV('street_1_'+indek, da.street_1);
      setEV('street_2_'+indek, da.street_2);
      setEV('city_'+indek, da.city);
      setEV('state_'+indek, da.state);
      setEV('zip_'+indek, da.zip);
      setEV('country_'+indek, da.country);
      
      setEV('type_'+indek, d.type);
      setEV('phone_'+indek, d.phone);
      
      setEV('mobile_'+indek, d.mobile);
      setEV('fax_'+indek, d.fax);
      setEV('email_'+indek, d.email);
      setEV('website_'+indek, d.website);
      
      setEV("gl_account_id_"+indek, d.gl_account_id);
      setEV("gl_account_name_"+indek, d.gl_account_name);
      
      setEV("tax_"+indek, d.tax);
      setEV("ship_id_"+indek, d.ship_id);
      
      setEV("displayed_"+indek, dt.displayed);
      setEV("credit_limit_"+indek, d.credit_limit);
      
      bingkai[indek].discount_terms=dt;
      message.none(indek);
    }
    return callback();
  });
}

Vendors.formUpdate=(indek,vendor_id)=>{
  bingkai[indek].vendor_id=vendor_id;
  Vendors.form.modeUpdate(indek);
}

Vendors.updateExecute=(indek)=>{
  var address=JSON.stringify({
    'name':getEV("name_"+indek),
    'street_1':getEV("street_1_"+indek),
    'street_2':getEV("street_2_"+indek),
    'city':getEV("city_"+indek),
    'state':getEV("state_"+indek),
    'zip':getEV("zip_"+indek),
    'country':getEV("country_"+indek)
  })
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var custom_fields=JSON.stringify(['some note','edit vendor']);
  
  db.execute(indek,{
    query:"UPDATE vendors"
      +" SET name='"+getEV("name_"+indek)+"',"
      +" inactive='"+getEC("inactive_"+indek)+"',"
      +" contact='"+getEV("contact_"+indek)+"',"
      +" account='"+getEV("account_"+indek)+"',"
      +" address='"+address+"',"
      +" type='"+getEV("type_"+indek)+"',"
      +" phone='"+getEV("phone_"+indek)+"',"
      +" mobile='"+getEV("mobile_"+indek)+"',"
      +" fax='"+getEV("fax_"+indek)+"',"
      +" website='"+getEV("website_"+indek)+"',"
      +" email='"+getEV("email_"+indek)+"',"
      +" gl_account_id='"+getEV("gl_account_id_"+indek)+"',"
      +" tax='"+getEV("tax_"+indek)+"',"
      +" ship_id='"+getEV("ship_id_"+indek)+"',"
      +" discount_terms='"+discount_terms+"',"
      +" credit_limit='"+getEV("credit_limit_"+indek)+"',"
      +" custom_fields='"+custom_fields+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
  },(p)=>{
    if(p.err.id==0) Vendors.endPath(indek);
  });
}

Vendors.formDelete=(indek,vendor_id)=>{
  bingkai[indek].vendor_id=vendor_id;
  Vendors.form.modeDelete(indek);
}

Vendors.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM vendors"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
  },(p)=>{
    if(p.err.id==0) Vendors.endPath(indek);
  });
}

Vendors.exportExecute=(indek)=>{
  var table_name=Vendors.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);  
}

Vendors.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO vendors"
        +"(admin_name,company_id,"
        +" vendor_id,name,inactive,"
        +" contact,account,address,"
        +" type,phone,mobile,fax,email,website,"
        +" gl_account_id,tax,ship_id,"
        +" discount_terms,credit_limit,"
        +" custom_fields)"
        +"VALUES"
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // vendor_id
        +",'"+d[i][2]+"'" // name
        +",'"+d[i][3]+"'" // inactive
        +",'"+d[i][4]+"'"// contact 
        +",'"+d[i][5]+"'" // account
        +",'"+d[i][6]+"'" // address
        +",'"+d[i][7]+"'" // vendor_type
        +",'"+d[i][8]+"'" // phone
        +",'"+d[i][9]+"'" // mobile
        +",'"+d[i][10]+"'"// fax
        +",'"+d[i][11]+"'"// email
        +",'"+d[i][12]+"'"// website
        +",'"+d[i][13]+"'"// gl_account_id
        +",'"+d[i][14]+"'"// tax
        +",'"+d[i][15]+"'"// ship_id
        +",'"+d[i][16]+"'"// discount_terms
        +",'"+d[i][17]+"'"// credit_limit
        +",'"+d[i][18]+"'"// custom_field
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Vendors.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT vendor_id,name,phone,"
      +" user_name,date_modified"
      +" FROM vendors"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY vendor_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Vendors.selectShow(indek);
  });
}

Vendors.selectShow=function(indek){
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
    +'<th colspan="2">Vendor ID</th>'
    +'<th>Name</th>'
    +'<th>Phone</th>'
    +'<th>User</th>'
    +'<th>Modified</th>'
    +'</tr>';
    
  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
          +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].vendor_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+xHTML(d[x].phone)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'
          +tglInt(d[x].date_modified)
          +'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Vendors.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM vendors "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND vendor_id = '"+d[i].vendor_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Vendors.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM vendors "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR phone LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Vendors.search=(indek)=>{
  Vendors.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,name,phone,"
        +" user_name,date_modified"
        +" FROM vendors"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR phone LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Vendors.readShow(indek);
    });
  });
}

Vendors.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,vendor_id,date_created"
      +" FROM vendors"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Vendors.table_name,"/",
        d.company_id,"/",
        d.vendor_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Vendors.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('vendor_id_'+indek).value;
  document.getElementById('vendor_id_'+indek).disabled=false;
  document.getElementById('vendor_id_'+indek).value=id;
  document.getElementById('vendor_id_'+indek).focus();
}

Vendors.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Vendors.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Vendors.properties(indek);})
  }
}




// eof:645;589;598;708;713;731;748;782;787;
