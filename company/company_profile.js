/*
 * auth: budiono
 * date: sep-05, 11:18, tue-2023; new;87;
 * edit: sep-17, 08:27, sun-2023; xHTML;
 * -----------------------------; happy new year 2024;
 * edit: feb-19, 16:36, mon-2024; fiscal-year
 * edit: sep-10, 16:25, tue-2024; r18;
 * edit: nov-18, 09:09, mon-2024; #27; record_lock;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 11:51, thu-2025; #32; 
 * edit: sep-28, 14:26, sun-2025; #77; decimal_places;
 */

'use strict';

var CompanyProfile={
  url:'company_info',
  title:"Company Information"
}

CompanyProfile.show=(tiket)=>{
  tiket.modul=CompanyProfile.url;
  tiket.menu.name=CompanyProfile.title;

  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    CompanyProfile.formView(indek);
  }else{
    show(baru);
  }  
}

CompanyProfile.formView=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  CompanyProfile.readOne(indek,()=>{
    toolbar.refresh(indek,()=>CompanyProfile.readOne(indek,()=>{}));
  });
}

CompanyProfile.readOne=(indek,callback)=>{
  bingkai[indek].metode='View';
  var html='<div style="padding:0 1rem 0 1rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"></div>'
  content.html(indek,html);

  db.execute(indek,{
    query:"SELECT * FROM company_information"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(ironman)=>{
    if (ironman.err.id==0 && ironman.count>0) {
      var d=objectOne(ironman.fields,ironman.data);
      var a=JSON.parse(d.address);
      var html='<div style="padding:0 1rem 0 1rem;">'
        +content.title(indek)
        
      +'<div style="display:grid;'
      +'grid-template-columns: repeat(2,1fr);">'
        +'<div>'
          +'<ul>'
          +'<li><label>Company File ID</label>: '+xHTML(d.company_id)+'</li>'
          +'<li><label>Company Name</label>: '+xHTML(d.name)
            +'</li>'
          +'<li><label>Address</label>: '+xHTML(a.street_1)+'</li>'
          +'<li><label>&nbsp;</label>: '+xHTML(a.street_2)+'</li>'
          +'<li><label>&nbsp;</label>: '+xHTML(a.country)+'</li>'
          +'<li><label>&nbsp;</label>: '+xHTML(a.city)+'</li>'
          +'<li><label>&nbsp;</label>: '+xHTML(a.state)+'</li>'
          +'<li><label>&nbsp;</label>: '+xHTML(a.zip)+'</li>'
          +'<li><label>Phone</label>: '+xHTML(d.phone)+'</li>'
          +'<li><label>Fax</label>: '+xHTML(d.fax)+'</li>'
          +'<li><label>Email Address</label>: '
            +xHTML(d.email_address)+'</li>'
          +'<li><label>Website</label>: '+xHTML(d.website)+'</li>'
          +'<li><label>Start Date</label>: '+tglIna2(d.start_date)
            +'</li>'
          +'<li><label>Fiscal Year</label>: '+d.fiscal_year+'</li>'
          +'<li><label>Decimal Places</label>: '
            +array_decimal_places[d.decimal_places]+'</li>'
          +'</ul>'
        +'</div>'
        +'<div>'
          +'<ul>'
          +'<li><p><img '
            +' id="folder_image_'+indek+'" '
            +' width="200" height="200" '
            +' src="'+bingkai[0].server.url+'logo'
            +'?login_id='+bingkai[indek].login.id
            +'&company_id='+d.company_id
            +'&company_logo='+d.company_logo
            +'&'+new Date()
            +'">'
            +'</p>'
          +'<input type="text" id="name_image_'+indek+'"'
            +' value="no_image.jpg" disabled class="b-text" hidden>' 
          +'</li>'
          +'</ul>'
        +'</div>'
      +'</div>';

      content.html(indek,html);

      return callback();
    }    
  });
}

CompanyProfile.readCursor=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM company_information"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    var m=CompanyProfile.model();
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      m.company_id=d.company_id;
      m.name=d.name;
      m.address=JSON.parse(d.address);
      m.phone=d.phone;
      m.fax=d.fax;
      m.company_logo=d.company_logo;
      
    }
    return callback(m);
  })
}

CompanyProfile.model=()=>{
  return {
    company_id:"",
    name: "",
    address: {},
    phone: "",
    mobile: "",
    fax: "",
    website: "",
    email_address: "",
    fiscal_years: "",
    start_date: "",
    decimal_places: -1,
    currency_id: "",
    company_logo: "",
    file_id: "",
  }
}

//eof: 87;105;
