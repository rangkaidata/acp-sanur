/*
 * name: budiono;
 * date: dec-25, 17:38, thu-2025; #85; report-std;
 */

var LookTable={};    

LookTable.period=new PeriodLook(LookTable);
LookTable.account=new AccountLook(LookTable);
LookTable.vendor=new VendorLook(LookTable);
LookTable.item=new ItemLook(LookTable);

LookTable.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  LookTable.getPeriod(indek);
}

LookTable.getPeriod=(indek)=>{
  LookTable.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('from_'+indek, d.start_date);
      setEV('to_'+indek, d.end_date) ;
    }
  });
}

LookTable.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.account_id);
  LookTable.getAccount(indek);
};

LookTable.getAccount=(indek)=>{
  message.none(indek);
  LookTable.account.getOne(indek,
    getEV('account_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('account_name_'+indek, d.name);
    }else{
      setEV('account_name_'+indek, '');
    }
  });
}

LookTable.setVendor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.vendor_id);
  LookTable.getVendor(indek);
};

LookTable.getVendor=(indek)=>{
  message.none(indek);
  LookTable.vendor.getOne(indek,
    getEV('vendor_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('vendor_name_'+indek, d.name);
    }else{
      setEV('vendor_name_'+indek, '');
    }
  });
}

LookTable.setItem=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.item_id);
  LookTable.getItem(indek);
};

LookTable.getItem=(indek)=>{
  message.none(indek);
  LookTable.item.getOne(indek,
    getEV('item_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_name_'+indek, d.name);
    }else{
      setEV('item_name_'+indek, '');
    }
  });
}


// 68;
