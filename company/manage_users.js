/*
 * auth: budiono;
 * file: 28;
 * path: /company/manage_users.js;
 * date: sep-05, 09:52, tue-2023; new;522;
 * edit: sep-10, 21:52, tue-2023; 
 * -----------------------------; happy new year 2024;
 * edit: mar-26, 13:35, tue-2024; menu ganti bentuk dari object, ke array;
 * edit: mar-30, 11:04, sat-2024; Basic SQL;delete;
 * edit: mar-31, 17:32, sun-2024; export SQL;
 * edit: Apr-01, 10:19, mon-2024; sudah okeh;
 * edit: jul-27, 17:26, sat-2024; r-11;
 * edit: sep-06, 22:05, fri-2024; r17; revisi paling extrem;
 * edit: sep-08, 13:09, sun-2024; r17;
 * edit: dec-23, 10:59, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-19, 10:06, wed-2025; #40 new properties;
 * edit: mar-11, 11:16, mon-2025; #43; deep-folder;
 * edit: mar-25, 15:12, tue-2025; #45; ctables;cstructure;
 * edit: aug-15, 20:39, fri-2025; #68; add date-show/hide;
 */

'use strict';

var Users={}

Users.table_name="invite";
Users.menu=[];
Users.form=new ActionForm2(Users);

Users.show=(tiket)=>{
  tiket.modul=Users.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,Users.table_name,()=>{
        Users.form.modePaging(indek);
        Users.readMenu(indek);
      });
    });
  }else{
    show(baru);
  }
}

Users.readMenu=(indek)=>{// ini wadahnya;
  Users.menu=[];
  var isi={};
  var m=Menu.invite[0].data;
  
  db.run(indek,{
    query:"SELECT menu_sort,menu_parent,menu_id,menu_name "
      +",menu_type,menu_access "
      +" FROM my_menu "
  },(paket)=>{
    if(paket.count>0){
      m=objectMany(paket.fields,paket.data);
    }

    for(var i=0;i<m.length;i++){
//      if(m[i].menu_access>0){
        isi={
          'sort':m[i].menu_sort,
          'parent':m[i].menu_parent,
          'id':m[i].menu_id,
          'name':m[i].menu_name,
          'access':m[i].menu_access,
          'selected':0,
          'type': m[i].menu_type,
        }
        Users.menu.push(isi);
//      }
    }
    //Users.menu.sort(function(a, b){return a.sort - b.sort});
  })
}

Users.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM invite "
    +" WHERE company_id='"+bingkai[indek].company.id+"' "
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Users.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Users.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT "
      +" invite_note,company_id,company_name,user_name, "
      +" timeout_login,date_expired,menu_access,status,date_modified "
      +" FROM invite "
      +" WHERE company_id='"+bingkai[indek].company.id+"' "
      +" ORDER BY date_modified "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Users.readShow(indek);
    });
  })
}

Users.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0 1rem 0 1rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">User Name</th>'
    +'<th>Response</th>'
    +'<th>Company Name</th>'
    +'<th>Modified</th>'
    +'<th colspan=2>Action</th>'
    +'</tr>';
    
  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td>'+d[x].user_name+'</td>'
        +'<td align="center"><b>'
          +array_network_status[Number(d[x].status)]+'</b></td>'
        +'<td align="left">'+xHTML(d[x].company_name)+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>';
        if(d[x].status==2){// leave
          html+='<td align="center">x</td>';
        }else{
          html+='<td align="center">'
          +'<button type="button" '
          +' id="btn_key" '
          +' onclick="Users.formUpdate(\''+indek+'\''
          +',\''+d[x].user_name+'\');">Access</button>'
          +'</td>';
        }
        html+='<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Users.formDelete(\''+indek+'\''
          +',\''+d[x].user_name+'\');"></button>'
          +'</td>'
        +'</tr>';
    }
  }
  
  if (bingkai[indek].metode==MODE_READ){
    html+='</table><br>'
    +'<ul><li><b>Status Response:</b></li>'
    +'<li>1) <b>Waiting</b> menunggu konfirmasi dari user.</li>'
    +'<li>2) <b>JOIN</b>. user sudah gabung ke network.</li>'
    +'<li>3) <b>LEAVE</b>. user sudah keluar dari network.</li>'
    +'</ul>';
  }
  html+='</div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Users.form.addPagingFn(indek);
}

Users.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0 1rem 0 1rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'

    +'<ul>'
    +'<li><label>Company ID:</label>'
      +'<input type="text" '
      +' id="company_name_'+indek+'" disabled '
      //+' value="'+bingkai[indek].company.name+'">'
      +' value="'+bingkai[indek].company.id+'">'
      +'</li>'

    +'<li><label>User Name</label>'
      +'<input type="text" id="user_name_'+indek+'"></li>'
      
    +'<li><label>Login Timeout</label>'
      +'<select id="exp_mode_'+indek+'">';
        for(var i=0;i<array_expired_mode.length;i++){
          html+='<option>'+array_expired_mode[i]+'</option>';
        }
      html+='</select>'
    +'</li>'
    
    +'<li><label>Date Expired</label>'
      +'<input type="date"'
        +' id="date_expired_'+indek+'"'
        +' onblur="dateFakeShow('+indek+',\'date_expired\')"'
        +' style="display:none;">'
      +'<input type="text"'
        +' id="date_expired_fake_'+indek+'"'
        +' onfocus="dateRealShow('+indek+',\'date_expired\')"'
        +' size="10">'
    +'</li>'
    
      
    +'<li><label>Invite Note:</label>'
      +'<input type="text" id="invite_note_'+indek+'" size="50"></li>'
    +'</ul>'

    +'<p><i>&#10020 Daftarkan user name baru di halaman Login: '
     +'Menu/Register akun baru.</i></p>'

    +'<details open>'
      +'<summary>User Access</summary>'
      +'<div id="user_access_'+indek+'" style="margin-left:30px;"></div>'
    +'</details>'
    +'<br>';

  content.html(indek,html);  

  document.getElementById('date_expired_'+indek).value=tglSekarang();
  document.getElementById('date_expired_fake_'+indek).value=tglWest(tglSekarang());
  
  if(metode==MODE_CREATE){
    document.getElementById("user_name_"+indek).focus();
    document.getElementById('user_name_'+indek).disabled=false;
  }else{
    document.getElementById('user_name_'+indek).disabled=true;
  }
  
//  Users.access2(indek,Users.menu);
  Users.access3(indek,Users.menu);
}

Users.createExecute=(indek)=>{
  var elem = document.getElementsByName("menuAccess_"+indek);
  var names = [];
  var str='';
  var abc='';
  
  for (let i = 0; i < elem.length; ++i) {
    str=elem[i].value;
    abc=str.split(":");
    // bila 0, tidak perlu disimpan
    if (parseInt(abc[1])!=0){
      names.push(elem[i].value);
    }
  }
  
  db.execute(indek,{
    query:"INSERT INTO invite "
      +"(company_id,invite_note,user_name,timeout_login,"
      +" date_expired,menu_access) "
      +" VALUES "
      +"('"+bingkai[indek].company.id+"',"
      +"'"+getEV('invite_note_'+indek)+"',"
      +"'"+getEV('user_name_'+indek)+"',"
      +"'"+getEI('exp_mode_'+indek)+"',"
      +"'"+getEV('date_expired_'+indek)+"',"
      +" "+JSON.stringify(names)+")"
  });
}



Users.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT company_id,user_name,timeout_login, "
      +" date_expired,invite_note,menu_access "
      +" FROM invite "
      +" WHERE user_name='"+bingkai[indek].user_name+"' "
      +" AND company_id='"+bingkai[indek].company.id+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      var d=objectOne(paket.fields,paket.data);
      
      setEV('user_name_'+indek,d.user_name);
      setEI('exp_mode_'+indek,d.exp_mode);
      
      setEV('date_expired_'+indek, String(d.date_expired).substr(0,10));
      setEV('date_expired_fake_'+indek, tglWest(String(d.date_expired).substr(0,10)));
      
      setEV('invite_note_'+indek,d.invite_note);

      Users.setMenu(indek, JSON.parse(d.menu_access) );

      statusbar.ready(indek);
      message.none(indek);
    }
    return callback();
  });
}

Users.setMenu=(indek,n)=>{// ini isinya;
  //var n=JSON.parse(m);
  var list_menu=document.getElementsByName('menuAccess_'+indek);
  var s;
  
  for(var i=0;i<n.length;i++){
    s=String(n[i]).split(':');
    for(var j=0;j<list_menu.length;j++){
      if(list_menu[j].id==s[0]+'_'+indek){
        setEI(list_menu[j].id, Number(s[1]) );
      }
    }
  }
};

Users.formUpdate=(indek,user_name)=>{
  bingkai[indek].user_name=user_name;
  toolbar.none(indek);
  toolbar.hide(indek);  
  Users.formEntry(indek,MODE_UPDATE);
  Users.readOne(indek,()=>{
    toolbar.back(indek,()=>{Users.form.lastMode(indek);});
    toolbar.save(indek,()=>{Users.updateExecute(indek);});
    toolbar.properties(indek,()=>{Users.properties(indek);});
  });
}

Users.updateExecute=(indek)=>{  
  var elem = document.getElementsByName("menuAccess_"+indek);
  var names = [];
  var str='';
  var abc='';
  
  for (let i = 0; i < elem.length; ++i) {
    str=elem[i].value;
    abc=str.split(":");
    // bila 0, tidak perlu disimpan
    if (parseInt(abc[1])!=0){
      names.push(elem[i].value);
    }
  }

  db.execute(indek,{
    query:"UPDATE invite"
      +" SET timeout_login='"+getEI('exp_mode_'+indek)+"',"
      +" date_expired='"+getEV('date_expired_'+indek)+"',"
      +" menu_access= '"+JSON.stringify(names)+"',"
      +" invite_note='"+getEV('invite_note_'+indek)+"'"
      +" WHERE user_name='"+bingkai[indek].user_name+"'"
      +" AND company_id='"+bingkai[indek].company.id +"'" 
  },(p)=>{
    if(p.err.id==0) Users.finalPath(indek);
  });
}

Users.formDelete=(indek,user_name)=>{
  bingkai[indek].user_name=user_name;
  toolbar.none(indek);
  toolbar.hide(indek);
  Users.formEntry(indek,MODE_DELETE);
  Users.readOne(indek,()=>{
    toolbar.back(indek,()=>{Users.form.lastMode(indek);});
    toolbar.delet(indek,()=>{Users.deleteExecute(indek);});
  });
}

Users.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM invite"
    +" WHERE user_name='"+bingkai[indek].user_name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.err.id==0) Users.finalPath(indek);
  });
}

Users.exportExecute=(indek)=>{
  db.execute(indek,{
    query:"SELECT "
      +" company_id,user_name,timeout_login,date_expired, "
      +" menu_access,invite_note "
      +" FROM invite "
      +" WHERE company_id='"+ bingkai[indek].company.id +"' " 
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'manage_users.json');
    }else{
      content.infoPaket(indek,paket);
    }
  });
}

Users.importExecute=(indek)=>{
  var n=0;
  var m="<p>Message Proccess:</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var dir=Users.getDir(indek);
  var path;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  mkdir(indek,dir,()=>{
    for (var i=0;i<j;i++){
      path=JSON.stringify({
        folder:(dir.folder).concat("/",dir.name),
        name:d[i][1]
      });
      db.run(indek,{
        query:"INSERT INTO invite "
          +"(company_id,user_name,timeout_login, "
          +"date_expired,menu_access,invite_note,path) "
          +" VALUES "
          +"('"+bingkai[indek].company.id+"', "
          +"'"+d[i][1]+"',"
          +"'"+d[i][2]+"',"
          +"'"+d[i][3]+"',"
          +"'"+d[i][4]+"',"
          +"'"+d[i][5]+"',"
          +"'"+path+"')"
    },(paket)=>{
        n++;
        m+='['+n+'] '+db.error(paket)+'<br>';
        progressBar(indek,n,j,m);
      });
    }
  });
}


Users.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM invite "
    +" WHERE company_id='"+bingkai[indek].company.id+"' "
    +" AND user_name LIKE '%"+bingkai[indek].text_search+"%' "
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Users.search=(indek)=>{
  Users.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT "
      +" invite_note,company_id,company_name,user_name, "
      +" timeout_login,date_expired,menu_access,status,date_modified "
      +" FROM invite "
      +" WHERE company_id='"+bingkai[indek].company.id+"' "
      +" AND user_name LIKE '%"+bingkai[indek].text_search+"%' "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Users.readShow(indek);
    });
  });
}

Users.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT"
      +" invite_note,company_id,company_name,user_name,"
      +" timeout_login,date_expired,menu_access,status,date_modified"
    +" FROM invite"
    +" WHERE company_id='"+bingkai[indek].company.id+"'"
    +" ORDER BY date_modified"
    +" LIMIT "+bingkai[indek].paging.limit
    +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Users.selectShow(indek);
  });
}

Users.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0 1rem 0 1rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
    +'<th colspan="2">User Name</th>'
    +'<th>Response</th>'
    +'<th>Company Name</th>'
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
        +'<td>'+d[x].user_name+'</td>'
        +'<td align="center"><b>'
          +array_network_status[Number(d[x].status)]+'</b></td>'
        +'<td align="left">'+xHTML(d[x].company_name)+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>';
        +'</tr>';
    }
  }

  html+='</div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Users.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var e=document.getElementsByName('checked_'+indek);
  var d=objectMany(p.fields,p.data);
  var a=[];
  
  for(var i=0;i<e.length;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM invite"
        +" WHERE user_name='"+d[i].user_name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Users.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,admin_name,user_name,date_created"
      +" FROM invite"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND user_name='"+getEV('user_name_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Users.table_name,"/",
        d.company_id,"/",
        d.user_name);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Users.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Users.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Users.properties(indek);})
  }
}




// eof: 522;638;641;656;671;693;691;


Users.access3=(indek, menuList)=>{

  var isi={};
  var akses=[];
  var kelompok;
  var html='';
  var x;

  bingkai[indek].loop=0;
  
  html=Users.folder(0,indek, menuList, '',"",'');
  
  document.getElementById("user_access_"+indek).innerHTML=html;
  
  if(document.getElementById("accounting_"+indek)){
    document.getElementById("accounting_"+indek).selectedIndex=1;
  }
}

Users.folder=(k,indek,menuList2,parent,htm,cc)=>{

  let x;
  let y;
  let kelompok='';
  let parent2;
  let j=0;
  let akses=0;
  let c=1;
  let depan='';

  htm+='<br>';
  k++;
  
  for (x=0;x<menuList2.length;x++){
    if(menuList2[x].parent==parent){

      for(y=1;y<k;y++){
        htm+='&nbsp;&nbsp;';
      }
      
      if(cc==''){
        depan=c;
      }else{
        depan=cc+'.'+c;
      }
      
      htm+='<label style="margin-right:200px;">';
      htm+=depan+'. ';
      if(menuList2[x].type==2 || menuList2[x].type==3){
        htm+=menuList2[x].name;
      } else {
        htm+=menuList2[x].name+'/ ...';
      }
      htm+='</label>'

      htm+='<select name="menuAccess_'+indek+'" style="width:120px;"'
        +' id="'+menuList2[x].id+'_'+indek+'">';

        akses=parseInt(menuList2[x].access)+1;

        for(y=0;y<akses;y++){
          htm+=terPilih(menuList2[x].id, y, menuList2[x].selected);
        }
        htm+='</select>';
        
      parent2=String(menuList2[x].parent).concat("/",menuList2[x].id);
      
      htm=Users.folder(k,indek,menuList2,parent2,htm,depan);
      c++;
    }
    j++;
  }
  
  return htm;
}

function terPilih(menuNama,menuAccess,menuSelected){
  var str = "<option value='ok' selected >budi</option>";
  var strMenu;
  
  switch(parseInt(menuAccess)){
    case 0: 
      // no access = tidak bisa apa-apa.
      strMenu = "No Access"; 
      break;      
    case 1: 
      // can read = hanya bisa baca
      strMenu = "Can Read";
      break;
    case 2: 
      // can create= bisa baca, & bisa tulis
      strMenu = "Can Create";
      break;
    case 3: 
      // can edit= bisa baca, bisa tulis, bisa update, & bisa delete
      strMenu = "Can Edit";
      break;
    case 4: 
      // can export= bisa baca, bisa tulis, bisa update, 
      // bisa delete, & bisa export
      strMenu = "Can Lock";
      break;

    default:
      strMenu = "No Access: "+menuAccess;
  }
  if (menuAccess==menuSelected){
    str = "<option value='" + menuNama +":"+ menuAccess +"' selected>"
      + strMenu +"</option>"; 
  }else {
    str = "<option value='" + menuNama +":"+ menuAccess +"'>"
      + strMenu +"</option>";  
  }
  return str;
}
