/*
 * name: budiono;
 * date: dec-01, 11:39, fri-2023; quotes;
 * edit: dec-03, 06:47, sun-2023; sales_orders,invoices
 * -----------------------------; happy new year 2024;
 * edit: jan-21, 09:44, sun-2024; any-error;
 */
  
'use strict';

var ShipToCustomer={
  title:'Ship To Address',
  menu_code:'ship_to_address_customer'
};

ShipToCustomer.getDefault=(indek)=>{
  bingkai[indek].customer_address=[];
  bingkai[indek].ship_address={
    "drop_ship":false,
    "name":"",
    "street_1":"",
    "street_2":"",
    "city":"",
    "state":"",
    "zip":"",
    "country":""
  }
}

ShipToCustomer.getAddress=(indek)=>{
  Customers.getOne(indek,getEV('customer_id_'+indek),(paket)=>{
    bingkai[indek].customer_address=[];
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].customer_address=paket.data.customer_address;
    }
  });
}

ShipToCustomer.show=(indek_parent)=>{
  ui.destroy_child(indek_parent);
  
  const karcis=JSON.parse(JSON.stringify(bingkai[indek_parent]));
  karcis.parent=indek_parent;
  karcis.modul=ShipToCustomer.menu_code;
  karcis.menu.name=ShipToCustomer.title;
  karcis.ukuran.lebar=50.50;
  karcis.ukuran.tinggi=32.50;
  karcis.bisa.ubah=0;
  karcis.menu.id=ShipToCustomer.menu_code;

  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    ShipToCustomer.init(indek);
  }else{
    show(baru);
  }
}

ShipToCustomer.init=(indek)=>{
  bingkai[indek].metode='';
  toolbar.none(indek);
  toolbar.cancel(indek,()=>ui.CLOSE(indek));
  toolbar.save(indek,()=>ShipToCustomer.saveData(indek));
  ShipToCustomer.formEntry(indek);
  ShipToCustomer.setData(indek);
}


ShipToCustomer.formEntry=(indek)=>{
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" '
      +' style="margin-bottom:1rem;line-height:1.5rem;">'
    +'</div>'
    +'<form autocomplete="off">'
    +'<ul>'
      +'<li><label>&nbsp;</label>'
        +'<label><input type="checkbox" '
        +' id="drop_ship_'+indek+'">Drop Ship'
        +'</label>'
      +'</li>'
      
      +'<li><label>Ship Address</label>'
        +'<select id="ship_address_'+indek+'"'
        +' onchange="ShipToCustomer.changeAddress(\''+indek+'\')">'
        +'</select>'
      +'</li>'
      
    +'<li><label>Name</label>'
      +'<input type="text" id="name_'+indek+'">'
    +'</li>'
      
    +'<li><label>Address</label>'
      +'<input type="text" id="street_1_'+indek+'">'
    +'</li>'
      
    +'<li><label>&nbsp;</label>'
      +'<input type="text" id="street_2_'+indek+'">'
    +'</li>'
      
    +'<li><label>City</label>'
      +'<input type="text" id="city_'+indek+'">'
    +'</li>'
      
    +'<li><label>State</label>'
      +'<input type="text" id="state_'+indek+'">'
    +'</li>'
      
    +'<li><label>Zip</label>'
      +'<input type="text" id="zip_'+indek+'">'
    +'</li>'
      
    +'<li><label>Country</label>'
      +'<input type="text" id="country_'+indek+'">'
      +'</li>'
    +'</ul>'
    +'</form>'
    
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

ShipToCustomer.changeAddress=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  const arrAddress=bingkai[indek_parent].customer_address;
  const ship_address=bingkai[indek_parent].ship_address;
  if(arrAddress.length>0){
    const i=document.getElementById('ship_address_'+indek).selectedIndex
    //document.getElementById('drop_ship_'+indek).checked=arrAddress[i].drop_ship;
    document.getElementById('name_'+indek).value=arrAddress[i].name;
    document.getElementById('street_1_'+indek).value=arrAddress[i].street_1;
    document.getElementById('street_2_'+indek).value=arrAddress[i].street_2;
    document.getElementById('city_'+indek).value=arrAddress[i].city;
    document.getElementById('state_'+indek).value=arrAddress[i].state;
    document.getElementById('zip_'+indek).value=arrAddress[i].zip;
    document.getElementById('country_'+indek).value=arrAddress[i].country;
  }
}

ShipToCustomer.setData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  var sa=bingkai[indek_parent].ship_address;
  
  document.getElementById('drop_ship_'+indek).checked=sa.drop_ship;
  document.getElementById('name_'+indek).value=sa.name;
  document.getElementById('street_1_'+indek).value=sa.street_1;
  document.getElementById('street_2_'+indek).value=sa.street_2;
  document.getElementById('city_'+indek).value=sa.city;
  document.getElementById('state_'+indek).value=sa.state;
  document.getElementById('zip_'+indek).value=sa.zip;
  document.getElementById('country_'+indek).value=sa.country;
  
  const arrAddress=bingkai[indek_parent].customer_address;
  const combo=document.getElementById('ship_address_'+indek);
  var opt;
  if(arrAddress!=undefined){
    for(var i=0;i<arrAddress.length;i++){
      if(i==0){
        opt=document.createElement("option");
        opt.text='Bill to address';
        document.getElementById('ship_address_'+indek).add(opt);
      }else{
        opt=document.createElement("option");
        opt.text='Ship to address '+i;
        document.getElementById('ship_address_'+indek).add(opt);
      }
    }
  }
  if(arrAddress.length>0){
    document.getElementById('ship_address_'+indek).selectedIndex=1;
  }
}



ShipToCustomer.saveData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  bingkai[indek_parent].ship_address={
    "drop_ship":document.getElementById('drop_ship_'+indek).checked,
    "name":document.getElementById('name_'+indek).value,
    "street_1":document.getElementById('street_1_'+indek).value,
    "street_2":document.getElementById('street_2_'+indek).value,
    "city":document.getElementById('city_'+indek).value,
    "state":document.getElementById('state_'+indek).value,
    "zip":document.getElementById('zip_'+indek).value,
    "country":document.getElementById('country_'+indek).value
  }
  
  const kode=bingkai[indek_parent].menu.id;
  switch(kode){
    case "quotes":
      Quotes.setShipAddress(indek_parent);
      break; 
    case "sales_orders":
      SalesOrders.setShipAddress(indek_parent);
      break; 
    case "invoices":
      Invoices.setShipAddress(indek_parent);
      break; 
      
    default:
      alert('['+bingkai[indek_parent].menu.id+']'
        +' undefined in [ship_to_customer.js]');
  }
  ui.CLOSE(indek);
  
}
// eof
