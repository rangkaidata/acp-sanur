/*
 * name: budiono;
 * date: mar-18, 21:20, wed-2026; #91; preview;
 * edit: apr-04, 15:56, sat-2026; #91; 
 */
 


PayrollEntry.nextPrevious=(indek,val)=>{
  PayrollEntry.readOffset(indek,val,(d)=>{
    if(bingkai[indek].metode==MODE_VIEW){// mode-preview
      
      PayrollEntry.renderPreview(indek,d);
      
    }else{// mode-update;
      
      PayrollEntry.formUpdate(indek,d.cash_account_id,d.payroll_no);
      
    }
  });  

}

PayrollEntry.readOffset=(indek,val,callback)=>{

  setCursor(indek,val);

  db.run(indek,{
    query:"SELECT * "
      +" FROM payroll_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,payroll_no"
      +" LIMIT 1"
      +" OFFSET "+bingkai[indek].offset
      
  },(p)=>{
    
    PayrollEntry.setFields(p,(d)=>{// 
      bingkai[indek].cash_account_id=d.cash_account_id;
      bingkai[indek].payroll_no=d.payroll_no;
      bingkai[indek].employee_id=d.employee_id;

      return callback(d);
    });
  }); 
}

PayrollEntry.setFields=(p,callback)=>{
  var m={
    
    employee_id: "",
    employee_name: "",
    employee_address: {},
    payroll_no: "",
    date: "",
    net_amount: "",
    cash_account_id: "",
    cash_account_name: "",
    pay_frequency: 0,
    week: 0,
    pay_period: "",
    pay_method: 0,
    pay_hour: 0,
    pay_field: [],
    gross_amount: 0,
    employee_field: [],
    deduction_amount: 0,
    company_field: [],
    accrue_field: [],
    custom_field: [],
    file_id: "",
  }
  
  if(p.count>0){
    var d=objectOne(p.fields,p.data) ;

    m.employee_id=d.employee_id;
    m.employee_name=d.employee_name;
    m.employee_address=JSON.parse(d.employee_address);
    
    m.payroll_no=d.payroll_no;
    m.date=d.date;
    m.net_amount=d.net_amount;
    
    m.cash_account_id=d.cash_account_id;
    m.cash_account_name= d.cash_account_name;
    m.pay_frequency= d.pay_frequency;
    m.week= d.week;
    m.pay_period= d.pay_period;
    m.pay_method= d.pay_method;
    m.pay_hour= d.pay_hour;
    m.pay_field= JSON.parse(d.pay_field);
    m.gross_amount= d.gross_amount;
    m.employee_field= JSON.parse(d.employee_field);
    m.deduction_amount= d.deduction_amount;
    m.company_field= JSON.parse(d.company_field);
    m.accrue_field= JSON.parse(d.accrue_field);
    m.custom_field= JSON.parse(d.custom_field);
    m.file_id= d.file_id;
  }
  
  return callback(m);

}

PayrollEntry.preview=(indek,kursor)=>{
  
  if(kursor){// dari-paging
    PayrollEntry.readOffset(indek,0,(d)=>{
      PayrollEntry.renderPreview(indek,d);
    });
    
  } else {// dari-update
    
    PayrollEntry.readKeyset(indek,(d)=>{
      PayrollEntry.renderPreview(indek,d);
    });
  }
}

PayrollEntry.renderPreview=(indek,d)=>{

  Employees.readCursor(indek,(c)=>{

    PayrollEntry.cacheItem(indek,d,(h)=>{
      
      var total_halaman=h.total_halaman;
      var jumlah_baris=h.jumlah_baris;
      var arr=h.arr;

      PayrollEntry.template(
        indek,
        total_halaman.length,
        jumlah_baris
      );
      
      PayrollEntry.binding(indek,total_halaman,jumlah_baris,c,d,arr);
    });
  });

}

PayrollEntry.readKeyset=(indek,callback)=>{
  
  db.execute(indek,{
    query:"SELECT * "
      +" FROM payroll_entry"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND payroll_no='"+bingkai[indek].payroll_no+"'"

  },(p)=>{
    PayrollEntry.setFields(p,(d)=>{
      return callback(d);
    });
  });
}

PayrollEntry.template=(indek,kopi,max_item)=>{
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

      // employee_name;
      +abc.teks(10,50+tinggi_top,'lbl_employee_name_'+zz+'_'+indek,12,'Name:','#555','Normal')
      +abc.teks(100,50+tinggi_top,'txt_employee_name_'+zz+'_'+indek,12,'employee_name','#555','Normal')
      
      +abc.teks(10,50+15+tinggi_top,'lbl_page_'+zz+'_'+indek,12,'Page:','#555','Normal')
      +abc.teks(100,50+15+tinggi_top,'txt_page_'+zz+'_'+indek,12,(zz+1)+' of '+kopi,'#555','Normal')
      
      +abc.teks(450    ,50+tinggi_top,'lbl_employee_id_'+zz+'_'+indek,12,'Employee ID:','#555','Normal')
      +abc.teks(450+100,50+tinggi_top,'txt_employee_id_'+zz+'_'+indek,12,'employee_id','#555','Normal')
      
      +abc.teks(450    ,65+tinggi_top,'lbl_social_sec_'+zz+'_'+indek,12,'Social Sec#:','#555','Normal')
      +abc.teks(450+100,65+tinggi_top,'txt_social_sec_'+zz+'_'+indek,12,'social_sec','#555','Normal')
      
      // customer_id,good thru,displayed_terms,sales_rep
      +abc.tabel(1,80+tinggi_top,lebar,200,'#D3D3D3','#ffffff',
        [lebar/7,(lebar/7*2),(lebar/7*3),(lebar/7*4),(lebar/7*5),(lebar/7*6)],[
          [30,80+15+tinggi_top,'Field ID'],
          [110,80+15+tinggi_top,'This Check'],
          [200,80+15+tinggi_top,'YTD'],
          [300,80+15+tinggi_top,'Field ID'],
          [400,80+15+tinggi_top,'Hours'],
          [500,80+15+tinggi_top,'Rate'],
          [600,80+15+tinggi_top,'Total'],
        ],
      )

      let z=0;

      // list items
      for(let i=0;i<max_item;i++){//i==baris
        z=tinggi_spasi*i;
        html+=abc.teks(10,80+40+z+tinggi_top,'txt_field_name_'+i+'_'+zz+'_'+indek,12,'field_id','#555','Normal');
        html+=abc.teksAnchor(185,80+40+z+tinggi_top,'txt_amount_'+i+'_'+zz+'_'+indek,12,'amount','#555','Normal');
        html+=abc.teksAnchor(280,80+40+z+tinggi_top,'txt_amount_y_'+i+'_'+zz+'_'+indek,12,'amount_y','#555','Normal');
        
        html+=abc.teks(300,80+40+z+tinggi_top,'txt_field_name_b_'+i+'_'+zz+'_'+indek,12,'field_id_b','#555','Normal');
        html+=abc.teksAnchor(470,80+40+z+tinggi_top,'txt_hours_'+i+'_'+zz+'_'+indek,12,'hours','#555','Normal');
        html+=abc.teksAnchor(570,80+40+z+tinggi_top,'txt_rate_'+i+'_'+zz+'_'+indek,12,'rate','#555','Normal');
        html+=abc.teksAnchor(670,80+40+z+tinggi_top,'txt_total_'+i+'_'+zz+'_'+indek,12,'99.999.999.99','#555','Normal');
      }
      
      // net,payroll_no,date;
      html+=abc.teks(10,300+15+tinggi_top,'lbl_net_amount_',12,'Net Check:','#555','Normal')
      +abc.teksAnchor(180,300+15+tinggi_top,'txt_net_amount_'+zz+'_'+indek,12,'999.999.999.99','#555','Normal')
      
      +abc.teks(10,315+15+tinggi_top,'lbl_check_no',12,'Check #:','#555','Normal')
      +abc.teks(100,315+15+tinggi_top,'txt_payroll_no_'+zz+'_'+indek,12,'payroll_no','#555','Normal')
      
      +abc.teks(10,330+15+tinggi_top,'lbl_date_',12,'Date:','#555','Normal')
      +abc.teks(100,330+15+tinggi_top,'txt_date_'+zz+'_'+indek,12,'date','#555','Normal')
      
      // total, period beginning, ending, week
      +abc.teks(490,300+15+tinggi_top,'lbl_gross_amount_',12,'Total Gross:','#555','Normal')
      +abc.teksAnchor(670,300+15+tinggi_top,'txt_gross_amount_'+zz+'_'+indek,12,'total_gross','#555','Normal')
      
//      +abc.teks(400,315+15+tinggi_top,'lbl_period_begin_',12,'Period Beginning:','#555','Normal')
//      +abc.teks(520,315+15+tinggi_top,'txt_period_begin_'+zz+'_'+indek,12,'period_beginning','#555','Normal')
      
      +abc.teks(490,315+15+tinggi_top,'lbl_period_ending_',12,'Period Ending:','#555','Normal')
      +abc.teks(590,315+15+tinggi_top,'txt_period_ending_'+zz+'_'+indek,12,'period_ending','#555','Normal')
      
      +abc.teks(490,330+15+tinggi_top,'lbl_week_',12,'Week:','#555','Normal')
      +abc.teks(590,330+15+tinggi_top,'txt_week_'+zz+'_'+indek,12,'week','#555','Normal')
      
//      +abc.teks(400,345+50+tinggi_top,'lbl_print_',12,'Print:','#555','Normal')
      +abc.teks(520,345+50+tinggi_top,'txt_print_'+zz+'_'+indek,12,'print_date','#555','Normal')
      
//      +abc.teks(400,345+50+tinggi_top,'lbl_print_',12,'Print:','#555','Normal')
      +abc.teks(15,345+40+tinggi_top,'txt_word_'+zz+'_'+indek,12,'#Sembilan ratus juta sembilan puluh sembilan juta sembilan puluh sembilan ratus ','#555','Normal')
      +abc.teks(15,345+40+15+tinggi_top,'txt_word_'+zz+'_'+indek,12,'ribu sembilan puluh sembilan puluh sembilan koma sembilan puluh sembilan rupiah#','#555','Normal')
      
      // employee address
      +abc.teks(50,430+tinggi_top,'txt_name_'+zz+'_'+indek,12,'name','#555','Normal')
      +abc.teks(50,430+15+tinggi_top,'txt_street_1_'+zz+'_'+indek,12,'street_1','#555','Normal')
      +abc.teks(50,430+30+tinggi_top,'txt_city_'+zz+'_'+indek,12,'city','#555','Normal')
      +abc.teks(50,430+45+tinggi_top,'txt_country_'+zz+'_'+indek,12,'country','#555','Normal')
      
    }
//--------------------------------------------------------------------//    
  html+='</svg>';//close
  content.html(indek,html);
  statusbar.ready(indek);

}

PayrollEntry.cacheItem=(indek,s,callback)=>{
  var halaman=0;
  var jumlah_baris=10;
//  var lebar_deskripsi=36
  var total_halaman=[];
  
  var data_s=s;
  var i=0;
  var quantity='';
  var arr=[];
  var new_line;
  var berapa_kali;
//  var deskripsi;
  var total_loop=0;
  var logo;
  
  // ambil detail invoice items;
  // tambah detail so items;
  var a=[];
  
  var c=data_s.pay_field;
  var d=data_s.employee_field;
  
  for(i=0;i<1;i++){// baris pertama saja
    if(c[i].field_name){// not undefined
      a.push({
        field_name: c[i].field_name,
        amount: c[i].amount,
        amount_ytd: 0,
        field_name_b: "",
        hours: "",
        rate: "",
        total: "",
      });
    }
  }
  
  for(i=0;i<d.length;i++){
    if(d[i].field_name){// not undefined
      a.push({
        field_name: d[i].field_name,
        amount: d[i].amount,
        amount_ytd: 0,
        field_name_b: "",
        hours: "",
        rate: "",
        total: "",
      });
    }
  }

  for(i=0;i<c.length;i++){
    if(c[i].field_name){// not undefined
      if(a[i]){// edit
//        alert('e... '+c[i].field_name)
        a[i].field_name_b=c[i].field_name;
        a[i].hours=c[i].salary;
        a[i].rate=c[i].rate;
        a[i].total=c[i].amount;
        
//        alert(a[i].field_name_b);
        
      } else { // add
        alert('a')
        a.push({
          field_name: a[i].field_name,
          amount: a[i].amount,
          amount_ytd: a[i].amount_ytd,
          field_name_b: c[i].field_name,
          hours: c[i].salary,
          rate: c[i].rate,
          total: c[i].amount,
        });
      }
    }
  }

  for(i=0;i<a.length;i++){
    
//    deskripsi=a[i].description;
    berapa_kali=0;
/*    
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
*/    
//    if(berapa_kali==0){
      // tambah halaman bila item kena batas maksimal;
      if((arr.length % jumlah_baris)==0) {
        halaman++; 
        total_halaman.push([halaman])
      }
      
      arr.push([
        halaman,
        a[i].field_name,
        a[i].amount,
        a[i].amount_ytd,
        a[i].field_name_b,
        a[i].hours,
        a[i].rate, 
        a[i].total, 
      ])
//    };
  }
  
  return callback({
    total_halaman: total_halaman,
    jumlah_baris: jumlah_baris,
    arr: arr,
  });
}

PayrollEntry.binding=(indek,total_halaman,jumlah_baris,data_c,data_s,arr)=>{
  var dc=data_c;
  var ds=data_s;
  var de=data_s.employee_address;
  var soc_sec=data_c.social_security;
  
  var ii=0;
  var hal;
  
  for(var k=0;k<total_halaman.length;k++){
    
    hal=k;
  
    // address
    setiH('txt_name_'+hal+'_'+indek,de.name);
    setiH('txt_street_1_'+hal+'_'+indek,de.street_1+' '+de.street_2);
    setiH('txt_city_'+hal+'_'+indek,de.city+', '+de.state+' '+de.zip);
    setiH('txt_country_'+hal+'_'+indek,de.country);
    
    setiH('txt_employee_id_'+hal+'_'+indek,ds.employee_id);
    setiH('txt_employee_name_'+hal+'_'+indek,ds.employee_name);
    setiH('txt_social_sec_'+hal+'_'+indek,soc_sec);
    
    // net,payroll_no,date,gross,week
    setiH('txt_net_amount_'+hal+'_'+indek, Number(ds.net_amount).toFixed(2));
    setiH('txt_payroll_no_'+hal+'_'+indek, ds.payroll_no);
    setiH('txt_date_'+hal+'_'+indek, tglWest(ds.date));
    
    // gross_amount,period_end, week;
    setiH('txt_gross_amount_'+hal+'_'+indek, Number(ds.gross_amount).toFixed(2));
    setiH('txt_period_ending_'+hal+'_'+indek, tglWest(ds.pay_period) );
    setiH('txt_week_'+hal+'_'+indek, ds.week);
    
    setiH('txt_print_'+hal+'_'+indek, tglWest(tglSekarang()) );
    
    // detail items;
    var i,v;

    for(i=0;i<jumlah_baris;i++){
      for(v=0;v<arr.length;v++){
        if(arr[v][0]===(hal+1)){// halaman sama
          if(arr[ii]){
            
            setiH('txt_field_name_'+i+'_'+hal+'_'+indek, arr[ii][1]);
            setiH('txt_amount_'+i+'_'+hal+'_'+indek, Number(arr[ii][2]).toFixed(2));
            setiH('txt_amount_y_'+i+'_'+hal+'_'+indek, arr[ii][3]);
            
            setiH('txt_field_name_b_'+i+'_'+hal+'_'+indek, arr[ii][4]);
            setiH('txt_hours_'+i+'_'+hal+'_'+indek, arr[ii][5]);
            setiH('txt_rate_'+i+'_'+hal+'_'+indek, arr[ii][6]);
            setiH('txt_total_'+i+'_'+hal+'_'+indek, Number(arr[ii][7]).toFixed(2));
            
          }else{
            
            setiH('txt_field_name_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_amount_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_amount_y_'+i+'_'+hal+'_'+indek, '');
            
            setiH('txt_field_name_b_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_hours_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_rate_'+i+'_'+hal+'_'+indek, '');
            setiH('txt_total_'+i+'_'+hal+'_'+indek, '');
            
          }
        };
      };
      ii++;
    };

  }

}

