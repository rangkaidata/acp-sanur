/*
 * name: budiono
 * date: sep-04, 16:25, mon-2023; new; 186;
 * edit: sep-14, 16:39, thu-2023; 
 * edit: dec-27, 21:38, wed-2023; select;
 * edit: dec-28, 11:31, thu-2023; deleteMany();
 */

'use struct';

// param 1 "login_id":bingkai[indek].login.id,
// param 2 "invite_id":bingkai[indek].invite.id,
// param 3 "company_id":bingkai[indek].company.id,

db3.getLimit=(indek)=>{
  var limit=10;
  
  //bingkai[indek].paging.select=i;
  const i = bingkai[indek].paging.select;
  switch (i){
    case 0:limit=10;break;
    case 1:limit=20;break;
    case 2:limit=50;break;
    case 3:limit=100;break;
  }
  
  return limit;
}

db3.readPaging=function(indek,abc){
  READ_PAGING=true;
  SELECT_ALL=false;
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";
  
  var limit=10;
  
  //bingkai[indek].paging.select=i;
  const i = bingkai[indek].paging.select;
  switch (i){
    case 0:limit=10;break;
    case 1:limit=20;break;
    case 2:limit=50;break;
    case 3:limit=100;break;
  }
  
  const prm={};
  prm.login_id=bingkai[indek].login.id;
  prm.company_id=bingkai[indek].company.id;
  prm.invite_id=bingkai[indek].invite.id;
  prm.page=bingkai[indek].page;
  prm.limit=limit;
  
  if(bingkai[indek].add_param_pay_frequency){
    prm.pay_frequency=bingkai[indek].pay_frequency;
  }

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_paging',prm,(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc();
  });
}

db3.readSelect=function(indek,abc){
  SELECT_ALL=true;
  READ_PAGING=false;
  bingkai[indek].metode=MODE_SELECT;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_paging',
    {
      "login_id":bingkai[indek].login.id,
      "company_id":bingkai[indek].company.id,
      "invite_id":bingkai[indek].invite.id,
      "page":bingkai[indek].page,
      "limit":db3.getLimit(indek)
    },(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc();
  });
}

db3.createOne=function(indek,dataku,hasil){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id; //1
  dataku.company_id=bingkai[indek].company.id; //2
  dataku.invite_id=bingkai[indek].invite.id; //3

  xhr.api(db.endPoint(indek,'create'),dataku,
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
    }
  );
}

db3.readOne=function(indek,dataku,abc){
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id; //1
  dataku.company_id=bingkai[indek].company.id; //2
  dataku.invite_id=bingkai[indek].invite.id; //3

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_one',
    dataku,(paket)=>{
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

db3.updateOne=function(indek,dataku){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id;
  dataku.company_id=bingkai[indek].company.id; //2
  dataku.invite_id=bingkai[indek].invite.id; //3

  xhr.api(
    db.endPoint(indek,'update'),dataku,(paket)=>{
      content.infoPaket(indek,paket);
      toolbar.wait(indek,END);
      if (paket.err.id===0){
        toolbar.save.disabled(indek);
      }
  });
}

db3.deleteOne=function(indek,dataku,hasil){
  toolbar.wait(indek,BEGIN);
  message.wait(indek);
  
  dataku.login_id=bingkai[indek].login.id;
  dataku.company_id=bingkai[indek].company.id;
  dataku.invite_id=bingkai[indek].invite.id;

  xhr.api(
    db.endPoint(indek,'delete'),dataku,(paket)=>{
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

db3.search=function(indek,abc){
  SELECT_ALL=false;
  READ_PAGING=false;
  bingkai[indek].metode=MODE_RESULT;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  
  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/search',
    {
      "login_id":bingkai[indek].login.id,
      "company_id":bingkai[indek].company.id,
      "invite_id":bingkai[indek].invite.id,
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

db3.query=function(indek,endpoint,dataku,callback){
  dataku.login_id=bingkai[indek].login.id;
  dataku.company_id=bingkai[indek].company.id;
  dataku.invite_id=bingkai[indek].invite.id;
  xhr.api(
    bingkai[indek].server.url+endpoint,
    dataku,
    callback,
  );
}

db3.readExport=function(indek,dataku,abc){
  var html='<div id="msg_'+indek+'"></div>'
    +'<h1>Please wait...</h1>'
    +'Mohon tunggu hingga tombol download tampil dilayar.'
  content.html(indek,html);
  
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  message.wait(indek);

  dataku.login_id=bingkai[indek].login.id;
  dataku.company_id=bingkai[indek].company.id;
  dataku.invite_id=bingkai[indek].invite.id;

  xhr.api(
    bingkai[indek].server.url+bingkai[indek].modul+'/export',
    dataku,(paket)=>{
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

db3.readLook=function(indek,abc){
  READ_PAGING=true;
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";
  
  var limit=10;
  
  //bingkai[indek].paging.select=i;
  const i = bingkai[indek].paging.select;
  switch (i){
    case 0:limit=10;break;
    case 1:limit=20;break;
    case 2:limit=50;break;
    case 3:limit=100;break;
  }
  
  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_paging',
    {
      "login_id":bingkai[indek].login.id,
      "invite_id":bingkai[indek].invite.id,
      "company_id":bingkai[indek].company.id,
      "page":bingkai[indek].page,
      "limit":limit,
      "inactive":1// active only
    },(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc();
  });
}
/*
db3.readPaging2=function(indek,prm,abc){
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";
  
  prm.login_id=bingkai[indek].login.id;
  prm.company_id=bingkai[indek].company.id;
  prm.invite_id=bingkai[indek].invite.id;
  prm.page=bingkai[indek].page;
  prm.limit=bingkai[indek].paging.limit;

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_paging',prm,(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc();
  });
}*/

db3.deleteMany=function(indek,a){
  var k=0;
  var n=0;
  var hasil='<p>[Start]</p>';
  var msg='';
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'"></div>';
  content.html(indek,html);
  message.wait(indek);
  for(var j=0;j<a.length;j++){
    db3.query(indek,bingkai[indek].modul+'/delete',a[j],(h)=>{
      n++;
      hasil='['+n+'] '+db.error(h)+'<br>'+hasil;
      document.getElementById('msg_'+indek).innerHTML=
      '<p><b>Please wait ... </b>['+n+'/'+a.length+']</p>'+hasil;

      k++;
      if(a.length==k){
        hasil='<p>[End] <b>'+a.length+' rows</b></p>'+hasil;
        document.getElementById('msg_'+indek).innerHTML=hasil;
      }
    }); 
  }
  
  if(a.length==0){
    document.getElementById('msg_'+indek).innerHTML="0 rows. No item selected.";
  } 
}
// eof: 186;233;
