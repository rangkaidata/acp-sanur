/*
 * name: budiono
 * date: oct-26, 09:36, thu-2023;
 */
  
'use strict';

var ShipToAddress={
  title:'Ship To Address',
  menu_code:'ship_to_address'
};

ShipToAddress.show=(indek_parent)=>{
  ui.destroy_child(indek_parent);
  
  const karcis=JSON.parse(JSON.stringify(bingkai[indek_parent]));
  karcis.parent=indek_parent;
  karcis.modul=ShipToAddress.menu_code;
  karcis.menu.name=ShipToAddress.title;
  karcis.ukuran.lebar=50.50;
  karcis.ukuran.tinggi=32.50;
  karcis.bisa.ubah=0;
  karcis.menu.id=ShipToAddress.menu_code;

  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    ShipToAddress.init(indek);
  }else{
    show(baru);
  }
}

ShipToAddress.init=(indek)=>{
  bingkai[indek].metode='';
  toolbar.none(indek);
  toolbar.cancel(indek,()=>ui.CLOSE(indek));
  toolbar.save(indek,()=>ShipToAddress.saveData(indek));
  ShipToAddress.formEntry(indek);
  ShipToAddress.setData(indek);
}

ShipToAddress.formEntry=(indek)=>{
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +'<div id="msg_'+indek+'" '
        +'style="margin-bottom:1rem;line-height:1.5rem;">'
        +'</div>'

      +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="drop_ship_'+indek+'">Drop Ship</label>'
      +'</li>'
      
    +'<li><label>Invoice No.</label>'
      +'<input type="text" id="invoice_no_'+indek+'">'
      +'</li>'
      
    +'<li><label>Customer ID</label>'
      +'<input type="text" id="customer_id_'+indek+'">'
      +'</li>'
      
    +'<li><label>Ship Address</label>'
      +'<select id="ship_address_'+indek+'"'
      +' onchange="ShipToAddress.changeAddress(\''+indek+'\')">'
      +'</select>'
      +'</li>'
      
    +'<li><label>Name</label>'
      +'<input type="text" id="name_'+indek+'">'
      +'</li>'
      
    +'<li><label>Address</label>'
      +'<input type="text" id="street_1_'+indek+'"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<input type="text" id="street_2_'+indek+'"></li>'
      
    +'<li><label>City</label>'
      +'<input type="text" id="city_'+indek+'"></li>'
      
    +'<li><label>State</label>'
      +'<input type="text" id="state_'+indek+'"></li>'
      
    +'<li><label>Zip</label>'
      +'<input type="text" id="zip_'+indek+'"></li>'
      
    +'<li><label>Country</label>'
      +'<input type="text" id="country_'+indek+'">'
      +'</li>'
    +'</ul>'
    +'</form>'
    
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

ShipToAddress.changeAddress=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  const arrAddress=bingkai[indek_parent].customer_address;
  const data_ship=bingkai[indek_parent].ship_address;
  if(arrAddress.length>0){
    const i=document.getElementById('ship_address_'+indek).selectedIndex
    //document.getElementById('drop_ship_'+indek).checked=arrAddress[i].drop_ship;
    document.getElementById('name_'+indek).value=arrAddress[i].customer_address.name;
    document.getElementById('street_1_'+indek).value=arrAddress[i].customer_address.street_1;
    document.getElementById('street_2_'+indek).value=arrAddress[i].customer_address.street_2;
    document.getElementById('city_'+indek).value=arrAddress[i].customer_address.city;
    document.getElementById('state_'+indek).value=arrAddress[i].customer_address.state;
    document.getElementById('zip_'+indek).value=arrAddress[i].customer_address.zip;
    document.getElementById('country_'+indek).value=arrAddress[i].customer_address.country;
  }
}

ShipToAddress.setData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  var data_ship=bingkai[indek_parent].ship_address;

  document.getElementById('drop_ship_'+indek).checked=data_ship.drop_ship;
  document.getElementById('invoice_no_'+indek).value=data_ship.invoice_no;
  document.getElementById('customer_id_'+indek).value=data_ship.customer_id;
  // document.getElementById('ship_to_address_'+indek).checked=data_ship.address;
  document.getElementById('name_'+indek).value=data_ship.name;
  document.getElementById('street_1_'+indek).value=data_ship.street_1;
  document.getElementById('street_2_'+indek).value=data_ship.street_2;
  document.getElementById('city_'+indek).value=data_ship.city;
  document.getElementById('state_'+indek).value=data_ship.state;
  document.getElementById('zip_'+indek).value=data_ship.zip;
  document.getElementById('country_'+indek).value=data_ship.country;
  
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

ShipToAddress.defineColumn=(indek)=>{
  bingkai[indek].customer_address=[];
  bingkai[indek].ship_address={
    "drop_ship":false,
    "invoice_no":"",
    "customer_id":"",
    "address":"",
    "name":"",
    "street_1":"",
    "street_2":"",
    "city":"",
    "state":"",
    "zip":"",
    "country":""
  }  
}

ShipToAddress.saveData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  
  bingkai[indek_parent].ship_address={
     "drop_ship":document.getElementById('drop_ship_'+indek).checked
    ,"invoice_no":document.getElementById('invoice_no_'+indek).value
    ,"customer_id":document.getElementById('customer_id_'+indek).value
    ,"address":document.getElementById('ship_address_'+indek).value
    ,"name":document.getElementById('name_'+indek).value
    ,"street_1":document.getElementById('street_1_'+indek).value
    ,"street_2":document.getElementById('street_2_'+indek).value
    ,"city":document.getElementById('city_'+indek).value
    ,"state":document.getElementById('state_'+indek).value
    ,"zip":document.getElementById('zip_'+indek).value
    ,"country":document.getElementById('country_'+indek).value
  }

  const kode=bingkai[indek_parent].menu.id;
  switch(kode){
    case "purchase_orders":
      PurchaseOrders.setShipAddress(indek_parent);
      break;
    case "receive_inventory":
      ReceiveInventory.setShipAddress(indek_parent);
    break;

    default:  
      alert(kode+' belum terdaftar');
  }

  ui.CLOSE(indek);  
}
/*EOF*/
