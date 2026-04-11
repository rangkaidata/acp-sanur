/*
 * name: budiono;
 * date: oct-03, 14:57, tue-2023; new;
 */ 
'use strict';

var UserLevels={}

UserLevels.show=(tiket)=>{
  tiket.modul='user_levels';
  tiket.menu.name="User Level";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    UserLevels.formPaging(indek);
  }else{
    show(baru);
  }  
}

UserLevels.formPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.refresh(indek,()=>UserLevels.formPaging(indek));
  toolbar.more(indek,()=>Menu.more(indek));
  db1.readPaging(indek,()=>{
    UserLevels.readShow(indek);
  });
}

UserLevels.readShow=(indek)=>{
  const metode=bingkai[indek].metode;
  const paket=bingkai[indek].paket;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"></div>'
    +'<p>Total: '+paket.count+' rows</p>';
    
  if (paket.err.id===0){
    if (metode==MODE_READ){
      if (paket.paging.first!=""){
        html+= '<button type="button"'
        +' id="btn_first" '
        +' onclick="UserLevels.gotoPage(\''+indek+'\','
        +'\''+paket.paging.first+'\')"></button>';
      }
      for (x in paket.paging.pages){
        if (paket.paging.pages[x].current_page=="yes"){
          html+= '<button type="button" '
          +' onclick="UserLevels.gotoPage(\''+indek+'\''
          +',\''+paket.paging.pages[x].page+'\')" disabled >'
          +paket.paging.pages[x].page 
          +'</button>'; 
        } else {
          html+= '<button type="button" '
          +' onclick="UserLevels.gotoPage(\''+indek+'\''
          +',\''+paket.paging.pages[x].page+'\')">'
          +paket.paging.pages[x].page
          +'</button>';  
        }
      }
      if (paket.paging.last!=""){
        html+='<button type="button"'
        +' id="btn_last" '
        +' onclick="UserLevels.gotoPage(\''+indek+'\''
        +',\''+paket.paging.last+'\')">'
        +'</button>';
      }
    }
  }
  
  html+='<table border=1>'
    +'<tr>'
    +'<th colspan="2">User Name</th>'
    +'<th>User Number</th>'
    +'<th>User Level</th>'
    +'<th>Parent Name</th>'
    +'<th>Folder</th>'
    +'<th>Created</th>'
    +'<th colspan=2>Action</th>'
    +'</tr>';

  if (paket.err.id===0){
    for (var x in paket.data) {
      html+='<tr>'
        +'<td align="center">'+paket.data[x].row_id+'</td>'
        +'<td align="left">'+paket.data[x].user_name+'</td>'
        +'<td align="center">'+paket.data[x].user_number+'</td>'
        +'<td align="center">'+array_user_level[paket.data[x].user_level]+'</td>'
        +'<td align="center">'+paket.data[x].parent_name+'</td>'
        +'<td align="center">'+paket.data[x].folder+'</td>'
        +'<td align="center">'
          +tglInt(paket.data[x].date_created)
          +'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="UserLevels.formUpdate(\''+indek+'\''
          +',\''+paket.data[x].user_name+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="UserLevels.formDelete(\''+indek+'\''
          +',\''+paket.data[x].user_name+'\');">'
          +'</button></td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(paket.err.id!=0) content.infoPaket(indek,paket);
}

UserLevels.gotoPage=(indek,page)=>{
  bingkai[indek].page=page;
  UserLevels.formPaging(indek);
}

UserLevels.formUpdate=(indek,user_name)=>{
  bingkai[indek].user_name=user_name;
  toolbar.none(indek);
  toolbar.hide(indek);
  UserLevels.formEntry(indek,MODE_UPDATE);
  UserLevels.readOne(indek,()=>{
    toolbar.back(indek,()=>UserLevels.formLast(indek));
    toolbar.save(indek,()=>UserLevels.updateExecute(indek));
  });
}

UserLevels.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>User Name:</label>'
      +'<input type="text"'
      +' value="'+bingkai[indek].user_name+'"'
      +' size="9" disabled></li>'
    
    +'<li><label>Parent Name:</label>'
      +'<input type="text"'
      +' id="parent_name_'+indek+'" '
      +' size="9"></li>'
      
    +'<li><label>User Level:</label>'
      +'<select id="user_level_'+indek+'">'
      +getDataUserLevel(indek)
      +'</select>'
      +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('parent_name_'+indek).focus();
}

UserLevels.readOne=(indek,callback)=>{
  db1.readOne(indek,{
    "user_name":bingkai[indek].user_name
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      const d=paket.data;
      setEV('parent_name_'+indek, d.parent_name );
      setEI('user_level_'+indek, d.user_level );
    }
    message.none(indek);
    return callback();
  });
}

UserLevels.updateExecute=(indek)=>{
  db1.updateOne(indek,{
    "user_name":bingkai[indek].user_name,
    "parent_name":getEV("parent_name_"+indek),
    "user_level":getEI("user_level_"+indek)
  });
}

UserLevels.formLast=function(indek){
  bingkai[indek].text_search==''?
  UserLevels.formPaging(indek):
  UserLevels.formResult(indek);
}

UserLevels.formDelete=(indek,user_name)=>{
  bingkai[indek].user_name=user_name;
  toolbar.none(indek);
  toolbar.hide(indek);
  UserLevels.formEntry(indek,MODE_DELETE);
  UserLevels.readOne(indek,()=>{
    toolbar.back(indek,()=>UserLevels.formLast(indek));
    toolbar.delet(indek,()=>UserLevels.deleteExecute(indek));
  });
}

UserLevels.deleteExecute=(indek)=>{
  db1.deleteOne(indek,{
    "user_name":bingkai[indek].user_name
  });
}
/*EOF*/
