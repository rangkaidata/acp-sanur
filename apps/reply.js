
/*
 * name: budiono;
 * date: jan-28, 08:49, wed-2025; new
 */
 
'use strict';

var ReplyMessage={}

ReplyMessage.form=new ActionForm2(ReplyMessage);
ReplyMessage.hideSelect=true;
ReplyMessage.hideImport=true;
ReplyMessage.hideNew=true;

ReplyMessage.show=(tiket)=>{
  tiket.modul='reply';
  tiket.menu.name="Reply Message";
  tiket.ukuran.lebar=45;
  tiket.ukuran.tinggi=30;
  tiket.bisa.besar=0;
  tiket.bisa.kecil=0;

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    ReplyMessage.formReply(indek);
  }else{
    show(baru);
  }  
}

ReplyMessage.formReply=(indek)=>{
  content.title(indek);
  toolbar.close(indek,()=>{ui.CLOSE(indek);});
  ReplyMessage.formEntry(indek);
  ReplyMessage.readOne(indek);
}

ReplyMessage.formEntry=(indek)=>{
  
  var reply_id=bingkai[indek].message.message_id
  
  var html=''
    +'<div style="padding:0.5rem">'
    +content.message(indek)
    +'<form autocomplete="off">'

      +'<ul>'

        +'<li>'
          +'<label>Message ID</label>'
          +'<input type="text" disabled'
          +' value="'+reply_id+'">'
        +'</li>'
      
        +'<li>'
          +'<label>Message</label>'
          +'<input type="text" disabled'
          +' id="text_'+indek+'"'
          +' size="50">'
        +'</li>'
        
        +'<li>'
          +'<label>Reply</label>'
          +'<input type="text"'
          +' id="reply_'+indek+'" '
          +' size="50">'
        +'</li>'
        
        +'<li>'
          +'<label>&nbsp;</label>'
          +'<input type="button" '
          +' value="Send Reply"'
          +' id="btn_send_'+indek+'"'
          +' onclick="ReplyMessage.sendText(\''+indek+'\')">'
        +'</li>'        
      +'</ul>'
      

    +'</form>'
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

ReplyMessage.readOne=(indek)=>{
  var message_id=bingkai[indek].message.message_id;
  
  db.execute(indek,{
    query:"SELECT message_id,message_text"
      +" FROM message_box"
      +" WHERE message_id='"+message_id+"'"
  },(p)=>{
    if(p.count>0) {
      message.none(indek);
      var d=objectOne(p.fields,p.data);
      setEV('text_'+indek, d.message_text);
    }
  });
}

ReplyMessage.sendText=(indek)=>{
  var m=bingkai[indek].message;  
  var new_message_id=new Date().getTime()+"-"+Math.floor(Math.random()*100);
  var reply_id=m.message_id;

  db.run(indek,{
    query:"INSERT INTO messages"
      +"(room_id,message_id,option,contact_name,message_text"
      +",reply_id)"
      +" VALUES "
      +"('"+m.room_id+"'"
      +",'"+new_message_id+"'"
      +",'"+m.option+"'"// selectedIndex
      +",'"+m.contact_name+"'"
      +",'"+getEV("reply_"+indek)+"'"
      +",'"+reply_id+"'"
      +")"
  },(p)=>{
    var parent=bingkai[indek].parent;
    if(p.err.id==0) {
      Messages2.refreshText(parent);
    }
    message.infoPaket(indek,p);
    disabled('btn_send_'+indek,true);
  })
}


// eof: 133;
