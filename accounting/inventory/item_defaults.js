/*
 * name: budiono;
 * file: 32;
 * path: accounting/inventory/item_defaults.js;
 * date: sep-06, 20:58, wed-2023; new;
 * edit: sep-16, 10:06, sat-2023; mod size;
 * -----------------------------; happy new year 2024
 * edit: jan-05, 10:20, fri-2024; 
 * edit: jan-09, 18:18, tue-2024; 
 * edit: may-17, 20:48, fri-2024; basic sql;
 * edit: jun-27, 12:52, fri-2024; r3;
 * edit: jul-28, 07:44, sun-2024; r11;
 * edit: sep-10, 21:13, tue-2024; r18;
 * edit: dec-23, 21:22, mon-2024; #32; properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-20, 11:23, thu-2025; #41 file_blok;
 * edit: mar-11, 15:13, tue-2025; #43; deep folder;
 * edit: mar-25, 23:17, tue-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:28, thu-2025; #50; export to csv;
 * edit: nov-20, 17:48, thu-2025; #81;
 */ 
 
'use strict';

var ItemDefaults={};

ItemDefaults.table_name='item_defaults';
ItemDefaults.itemTax=new ItemTaxesLook(ItemDefaults);
ItemDefaults.location=new LocationLook(ItemDefaults);
ItemDefaults.account=new AccountLook(ItemDefaults);

ItemDefaults.show=(tiket)=>{
  tiket.modul=ItemDefaults.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        ItemDefaults.formUpdate(indek);
      });
    });
  }else{
    show(baru);
  }
}

ItemDefaults.formEntry=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  var html='<div style="margin:1rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
      +'<ul>'
        +'<li>'
          +'<label>Cost Method:</label>'
          +'<select id="cost_method_'+indek+'"'
          +' name="element_disabled_'+indek+'">'
            +getCostMethod(indek)
          +'</select>'
        +'</li>'
        +'<li>'
          +'<label>Item Tax ID:</label>'
            +'<input type="text"'
            +' id="tax_id_'+indek+'" '
            +' name="element_disabled_'+indek+'" '
            +' style="text-align:center"'
            +' size="5">'
          
          +'<button type="button" '
            +' id="btn_find" '
            +' name="element_disabled_'+indek+'" '
            +' onclick="ItemDefaults.itemTax.getPaging(\''+indek+'\''
            +',\'tax_id_'+indek+'\''
            +',-1);">'
            +'</button>'
        +'</li>'
        
        +'<li>'
          +'<label>Location ID:</label>'
          +'<input type="text" '
            +' id="location_id_'+indek+'"'
            +' name="element_disabled_'+indek+'"'
            +' onchange="ItemDefaults.getLocation(\''+indek+'\''
            +',\'location_id_'+indek+'\')"'
            +'size="9">'
          
          +'<button type="button" '
            +' id="location_btn_'+indek+'"'
            +' class="btn_find" '
            +' name="element_disabled_'+indek+'"'
            +' onclick="ItemDefaults.location.getPaging(\''+indek+'\''
            +',\'location_id_'+indek+'\''
            +',-1 );">'
          +'</button>'
          
          +'<input type="text"'
          +' id="location_name_'+indek+'" disabled>'
        +'</li>'
      +'</ul>'
              
      +'<details open style="margin-bottom:10px;">'
      +'<summary>Inventory Item Default Details</summary>'          
        
        +'<p>'
        +'<label>Item Class</label>'
        +'<select id="item_class_'+indek+'" '
        +' name="element_disabled_'+indek+'"'
        +' onchange="ItemDefaults.itemClassMode(this.value,\''+indek+'\')">'
        +getItemClass(indek)
        +'</select>'
        +'</p>'
        
        +'<ul>'          
        +'<li><label>Sales Account:</label>'
          +'<input type="text" '
          +' id="sales_account_id_'+indek+'" '
          +' name="element_disabled2_'+indek+'" '
          +' onchange="ItemDefaults.getAccount(\''+indek+'\''
          +',\'sales_account_id_'+indek+'\')"'
          +' size="8">'

          +'<button type="button" class="btn_find" '
            +' id="sales_btn_'+indek+'" '
            +' name="element_disabled2_'+indek+'" '
            +' onclick="ItemDefaults.account.getPaging(\''+indek+'\''
            +',\'sales_account_id_'+indek+'\',-1'
            +',\''+CLASS_INCOME+'\');">'
          +'</button>'
          
          +'<input type="text"'
          +' id="sales_account_name_'+indek+'" disabled>'
          +'</li>'

        +'<li><label>Inventory Acct:</label>'
          +'<input type="text"'
          +' id="inventory_account_id_'+indek+'"'
          +' name="element_disabled2_'+indek+'" '
          +' onchange="ItemDefaults.getAccount(\''+indek+'\''
          +',\'inventory_account_id_'+indek+'\')" '
          +' size="8">'

          +'<button type="button" class="btn_find" '
            +' id="inventory_btn_'+indek+'" '
            +' name="element_disabled2_'+indek+'" '
            +' onclick="ItemDefaults.account.getPaging(\''+indek+'\''
            +',\'inventory_account_id_'+indek+'\',-1'
            +',\''+CLASS_ASSET+'\');">'
          +'</button>'

          +'<input type="text" '
          +' id="inventory_account_name_'+indek+'" disabled>'
          +'</li>'

        +'<li><label>Wage Acct:.</label>'
          +'<input type="text"'
          +' id="wage_account_id_'+indek+'" '
          +' name="element_disabled2_'+indek+'" '
          +' onchange="ItemDefaults.getAccount(\''+indek+'\''
          +',\'wage_account_id_'+indek+'\')"'
          +' size="8">'
          
          +'<button type="button" class="btn_find" '
            +' id="wage_btn_'+indek+'" '
            +' name="element_disabled2_'+indek+'" '
            +' onclick="ItemDefaults.account.getPaging(\''+indek+'\''
            +',\'wage_account_id_'+indek+'\',-1'
            +',\''+CLASS_EXPENSE+'\');">'
          +'</button>'
          
          +'<input type="text" '
          +' id="wage_account_name_'+indek+'" disabled>'
          +'</li>'

        +'<li><label>COGS Acct:</label>'
          +'<input type="text"'
          +' id="cogs_account_id_'+indek+'" '
          +' name="element_disabled2_'+indek+'" '
          +' onchange="ItemDefaults.getAccount(\''+indek+'\''
          +',\'cogs_account_id_'+indek+'\')"'
          +' size="8">'
          
          +'<button type="button" class="btn_find" '
            +' id="cogs_btn_'+indek+'" '
            +' name="element_disabled2_'+indek+'" '
            +' onclick="ItemDefaults.account.getPaging(\''+indek+'\''
            +',\'cogs_account_id_'+indek+'\',-1'
            +',\''+CLASS_COST_OF_SALES+'\');">'
          +'</button>'
          
          +'<input type="text" '
          +' id="cogs_account_name_'+indek+'" disabled>'
          +'</li>'
          
        +'<li><label>Income Acct:</label>'
          +'<input type="text"'
          +' id="income_account_id_'+indek+'"'
          +' name="element_disabled2_'+indek+'" '
          +' onchange="ItemDefaults.getAccount(\''+indek+'\''
          +',\'income_account_id_'+indek+'\')"'
          +' size="8">'
          
          +'<button type="button" class="btn_find" '
            +' id="income_btn_'+indek+'" '
            +' name="element_disabled2_'+indek+'" '
            +' onclick="ItemDefaults.account.getPaging(\''+indek+'\''
            +',\'income_account_id_'+indek+'\',-1'
            +',\''+CLASS_INCOME+'\');">'
          +'</button>'
          
          +'<input type="text" id="income_account_name_'+indek+'" '
            +' disabled>'
          +'</li>'
        +'</ul>'
        
      +'</details>'
      
      +'<ul>'        
        +'<li>'
          +'<label>Freight Acct.:</label>'
          +'<input type="text"'
          +' id="freight_account_id_'+indek+'" '
          +' name="element_disabled_'+indek+'" '
          +' onchange="ItemDefaults.getAccount(\''+indek+'\''
          +',\'freight_account_id_'+indek+'\')"'
          +' size="8">'

          +'<button type="button" '
            +' class="btn_find" '
            +' id="freight_account_btn_'+indek+'"'
            +' name="element_disabled_'+indek+'"'
            +' onclick="ItemDefaults.account.getPaging(\''+indek+'\''
            +',\'freight_account_id_'+indek+'\',-1'
            +',\''+CLASS_EXPENSE+'\');">'
          +'</button>'
          
          +'<input type="text"'
          +' id="freight_account_name_'+indek+'" disabled>'
          
        +'</li>'
      +'</ul>'
      
    +'</form>'
  +'</div>';
    
  content.html(indek,html);
  document.getElementById("location_id_"+indek).focus;
//  setEV("company_id_"+indek,bingkai[indek].company.id );
  ItemDefaults.itemClassMode(0,indek);
}

ItemDefaults.view=(indek,lock)=>{
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
    //VendorDefaults.mode2(indek);
    var mode=document.getElementById('item_class_'+indek).selectedIndex;
    // alert(mode);
    ItemDefaults.itemClassMode(mode,indek);
  }
}

ItemDefaults.itemClassMode=(mode,indek)=>{
  var isi=bingkai[indek].default_detail[mode];
  
  document.getElementById('sales_account_id_'+indek).disabled=true;
  document.getElementById('sales_btn_'+indek).disabled=true;
  document.getElementById('inventory_account_id_'+indek).disabled=true;
  document.getElementById('inventory_btn_'+indek).disabled=true;
  document.getElementById('wage_account_id_'+indek).disabled=true;
  document.getElementById('wage_btn_'+indek).disabled=true;
  document.getElementById('cogs_account_id_'+indek).disabled=true;
  document.getElementById('cogs_btn_'+indek).disabled=true;
  document.getElementById('income_account_id_'+indek).disabled=true;
  document.getElementById('income_btn_'+indek).disabled=true;

  // set values
  setEV('sales_account_id_'+indek,isi.sales_account_id);
  setEV('sales_account_name_'+indek,isi.sales_account_name);
  setEV('inventory_account_id_'+indek,isi.inventory_account_id);
  setEV('inventory_account_name_'+indek,isi.inventory_account_name);
  setEV('wage_account_id_'+indek,isi.wage_account_id);
  setEV('wage_account_name_'+indek,isi.wage_account_name);
  setEV('cogs_account_id_'+indek,isi.cogs_account_id);
  setEV('cogs_account_name_'+indek,isi.cogs_account_name);
  setEV('income_account_id_'+indek,isi.income_account_id);
  setEV('income_account_name_'+indek,isi.income_account_name);
  
  if(mode==0 || mode==5){//0-stock & 5-Assembly
    document.getElementById('sales_account_id_'+indek).disabled=false;
    document.getElementById('sales_btn_'+indek).disabled=false;
    document.getElementById('inventory_account_id_'+indek).disabled=false;
    document.getElementById('inventory_btn_'+indek).disabled=false;
    document.getElementById('cogs_account_id_'+indek).disabled=false;
    document.getElementById('cogs_btn_'+indek).disabled=false;
  }
  if(mode==1){//1-Non-stock item
    document.getElementById('sales_account_id_'+indek).disabled=false;
    document.getElementById('sales_btn_'+indek).disabled=false;
    document.getElementById('wage_account_id_'+indek).disabled=false;
    document.getElementById('wage_btn_'+indek).disabled=false;
    document.getElementById('cogs_account_id_'+indek).disabled=false;
    document.getElementById('cogs_btn_'+indek).disabled=false;
  }
  if(mode==2){//2-Description only
  }
  if(mode==3 || mode==4){// 3-Service & 4-Labor
    document.getElementById('sales_account_id_'+indek).disabled=false;
    document.getElementById('sales_btn_'+indek).disabled=false;
    document.getElementById('wage_account_id_'+indek).disabled=false;
    document.getElementById('wage_btn_'+indek).disabled=false;
    document.getElementById('cogs_account_id_'+indek).disabled=false;
    document.getElementById('cogs_btn_'+indek).disabled=false;
  }
  if(mode==6 || mode==7){//6-Activity item & 7-Charge item
    document.getElementById('income_account_id_'+indek).disabled=false;
    document.getElementById('income_btn_'+indek).disabled=false;
  }
}

ItemDefaults.formUpdate=(indek)=>{
  bingkai[indek].default_detail=[];
  for(var i=0;i<8;i++){
    bingkai[indek].default_detail[i]={
      "sales_account_id":'',
      "sales_account_name":'',
      "inventory_account_id":'',
      "inventory_account_name":'',
      "wage_account_id":'',
      "wage_account_name":'',
      "cogs_account_id":'',
      "cogs_account_name":'',
      "income_account_id":'',
      "income_account_name":'',
    }
  }
  
  ItemDefaults.formEntry(indek);
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  toolbar.refresh(indek,()=>{ItemDefaults.formUpdate(indek);});
  ItemDefaults.readOne(indek,()=>{
    toolbar.edit(indek,()=>{ItemDefaults.formEdit(indek);});
    toolbar.download(indek,()=>{ItemDefaults.formExport(indek);});
    toolbar.upload(indek,()=>{ItemDefaults.formImport(indek);});
    ItemDefaults.view(indek,true);
  });
}

ItemDefaults.formEdit=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ItemDefaults.formUpdate(indek);});
  toolbar.save(indek,()=>ItemDefaults.saveExecute(indek));
  toolbar.delet(indek,()=>ItemDefaults.deleteExecute(indek));
  toolbar.properties(indek,()=>ItemDefaults.properties(indek));
  ItemDefaults.view(indek,false);
}

ItemDefaults.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT *"
      +" FROM item_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('tax_id_'+indek,d.tax_id);
      setEV('location_id_'+indek,d.location_id);
      setEV('location_name_'+indek,d.location_name);
      setEV('freight_account_id_'+indek,d.freight_account_id);
      setEV('freight_account_name_'+indek,d.freight_account_name);
      setEI('cost_method_'+indek,d.cost_method);
      setEI('item_class_'+indek,d.item_class);
      
      bingkai[indek].default_detail=JSON.parse(d.detail);
      ItemDefaults.itemClassMode(d.item_class,indek);
    }else{
      
    }
    message.none(indek);
    return callback();
  });
}

ItemDefaults.setItemTaxes=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.tax_id);
}

ItemDefaults.setLocation=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;

  setEV(id_kolom, data.location_id);
  ItemDefaults.getLocation(indek,id_kolom);
}

ItemDefaults.getLocation=(indek,id_kolom)=>{
  setEV('location_name_'+indek, txt_undefined);
  ItemDefaults.location.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('location_name_'+indek, d.name);
    }
  });
}

ItemDefaults.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  
  setEV(id_kolom, data.account_id);
  ItemDefaults.getAccount(indek,id_kolom,nama_kolom);
}

ItemDefaults.getAccount=(indek,id_kolom)=>{
  var kelas=getEI('item_class_'+indek);
  var isi={};
  
  ItemDefaults.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    var nm_account=txt_undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields, paket.data);
      nm_account=d.name;
    }
    isi=bingkai[indek].default_detail[kelas];

    switch(id_kolom){
      case "sales_account_id_"+indek:
        setEV('sales_account_name_'+indek, nm_account);
        isi.sales_account_id=getEV('sales_account_id_'+indek);
        isi.sales_account_name=getEV('sales_account_name_'+indek);
        break;
      case "inventory_account_id_"+indek:
        setEV('inventory_account_name_'+indek, nm_account);
        isi.inventory_account_id=getEV('inventory_account_id_'+indek);
        isi.inventory_account_name=getEV('inventory_account_name_'+indek);
        break;
      case "wage_account_id_"+indek:
        setEV('wage_account_name_'+indek, nm_account);
        isi.wage_account_id=getEV('wage_account_id_'+indek);
        isi.wage_account_name=getEV('wage_account_name_'+indek);
        break;
      case "cogs_account_id_"+indek:
        setEV('cogs_account_name_'+indek, nm_account);
        isi.cogs_account_id=getEV('cogs_account_id_'+indek);
        isi.cogs_account_name=getEV('cogs_account_name_'+indek);
        break;
      case "income_account_id_"+indek:
        setEV('income_account_name_'+indek, nm_account);
        isi.income_account_id=getEV('income_account_id_'+indek);
        isi.income_account_name=getEV('income_account_name_'+indek);
        break;
      case "freight_account_id_"+indek:
        setEV('freight_account_name_'+indek, nm_account);
        break;
      default:
        alert(id_kolom+' undefined. ')
    }
    bingkai[indek].default_detail[kelas]=isi;
  });
}

ItemDefaults.saveExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM item_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.count==0){
      ItemDefaults.createExecute(indek);
    }else{
      ItemDefaults.updateExecute(indek);
    }
  });
}

ItemDefaults.createExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].default_detail);

  db.execute(indek,{
    query:"INSERT INTO item_defaults "
      +"(admin_name,company_id,cost_method,tax_id,location_id,"
      +" item_class,detail,freight_account_id) "
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEI('cost_method_'+indek)+"'"
      +",'"+getEV('tax_id_'+indek)+"'"
      +",'"+getEV('location_id_'+indek)+"'"
      +",'"+getEV('item_class_'+indek)+"'"
      +",'"+detail+"'"
      +",'"+getEV('freight_account_id_'+indek)+"'"
      +")"
  },(p)=>{
    bingkai[indek].metode=MODE_CREATE;
    if(p.err.id==0) ItemDefaults.bentukAkhir(indek);
  });
}

ItemDefaults.updateExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].default_detail);
  
  db.execute(indek,{
    query:"UPDATE item_defaults "
      +" SET cost_method='"+getEI('cost_method_'+indek)+"', "
      +" tax_id='"+getEV('tax_id_'+indek)+"', "
      +" location_id='"+getEV('location_id_'+indek)+"', "
      +" item_class='"+getEI('item_class_'+indek)+"', "
      +" detail='"+detail+"', "
      +" freight_account_id='"+getEV('freight_account_id_'+indek)+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    bingkai[indek].metode=MODE_UPDATE;
    if(p.err.id==0) ItemDefaults.bentukAkhir(indek);
  });
}

ItemDefaults.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM item_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    bingkai[indek].metode=MODE_DELETE;
    if(p.err.id==0) ItemDefaults.bentukAkhir(indek);
  });
}

ItemDefaults.formExport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>ItemDefaults.formUpdate(indek));
  ItemDefaults.exportExecute(indek);
}

ItemDefaults.exportExecute=(indek)=>{
/*  
  var sql={
    "select": "company_id,"
      +"cost_method,tax_id,location_id,"
      +"item_class,detail,freight_account_id",
    "from": "item_defaults",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'item_defaults');
*/  
  var table_name=ItemDefaults.table_name;
  var sql=sqlDatabase2(indek, table_name);
  DownloadEmpat.display(indek, sql, table_name);
}

ItemDefaults.formImport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ItemDefaults.formUpdate(indek);});
  iii.uploadJSON(indek);
}

ItemDefaults.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO item_defaults "
      +"(admin_name,company_id, "
      +" cost_method,tax_id,location_id, "
      +" item_class,detail,freight_account_id) "
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // cost_method
      +",'"+d[i][2]+"'" // tax_id
      +",'"+d[i][3]+"'" // location_id
      +",'"+d[i][4]+"'" // item_class
      +",'"+d[i][5]+"'" // detail
      +",'"+d[i][6]+"'" // freight_account_id
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

ItemDefaults.getDefault=(indek)=>{
  let data_default={
    "cost_method":0,
    "tax_id":'',
    "location_id":'',
    "item_class":0,
    "detail":[],
    "freight_account_id":''
  };

  for(var i=0;i<8;i++){
    data_default.detail.push({
      "sales_account_id":'',
      "sales_account_name":'',
      "inventory_account_id":'',
      "inventory_account_name":'',
      "wage_account_id":'',
      "wage_account_name":'',
      "cogs_account_id":'',
      "cogs_account_name":'',
      "income_account_id":'',
      "income_account_name":'',
    })
  }
  
  db.run(indek,{
    query:"SELECT *"
      +" FROM item_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.count>0){ 
      var d=objectOne(paket.fields,paket.data);
      d.detail=JSON.parse(d.detail);
      bingkai[indek].data_default=d;
    }else{
      bingkai[indek].data_default=data_default;
    }
  });
}

ItemDefaults.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,date_created"
      +" FROM item_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        ItemDefaults.table_name,"/",
        d.company_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

ItemDefaults.bentukAkhir=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ItemDefaults.formUpdate(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ItemDefaults.properties(indek);})
  }
}




// eof:531;570;578;631;635;636;633;
