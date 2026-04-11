/*
 * name: budiono
 * date: nov-1, 10:09, wed-2023; 
 */ 

// 'use strict';

var po_receive={url:'po_receive'};
var receive_payment={url:'receive_payment'};
var receive_credit={url:'receive_credit'};

po_receive.read=(indek,vendor_id,abc)=>{
  db3.query(indek,po_receive.url+'/read',{
    'vendor_id':vendor_id
  },(paket)=>{
    return abc(paket);
  });
}

po_receive.read_one=(indek,param,abc)=>{
  db3.query(indek,po_receive.url+'/read_one',{
    'vendor_id':param.vendor_id,
    'po_no':param.po_no
  },(paket)=>{
    return abc(paket);
  });
}

receive_payment.read_open=(indek,vendor_id,abc)=>{
  db3.query(indek,receive_payment.url+'/read_open',{
    'vendor_id':vendor_id
  },(paket)=>{
    return abc(paket);
  });
}

receive_credit.read=(indek,vendor_id,abc)=>{
  db3.query(indek,receive_credit.url+'/read',{
    'vendor_id':vendor_id
  },(paket)=>{
    return abc(paket);
  });
}

receive_credit.read_one=(indek,param,abc)=>{
  db3.query(indek,receive_credit.url+'/read_one',{
    'vendor_id':param.vendor_id,
    'receive_no':param.receive_no
  },(paket)=>{
    return abc(paket);
  });
}
// eof;
