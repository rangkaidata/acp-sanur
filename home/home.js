/*
 * auth: budiono
 * date; sep-04, 11:55, mon-2023; new;154;
 * edit: sep-17, 08:14, sun-2023; xHTML;
 * -----------------------------; happy new year 2024;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 17:45, thu-2025; #32;
 */

'use strict';

var Home={
  refresh:false,
  alive:false,
  xyz:-1
}

Home.show=(tiket)=>{
  tiket.modul='home';
  tiket.bisa.tambah=0;

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    mkdir(indek,'home',()=>{
      Home.formView(indek);
      Home.xyz=indek;      
    });
  }else{
    show(baru);
    Home.formView(baru);
    Home.xyz=baru;
  }
  Home.alive=true;

}

Home.formView=(indek)=>{
  Home.refresh=false;
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.refresh(indek,()=>Home.formFolder(indek));
  Home.formFolder(indek);
}

Home.formFolder=(indek)=>{
  //var html='<h1><big>&#8962</big> Home</h1>';
  var html='<h2 color="#DCDCDC"><big>&#127968</big>'
    +'&nbsp'+bingkai[indek].menu.name
    +'</h2><hr color="#E8E8E8">';
  var tiket={};
  var nmFolder='';
  
  db.run(indek,{
    query:"SELECT  home_id,menu_id,menu_name,menu_type,admin_name,"
      +" company_id,company_name"
      +" FROM home"
      +" ORDER BY date_created DESC;"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){

      var d=objectMany(paket.fields,paket.data);
      
      for (var x in d){        
        if(d[x].company_name==''){
          nmFolder=d[x].menu_name;
        }else{
          nmFolder=(xHTML(d[x].company_name)).slice(0,8)+'/ '
            +d[x].menu_name;
        }
        
        html+='<div id="msg_'+indek+'" style="margin-bottom:1rem;">'
          +'</div>'
          +'<div style="width:6.5rem;'
          +'height:7.5rem;'
          +'word-wrap:inherit;'
          +'text-overflow:ellipsis;'
          +'overflow:hidden;'
          +'margin:0.1rem;'
          +'float:left;'
          +'border:0px;'
          +'border-radius:5%;'
          +'white-space:normal;text-align:center;'
          +'"'
          +'id="'+d[x].home_id+'"'
          //+'onclick="Home.klik(\''+(antrian.length-1)+'\');"'
          +'onclick="Home.klik(\''+indek+'\''
          +',\''+d[x].home_id+'\');"'
          +' onMouseOver="this.style.backgroundColor=\'lightgrey\'" '
          +' onMouseOut="this.style.backgroundColor=\'white\'">'

          +'<div style="font-size:2.1rem;">'
            +Menu.ikon2(d[x].menu_type)
            +'</div>'
          +''+nmFolder+''
        +'</div>'
      }
      if(paket.count==0){
        html+='<div align="center">'
          +'<h1>Folder is Empty</h1>'
          +'</div>';
      }
      content.html(indek,html);
      statusbar.message(indek,paket);
    }else{
      html+='<div align="center">'
      +'<h1>Folder is Empty</h1>'
      +'</div>';
      content.html(indek,html);
      statusbar.message(indek,paket);
      //content.infoError(indek,paket);
    }
  });
}

Home.klik=(indek,home_id)=>{
  db.run(indek,{
    query:"SELECT * FROM home "
      +" WHERE home_id='"+home_id+"'"  
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      paket.data=objectOne(paket.fields , paket.data);// konvert

      bingkai[indek].paket=paket;
      bingkai[indek].paket_access=[{
        admin_name:'root',
        company_id:paket.data.company_id,
        company_name:paket.data.company_name,
      }]

      if(paket.data.admin_name!=bingkai[0].login.name){
        // mengambil menu-access
        db.run(indek,{
            query:"SELECT * FROM access"
            +" WHERE admin_name='" + paket.data.admin_name + "'"
            +" AND company_id='" + paket.data.company_id + "'"
        },(paket2)=>{

          if(paket2.count>0){
            var d=objectMany(paket2.fields,paket2.data);// convert;
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
            
            bingkai[indek].paket_access=d;
            
            const listMenu={
              'id':invite_id,
              'data':itmMenu
            }

            Menu.invite.push(listMenu);// tambah menu
            Home.preview(indek,home_id);
          }else{
            Home.page404(indek,home_id,paket.data.menu_id);
          }
        });
      }else{
        Home.preview(indek,home_id);
      }
    }else{
      Home.page404(indek,home_id,'');
    }
    message.none(indek);
  });
}

Home.company=(indek,home_id,admin_name,company_id,callback)=>{
  db.run(indek,{
    query:"SELECT company_id,name,decimal_places"
      +" FROM company"
      +" WHERE admin_name='"+admin_name+"'"
      +" AND company_id='"+company_id+"'"
  },(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      return callback({
        company_id: d.company_id,
        name: d.name,
        decimal_places:d.decimal_places,
      });
    }else{
      return callback({
        company_id: "",
        name: "",
        decimal_places: 1,
      });
    }
  });
}

Home.preview=(indek,home_id)=>{
  const paket=bingkai[indek].paket;
  const paket_access=bingkai[indek].paket_access[0];
  const tiket=JSON.parse(JSON.stringify(bingkai[indek]));
  const invite_id=[paket_access.admin_name,  paket_access.company_id];

  Home.company(indek,home_id,paket.data.admin_name,paket_access.company_id,(p)=>{
//    alert(p.name);
//    alert(p.decimal_places);
    
    tiket.baru=false;
    tiket.home.id=home_id;

    // multi user;
    tiket.invite.id=invite_id; //paket.data.invite_id;
    tiket.admin.name=paket.data.admin_name;
    //
    tiket.menu.id=paket.data.menu_id;
    
    tiket.company.id=     paket_access.company_id;
    tiket.company.name=   paket_access.company_name;
    tiket.company.decimal_places=p.decimal_places;
    
    tiket.menu.name=paket.data.company_name;
    tiket.menu.parent=paket.data.parent;// HERE
    
    if(tiket.admin.name!=paket.data.user_name){// multiuser;
      tiket.folder=paket.data.user_name
        +'@'+paket_access.admin_name
        +': /Home';
    }
    if(tiket.company.id!=''){
      tiket.folder+='/'+xHTML(paket.data.company_name);
    }
    // if(tiket.menu.name=='') tiket.menu.name=paket.data.menu_name;
    tiket.menu.name=paket.data.menu_name;

    antrian.push(tiket);
    Menu.klik(antrian.length-1);
    
  });
}

Home.page404=(indek,home_id,menu_id)=>{
  const tiket404=JSON.parse(JSON.stringify(bingkai[indek]));
  tiket404.baru=true;
  tiket404.home.id=home_id;
  tiket404.menu.id=menu_id;
  Page404.show(tiket404);  
}



// eof: 154;253;


