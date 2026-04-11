/*
 * name: budiono;
 * date: may-02, 20:23, fri-2025; #53; exchange_rates;
 * edit: aug-15, 20:39, fri-2025; #68; add date-show/hide;
 */ 

'use strict';

var ExchangeRates={}
  
ExchangeRates.table_name='exchange_rates';
ExchangeRates.form=new ActionForm2( ExchangeRates );
ExchangeRates.currency=new CurrencyLook( ExchangeRates );

ExchangeRates.show=(tiket)=>{
  tiket.modul=ExchangeRates.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath(indek, ExchangeRates.table_name, (h)=>{
      mkdir(indek,h.folder,()=>{
        ExchangeRates.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

ExchangeRates.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM exchange_rates"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ExchangeRates.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ExchangeRates.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT currency_id,date,rate,"
        +" user_name,date_modified"
        +" FROM exchange_rates"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,currency_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ExchangeRates.readShow(indek);
    });
  })
}

ExchangeRates.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Date</th>'
      +'<th>Currency ID</th>'
      +'<th>Rate</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+tglWest(d[x].date)+'</td>'
      +'<td align="left">'+d[x].currency_id+'</td>'
      +'<td align="right">'+d[x].rate+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="ExchangeRates.formUpdate(\''+indek+'\''
        +',\''+d[x].currency_id+'\''
        +',\''+d[x].date+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="ExchangeRates.formDelete(\''+indek+'\''
        +',\''+d[x].currency_id+'\''
        +',\''+d[x].date+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ExchangeRates.form.addPagingFn(indek);
}

ExchangeRates.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html='<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    
    +'<ul>'
    
    +'<li><label>Currency ID:</label>'
      +'<input type="text" '
      +' id="currency_id_'+indek+'"'
      +' size="9">'
      
      +'<button type="button" '
      +' onclick="ExchangeRates.currency.getPaging(\''+indek+'\''
      +',\'currency_id_'+indek+'\');"'
      +' id="btn_find">'
      +'</button>'
      
      +'</li>'
      
    +'<li><label>Date:</label>'
      +'<input type="date"'
        +' id="date_'+indek+'"'
        +' onblur="dateFakeShow('+indek+',\'date\')"'
        +' style="display:none;">'
      +'<input type="text"'
        +' id="date_fake_'+indek+'"'
        +' onfocus="dateRealShow('+indek+',\'date\')"'
        +' size="10">'
    +'</li>'
      
    +'<li><label>Rate</label>'
      +'<label><input type="text"'
      +' id="rate_'+indek+'">'
      +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('currency_id_'+indek).focus();

  document.getElementById('date_'+indek).value=tglSekarang();
//  document.getElementById('date_fake_'+indek).value=tglWest(tglSekarang());
}

ExchangeRates.setCurrency=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;

  setEV(id_kolom, data.currency_id);
}

ExchangeRates.createExecute=(indek)=>{

  db.execute(indek,{
    query:"INSERT INTO exchange_rates "
    +"(admin_name,company_id,currency_id,date,rate)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("currency_id_"+indek)+"'"
    +",'"+getEV("date_"+indek)+"'"
    +",'"+getEV("rate_"+indek)+"'"
    +")"
  });
}

ExchangeRates.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM exchange_rates"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+bingkai[indek].currency_id+"'"
      +" AND date='"+bingkai[indek].date+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('currency_id_'+indek, d.currency_id );
      setEV('date_'+indek, d.date);
      setEV('date_fake_'+indek, tglWest(d.date) );
      setEV('rate_'+indek, d.rate);
      message.none(indek);
    }
    return callback();
  });
}

ExchangeRates.formUpdate=(indek,currency_id,date)=>{
  bingkai[indek].currency_id=currency_id;
  bingkai[indek].date=date;
  ExchangeRates.form.modeUpdate(indek);
}

ExchangeRates.updateExecute=(indek)=>{

  db.execute(indek,{
    query:"UPDATE exchange_rates "
      +" SET date='"+getEV("date_"+indek) +"',"
      +" rate='"+getEV("rate_"+indek)+"',"
      +" currency_id='"+getEV("currency_id_"+indek)+"'"
      
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+bingkai[indek].currency_id+"'"
      +" AND date='"+bingkai[indek].date+"'"
  },(p)=>{
    if(p.err.id==0) ExchangeRates.finalPath(indek);
  });
}

ExchangeRates.formDelete=(indek,currency_id,date)=>{
  bingkai[indek].currency_id=currency_id;
  bingkai[indek].date=date;
  ExchangeRates.form.modeDelete(indek);
}

ExchangeRates.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM exchange_rates"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+bingkai[indek].currency_id+"'"
      +" AND date='"+bingkai[indek].date+"'"
  },(p)=>{
    if(p.err.id==0) ExchangeRates.finalPath(indek);
  });
}

ExchangeRates.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM exchange_rates"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ExchangeRates.search=(indek)=>{
  ExchangeRates.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT currency_id,date,rate,"
        +" user_name,date_modified "
        +" FROM exchange_rates"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND currency_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ExchangeRates.readShow(indek);
    });
  });
}

ExchangeRates.exportExecute=(indek)=>{
  var table_name=ExchangeRates.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

ExchangeRates.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT currency_id,date,rate,"
      +" user_name,date_modified"
      +" FROM exchange_rates"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY currency_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ExchangeRates.selectShow(indek);
  });
}

ExchangeRates.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border="1">'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
        +'</td>'
      +'<th colspan="2">Currency ID</th>'
      +'<th>Date</th>'
      +'<th>Rate</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'"'
        +' value="'+d[x].currency_id+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].currency_id+'</td>'
      +'<td align="left">'+tglWest(d[x].date)+'</td>'
      +'<td align="left">'+d[x].rate+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

ExchangeRates.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM exchange_rates"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND currency_id = '"+d[i].currency_id+"'"
          +" AND date = '"+d[i].date+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

ExchangeRates.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO exchange_rates "
        +" (admin_name,company_id,currency_id,date,rate) "
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +",'"+d[i][3]+"'"
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

ExchangeRates.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('currency_id_'+indek).value;
  document.getElementById('currency_id_'+indek).disabled=false;
  document.getElementById('currency_id_'+indek).value=id;
  document.getElementById('currency_id_'+indek).focus();
}

ExchangeRates.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM exchange_rates "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND currency_id='"+getEV('currency_id_'+indek)+"' "
      +" AND date='"+getEV('date_'+indek)+"' "
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

ExchangeRates.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ExchangeRates.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ExchangeRates.properties(indek);})
  }
}



//eof: 420;443;
