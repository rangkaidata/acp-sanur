/*
 * name: budiono;
 * date: mar-26, 23:09, tue-2024; infoh quota limit;
 * edit: aug-27, 11:29, tue-2024; r13;
 * edit: aug-31, 16:14, sat-2024; r14; create, send, redeem;
 * edit: sep-02, 22:36, mon-2024; r14; token;
 * edit: sep-03, 10:58, tue-2024; r14; add history;
 * -----------------------------; happy new year 2025;
 * edit: jan-03, 15:38, fri-2025; #32; properties;
 * edit: mar-04, 16:06, tue-2025; #41; file_id;
 * edit: mar-16, 14:51, sun-2025; #43; deep-folder;
 * edit: mar-23, 14:22, sun-2025; #45; ctables;cstructure;
 */
 
'use strict';

var Quota={}

Quota.form=new ActionForm2(Clipboard);
Quota.table_name="quota";
Quota.hideSelect=true;
Quota.hideImport=true;
Quota.hideNew=true;

Quota.show=(tiket)=>{
  tiket.modul=Quota.table_name;
//  tiket.menu.name="Quota";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    getPath(indek,Quota.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        Quota.formView(indek);
      });
    });
  }else{
    show(baru);
  }  
}

Quota.formView=(indek)=>{
  Quota.form01(indek);
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  toolbar.refresh(indek,()=>Quota.formView(indek));
  Quota.readOne(indek,()=>{
    toolbar.download(indek,()=>Quota.formExport(indek)); 
  });  
}

Quota.form01=(indek)=>{
  bingkai[indek].metode='Info';
  
  var html='<div style="margin:1rem;">'
    +content.title(indek)
    +content.message(indek)    
    +'<div>'
    +'<form autocomplete="off">'      
    
    +'<div style="display:inline-block;">'
    +'<div style="display:inline;">'
      +'<div style="float:left;'
      +'margin-left:0px;margin-right:50px;'
      +'border-left:3px solid red;'
      +'padding-left:5px;">'
        +'<h2>Token</h2>'
        +'<ul>'
          +'<li><label>Begin</label>: '
            +'<i id="begin_'+indek+'">0 tx</i>'
          +'</li>'
        
          +'<li><label>Add</label>: '
            +'<i id="add_'+indek+'">0 tx</i>'
          +'</li>'
          
          +'<li><label>Send</label>: '
            +'<i id="send_'+indek+'">0 tx</i>'
          +'</li>'
          
          +'<li><label>Receive</label>: '
            +'<i id="receive_'+indek+'">0 tx</i>'
          +'</li>'
        +'</ul>'

      +'</div>'
    
      +'<div style="float:left;'
      +'margin-right:50px;'
      +'border-left:3px solid gold;'
      +'padding-left:5px;">'
        +'<h2>Blockchain</h2>'
        +'<ul>'

        +'<li><label>Size</label>: '
          +'<i id="size_'+indek+'"></i>'
        +'</li>'
          
        +'<li><label>Used</label>: '
          +'<i id="used_'+indek+'"></i>'
        +'</li>'

        +'<li><label>Free</label>: '
          +'<i id="free_'+indek+'"></i>'
        +'</li>'
        +'</ul>'

      +'</div>'
      
      +'<div style="float:left;'
      +'margin-right:50px;'
      +'border-left:3px solid blue;'
      +'padding-left:5px;">'

        +'<h2>Transaction</h2>'
        +'<ul>'
        +'<li><label>Commit</label>: '
          +'<i id="ok_'+indek+'"></i></li>'
          
        +'<li><label>Rollback</label>: '
          +'<i id="err_'+indek+'"></i></li>'
        +'</ul>'
      +'</div>'

      +'<div style="float:left;'
      +'margin-right:50px;'
      +'border-left:3px solid green;'
      +'padding-left:5px;">'
        +'<h2>Statement</h2>'
        +'<ul>'
        +'<li><label>Insert</label>: '
          +'<i id="insert_'+indek+'"></i></li>'
          
        +'<li><label>Update</label>: '
          +'<i id="update_'+indek+'"></i></li>'
          
        +'<li><label>Delete</label>: '
          +'<i id="delete_'+indek+'"></i></li>'
          
        +'<li><label>Lock</label>: '
          +'<i id="lock_'+indek+'"></i></li>'

        +'</ul>'
      +'</div>'
      +'<div>&nbsp;</div>'
    +'</div>'
    +'</div>'
    +'<div>'
      +'<p>'
      +'<input type="button" value="&#10020 ADD" '
        +'style="padding:5px 15px;margin:2px 5px;"'
        +'onclick="Quota.addQuota(\''+indek+'\')">'
        
      +'<input type="button" value="&#10020 SEND" '
        +'style="padding:5px 15px;margin:2px 5px;"'
        +'onclick="Quota.sendQuota(\''+indek+'\')">'
      
      +'<input type="button" value="&#10020 REDEEM" '
        +'style="padding:5px 15px;margin:2px 5px;"'
        +'onclick="Quota.receiveQuota(\''+indek+'\')">'
        
      +'<input type="button" value="&#10020 HISTORY" '
        +'style="padding:5px 15px;margin:2px 5px;"'
        +'onclick="Quota.historyQuota(\''+indek+'\')">'
        
      +'</p>'
    +'</div>'
    +'</form>'
    +'<div>'
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

Quota.mainToolbar=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>Quota.formView(indek));
}

Quota.historyQuota=(indek)=>{
  Quota.mainToolbar(indek);
  bingkai[indek].metode='History';
  db.execute(indek,{
    query:"SELECT admin_name,user_name,type,amount,note,date_created"
      +" FROM quota"
      +" ORDER BY date_created"
  },()=>{
    Quota.showQuota(indek);
  });
}

Quota.showQuota=(indek)=>{
  let p=bingkai[indek].paket;
  let d=objectMany(p.fields,p.data);  
  
  var html='<div style="margin:1rem;">'
    +'<form>'
      +content.title(indek)
      +content.message(indek)
      +'<table border=1 width=100%>'
        +'<caption>&nbsp;</caption>'
        +'<th>From</th>'
        +'<th>To</th>'
        +'<th>Type</th>'
        +'<th>Amount</th>'
        +'<th>Note</th>'
        +'<th>Date Created</th>';
      if (p.err.id===0){
        for (var x in d) {
          html+='<tr>'
          +'<td align="center">'+d[x].admin_name+'</td>'
          +'<td align="center">'+d[x].user_name+'</td>'
          +'<td align="center">'+array_quota_type[d[x].type]+'</td>'
          //+'<td align="center">'+d[x].type+'</td>'
          +'<td align="center">'+d[x].amount+'</td>'
          +'<td align="left">'+xHTML(d[x].note)+'</td>'
          +'<td align="center">'+tglInt(d[x].date_created)+'</td>'
          +'</tr>'
        }
      }
      html+='</table>'
    +'</form>'
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

Quota.addQuota=(indek)=>{
  Quota.mainToolbar(indek);

  bingkai[indek].metode='Add';
  
  var html='<div style="margin:1rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<form>'
      +'<ul>'
        +'<li>'
          +'<label>User Name</label>'
          +'<input type="text" disabled'
            +' size="10"'
            +' value ="'+bingkai[indek].login.name+'"'
            +' id="user_name_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<label>Block amount</label>'
          +'<input type="text" '
            +' size="10"'
            +' id="amount_'+indek+'"> tx'
        +'</li>'
        +'<li>'
          +'<label>Note</label>'
          +'<input type="text" '
            +' size="30"'
            +' id="note_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<input type="button" '
          +' value="Create"'
          +' id="btn_quota_'+indek+'"'
          +' onclick="Quota.quotaExecute(\''+indek+'\',1)">' // create quota (1);
        +'</li>'
      +'</ul>'
    +'</form>'
    +'<p><i>&#10020 Form ini digunakan untuk menambah sejumlah block (size) hanya untuk ke user ini (login).</i></p>'
    +'<p><i>&#10020 Untuk user non sysadmin (free) dibatasi hanya bisa menambah tujuh (7) block/login.</i></p>'
    +'<p><i>&#10020 Untuk user sysadmin dapat menambah block tanpa dibatasi (not limited/contract).</i></p>'
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);
}

Quota.quotaExecute=(indek,quota_type)=>{
  db.run(indek,{
    query:"INSERT INTO quota "
      +"(user_name,type,amount,note"
      +") VALUES "
      +"('"+getEV("user_name_"+indek)+"'"
      +",'"+quota_type+"'"
      +",'"+getEV('amount_'+indek)+"'"
      +",'"+getEV('note_'+indek)+"'"
      +")"
  },(p)=>{
    content.infoPaket(indek,p);
    if(p.err.id==0){
      document.getElementById('btn_quota_'+indek).disabled=true;
    }
  });
}

Quota.sendQuota=(indek)=>{
  Quota.mainToolbar(indek);

  bingkai[indek].metode='Send';
  
  var html='<div style="margin:1rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<form>'
      +'<ul>'
        +'<li>'
          +'<label>From User Name</label>'
          +'<input type="text" disabled'
            +' size="10"'
            +' value="'+bingkai[indek].login.name+'"'
            +' id="from_user_name_"'+indek+'>'
        +'</li>'
        +'<li>'
          +'<label>To User Name</label>'
          +'<input type="text" '
            +' size="10"'
            +' id="user_name_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<label>Block Amount</label>'
          +'<input type="text" '
            +' size="10"'
            +' id="amount_'+indek+'"> tx'
        +'</li>'
        +'<li>'
          +'<label>Note</label>'
          +'<input type="text" '
            +' size="30"'
            +' id="note_'+indek+'">'
        +'</li>'
        +'<li>'
          +'<input type="button" '
          +' value="Send"'
          +' id="btn_quota_'+indek+'"'
          +' onclick="Quota.quotaExecute(\''+indek+'\',2)">'// send Quota (2);
        +'</li>'
      +'</ul>'
    +'</form>'
    +'<p><i>&#10020 Form ini digunakan untuk mengirim sejumlah block ke user lain.</i></p>'
    +'<p><i>&#10020 Jumlah block untuk user pengirim akan berkurang, dan jumlah block user penerima akan bertambah.</i></p>'
    +'</div>'
  content.html(indek,html);
  statusbar.ready(indek);  
}

Quota.receiveQuota=(indek)=>{
  Quota.mainToolbar(indek);
  content.wait(indek); 
  Quota.getRedeem(indek);
}

Quota.getRedeem=(indek)=>{
  bingkai[indek].metode='Redeem';
  
  db.execute(indek,{
    query:"SELECT token,amount,admin_name,date_created"
      +" FROM redeem"
      +" WHERE user_name='"+bingkai[indek].login.name+"'"
  },(p)=>{
    var html='<div style="margin:1rem;">'
      +content.title(indek)
      +content.message(indek)
      +'<form>'
      +'<table>'
        +'<th>Token</th>'
        +'<th>Block Amount</th>'
        +'<th>From</th>'
        +'<th>Date Created</th>'
        +'<th>Action</th>';

      if(p.count>0){
        var d=objectMany(p.fields,p.data);
          for (var x in d) {
            // alert(d[x].token);
            html+='<tr>'
              +'<td align="center">'+blokID2(d[x].token)+'</td>'
              +'<td align="center">'+d[x].amount+' tx</td>'
              +'<td align="center">'+d[x].admin_name+'</td>'
              +'<td align="center">'+tglInt(d[x].date_created)+'</td>'
              +'<td align="center">'
                +'<button type="button"'
                +' id="btn_redeem_'+x+'_'+indek+'" '
                +' onclick="Quota.redeemExecute(\''+indek+'\''
                +',\''+x+'\''
                +',\''+d[x].token+'\');"> Redeem'
                +'</button>'
                +'</td>'
              +'</tr>';
          }
      }
    html+='</table>'
    +'</form>'
    +'</div>';
    content.html(indek,html);
    if(p.err.id!=0) {
      content.infoPaket(indek, p);
    }else{
      statusbar.ready(indek);
    }
  })
}

Quota.redeemExecute=(indek,x,token)=>{
  db.run(indek,{
    query: "INSERT INTO redeem"
      +"(token,user_name"
      +") VALUES "
      +"('"+token+"'"
      +",'"+bingkai[indek].login.name+"'"
      +")"
  },(p)=>{
    content.infoPaket(indek,p);
    if(p.err.id==0){
      document.getElementById('btn_redeem_'+x+'_'+indek).disabled=true;
    }
    
  });
}

Quota.readOne=(indek,eop)=>{
  db.run(indek,{
    query:"SELECT size, begin, add, send, receive, "
      +" used, free, "
      +" stmt_insert, stmt_update, stmt_delete, "
      +" stmt_lock, stmt_unlock, "
      +" stmt_ok, stmt_err "
      +" FROM quota_blockchain_sum"
  },(paket)=>{
    if(paket.err.id==0){
      var v=objectOne(paket.fields,paket.data);
      setEH('size_'+indek, v.size+' tx');
      
      setEH('begin_'+indek, v.begin+' tx');
      setEH('used_'+indek, v.used+' tx');
      setEH('free_'+indek, v.free+' tx');
      setEH('add_'+indek, v.add+' tx');
      setEH('send_'+indek, v.send+' tx');
      setEH('receive_'+indek, v.receive+' tx');
      
      setEH('insert_'+indek, v.stmt_insert+' tx');
      setEH('update_'+indek, v.stmt_update+' tx');
      setEH('delete_'+indek, v.stmt_delete+' tx');
      setEH('lock_'+indek, v.stmt_lock+' tx');
      // setEH('unlock_'+indek, v[0][7]+' tx');
      setEH('ok_'+indek, v.stmt_ok+' tx');
      setEH('err_'+indek, v.stmt_err+' tx');
      statusbar.message(indek,paket);
      message.none(indek);
    }else{
      content.infoPaket(indek,paket);
    }
    return eop();
  });
}

Quota.formExport=function(indek){
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>Quota.formView(indek));
  Quota.exportExecute(indek);
}

Quota.exportExecute=(indek)=>{
  var table_name=Quota.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}




//eof: 145;400;448;459;466;
