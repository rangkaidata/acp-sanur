/*
 * auth: budiono
 * date: sep-04, 11:01, mon-2023; new file;207;
 * edit: sep-05, 10:41, tue-2023; mod;214;
 * edit: sep-13, 22:39, wed-2023; 
 * edit: sep-15, 11:03, fri-2023; 
 * edit: sep-29, 10:37, fri-2023; 
 * edit; oct-03, 15:04, tue-2023; 26:user;updateOne;
 * edit: oct-10, 15:54, tue-2023; 
 * edit: nov-02, 12:50, thu-2023; 21;
 * edit: dec-27, 21:37, wed-2023; select;
 * edit: dec-29, 07:52, fri-2023; READ_PAGING;
 * -----------------------------; happy new year
 * edit: jan-01, 10:32, mon-2024; limit;
 * edit: mar-15, 09:47, fri-2024; 
 * edit: mar-16, 20:02, sat-2024; 
 * edit: jun-11, 21:24, tue-2024; db.query2()-->db.run();
 * edit: nov-07, 16:26, thu-2024; #25; 
 */
 
'use strict';
/*
const xhr={};
const BEGIN=true;
const END=false
const MODE_CREATE='Create Data [C]';
const MODE_READ='Read Data [R]';
const MODE_UPDATE='Update Data [U]';
const MODE_DELETE='Delete Data [D]';
const MODE_RESULT='Search Result [S]';
const MODE_EXPORT='Export Data [E]';
const MODE_IMPORT='Import Data [I]';
const MODE_SEARCH='Text to Search [T]';
const MODE_VIEW='View Data [V]';
const MODE_SELECT='Select Data [X]';

var SELECT_ALL=false;//old
var READ_PAGING=false;//old

var PAGING=true;// new
*/
xhr.api=function(xyz,obj,callback){
  var request = new XMLHttpRequest();
  var dbParam = JSON.stringify(obj);
  request.onload=function(){
    // console.log(request);
    if (request.readyState===4){
      console.log(request.response);
      const lebar_response=myTrim(request.response);
      if(lebar_response.length==0){
        callback({"err":-5
          ,"msg":"Server response error. No data packet!!!"
        });
      }else{
        const paket = JSON.parse(request.responseText);
        if(paket.err==24){
          ui.clearForm(paket);
        }else{ 
          callback(paket);
        }
      }
    }
    else {
      console.log('Network request failed with response ' 
        + request.status + ': ' 
        + request.statusText);
    }
  };
  request.onerror=function(err){
    console.log(err);
    callback({
      err:{
        id:-7,
        msg:"No Response. Server error / can't connect."
      }
    });
  }
  request.open('POST', xyz);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(dbParam);
}

db.query=function(indek,endpoint,dataku,callback){
  xhr.api(
    bingkai[indek].server.url+endpoint,
    dataku,
    callback,
  );
}

db.infoPaket=function(indek,paket){
  message.paket(indek,paket);
  statusbar.message(indek,paket);
  document.getElementById('frm_konten_'+indek).scrollTop = 0;
}

db.info=function(paket){
  var pesan='';
  if (paket.err.id===0){
    pesan='<span style="background-color:#b3ffb3;';
  }else{
    pesan='<span style="background-color:#ffb3b3;';
  }
  pesan+='padding:0.5rem;border-radius:0rem 1rem 1rem 0rem;">';
  pesan+=db.error(paket);
  pesan+='<span class="close" onclick="db.tutupMsg(this);">\u00D7</span></span>';
  return pesan;
}

function capitalize1(str){
  if(str.length===0){
    return "";
  }
  return str.charAt(0).toUpperCase()+ str.slice(1);
}

db.error=function(paket){
  // console.log(paket);
  var msg_custom=paket.err.msg;
  var key=paket.err.key;
  var val=paket.err.value;
  var keyID='';
  var valID='';
  if(paket.err.id==0){
    if(key.length>0) keyID=nmKolom(key[key.length-1]);
    if(val.length>0) valID=xHTML(val[val.length-1]);
  }
  
  switch(paket.err.id){
    case 0: // success execute
      switch(paket.metode){
        case "create":
          //msg_custom="<b>Create OK.</b> [#"+valID+"] has been created.";
          msg_custom="<b>Create OK.</b> "+capitalize1(paket.modul)+" [#"+valID+"] created.";
          break;
        case "update":
          msg_custom="<b>Update OK.</b> "+capitalize1(paket.modul)+" [#"+valID+"] updated. ";
          break;
        case "delete":
          msg_custom="<b>Delete OK.</b> "+capitalize1(paket.modul)+" [#"+valID+"] deleted. ";
          break;
        case "restore":
          msg_custom="<b>Restore OK.</b> [#"+valID+"] restored. ";
          break;
        case "read_paging":
          msg_custom="Read Paging OK. "+paket.count+' rows. '
          break;
        case "search":
          msg_custom="Search OK. "+paket.count+' rows. '
          break;
        case "read_id":
          msg_custom="Read One OK. "+paket.count+' rows. '
          break;
        case "read_one":
          msg_custom="Read One OK. "+paket.count+' rows. '
          break;
        case "read":
          msg_custom="Read OK. "+paket.count+' rows. '
          break;
        case "export":
          msg_custom="Export OK. "+paket.count+' rows. '
          break;
        case "query":
          msg_custom="Query OK. "+paket.count+' rows. '
          break;
        default:
          msg_custom="Message error ["
            +paket.err.key[0]+"] not defined. "
          break;
      }
      break;

    case 404:
      msg_custom=paket.err.msg+'. ';
      break;
    case -1:
      msg_custom='ERR_x1: '+"No Response. Server error / can't connect.";
      break;
    case -7:
      msg_custom='ERR_4: '+"No Connection. Server error / can't connect.";
      break;
    case 1:
      msg_custom='ERR_1: '+'You must enter data raw. ';
      break;
    case 2:
      msg_custom='ERR_2: '+'Incorrect input data raw. ';
      break;
    case 3:
      msg_custom='ERR_3: '+'<b>You must enter</b> ['+nmKolom(key[0])+']. ';
      break;
    case 4:// sudah terdaftar;
      msg_custom='ERR_4: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b>already exists.</b>';
      break;
    case 5:// wrong 
      msg_custom='ERR_5: '+'<b>Incorrect</b> '
        +nmKolom(key[0])+' ['+xHTML(val[0])+'].';
      if(val[1]!=undefined) 
        msg_custom+=' <b>Please wait</b> '+xHTML(val[1]);
      break;
    case 6:// must same
      msg_custom='ERR_6: '+'<b>Not same</b> ['
      +nmKolom(key[0])+'], ['+nmKolom(key[1])+']. ';
      break;
    case 7:  // tidak terdaftar
      msg_custom='ERR_7: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b>does not exist.</b>';
      break;
    case 8:// record lock by proccess
      msg_custom='ERR_8: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b> lock by </b> '
        +nmKolom(key[1])
        +' ['+xHTML(val[1])+'], <b>try again later!</b>';
      break;
      
    case 9:// not enough quota
      msg_custom='ERR_9: '+'Dear ['+paket.err.path+'], <b>Please add quota.</b>';
      break;
      
    case 10:// login-expired
      msg_custom='ERR_10: '+'<b>Login expired.'
        +' Please press F5 to refresh page.</b> '
        +key[0]+' ['+xHTML(val[0])+']';
      break;
    case 12:// is root
      msg_custom='ERR_12: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b>is root</b>';
      break;      
    case 13:// no access
      msg_custom='ERR_13: '+'<b>Access Denied.</b> '
        +key[1]+' [<b>'+akses(val[1])+'</b>]. '
        +key[2]+' [<b>'+akses(val[2])+'</b>]';
      break;      
    case 14:// character for ID
      msg_custom='ERR_14: '+'<b>Can not accept character</b> '
        +key[0]+' ['+xHTML(val[0])+']'
      break;
    case 15:
      msg_custom='ERR_15: '+'<b>You must ['
        +array_network_status[1]
        +'] a network. Status</b> '
        +key[0]+' [<b>'+array_network_status[val[0]]+'</b>]'
      break;      
    case 16:
      msg_custom='ERR_16: '+key[0]+' ['+xHTML(val[0])+']'
        +'<b>is inactive.</b>'
      break;
      
    case 17:
      msg_custom='ERR_17: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b>locked by</b> '
        +nmKolom(key[1])+' ['+xHTML(val[1])+']'
      break;
      
    case 18:// mungkin kosong
      msg_custom='ERR_18: '+'The ['+xHTML(key[0])+']'
        +'<b>may not be blank.</b>'
      break;
      
    case 19:// saldo tidak seimbang
      msg_custom='ERR_19: '+'<b>Out of balance : </b>'+xHTML(val[0]);
      break;
      
    case 20:// kiri lebih kecil dari kanan
      msg_custom='ERR_20: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b>less than</b> '
        +nmKolom(key[1])+' ['+xHTML(val[1])+']';
      break;
      
    case 21:// kiri lebih besar dari kanan
      msg_custom='ERR_21: '+nmKolom(key[1])
        +' ['+xHTML(val[1])+'] <b>greater than</b> '
        +nmKolom(key[0])+' ['+xHTML(val[0])+']';
      break;
      
    case 22:// tidak boleh sama
      msg_custom='ERR_22: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b>can not be same values</b> '
        +nmKolom(key[1])+'['+xHTML(val[1])+']';
      break;
      
    case 24:// dua kali nilai yg sama
      msg_custom='ERR_24: '+'<b>double values</b> '
      +nmKolom(key[0])+' ['+xHTML(val[0])+']';
      
      if(key.length>1){
        msg_custom+=' and '+nmKolom(key[1])+' ['+xHTML(val[1])+']';
      }
      break;
      
    case 25:// bukan golongan stok persediaan.
      msg_custom='ERR_25: '+key[0]+' ['+val[0]+']'
        +' <b>class is not a stock item. </b> '
        +key[1]+' ['+default_item_class[val[1]]+']';
      break;
      
    case 26:// harus super_user
      msg_custom='ERR_26: '+'<b>You must</b> [super_user]';
      break;
      
    case 27:// user_level
      msg_custom='ERR_27: '+'<b>You must </b>'
        +key[0]+' ['+array_user_level[val[0]]+'], '
        +key[1]+' ['+array_user_level[val[1]]+'].';
      break;
      
    case 28:// sudah kadaluarsa
      msg_custom='ERR_28: '+'<b>date expired.</b> '
        +key[0]+' ['+val[0]+']';
      break;
      
    case 32:// nilainya tdk boleh minus
      msg_custom='ERR_32: '+nmKolom(key[0])
        +' ['+val[0]+'], <b>can\'t be minus.</b> ';
      break;
      
    case 33:// stok di gudang tidak cukup
      msg_custom='ERR_33: '+nmKolom(key[0])
        +' ['+val[0]+'], <b>out of stock</b> '
        +nmKolom(key[1])+' ['+val[1]+']';
        if(val.length>2){
          msg_custom+=', '+nmKolom(key[2])
          +' ['+val[2]+']';
        }
      break;
      
    case 34: // ada error di sql error
      msg_custom='ERR_34: '+'<b>Query execution Error: </b>'
        +nmKolom(key[0])
        +' ['+(val[0])+']'
      break;
      
    case 35:// di batasi login
      msg_custom='ERR_35: '+'This transaction <b>limited</b> by login. '
        +'Try again in <b>next</b> login.';
      break;
      
    case 36:// discount sudah lewat tanggak kadaluarsa
      msg_custom='ERR_36: '+'Discount expired  <b>['+(val[0])+']</b>'
      break;
      
    case 37:// periode sudah tutup atau dikunci.
      msg_custom='ERR_37: Accounting period is closed '
        +'<b>['+tglWest(val[0])+']</b>.'
        +' Transaction date <b>['+tglWest(val[1])+']</b>'
      break;
      
    case 38:// status read-only / terkunci
      msg_custom='ERR_38: '+nmKolom(key[0])
        //+' ['+xHTML(val[0])+'] record in <b>read-only</b> mode'
        +' ['+xHTML(val[0])+'] <b>is locked</b>'
      break;
      
    case 39:// folder masih ada isinya 
      msg_custom='ERR_39: Folder ['+val[0]+'] <b>not empty</b>.'
        +' Contains ['+val[1]+', ...]'
      break;
      
    case 40:// terjadi iterasi tanpa batas;
      msg_custom='ERR_40: Folder ['+val[0]+'] <b>infinity path</b>'
      break;
      
    case 41:// bukan admin;
      msg_custom='ERR_41: <b>Access denied. You are not admin.</b>'
      break;
      
    case 42:// realation ok
      msg_custom='MSG_OK: <b>Relation OK.</b>'
      break;
      
    case 43:// missing
      msg_custom='ERR_43: '+nmKolom(key[0])
        +' ['+xHTML(val[0])+'] <b>missing.</b>';
      break;
      
    case 44:// sisa 0
      msg_custom='ERR_44: '+nmKolom(key[0])+' ['+xHTML(val[0])+'] <b>Remaining 0 [Close]</b>'
      break;
      
    case 45:// durasi passcode
      msg_custom='ERR_45: <b>Passcode Expired.</b> '+nmKolom(key[0])+' ['+xHTML(val[0])+']</b>'
      break;
      
    case 46:// tidak ditemukan
      msg_custom='ERR_46: <b>Not found.</b> '+nmKolom(key[0])+' []</b>'
      break;

    default:
      msg_custom='Error id: '+paket.err.id+', not defined. ';
      break;
  }
  return msg_custom;
}

db.read=function(indek,abc){
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";
  
  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read',
    {
      "login_id":bingkai[indek].login.id,
      "company_id":bingkai[indek].company.id
    },(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc(paket);
  });
}

db.endPoint=function(indek,metode){
  return bingkai[indek].server.url+''+
  bingkai[indek].modul+'/'+metode;
}

db.tutupMsg=function(a){
  var div = a.parentElement;
  div.style.display = "none";
}

db.readPaging=function(indek,abc){
  bingkai[indek].metode=MODE_READ;
  toolbar.wait(indek,BEGIN);
  content.wait(indek);
  bingkai[indek].text_search="";

  xhr.api(
    bingkai[indek].server.url+
    bingkai[indek].modul+'/read_paging',
    {
      "page":bingkai[indek].page,
      "limit":bingkai[indek].paging.limit
    },(paket)=>{
      bingkai[indek].paket=paket;
      statusbar.message(indek,paket);
      toolbar.wait(indek,END);
      return abc();
  });
}

db.execute=function(indek,dataku,hasil){
  toolbar.wait(indek,BEGIN);
  
  if(document.getElementById('msg_'+indek)){
    message.wait(indek);
  }else{
    content.wait(indek);
  }
  
  dataku.login_id=bingkai[indek].login.id;
  // dataku.invite_id=bingkai[indek].invite.id;
  // dataku.admin_name=bingkai[indek].invite.name;
  // dataku.admin_name=bingkai[indek].network.admin_name;

  xhr.api(
    bingkai[indek].server.url,
    dataku,(paket)=>{
      bingkai[indek].paket=paket;
      toolbar.wait(indek,END);
      if(document.getElementById('msg_'+indek)){
        content.infoPaket(indek,paket);
      }else{
        statusbar.message(indek,paket);
      }
      
      if (paket.err.id===0){
        switch(paket.metode){
          case "create":
            toolbar.save.none(indek);
            toolbar.neuu.display(indek);
            break;
          case "update":
            toolbar.save.disabled(indek);
            break;
          case "delete":
            toolbar.delet.disabled(indek);
            break;
          case "read":
            //bingkai[indek].paket=paket;
            break;
          case "query":
            //bingkai[indek].paket=paket;
            break;
          default:
        }
      }
      if(hasil!=undefined){
        return hasil(paket);
      }
  });
}

db.deleteMany=function(indek,a){
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
    db.run(indek,a[j],(h)=>{
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

db.run=function(indek,dataku,callback){
  dataku.login_id=bingkai[indek].login.id;
  
  xhr.api(
    bingkai[indek].server.url,
    dataku,
    (p)=>{
      if(document.getElementById('msg_'+indek)) message.none(indek);
      return callback(p);
  });
}

db.run_no_message=function(indek,dataku,callback){
  dataku.login_id=bingkai[indek].login.id;
  
  xhr.api(
    bingkai[indek].server.url,
    dataku,
    (p)=>{
      // if(document.getElementById('msg_'+indek)) message.none(indek);
      return callback(p);
  });
}


// eof: 207;214;393;
