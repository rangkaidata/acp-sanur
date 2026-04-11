/*
 * name: budiono
 * date: nov-16, 08:26, thu-2023; new
 */
  
'use strict';

var PayToAddress={
  menu_code:'pay_to_address',
  menu_name:'Pay To Address'
};

PayToAddress.getDefault=(indek)=>{
  bingkai[indek].payment_address={
    "name":"",
    "street_1":"",
    "street_2":"",
    "city":"",
    "state":"",
    "zip":"",
    "country":"",
  }  
}

PayToAddress.show=(indek_parent)=>{
  ui.destroy_child(indek_parent);
  
  const karcis=JSON.parse(JSON.stringify(bingkai[indek_parent]));
  karcis.parent=indek_parent;
  karcis.modul=PayToAddress.menu_code;
  karcis.menu.name=PayToAddress.menu_name;
  karcis.ukuran.lebar=50.50;
  karcis.ukuran.tinggi=32.50;
  karcis.bisa.ubah=0;
  karcis.menu.id=PayToAddress.menu_code;

  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    //newTxs.hapusTombolTambah(indek);
    PayToAddress.init(indek);
  }else{
    show(baru);
  }
}

PayToAddress.init=(indek)=>{
  bingkai[indek].metode='';
  toolbar.none(indek);
  toolbar.cancel(indek,()=>ui.CLOSE(indek));
  toolbar.save(indek,()=>PayToAddress.saveData(indek));
  PayToAddress.formEntry(indek);
  PayToAddress.setData(indek);
}

PayToAddress.formEntry=(indek)=>{
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" '
    +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Name:</label>'
      +'<input type="text" id="name_'+indek+'"></li>'
      
    +'<li><label>Address:</label>'
      +'<input type="text" id="street_1_'+indek+'"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<input type="text" id="street_2_'+indek+'"></li>'
      
    +'<li><label>City:</label>'
      +'<input type="text" id="city_'+indek+'"></li>'
      
    +'<li><label>State:</label>'
      +'<input type="text" id="state_'+indek+'"></li>'
      
    +'<li><label>Zip:</label>'
      +'<input type="text" id="zip_'+indek+'"></li>'
      
    +'<li><label>Country:</label>'
      +'<input type="text" id="country_'+indek+'">'
      +'</li>'
    +'</ul>'
    +'</form>'
    
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

PayToAddress.setData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  const a=bingkai[indek_parent].payment_address;
  
  setEV('name_'+indek, a.name);
  setEV('street_1_'+indek, a.street_1);
  setEV('street_2_'+indek, a.street_2);
  setEV('city_'+indek, a.city);
  setEV('state_'+indek, a.state);
  setEV('zip_'+indek, a.zip);
  setEV('country_'+indek, a.country);
}

PayToAddress.saveData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  
  bingkai[indek_parent].payment_address={
    "name":getEV('name_'+indek),
    "street_1":getEV('street_1_'+indek),
    "street_2":getEV('street_2_'+indek),
    "city":getEV('city_'+indek),
    "state":getEV('state_'+indek),
    "zip":getEV('zip_'+indek),
    "country":getEV('country_'+indek)
  }

  const kode=bingkai[indek_parent].menu.id;
  switch(kode){
    case "payments":
      Payments.setPayAddress(indek_parent);
      break;
      
    default:
      alert(kode+' belum terdaftar');
  }
  
  ui.CLOSE(indek);
}
/*135*/
