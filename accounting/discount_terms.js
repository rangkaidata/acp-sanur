/*
 * name: budiono
 * date: sep-12, 11:43, tue-2023; new
 * edit: sep-27, 15:13, wed-2023; vendor_begins;
 * edit: sep-28, 17:48, thu-2023; customer_begins;
 * edit: oct-27, 15:14, fri-2023; purchase_orders;
 * edit: nov-02, 11:15, thu-2023; receive_inventory;
 * edit: nov-18, 15:34, sat-2023; vendor_credits;
 * edit: dec-01, 11:43, fri-2023; quotes;
 * edit: dec-02, 11:46, sat-2023; sales_orders;
 * edit: dec-03, 07:17, sun-2023; invoices;
 * -----------------------------; happy new year 2024;
 * edit: feb-16, 17:15, fri-2024; customer_credits;
 */
  
'use strict';

var DiscountTerms={};

DiscountTerms.show=(indek_parent)=>{
  ui.destroy_child(indek_parent);

  const karcis=JSON.parse(JSON.stringify(bingkai[indek_parent]));
  karcis.parent=indek_parent;
  karcis.modul='Terms-x';
  karcis.menu.name="Terms"
  karcis.ukuran.lebar=50;
  karcis.ukuran.tinggi=25;
  karcis.bisa.ubah=0;
  karcis.menu.id="terms";

  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    DiscountTerms.init(indek);
  }else{
    show(baru);
  }
}

DiscountTerms.init=(indek)=>{
  bingkai[indek].metode='';
  toolbar.none(indek);
  toolbar.cancel(indek,()=>ui.CLOSE(indek));
  toolbar.save(indek,()=>DiscountTerms.saveData(indek));

  DiscountTerms.formEntry(indek);
  DiscountTerms.setData(indek);
  DiscountTerms.calc(indek);
}

DiscountTerms.formEntry=(indek)=>{
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" '
      +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off">'
    
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);">'
    +'<div>'
    +'<ul>'

    +'<li><label>Date:</label>'
      +'<input type="date"'
      +' id="date_'+indek+'" disabled>'
    +'</li>'
      
    +'<li><label>Amount:</label>'
      +'<input type="text" '
      +' id="amount_'+indek+'" disabled'
      +' onfocus="this.select()" '
      +' style="text-align:center;" '
      +' size="9" >'
    +'</li>'

    +'<li><label>Type:</label>'
      +'<select id="type_'+indek+'"'
      +' onchange="DiscountTerms.calc(\''+indek+'\');">'
      +getDataTermsType(indek)
      +'</select>'
    +'</li>'

    +'<li><label>Net due in:</label>'
      +'<input type="text" '
      +' id="due_in_'+indek+'"'
      +' onfocus="this.select()" '
      +' onchange="DiscountTerms.calc(\''+indek+'\')"'
      +' style="text-align:center;"'
      +' size="9"  >'
    +'</li>'

    +'<li><label>Discount in:</label>'
      +'<input type="text" '
      +' id="discount_in_'+indek+'"'
      +' onfocus="this.select()" '
      +' onchange="DiscountTerms.calc(\''+indek+'\')"'
      +' style="text-align:center;"'
      +' size="9" >'
    +'</li>'

    +'<li><label>Discount %</label>'
      +'<input type="text" id="discount_percent_'+indek+'"'
      +' onfocus="this.select()" '
      +' onchange="DiscountTerms.calc(\''+indek+'\')"'
      +' style="text-align:center;"'
      +' size="9" >'
    +'</li>'
    
    +'</ul>'
    +'</div>'

    +'<div>'
    +'<ul>'
    +'<li><label>Date due:</label>'
      +'<input type="date"'
      +' id="date_due_'+indek+'" disabled>'
    +'</li>'
      
    +'<li><label>Discount date:</label>'
      +'<input type="date" '
      +' id="discount_date_'+indek+'" disabled>'
    +'</li>'

    +'<li><label>Discount amt:</label>'
      +'<input type="text" '
      +' id="discount_amount_'+indek+'" disabled'
      +' style="text-align:center;" '
      +' size="9" >'
    +'</li>'

    +'<li><label>Terms:</label>'
      +'<input type="text" '
      +' id="displayed_'+indek+'"'
      +' style="text-align:left;"'
      +' size="15" >'
    +'</li>'

    +'</ul>'
    +'</div>'
    +'</div>'
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
}

DiscountTerms.setData=(indek)=>{
  var indek_parent=bingkai[indek].parent;
  var terms=bingkai[indek_parent].discount_terms;
  if(terms.amount==undefined)terms.amount=0;
  setEV('date_'+indek, terms.date);
  setEV('amount_'+indek,terms.amount);
  setEI('type_'+indek, terms.type);
  setEV('due_in_'+indek,terms.due_in);
  setEV('discount_in_'+indek,terms.discount_in);
  setEV('discount_percent_'+indek,terms.discount_percent);
  setEV('date_due_'+indek,terms.date_due);
  setEV('discount_amount_'+indek,terms.discount_amount);
  setEV('discount_date_'+indek,terms.discount_date);
  setEV('displayed_'+indek,terms.displayed);
}

DiscountTerms.saveData=(indek)=>{
  var indek_parent=bingkai[indek].parent;
  var terms={};
  terms.date=getEV('date_'+indek);
  terms.amount=getEV('amount_'+indek);
  terms.type=getEI('type_'+indek);
  terms.due_in=getEV('due_in_'+indek);
  terms.discount_in=getEV('discount_in_'+indek);
  terms.discount_percent=getEV('discount_percent_'+indek);
  terms.date_due=getEV('date_due_'+indek);
  terms.discount_amount=getEV('discount_amount_'+indek);
  terms.discount_date=getEV('discount_date_'+indek);
  terms.displayed=getEV('displayed_'+indek);

  bingkai[indek_parent].discount_terms=terms;

  switch(bingkai[indek_parent].menu.id){
    case "vendors":
      Vendors.setTerms(indek_parent);
      break;
    case "customers":
      Customers.setTerms(indek_parent);
      break;
    case "vendor_begins":
      VendorBegins.setTerms(indek_parent);
      break;
    case "customer_begins":
      CustomerBegins.setTerms(indek_parent);
      break;
    case "purchase_orders":
      PurchaseOrders.setTerms(indek_parent);
      break;
    case "receives":
      ReceiveInventory.setTerms(indek_parent);
      break;
    case "vendor_credits":
      VendorCredits.setTerms(indek_parent);
      break;
    case "quotes":
      Quotes.setTerms(indek_parent);
      break;
    case "sales_orders":
      SalesOrders.setTerms(indek_parent);
      break;
    case "invoices":
      Invoices.setTerms(indek_parent);
      break;
    case "customer_credits":
      CustomerCredits.setTerms(indek_parent);
      break;

    default:
      alert('['+bingkai[indek_parent].menu.id+']'
        +' undefined in [discount_terms.js]');
  }
  ui.CLOSE(indek);
}

DiscountTerms.calc=(indek)=>{
  var due_in=getEV('due_in_'+indek);
  var date=new Date(getEV('date_'+indek) );
  var discount_in=getEV('discount_in_'+indek);
  var discount_percent=getEV('discount_percent_'+indek);
  var amount=getEV('amount_'+indek);
  
  var date_due=new Date(date.setDate(date.getDate()+parseInt(due_in)));
  var date_discount=new Date(date.setDate(date.getDate()+parseInt(discount_in)));
  
  var nomer=document.getElementById('type_'+indek).selectedIndex;
  if(nomer==0 || nomer==1){
    setEV('due_in_'+indek,0);
    setEV('discount_in_'+indek,0);
    setEV('discount_percent_'+indek,0);
    setEV('date_due_'+indek,date_due);
    setEV('discount_date_'+indek,date_discount);
    setEV('discount_amount_'+indek,0);
    setEV('displayed_'+indek,
      document.getElementById('type_'+indek).options[nomer].text);
      
  }else{// calc
    document.getElementById('date_due_'+indek).value
      =date_due.getFullYear()+'-'+
      ("0"+(date_due.getMonth()+1)).slice(-2)+'-'+
      ("0"+date_due.getDate()).slice(-2);
    
    document.getElementById('discount_date_'+indek).value
      =date_discount.getFullYear()+'-'+
      ("0"+(date_discount.getMonth()+1)).slice(-2)+'-'+
      ("0"+date_discount.getDate()).slice(-2);
      
    document.getElementById('discount_amount_'+indek).value
      =parseFloat(amount/100*discount_percent).toFixed(2);    

    //2% 10, Net 30 Days
    document.getElementById('displayed_'+indek).value=
      discount_percent+'% '+discount_in+', Net '+due_in+' Days';    
  }
}

DiscountTerms.getColumn=(indek)=>{
  bingkai[indek].discount_terms={
    "type":0,
    "due_in":0,
    "discount_in":0,
    "discount_percent":0,
    "displayed":"",
    "date":"",
    "amount":0,
    "discount_date":"",
    "discount_amount":0,
    "date_due":"",
  }
}

DiscountTerms.calcNow=(indek)=>{
  var data_terms=bingkai[indek].discount_terms;
  
  const due_in=data_terms.due_in;
  const date=new Date(data_terms.date);
  const discount_in=data_terms.discount_in;
  const discount_percent=data_terms.discount_percent;
  const amount=data_terms.amount;
  
  const date_due=new Date(date.setDate(date.getDate()+parseInt(due_in)));
  const date_discount=new Date(date.setDate(date.getDate()+parseInt(discount_in)));
  
    
  const nomer=data_terms.type;
  if(nomer==0 || nomer==1){
    data_terms.due_in=0;
    data_terms.discount_in=0;
    data_terms.discount_percent=0;
    data_terms.date_due=date_due
    data_terms.discount_date=date_discount
    data_terms.discount_amount=0
      
  }else{// calc
    data_terms.date_due
      =date_due.getFullYear()+'-'+
      ("0"+(date_due.getMonth()+1)).slice(-2)+'-'+
      ("0"+date_due.getDate()).slice(-2);
    
    data_terms.discount_date
      =date_discount.getFullYear()+'-'+
      ("0"+(date_discount.getMonth()+1)).slice(-2)+'-'+
      ("0"+date_discount.getDate()).slice(-2);
      
    data_terms.discount_amount
      =parseFloat(amount/100*discount_percent).toFixed(2);    

    //2% 10, Net 30 Days
    data_terms.displayed=
      discount_percent+'% '+discount_in+', Net '+due_in+' Days';    
  }
  bingkai[indek].discount_terms=data_terms;
}
//eof
