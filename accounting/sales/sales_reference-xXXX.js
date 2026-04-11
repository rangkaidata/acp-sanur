/*
 * name: budiono
 * date: dec-03, 08:08, sun-2023; new;
*/

var so_invoice={url:'so_invoice'};
var invoice_receipt={url:'invoice_receipt'};
var receipt_deposit={url:'receipt_deposit'};
var invoice_credit={url:'invoice_credit'}

so_invoice.read=(indek,customer_id, callback)=>{
  db3.query(indek,so_invoice.url+'/read',{
    'customer_id':customer_id
  },(paket)=>{
    return callback(paket);
  });
}

so_invoice.read_one=(indek,param, callback)=>{
  db3.query(indek,so_invoice.url+'/read_one',{
    'customer_id':param.customer_id,
    'so_no':param.so_no
  },(paket)=>{
    return callback(paket);
  });
}

invoice_receipt.read_open=(indek,customer_id,abc)=>{
  db3.query(indek,invoice_receipt.url+'/read_open',{
    'customer_id':customer_id
  },(paket)=>{
    return abc(paket);
  });
}

receipt_deposit.read_open=(indek,cash_account_id,abc)=>{
  db3.query(indek,receipt_deposit.url+'/read_open',{
    'cash_account_id':cash_account_id
  },(paket)=>{
    return abc(paket);
  });
}

invoice_credit.read=(indek,customer_id, callback)=>{
  db3.query(indek,invoice_credit.url+'/read',{
    'customer_id':customer_id
  },(paket)=>{
    return callback(paket);
  });
}

invoice_credit.read_one=(indek,param,callback)=>{
  db3.query(indek,invoice_credit.url+'/read_one',{
    'customer_id':param.customer_id,
    'invoice_no':param.invoice_no
  },(paket)=>{
    return callback(paket);
  });
}

// eof;
