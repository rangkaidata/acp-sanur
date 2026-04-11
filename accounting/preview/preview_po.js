/*
 * name: budiono;
 * date: mar-18, 11:23, wed-2026; #91; preview;
 */
/*
PurchaseOrders.templateView=(indek,kopi,max_item,logo)=>{
  
  var tinggi=0;
  var tinggi_top=0;
  var tinggi_a4=1000;
  var tinggi_a4_inner=1027;// fix--1027
  
//  var loo=Number(1000*loop);
  var abc=new TemplateSVG ('#000', 0.5);  
  var html=' '
    +'<div '
    +' style="border: 1px solid gold;'
    +' margin-left: auto; '
    +' margin-right: auto; '
    +' max-width: fit-content; '
    +' color:#333"> '
    +content.title(indek)
//    +content.message(indek)  
  
    +'<svg  width="680" height="'+(tinggi_a4*kopi)+'" id="mySVG_'+indek+'"> ';
    
    for(var zz=0;zz<kopi;zz++){
      tinggi=tinggi_a4_inner*(zz+1);
      tinggi_top=(tinggi_a4_inner*(zz));
      
      html+=abc.halaman(0,0+tinggi_top,679,tinggi_a4_inner,'#ffffff','#ffd700')//gold

      // header company+logo
      +abc.gambar(0,30+tinggi_top,'img_logo_'+zz+'_'+indek,70,70,logo)
      +abc.teks(70,50+tinggi_top,'txt_company_name_'+zz+'_'+indek,18,'Rangkai Data','#555','bold')
      +abc.teks(70,65+tinggi_top,'txt_street_1_'+zz+'_'+indek,12,'Jl. Kota Kasablanka','#555','normal')
      +abc.teks(70,80+tinggi_top,'txt_city_'+zz+'_'+indek,12,'Menteng Pulo','#555','normal')
      +abc.teks(70,95+tinggi_top,'txt_country_'+zz+'_'+indek,12,'Jakarta','#555','normal')
      +abc.teks(70,110+tinggi_top,'lbl_voice_'+zz+'_'+indek,12,'Voice:','#555','normal')
      +abc.teks(120,110+tinggi_top,'txt_voice_'+zz+'_'+indek,12,'(123)-1231239','#555','normal')
      +abc.teks(70,125+tinggi_top,'lbl_fax_'+zz+'_'+indek,12,'Fax:','#555','normal')
      +abc.teks(120,125+tinggi_top,'txt_fax_'+zz+'_'+indek,12,'(021)-8297799','#555','normal')

      // title
      +abc.teks(450,50+tinggi_top,'txt_title',30,'Purchase Order','#555','bold')
      +abc.teks(450,70+tinggi_top,'lbl_po_no_'+zz+'_'+indek,12,'Purchase Order#:','#555','Normal')
      +abc.teks(560,70+tinggi_top,'txt_po_no_'+zz+'_'+indek,12,'PO1234','#555','Normal')
      +abc.teks(450,90+tinggi_top,'lbl_date_'+zz+'_'+indek,12,'Date:','#555','Normal')
      +abc.teks(560,90+tinggi_top,'txt_date_'+zz+'_'+indek,12,'31/03/2026','#555','Normal')      
      +abc.teks(450,110+tinggi_top,'lbl_page',12,'Page:','#555','Normal')
      +abc.teks(560,110+tinggi_top,'txt_page',12,(zz+1)+'/'+kopi,'#555','Normal')      
      
      // vendor panel
      +abc.panel(1,150+tinggi_top,300,120,'#D3D3D3','#ffffff')
      +abc.teks(15,165+tinggi_top,'lbl_to',12,'To:','#555','Bold')
      
      // vendor address
      +abc.teks(15,190+tinggi_top,'txt_vendor_name_'+zz+'_'+indek,12,'Vendor Name','#555','Normal')
      +abc.teks(15,205+tinggi_top,'txt_vendor_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(15,220+tinggi_top,'txt_vendor_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(15,235+tinggi_top,'txt_vendor_country_'+zz+'_'+indek,12,'Country','#555','Normal')
      
      // ship panel
      +abc.panel(379,150+tinggi_top,300,120,'#D3D3D3','#ffffff')
      +abc.teks(390,165+tinggi_top,'lbl_ship_to',12,'Ship To:','#555','Bold')
      
      // ship_address
      +abc.teks(390,190+tinggi_top,'txt_ship_name_'+zz+'_'+indek,12,'Ship Name','#555','Normal')
      +abc.teks(390,205+tinggi_top,'txt_ship_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(390,220+tinggi_top,'txt_ship_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(390,235+tinggi_top,'txt_ship_country_'+zz+'_'+indek,12,'Country','#555','Normal')      

      // table terms 
      +abc.tabel(1,285+tinggi_top,430,40,'#D3D3D3','#ffffff',
        [100,260],[
          [18,300+tinggi_top,'Good Thru'],
          [150,300+tinggi_top,'Ship Via'],
          [320,300+tinggi_top,'Terms'],
        ],
      )
      
      +abc.teks(15,320+tinggi_top,'txt_good_thru_'+zz+'_'+indek,12,'Good Thru','#555','Normal')
      +abc.teks(150,320+tinggi_top,'txt_ship_id_'+zz+'_'+indek,12,'Ship Via','#555','Normal')
      +abc.teks(290,320+tinggi_top,'txt_discount_terms_'+zz+'_'+indek,12,'Discount Terms','#555','Normal')

      // table detail items
      +abc.tabel(1,340+tinggi_top,678,360,'#D3D3D3','#ffffff',
        [80,200,440,540],[
          [15,355+tinggi_top,'Quantity'],
          [120,355+tinggi_top,'Item ID'],
          [280,355+tinggi_top,'Description'],
          [460,355+tinggi_top,'Unit Cost'],
          [590,355+tinggi_top,'Amount']
        ],
      );

      let y=15;// ->space antara item 
      let z=0;
      
      for(let i=0;i<max_item;i++){//i==baris
        z=y*i;
        html+=abc.teksAnchor(70,380+z+tinggi_top,'txt_quantity_'+i+'_'+zz+'_'+indek,12,'Quantity','#555','Normal');
        html+=abc.teks(85,380+z+tinggi_top,'txt_item_id_'+i+'_'+zz+'_'+indek,12,'Item ID','#555','Normal');
        html+=abc.teks(210,380+z+tinggi_top,'txt_description_'+i+'_'+zz+'_'+indek,12,'Description','#555','Normal');
        html+=abc.teksAnchor(530,380+z+tinggi_top,'txt_unit_cost_'+i+'_'+zz+'_'+indek,12,'Unit Cost','#555','Normal');
        html+=abc.teksAnchor(660,380+z+tinggi_top,'txt_amount_'+i+'_'+zz+'_'+indek,12,'amount','#555','Normal');
      }

      // total
      html+=abc.kotak(441,700+tinggi_top,238,20,"#D3D3D3")
      +abc.garis(541,700+tinggi_top,541,700+20+tinggi_top)
      +abc.teks(445,715+tinggi_top,'lbl_total',12,'TOTAL','#555','Bold')
      +abc.teksAnchor(660,715+tinggi_top,'txt_amount_'+zz+'_'+indek,12,'Amount','#555','Bold')
    }

    html+='</svg>';
  content.html(indek,html);
  statusbar.ready(indek);
}

PurchaseOrders.readCursor=(indek,callback)=>{
  
  if(bingkai[indek].offset==undefined) bingkai[indek].offset=0;
  
  db.run(indek,{
    query:"SELECT * "
      +" FROM purchase_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT 1"
      +" OFFSET "+bingkai[indek].offset
  },(paket)=>{
    var m=PurchaseOrders.fields();
    if(paket.count>0) {
      var po=objectOne(paket.fields,paket.data) ;

      m.vendor_id=po.vendor_id;
      m.vendor_name=po.vendor_name;
      m.vendor_address=JSON.parse(po.vendor_address);
      m.po_no=po.po_no;
      m.date=po.date;
      m.status=po.status;
      m.good_thru=po.good_thru;
      m.ship_address=JSON.parse(po.ship_address)
      m.ship_id=po.ship_id;
      m.discount_terms=JSON.parse(po.discount_terms)
      m.ap_account_id=po.ap_account_id
      m.detail=JSON.parse(po.detail)
      m.amount=po.amount
      m.note=po.note
      m.file_id=po.file_id
    }else{
      if(bingkai[indek].offset>0) bingkai[indek].offset--;
    }
    return callback(m);
  })
}

PurchaseOrders.fields=()=>{
  return {
    vendor_id: "",
    vendor_name:"",
    vendor_address:{},
    po_no:"",
    date:"",
    status:0,
    good_thru:"",
    ship_address:{},
    ship_id:"",
    discount_terms:{},
    ap_account_id:"",
    detail:[],
    amount:0,
    note:[],
    file_id:"",
  }
}

PurchaseOrders.preview=(indek)=>{
  var halaman=0;
  var max_item=20;
  var panjang_max=35
  var total_halaman=[];
  var d_company;
  
  CompanyProfile.readCursor(indek,(p)=>{
    d_company=p;

    PurchaseOrders.readCursor(indek,(p)=>{         
      
      var a=p.detail;
      var i=0;
      var quantity='';
      var arr=[];
      var new_text;
      var berapa_kali
      var deskripsi;
      var total_loop=0;
      
      for(i=0;i<a.length;i++){
        
        deskripsi=a[i].description;
        berapa_kali=0;
        
        if(String(deskripsi).length>panjang_max){

          berapa_kali=parseInt(Number(String(deskripsi).length)/panjang_max)
          
          for(var j=0;j<berapa_kali+1;j++){
            new_text=String(deskripsi).slice(panjang_max*j,panjang_max*(j+1))
            if(j==0){
              // tambah halaman bila item kena batas maksimal;
              if((arr.length % max_item)==0) {
                halaman++; 
                total_halaman.push([halaman])
              }

              arr.push([
                halaman,
                a[i].quantity,
                a[i].item_id,
                new_text,
                a[i].unit_price,
                a[i].amount,
              ])
            } else {
              // tambah halaman bila item kena batas maksimal;
              if((arr.length % max_item)==0) {
                halaman++; 
                total_halaman.push([halaman])
              }
              
              arr.push([
                halaman,
                "",
                "",
                new_text,// sisa deskripsi
                "",
                "",
              ])              
            }
          }
        }
        if(berapa_kali==0){
          // tambah halaman bila item kena batas maksimal;
          if((arr.length % max_item)==0) {
            halaman++; 
            total_halaman.push([halaman])
          }
          
          arr.push([
            halaman,
            a[i].quantity,
            a[i].item_id,
            a[i].description,
            a[i].unit_price,
            a[i].amount,
          ])
        };
      }

      var logo=bingkai[0].server.url+'logo'
        +'?login_id='+bingkai[indek].login.id
        +'&company_id='+d_company.company_id
        +'&company_logo='+d_company.company_logo
        +'&'+new Date();

      PurchaseOrders.templateView(indek,total_halaman.length,max_item,logo);
      
      // rendering
      var ii=0;
      
      for(var k=0;k<total_halaman.length;k++){
        
        // company
        
        setiH('txt_company_name_'+k+'_'+indek,d_company.name);
        setiH('txt_street_1_'+k+'_'+indek,d_company.address.street_1+' '+d_company.address.street_2);
        setiH('txt_city_'+k+'_'+indek,d_company.address.city+', '+d_company.address.state+' '+d_company.address.zip);
        setiH('txt_country_'+k+'_'+indek,d_company.address.country);
        setiH('txt_fax_'+k+'_'+indek,d_company.fax);
        setiH('txt_voice_'+k+'_'+indek,d_company.phone);
        
        //render header - footer;
        setiH('txt_po_no_'+k+'_'+indek, p.po_no);
        setiH('txt_date_'+k+'_'+indek, tglWest(p.date));
        
        // vendor_address
        setiH('txt_vendor_name_'+k+'_'+indek, p.vendor_name);
        setiH('txt_vendor_street_1_'+k+'_'+indek, p.vendor_address.street_1);
        setiH('txt_vendor_city_'+k+'_'+indek, 
          String(p.vendor_address.city).concat(
            ", ",p.vendor_address.state,
            " ",p.vendor_address.zip));
        setiH('txt_vendor_country_'+k+'_'+indek, p.vendor_address.country);
        
        // ship address
        setiH('txt_ship_name_'+k+'_'+indek, p.ship_address.name);
        setiH('txt_ship_street_1_'+k+'_'+indek, p.ship_address.street_1);
        setiH('txt_ship_city_'+k+'_'+indek, 
          String(p.ship_address.city).concat(
            ", ",p.ship_address.state,
            " ",p.ship_address.zip));
        setiH('txt_ship_country_'+k+'_'+indek, p.ship_address.country);
        
        setiH('txt_good_thru_'+k+'_'+indek, tglWest(p.good_thru));
        setiH('txt_ship_id_'+k+'_'+indek, p.ship_id);
        setiH('txt_discount_terms_'+k+'_'+indek, p.discount_terms.displayed);
        setiH('txt_amount_'+k+'_'+indek, p.amount);
        
        //render detail items
        
        for(i=0;i<max_item;i++){
          for(var v=0;v<arr.length;v++){
            if(arr[v][0]===(k+1)){// halaman sama
              if(arr[ii]){
                
                setiH('txt_quantity_'+i+'_'+k+'_'+indek, arr[ii][1]);
                setiH('txt_item_id_'+i+'_'+k+'_'+indek, arr[ii][2]);
                setiH('txt_description_'+i+'_'+k+'_'+indek, arr[ii][3]);
                setiH('txt_unit_cost_'+i+'_'+k+'_'+indek, arr[ii][4]);
                setiH('txt_amount_'+i+'_'+k+'_'+indek, arr[ii][5]);
                
              }else{
                
                setiH('txt_quantity_'+i+'_'+k+'_'+indek, '');
                setiH('txt_item_id_'+i+'_'+k+'_'+indek, '');
                setiH('txt_description_'+i+'_'+k+'_'+indek, '');
                setiH('txt_unit_cost_'+i+'_'+k+'_'+indek, '');
                setiH('txt_amount_'+i+'_'+k+'_'+indek, '');
                
              }
            };
          };
          ii++;
        };
      }
    });
  });
}
*/

PurchaseOrders.nextPrevious=(indek,val)=>{
  PurchaseOrders.readOffset(indek,val,(d)=>{
    if(bingkai[indek].metode==MODE_VIEW){// mode-preview

      PurchaseOrders.renderPreview(indek,d);
      
    }else{// mode-update;
      
      PurchaseOrders.formUpdate(indek,d.vendor_id,d.po_no);
    }
  });  
}

PurchaseOrders.readOffset=(indek,val,callback)=>{
  
  setCursor(indek,val);

  db.run(indek,{
    query:"SELECT * "
      +" FROM purchase_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,po_no"
      +" LIMIT 1"
      +" OFFSET "+bingkai[indek].offset
      
  },(p)=>{
    
    PurchaseOrders.setFields(p,(d)=>{// 
      bingkai[indek].vendor_id=d.vendor_id;
      bingkai[indek].po_no=d.po_no;
      return callback(d);
    });
  });
}

PurchaseOrders.setFields=(p,callback)=>{
  
  var m= {
    vendor_id: "",
    vendor_name:"",
    vendor_address:{},
    po_no:"",
    date:"",
    status:0,
    good_thru:"",
    ship_address:{},
    ship_id:"",
    discount_terms:{},
    ap_account_id:"",
    detail:[],
    amount:0,
    note:[],
    file_id:"",
  }
  
  if(p.count>0){
    var d=objectOne(p.fields,p.data) ;

      m.vendor_id=d.vendor_id;
      m.vendor_name=d.vendor_name;
      m.vendor_address=JSON.parse(d.vendor_address);
      m.po_no=d.po_no;
      m.date=d.date;
      m.status=d.status;
      m.good_thru=d.good_thru;
      m.ship_address=JSON.parse(d.ship_address)
      m.ship_id=d.ship_id;
      m.discount_terms=JSON.parse(d.discount_terms)
      m.ap_account_id=d.ap_account_id
      m.detail=JSON.parse(d.detail)
      m.amount=d.amount
      m.note=d.note
      m.file_id=d.file_id
  }
  
  return callback(m);
}

PurchaseOrders.preview=(indek,kursor)=>{
  
  if(kursor){// dari-paging
    PurchaseOrders.readOffset(indek,0,(d)=>{
      PurchaseOrders.renderPreview(indek,d);
    });
    
  } else {// dari-update
    
    PurchaseOrders.readKeyset(indek,(d)=>{
      PurchaseOrders.renderPreview(indek,d);
    });
  }
}

PurchaseOrders.readKeyset=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM purchase_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
      +" AND po_no='"+bingkai[indek].po_no+"'"

  },(p)=>{
    PurchaseOrders.setFields(p,(d)=>{
      return callback(d);
    });
  });  
}

PurchaseOrders.renderPreview=(indek,d)=>{
  CompanyProfile.readCursor(indek,(c)=>{
    var logo=bingkai[0].server.url+'logo'
      +'?login_id='+bingkai[indek].login.id
      +'&company_id='+c.company_id
      +'&company_logo='+c.company_logo
      +'&'+new Date();
    
    PurchaseOrders.cacheItem(indek,d,(h)=>{
      
      var total_halaman=h.total_halaman;
      var jumlah_baris=h.jumlah_baris;
      var arr=h.arr;

      PurchaseOrders.template(
        indek,
        total_halaman.length,
        jumlah_baris,
        logo
      );
      
      PurchaseOrders.binding(indek,total_halaman,jumlah_baris,c,d,arr);
    });
  });
}

PurchaseOrders.cacheItem=(indek,s,callback)=>{
  var halaman=0;
  var jumlah_baris=5;//;23;
  var lebar_deskripsi=36
  var total_halaman=[];
  
  var data_s=s;
  var i=0;
  var quantity='';
  var arr=[];
  var new_line;
  var berapa_kali;
  var deskripsi;
  var total_loop=0;
  var logo;
  
  // ambil detail invoice items;
  // tambah detail so items;
  var a=[];
  var c=data_s.detail;
  
  for(i=0;i<c.length;i++){
    if(c[i].description){// not undefined
      a.push({
        quantity: c[i].quantity,
        item_id: c[i].item_id,
        description: c[i].description,
        unit_price: c[i].unit_price,
        amount: c[i].amount,
      });
    }
  }
  
  for(i=0;i<a.length;i++){
    
    deskripsi=a[i].description;
    berapa_kali=0;
    
    // step hitung panjang deskripsi;
    if(String(deskripsi).length>lebar_deskripsi){

      berapa_kali=parseInt(Number(String(deskripsi).length)/lebar_deskripsi)
      
      for(var j=0;j<berapa_kali+1;j++){
        new_line=String(deskripsi).slice(lebar_deskripsi*j,lebar_deskripsi*(j+1))
        if(j==0){
          // tambah halaman baru, bila item kena batas maksimal;
          if((arr.length % jumlah_baris)==0) {
            halaman++; 
            total_halaman.push([halaman])
          }

          arr.push([
            halaman,
            a[i].quantity,
            a[i].item_id,
            new_line,
            a[i].unit_price,
            a[i].amount,
          ])
        } else {
          // tambah halaman baru, bila item kena batas maksimal;
          if((arr.length % jumlah_baris)==0) {
            halaman++; 
            total_halaman.push([halaman])
          }
          
          arr.push([
            halaman,
            "",
            "",
            new_line,// sisa deskripsi
            "",
            "",
          ])              
        }
      }
    }
    if(berapa_kali==0){
      // tambah halaman bila item kena batas maksimal;
      if((arr.length % jumlah_baris)==0) {
        halaman++; 
        total_halaman.push([halaman])
      }
      
      arr.push([
        halaman,
        a[i].quantity,
        a[i].item_id,
        a[i].description,
        a[i].unit_price,
        a[i].amount,
      ])
    };
  }
  
  return callback({
    total_halaman: total_halaman,
    jumlah_baris: jumlah_baris,
    arr: arr,
  });
}


PurchaseOrders.template=(indek,kopi,max_item,logo)=>{
/*  
  var lebar=678;
  var tinggi=0;
  var tinggi_top=0;
  var tinggi_a4=1000;
  var tinggi_a4_inner=1027; // fix--1027  
  var tinggi_spasi=15;// ->space antara item 
  var abc=new TemplateSVG ('#000', 0.5);

  var html='<div '
    +' style="border: 1px solid gold;'
    +' margin-left: auto; '
    +' margin-right: auto; '
    +' max-width: fit-content; '
    +' color:#333"> '
    +content.title(indek)
    // open
    +'<svg  width="680" height="'+(tinggi_a4*kopi)+'" id="mySVG_'+indek+'"> ';
//--------------------------------------------------------------------//    
    for(var zz=0;zz<kopi;zz++){
      tinggi=tinggi_a4_inner*(zz+1);
      tinggi_top=(tinggi_a4_inner*(zz));
      
      html+=abc.halaman(0,0+tinggi_top,679,tinggi_a4_inner,'#ffffff','#ffd700')//gold

      // header company info, logo;
      +abc.gambar(0,35+tinggi_top,'img_logo_'+zz+'_'+indek,65,65,logo)
      +abc.teks(70,50+tinggi_top,'txt_company_name_'+zz+'_'+indek,18,'Rangkai Data','#555','bold')
      +abc.teks(70,65+tinggi_top,'txt_street_1_'+zz+'_'+indek,12,'Jl. Kota Kasablanka','#555','normal')
      +abc.teks(70,80+tinggi_top,'txt_city_'+zz+'_'+indek,12,'Menteng Pulo','#555','normal')
      +abc.teks(70,95+tinggi_top,'txt_country_'+zz+'_'+indek,12,'Jakarta','#555','normal')
      +abc.teks(70,130+tinggi_top,'lbl_voice_'+zz+'_'+indek,12,'Voice:','#555','normal')
      +abc.teks(120,130+tinggi_top,'txt_voice_'+zz+'_'+indek,12,'(123)-1231239','#555','normal')
      +abc.teks(70,145+tinggi_top,'lbl_fax_'+zz+'_'+indek,12,'Fax:','#555','normal')
      +abc.teks(120,145+tinggi_top,'txt_fax_'+zz+'_'+indek,12,'(021)-8297799','#555','normal')

      // title;
      +abc.teks(450,50+tinggi_top,'txt_title',30,'QUOTATION','#555','bold')
      
      // number,date,page;
      +abc.teks(450,65+tinggi_top,'lbl_quote_no_'+zz+'_'+indek,12,'Quote #:','#555','Normal')
      +abc.teks(540,65+tinggi_top,'txt_quote_no_'+zz+'_'+indek,12,'Q1234','#555','Normal')
      +abc.teks(450,80+tinggi_top,'lbl_date_'+zz+'_'+indek,12,'Date:','#555','Normal')
      +abc.teks(540,80+tinggi_top,'txt_date_'+zz+'_'+indek,12,'31/03/2026','#555','Normal')      
      +abc.teks(450,95+tinggi_top,'lbl_page',12,'Page:','#555','Normal')
      +abc.teks(540,95+tinggi_top,'txt_page',12,(zz+1)+' of '+kopi,'#555','Normal')

      
      // customer panel
      +abc.panel(1,170+tinggi_top,300,110,'#D3D3D3','#ffffff')
      +abc.teks(15,185+tinggi_top,'lbl_to',12,'Quoted To:','#555','Bold')
      
      // customer address
      +abc.teks(15,210+tinggi_top,'txt_customer_name_'+zz+'_'+indek,12,'customer_name','#555','Normal')
      +abc.teks(15,225+tinggi_top,'txt_customer_street_1_'+zz+'_'+indek,12,'street_1','#555','Normal')
      +abc.teks(15,240+tinggi_top,'txt_customer_city_'+zz+'_'+indek,12,'city','#555','Normal')
      +abc.teks(15,255+tinggi_top,'txt_customer_country_'+zz+'_'+indek,12,'country','#555','Normal')
      
      // customer_id,good thru,displayed_terms,sales_rep
      +abc.tabel(1,290+tinggi_top,lebar,40,'#D3D3D3','#ffffff',
        [lebar/4,(lebar/4*2),(lebar/4*3)],[
          [65,290+15+tinggi_top,'Customer ID'],
          [230,290+15+tinggi_top,'Good Thru'],
          [380,290+15+tinggi_top,'Payment Terms'],
          [550,290+15+tinggi_top,'Sales Rep'],
        ],
      )
      
      +abc.teks(20,290+35+tinggi_top,'txt_customer_id_'+zz+'_'+indek,12,'customer_id','#555','Normal')
      +abc.teks(180,290+35+tinggi_top,'txt_good_thru_'+zz+'_'+indek,12,'good_thru','#555','Normal')
      +abc.teks(350,290+35+tinggi_top,'txt_payment_terms_'+zz+'_'+indek,12,'displayed_terms','#555','Normal')
      +abc.teks(520,290+35+tinggi_top,'txt_sales_rep_id_'+zz+'_'+indek,12,'sales_rep_id','#555','Normal')

      // table items
      +abc.tabel(1,340+tinggi_top,678,450,'#D3D3D3','#ffffff',
        [80,200,440,540],[
          [15,340+15+tinggi_top,'Quantity'],
          [120,340+15+tinggi_top,'Item ID'],
          [280,340+15+tinggi_top,'Description'],
          [460,340+15+tinggi_top,'Unit Price'],
          [590,340+15+tinggi_top,'Amount']
        ],
      );      
      
      let z=0;

      // list items
      for(let i=0;i<max_item;i++){//i==baris
        z=tinggi_spasi*i;
        html+=abc.teksAnchor(70,340+40+z+tinggi_top,'txt_quantity_'+i+'_'+zz+'_'+indek,12,'quantity','#555','Normal');
        html+=abc.teks(85,340+40+z+tinggi_top,'txt_item_id_'+i+'_'+zz+'_'+indek,12,'item_id','#555','Normal');
        html+=abc.teks(210,340+40+z+tinggi_top,'txt_description_'+i+'_'+zz+'_'+indek,12,'description','#555','Normal');
        html+=abc.teksAnchor(530,340+40+z+tinggi_top,'txt_unit_cost_'+i+'_'+zz+'_'+indek,12,'unit_cost','#555','Normal');
        html+=abc.teksAnchor(660,340+40+z+tinggi_top,'txt_amount_'+i+'_'+zz+'_'+indek,12,'amount','#555','Normal');
      }
      
      // Subtotal
      html+=abc.kotak(200+1,790+tinggi_top,478,20,"#ffff")
      +abc.garis(541,790+tinggi_top,541,790+20+tinggi_top)
      +abc.teks(210,790+15+tinggi_top,'lbl_subtotal',12,'Subtotal','#555','Normal')
      +abc.teksAnchor(660,790+15+tinggi_top,'txt_subtotal_'+zz+'_'+indek,12,'subtotal','#555','Normal')
      
      // sales tax
      +abc.kotak(200+1,810+tinggi_top,478,20,"#ffff")
      +abc.garis(541,810+tinggi_top,541,810+20+tinggi_top)
      +abc.teks(210,810+15+tinggi_top,'lbl_tax_amount_'+zz+'_'+indek,12,'Sales Tax','#555','Normal')
      +abc.teksAnchor(660,810+15+tinggi_top,'txt_tax_amount_'+zz+'_'+indek,12,'tax amount','#555','Normal')

      // total order
      +abc.kotak(200+1,830+tinggi_top,478,20,"#D3D3D3")
      +abc.garis(541,830+tinggi_top,541,850+20+tinggi_top)
      +abc.teks(210,830+15+tinggi_top,'lbl_total',12,'Total Order','#555','Bold')
      +abc.teksAnchor(660,830+15+tinggi_top,'txt_total_'+zz+'_'+indek,12,'total order','#555','Bold')

    }
//--------------------------------------------------------------------//    
  html+='</svg>';//close
  content.html(indek,html);
  statusbar.ready(indek);
*/  
  
  var tinggi=0;
  var tinggi_top=0;
  var tinggi_a4=1000;
  var tinggi_a4_inner=1027;// fix--1027
  
//  var loo=Number(1000*loop);
  var abc=new TemplateSVG ('#000', 0.5);  
  var html=' '
    +'<div '
    +' style="border: 1px solid gold;'
    +' margin-left: auto; '
    +' margin-right: auto; '
    +' max-width: fit-content; '
    +' color:#333"> '
    +content.title(indek)
//    +content.message(indek)  
  
    +'<svg  width="680" height="'+(tinggi_a4*kopi)+'" id="mySVG_'+indek+'"> ';
    
    for(var zz=0;zz<kopi;zz++){
      tinggi=tinggi_a4_inner*(zz+1);
      tinggi_top=(tinggi_a4_inner*(zz));
      
      html+=abc.halaman(0,0+tinggi_top,679,tinggi_a4_inner,'#ffffff','#ffd700')//gold

      // header company+logo
      +abc.gambar(0,30+tinggi_top,'img_logo_'+zz+'_'+indek,70,70,logo)
      +abc.teks(70,50+tinggi_top,'txt_company_name_'+zz+'_'+indek,18,'Rangkai Data','#555','bold')
      +abc.teks(70,65+tinggi_top,'txt_street_1_'+zz+'_'+indek,12,'Jl. Kota Kasablanka','#555','normal')
      +abc.teks(70,80+tinggi_top,'txt_city_'+zz+'_'+indek,12,'Menteng Pulo','#555','normal')
      +abc.teks(70,95+tinggi_top,'txt_country_'+zz+'_'+indek,12,'Jakarta','#555','normal')
      +abc.teks(70,110+tinggi_top,'lbl_voice_'+zz+'_'+indek,12,'Voice:','#555','normal')
      +abc.teks(120,110+tinggi_top,'txt_voice_'+zz+'_'+indek,12,'(123)-1231239','#555','normal')
      +abc.teks(70,125+tinggi_top,'lbl_fax_'+zz+'_'+indek,12,'Fax:','#555','normal')
      +abc.teks(120,125+tinggi_top,'txt_fax_'+zz+'_'+indek,12,'(021)-8297799','#555','normal')

      // title
      +abc.teks(450,50+tinggi_top,'txt_title',30,'Purchase Order','#555','bold')
      +abc.teks(450,70+tinggi_top,'lbl_po_no_'+zz+'_'+indek,12,'Purchase Order#:','#555','Normal')
      +abc.teks(560,70+tinggi_top,'txt_po_no_'+zz+'_'+indek,12,'PO1234','#555','Normal')
      +abc.teks(450,90+tinggi_top,'lbl_date_'+zz+'_'+indek,12,'Date:','#555','Normal')
      +abc.teks(560,90+tinggi_top,'txt_date_'+zz+'_'+indek,12,'31/03/2026','#555','Normal')      
      +abc.teks(450,110+tinggi_top,'lbl_page',12,'Page:','#555','Normal')
      +abc.teks(560,110+tinggi_top,'txt_page',12,(zz+1)+' of '+kopi,'#555','Normal')      
      
      // vendor panel
      +abc.panel(1,150+tinggi_top,300,120,'#D3D3D3','#ffffff')
      +abc.teks(15,165+tinggi_top,'lbl_to',12,'To:','#555','Bold')
      
      // vendor address
      +abc.teks(15,190+tinggi_top,'txt_vendor_name_'+zz+'_'+indek,12,'Vendor Name','#555','Normal')
      +abc.teks(15,205+tinggi_top,'txt_vendor_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(15,220+tinggi_top,'txt_vendor_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(15,235+tinggi_top,'txt_vendor_country_'+zz+'_'+indek,12,'Country','#555','Normal')
      
      // ship panel
      +abc.panel(379,150+tinggi_top,300,120,'#D3D3D3','#ffffff')
      +abc.teks(390,165+tinggi_top,'lbl_ship_to',12,'Ship To:','#555','Bold')
      
      // ship_address
      +abc.teks(390,190+tinggi_top,'txt_ship_name_'+zz+'_'+indek,12,'Ship Name','#555','Normal')
      +abc.teks(390,205+tinggi_top,'txt_ship_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(390,220+tinggi_top,'txt_ship_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(390,235+tinggi_top,'txt_ship_country_'+zz+'_'+indek,12,'Country','#555','Normal')      

      // table terms 
      +abc.tabel(1,285+tinggi_top,430,40,'#D3D3D3','#ffffff',
        [100,260],[
          [18,300+tinggi_top,'Good Thru'],
          [150,300+tinggi_top,'Ship Via'],
          [320,300+tinggi_top,'Terms'],
        ],
      )
      
      +abc.teks(15,320+tinggi_top,'txt_good_thru_'+zz+'_'+indek,12,'Good Thru','#555','Normal')
      +abc.teks(150,320+tinggi_top,'txt_ship_id_'+zz+'_'+indek,12,'Ship Via','#555','Normal')
      +abc.teks(290,320+tinggi_top,'txt_discount_terms_'+zz+'_'+indek,12,'Discount Terms','#555','Normal')

      // table detail items
      +abc.tabel(1,340+tinggi_top,678,360,'#D3D3D3','#ffffff',
        [80,200,440,540],[
          [15,355+tinggi_top,'Quantity'],
          [120,355+tinggi_top,'Item ID'],
          [280,355+tinggi_top,'Description'],
          [460,355+tinggi_top,'Unit Cost'],
          [590,355+tinggi_top,'Amount']
        ],
      );

      let y=15;// ->space antara item 
      let z=0;
      
      for(let i=0;i<max_item;i++){//i==baris
        z=y*i;
        html+=abc.teksAnchor(70,380+z+tinggi_top,'txt_quantity_'+i+'_'+zz+'_'+indek,12,'Quantity','#555','Normal');
        html+=abc.teks(85,380+z+tinggi_top,'txt_item_id_'+i+'_'+zz+'_'+indek,12,'Item ID','#555','Normal');
        html+=abc.teks(210,380+z+tinggi_top,'txt_description_'+i+'_'+zz+'_'+indek,12,'Description','#555','Normal');
        html+=abc.teksAnchor(530,380+z+tinggi_top,'txt_unit_cost_'+i+'_'+zz+'_'+indek,12,'Unit Cost','#555','Normal');
        html+=abc.teksAnchor(660,380+z+tinggi_top,'txt_amount_'+i+'_'+zz+'_'+indek,12,'amount','#555','Normal');
      }

      // total
      html+=abc.kotak(441,700+tinggi_top,238,20,"#D3D3D3")
      +abc.garis(541,700+tinggi_top,541,700+20+tinggi_top)
      +abc.teks(445,715+tinggi_top,'lbl_total',12,'TOTAL','#555','Bold')
      +abc.teksAnchor(660,715+tinggi_top,'txt_amount_'+zz+'_'+indek,12,'Amount','#555','Bold')
    }

    html+='</svg>';
  content.html(indek,html);
  statusbar.ready(indek);
}


PurchaseOrders.binding=(indek,total_halaman,jumlah_baris,data_c,data_s,arr)=>{
  // company
  var dc=data_c;
  var ds=data_s;
  
  var ii=0;
  var hal;
  
  for(var k=0;k<total_halaman.length;k++){
    
    hal=k;
    
    
        setiH('txt_company_name_'+k+'_'+indek,dc.name);
        setiH('txt_street_1_'+k+'_'+indek,dc.address.street_1+' '+dc.address.street_2);
        setiH('txt_city_'+k+'_'+indek,dc.address.city+', '+dc.address.state+' '+dc.address.zip);
        setiH('txt_country_'+k+'_'+indek,dc.address.country);
        setiH('txt_fax_'+k+'_'+indek,dc.fax);
        setiH('txt_voice_'+k+'_'+indek,dc.phone);
        
        //render header - footer;
        setiH('txt_po_no_'+k+'_'+indek, ds.po_no);
        setiH('txt_date_'+k+'_'+indek, tglWest(ds.date));
        
        // vendor_address
        setiH('txt_vendor_name_'+k+'_'+indek, ds.vendor_name);
        setiH('txt_vendor_street_1_'+k+'_'+indek, ds.vendor_address.street_1);
        setiH('txt_vendor_city_'+k+'_'+indek, 
          String(ds.vendor_address.city).concat(
            ", ",ds.vendor_address.state,
            " ",ds.vendor_address.zip));
        setiH('txt_vendor_country_'+k+'_'+indek, ds.vendor_address.country);
        
        // ship address
        setiH('txt_ship_name_'+k+'_'+indek, ds.ship_address.name);
        setiH('txt_ship_street_1_'+k+'_'+indek, ds.ship_address.street_1);
        setiH('txt_ship_city_'+k+'_'+indek, 
          String(ds.ship_address.city).concat(
            ", ",ds.ship_address.state,
            " ",ds.ship_address.zip));
        setiH('txt_ship_country_'+k+'_'+indek, ds.ship_address.country);
        
        setiH('txt_good_thru_'+k+'_'+indek, tglWest(ds.good_thru));
        setiH('txt_ship_id_'+k+'_'+indek, ds.ship_id);
        setiH('txt_discount_terms_'+k+'_'+indek, ds.discount_terms.displayed);
        setiH('txt_amount_'+k+'_'+indek, ds.amount);
        
        //render detail items
        
        for(i=0;i<jumlah_baris;i++){
          for(var v=0;v<arr.length;v++){
            if(arr[v][0]===(k+1)){// halaman sama
              if(arr[ii]){
                
                setiH('txt_quantity_'+i+'_'+k+'_'+indek, arr[ii][1]);
                setiH('txt_item_id_'+i+'_'+k+'_'+indek, arr[ii][2]);
                setiH('txt_description_'+i+'_'+k+'_'+indek, arr[ii][3]);
                setiH('txt_unit_cost_'+i+'_'+k+'_'+indek, arr[ii][4]);
                setiH('txt_amount_'+i+'_'+k+'_'+indek, arr[ii][5]);
                
              }else{
                
                setiH('txt_quantity_'+i+'_'+k+'_'+indek, '');
                setiH('txt_item_id_'+i+'_'+k+'_'+indek, '');
                setiH('txt_description_'+i+'_'+k+'_'+indek, '');
                setiH('txt_unit_cost_'+i+'_'+k+'_'+indek, '');
                setiH('txt_amount_'+i+'_'+k+'_'+indek, '');
                
              }
            };
          };
          ii++;
        };

  }
}

// eof: 336;
