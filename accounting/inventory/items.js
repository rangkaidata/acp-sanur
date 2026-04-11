/*
 * auth: budiono;
 * file: E2
 * path: /accounting/inventory/items.js;
 * ------------------------------------;
 * date: sep-11, 12:08, mon-2023; new;
 * edit: sep-16, 15:16, sat-2023; size obj;
 * edit: dec-27, 08:58, wed-2023; add select button;
 * edit: dec-30, 10:18, sat-2023; new pagingAndLimit;
 * -----------------------------; happy new year 2024;
 * edit: jan-05, 15:26, fri-2024; 
 * edit: jan-09, 20:25, tue-2024; 
 * edit: feb-04, 07:25, sun-2024; cek-standar;
 * edit: feb-27, 09:06, mon-2024; tambah unit_cost;
 * edit: may-24, 16:46, fri-2024; BasicSQL;
 * edit: jun-30, 16:29, sun-2024; r4;
 * edit: sep-11, 12:34, wed-2024; r18; 
 * edit: nov-24, 17:04, sun-2024; #27; add locker;
 * edit: nov-30, 19:54, sat-2024; #27;
 * edit: dec-02, 13:07, mon-2024; #27;
 * edit: dec-24, 12:33, tue-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-21, 15:47, fri-2025; #41; file_id;
 * edit: mar-11, 17:19, tue-2025; #43; deep-folder;
 * edit: mar-26, 00:13, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:06, thu-2025; #50; can export to csv;
 * edit: aug-20, 14:39, wed-2025; #69; add buyer ID;
 */
  
'use strict';

var Items={};

Items.table_name='items';
Items.form=new ActionForm2(Items);
Items.location=new LocationLook(Items);
Items.tax=new ItemTaxesLook(Items);
Items.account=new AccountLook(Items);
Items.vendor=new VendorLook(Items);
Items.buyer=new BuyersLook(Items);

Items.show=(tiket)=>{

  tiket.modul=Items.table_name;

  var baru=exist(tiket);
  if(baru==-1){
    var newItm=new BingkaiUtama(tiket);
    var indek=newItm.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Items.form.modePaging(indek);
        Items.getDefault(indek);
      });
    });
  }else{
    show(baru);
  }
}

Items.count=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT COUNT(*)"
      +" FROM items"
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

Items.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Items.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT item_id,name,class,"
        +" user_name,date_modified"
        +" FROM items"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY item_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Items.readShow(indek);
    });
  })
}

Items.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)  
    +'<table border=1>'
      +'<tr>'
        +'<th colspan="2">Item ID</th>'
        +'<th>Description</th>'
        +'<th>Class</th>'
        +'<th align="center">User</th>'
        +'<th>Modified</th>'
        +'<th colspan="3">Action</th>'
      +'</tr>';

  if (p.err.id===0){
    for (var x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tHTML(d[x].item_id)+'</td>'
        +'<td align="left">'+tHTML(d[x].name)+'</td>'
        +'<td align="center">'+default_item_class[d[x].class]
          +'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_change" '
          +' onclick="Items.formUpdate(\''+indek+'\''
          +',\''+d[x].item_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_delete" '
          +' onclick="Items.formDelete(\''+indek+'\''
          +',\''+d[x].item_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Items.form.addPagingFn(indek);
}

Items.getDefault=(indek)=>{
  ItemDefaults.getDefault(indek);
}

Items.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;

  var html=''
    +'<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<inline-circle></inline-circle>'
    +'<form autocomplete="off" style="margin-bottom:10px;">'
    
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:20px;">'
    
      +'<div>'
        +'<ul>'
        +'<li><label>Item ID<i class="required">*</i>:</label>'
          +'<input type="text" '
          +' id="item_id_'+indek+'" '
          +' size="20"></li>'
          
        +'<li><label>Description:</label>'
          +'<input type="text" '
          +' id="item_name_'+indek+'" '
          +' placeholder="for inventory ..."'
          +' size="40"></li>'
          
        +'<li><label>&nbsp;</label>'
          +'<input type="text" '
          +' id="name_for_sales_'+indek+'" '
          +' size="40" '
          +' placeholder="for Sales ..."></li>'
          
        +'<li><label>&nbsp;</label>'
          +'<input type="text" '
          +' id="name_for_purchases_'+indek+'" '
          +' size="40" '
          +' placeholder="for purchases ..."></li>'
        +'</ul>'
      +'</div>'
      
      +'<div>'    
        +'<ul>'
        +'<li><label>Item Class:</label>'
          +'<select id="item_class_'+indek+'" '
          +' onchange="Items.itemClassMode(this.value,\''+indek+'\')">'
          +getItemClass(indek)
          +'</select>'
          +'</li>'
        
        +'<li><label>&nbsp;</label>'
          +'<label><input type="checkbox" '
          +' id="item_inactive_'+indek+'" '
          +' value="Inactive">Inactive</label></li>'
        +'</ul>'
      +'</div>'
    +'</div>'
    
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:20px;">'
    
    +'<div>'
      +'<ul>'
        +'<li><label>Unit/Measure:</label>'
          +'<input type="text"'
          +' id="unit_measure_'+indek+'"'
          +' size="7" >'
        +'</li>'
        
        +'<li><label>Item Type:</label>'
          +'<input type="text"'
          +' id="item_type_'+indek+'"'
          +' size="7" >'
        +'</li>'

        +'<li><label>Location ID:</label>'
          +'<input type="text" '
          +' id="location_id_'+indek+'" '
          +' style="text-align:center"'
          +' size="7" >'

          +'<button type="button" '
            +' onclick="Items.location.getPaging(\''+indek+'\''
            +',\'location_id_'+indek+'\''
            +',-1 );"'
            +' class="btn_find" >'
          +'</button>'
          +'</li>'

        +'<li><label>Unit Cost:</label>'
          +'<input type="text" '
          +' id="unit_cost_'+indek+'" '
          +' style="text-align:center"'
          +' size="7" >'
        +'</li>'

      +'</ul>'
    +'</div>'
    
    +'<div>'
      +'<ul>'
      +'<li><label>Sales Account:</label>'
        +'<input type="text" '
        +' id="sales_account_id_'+indek+'" '
        +' onchange="Items.getAccount(\''+indek+'\''
        +',\'sales_account_id_'+indek+'\')"'
        +' size="8" >'

        +'<button type="button" '
          +'class="btn_find" '
          +' id="sales_btn_'+indek+'"'
          +' onclick="Items.account.getPaging(\''+indek+'\''
          +',\'sales_account_id_'+indek+'\',-1'
          +',\''+CLASS_INCOME+'\');" >'
        +'</button>'
        
        +'<input type="text"'
        +' id="sales_account_name_'+indek+'" disabled>'
        +'</li>'

      +'<li><label>Inventory Acct:</label>'
        +'<input type="text" '
        +' id="inventory_account_id_'+indek+'"'
        +' onchange="Items.getAccount(\''+indek+'\''
        +',\'inventory_account_id_'+indek+'\')"'
        +' size="8" >'

        +'<button type="button" '
          +'class="btn_find" '
          +' id="inventory_btn_'+indek+'"'
          +' onclick="Items.account.getPaging(\''+indek+'\''
          +',\'inventory_account_id_'+indek+'\',-1'
          +',\''+CLASS_ASSET+'\');" >'
        +'</button>'

        +'<input type="text" '
        +' id="inventory_account_name_'+indek+'" disabled>'
        +'</li>'

      +'<li><label>Wage Acct:.</label>'
        +'<input type="text" '
        +' id="wage_account_id_'+indek+'" '
        +' onchange="Items.getAccount(\''+indek+'\''
        +',\'wage_account_id_'+indek+'\')"'
        +' size="8" >'
        
        +'<button type="button" '
          +' class="btn_find" '
          +' id="wage_btn_'+indek+'" '
          +' onclick="Items.account.getPaging(\''+indek+'\''
          +',\'wage_account_id_'+indek+'\',-1'
          +',\''+CLASS_EXPENSE+'\');" >'
        +'</button>'
        
        +'<input type="text"'
        +' id="wage_account_name_'+indek+'"'
        +' disabled>'
        +'</li>'

      +'<li><label>COGS Acct:</label>'
        +'<input type="text" '
        +' id="cogs_account_id_'+indek+'" '
        +' onchange="Items.getAccount(\''+indek+'\''
        +',\'cogs_account_id_'+indek+'\')"'
        +' size="8" >'
        
        +'<button type="button" '
          +' class="btn_find" '
          +' id="cogs_btn_'+indek+'" '
          +' onclick="Items.account.getPaging(\''+indek+'\''
          +',\'cogs_account_id_'+indek+'\',-1'
          +',\''+CLASS_COST_OF_SALES+'\');" >'
        +'</button>'
        
        +'<input type="text"'
        +' id="cogs_account_name_'+indek+'"'
        +' disabled>'
        +'</li>'
        
      +'<li><label>Income Acct:</label>'
        +'<input type="text" '
        +' id="income_account_id_'+indek+'"'
        +' onchange="Items.getAccount(\''+indek+'\''
        +',\'income_account_id_'+indek+'\')"'
        +' size="8" >'
        
        +'<button type="button" '
          +' class="btn_find" '
          +' id="income_btn_'+indek+'" '
          +' onclick="Items.account.getPaging(\''+indek+'\''
          +',\'income_account_id_'+indek+'\',-1'
          +',\''+CLASS_INCOME+'\');" >'
        +'</button>'
        
        +'<input type="text"'
        +' id="income_account_name_'+indek+'"'
        +' disabled>'
        +'</li>'
      +'</ul>'
    +'</div>'
    +'</div>'

    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:20px;">'
    +'<div>'
      +'<ul>'
      +'<li>'
        +'<label>Cost Method:</label>'
        +'<select id="cost_method_'+indek+'">'
          +getCostMethod(indek)
        +'</select>'
      +'</li>'
      
      +'<li><label>Item Tax ID:</label>'
        +'<input type="text" '
        +' id="tax_id_'+indek+'" '
        +' style="text-align:center"'
        +' size="5">'

        +'<button type="button"'
          +' id="tax_btn_'+indek+'" '
          +' class="btn_find" '
          +' onclick="Items.tax.getPaging(\''+indek+'\''
          +',\'tax_id_'+indek+'\',-1);" >'
        +'</button>'

        +'</li>'
      +'</ul>'
    +'</div>'

    +'<div>'
      +'<ul>'
      
      +'<li><label>Minimum Stock:</label>'
        +'<input type="text"'
        +' id="minimum_stock_'+indek+'" '
        +' style="text-align:center"'
        +' size="5">'
        +'</li>'
        
      +'<li><label>Reorder Qty:</label>'
        +'<input type="text" '
        +' id="reorder_quantity_'+indek+'" '
        +' style="text-align:center"'
        +' size="5">'
        +'</li>'

      +'<li><label>Vendor ID:</label>'
        +'<input type="text" '
          +' id="vendor_id_'+indek+'" '
          +' onchange="Items.getVendor(\''+indek+'\''
          +',\'vendor_id_'+indek+'\')"'
          +' size="10">'

        +'<button type="button"'
          +' class="btn_find"'
          +' onclick="Items.vendor.getPaging(\''+indek+'\''
          +',\'vendor_id_'+indek+'\',-1);" >'
        +'</button>'

        +'<input type="text" '
          +' id="vendor_name_'+indek+'" disabled '
          +' style="width:160px;">'
      +'</li>'
      
      +'<li><label>Buyer ID:</label>'
        +'<input type="text" '
          +' id="buyer_id_'+indek+'" '
          +' onchange="Items.getBuyer(\''+indek+'\''
          +',\'buyer_id_'+indek+'\')"'
          +' size="10">'

        +'<button type="button"'
          +' class="btn_find"'
          +' onclick="Items.buyer.getPaging(\''+indek+'\''
          +',\'buyer_id_'+indek+'\',-1);" >'
        +'</button>'

        +'<input type="text" '
          +' id="buyer_name_'+indek+'" disabled '
          +' style="width:160px;">'
      +'</li>'
        
      +'</ul>'
    +'</div>'
    +'</div>'
    
    +'</form>'
    +'</div>';

// percobaan CREATE COMPONENT-----------------------------------------//
//  html+='<location-box indek="'+indek+'"></location-box>'
//--------------------------------------------------------------------//

  content.html(indek,html);
  statusbar.ready(indek);

  if (metode===MODE_CREATE){
    document.getElementById('item_id_'+indek).focus();
  }else{
    document.getElementById('item_id_'+indek).disabled=true;
    document.getElementById('item_class_'+indek).disabled=true;
    document.getElementById('cost_method_'+indek).disabled=true;
    document.getElementById('item_name_'+indek).focus();
    
  }
  Items.itemClassMode(0,indek);
  
  Items.setDefault(indek);
}

Items.itemClassMode=(mode,indek)=>{
  document.getElementById('sales_account_id_'+indek).disabled=true;
  document.getElementById('inventory_account_id_'+indek).disabled=true;
  document.getElementById('wage_account_id_'+indek).disabled=true;
  document.getElementById('cogs_account_id_'+indek).disabled=true;
  document.getElementById('income_account_id_'+indek).disabled=true;
  
  document.getElementById('sales_btn_'+indek).disabled=true;
  document.getElementById('inventory_btn_'+indek).disabled=true;
  document.getElementById('wage_btn_'+indek).disabled=true;
  document.getElementById('cogs_btn_'+indek).disabled=true;
  document.getElementById('income_btn_'+indek).disabled=true;
  
  if(mode==0 || mode==5){//0-stock & 5-Assembly
    document.getElementById('sales_account_id_'+indek).disabled=false;
    document.getElementById('inventory_account_id_'+indek).disabled=false;
    document.getElementById('cogs_account_id_'+indek).disabled=false;
    document.getElementById('sales_btn_'+indek).disabled=false;
    document.getElementById('inventory_btn_'+indek).disabled=false;
    document.getElementById('cogs_btn_'+indek).disabled=false;
  }
  if(mode==1){//1-Non-stock item
    document.getElementById('sales_account_id_'+indek).disabled=false;
    document.getElementById('wage_account_id_'+indek).disabled=false;
    document.getElementById('cogs_account_id_'+indek).disabled=false;
    document.getElementById('sales_btn_'+indek).disabled=false;
    document.getElementById('wage_btn_'+indek).disabled=false;
    document.getElementById('cogs_btn_'+indek).disabled=false;
  }
  if(mode==2){//2-Description only
  }
  if(mode==3 || mode==4){// 3-Service & 4-Labor
    document.getElementById('sales_account_id_'+indek).disabled=false;
    document.getElementById('wage_account_id_'+indek).disabled=false;
    document.getElementById('cogs_account_id_'+indek).disabled=false;
    document.getElementById('sales_btn_'+indek).disabled=false;
    document.getElementById('wage_btn_'+indek).disabled=false;
    document.getElementById('cogs_btn_'+indek).disabled=false;
  }
  if(mode==6 || mode==7){//6-Activity item & 7-Charge item
    document.getElementById('income_account_id_'+indek).disabled=false;
    document.getElementById('income_btn_'+indek).disabled=false;
  }
  
  if(bingkai[indek].metode==MODE_CREATE){
    Items.setAccountDefault(indek,mode)
  }
}

Items.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  setEV('tax_id_'+indek,d.tax_id);
  setEV('cost_method_'+indek,d.cost_method);
  setEV('item_class_'+indek,d.item_class);
  Items.setAccountDefault(indek,d.item_class);
  Items.itemClassMode(d.item_class,indek);
}

Items.setAccountDefault=(indek,nomer)=>{
  var dd=bingkai[indek].data_default.detail;
  var isi=dd[nomer];
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
}

Items.setLocation=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.location_id);
}

Items.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  setEV(id_kolom, data.account_id);
  Items.getAccount(indek,id_kolom,nama_kolom);
}

Items.setBuyer=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  setEV(id_kolom, data.buyer_id);
  Items.getBuyer(indek,id_kolom,nama_kolom);
}

Items.getBuyer=(indek,id_kolom)=>{
  setEV('buyer_name_'+indek, txt_undefined);
  Items.buyer.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('buyer_name_'+indek, d.buyer_name);
    }
  });
}

Items.createExecute=(indek)=>{
  
  db.execute(indek,{
    query:"INSERT INTO items"
    +"(admin_name,company_id,"
    +" item_id,name,name_for_sales,name_for_purchases,"
    +" class,inactive,"
    +" unit_measure,type,location_id,unit_cost,"
    +" sales_account_id,inventory_account_id,wage_account_id,"
    +" cogs_account_id,income_account_id,"
    +" cost_method,tax_id,"
    +" minimum_stock,reorder_quantity,vendor_id,buyer_id"
    +" custom_fields)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("item_id_"+indek)+"'"
    +",'"+getEV("item_name_"+indek)+"'"
    +",'"+getEV("name_for_sales_"+indek)+"'"
    +",'"+getEV("name_for_purchases_"+indek)+"'"
    +",'"+getEI("item_class_"+indek)+"'"
    +",'"+getEC("item_inactive_"+indek)+"'"
    +",'"+getEV("unit_measure_"+indek)+"'"
    +",'"+getEV("item_type_"+indek)+"'"
    +",'"+getEV("location_id_"+indek)+"'"
    +",'"+getEV("unit_cost_"+indek)+"'"
    +",'"+getEV("sales_account_id_"+indek)+"'"
    +",'"+getEV("inventory_account_id_"+indek)+"'"
    +",'"+getEV("wage_account_id_"+indek)+"'"
    +",'"+getEV("cogs_account_id_"+indek)+"'"
    +",'"+getEV("income_account_id_"+indek)+"'"
    +",'"+getEI("cost_method_"+indek)+"'"
    +",'"+getEV("tax_id_"+indek)+"'"
    +",'"+getEV("minimum_stock_"+indek)+"'"
    +",'"+getEV("reorder_quantity_"+indek)+"'"
    +",'"+getEV("vendor_id_"+indek)+"'"
    +",'"+getEV("buyer_id_"+indek)+"'"
    +",'"+JSON.stringify([])+"'"
    +")"
  });
}

Items.getAccount=(indek,id_kolom)=>{
  Items.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    var nm_account=txt_undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      nm_account=d.name;
    }
    if(id_kolom=='sales_account_id_'+indek){
      setEV('sales_account_name_'+indek, nm_account);
    }
    if(id_kolom=='inventory_account_id_'+indek){
      setEV('inventory_account_name_'+indek, nm_account);
    }
    if(id_kolom=='wage_account_id_'+indek){
      setEV('wage_account_name_'+indek, nm_account);
    }
    if(id_kolom=='cogs_account_id_'+indek){
      setEV('cogs_account_name_'+indek, nm_account);
    }
    if(id_kolom=='income_account_id_'+indek){
      setEV('income_account_name_'+indek, nm_account);
    }
  });
}

Items.setItemTaxes=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.tax_id);
}

Items.setVendor=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.vendor_id);
  Items.getVendor(indek,id_kolom);
}

Items.getVendor=(indek,id_kolom)=>{
  setEV('vendor_name_'+indek, txt_undefined);
  Items.vendor.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('vendor_name_'+indek, d.name);
    }
  });
}

Items.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM items"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"    
      +" AND item_id='"+bingkai[indek].item_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      
      var d=objectOne(paket.fields,paket.data);

      setEV('item_id_'+indek, d.item_id);
      setEV('item_name_'+indek, d.name);
      setEV('item_class_'+indek, d.class);
      setEC('item_inactive_'+indek, d.inactive);
      setEV('name_for_sales_'+indek, d.name_for_sales);
      setEV('name_for_purchases_'+indek, d.name_for_purchases);
      setEV('unit_measure_'+indek, d.unit_measure);
      setEV('item_type_'+indek, d.type);
      setEV('location_id_'+indek, d.location_id);
      setEV('unit_cost_'+indek, d.unit_cost);
      setEV('sales_account_id_'+indek, d.sales_account_id);
      setEV('sales_account_name_'+indek, d.sales_account_name);
      setEV('inventory_account_id_'+indek, d.inventory_account_id);
      setEV('inventory_account_name_'+indek, d.inventory_account_name);
      setEV('wage_account_id_'+indek, d.wage_account_id);
      setEV('wage_account_name_'+indek, d.wage_account_name);
      setEV('cogs_account_id_'+indek, d.cogs_account_id);
      setEV('cogs_account_name_'+indek, d.cogs_account_name);
      setEV('income_account_id_'+indek, d.income_account_id);
      setEV('income_account_name_'+indek, d.income_account_name);
      
      setEI('cost_method_'+indek, d.cost_method);
      setEV('tax_id_'+indek, d.tax_id);
      
      setEV('minimum_stock_'+indek, d.minimum_stock);
      setEV('reorder_quantity_'+indek, d.reorder_quantity);
      
      setEV('vendor_id_'+indek, d.vendor_id);
      setEV('vendor_name_'+indek, d.vendor_name);
      
      setEV('buyer_id_'+indek, d.buyer_id);
      setEV('buyer_name_'+indek, d.buyer_name);
      
      Items.itemClassMode(d.class,indek); 
      message.none(indek);
    }
    
    return callback();
  });
}

Items.formUpdate=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  Items.form.modeUpdate(indek);
}

Items.updateExecute=(indek)=>{

  db.execute(indek,{
    query:"UPDATE items "
    +" SET name='"+getEV("item_name_"+indek)+"', "
    +" name_for_sales='"+getEV("name_for_sales_"+indek)+"', "
    +" name_for_purchases='"+getEV("name_for_purchases_"+indek)+"', "
    +" inactive='"+getEC("item_inactive_"+indek)+"', "
    +" unit_measure='"+getEV("unit_measure_"+indek)+"', "
    +" type='"+getEV("item_type_"+indek)+"', "
    +" location_id='"+getEV("location_id_"+indek)+"', "
    +" unit_cost='"+getEV("unit_cost_"+indek)+"', "
    +" sales_account_id='"+getEV("sales_account_id_"+indek)+"', "
    +" inventory_account_id='"+getEV("inventory_account_id_"+indek)+"', "
    +" wage_account_id='"+getEV("wage_account_id_"+indek)+"', "
    +" cogs_account_id='"+getEV("cogs_account_id_"+indek)+"', "
    +" income_account_id='"+getEV("income_account_id_"+indek)+"', "
    +" tax_id='"+getEV("tax_id_"+indek)+"', "
    +" minimum_stock='"+getEV("minimum_stock_"+indek)+"', "
    +" reorder_quantity='"+getEV("reorder_quantity_"+indek)+"', "
    +" vendor_id='"+getEV("vendor_id_"+indek)+"', "
    +" buyer_id='"+getEV("buyer_id_"+indek)+"', "
    +" custom_fields='"+JSON.stringify([])+"' "

    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" AND item_id='"+getEV("item_id_"+indek)+"' "
  },(p)=>{
    if(p.err.id==0) Items.endPath(indek);
  });
}

Items.formDelete=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  Items.form.modeDelete(indek);
}

Items.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM items"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
  },(p)=>{
    if(p.err.id==0) Items.endPath(indek);
  });
}

Items.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM items "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Items.search=(indek)=>{
  Items.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT item_id, name, class, "
        +" user_name, date_modified"
        +" FROM items"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Items.readShow(indek);
    });
  });
}

Items.exportExecute=(indek)=>{
  var table_name=Items.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);    
}

Items.importExecute=(indek)=>{
  var n=0;
  var m='<p>[Start]</p>';
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  
  document.getElementById('btn_import_all_'+indek).disabled=true;  
  
  for (var i=0;i<j;i++){
    if(i>200) alert('???');
    
    db.run(indek,{
      query:"INSERT INTO items"
      +"(admin_name,company_id,"
      +" item_id,name,name_for_sales,name_for_purchases,"
      +" class,inactive,"
      +" unit_measure,type,location_id,unit_cost,"
      +" sales_account_id,inventory_account_id,wage_account_id,"
      +" cogs_account_id,income_account_id,"
      +" cost_method,tax_id,"
      +" minimum_stock,reorder_quantity,vendor_id,"
      +" custom_fields)"
      +" VALUES"
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'" 
      +",'"+d[i][1]+"'"  // 1_id
      +",'"+d[i][2]+"'"  // 2_name
      +",'"+d[i][3]+"'"  // 3_name_sales
      +",'"+d[i][4]+"'"  // name_purchases
      +",'"+d[i][5]+"'"  // class
      +",'"+d[i][6]+"'"  // inactive
      +",'"+d[i][7]+"'"  // unit_measure
      +",'"+d[i][8]+"'"  // type
      +",'"+d[i][9]+"'"  // location
      +",'"+d[i][10]+"'" // unit_cost
      +",'"+d[i][11]+"'" // sales_acc
      +",'"+d[i][12]+"'" // inventory_acc
      +",'"+d[i][13]+"'" // wage_acc
      +",'"+d[i][14]+"'" // cogs_acc
      +",'"+d[i][15]+"'" // income_
      +",'"+d[i][16]+"'" // cost_method
      +",'"+d[i][17]+"'" // tax_id
      +",'"+d[i][18]+"'" // min_stock
      +",'"+d[i][19]+"'" // reorder_qty
      +",'"+d[i][20]+"'" // vendor_id
      +",'"+d[i][21]+"'" // custom_field
      +")"
    },(paket)=>{
      
      if(paket.err.id!=0) {
        //alert(paket.err.msg);
        //alert(paket.request.query);
      }
      
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Items.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT item_id, name, class, "
      +" user_name, date_modified"
      +" FROM items"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY item_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Items.selectShow(indek);
  });
}

Items.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
      +'<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="check_all_'+indek+'"'
          +' onclick="checkAll(\''+indek+'\')">'
        +'</td>'
        +'<th colspan="2">Item ID</th>'
        +'<th>Description</th>'
        +'<th>Class</th>'
        +'<th align="center">User</th>'
        +'<th>Modified</th>'
      +'</tr>';

  if (p.err.id===0){
    for (var x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
        +'</td>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+tHTML(d[x].item_id)+'</td>'
        +'<td align="left">'+tHTML(d[x].name)+'</td>'
        +'<td align="center">'
          +default_item_class[d[x].class]
          +'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'
          +tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Items.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM items"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND item_id='"+d[i].item_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Items.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,item_id,date_created"
      +" FROM items"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+getEV('item_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Items.table_name,"/",
        d.company_id,"/",
        d.item_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Items.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('item_id_'+indek).value;
  document.getElementById('item_id_'+indek).disabled=false;
  document.getElementById('item_id_'+indek).value=id;
  document.getElementById('item_id_'+indek).focus();
}

Items.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Items.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Items.properties(indek);})
  }
}




// eof: 851;754;887;880;896;945;946;952;982;
