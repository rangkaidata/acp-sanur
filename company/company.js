/*
 * name: budiono
 * date: sep-04, 12:10, mon-2023; new;388;
 * edit: sep-17, 07:41, sun-2023; xHTML
 * -----------------------------; happy new year 2024;
 * edit: feb-19, 15:35, mon-2024; add fiscal year;
 * edit: apr-02, 19:50, tue-2024; Basic SQL;
 * edit: jul-25, 17:54, thu-2024; r10;
 * edit: nov-13, 13:06, wed-2024; #26;
 * edit: nov-22, 15:05, fri-2024; #27; data_locker;
 * edit: dec-06, 11:09, fri-2024; #30; app to files;
 * edit: dec-09, 12:25, mon-2024; #30; directory;
 * edit: dec-16, 21:13, mon-2024; #31; properties;
 * edit: dec-19, 16:42, thu-2024; #31; properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-10, 15:25, mon-2025; #40; properties;
 * edit: feb-13, 16:21, thu-2025; #40; new properties;
 * edit: apr-27, 16:33, sun-2025; #51; restore button;
 * edit: aug-15, 20:39, fri-2025; #68; add date-show/hide;
 * edit: sep-28, 14:00, sun-2025; #76; decimal_places;
 */ 
 
'use strict';

var Company={}

Company.table_name='company';
Company.title='Company';
Company.form=new ActionForm2(Company);
Company.hideSelect=true;
Company.hideExport=true;
Company.hideImport=true;
Company.hideNext=true;
Company.hidePrevious=true;

Company.show=(tiket)=>{
  tiket.modul=Company.table_name;
  tiket.menu.name=Company.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    mkdir(indek,Company.table_name,(h)=>{
      Company.form.modePaging(indek);
    });
  }else{
    show(baru);
  }  
}

Company.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM company"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      console.log(paket.data);
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Company.readPaging=(indek)=>{
  toolbar.restore(indek,()=>{Company.restoreForm(indek)});
  
  bingkai[indek].metode=MODE_READ;
  Company.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT * "
      +" FROM company"
      +" ORDER BY company_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Company.readShow(indek);
    });
  })
}

Company.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var alamat;
  var logo;

  var html ='<div style="padding:0.5em;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table>'
    +'<th colspan="2">Logo</th>'
    +'<th colspan="2">Company<br>Name</th>'
    +'<th>Address</th>'
    +'<th>Fiscal<br>Year</th>'
    +'<th>Start Date</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'<th colspan="3">Action</th>';

  if (p.err.id===0){
    for (var x in d) {
      alamat=JSON.parse(d[x].address);
      n++;
      logo='<img style="height:60px;width:60px;" '
        +' src="'+bingkai[indek].server.url+'logo'
        +'?login_id='+bingkai[indek].login.id
        +'&company_id='+d[x].company_id
        +'&company_logo='+d[x].company_logo
        +'&tgl='+new Date()+'"'
/*        
        +' srcset="'+bingkai[indek].server.url+'logo'
        +'?login_id='+bingkai[indek].login.id
        +'&company_id='+d[x].company_id
        +'&company_logo='+d[x].company_logo
        +'&tgl='+new Date()+'"'
*/        
        +'>'
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td>'+logo+'</td>'
        +'<td>'  
          +'<button type="button" '
          +' onclick="Company.openFolder(\''+indek+'\''
          +',\''+d[x].company_id+'\')">'
          +xHTML(d[x].name)
          +'</button>'
        +'</td>'
        +'<td><span class="quote_text">'
          +d[x].company_id+'</span></td>'
        +'<td>'+xHTML(alamat.street_1)+'</td>'
        +'<td align="center">'+d[x].fiscal_year+'</td>'
        +'<td align="center">'
          +tglIna2(d[x].start_date)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'
          +tglInt(d[x].date_modified)+'</td>'

        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_open" '
          +' onclick="Company.openFolder(\''+indek+'\''
          +',\''+d[x].company_id+'\');">'
          +'</button></td>'

        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="Company.formUpdate(\''+indek+'\''
          +',\''+d[x].company_id+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Company.formDelete(\''+indek+'\''
          +',\''+d[x].company_id+'\');">'
          +'</button></td>'

        +'</tr>';
    }
  }
  html+='</table>'
    +'</div>';  
  content.html(indek,html);
  if(p.err.id!=0)content.infoPaket(indek,p);
  Company.form.addPagingFn(indek);// #here
}

Company.formCreate=(indek)=>{
  Company.formEntry(indek,MODE_CREATE);
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>Company.formPaging(indek));
  toolbar.save(indek,()=>Company.createExecute(indek));
}

Company.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<div>'
      +'<form autocomplete="off" '
      +' enctype="multipart/form-data"'
      +' id="form_'+indek+'">'

//      +'<div style="display:grid;'
//      +'grid-template-columns: repeat(2,1fr);">'
      +'<div>'
      +'<div style="float:left;width:50%;">'
        +'<ul>'
        
        +'<li><label>File ID:</label>'
          +'<input type="text"'
          +' id="company_id_'+indek+'"'
          +' size="15"></li>'
          
        +'<li><label>Company Name:</label>'
          +'<input type="text"'
          +' id="name_'+indek+'"'
          +' size="20"></li>'
          
        +'<li><label>Address:</label>'
          +'<input type="text"'
          +' id="street_1_'+indek+'"'
          +' size="20"></li>'
          
        +'<li><label>&nbsp;</label>'
          +'<input type="text" '
          +' id="street_2_'+indek+'"'
          +' size="20"></li>'
          
        +'<li><label>City:</label>'
          +'<input type="text"'
          +' id="city_'+indek+'"'
          +' size="20"></li>'
          
        +'<li><label>State:</label>'
          +'<input type="text"'
          +' id="state_'+indek+'"'
          +' size="10"></li>'
          
        +'<li><label>Zip Code:</label>'
          +'<input type="text" '
          +' id="zip_'+indek+'"'
          +' size="10"></li>'
          
        +'<li><label>Country:</label>'
          +'<input type="text" '
          +' id="country_'+indek+'"'
          +' size="20"></li>'
          
        +'<li><label>Phone:</label>'
          +'<input type="text" '
          +' id="phone_'+indek+'"'
          +' size="12"></li>'
          
        +'<li><label>Mobile:</label>'
          +'<input type="text" '
          +' id="mobile_'+indek+'"'
          +' size="12"></li>'
          
        +'<li><label>Fax:</label>'
          +'<input type="text" '
          +' id="fax_'+indek+'"'
          +' size="12"></li>'
          
        +'<li><label>Website:</label>'
          +'<input type="text" '
          +' id="website_'+indek+'"'
          +' size="20"></li>'
          
        +'<li><label>Email Address:</label>'
          +'<input type="text" '
          +' id="email_'+indek+'"'
          +' size="20">'
        +'</li>'

        +'<li><label>Decimal Places:</label>'
          +'<select id="decimal_places_'+indek+'">';
            for(var i=0;i<array_decimal_places.length;i++){
              html+='<option>'+array_decimal_places[i]+'</option>';
            }
          html+='</select>'
        +'</li>'
        
        +'<li><label>Base Currency:</label>'
          +'<select id="currency_id_'+indek+'">';
            for(var i=0;i<array_currencies.length;i++){
              html+='<option>'+array_currencies[i][0]+'</option>';
            }
          html+='</select>'
        +'</li>'
        +'</ul>'
      +'</div>'
      
      +'<div style="float:left;">'
        +'<ul>'
          +'<li><label>Start Date:</label>'
            +'<input type="date" '
              +' id="sdate_'+indek+'" '
              +' onchange="Company.changeYear(\''+indek+'\')"'
              +' onblur="Company.dateFakeShow('+indek+',\'sdate\')"'
              +' style="display:none;">'
            +'<input type="text" '
              +' id="sdate_fake_'+indek+'"'
              +' onfocus="Company.dateRealShow('+indek+',\'sdate\')"'
              +' size="9">'
          +'</li>'
            
          +'<li><label>Fiscal Year:</label>'
            +'<input type="text"'
            +' id="fiscal_year_'+indek+'"'
            +' style="text-align:center;"'
            +' size="5" >'
          +'</li>'

        +'</ul>'
        +'<br><br>'
        +'<fieldset style="border-radius:20px;">'
          +'<legend>Image</legend>'
          +'<input type="file" '
            +' name="file_logo" '
            +' id="fileToUpload_'+indek+'" accept="image/*" '
            +' onchange="loadFileLogo(event,'+indek+')">'
          +'<p>'
            +'<img id="folder_image_'+indek+'" '
            +' width="150" height="150"/ '
            +' src='+bingkai[indek].server.url+"logo"
            +'>'
/*            
            +'<iframe id="folder_image_'+indek+'" '
            +' width="150" height="150"/ '
            +' src='+bingkai[indek].server.url+"logo"
            +'>'
*/            
            +'</p>'
          +'<p>'
          +'<input type="text" id="company_logo_'+indek+'" '
            +' value="no_image.jpg" disabled '
            +' class="b-text" hidden>' 
            
          +'<button type="button" '
            +' onclick="noLogo('+indek+')">No image</button>'
          +'</p>'
        +'</fieldset>'
      +'</div>'

      
      //+'<div><p>ketiga</p></div>'
      //+'<div><p>keempat</p></div>'
      //+'<div><p>kelima</p></div>'
      

      +'</div>'
      +'</form>'
      +'<div style="float:left;">'
      +'<i>* Change lock status File Properties [ &#x2699 ]'
      +' to edit company.</i></div>'
    +'</div>'
    +'</div>'
    
    ;
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('sdate_'+indek).value=tglSekarang();
  document.getElementById('sdate_fake_'+indek).value=tglWest(tglSekarang());
  document.getElementById('company_id_'+indek).focus();
  
  if(metode!=MODE_CREATE){
    document.getElementById('company_id_'+indek).disabled=true;
    document.getElementById('sdate_fake_'+indek).disabled=true;
    document.getElementById('currency_id_'+indek).disabled=true;
    document.getElementById('decimal_places_'+indek).disabled=true;
  }

  // autofill
  var ids=new Date().getTime();
  document.getElementById('company_id_'+indek).value=String(ids);
  
  Company.changeYear(indek);
}

Company.kirimGambar=(indek)=>{
  uploadLogo(indek);
}

Company.changeYear=(indek)=>{
  var tahun=new Date(getEV('sdate_'+indek)).getFullYear();
  setEV('fiscal_year_'+indek,tahun);
}

Company.createExecute=(indek)=>{
  var address=JSON.stringify({
    "name":getEV("name_"+indek),
    "street_1":getEV("street_1_"+indek),
    "street_2":getEV("street_2_"+indek),
    "city":getEV("city_"+indek),
    "state":getEV("state_"+indek),
    "zip":getEV("zip_"+indek),
    "country":getEV("country_"+indek)
  })
  db.execute(indek,{
    query:"INSERT INTO company "
      +"(company_id,name,address,phone"
      +",mobile,fax,website,email_address"
      +",fiscal_year,start_date,company_logo"
      +",decimal_places,currency_id"
      +") VALUES "
      +"('"+getEV("company_id_"+indek)+"'"
      +",'"+getEV("name_"+indek)+"'"
      +",'"+address+"'"
      +",'"+getEV("phone_"+indek)+"'"
      +",'"+getEV("mobile_"+indek)+"'"
      +",'"+getEV("fax_"+indek)+"'"
      +",'"+getEV("website_"+indek)+"'"
      +",'"+getEV("email_"+indek)+"'"
      +",'"+getEV("fiscal_year_"+indek)+"'"
      +",'"+getEV("sdate_"+indek)+"'"
      +",'"+getEV("company_logo_"+indek)+"'"
      +",'"+getEI("decimal_places_"+indek)+"'"
      +",'"+getEV("currency_id_"+indek)+"'"
      +")"
  },(paket)=>{
    if(getEV("fileToUpload_"+indek)!=''){
      bingkai[indek].company_id=getEV("company_id_"+indek);
      uploadLogo(indek);
    }
  });
}

Company.readOne=(indek,eop)=>{
  db.execute(indek,{
    query:"SELECT * FROM company"
    +" WHERE company_id='"+bingkai[indek].company_id+"'"
  },(paket)=>{
    var d=objectOne(paket.fields,paket.data);
    var a=JSON.parse(d.address);
    var logo=bingkai[0].server.url+"logo"
      +'?login_id='+bingkai[indek].login.id
      +'&company_id='+d.company_id
      +'&company_logo='+d.company_logo
      +'&xyz='+new Date();
    
    setEV("company_id_"+indek, d.company_id);
    setEV("name_"+indek, d.name);
    setEV("street_1_"+indek, a.street_1);
    setEV("street_2_"+indek, a.street_2);
    setEV("city_"+indek, a.city);
    setEV("state_"+indek, a.state);
    setEV("zip_"+indek, a.zip);
    setEV("country_"+indek, a.country);
    setEV("phone_"+indek, d.phone);
    setEV("mobile_"+indek, d.mobile);
    setEV("fax_"+indek, d.fax);
    setEV("website_"+indek, d.website);
    setEV("email_"+indek, d.email_address);
    setEV("fiscal_year_"+indek, d.fiscal_year);
    setEV("sdate_"+indek, d.start_date);
    setEV("sdate_fake_"+indek, tglWest(d.start_date));
    setEV("company_logo_"+indek, d.company_logo);
    setEI("decimal_places_"+indek, d.decimal_places);

    // karena harus https, maka gunakan dua src dan srcset;
//    document.getElementById("folder_image_"+indek).srcset=logo
    document.getElementById("folder_image_"+indek).src=logo;

    bingkai[indek].db_path='/'
      +Company.table_name+'/'
      +d.company_id+'-'
      +d.date_created;
    
    statusbar.ready(indek);
    message.none(indek);
    return eop();
  });
}

Company.formUpdate=(indek,company_id)=>{
  bingkai[indek].company_id=company_id;
  Company.form.modeUpdate(indek);
}

Company.updateExecute=(indek)=>{
  var address=JSON.stringify({
    "name":getEV("name_"+indek),
    "street_1":getEV("street_1_"+indek),
    "street_2":getEV("street_2_"+indek),
    "city":getEV("city_"+indek),
    "state":getEV("state_"+indek),
    "zip":getEV("zip_"+indek),
    "country":getEV("country_"+indek)
  });
  
  db.execute(indek,{
    query:"UPDATE company "
      +" SET name='"+getEV("name_"+indek)+"', "
      +" address="+address+", "
      +" phone='"+getEV("phone_"+indek)+"', "
      +" mobile='"+getEV("mobile_"+indek)+"', "
      +" fax='"+getEV("fax_"+indek)+"', "
      +" website='"+getEV("website_"+indek)+"', "
      +" email_address='"+getEV("email_"+indek)+"', "
      +" company_logo='"+getEV("company_logo_"+indek)+"' "
      +" WHERE company_id='"+bingkai[indek].company_id+"' "
  },(paket)=>{
    if(paket.err.id==0){
      if(getEV("fileToUpload_"+indek)!=''){
        uploadLogo(indek);
      }
      Company.finalPath(indek);
    }
  });
}

Company.formDelete=(indek,company_id)=>{
  bingkai[indek].company_id=company_id;
  Company.form.modeDelete(indek);
}

Company.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM company"
      +" WHERE company_id='"+bingkai[indek].company_id+"'"
  },(p)=>{
    if(p.err.id==0) Company.finalPath(indek);
  });
}

Company.openFolder=(indek, company_id)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM company "
      +" WHERE company_id='"+company_id+"'"
  },(paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var tiket=JSON.parse(JSON.stringify(bingkai[indek]));

      tiket.parent=indek;
      tiket.menu.id="accounting"
      tiket.menu.name=xHTML(d.name);// filter;
      tiket.menu.type=1;
      tiket.menu.parent="";
      
      tiket.nama=d.name;
      
      tiket.company.id=d.company_id;
      tiket.company.name=d.name;
      tiket.company.decimal=d.decimal_places;
      
      tiket.invite.id=null;
      tiket.home.id='';
      
      antrian.push(tiket);
      
      Menu.klik(antrian.length-1);
      message.none(indek);  
  
    }
  });
}

Company.getOne=(indek,callBack)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM company "
      +" WHERE company_id='"+bingkai[indek].company.id+"' "
  },(paket)=>{
    return callBack(paket);
  });
}

Company.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM company "
      +" WHERE company_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR address LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR phone LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Company.search=(indek)=>{
  Company.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT * "
        +" FROM company"
        +" WHERE company_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR address LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR phone LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Company.readShow(indek);
    });
  });
}

Company.duplicate=(indek)=>{
  var id='copy_of '+getEV('company_id_'+indek);
  setEV('company_id_'+indek,id);
  disabled("company_id_"+indek);
  focus('company_id_'+indek);
}


Company.properties=(indek)=>{
  bingkai[indek].db_path="";
  db.execute(indek,{
    query:"SELECT company_id"
      +" FROM company "
      +" WHERE company_id='"+getEV('company_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=String(":/").concat(
        Company.table_name,"/",d.company_id);
    }
    if(p.err.id!=0){
      message.infoPaket(indek,p);
    }else{
      Properties.lookup(indek);
    }
  });
}

Company.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Company.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Company.properties(indek);})
  }
}

Company.restoreForm=(indek)=>{
  const tiket=JSON.parse(JSON.stringify(bingkai[0]));// destruct arr
  tiket.parent=0;
  tiket.menu.id="restore";
  tiket.menu.name="Restore Company";
//  tiket.menu.folder=t.folder;
  
  tiket.folder=bingkai[0].folder;
  antrian.push(tiket);
  Menu.klik(antrian.length-1);  
}

Company.dateRealShow=(indek,name)=>{
  document.getElementById(name+'_fake_'+indek).style.display="none";
  document.getElementById(name+'_'+indek).style.display="inline";
  document.getElementById(name+'_'+indek).focus();
}

Company.dateFakeShow=(indek,name)=>{
  document.getElementById(name+'_'+indek).style.display="none";
  document.getElementById(name+'_fake_'+indek).style.display="inline";
  document.getElementById(name+'_fake_'+indek).value=
  tglWest(document.getElementById(name+'_'+indek).value);
}


// eof: 388;400;485;518;589;
