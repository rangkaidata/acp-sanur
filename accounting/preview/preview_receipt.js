/*
 * name: budiono;
 * date: mar-18, 2120, wed-2026; #91; preview;
 */


 
Receipts.preview=(indek)=>{
  
  if(kursor){// dari-paging
    Receipts.readOffset(indek,0,(d)=>{
      Receipts.renderPreview(indek,d);
    });
    
  } else {// dari-update
    
    Receipts.readKeyset(indek,(d)=>{
      Receipts.renderPreview(indek,d);
    });
  }
}

Receipts.renderPreview=(indek,d)=>{

  CompanyProfile.readCursor(indek,(c)=>{
    var logo=bingkai[0].server.url+'logo'
      +'?login_id='+bingkai[indek].login.id
      +'&company_id='+c.company_id
      +'&company_logo='+c.company_logo
      +'&'+new Date();
    
    Receipts.cacheItem(indek,d,(h)=>{
      
      var total_halaman=h.total_halaman;
      var jumlah_baris=h.jumlah_baris;
      var arr=h.arr;

      Receipts.template(
        indek,
        total_halaman.length,
        jumlah_baris,
        logo
      );
      
      Receipts.binding(indek,total_halaman,jumlah_baris,c,d,arr);
    });
  });

}

Receipts.cacheItem=(indek,s,callback)=>{}

Receipts.template=(indek,kopi,max_item,logo)=>{};

Receipts.binding=(indek,total_halaman,jumlah_baris,data_c,data_s,arr)=>{}
