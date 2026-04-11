/*
 * by  : budiono
 * date: dec-03, 07:29, sun-2023; 
 * -----------------------------; happy new year 2024;
 * edit: jan-21, 17:28, sat-2024; re-write;
 * edit: aug-12, 22:10, mon-2024; r12;
 */ 
 
'use strict';

var PaidAtSale={}
  
PaidAtSale.menu_code="paid_at_sale";
PaidAtSale.title="Receive Payment";
PaidAtSale.payMethod=new PayMethodLook(PaidAtSale);
PaidAtSale.account=new AccountLook(PaidAtSale);

PaidAtSale.show=(indek_parent)=>{
  ui.destroy_child(indek_parent);
  const karcis=JSON.parse(JSON.stringify(bingkai[indek_parent]));
  karcis.parent=indek_parent;
  karcis.modul=PaidAtSale.url;
  karcis.menu.id=PaidAtSale.url;
  karcis.menu.name=PaidAtSale.title;
  karcis.ukuran.lebar=65.00;
  karcis.ukuran.tinggi=28.50;
  karcis.bisa.ubah=0;
  karcis.bisa.besar=0;
  karcis.bisa.kecil=0;

  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    PaidAtSale.init(indek);
  }else{
    show(baru);
  }
}

PaidAtSale.init=(indek)=>{
  bingkai[indek].metode='';
  toolbar.none(indek);
  toolbar.cancel(indek,()=>ui.CLOSE(indek));
  toolbar.save(indek,()=>PaidAtSale.saveData(indek));

  const parent=bingkai[indek].parent;
  bingkai[indek].data_default=bingkai[parent].data_default;

  PaidAtSale.formEntry(indek);
  PaidAtSale.setData(indek);
}

PaidAtSale.formEntry=(indek,metode)=>{
  bingkai[indek].metode="";
  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"'
    +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off">'
    
    +'<div'
    +' style="display:grid;grid-template-columns:repeat(3,1fr);'
    +'padding-bottom:20px;">'
      +'<div>'
        +'<ul>'
          +'<li><label>Ticket ID:</label>'
            +'<input type="text" '
            +' id="deposit_no_'+indek+'"'
            +' size="9" >'
          +'</li>'
            
          +'<li><label>Customer ID:</label>'
            +'<input type="text" disabled'
            +' id="customer_id_'+indek+'"'
            +' size="20" >'
            +'</li>'

          +'<li><label>Bill To:</label>'
            +'<textarea '
            +' id="customer_address_'+indek+'" disabled'
            +' spellcheck=false'
            +' placeholder="Bill To"'
            +' style="resize:none;width:14.6rem;height:50px;" >'
            +'</textarea>'
          +'</li>'

        +'</ul>'
      +'</div>'
      +'<div style="margin-left:20px;">'
      +'<ul>'
        +'<li><label>Reference:</label>'
          +'<input type="text" '
          +' id="receipt_no_'+indek+'"'
          +' size="9" >'
        +'</li>'

        +'<li><label>Date:</label>'
          +'<input type="text" disabled'
          +' id="receipt_date_'+indek+'"'
          +' size="9" >'
        +'</li>'

        +'<li><label>Receipt Amt:</label>'
          +'<input type="text"'
          +' id="receipt_amount_'+indek+'"'
          +' style="text-align:center;"'
          +' size="9">'
        +'</li>'

        +'<li><label>&nbsp;</label>'
          +'<input type="button" '
          +' value="Credit Card" '
          +' onclick="CreditCard.show(\''+indek+'\')">'
        +'</li>'

      +'</ul>'
      +'</div>'
      
      +'<div style="margin-left:20px;">'
        +'<div>'
          +'<label style="display:block;">Paymt Method:</label>'
          +'<input type="text"'
          +' id="pay_method_id_'+indek+'"'
          +' size="9" >'

          +'<button type="button"'
          +' id="btn_find"'
          +' onclick="PaidAtSale.payMethod.getPaging(\''+indek+'\''
          +',\'pay_method_id_'+indek+'\')">'
          +'</button>'
          +'</div>'

        +'<div>'
          +'<label style="display:block;">Cash Account:</label>'
          +'<input type="text"'
          +' id="cash_account_id_'+indek+'"'
          +' size="9" >'

          +'<button type="button"'
          +' id="btn_find"'
          +' onclick="PaidAtSale.account.getPaging(\''+indek+'\''
          +',\'cash_account_id_'+indek+'\',-1,\''+CLASS_ASSET+'\')">'
          +'</button>'

          +'</div>'
      +'</div>'
    +'</div>'
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  document.getElementById('deposit_no_'+indek).focus();
}

PaidAtSale.setData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  var d=bingkai[indek_parent].paid_at_sale;
  
  if(Object.keys(d).length==0){// reset
    d={
      "deposit_no":"",
      "receipt_no":"",
      "receipt_date":"",
      "receipt_amount":"",
      "pay_method_id":bingkai[indek].data_default.pay_method_id, 
      "cash_account_id":bingkai[indek].data_default.cash_account_id,
      "credit_card":{}
    }
  }
  
  //if(d.receipt_no==""){
    //d.pay_method_id=bingkai[indek].data_default.pay_method_id;
    //d.cash_account_id=bingkai[indek].data_default.cash_account_id;
  //}
  
  setEV('deposit_no_'+indek, d.deposit_no);
  setEV('customer_id_'+indek, getEV("customer_id_"+indek_parent));
  setEV('customer_address_'+indek, getEV("customer_address_"+indek_parent));
  setEV('receipt_no_'+indek, d.receipt_no);
  setEV('receipt_date_'+indek, getEV('invoice_date_'+indek_parent))
  setEV('receipt_amount_'+indek, d.receipt_amount);
  setEV('pay_method_id_'+indek, d.pay_method_id);
  setEV('cash_account_id_'+indek, d.cash_account_id);
  bingkai[indek].credit_card=d.credit_card; //bingkai[indek_parent].data_credit_card;
}

PaidAtSale.saveData=(indek)=>{
  const indek_parent=bingkai[indek].parent;
  const data_receipt={
    "deposit_no":getEV('deposit_no_'+indek),
    "receipt_no":getEV('receipt_no_'+indek),
    "receipt_date":getEV('receipt_date_'+indek),
    "receipt_amount":getEV('receipt_amount_'+indek),
    "pay_method_id":getEV('pay_method_id_'+indek),
    "cash_account_id":getEV('cash_account_id_'+indek),
    "credit_card":bingkai[indek].credit_card
  }
  bingkai[indek_parent].paid_at_sale=data_receipt;

  // dont forget update data credit-card to
  //bingkai[indek_parent].data_credit_card=bingkai[indek].data_credit_card;
  if(bingkai[indek].closed==0) Invoices.setReceipt(indek_parent);
  ui.CLOSE(indek);
}

PaidAtSale.setPayMethod=(indek,d)=>{
  setEV('pay_method_id_'+indek, d.pay_method_id);
}

PaidAtSale.setAccount=(indek,d)=>{
  const id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom,d.account_id);
}

// eof: 215;
