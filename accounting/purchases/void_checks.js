/*
 * name: budiono;
 * code: H6;
 * path: /accounting/purchases/void_checks.js;
 * ------------------------------------------;
 * date: nov-17, 15:46, fri-2023; new;
 * edit: jul-21, 19:40, sun-2024; r9;
 * edit: sep-29, 09:25, sun-2024; r19; 
 * edit: nov-09, 13:09, sat-2024; #25; 
 * edit: nov-28, 13:16, thu-2024; #27; add locker();
 * edit: dec-02, 16:00, mon-2024; #27;2;
 * edit: dec-29, 22:59, sun-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 23:00, mon-2025; #41; file_id;
 * edit: mar-13, 17:44, thu-2025; #43; deep-folder;
 * edit: mar-27, 08:22, thu-2025; #45; ctables;cstructure; 
 * edit: aug-16, 10:58, sat-2025; #68; 
 * edit: oct-26, 20:37, sun-2025; #80;
 */
 
'use struct';

var VoidChecks={}

VoidChecks.table_name='void_checks';
VoidChecks.form=new ActionForm2(VoidChecks);
VoidChecks.check=new VendorCheckLook(VoidChecks);

VoidChecks.show=(karcis)=>{
  karcis.modul=VoidChecks.table_name;
  karcis.have_child=true;
  
  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    createFolder(indek,()=>{
      VoidChecks.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

VoidChecks.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM void_checks"
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

VoidChecks.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  VoidChecks.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,"
        +" void_no,date,amount,name,"
        +" user_name,date_modified"
        +" FROM void_checks"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,void_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VoidChecks.readShow(indek);
    });
  })
}

VoidChecks.readShow=(indek)=>{
  const p=bingkai[indek].paket;
  const d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table>'
    +'<tr>'
      +'<th colspan="2">Cash Acct. ID</th>'
      +'<th>Number</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Payee</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for(x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].cash_account_id+'</td>'
        +'<td align="left">'+d[x].void_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="VoidChecks.formDelete(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].void_no+'\');">'
          +'</button>'
          +'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  VoidChecks.form.addPagingFn(indek);// #here
}

VoidChecks.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;

  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"'
    +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off">'

    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;">'
      
      +'<div>'      
        +'<ul>'
        +'<li><label>Cash Acc. ID:</label>'
          +'<input type="text" '
          +' id="cash_account_id_'+indek+'"'
          +'  size="10"'
          +' disabled>'
          +'</li>'
          
        +'<li><label>Check No.:</label>'
          +'<input type="text"'
          +' id="check_no_'+indek+'"'
          +' size="10"'
          +' disabled>'
              +'<button type="button" id="btn_find" '
              +' onclick="VoidChecks.check.getPaging(\''+indek+'\''
              +',\'check_no_'+indek+'\')">'
              +'</button>'
          +'</li>'

        +'<li><label>Check Date:</label>'
          +'<input type="text"'
          +' id="check_date_'+indek+'"'
          +' size="10"'
          +' disabled>'
          +'</li>'
          
        +'<li><label>Amount:</label>'
          +'<input type="text"'
          +' id="check_amount_'+indek+'"'
          +' disabled'
          +' size="10"'
          +' style="text-align:center;">'
          +'</li>'
          

        +'</ul>'
      +'</div>'
      
      +'<div>'
        +'<ul>'
          +'<li><label>Void No.:</label>'
            +'<input type="text"'
            +' id="void_no_'+indek+'"'
            +' size="9">'
          +'</li>'
          +'<li><label>Date:</label>'
            +'<input type="date" '
              +' id="void_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'void_date\')"'
              +' style="display:none;">'
            +'<input type="text" '
              +' id="void_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'void_date\')"'
              +' size="9">'
          +'</li>'
          +'<li><label>Note:</label>'
            +'<input type="text"'
            +' id="void_note_'+indek+'"'
            +' size="20">'
          +'</li>'
        +'</ul>'
      +'</div>'

    +'</div>'
    +'</form>'
  +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('void_no_'+indek).focus();
  document.getElementById('void_date_'+indek).value=tglSekarang();
  document.getElementById('void_date_fake_'+indek).value=tglWest(tglSekarang());
}

VoidChecks.setCheck=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom, data.check_no );
  setEV('cash_account_id_'+indek, data.cash_account_id );
  setEV('check_date_'+indek, tglWest(data.check_date) );
  setEV('check_amount_'+indek, data.check_amount);
  
  setEV('void_no_'+indek, data.check_no+'V');
  setEV('void_date_'+indek, data.check_date);
  setEV('void_date_fake_'+indek, tglWest(data.check_date));
  setEV('void_note_'+indek, 'Add some note...');
}

VoidChecks.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO void_checks "
    +"(admin_name,company_id,cash_account_id,check_no"
    +",void_no,date,note)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV('cash_account_id_'+indek)+"'"
    +",'"+getEV('check_no_'+indek)+"'"
    +",'"+getEV('void_no_'+indek)+"'"
    +",'"+getEV('void_date_'+indek)+"'"
    +",'"+getEV('void_note_'+indek)+"'"
    +")"
  });
}

VoidChecks.readOne=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM void_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"' "
      +" AND void_no='"+bingkai[indek].void_no+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('cash_account_id_'+indek,d.cash_account_id);
      setEV('check_no_'+indek,d.check_no);
      setEV('check_date_'+indek,tglWest(d.check_date) );
      setEV('check_amount_'+indek, d.amount);
      
      setEV('void_no_'+indek, d.void_no);
      setEV('void_date_'+indek, d.date);
      setEV('void_date_fake_'+indek, tglWest(d.date));
      setEV('void_note_'+indek, d.note);
      message.none(indek);  
    }
    return callback();
  });
}

VoidChecks.formDelete=(indek, cash_account_id, void_no)=>{
  bingkai[indek].cash_account_id = cash_account_id;
  bingkai[indek].void_no = void_no;
  VoidChecks.form.modeDelete(indek);
}

VoidChecks.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM void_checks"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
  },(p)=>{
    if(p.err.id==0) VoidChecks.deadPath(indek);
  });
}

VoidChecks.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM void_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND void_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR cash_account_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

VoidChecks.search=(indek)=>{
  VoidChecks.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,"
        +" void_no,date,amount,name,"
        +" user_name,date_modified"
        +" FROM void_checks"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND void_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR cash_account_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      VoidChecks.readShow(indek);
    });
  });
}

VoidChecks.exportExecute=(indek)=>{
  var table_name=VoidChecks.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

VoidChecks.importExecute=(indek)=>{
  var n=0;
  var m="<h4>Message Proccess:</h4>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO void_checks "
      +"(admin_name,company_id,cash_account_id,check_no"
      +",void_no,date,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // cash_account_id
      +",'"+d[i][2]+"'" // check_no
      +",'"+d[i][3]+"'" // void_no
      +",'"+d[i][4]+"'" // date
      +",'"+d[i][5]+"'" // note
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

VoidChecks.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT cash_account_id,void_no,date,amount,name, "
      +" user_name,date_modified"
      +" FROM void_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    VoidChecks.selectShow(indek);
  });
}

VoidChecks.selectShow=(indek)=>{
  const p=bingkai[indek].paket;
  const d=objectMany(p.fields,p.data);
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
      +'<th colspan="2">Cash Acct. ID</th>'
      +'<th>Void #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Name</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'" >'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].cash_account_id+'</td>'
      +'<td align="left">'+d[x].void_no+'</td>'
      +'<td align="left">'+tglWest(d[x].date)+'</td>'
      +'<td align="left">'+ribuan(d[x].amount)+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

VoidChecks.deleteAllExecute=(indek)=>{
  const p=bingkai[indek].paket;
  const d=objectMany(p.fields,p.data);
  const e=document.getElementsByName('checked_'+indek);
  const c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM void_checks "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"' "
          +" AND void_no='"+d[i].void_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

VoidChecks.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM void_checks "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"'"
      +" AND void_no='"+getEV('void_no_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=d.file_id
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

VoidChecks.duplicate=(indek)=>{
  var id='copy_of '+getEV('void_no_'+indek);
  setEV('void_no_'+indek,id);
  focus('void_no_'+indek);
}

VoidChecks.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VoidChecks.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VoidChecks.properties(indek);})
  }
}





// eof: 360;431;443;460;515;494;497;
