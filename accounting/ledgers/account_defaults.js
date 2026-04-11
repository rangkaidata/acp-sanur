/*
 * name: budiono;
 * file: 30;
 * path: /accounting/ledgers/account_defaults.js;
 * date: feb-19, 11:08, mon-2024;
 * edit: aug-27, 17:58, tue-2024; r14;
 * edit: sep-10, 18:06, tue-2024; r18; 
 * edit: dec-23, 15:22, mon-2024; #32; properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-19, 18:05, wed-2025; #30; new properties;
 * edit: mar-11, 14:23, tue-2025; #42; deep folder;
 * edit: mar-25, 15:40, tue-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:57, thu-2025; #50; export to csv;
 * edit: aug-14, 11:10, thu-2025; #67; add period ID
 */

'use strict';

var AccountDefaults={};

AccountDefaults.table_name='account_defaults';
AccountDefaults.account=new AccountLook(AccountDefaults);
AccountDefaults.period=new PeriodLook(AccountDefaults);

AccountDefaults.show=(karcis)=>{
  karcis.modul=AccountDefaults.table_name;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    var indek=newVen.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        AccountDefaults.formUpdate(indek);
      });
    });
  }else{
    show(baru);
  }
}

AccountDefaults.formEntry=(indek)=>{
 bingkai[indek].metode=MODE_UPDATE;
  var html='<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<form autocomplete="off">'
      +'<ul>'
        +'<li>'
          +'<label>Fiscal Year.</label>'
          +'<input type="text"'
            +' id="fiscal_year_'+indek+'"'
            +' style="text-align:center;"'
            +' size="8">'
        +'</li>'
        +'<li>'
          +'<label>Rounding Acct.</label>'
          +'<input type="text"'
            +' id="gl_account_id_'+indek+'"'
            +' onchange="AccountDefaults.getAccount(\''+indek+'\''
            +',\'gl_account_id_'+indek+'\')"'
            +',onfocus="this.select();"'
            +' style="text-align:center;"'
            +' size="8" >'
          +'<button type="button" id="gl_account_btn_'+indek+'" '
            +' class="btn_find"'
            +' onclick="AccountDefaults.account.getPaging(\''+indek+'\''
            +',\'gl_account_id_'+indek+'\''
            +',-1'
            +',\''+CLASS_EQUITY+'\')">'
          +'</button>'
          +'<input type="text" '
            +' id="gl_account_name_'+indek+'" disabled>'
        +'</li>'
        +'<li>'
          +'<label>Period ID</label>'
          +'<input type="text"'
            +' id="period_id_'+indek+'"'
            +' onchange="AccountDefaults.getAccount(\''+indek+'\''
            +',\'period_id_'+indek+'\')"'
            +',onfocus="this.select();"'
            +' style="text-align:center;"'
            +' size="8" >'
          +'<button type="button" id="period_btn_'+indek+'" '
            +' class="btn_find"'
            +' onclick="AccountDefaults.period.getPaging(\''+indek+'\''
            +',\'period_id_'+indek+'\''
            +',-1'
            +',\''+CLASS_EQUITY+'\')">'
          +'</button>'
        +'</li>'
      +'</ul>'
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  AccountDefaults.view(indek,true);
}

AccountDefaults.view=(indek,lock)=>{
  document.getElementById('fiscal_year_'+indek).disabled=lock;
  document.getElementById('gl_account_id_'+indek).disabled=lock;
  document.getElementById('period_id_'+indek).disabled=lock;

  document.getElementById('gl_account_btn_'+indek).disabled=lock;
  document.getElementById('period_btn_'+indek).disabled=lock;
}

AccountDefaults.formUpdate=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.refresh(indek,()=>AccountDefaults.formUpdate(indek));
  toolbar.more(indek,()=>Menu.more(indek));
  AccountDefaults.formEntry(indek);
  AccountDefaults.readOne(indek,()=>{
    toolbar.edit(indek,()=>{AccountDefaults.bentukEdit(indek);});
    toolbar.download(indek,()=>{AccountDefaults.formExport(indek);});
    toolbar.upload(indek,()=>{AccountDefaults.formImport(indek);});
  });
}

AccountDefaults.bentukEdit=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{AccountDefaults.formUpdate(indek);});
  toolbar.save(indek,()=>AccountDefaults.saveExecute(indek));
  toolbar.delet(indek,()=>AccountDefaults.deleteExecute(indek));
  toolbar.properties(indek,()=>AccountDefaults.properties(indek));
  AccountDefaults.view(indek,false);
}

AccountDefaults.readOne=(indek,callback)=>{
  db.execute(indek,{
    query: "SELECT * "
      +" FROM account_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.count>0){
      
      var d=objectOne(p.fields,p.data);

      setEV('fiscal_year_'+indek, d.fiscal_year);
      setEV('gl_account_id_'+indek, d.gl_account_id);
      setEV('gl_account_name_'+indek, d.gl_account_name);
      setEV('period_id_'+indek, d.period_id);
    };
    message.none(indek);
    return callback();
  });
}

AccountDefaults.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  setEV(id_kolom, data.account_id);
  AccountDefaults.getAccount(indek,id_kolom,baris);
}

AccountDefaults.getAccount=(indek,id_kolom,alias)=>{
  AccountDefaults.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (p)=>{
    var nm_account=txt_undefined;
    if(p.count!=0){
      var d=objectOne(p.fields,p.data);
      nm_account=d.name;
    }
    setEV('gl_account_name_'+indek, nm_account);
  });
}

AccountDefaults.setPeriod=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  setEV(id_kolom, data.period_id);
}

AccountDefaults.saveExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM account_defaults "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.count==0){
      AccountDefaults.createExecute(indek);
    }else{
      AccountDefaults.updateExecute(indek);
    }
  });
}

AccountDefaults.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO account_defaults"
      +"(admin_name,company_id,fiscal_year,gl_account_id,period_id)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('fiscal_year_'+indek)+"'"
      +",'"+getEV('gl_account_id_'+indek)+"'"
      +",'"+getEV('period_id_'+indek)+"'"
      +")"
  },(p)=>{
    bingkai[indek].metode=MODE_CREATE;
    if(p.err.id==0) AccountDefaults.bentukAkhir(indek);
  });
}

AccountDefaults.bentukAkhir=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{AccountDefaults.formUpdate(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{AccountDefaults.properties(indek);})
  }
}

AccountDefaults.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE account_defaults"
      +" SET fiscal_year='"+getEV('fiscal_year_'+indek)+"',"
      +" gl_account_id='"+getEV('gl_account_id_'+indek)+"',"
      +" period_id='"+getEV('period_id_'+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    bingkai[indek].metode=MODE_UPDATE;
    if(p.err.id==0) AccountDefaults.bentukAkhir(indek);
  });
}

AccountDefaults.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM account_defaults"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    bingkai[indek].metode=MODE_DELETE;
    if(p.err.id==0) AccountDefaults.bentukAkhir(indek);
  });
}

AccountDefaults.formExport=function(indek){
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>AccountDefaults.formUpdate(indek));
  AccountDefaults.exportExecute(indek);
}

AccountDefaults.exportExecute=(indek)=>{
  var sql={
    "select": "company_id,fiscal_year,gl_account_id",
    "from": "account_defaults",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'account_defaults');
}

AccountDefaults.formImport=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{AccountDefaults.formUpdate(indek);});
  iii.uploadJSON(indek);
}

AccountDefaults.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO account_defaults"
        +"(admin_name,company_id,fiscal_year,gl_account_id)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

AccountDefaults.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,date_created"
      +" FROM account_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        AccountDefaults.table_name,"/",
        d.company_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}




// eof: 178;219;226;278;284;281;

