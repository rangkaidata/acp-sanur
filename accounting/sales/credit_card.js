/*
 * name: budiono
 * date : dec-03, 07:36, sun-2023; new
 */

'use strict';

var CreditCard={
  menu_code:'credit_card',
  title:"Credit Card Information"
}

CreditCard.show=(indek_parent)=>{
  ui.destroy_child(indek_parent);
  const karcis=JSON.parse(JSON.stringify(bingkai[indek_parent]));
  karcis.parent=indek_parent;
  karcis.modul=CreditCard.menu_code;
  karcis.menu.id=CreditCard.menu_code;
  karcis.menu.name=CreditCard.title;
  karcis.ukuran.lebar=55.00;
  karcis.ukuran.tinggi=27.50;
  karcis.bisa.ubah=0;
  karcis.bisa.kecil=0;
  karcis.bisa.besar=0;

  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    CreditCard.init(indek);
  }else{
    show(baru);
  }
}

CreditCard.init=(indek)=>{
  bingkai[indek].metode='';
  toolbar.none(indek);
  toolbar.cancel(indek,()=>ui.CLOSE(indek));
  toolbar.save(indek,()=>CreditCard.saveData(indek));
  
  CreditCard.formEntry(indek);
  CreditCard.setData(indek);
}

CreditCard.formEntry=(indek)=>{
  bingkai[indek].metode="";
  
  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"'
    +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off">'
    
    +'<div'
    +' style="display:grid;grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:20px;">'
      +'<div>'
        +'<ul>'
          +'<li><label>Card Name:</label>'
            +'<input type="text" '
            +' id="card_name_'+indek+'"'
            +' size="9" >'
            +'</li>'
            
          +'<li><label>Billing Address:</label>'
            +'<input type="text" '
            +' id="card_street_1_'+indek+'"'
            +' size="15" >'
            +'</li>'
            
          +'<li><label>&nbsp;</label>'
            +'<input type="text" '
            +' id="card_street_2_'+indek+'"'
            +' size="15" >'
            +'</li>'
            
          +'<li><label>City:</label>'
            +'<input type="text" '
            +' id="card_city_'+indek+'"'
            +' size="9" >'
            +'</li>'
            
          +'<li><label>State:</label>'
            +'<input type="text" '
            +' id="card_state_'+indek+'"'
            +' size="5" >'
            +'</li>'

          +'<li><label>Zip:</label>'
            +'<input type="text" '
            +' id="card_zip_'+indek+'"'
            +' size="5" >'
            +'</li>'
            
          +'<li><label>Country:</label>'
            +'<input type="text" '
            +' id="card_country_'+indek+'"'
            +' size="15" >'
            +'</li>'
            
          +'<li><label>Comment:</label>'
            +'<input type="text" '
            +' id="card_comment_'+indek+'"'
            +' size="15" >'
            +'</li>'
        +'</ul>'
      +'</div>'
      +'<div>'
        +'<ul>'
          +'<li><label>Receipt Date:</label>'
            +'<input type="text" disabled'
            +' id="receipt_date_'+indek+'"'
            +' size="9" >'
            +'</li>'
            
          +'<li><label>Receipt Amt:</label>'
            +'<input type="text" disabled'
            +' style="text-align:center;"'
            +' id="receipt_amount_'+indek+'"'
            +' size="9" >'
            +'</li>'

          +'<li><label>Card Number:</label>'
            +'<input type="text" '
            +' id="card_number_'+indek+'"'
            +' size="20" >'

            +'<input type="button" value="Clear">'
            +'</li>'
          +'<li><label>Expiration:</label>'
            +'<input type="text" '
            +' id="card_expiration_mm_'+indek+'"'
            +' size="1" >'
            +' MM / '

            +'<input type="text" '
            +' id="card_expiration_yy_'+indek+'"'
            +' size="1" >'
            +' YY'
            +'</li>'
            
          +'<li><label>Authorization:</label>'
            +'<input type="text" '
            +' id="card_authorization_code_'+indek+'"'
            +' size="9" >'
            +'</li>'

          +'<li><label>&nbsp;</label>'
            +'<input type="button"'
            +' value="Authorize">'
            +'</li>'
        +'</ul>'
      +'</div>'
    +'</div>'
  +'</div>'

  content.html(indek,html);
  statusbar.ready(indek);  
  document.getElementById('card_name_'+indek).focus();
}

CreditCard.setData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  var d=bingkai[indek_parent].credit_card;
  
  if(Object.keys(d).length==0){// default
    d={
      "name":"",
      "street_1":"",
      "street_2":"",
      "city":"",
      "state":"",
      "zip":"",
      "country":"",
      "comment":"",
      "number":"",
      "expiration_mm":"",
      "expiration_yy":"",
      "authorization_code":"" 
    }
  }
  
  setEV('card_name_'+indek,d.name);
  setEV('card_street_1_'+indek,d.street_1);
  setEV('card_street_2_'+indek,d.street_2);
  setEV('card_city_'+indek,d.city);
  setEV('card_state_'+indek,d.state);
  setEV('card_zip_'+indek,d.zip);
  setEV('card_country_'+indek,d.country);
  setEV('card_comment_'+indek,d.comment);
  setEV('receipt_date_'+indek,getEV('receipt_date_'+indek_parent))
  setEV('receipt_amount_'+indek,getEV('receipt_amount_'+indek_parent))
  setEV('card_number_'+indek,d.number);
  setEV('card_expiration_mm_'+indek,d.expiration_mm);
  setEV('card_expiration_yy_'+indek,d.expiration_yy);
  setEV('card_authorization_code_'+indek,d.authorization_code);
}

CreditCard.saveData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  const d={
    "name":getEV('card_name_'+indek),
    "street_1":getEV('card_street_1_'+indek),
    "street_2":getEV('card_street_2_'+indek),
    "city":getEV('card_city_'+indek),
    "state":getEV('card_state_'+indek),
    "zip":getEV('card_zip_'+indek),
    "country":getEV('card_country_'+indek),
    "comment":getEV('card_comment_'+indek),
    "number":getEV('card_number_'+indek),
    "expiration_mm":getEV('card_expiration_mm_'+indek),
    "expiration_yy":getEV('card_expiration_yy_'+indek),
    "authorization_code":getEV('card_authorization_code_'+indek)
  }
  bingkai[indek_parent].credit_card=d;
  ui.CLOSE(indek);
}

// eof
