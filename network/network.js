/*
 * auth: budiono;
 * file: 29;
 * path: /network/network.js;
 * date: sep-04, 14:37, mon-2023; new;
 * edit: sep-05, 10:34, tue-2023; add;
 * edit: sep-19, 21:56, tue-2023;
 * edit: sep-20, 17:37, wed-2023; 
 * -----------------------------; happy new year 2024;
 * edit: mar-28, 11:52, thu-2024; Basic SQL;
 * edit: apr-26, 10:05, fri-2024; 
 * edit: sep-08, 13:28, sun-2024; r17;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 20:21, thu-2025; #32; properties;
 * edit: mar-11, 11:44, tue-2025; #43; deep folder;
 * edit: mar-25, 15:38, tue-2025; #45; ctables;cstructure;
 */ 
 
'use strict';

var Network={}

Network.table_name='network';
Network.form=new ActionForm2(Network);
Network.hideSelect=true;
Network.hideNew=true;
Network.hideImport=true;

Network.show=(tiket)=>{
  tiket.modul=Network.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,"invites",()=>{
        Network.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }  
}

Network.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM network;"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Network.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Network.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT invite_note,company_id,company_name,"
        +" timeout_login,date_expired,status,"
        +" user_name,admin_name,date_created,date_modified"
        +" FROM network"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Network.readShow(indek);
    });
  })
}

Network.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='';
  
  html='<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<th colspan="2">Invite Date</th>'
    +'<th>Admin Name</th>'
    +'<th>Company Name</th>'
    +'<th>Your Response</th>'
    +'<th colspan="2">Action</th>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tglInt(d[x].date_created)+'</td>'
        +'<td align="left">'+d[x].admin_name+'</td>'
        +'<td align="left">'+xHTML(d[x].company_name)+'</td>'
        +'<td align="center"><strong>'
          +array_network_status[Number(d[x].status)]
          +'</strong></td>';
      if (Number(d[x].status)==0){// wait 0
        html+='<td align="center">'
        +' <button type="button" '
        +' id="btn_yes" '
        +' onclick="Network.joinFolder(\''+indek+'\''
        +',\''+d[x].admin_name+'\''
        +',\''+d[x].company_id+'\''
        +');">'
        +'Join</button>'
        +'</td>';        
      }else if(Number(d[x].status)==1){// join
        html+='<td align="center">'
          +' <button type="button" '
          +' id="btn_open" '
          +' onclick="Network.openFolder(\''+indek+'\''
          +',\''+d[x].admin_name+'\''
          +',\''+d[x].company_id+'\''
          +');">'
          +' </button>'
          +'</td>';
      }else{
        html+='<td align="center">-</td>';
      }
      if(d[x].status==2){
        html+='<td align="center">-</td>';
      }else{
        html+='<td><button type="button" '
            +' id="btn_detail" '
            +' onclick="Network.formView(\''+indek+'\''
            +',\''+d[x].admin_name+'\''
            +',\''+d[x].company_id+'\''
            +');">'
            +'</button>'
            +'</td>';
      }
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Network.formView=(indek,admin_name,company_id)=>{  
  toolbar.none(indek);
  toolbar.hide(indek);
  Network.form02(indek);
  Network.readOne(indek,admin_name,company_id,()=>{
    toolbar.back(indek,()=>Network.form.lastMode(indek));
    toolbar.delet(indek,()=>Network.leaveFolder(indek,admin_name,company_id));
  });
}

Network.form02=(indek)=>{
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"></div>'
    
    +'<ul>'
    +'<li><label>Company</label>: '
      +'<span id="company_name_'+indek+'"></span></li>'
    +'<li><label>From</label>: '
      +'<span id="admin_name_'+indek+'"></span></li>'
    +'<li><label>To</label>: '
      +'<span id="user_name_'+indek+'"></span></li>'
    +'<li><label>Login Expired</label>: '
      +'<span id="login_expired_'+indek+'"></span></li>'
    +'<li><label>Date Expired</label>: '
      +'<span id="date_expired_'+indek+'"></span></li>'
    +'<li><label>Note</label>: '
      +'<span id="invite_note_'+indek+'"></span></li>'
    +'</ul>'
    
    +'<details open>'
    +'<summary>Access</summary>'
    +'<div id="user_access_'+indek+'"></div>'
    +'</details>'

  content.html(indek,html);
}

Network.readOne=(indek,admin_name,company_id,callback)=>{  
  db.run(indek,{
    query:"SELECT invite_note,company_id,company_name,"
      +" timeout_login,date_expired,status,"
      +" user_name,admin_name,date_created,date_modified"
      +" FROM network"
      +" WHERE admin_name='"+admin_name+"'"
      +" AND company_id='"+company_id+"'"
  },(paket)=>{
    if(paket.count>0){
      var d=objectOne( paket.fields,paket.data );
      
      setEH('company_name_'+indek, xHTML(d.company_name) );
      setEH('admin_name_'+indek, d.admin_name);
      setEH('user_name_'+indek, d.user_name);
      setEH('login_expired_'+indek, 
        array_expired_mode[Number(d.timeout_login)]);
      setEH('date_expired_'+indek, d.date_expired);
      setEH('invite_note_'+indek, 
        '<b><i>'+xHTML(d.invite_note)+'</i></b>');
        
      Network.readAccess(indek,admin_name,company_id);

      if(paket.err.id!=0) message.infoPaket(indek,paket);
      message.none(indek);
    }
    return callback();
  });
}

Network.readAccess=(indek,admin_name,company_id)=>{
  db.run(indek,{
    query:"SELECT menu_parent,menu_id,menu_name,menu_access"
      +" FROM access"
      +" WHERE company_id='"+company_id+"'"
      +" AND admin_name='"+admin_name+"'"
      
  },(paket)=>{
    var total_rows=0;
    if(paket.count>0){
      total_rows=paket.count;
    } 

    var html='<table>'
    +'<caption>'+total_rows +' rows</caption>'
    +'<th>GROUP</th>'
    +'<th>MENU</th>'
    +'<th>YOUR ACCESS</th>';

    if(paket.count>0){
      
      var d=objectMany(paket.fields,paket.data);
      
      for(var i=0;i<d.length;i++){
        html+='<tr>'
        +'<td>'+(d[i].menu_parent).toUpperCase()+'</td>'
        +'<td>'+d[i].menu_name+'</td>'
        +'<td align="center">'+akses(d[i].menu_access)+'</td>'
        +'</tr>';
      }      
    }
    html+='</table>'  
      +'<p><strong>Leave this network: </strong>'
      +'<button type="button" '
      +' id="btn_no" '
      +' onclick="Network.leaveFolder(\''+indek+'\''
      +',\''+admin_name+'\''
      +',\''+company_id+'\''
      +');">'
      +'Leave</button>'
      +'</p>'
      
      +'<p>'
      +' <button type="button" '
      +' id="btn_drawer" '
      +' onclick="Network.openAppDrawer(\''+indek+'\''
      +',\''+admin_name+'\''
      +',\''+company_id+'\''
      +');">'
      +' </button></p>';
    document.getElementById('user_access_'+indek).innerHTML=html;
  });
}

Network.openAppDrawer=function(indek,admin_name,company_id){
  db.run(indek,{
    query:"SELECT * FROM access"
    +" WHERE admin_name='" + admin_name + "'"
    +" AND company_id='" + company_id + "'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      
      var d=objectMany(paket.fields,paket.data);
      var itmMenu=[];
      
      for(var x in d){
        itmMenu.push({
          'sort':d[x].menu_sort,
          'parent':d[x].menu_parent,
          'id':d[x].menu_id,
          'name':d[x].menu_name,
          'type':d[x].menu_type,
          'access':d[x].menu_selected
        });
      }
      
      var invite_id=[d[0].admin_name,d[0].company_id];
      
      var listMenu={
        'id':invite_id,
        'data':itmMenu,
      }
      Menu.invite.push(listMenu);
      
      var tiket=JSON.parse(JSON.stringify(bingkai[indek]));
      tiket.baru=true;
      tiket.home.id='';
      //??
      tiket.invite.id=invite_id;
      tiket.network.admin_name=d[0].admin_name;
      tiket.admin.name=d[0].admin_name;
      //??
      tiket.company.id=d[0].company_id;
      tiket.company.name=d[0].company_name;
      tiket.menu.id='accounting';
      tiket.menu.name=d[0].company_name;
      tiket.menu.type=4;// appDrawer
      tiket.folder=d[0].user_name+'@'+d[0].admin_name+': ';
      tiket.parent=indek;
      antrian.push(tiket);
      
      Menu.klikAppDrawer(antrian.length-1);
    }else{
      message.infoPaket(indek,paket);
    }
  });
}

Network.joinFolder=(indek, admin_name, company_id)=>{ 
  db.run(indek,{
     query:"INSERT INTO network "
      +"(admin_name,company_id"
      +") VALUES "
      +"('"+admin_name+"'"
      +",'"+company_id+"'"
      +")"
  },(paket)=>{
    if(paket.err.id==0) {
      Network.form.modePaging(indek);
    }else{
      message.infoPaket(indek,paket);
    }
  });
}

Network.leaveFolder=(indek, admin_name, company_id)=>{
  db.run(indek,{
    query:"DELETE FROM network"
      +" WHERE admin_name='"+admin_name+"'"
      +" AND company_id='"+company_id+"'"
  },(paket)=>{
    if(paket.err.id==0) {
      Network.form.modePaging(indek);
    }else{
      message.infoPaket(indek,paket);
    }
  });
}

Network.openFolder=function(indek,admin_name,company_id){

  db.run(indek,{
    query:"SELECT * FROM access"
    +" WHERE admin_name='" + admin_name + "'"
    +" AND company_id='" + company_id + "'"
  },(paket)=>{

    if(paket.err.id==0 && paket.count>0){

      var d=objectMany(paket.fields,paket.data);
      var my_parent=String(bingkai[indek].menu.parent).concat("/",bingkai[indek].menu.id);
      
      var itmMenu=[];
      
      for(var x in d){
        itmMenu.push({
          'sort':d[x].menu_sort,
          'parent':d[x].menu_parent,
          'id':d[x].menu_id,
          'name':d[x].menu_name,
          'type':d[x].menu_type,
          'access':d[x].menu_selected
        });
      }
      
      var invite_id=[d[0].admin_name,d[0].company_id]
      
      var listMenu={
        'id':invite_id,
        'data':itmMenu,
      }
      Menu.invite.push(listMenu);
      
      var tiket=JSON.parse(JSON.stringify(bingkai[indek]));
      tiket.home.id='';
      tiket.admin.name=d[0].admin_name;
      tiket.network.admin_name=d[0].admin_name;
      tiket.invite.id=invite_id;
      tiket.company.id=d[0].company_id;
      tiket.company.name=d[0].company_name;
      tiket.menu.id='accounting';
      tiket.menu.name=xHTML(d[0].company_name);
      tiket.menu.type=2;
 //     tiket.menu.parent="/company";
     tiket.menu.parent="";
      tiket.folder=d[0].user_name+'@'+d[0].admin_name+': ';
      tiket.parent=indek;
      
//alert(my_parent);
      
      antrian.push(tiket);
      
      Menu.klik(antrian.length-1);
    }else{
      message.infoPaket(indek,paket);
    }
  });
}
  
Network.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM network "
    +" WHERE company_id='%"+bingkai[indek].text_search+"%'"
    +" OR admin_name LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR invite_note LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR company_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Network.search=(indek)=>{
  Network.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT invite_note,company_id,company_name,"
        +" timeout_login,date_expired,status,"
        +" user_name,admin_name,date_created,date_modified"
        +" FROM network"
        +" WHERE company_id='%"+bingkai[indek].text_search+"%'"
        +" OR admin_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR invite_note LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR company_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Network.readShow(indek);
    });
  });
}



// eof: 318;324;434;447;453;
