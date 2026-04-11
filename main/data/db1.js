/*
 * name: budiono
 * date: sep-04, 12:19, mon-2023; new;182;
 * edit: sep-05, 10:10, tue-2023; add;205;215;
 * edit: jan-01, 10:32, mon-2023; limit;
 */

'use struct';

// db1: parameter hanya satu, yaitu login_id;

db1.readPaging=function(indek,abc){
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_paging',
    {
      "login_id":bingkai[indek].login.id,
      "page":bingkai[indek].page,
      "limit":bingkai[indek].paging.limit
    },(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc();
  });
}

db1.readOne=function(indek,params,abc){
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  params.login_id=bingkai[indek].login.id;  

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_one',
    params,(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      // message.none(indek);
      if(paket.err.id==0){
        return abc(paket);
      }else{
        message.infoPaket(indek,paket);
      }
  });
}

db1.createOne_with_image=function(indek,dataku){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id;

  xhr.api(
    db.endPoint(indek,'create'),
    dataku,
    (paket)=>{
      content.infoPaket(indek,paket);
      toolbar.wait(indek,END);
      if (paket.err.id===0){
        toolbar.save.none(indek);
        toolbar.neuu.display(indek);
      }
      uploadImageChange(paket,indek);// image
  });
}

db1.updateOne_with_image=function(indek,dataku){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id;

  xhr.api(
    db.endPoint(indek,'update'),
    dataku,
    (paket)=>{
      content.infoPaket(indek,paket);
      toolbar.wait(indek,END);
      if (paket.err.id===0){
        toolbar.save.disabled(indek);
      }
      uploadImageChange(paket,indek);// image
  });
}

db1.deleteOne=function(indek,dataku,hasil){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id;

  xhr.api(
    db.endPoint(indek,'delete'),
    dataku,
    (paket)=>{
      content.infoPaket(indek,paket);
      toolbar.wait(indek,END);
      if (paket.err.id===0){
        toolbar.delet.disabled(indek);
      }
      if(hasil!=undefined){
        return hasil(paket);
      }
  });
}

db1.search=function(indek,abc){
  bingkai[indek].metode=MODE_RESULT;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  
  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/search',
    {
      "login_id":bingkai[indek].login.id,
      "search":bingkai[indek].text_search
    },(paket)=>{
      bingkai[indek].paket=paket;
      toolbar.wait(indek,END);
      statusbar.message(indek,paket);
      
      if(paket.err.id==0){
        return abc(paket);
      }else{
        content.infoError(indek,paket);
      }
  });
}

db1.readExport=function(indek,params,abc){
  var html='<div id="msg_'+indek+'"></div>'
    +'<h1>Please wait...</h1>'
    +'Mohon tunggu hingga tombol download tampil dilayar.'
  content.html(indek,html);
  
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  message.wait(indek);

  params.login_id=bingkai[indek].login.id; //only 1 param: login_id;

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/export',
    params,(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      message.none(indek);
      if(paket.err.id==0){
        return abc(paket);
      }else{
        message.infoPaket(indek,paket);
      }
  });
}

db1.updateOne=function(indek,dataku){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);

  dataku.login_id=bingkai[indek].login.id;

  xhr.api(
    db.endPoint(indek,'update'),
    dataku,
    (paket)=>{
      content.infoPaket(indek,paket);
      toolbar.wait(indek,END);
      if (paket.err.id===0){
        toolbar.save.disabled(indek);
      }
  });
}

db1.createOne=function(indek,dataku,hasil){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id;

  xhr.api(
    db.endPoint(indek,'create'),
    dataku,
    (paket)=>{
      content.infoPaket(indek,paket);
      toolbar.wait(indek,END);
      if (paket.err.id===0){
        toolbar.save.none(indek);
        toolbar.neuu.display(indek);
      }
      if(hasil!=undefined){
        return hasil(paket);
      }
  });
}

db1.query=function(indek,endpoint,dataku,callback){
  dataku.login_id=bingkai[indek].login.id; //1
  xhr.api(
    bingkai[indek].server.url+endpoint,
    dataku,
    callback,
  );
}

db1.readLook=function(indek,abc){
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";
  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_paging',
    {
      "login_id":bingkai[indek].login.id,
      "page":bingkai[indek].page,
      "limit":bingkai[indek].paging.limit,
      "inactive":1// active only
    },(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc();
  });
}

// eof: 182;205;215;
