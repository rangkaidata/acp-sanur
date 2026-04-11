/*
 * auth: budiono
 * date: oct-04, 11:18, fri-2024; #20;
 * -----------------------------; happy new year 2025;
 * edit: mar-04, 16:08, tue-2025; #41; file_id;
 */ 

'use strict';

var Redeem={
  url:'login'
};

Redeem.show=(tiket)=>{
  tiket.modul=Logout.url;
  tiket.ukuran.lebar=45;
  tiket.ukuran.tinggi=28;
  // tiket.toolbar.ada=0;
  tiket.bisa.besar=0;
  tiket.bisa.kecil=0;
  tiket.bisa.ubah=0;
  tiket.letak.atas=0;

  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiSpesial(tiket);
    var indek=newReg.show();
    Redeem.formRedeem(indek);
  }else{
    show(baru);
  }  
}

Redeem.formRedeem=(indek)=>{
  toolbar.none(indek);
  Redeem.form_entry(indek);
}

Redeem.read_one=(indek)=>{
  let user_name=getEV('user_name_'+indek);
  bingkai[indek].admin.name=user_name;
  
  toolbar.back(indek,()=>Redeem.form_entry(indek));
  bingkai[indek].metode='Redeem';
  
  db.run(indek,{
    query:"SELECT token,amount,admin_name,date_created"
      +" FROM redeem"
      +" WHERE user_name='"+user_name+"'"
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
                +' onclick="Redeem.redeemExecute(\''+indek+'\''
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

Redeem.form_entry=(indek)=>{
  toolbar.none(indek);

  var html='<div class="div-center">'
    +'<div id="msg_'+indek+'"'
    +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    
    +'<form autocomplete="off" align="center">'
    +'<ul>'
    +'<li>&#128100; <label>User Name</label>&nbsp;'
      +'<input type="text" id="user_name_'+indek+'">'
      
    +'<li>&nbsp;</li>'
      
    +'<li><button type="button"'
      +' id="button_create_'+indek+'"'
      +'  onclick="Redeem.read_one(\''+indek+'\')">'
      +'&#128275; Redeem</button>'
      +'</li>'
    
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  document.getElementById('user_name_'+indek).focus();
}

Redeem.redeemExecute=(indek,x,token)=>{
  db.run(indek,{
    query: "INSERT INTO redeem"
      +"(token,user_name)"
      +" VALUES "
      +"('"+token+"','"+bingkai[indek].admin.name+"')"
  },(p)=>{
    if(p.err.id==0){
      document.getElementById('btn_redeem_'+x+'_'+indek).disabled=true;
    }
    content.infoPaket(indek,p);
  });
}


// eof: 98;116;136;
