/*
 * auth: budiono;
 * date: sep-04, 16:20, mon-2023; new;331;
 * edit: sep-11, 11:48, mon-2023; add;
 * edit: sep-17, 10:48, sun-2023; xHTML;
 * edit: sep-22, 14:27, fri-2023; default class;
 * edit: dec-27, 17:19, wed-2023; 
 * edit: dec-29, 08:14, fri-2023; add select button;
 * edit: dec-30, 10:00, sat-2023; ringkas; pagingAndLimit();
 * -----------------------------; happy new year 2024;
 * edit: jan-08, 16:35, mon-2024; getOne() pindah AccountLook_;
 * edit: jan-11, 08:25, thu-2024; re-write with class;
 * edit: mar-11, 23:26, mon-2024; new Basic SQL;
 * edit: mar-15, 14:34, fri-2024; masih di akrobat Basic SQL;
 * edit: mar-16, 20:03, sat-2024; readone;
 * edit: mar-18, 11:20, mon-2024; error;
 * edit: apr-22, 11:40, mon-2024; 
 * edit: jun-21, 20:39, fri-2024; BasicSQL;
 * edit: jul-26, 16:42, fri-2024; r-10;
 * edit: nov-23, 11:39, sat-2024; #27; add locker;
 * edit: nov-30, 17:11, sat-2024; #27; 
 * edit: dec-16, 18:07, mon-2024; #31; properties;
 * -----------------------------; happy new year 2025;
 * edit: feb-11, 10:52, tue-2025; #40; properties-2;
 * edit: feb-13, 16:22, thu-2025; #40; new properties;
 * edit: feb-14, 14:54, fri-2025; #40; new properties;
 * edit: mar-10, 22:02, mon-2025; #43; deep folder;
 * edit: mar-22, 13:57, sat-2025; #44; my_menu;
 */
 
'use strict';

var Accounts={};

Accounts.table_name='accounts';
Accounts.form=new ActionForm2(Accounts);

Accounts.show=(tiket)=>{
  tiket.modul=Accounts.table_name;
  tiket.bisa.tambah = 0;

  var baru = exist(tiket);
  if(baru == -1) {
    var newReg = new BingkaiUtama(tiket);
    var indek = newReg.show();
    createFolder(indek,()=>{
      Accounts.form.modePaging(indek);  
    });
  } else {
    show(baru);
  }  
}

Accounts.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM accounts"
    +" WHERE company_id='"+bingkai[indek].company.id+"'"
    +" AND admin_name='"+bingkai[indek].admin.name+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Accounts.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Accounts.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id, name, class, "
      +" user_name,date_modified"
      +" FROM accounts"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND admin_name='"+bingkai[indek].admin.name+"'"
      +" ORDER BY account_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Accounts.readShow(indek);
    });
  })
}

Accounts.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'

  +content.title(indek)
  +content.message(indek)
  +totalPagingandLimit(indek)
  +'<table border=1>'  
    +'<tr>'
      +'<th colspan="2">Account ID</th>'
      +'<th>Account Name</th>'
      +'<th>Account Class</th>'
      +'<th>User Name</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>'  
  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].account_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+array_account_class[d[x].class]+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="Accounts.formUpdate(\''+indek+'\''
          +',\''+d[x].account_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="Accounts.formDelete(\''+indek+'\''
          +',\''+d[x].account_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table>'
  +'</div>';

  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Accounts.form.addPagingFn(indek);
}

Accounts.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
      +'<ul>'      
        +'<li><label>Account ID:</label>'
          +'<input type="text" '
          +' id="account_id_'+indek+'">'
        +'</li>'
        +'<li><label>Account Name:</label>'
          +'<input type="text" '
          +' id="name_'+indek+'">'
        +'</li>'
        +'<li><label>Account Class:</label>'
          +'<select id="class_'+indek+'">'
            +getDataAccountClass(indek)
          +'</select>'
        +'</li>'
        +'<li><label>&nbsp;</label>'
          +'<label>'
            +'<input type="checkbox"'
            +' id="inactive_'+indek+'">Inactive'
          +'</label>'
        +'</li>'
      +'</ul>'
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode!=MODE_CREATE){
    document.getElementById('account_id_'+indek).disabled=true;
    document.getElementById('class_'+indek).disabled=true;
    document.getElementById('name_'+indek).focus();
  }else{
    document.getElementById('account_id_'+indek).focus();
  }
  if(bingkai[indek].class>0){
    setEI('class_'+indek,bingkai[indek].class)
  }
}

Accounts.getDir=(indek)=>{
  return {
    folder:'/'+bingkai[indek].company.id,
    name: Accounts.table_name
  };
}

Accounts.createExecute=(indek)=>{
  bingkai[indek].class=getEI('class_'+indek);
  db.execute(indek,{
    query:"INSERT INTO accounts"
    +" (admin_name,company_id,account_id,name,class,inactive)"
    +" VALUES ("
    +"'"+bingkai[indek].admin.name+"',"
    +"'"+bingkai[indek].company.id+"',"
    +"'"+getEV("account_id_"+indek)+"',"
    +"'"+getEV("name_"+indek)+"',"
    +" "+getEV("class_"+indek)+","
    +" "+getEC("inactive_"+indek)+")"
  });
}

Accounts.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * from accounts"
    +" WHERE admin_name='"+bingkai[indek].admin.name+ "'"
    +" AND company_id='"+bingkai[indek].company.id+ "'"
    +" AND account_id='"+bingkai[indek].account_id+"'"
  },(paket)=>{
    if (paket.count>0) {
      var d=objectOne(paket.fields,paket.data);
      setEV('account_id_'+indek,d.account_id);
      setEV('name_'+indek,d.name);
      setEV('class_'+indek,d.class);
      setEC('inactive_'+indek,d.inactive);

      statusbar.ready(indek);
      message.none(indek);
    }
    return callback();
  });
}

Accounts.formUpdate=(indek,account_id)=>{
  bingkai[indek].account_id=account_id;
  Accounts.form.modeUpdate(indek);
}

Accounts.updateExecute=(indek)=>{
  db.execute(indek,{
    query:"UPDATE accounts "
    +" SET name='"+getEV("name_"+indek)+"', "
    +" inactive='"+getEC("inactive_"+indek)+"' "
    +" WHERE admin_name='"+bingkai[indek].admin.name+"' "
    +" AND company_id='"+bingkai[indek].company.id+"' "
    +" AND account_id='"+bingkai[indek].account_id+"' "
  },(p)=>{
    if(p.err.id==0) Accounts.finalPath(indek);
  });
}

Accounts.formDelete=(indek,account_id)=>{
  bingkai[indek].account_id=account_id;
  Accounts.form.modeDelete(indek);
}

Accounts.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM accounts "
    +" WHERE admin_name='"+bingkai[indek].admin.name+"' "
    +" AND company_id='"+bingkai[indek].company.id+"' "
    +" AND account_id='"+bingkai[indek].account_id+"' "
  },(p)=>{
    if(p.err.id==0) Accounts.finalPath(indek);
  });
}

Accounts.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM accounts "
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Accounts.search=(indek)=>{
  Accounts.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT account_id, name, class, "
      +" user_name, date_modified"
      +" FROM accounts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Accounts.readShow(indek);
    });
  });
}

Accounts.exportExecute=(indek)=>{
  var table_name=Accounts.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Accounts.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO accounts "
      +"(admin_name,company_id,account_id,name,class,inactive)"
      +"VALUES ("
      +"'"+bingkai[indek].admin.name+"',"
      +"'"+bingkai[indek].company.id+"',"
      +"'"+d[i][1]+"',"
      +"'"+d[i][2]+"',"
      +" "+d[i][3]+" ,"
      +" "+d[i][4]+" "
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Accounts.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT  account_id, name, class, "
    +" user_name,date_modified"
    +" FROM accounts"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    +" ORDER BY account_id"
    +" LIMIT "+bingkai[indek].paging.limit
    +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Accounts.selectShow(indek);
  });
}

Accounts.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='';
 
  html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<br>'
  +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
      +'<th colspan="2">Account ID</th>'
      +'<th>Account Name</th>'
      +'<th>Account Class</th>'
      +'<th>User Name</th>'
      +'<th>Modified</th>'
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
        +'<td align="left">'+d[x].account_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+array_account_class[d[x].class]+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'</tr>';
      }
    }
  html+='</table>'
  +'</div>';

  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket( indek,p );
}

Accounts.deleteAllExecute=(indek)=>{
  var d=bingkai[indek].paket.data;
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM accounts "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"        
        +" AND account_id='"+d[i][0]+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

Accounts.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,account_id"
      +" FROM accounts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id='"+getEV('account_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=String(":/").concat(
        Accounts.table_name,"/",
        d.company_id,"/",
        d.account_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}


Accounts.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('account_id_'+indek).value;
  document.getElementById('account_id_'+indek).disabled=false;
  document.getElementById('account_id_'+indek).value=id;
  document.getElementById('account_id_'+indek).focus();
}

Accounts.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Accounts.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Accounts.properties(indek);});
  }
}



// eof:331;422;358;311;307;299;287;371;363;372;396;393;410;411;444;485;
// 466;467;
