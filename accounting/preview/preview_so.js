/*
 * name: acp-sanur;
 * auth: budiono;
 * date: mar-18, 21:20, wed-2026; #91; preview;
 * edit: apr-07, 16:00, tue-2025; #92; acp-sanur;acp-origin;
 */
 
SalesOrders.preview=(indek,kursor)=>{
  if(kursor){// dari-paging
    SalesOrders.readOffset(indek,0,(d)=>{
      SalesOrders.renderPreview(indek,d);
    });
    
  } else {// dari-update
    
    SalesOrders.readKeyset(indek,(d)=>{
      SalesOrders.renderPreview(indek,d);
    });
  }
}

SalesOrders.readOffset=(indek,val,callback)=>{
  
  setCursor(indek,val);

  db.run(indek,{
    query:"SELECT * "
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT 1"
      +" OFFSET "+bingkai[indek].offset
      
  },(p)=>{
    
    SalesOrders.setFields(p,(d)=>{
      bingkai[indek].customer_id=d.customer_id;
      bingkai[indek].so_no=d.so_no;
      return callback(d);
    });
  });
}

SalesOrders.renderPreview=(indek,d)=>{
  CompanyProfile.readCursor(indek,(c)=>{
    var logo=bingkai[0].server.url+'logo'
      +'?login_id='+bingkai[indek].login.id
      +'&company_id='+c.company_id
      +'&company_logo='+c.company_logo
      +'&'+new Date();
    
    SalesOrders.cacheItem(indek,d,(h)=>{
      
      var total_halaman=h.total_halaman;
      var jumlah_baris=h.jumlah_baris;
      var arr=h.arr;

      SalesOrders.template(
        indek,
        total_halaman.length,
        jumlah_baris,
        logo
      );
      
      SalesOrders.binding(indek,total_halaman,jumlah_baris,c,d,arr);
    });
  });
}

SalesOrders.cacheItem=(indek,s,callback)=>{

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

SalesOrders.template=(indek,kopi,max_item,logo)=>{
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
      +abc.teks(450,50+tinggi_top,'txt_title',30,'Sales Order','#555','bold')
      
      // number, date, ship, page;
      +abc.teks(450,65+tinggi_top,'lbl_so_no_'+zz+'_'+indek,12,'Sales Order#:','#555','Normal')
      +abc.teks(540,65+tinggi_top,'txt_so_no_'+zz+'_'+indek,12,'SO1234','#555','Normal')
      +abc.teks(450,80+tinggi_top,'lbl_date_'+zz+'_'+indek,12,'Date:','#555','Normal')
      +abc.teks(540,80+tinggi_top,'txt_date_'+zz+'_'+indek,12,'31/03/2026','#555','Normal')      
      +abc.teks(450,95+tinggi_top,'lbl_ship_date_'+zz+'_'+indek,12,'Ship Date:','#555','Normal')
      +abc.teks(540,95+tinggi_top,'txt_ship_date_'+zz+'_'+indek,12,'31/03/2026','#555','Normal')
      +abc.teks(450,110+tinggi_top,'lbl_page',12,'Page:','#555','Normal')
      +abc.teks(540,110+tinggi_top,'txt_page',12,(zz+1)+'/'+kopi,'#555','Normal')      
      
      // customer panel
      +abc.panel(1,170+tinggi_top,300,110,'#D3D3D3','#ffffff')
      +abc.teks(15,185+tinggi_top,'lbl_to',12,'To:','#555','Bold')
      
      // customer address
      +abc.teks(15,210+tinggi_top,'txt_customer_name_'+zz+'_'+indek,12,'Customer Name','#555','Normal')
      +abc.teks(15,225+tinggi_top,'txt_customer_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(15,240+tinggi_top,'txt_customer_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(15,255+tinggi_top,'txt_customer_country_'+zz+'_'+indek,12,'Country','#555','Normal')
      
      // ship panel
      +abc.panel(379,170+tinggi_top,300,110,'#D3D3D3','#ffffff')
      +abc.teks(390,185+tinggi_top,'lbl_ship_to',12,'Ship To:','#555','Bold')
      
      // ship_address
      +abc.teks(390,210+tinggi_top,'txt_ship_name_'+zz+'_'+indek,12,'Ship Name','#555','Normal')
      +abc.teks(390,225+tinggi_top,'txt_ship_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(390,240+tinggi_top,'txt_ship_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(390,255+tinggi_top,'txt_ship_country_'+zz+'_'+indek,12,'Country','#555','Normal')      
      
      // customer_id, po, sales_rep
      +abc.tabel(1,290+tinggi_top,lebar,40,'#D3D3D3','#ffffff',
        [lebar/3,(lebar/3*2)],[
          [80,290+15+tinggi_top,'Customer ID'],
          [300,290+15+tinggi_top,'PO Number'],
          [510,290+15+tinggi_top,'Sales Rep ID'],
        ],
      )
      
      +abc.teks(20,290+35+tinggi_top,'txt_customer_id_'+zz+'_'+indek,12,'Customer ID','#555','Normal')
      +abc.teks(240,290+35+tinggi_top,'txt_customer_po_'+zz+'_'+indek,12,'Customer PO','#555','Normal')
      +abc.teks(470,290+35+tinggi_top,'txt_sales_rep_id_'+zz+'_'+indek,12,'Sales Rep ID.','#555','Normal')
      
      // contact, ship_id, terms;
      +abc.tabel(1,340+tinggi_top,lebar,40,'#D3D3D3','#ffffff',
        [lebar/3,(lebar/3*2)],[
          [80,340+15+tinggi_top,'Contact'],
          [300,340+15+tinggi_top,'Shipping Method'],
          [510,340+15+tinggi_top,'Payment Terms'],
        ],
      )
      
      +abc.teks(20,340+35+tinggi_top,'txt_contact_'+zz+'_'+indek,12,'Contact','#555','Normal')
      +abc.teks(240,340+35+tinggi_top,'txt_ship_id_'+zz+'_'+indek,12,'Shipping Method','#555','Normal')
      +abc.teks(470,340+35+tinggi_top,'txt_display_terms_'+zz+'_'+indek,12,'Payment Terms','#555','Normal')
      
      // table items
      +abc.tabel(1,390+tinggi_top,678,400,'#D3D3D3','#ffffff',
        [80,200,440,540],[
          [15,390+15+tinggi_top,'Quantity'],
          [120,390+15+tinggi_top,'Item ID'],
          [280,390+15+tinggi_top,'Description'],
          [460,390+15+tinggi_top,'Unit Price'],
          [590,390+15+tinggi_top,'Amount']
        ],
      );
      
      
      let z=0;
      
      // list items
      for(let i=0;i<max_item;i++){//i==baris
        z=tinggi_spasi*i;
        html+=abc.teksAnchor(70,430+z+tinggi_top,'txt_quantity_'+i+'_'+zz+'_'+indek,12,'Quantity','#555','Normal');
        html+=abc.teks(85,430+z+tinggi_top,'txt_item_id_'+i+'_'+zz+'_'+indek,12,'Item ID','#555','Normal');
        html+=abc.teks(210,430+z+tinggi_top,'txt_description_'+i+'_'+zz+'_'+indek,12,'Description','#555','Normal');
        html+=abc.teksAnchor(530,430+z+tinggi_top,'txt_unit_cost_'+i+'_'+zz+'_'+indek,12,'Unit Cost','#555','Normal');
        html+=abc.teksAnchor(660,430+z+tinggi_top,'txt_amount_'+i+'_'+zz+'_'+indek,12,'amount','#555','Normal');
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
      
      // freight
      +abc.kotak(200+1,830+tinggi_top,478,20,"#ffff")
      +abc.garis(541,830+tinggi_top,541,830+20+tinggi_top)
      +abc.teks(210,830+15+tinggi_top,'lbl_freight_amount',12,'Freight','#555','Normal')
      +abc.teksAnchor(660,830+15+tinggi_top,'txt_freight_amount_'+zz+'_'+indek,12,'freight amount','#555','Normal')
      
      // total order
      +abc.kotak(200+1,850+tinggi_top,478,20,"#D3D3D3")
      +abc.garis(541,850+tinggi_top,541,850+20+tinggi_top)
      +abc.teks(210,850+15+tinggi_top,'lbl_total',12,'Total Order','#555','Bold')
      +abc.teksAnchor(660,850+15+tinggi_top,'txt_total_'+zz+'_'+indek,12,'total order','#555','Bold')

    }
//--------------------------------------------------------------------//    
  html+='</svg>';//close
  content.html(indek,html);
  statusbar.ready(indek);
}

//SalesOrders.binding=(indek,hal,ii,jumlah_baris,data_c,data_s,arr)=>{
SalesOrders.binding=(indek,total_halaman,jumlah_baris,data_c,data_s,arr)=>{
  // company
  var dc=data_c;
  var ds=data_s;
  
  var ii=0;
  var hal;
  
  for(var k=0;k<total_halaman.length;k++){
    
    hal=k;
  
    setiH('txt_company_name_'+hal+'_'+indek,dc.name);
    setiH('txt_street_1_'+hal+'_'+indek,dc.address.street_1+' '+dc.address.street_2);
    setiH('txt_city_'+hal+'_'+indek,dc.address.city+', '+dc.address.state+' '+dc.address.zip);
    setiH('txt_country_'+hal+'_'+indek,dc.address.country);
    setiH('txt_fax_'+hal+'_'+indek,dc.fax);
    setiH('txt_voice_'+hal+'_'+indek,dc.phone);
    
    // so_no, date, ship
    setiH('txt_so_no_'+hal+'_'+indek, ds.so_no);
    setiH('txt_date_'+hal+'_'+indek, tglWest(ds.date));
    setiH('txt_ship_date_'+hal+'_'+indek, tglWest(ds.ship_date));
    
    // customer address
    setiH('txt_customer_name_'+hal+'_'+indek, ds.customer_name);
    setiH('txt_customer_street_1_'+hal+'_'+indek, ds.customer_address.street_1);
    setiH('txt_customer_city_'+hal+'_'+indek, 
      String(ds.customer_address.city).concat(
        ", ",ds.customer_address.state,
        " ",ds.customer_address.zip));
    setiH('txt_customer_country_'+hal+'_'+indek, ds.customer_address.country);
    
    // ship address
    setiH('txt_ship_name_'+hal+'_'+indek, ds.ship_address.name);
    setiH('txt_ship_street_1_'+hal+'_'+indek, ds.ship_address.street_1);
    setiH('txt_ship_city_'+hal+'_'+indek, 
      String(ds.ship_address.city).concat(
        ", ",ds.ship_address.state,
        " ",ds.ship_address.zip));
    setiH('txt_ship_country_'+hal+'_'+indek, ds.ship_address.country);
    
    // customer ID,
    setiH('txt_customer_id_'+hal+'_'+indek, ds.customer_id);
    setiH('txt_customer_po_'+hal+'_'+indek, ds.customer_po);
    setiH('txt_sales_rep_id_'+hal+'_'+indek, ds.sales_rep_id);
    setiH('txt_ship_id_'+hal+'_'+indek, ds.ship_id);
    setiH('txt_display_terms_'+hal+'_'+indek, ds.discount_terms.displayed);
    
    // tax_amount
    var subtotal=Number(ds.total)
      -Number(ds.tax_amount)
      -Number(ds.freight_amount)
    setiH('txt_subtotal_'+hal+'_'+indek, Number(subtotal).toFixed(2));
    setiH('txt_tax_amount_'+hal+'_'+indek, Number(ds.tax_amount).toFixed(2));
    setiH('txt_freight_amount_'+hal+'_'+indek, Number(ds.freight_amount).toFixed(2));
    setiH('txt_total_'+hal+'_'+indek, Number(ds.total).toFixed(2));
    
    // detail items;
    var i,v;

    for(i=0;i<jumlah_baris;i++){
      for(v=0;v<arr.length;v++){
        if(arr[v][0]===(hal+1)){// halaman sama
          if(arr[ii]){
            
            setiH('txt_quantity_'+i+'_'+hal+'_'+indek, arr[ii][1]);
            setiH('txt_item_id_'+i+'_'+hal+'_'+indek, arr[ii][2]);
            setiH('txt_description_'+i+'_'+hal+'_'+indek, arr[ii][3]);
            setiH('txt_unit_cost_'+i+'_'+hal+'_'+indek, arr[ii][4] );
            setiH('txt_amount_'+i+'_'+hal+'_'+indek, arr[ii][5]);
            
          }else{
            
            setiH('txt_quantity_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_item_id_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_description_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_unit_cost_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_amount_'+i+'_'+hal+'_'+indek, '');
            
          }
        };
      };
      ii++;
    };
  };
};

SalesOrders.readKeyset=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"

  },(p)=>{
    SalesOrders.setFields(p,(d)=>{
      return callback(d);
    });
  });  
}

SalesOrders.setFields=(p,callback)=>{
  var m={
    quote_no:"",
    customer_id: "",
    customer_name:"",
    customer_address:{},
    so_no:"",
    date:"",
    status:0,
    ship_address:{},
    customer_po:"",
    ship_id:"",
    discount_terms:{},
    sales_rep_id:"",
    detail:[],
    ar_account_id:"",
    sales_tax_id:"",
    sales_tax_rate:0,
    tax_amount:0,
    freight_account_id:"",
    freight_amount:0,
    total:0,
    note:[],
    file_id:"",
  }  
  
  if(p.count>0) {
    var d=objectOne(p.fields,p.data) ;

    m.quote_no=d.quote_no;
    m.customer_id=d.customer_id;
    m.customer_name=d.customer_name;
    m.customer_address=JSON.parse(d.customer_address);
    m.so_no=d.so_no;
    m.date=d.date;
    m.status=d.status;
    m.ship_address=JSON.parse(d.ship_address);
    m.customer_po=d.customer_po;
    m.ship_id=d.ship_id;
    m.discount_terms=JSON.parse(d.discount_terms);
    m.sales_rep_id=d.sales_rep_id;
    m.detail=JSON.parse(d.detail);
    m.ar_account_id=d.ar_account_id;
    m.sales_tax_id=d.sales_tax_id;
    m.sales_tax_rate=d.sales_tax_rate;
    m.tax_amount=d.tax_amount;
    m.freight_account_id=d.freight_account_id;
    m.freight_amount=d.freight_amount;
    m.total=d.total
    m.note=JSON.parse(d.note)
    m.file_id=d.file_id;
    
  }
  
  return callback(m);
}

SalesOrders.nextPrevious=(indek,val)=>{
  SalesOrders.readOffset(indek,val,(d)=>{
    if(bingkai[indek].metode==MODE_VIEW){// mode-preview

      SalesOrders.renderPreview(indek,d);
      
    }else{// mode-update;
      
      SalesOrders.formUpdate(indek,d.customer_id,d.so_no);
    }
  });  
}


// eof: 424;


/*
SalesOrders.readCursor=(indek,kursor,callback)=>{
  if(bingkai[indek].offset==undefined) bingkai[indek].offset=0;
  
  var sql;

  if(kursor==true){// by kursor
    sql="SELECT * "
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT 1"
      +" OFFSET "+bingkai[indek].offset;
      
  } else{ // by primary key
    
    sql="SELECT * "
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"
  }
  
  db.run(indek,{
    query:sql
      
  },(paket)=>{
    
    var m=SalesOrders.fields();
    
    if(paket.count>0) {
      var d=objectOne(paket.fields,paket.data) ;

      m.quote_no=d.quote_no;
      m.customer_id=d.customer_id;
      m.customer_name=d.customer_name;
      m.customer_address=JSON.parse(d.customer_address);
      m.so_no=d.so_no;
      m.date=d.date;
      m.status=d.status;
      m.ship_address=JSON.parse(d.ship_address);
      m.customer_po=d.customer_po;
      m.ship_id=d.ship_id;
      m.discount_terms=JSON.parse(d.discount_terms);
      m.sales_rep_id=d.sales_rep_id;
      m.detail=JSON.parse(d.detail);
      m.ar_account_id=d.ar_account_id;
      m.sales_tax_id=d.sales_tax_id;
      m.sales_tax_rate=d.sales_tax_rate;
      m.tax_amount=d.tax_amount;
      m.freight_account_id=d.freight_account_id;
      m.freight_amount=d.freight_amount;
      m.total=d.total
      m.note=JSON.parse(d.note)
      m.file_id=d.file_id;
      
    }else{
      if(bingkai[indek].offset>0) bingkai[indek].offset--;
    }
    return callback(m);
  })
}



SalesOrders.render=(indek,c,s)=>{
  var halaman=0;
  var jumlah_baris=23;
  var lebar_deskripsi=35
  var total_halaman=[];
  
  var data_c=c;
  var data_s=s;
  var i=0;
  var quantity='';
  var arr=[];
  var new_line;
  var berapa_kali;
  var deskripsi;
  var total_loop=0;
  var logo;
  
  var a=data_s.detail;//ambil detail items;
  
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
    
  logo=bingkai[0].server.url+'logo'
    +'?login_id='+bingkai[indek].login.id
    +'&company_id='+data_c.company_id
    +'&company_logo='+data_c.company_logo
    +'&'+new Date();
  
  SalesOrders.template(indek,
    total_halaman.length,
    jumlah_baris,
    logo
  );
  
  // binding 
  var ii=0;
  
  for(var k=0;k<total_halaman.length;k++){
    SalesOrders.binding(indek,k,ii,jumlah_baris,data_c,data_s,arr);
  }
}

SalesOrders.binding=(indek,hal,ii,jumlah_baris,data_c,data_s,arr)=>{
  // company
  var dc=data_c;
  var ds=data_s;
  
  setiH('txt_company_name_'+hal+'_'+indek,dc.name);
  setiH('txt_street_1_'+hal+'_'+indek,dc.address.street_1+' '+dc.address.street_2);
  setiH('txt_city_'+hal+'_'+indek,dc.address.city+', '+dc.address.state+' '+dc.address.zip);
  setiH('txt_country_'+hal+'_'+indek,dc.address.country);
  setiH('txt_fax_'+hal+'_'+indek,dc.fax);
  setiH('txt_voice_'+hal+'_'+indek,dc.phone);
  
  // so_no, date, ship
  setiH('txt_so_no_'+hal+'_'+indek, ds.so_no);
  setiH('txt_date_'+hal+'_'+indek, tglWest(ds.date));
  setiH('txt_ship_date_'+hal+'_'+indek, tglWest(ds.ship_date));
  
  // customer address
  setiH('txt_customer_name_'+hal+'_'+indek, ds.customer_name);
  setiH('txt_customer_street_1_'+hal+'_'+indek, ds.customer_address.street_1);
  setiH('txt_customer_city_'+hal+'_'+indek, 
    String(ds.customer_address.city).concat(
      ", ",ds.customer_address.state,
      " ",ds.customer_address.zip));
  setiH('txt_customer_country_'+hal+'_'+indek, ds.customer_address.country);
  
  // ship address
  setiH('txt_ship_name_'+hal+'_'+indek, ds.ship_address.name);
  setiH('txt_ship_street_1_'+hal+'_'+indek, ds.ship_address.street_1);
  setiH('txt_ship_city_'+hal+'_'+indek, 
    String(ds.ship_address.city).concat(
      ", ",ds.ship_address.state,
      " ",ds.ship_address.zip));
  setiH('txt_ship_country_'+hal+'_'+indek, ds.ship_address.country);
  
  // customer ID,
  setiH('txt_customer_id_'+hal+'_'+indek, ds.customer_id);
  setiH('txt_customer_po_'+hal+'_'+indek, ds.customer_po);
  setiH('txt_sales_rep_id_'+hal+'_'+indek, ds.sales_rep_id);
  setiH('txt_ship_id_'+hal+'_'+indek, ds.ship_id);
  setiH('txt_display_terms_'+hal+'_'+indek, ds.discount_terms.displayed);
  
  // tax_amount
  var subtotal=Number(ds.total)
    -Number(ds.tax_amount)
    -Number(ds.freight_amount)
  setiH('txt_subtotal_'+hal+'_'+indek, Number(subtotal).toFixed(2));
  setiH('txt_tax_amount_'+hal+'_'+indek, Number(ds.tax_amount).toFixed(2));
  setiH('txt_freight_amount_'+hal+'_'+indek, Number(ds.freight_amount).toFixed(2));
  setiH('txt_total_'+hal+'_'+indek, Number(ds.total).toFixed(2));
  
  // detail items;
  var i,v;

  for(i=0;i<jumlah_baris;i++){
    for(v=0;v<arr.length;v++){
      if(arr[v][0]===(hal+1)){// halaman sama
        if(arr[ii]){
          
          setiH('txt_quantity_'+i+'_'+hal+'_'+indek, arr[ii][1]);
          setiH('txt_item_id_'+i+'_'+hal+'_'+indek, arr[ii][2]);
          setiH('txt_description_'+i+'_'+hal+'_'+indek, arr[ii][3]);
          setiH('txt_unit_cost_'+i+'_'+hal+'_'+indek, arr[ii][4] );
          setiH('txt_amount_'+i+'_'+hal+'_'+indek, arr[ii][5]);
          
        }else{
          
          setiH('txt_quantity_'+i+'_'+hal+'_'+indek, '');
          setiH('txt_item_id_'+i+'_'+hal+'_'+indek, '');
          setiH('txt_description_'+i+'_'+hal+'_'+indek, '');
          setiH('txt_unit_cost_'+i+'_'+hal+'_'+indek, '');
          setiH('txt_amount_'+i+'_'+hal+'_'+indek, '');
          
        }
      };
    };
    ii++;
  };
}

SalesOrders.template=(indek,kopi,max_item,logo)=>{
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
      +abc.teks(450,50+tinggi_top,'txt_title',30,'Sales Order','#555','bold')
      
      // number, date, ship, page;
      +abc.teks(450,65+tinggi_top,'lbl_so_no_'+zz+'_'+indek,12,'Sales Order#:','#555','Normal')
      +abc.teks(540,65+tinggi_top,'txt_so_no_'+zz+'_'+indek,12,'SO1234','#555','Normal')
      +abc.teks(450,80+tinggi_top,'lbl_date_'+zz+'_'+indek,12,'Date:','#555','Normal')
      +abc.teks(540,80+tinggi_top,'txt_date_'+zz+'_'+indek,12,'31/03/2026','#555','Normal')      
      +abc.teks(450,95+tinggi_top,'lbl_ship_date_'+zz+'_'+indek,12,'Ship Date:','#555','Normal')
      +abc.teks(540,95+tinggi_top,'txt_ship_date_'+zz+'_'+indek,12,'31/03/2026','#555','Normal')
      +abc.teks(450,110+tinggi_top,'lbl_page',12,'Page:','#555','Normal')
      +abc.teks(540,110+tinggi_top,'txt_page',12,(zz+1)+'/'+kopi,'#555','Normal')      
      
      // customer panel
      +abc.panel(1,170+tinggi_top,300,110,'#D3D3D3','#ffffff')
      +abc.teks(15,185+tinggi_top,'lbl_to',12,'To:','#555','Bold')
      
      // customer address
      +abc.teks(15,210+tinggi_top,'txt_customer_name_'+zz+'_'+indek,12,'Customer Name','#555','Normal')
      +abc.teks(15,225+tinggi_top,'txt_customer_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(15,240+tinggi_top,'txt_customer_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(15,255+tinggi_top,'txt_customer_country_'+zz+'_'+indek,12,'Country','#555','Normal')
      
      // ship panel
      +abc.panel(379,170+tinggi_top,300,110,'#D3D3D3','#ffffff')
      +abc.teks(390,185+tinggi_top,'lbl_ship_to',12,'Ship To:','#555','Bold')
      
      // ship_address
      +abc.teks(390,210+tinggi_top,'txt_ship_name_'+zz+'_'+indek,12,'Ship Name','#555','Normal')
      +abc.teks(390,225+tinggi_top,'txt_ship_street_1_'+zz+'_'+indek,12,'Street_1','#555','Normal')
      +abc.teks(390,240+tinggi_top,'txt_ship_city_'+zz+'_'+indek,12,'City','#555','Normal')
      +abc.teks(390,255+tinggi_top,'txt_ship_country_'+zz+'_'+indek,12,'Country','#555','Normal')      
      
      // customer_id, po, sales_rep
      +abc.tabel(1,290+tinggi_top,lebar,40,'#D3D3D3','#ffffff',
        [lebar/3,(lebar/3*2)],[
          [80,290+15+tinggi_top,'Customer ID'],
          [300,290+15+tinggi_top,'PO Number'],
          [510,290+15+tinggi_top,'Sales Rep ID'],
        ],
      )
      
      +abc.teks(20,290+35+tinggi_top,'txt_customer_id_'+zz+'_'+indek,12,'Customer ID','#555','Normal')
      +abc.teks(240,290+35+tinggi_top,'txt_customer_po_'+zz+'_'+indek,12,'Customer PO','#555','Normal')
      +abc.teks(470,290+35+tinggi_top,'txt_sales_rep_id_'+zz+'_'+indek,12,'Sales Rep ID.','#555','Normal')
      
      // contact, ship_id, terms;
      +abc.tabel(1,340+tinggi_top,lebar,40,'#D3D3D3','#ffffff',
        [lebar/3,(lebar/3*2)],[
          [80,340+15+tinggi_top,'Contact'],
          [300,340+15+tinggi_top,'Shipping Method'],
          [510,340+15+tinggi_top,'Payment Terms'],
        ],
      )
      
      +abc.teks(20,340+35+tinggi_top,'txt_contact_'+zz+'_'+indek,12,'Contact','#555','Normal')
      +abc.teks(240,340+35+tinggi_top,'txt_ship_id_'+zz+'_'+indek,12,'Shipping Method','#555','Normal')
      +abc.teks(470,340+35+tinggi_top,'txt_display_terms_'+zz+'_'+indek,12,'Payment Terms','#555','Normal')
      
      // table items
      +abc.tabel(1,390+tinggi_top,678,400,'#D3D3D3','#ffffff',
        [80,200,440,540],[
          [15,390+15+tinggi_top,'Quantity'],
          [120,390+15+tinggi_top,'Item ID'],
          [280,390+15+tinggi_top,'Description'],
          [460,390+15+tinggi_top,'Unit Price'],
          [590,390+15+tinggi_top,'Amount']
        ],
      );
      
      
      let z=0;
      
      // list items
      for(let i=0;i<max_item;i++){//i==baris
        z=tinggi_spasi*i;
        html+=abc.teksAnchor(70,430+z+tinggi_top,'txt_quantity_'+i+'_'+zz+'_'+indek,12,'Quantity','#555','Normal');
        html+=abc.teks(85,430+z+tinggi_top,'txt_item_id_'+i+'_'+zz+'_'+indek,12,'Item ID','#555','Normal');
        html+=abc.teks(210,430+z+tinggi_top,'txt_description_'+i+'_'+zz+'_'+indek,12,'Description','#555','Normal');
        html+=abc.teksAnchor(530,430+z+tinggi_top,'txt_unit_cost_'+i+'_'+zz+'_'+indek,12,'Unit Cost','#555','Normal');
        html+=abc.teksAnchor(660,430+z+tinggi_top,'txt_amount_'+i+'_'+zz+'_'+indek,12,'amount','#555','Normal');
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
      
      // freight
      +abc.kotak(200+1,830+tinggi_top,478,20,"#ffff")
      +abc.garis(541,830+tinggi_top,541,830+20+tinggi_top)
      +abc.teks(210,830+15+tinggi_top,'lbl_freight_amount',12,'Freight','#555','Normal')
      +abc.teksAnchor(660,830+15+tinggi_top,'txt_freight_amount_'+zz+'_'+indek,12,'freight amount','#555','Normal')
      
      // total order
      +abc.kotak(200+1,850+tinggi_top,478,20,"#D3D3D3")
      +abc.garis(541,850+tinggi_top,541,850+20+tinggi_top)
      +abc.teks(210,850+15+tinggi_top,'lbl_total',12,'Total Order','#555','Bold')
      +abc.teksAnchor(660,850+15+tinggi_top,'txt_total_'+zz+'_'+indek,12,'total order','#555','Bold')

    }
//--------------------------------------------------------------------//    
  html+='</svg>';//close
  content.html(indek,html);
  statusbar.ready(indek);
}

SalesOrders.readByArrow=(indek,val)=>{
  var kursor=0;

  if(bingkai[indek].offset!=undefined){
    kursor=bingkai[indek].offset;
  }

  kursor+=val;
  if(kursor<0) kursor=0; //stop-min
  if(kursor==Number(bingkai[indek].count)) kursor-=1; //stop-max  
  bingkai[indek].offset=kursor;
  
  SalesOrders.readCursor(indek,true,(d)=>{
    
    
    bingkai[indek].customer_id=d.customer_id;
    bingkai[indek].so_no=d.so_no;
    
    SalesOrders.formUpdate(indek,d.customer_id,d.so_no)
  });
}
*/
