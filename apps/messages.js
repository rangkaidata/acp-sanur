/*
 * auth: budiono;
 * code: L7;
 * path: /apps/messages.js;
 * -----------------------;
 * date: Dec-03, 22:24, tue-2024; #28;messages;
 * -----------------------------; happy new year 2025;
 * edit: jan-04, 18:22, tue-2025; #34; apps+messages;
 * edit: jan-24, 14:09, fri-2025; #35;
 * edit: jan-26, 16:11, sun-2025; #35;
 * edit: jan-28, 17:40, tue-2025; #35;
 * edit: feb-27, 18:11, thu-2025; #41; file_id;
 * edit: mar-16, 12:05, sun-2025; #43; deep-folder;
 * edit: mar-28, 11:34, fri-2025; #45; ctables;cstructure;
 * ----------------------------------; happy new year 2026;
 * edit: jan-21, 13:12, wed-2026; #89;
 * edit: jan-30, 11:18, fri-2026; #90; send_method;
 */ 

'use strict';

var Messages={};
  
Messages.table_name='messages';
Messages.form=new ActionForm2(Messages);
Messages.contact=new ContactLook(Messages);
Messages.group=new GroupLook(Messages);
Messages.room=new RoomLook(Messages);
Messages.hideSave=true;
Messages.hideSaveAs=true;
Messages.hideProperties=true;
Messages.hideSearch=true;
Messages.hideExport=true;
Messages.hideImport=true;
Messages.hideSelect=true;
Messages.mode_push=0;

Messages.show=(tiket)=>{
  tiket.modul=Messages.table_name;
  tiket.have_child=true;

  var baru=exist(tiket);

  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    // folder messages;
    createFolder(indek,()=>{
      getPath(indek,"message_bus",(h)=>{
        mkdir(indek,h.folder,(h2)=>{
          getPath(indek,"message_push",(h)=>{
            mkdir(indek,h.folder,(h2)=>{
              getPath(indek,"message_pull",(h)=>{
                mkdir(indek,h.folder,(h2)=>{
                  bingkai[indek].room=true;
                  Messages.form.modePaging(indek);
                });
              });
            });
          });
        });
      });
    });
  }else{
    show(baru);
  }
}

Messages.refreshHeader=(indek,callback)=>{
  var members=[];
  
  db.run(indek,{
    query:"SELECT room_id,option"
      +" FROM rooms"
  },(p)=>{
    if(p.count>0){
      var j=0;
      var d=objectMany(p.fields,p.data);
      var i;
      
      for(i=0;i<d.length;i++){
        Messages.getRoom(indek,
        d[i].room_id,
        d[i].option,(p)=>{
          var k;
          var m=JSON.parse(p.members);

          for(k=0;k<m.length;k++){
            members.push({
              room_id: p.room_id,
              option: p.option,
              user_name: m[k].user_name
            })
          }
          
          j++ ;
          if(j==i){
            
            return callback(members);
          }
        });
      }
    } else {
      Messages.readPagingOK(indek);
    }
  });
}

Messages.loadData=(indek,m,callback)=>{
  var i;
  var j=0;
  for(i=0;i<m.length;i++){
    Messages.bus(indek,m[i].room_id,m[i].option,m[i].user_name,()=>{
      j++;
      if(j==m.length){
        return callback();
      }
    });
  }
}

Messages.bus=(indek,room_id,option,user_name,callback)=>{
  var bus_id=user_name+'_'+new Date().getTime();
  
//  alert('new-message-bus: '+user_name);
  
  db.run(indek,{
    query:"INSERT INTO message_bus"
      +"(bus_id,room_id,option,user_name)"
      +" VALUES "
      +"('"+bus_id+"'"
      +",'"+room_id+"'"
      +",'"+option+"'"
      +",'"+user_name+"')"
  },(p)=>{
    return callback();
  });
}

Messages.readPaging=(indek)=>{
  if(bingkai[indek].refresh){
    Messages.readPagingOK(indek);
  } else {
    Messages.refreshHeader(indek,(m)=>{
      Messages.loadData(indek,m,()=>{
        Messages.readPagingOK(indek);
        bingkai[indek].refresh=true;
      });
    });
  }
}

Messages.readPagingOK=(indek)=>{
  
  bingkai[indek].metode=MODE_READ;
  Messages.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT room_id,option,contact_name,"
        +"MAX(message_last) AS message_last"
        +" FROM message_box"
        +" GROUP BY room_id,contact_name,option"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Messages.readShow(indek);
    });
  })
}

Messages.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
    +" FROM message_box "
    +" GROUP BY room_id,contact_name,option"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Messages.readShow=(indek)=>{
  ui.destroy_child(indek);

  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var message_last;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Room ID</th>'
      +'<th>Option</th>'
      +'<th>Contact Name</th>'
      +'<th>Text</th>'
//      +'<th>Admin Name</th>'
      +'<th>Date Created</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      message_last=JSON.parse(d[x].message_last)
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].room_id+'</td>'
      +'<td align="left">'+array_message_option[d[x].option]+'</td>'
      +'<td align="left">'+d[x].contact_name+'</td>'
      +'<td align="left">'+message_last[1]+'</td>'
      
//      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(message_last[0])+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="Messages.formUpdate(\''+indek+'\''
        +',\''+d[x].room_id+'\''
        +',\''+d[x].option+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Messages.deleteExecute(\''+indek+'\''
        +',\''+d[x].option+'\''
        +',\''+d[x].room_id+'\');">'
        +'</button></td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Messages.form.addPagingFn(indek);
}

Messages.formEntry=(indek,metode)=>{
//  toolbar.refresh(indek,()=>{ Messages.refreshText(indek) }) ;
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<form autocomplete="off">'
    
    +'<details>'
      +'<summary>Members</summary>'
      +'<ul>'

        +'<li>'
          +'<label>User Log:</label>'
          +'<input type="text" disabled'
          +' id="user_log_'+indek+'"'
          +' size="10">'
        +'</li>'
        +'<li>'
          +'<label>Send Method:</label>'
//          +'<input type="text" disabled'+' id="send_method_'+indek+'"'
          +'<select id="send_method_'+indek+'" disabled>'
            for(var i=0;i<array_message_send_method.length;i++){
              html+='<option>'+array_message_send_method[i]+'</option>';
            }
          html+='</select>'
        +'</li>'
        +'<li>'
          +'<label>Members:</label>'
          +'<input type="text" disabled'
          +' id="members_'+indek+'"'
          +' size="50">'
        +'</li>'
      +'</ul>'
      +'<hr style="color:lightgray;">'
    +'</details><br>'

    +'<ul>'      
      +'<li>'
        +'<label>Room ID</label>'
        +'<input type="text" disabled'
          +' id="room_id_'+indek+'" '
          +' size="13">'
        +'<button type="button" disabled'
        +' class="btn_find"'
        +' onclick="Messages.room.getPaging(\''+indek+'\','
        +' \'room_id_'+indek+'\');"'
        +' id="btn_'+indek+'">'
        +'</button>'
      +'</li>'
      +'<li>'
        +'<label>Option</label>'
        +'<select id="option_'+indek+'" disabled'
        +' onchange="Messages.clear(\''+indek+'\')">';
          for(var i=0;i<array_message_option.length;i++){
            html+='<option>'+array_message_option[i]+'</option>';
          }
        html+='</select>'
      +'</li>'
      +'<li>'
        +'<label>Message to:</label>'
          +'<input type="text" disabled'
          +' id="to_'+indek+'"'
          +' onchange="Messages.getRoomServer(\''+indek+'\')"'
          +' size="13">'
      +'</li>'
      +'<li>'
        +'<label>&nbsp;</label>'
        +'<input type="text" disabled '
        +' id="full_name_'+indek+'">'
      +'</li>'

    +'</ul>'
    +'<p>'
      +'<div id="messages_'+indek+'"></div>'
    +'</p>'
    
    +content.message(indek)
    +'<ul>'
    +'<li>'
      +'<label>New Message:</label>'    
      +'<input type="text" id="text_'+indek+'" size="50">'
      +'&nbsp;<input type="button" value="Send Text" '
        +' onclick="Messages.createExecute(\''+indek+'\')">'
    +'</li>'
    +'</ul>'

    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    Messages.disabledInput(indek,false);
    document.getElementById('to_'+indek).focus();
  }
  Messages.clearText(indek);
}

Messages.disabledInput=(indek,v)=>{
  document.getElementById('room_id_'+indek).disabled=v;
  document.getElementById('to_'+indek).disabled=v;
  document.getElementById('option_'+indek).disabled=v;
  document.getElementById('btn_'+indek).disabled=v;
}

Messages.clearText=(indek)=>{
  var message_option=bingkai[indek].message_option || 0;
  var contact_name=bingkai[indek].contact_name || "";
  
  setEI('option_'+indek, message_option);
  setEV('to_'+indek, contact_name);
}

Messages.getReceipentPaging=(indek)=>{

  var i=document.getElementById('option_'+indek).selectedIndex
  if(i==0){
    Messages.contact.getPaging(indek,'to_'+indek,-1)
  }else{
    Messages.group.getPaging(indek,'to_'+indek,-1)
  }
}
/*
Messages.setContact=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.user_name);
  Messages.getContact(indek);
}

Messages.getContact=(indek)=>{
  setEV('room_id_'+indek, '');
  setEV('full_name_'+indek, '');
  Messages.contact.getOne(indek,getEV('to_'+indek),(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEV('full_name_'+indek, d.full_name);
      setEV('room_id_'+indek, d.room_id);
      
      Messages.getRoom(indek,
      getEV('room_id_'+indek),
      getEI('option_'+indek),(d)=>{
          bingkai[indek].members=d.members;
      });
    }
  });
}
*/
Messages.setRoomServer=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.room_id);
  setEI('option_'+indek,data.option);
  
  Messages.getRoomServer(indek);
}

Messages.getRoomServer=(indek)=>{
  Messages.room.getOne(indek,
    getEV('room_id_'+indek),
    getEI('option_'+indek),
    (p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      var members=[];
      var m;
      
      setEI('option_'+indek, d.option);
      setEV('full_name_'+indek, d.description);
      setEV('to_'+indek,d.contact_name);
      setEV('user_log_'+indek,d.user_name);
      setEV('send_method_'+indek,
        array_message_send_method[d.send_method]
      );
      
      m=JSON.parse(d.members);
      for(var i=0;i<m.length;i++){
        members.push(m[i].user_name)
      }
      
      setEV('members_'+indek, members);
      
      bingkai[indek].members=d.members;
      bingkai[indek].send_method=d.send_method;
    }else{
    }
  });
}

Messages.getRoom=(indek,room_id,option,callback)=>{
  db.run(indek,{
    query:"SELECT room_id,option,members "
      +" FROM rooms"
      +" WHERE room_id='"+room_id+"'"
      +" ANd option='"+option+"'"
  },(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      return callback(d);
    }
  });
}
/*
Messages.setGroup=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.group_id);
  Messages.getGroup(indek);
}

Messages.getGroup=(indek)=>{
  setEV('room_id_'+indek, '');
  setEV('full_name_'+indek, '');
  Messages.group.getOne(indek,
  getEV('to_'+indek),
  (p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEV('full_name_'+indek, d.group_name);
      setEV('room_id_'+indek, d.room_id);
      bingkai[indek].members=JSON.parse(d.members);
    }
  });
}
*/
Messages.createExecute=(indek)=>{// new message room
  
  if(bingkai[indek].members==undefined) return; 
  
  var option=getEI("option_"+indek);
  var message_id;
  var table_name;
  var send_method=getEI('send_method_'+indek);
  var members=JSON.parse(bingkai[indek].members);
  var i=0,j=0;
  
    // method 0,1
    message_id=new Date().getTime()+"-"+Math.floor(Math.random()*100);
    
    db.run_no_message(indek,{
      query:"INSERT INTO messages"
        +"(room_id,"
        +"message_id,option,contact_name,message_text,message_reply)"
        +" VALUES "
        +"('"+getEV("room_id_"+indek)+"'"
        +",'"+message_id+"'"
        +",'"+option+"'"
        +",'"+getEV("to_"+indek)+"'"
        +",'"+getEV("text_"+indek)+"'"
        +",''"
        +")"
    },(p)=>{
      if(p.count>0){
        setEI('option_'+indek, option);
        setEV('text_'+indek, "");
        
        bingkai[indek].message_option=option;
        bingkai[indek].contact_name=getEV("to_"+indek);

        bingkai[indek].goto_last_page=true;
        Messages2.refreshText(indek);
        Messages.disabledInput(indek,true);
      }
      content.infoPaket(indek,p);

    });
}

Messages.clear=(indek)=>{
  setEV('to_'+indek,"");
  setEV('full_name_'+indek,"");
}

Messages.formUpdate=(indek,room_id,option)=>{
  
  bingkai[indek].room_id=room_id;
  bingkai[indek].option=option;
  
  Messages.form.modeUpdate(indek);
}

Messages.readOne=(indek,callback)=>{
  var room_id=bingkai[indek].room_id;
  var option=bingkai[indek].option;

  db.execute(indek,{
    query:"SELECT *"
      +" FROM rooms"
      +" WHERE option='"+option+"'"
      +" AND room_id='"+room_id+"'"
  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var members=[];
      var m=JSON.parse(d.members)
      
      setEV('room_id_'+indek, d.room_id);
      setEI('option_'+indek, d.option);
      setEV('to_'+indek, d.contact_name);
      setEV('full_name_'+indek, d.description);
      setEV('user_log_'+indek, d.user_name);
      setEV('send_method_'+indek, array_message_send_method[d.send_method]);
      
      for(var i=0;i<m.length;i++){
        members.push(m[i].user_name)
      }
      
      setEV('members_'+indek, members);
      
      bingkai[indek].goto_last_page=true;
      
      bingkai[indek].members=d.members;
      bingkai[indek].send_method=d.send_method;

      Messages2.refreshText(indek);
      message.none(indek);
    }else{
      //alert('');
      //message.infoPaket(indek,);
      //content.infoPaket(indek,paket);
    }
    return callback();
  });
}



var Messages2={};

Messages2.form=new ActionForm2(Messages2);

Messages2.hideSave=true;
Messages2.hideSaveAs=true;
Messages2.hideProperties=true;
Messages2.hideSearch=true;
Messages2.hideExport=true;
Messages2.hideImport=true;
Messages2.hideSelect=true;

Messages2.countSent=(indek,callback)=>{
  var room_id=getEV('room_id_'+indek);
  var option=getEI('option_'+indek);

  db.run_no_message(indek,{
    query:"SELECT COUNT(*)"
    +" FROM message_box "
    +" WHERE room_id='"+room_id+"'"
    +" AND option='"+option+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}


Messages2.readPaging=(indek)=>{
  toolbar.refresh(indek,()=>{ Messages2.refreshText(indek) }) ;

  var room_id=getEV('room_id_'+indek);
  var option=getEI('option_'+indek);

  bingkai[indek].metode=MODE_READ;
  Messages2.countSent(indek,()=>{
    bijiPaging(indek);
    db.run_no_message(indek,{
      query:"SELECT bus_id,message_id,"
        +"contact_name,message_from,"
        +"message_reply,message_text,date_created"
        +" FROM message_box"
        +" WHERE room_id='"+room_id+"'"
        +" AND option='"+option+"'"
        +" ORDER BY date_created ASC"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },(p)=>{
      PAGING=true;
      Messages2.readShow(indek,p);
    });
  });
}

Messages2.readShow=(indek,p)=>{  
  toolbar.back(indek,()=>{
    bingkai[indek].paging.page=1;
    bingkai[indek].room=true;
    Messages.form.modePaging(indek);
  });
  toolbar.close.none(indek);
  toolbar.neuu.none(indek);
  toolbar.properties.none(indek);
  toolbar.more.none(indek);
  
  bingkai[indek].room=false;

  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th>#</th>'
      +'<th>From</th>'
      +'<th colspan="3">Message Text</th>'
      +'<th colspan="2">Action</th>'
    +'</tr>';

  if (p.err.id===0){

    var d2=d.sort( sortByID );
    var msg;
    
    for (var x in d) {
      n++;
      msg='';
      if(JSON.parse(d2[x].message_reply).length>0){
        msg=JSON.parse(d2[x].message_reply)[3];
      }
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d2[x].message_from+'</td>'
        +'<td align="left">'+msg+'</td>'
        +'<td align="left">'+d2[x].message_text+'</td>'
        +'<td align="center">'+tglInt(d2[x].date_created)+'</td>'
        +'<td align="center"><button type="button" '
          +' id="btn_reply"'
          +' onclick="Messages.replyMessage(\''+indek+'\''
          +',\''+d2[x].message_id+'\')">'
          +' </button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  setiH('messages_'+indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);

  Messages2.form.addPagingFn(indek);// #here

  // goto last
  var goto_last_page=bingkai[indek].goto_last_page;
  var last=document.getElementById('btn_last_'+indek)
  if(goto_last_page) {
    if(last) last.click(); // goto last page;
  }
  bingkai[indek].goto_last_page=false;
  
  function sortByID(a,b){ // sort multidimensi;
    if(a.date_created === b.date_created){
      return 0;
    }
    else{
      if( a.date_created < b.date_created ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

Messages2.refreshText=(indek)=>{
  var members=JSON.parse(bingkai[indek].members);
  var send_method=bingkai[indek].send_method;
  var i;
  var user_name='';
  var pnjng=0;
  
//  alert(Messages.mode_push);
  // mode_bus (get message \w looping:client)
  if(send_method==0){
    for(i=0;i<members.length;i++){
      user_name=members[i].user_name;
      Messages2.messageBus(indek,i,user_name,()=>{
        pnjng++;
        if(pnjng==i){
          Messages2.readPaging(indek);
        }
      });
    }
  }

  // mode pull (get message just from one:server OR one:sender only);
  //if(send_method==1 OR send_){
  else {
    user_name=getEV('user_log_'+indek)
    Messages2.messageBus(indek,i,user_name,()=>{
      Messages2.readPaging(indek);
    });
  }
}


Messages2.messageBus=(indek,n,user_name,callback)=>{// mode-message_&_BUS
  var bus_id=n+'-'+new Date().getTime();
  var room_id=getEV('room_id_'+indek);
  var option=getEI('option_'+indek);
  
//  alert('bus: '+user_name);
  
  db.run(indek,{
    query:"INSERT INTO message_bus"
      +"(bus_id,room_id,option,user_name)"
      +" VALUES "
      +"('"+bus_id+"'"
      +",'"+room_id+"'"
      +",'"+option+"'"
      +",'"+user_name+"')"
  },()=>{
    return callback();
  });
}

Messages.deleteExecute=(indek,option,room_id)=>{
  db.run(indek,{
    query:"SELECT bus_id"
      +" FROM message_bus"
      +" WHERE room_id='"+room_id+"'"
      +" AND option="+option
  },(p)=>{
    if(p.count>0){
      var d=objectMany(p.fields,p.data);
      var i;
      var loop=0;
     
      for(i=0;i<d.length;i++){
        db.execute(indek,{
          query:"DELETE FROM message_bus"
          +" WHERE bus_id='"+d[i].bus_id+"'"
        },()=>{
          loop++;
          if(loop==d.length){
            Messages.readPaging(indek);
          }
        });
      }
    }
  });
}

Messages.replyMessage=(indek,message_id)=>{
  ui.destroy_child(indek);
  const frmReply=JSON.parse(JSON.stringify(bingkai[indek]));
  frmReply.message={
    "room_id":getEV("room_id_"+indek),
    "option":getEI("option_"+indek),
    "contact_name":getEV("to_"+indek),
    "message_id":message_id
  }
  frmReply.menu.id="reply";
  // start properti sub-form;
  frmReply.baru=false;
  frmReply.parent=indek;
  // end properti;
  ReplyMessage.show(frmReply);  
}

/*
Messages2.deleteText=(indek,message_id)=>{
  db.execute(indek,{
    query:"DELETE FROM message_box"
    +" WHERE message_id='"+message_id+"'"
  },()=>{
    Messages2.readPaging(indek);
  });
}
*/
/*
Messages.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{
    bingkai[indek].room=true;
    Messages.form.modePaging(indek);
  });
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Messages.properties(indek);})
  }
}










*/


// eof: 311;491;488;478;
