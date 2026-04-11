/*
 * name: budiono
 * date: aug-31, 07:10, thu-2023; new;751;
 * edit: mar-03, 15:22, sat-2023; add FORM DIV; 0=random;1=center;2=MAX;
 * edit: mar-18, 19:38, tue-2025; #44; my_menu;menu.folder;
 */ 
 
/*
 * const bebas1=Math.floor(Math.random() * 10);  // returns a random integer from 0 to 9 
 * const bebas2=Math.floor(Math.random() * 10);  // returns a random integer from 0 to 9 
 */ 
 
'use strict';

ui.setMenuBar=function(){
  
  ui.cekUkuranRem();
   
  const menuBar=document.createElement('div');// titlebar
  menuBar.style.width="100%";
  menuBar.style.top="0px";
  menuBar.style.right="0px";
  menuBar.style.height=ui.rm(ui.titlebar.tinggi)+'px';
  menuBar.style.paddingTop="0rem";
  menuBar.style.backgroundColor=ui.titlebar.warna;
  menuBar.style.position="absolute";
  menuBar.style.textAlign="center";
  menuBar.style.border="none";
  document.body.appendChild(menuBar);
  
  const menuBarTitle=document.createElement('button');
  menuBarTitle.innerHTML="Rangkaidata.com";
  menuBarTitle.setAttribute('id','menu_bar_title');
  menuBarTitle.style.padding="0.1rem 2rem 0.1rem 2rem";
  menuBarTitle.style.borderRadius='10px';
  menuBarTitle.style.position="relative";//relative
  menuBarTitle.style.fontWeight='bolder';
  menuBarTitle.style.top='1px';
  menuBarTitle.style.border='1px solid grey';
  menuBarTitle.style.display="none";
  
  menuBarTitle.onclick=function(){
    ui.titlebar_klik();
  };
  
  menuBarTitle.style.cursor='pointer';
  menuBar.appendChild(menuBarTitle);
  
  const menuBarR=document.createElement('div');
  menuBarR.setAttribute('id','menu_bar_r');
  menuBarR.innerHTML='network';
  menuBarR.style.position='absolute';
  menuBarR.style.display='flex';
  menuBarR.style.justifyContent='center';
  menuBarR.style.alignItems='center';
  menuBarR.style.right='1rem';
  menuBarR.style.top=0;
  menuBarR.style.height="1.5rem";//
  menuBar.appendChild(menuBarR);
  
  const menuBarH=document.createElement('div');
  menuBarH.setAttribute('id','menu_bar_h');
  menuBarH.style.height="1.5rem";//
  menuBarH.style.top="0rem";
  menuBarH.style.left="0rem";
  menuBarH.style.backgroundColor="#d0d3d4";
  menuBarH.style.position="absolute";
  document.body.appendChild(menuBarH);

  ui.menuBarContent();
}

ui.cekUkuranRem=function(){
  if(window.innerWidth !== undefined && window.innerHeight !== undefined) { 
    var w = window.innerWidth;
    var h = window.innerHeight;
  } else {  
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
  }
  layar.lebar=pxRem(w);
  layar.tinggi=pxRem(h);
}

ui.rm=function(rem){
  return Number(rem * parseFloat(getComputedStyle(document.documentElement).fontSize));
}

ui.menuBarContent=function(){  
  for (var i=0;i<datanya.length;i++){    
    if(parseInt(datanya[i].status)==1){
      const menuBarV=document.createElement('div');
      menuBarV.setAttribute('id','menu_bar_h_div_'+datanya[i].id);
      menuBarV.style.position="relative";
      menuBarV.style.display="inline-block";
      menuBarV.style.top="0.1rem";
      // menuBarV.style.display=datanya[i].display;
      document.getElementById('menu_bar_h').appendChild(menuBarV);
      
      const menuBarHBtn=document.createElement('button');
      menuBarHBtn.classList.add('dropbtn');
      menuBarHBtn.innerHTML=datanya[i].name;
      menuBarHBtn.setAttribute('id',datanya[i].id);
      menuBarHBtn.onclick=function(){ui.hideMenuKlik(this);};
      menuBarHBtn.addEventListener("mouseenter",function(event){event.target.style.backgroundColor="#3498DB";})
      menuBarHBtn.addEventListener("mouseout",function(event){event.target.style.backgroundColor="lightgray";})
      menuBarHBtn.style.backgroundColor="#d0d3d4";
      menuBarHBtn.style.color="#303030";
      menuBarHBtn.style.padding="0.2rem";
      menuBarHBtn.style.cursor="pointer";
      menuBarHBtn.style.border="none";
      menuBarHBtn.style.paddingLeft="0.5rem";
      menuBarHBtn.style.paddingRight="0.5rem";
      menuBarHBtn.style.display=datanya[i].display;
      document.getElementById('menu_bar_h').appendChild(menuBarHBtn);

      const menuBarHSub=document.createElement('div');
      menuBarHSub.setAttribute('id','divmenu_'+datanya[i].id);
      menuBarHSub.classList.add('dropdown-content');
      menuBarHSub.style.display="none";
      menuBarHSub.style.position="absolute";
      menuBarHSub.style.minWidth="10rem";// width
      menuBarHSub.style.top="0.5rem";
      menuBarHSub.style.left="0.1rem";
      menuBarHSub.style.padding="0.3rem";
      menuBarHSub.style.backgroundColor="#fff";
      menuBarHSub.style.borderRadius="5px";
      menuBarHSub.style.border="1px solid lightgrey";
      menuBarHSub.style.boxShadow="0px 8px 16px 0px rgba(0,0,0,0.2)";
      document.getElementById('menu_bar_h_div_'+datanya[i].id).appendChild(menuBarHSub);

      for(var j=0;j<datanya[i].submenu.length;j++){

        const menuBarVBtn=document.createElement('button');
        const arr={
          "id":datanya[i].submenu[j].id,
          "name":datanya[i].submenu[j].name,
          "type":datanya[i].submenu[j].type,
          "parent":datanya[i].submenu[j].parent,
          "folder":datanya[i].submenu[j].folder,
        }
        
        menuBarVBtn.setAttribute('id',datanya[i].submenu[j].id);
        menuBarVBtn.innerHTML=datanya[i].submenu[j].name;
        menuBarVBtn.style.width="100%";
        menuBarVBtn.style.textDecoration="none";
        menuBarVBtn.style.display="block";
        menuBarVBtn.style.border="none";
        menuBarVBtn.style.padding="0.3rem 0.5rem";
        menuBarVBtn.style.textAlign="left";
        menuBarVBtn.style.backgroundColor="white";
        menuBarVBtn.style.color="#303030";
        menuBarVBtn.addEventListener("mouseenter",function(event){
          event.target.style.backgroundColor="#3498DB";
          event.target.style.color="#fff";
        })
        menuBarVBtn.addEventListener("mouseout",function(event){
          event.target.style.backgroundColor="white";
          event.target.style.color="#303030";
        })
        menuBarVBtn.onclick=function(){
          const tiket=JSON.parse(JSON.stringify(bingkai[0]));// destruct arr
          tiket.parent=0;
          tiket.indek=-1;
          tiket.menu.id=arr.id;
          tiket.menu.name=arr.name;
          tiket.menu.parent=arr.parent;
          tiket.menu.folder=arr.folder;
          
          tiket.folder=bingkai[0].folder;
          
          antrian.push(tiket);
          Menu.klik(antrian.length-1);
        };
        menuBarHSub.appendChild(menuBarVBtn);
      }
    }
  }
  document.getElementById('window').style.visibility='hidden';
}

ui.recentlyApp=function(){
  const recentApp=document.createElement('div');
  recentApp.setAttribute('id','recentAppPlus');
  recentApp.style.position="fixed";
  recentApp.style.display="inline";
  //recentApp.style.bottom=ui.dock.tinggi+"px";
  recentApp.style.bottom="0px";
  recentApp.style.width="100%";
  recentApp.style.height="2rem";
  recentApp.style.textAlign="center";
  recentApp.style.overflow="none";
  recentApp.style.backgroundColor="transparent";// warna body
  document.body.appendChild(recentApp);
}

ui.changeMenuBarTitle=function(title){
  setEH('menu_bar_title', '&#128100 &nbsp;Hello, '+title);
}

ui.gantiJudul=function(indek){
  document.title=bingkai[indek].menu.name+' / '+document_title;
  if(document.getElementById('app_recent_'+indek)!=undefined){
    ui.aktifTabColor(indek)
  }
}

ui.tambahWindow=function(indek,title){
  const menuBarVBtn=document.createElement('button');
  menuBarVBtn.setAttribute('id','menu_btn_top_'+indek);
  menuBarVBtn.innerHTML=title;
  menuBarVBtn.style.whiteSpace="nowrap";
  menuBarVBtn.style.width="100%";
  menuBarVBtn.style.textDecoration="none";
  menuBarVBtn.style.display="block";
  menuBarVBtn.style.border="none";
  menuBarVBtn.style.padding="0.3rem 0.5rem";
  menuBarVBtn.style.textAlign="left";
  menuBarVBtn.style.backgroundColor="white";
  menuBarVBtn.style.color="#303030";
  menuBarVBtn.addEventListener("mouseenter",function(event){
    event.target.style.backgroundColor="#3498DB";
    event.target.style.color="#fff";
  })
  menuBarVBtn.addEventListener("mouseout",function(event){
    event.target.style.backgroundColor="white";
    event.target.style.color="#303030";
  })
  menuBarVBtn.onclick=function(){ui.windowKlik(indek)};
  document.getElementById('divmenu_window').appendChild(menuBarVBtn);
  document.getElementById('window').style.display="inline-block";
  
  //recently app tabulasi or dock menu

  const menuRecent=document.createElement('button');
  menuRecent.setAttribute('id','app_recent_'+indek);
  menuRecent.classList.add('tabulasi');
  menuRecent.innerHTML=bingkai[indek].menu.name+bingkai[indek].berapa;
  menuRecent.style.position="relative";
  menuRecent.style.borderRadius="10em 10em 10em 10em";
  menuRecent.style.border="1px solid grey";
  menuRecent.style.paddingRight="1em";
  menuRecent.style.paddingLeft="1em";
  menuRecent.style.marginBottom="0";
  menuRecent.style.marginTop="0";
  menuRecent.style.marginLeft="-1em";
  menuRecent.style.height="1.9em";
  menuRecent.onclick=function(){ui.windowKlik(indek)};
  if(document.getElementById('recentAppPlus')!=null){
    ui.disabledAllTab(indek);
    document.getElementById('recentAppPlus').appendChild(menuRecent);
    ui.aktifTabColor(indek);
    document.getElementById('recentAppPlus').style.zIndex=(ui.zindek+=2);
    bingkai[indek].tab_aktif='app_recent_'+indek;
    ui.bingkai_aktif(indek);
  }
  recent_count++;
}

ui.disabledAllTab=function(indek){
  const abc=document.querySelectorAll(".tabulasi");
  for (let i = 0; i < abc.length; i++) {
    abc[i].disabled=false;
    abc[i].style.color="#606060";
    abc[i].style.backgroundColor="lightblue";
  }  
}

ui.aktifTabColor=function(indek){
  if(document.getElementById('app_recent_'+indek)==null)return;
  document.getElementById('app_recent_'+indek).disabled=true;// satu
  document.getElementById('app_recent_'+indek).style.color="white";
  document.getElementById('app_recent_'+indek).style.backgroundColor="royalblue";
}

ui.bingkai_aktif=function(indek){
  var a={};
  a.indek=indek;
  a.dead=0;
  a.name=bingkai[indek].menu.name;
  bingkai_posisi.push(a);
}

function ui_klik(){
  if(global.klik==true)naikKeAtas(event.srcElement);
  
  global.klik=true;
  const nama=event.srcElement.id;
  if (nama.length==0){
    return;
  }
  const jendela_n=document.getElementById(nama);
  if (jendela_n==null){
    return;
  }
  const jendela_id=jendela_n.getAttribute('id');
  const jendela_arr=jendela_id.split("_");
  const jendela_nomer=(jendela_arr[jendela_arr.length-1]);
  if(document.getElementById('msg_'+jendela_nomer)!=undefined){
    // document.getElementById('msg_'+jendela_nomer).innerHTML='';
    // alert('oke');
  }
  if(document.getElementById("frm_"+jendela_nomer)==undefined){
    return;
  }else{
    //disabledAllTab();
    //aktifTabColor(jendela_nomer);
    //bingkai_aktif(jendela_nomer);
  }
  // hanya jendela+tombol+konten bisa klik
  if(event.srcElement.className!='jendela' &&
    event.srcElement.className!='tombol' && 
    event.srcElement.className!='konten' &&
    event.srcElement.className!='toolbar'){
      
      // console.log(event.srcElement.className);
    return;
  }
  if(ui.modal==true){
  }else{

    if(document.getElementById('recentAppPlus')!=null){
      document.getElementById('recentAppPlus').style.zIndex=(ui.zindek+=1);
    }

    ui.disabledAllTab(jendela_nomer);
    ui.aktifTabColor(jendela_nomer);
    ui.bingkai_aktif(jendela_nomer);
    ui.gantiJudul(jendela_nomer);
  }

  const bukan_jendela=document.getElementById("frm_"+jendela_nomer);
  if (!bukan_jendela){return;}

  if (jendela_id.substring(0,14)=="frm_btn_tutup_"){
    ui.CLOSE(jendela_nomer);    
  }
  if (jendela_id.substring(0,18)=="frm_btn_pop_tutup_"){
    ui.CLOSE_POP(jendela_nomer);
  }
  if (jendela_id.substring(0,13)=="frm_btn_mini_"){
    ui.MINIMIZE(jendela_nomer);
  }
  if (jendela_id.substring(0,13)=="frm_btn_rest_"){
    ui.RESTORE(jendela_nomer);
  }
  if (jendela_id.substring(0,13)=="frm_btn_maxi_"){
    ui.MAXIMIZE(jendela_nomer);
  }
  if (jendela_id.substring(0,12)=="frm_btn_add_"){
    ui.CLONE(jendela_nomer);
  }

  ui.updateHome();  
}

ui.hideMenuKlik=function(a){// hideMenu2
  if(ui.menu_bar_show==true){
    document.getElementById('divmenu_home').style.display="none";
    ui.menu_bar_show=false;
  }else{
    ui.hideMenu(a.getAttribute('id'));
    ui.menu_bar_show=true;
  }
}

ui.hideMenu=function(lagiKlik){
  ui.zindek++;
  document.getElementById('divmenu_'+lagiKlik).style.zIndex=ui.zindek;
  var dropdowns = document.getElementsByClassName("dropdown-content");
  for(var i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    openDropdown.style.display="none";
  }
  document.getElementById('divmenu_'+lagiKlik).style.display="block";
  ui.updateHome();
}

ui.windowKlik=function(indek){
  console.log('show: '+bingkai[indek].menu.id);
  ui.zindek+=1;
  document.getElementById("frm_"+indek).style.zIndex=ui.zindek;
  document.getElementById("frm_"+indek).style.display="inline";
  if(bingkai[indek].status==3){// maximize
    document.getElementById("frm_"+indek).style.left='0px';
  }else{
    document.getElementById("frm_"+indek).style.left=ui.rm(bingkai[indek].letak.kiri)+'px';
  }
  ui.gantiJudul(indek);
  document.getElementById('recentAppPlus').style.zIndex=(ui.zindek+=1);
  document.getElementById('app_recent_'+indek).style.zIndex=(ui.zindek+=1);
  ui.disabledAllTab(indek);
  ui.aktifTabColor(indek);
  ui.bingkai_aktif(indek);
  
  ui.updateHome();
}

ui.updateHome=function(){
  console.log('segera-update-home '+Home.refresh);
  
  if(Home.refresh==true){
    if(Home.alive==true){
      Home.formView(Home.xyz);
    }
  }
  
}

ui.ikonOn=function(indek){
  if(document.getElementById('frm_btn_add_'+indek)!=undefined){
    document.getElementById('frm_btn_add_'+indek).innerHTML="&#43";
  }
  if(document.getElementById('frm_btn_tutup_'+indek)!=undefined){
    document.getElementById('frm_btn_tutup_'+indek).innerHTML="&#10005";
  }
  if(document.getElementById('frm_btn_pop_tutup_'+indek)!=undefined){
    document.getElementById('frm_btn_pop_tutup_'+indek).innerHTML="&#10005";
  }
  if(document.getElementById('frm_btn_mini_'+indek)!=undefined){
    document.getElementById('frm_btn_mini_'+indek).innerHTML="&#8210";
  }
  if(document.getElementById('frm_btn_rest_'+indek)!=undefined){
    document.getElementById('frm_btn_rest_'+indek).innerHTML="&#10064";
  }
  if(document.getElementById('frm_btn_maxi_'+indek)!=undefined){
    document.getElementById('frm_btn_maxi_'+indek).innerHTML="&#10065";
  }
}

ui.ikonOff=function(indek){
  if(document.getElementById('frm_btn_tutup_'+indek)!=undefined){
    document.getElementById('frm_btn_tutup_'+indek).innerHTML="";
  }
  if(document.getElementById('frm_btn_pop_tutup_'+indek)!=undefined){
    document.getElementById('frm_btn_pop_tutup_'+indek).innerHTML="";
  }  
  if(document.getElementById('frm_btn_mini_'+indek)!=undefined){
    document.getElementById('frm_btn_mini_'+indek).innerHTML="";
  }
  if(document.getElementById('frm_btn_rest_'+indek)!=undefined){
    document.getElementById('frm_btn_rest_'+indek).innerHTML="";
  }
  if(document.getElementById('frm_btn_maxi_'+indek)!=undefined){
    document.getElementById('frm_btn_maxi_'+indek).innerHTML="";
  }
  if(document.getElementById('frm_btn_add_'+indek)!=undefined){
    document.getElementById('frm_btn_add_'+indek).innerHTML="";
  }
}

ui.CLOSE=(idx)=>{
  console.log('close: '+bingkai[idx].menu.id);
  
  if(bingkai[idx].menu.id=='home') Home.alive=false;
  
  bingkai[idx].status=1;//1-CLOSE
  bingkai[idx].closed=1;

  ui.hideDock(false);
  bingkai_posisi[bingkai_posisi.length-1].dead=1;
  
  ui.judulBefore();
  
  document.getElementById("frm_"+idx).style.width='10px';
  document.getElementById("frm_"+idx).style.height='10px';
  document.getElementById("frm_"+idx).style.left='0px';
  document.getElementById("frm_"+idx).style.top='0px';
  
  if(bingkai[idx].toolbar.ada==1) 
    document.getElementById("frm_toolbar_"+idx).style.visibility="hidden";
  
  ui.sleep(300).then(()=>{
    const ambil_jarak=hapus_px(layar.lebar);
    
    ui.destroy(idx);
    
    recent_count--;
    
    if(recent_count==0){
      document.getElementById('window').style.display="none";
    }
    ui.destroy_child(idx);
  });
  
}

ui.hideDock=function(b){
  if(b){
    document.getElementById('recentAppPlus').style.visibility="hidden";
  }else{
    document.getElementById('recentAppPlus').style.visibility="visible";
  }
}

ui.judulBefore=function(){
  var ini=-1;
  for(var i=0;i<bingkai_posisi.length;i++){
    if(bingkai_posisi[i].dead==0){
      ini=bingkai_posisi[i].indek;
    }
  }
  if(ini>-1){
    ui.gantiJudul(ini);
  }else{
    document.title='Accounting Online / Rangkaidata.com';
  }
}

ui.sleep=function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

ui.destroy=function(indek){// bingkai_destroy
  if(bingkai[indek].modal==1){
    document.getElementById("back_"+indek).remove();// with-remove javascript [fix]
  }

  document.getElementById("frm_"+indek).remove();
  if(document.getElementById("menu_btn_top_"+indek)!=undefined){
    document.getElementById("menu_btn_top_"+indek).remove();
    if(document.getElementById("app_recent_"+indek)!=null){
      document.getElementById("app_recent_"+indek).remove();
    }
  }
  global.tabPasif=0;  
}

ui.destroy_child=function(parent){
  // find child with this parent
  //if(bingkai[parent].child_free==true){
  if(bingkai[parent].have_child==false){
    // alert('i-am free form, man!!!');
    return;
  }
  var bingkai_masih_buka=0;
  for(var z=0;z<bingkai.length;z++){
    if(bingkai[z].parent==parent){
      if(bingkai[z].closed==0){
        ui.CLOSE(z);
        this.destroy_child(z);// iteration;
      }
    }else{
      // nothing to-do
    }
    if(bingkai[z].closed==0){
      bingkai_masih_buka++;
    }
  }
  ui.jml_aktif=bingkai_masih_buka;
}

ui.MINIMIZE=function(indek){
  console.log('minimize: '+bingkai[indek].menu.id);
  
  if(bingkai[indek].status!=3){
    bingkai[indek].ukuran={
      lebar:ui.pxRm(document.getElementById("frm_"+indek).offsetWidth),
      tinggi:ui.pxRm(document.getElementById("frm_"+indek).offsetHeight),
    }
    bingkai[indek].letak={
      kiri:ui.pxRm(document.getElementById("frm_"+indek).offsetLeft),
      atas:ui.pxRm(document.getElementById("frm_"+indek).offsetTop),
    }
  }
  
  const obj=bingkai[indek];
  bingkai[indek].status=2;//2-MINIMIZE

  document.getElementById("frm_"+indek).style.height=ui.rmPx(1.8);
  document.getElementById("frm_"+indek).style.width=ui.rmPx(28);

  document.getElementById("frm_"+indek).style.border="2px solid green";
  document.getElementById("frm_"+indek).style.overflow="hidden";
  
  document.getElementById("frm_btn_mini_"+indek).style.display="none";
  if(obj.bisa.sedang==1){
    document.getElementById("frm_btn_rest_"+indek).style.display="inline";
    document.getElementById("frm_btn_rest_"+indek).style.left="2rem";
  }
  if(obj.bisa.besar==1){document.getElementById("frm_btn_maxi_"+indek).style.display="inline";}
  if(obj.toolbar.ada==1){document.getElementById("frm_toolbar_"+indek).style.visibility="hidden";}
  if(obj.statusbar.ada==1){document.getElementById("frm_statusbar_"+indek).style.visibility="hidden";}
}

ui.rmPx=function(rem){// convert Rem to Pixel
  // note: 
  // gunakan ini untuk set ke object
  return (rem * parseFloat(
    getComputedStyle(document.documentElement).fontSize)
  )+'px';
}

ui.pxRm=function(px) {// convert Pixel To Rem
  // note: 
  // gunakan ini untuk set ke variabel properti
  px=String(px).replace("px","");
  return Number(px)/parseFloat(getComputedStyle(document.documentElement).fontSize);
}

ui.RESTORE=function(indek){
  console.log('restore: '+bingkai[indek].menu.id);
  bingkai[indek].status=4;//4-RESTORE
  
  const jendela_data=bingkai[indek];
  
  document.getElementById("frm_"+indek).style.top=ui.rmPx(jendela_data.letak.atas);
  document.getElementById("frm_"+indek).style.left=ui.rmPx(jendela_data.letak.kiri);
  
  document.getElementById("frm_"+indek).style.width=ui.rmPx(jendela_data.ukuran.lebar);
  document.getElementById("frm_"+indek).style.height=ui.rmPx(jendela_data.ukuran.tinggi);
  
  document.getElementById("frm_"+indek).style.border="1px solid lightgrey";
  document.getElementById("frm_"+indek).style.overflow="auto";
  
  if (jendela_data.toolbar.ada==1){
    document.getElementById("frm_toolbar_"+indek).style.visibility="hidden";
    document.getElementById("frm_toolbar_"+indek).style.width=(
      ui.rm(jendela_data.ukuran.lebar)-ui.rm(1)
    )+'px';
  }
  if (jendela_data.bisa.sedang==1){document.getElementById("frm_btn_rest_"+indek).style.display="none";}
  if (jendela_data.bisa.kecil==1){document.getElementById("frm_btn_mini_"+indek).style.display="inline";}
  if (jendela_data.bisa.besar==1){document.getElementById("frm_btn_maxi_"+indek).style.display="inline";}
  
  if (jendela_data.bisa.tambah==1){
    document.getElementById("frm_btn_add_"+indek).style.display="inline";
    document.getElementById("frm_btn_add_"+indek).style.left=remPx(5.0);
  }
  
  var t=ui.pxRm(document.getElementById("frm_"+indek).style.height);
  
  //if (parseInt(t.replace("px",""))>=rangkai.remPxn(3.5)){
  if (t >= 3.5){
    if(jendela_data.toolbar.ada==1){document.getElementById("frm_toolbar_"+indek).style.visibility="visible";}
    if(jendela_data.statusbar.ada==1){document.getElementById("frm_statusbar_"+indek).style.visibility="visible";}
  }
  
  document.getElementById("frm_konten_"+indek).style.visibility="visible";
  document.getElementById("frm_konten_"+indek).style.width
    =(ui.rm(jendela_data.ukuran.lebar)-ui.rm(0.2))+'px';
  
  if (jendela_data.toolbar.ada==1){
    document.getElementById("frm_konten_"+indek).style.height=
    (ui.rm(jendela_data.ukuran.tinggi)
    -ui.rm(bingkai[0].titlebar.tinggi)
    -ui.rm(bingkai[0].toolbar.tinggi)
    -ui.rm(bingkai[0].statusbar.tinggi)
    )+'px';
  }
  else{
    document.getElementById("frm_konten_"+indek).style.height=(
      ui.rm(jendela_data.ukuran.tinggi)-ui.rm(3.00)
    )+'px';  
  }
}

ui.MAXIMIZE=function(idk){
  console.log('maximize: '+bingkai[idk].menu.id);
  
  bingkai[idk].status=3;//3-MAXIMIZE
  const jendela_data=bingkai[idk];
  
  ui.cekUkuranRem();
  
  document.getElementById("frm_btn_maxi_"+idk).style.display="none";
  document.getElementById("frm_btn_mini_"+idk).style.display="none";
  
  document.getElementById("frm_"+idk).style.top=ui.rmPx(ui.titlebar.tinggi);
  document.getElementById("frm_"+idk).style.left="0px";
  document.getElementById("frm_"+idk).style.width=(ui.rm(layar.lebar)-ui.rm(0.5))+'px';
  document.getElementById("frm_"+idk).style.height=(
    ui.rm(layar.tinggi)-ui.rm(ui.titlebar.tinggi)-ui.dock.tinggi
  )+'px';
  
  document.getElementById("frm_"+idk).style.border="1px solid lightGray";
  document.getElementById("frm_"+idk).style.overflow="auto";
/*  
  if (jendela_data.bisa.kecil==1){
    document.getElementById("frm_btn_mini_"+idk).style.display="inline";
  }
*/  
  if (jendela_data.bisa.sedang==1){
    document.getElementById("frm_btn_rest_"+idk).style.display="inline";
    document.getElementById("frm_btn_rest_"+idk).style.left=remPx(2.0);
  }
  
  if (jendela_data.bisa.tambah==1){
    document.getElementById("frm_btn_add_"+idk).style.display="inline";
    document.getElementById("frm_btn_add_"+idk).style.left=remPx(3.5);
  }
  
  if (jendela_data.toolbar.ada==1){
    document.getElementById("frm_toolbar_"+idk).style.visibility="visible";
    document.getElementById("frm_toolbar_"+idk).style.width=(
      ui.rm(layar.lebar)-ui.rm(1.5)
    )+'px';
  }
  
  document.getElementById("frm_konten_"+idk).style.visibility="visible";
  document.getElementById("frm_konten_"+idk).style.width=(
    ui.rm(layar.lebar)-ui.rm(0.7)
  )+'px';
  document.getElementById("frm_konten_"+idk).style.height=(
    ui.rm(layar.tinggi)
    -ui.rm(ui.titlebar.tinggi)
    -ui.rm(bingkai[0].titlebar.tinggi)
    -ui.rm(bingkai[0].toolbar.tinggi)
    -ui.rm(bingkai[0].statusbar.tinggi)
    -ui.dock.tinggi
  )+'px';
    
  if (jendela_data.toolbar.ada==0){
    document.getElementById("frm_konten_"+idk).style.top=ui.rmPx(1.5);
    document.getElementById("frm_konten_"+idk).style.height=(
      ui.rm(layar.tinggi)-ui.rm(5.4)
    )+'px'; // 8.1-1.5=7.6rem 5.4
  }
  
  if (jendela_data.statusbar.ada==1){
    document.getElementById("frm_statusbar_"+idk).style.visibility="visible";
    document.getElementById("frm_statusbar_"+idk).style.bottom='0px';
  }  
}

ui.dock={
  tinggi:31
}

ui.hideMe=function(indek){
  console.log('hide: '+bingkai[indek].menu.id);
  ui.cekUkuranRem();
  document.getElementById('frm_'+indek).style.left=(ui.rm(layar.lebar)*-2)+'px';
  document.getElementById('app_recent_'+indek).disabled=false;
  document.getElementById('app_recent_'+indek).style.color="#606060";
  document.getElementById('app_recent_'+indek).style.border="1px solid grey";
  document.getElementById('app_recent_'+indek).style.backgroundColor="lightblue";  
  if(bingkai[indek].status==3){
    // do not change;
  }else{
    bingkai[indek].letak.atas=ui.pxRm(document.getElementById('frm_'+indek).offsetTop);
    bingkai[indek].letak.kiri=ui.pxRm(document.getElementById('frm_'+indek).offsetLeft);
  }
  ui.updateHome();
}

ui.titlebar_klik=function(){
  var tiket;
  if(bingkai[0].login.id==null){
    tiket=JSON.parse(JSON.stringify(bingkai[0]));
    tiket.parent=0;
    tiket.menu.id='about';
    About.show(tiket);
  }
  else{    
    tiket=JSON.parse(JSON.stringify(bingkai[0]));
    tiket.parent=0;
    tiket.menu.id='login';
    tiket.folder=bingkai[0].folder;
    antrian.push(tiket);
    Menu.klik(antrian.length-1);
  }
}

ui.CLOSE_POP=(idx)=>{
  console.log('close: '+bingkai[idx].menu.id);
  bingkai[idx].status=1;//1-CLOSE
  bingkai[idx].closed=1;
  global.tabPasif=0;
  
  ui.modal=false;
  
  ui.hideDock(false);
  bingkai_posisi[bingkai_posisi.length-1].dead=1;
  
  document.getElementById("frm_"+idx).style.width='10px';
  document.getElementById("frm_"+idx).style.height='10px';
  document.getElementById("frm_"+idx).style.left='0px';
  document.getElementById("frm_"+idx).style.top='0px';
  
  document.getElementById("frm_konten_"+idx).style.visibility="hidden";
  if(bingkai[idx].toolbar.ada==1) document.getElementById("frm_toolbar_"+idx).style.visibility="hidden";
  
  ui.sleep(300).then(()=>{
    const ambil_jarak=hapus_px(layar.lebar);
    
    ui.destroy(idx);
    
    //recent_count--;
  });
}

ui.CLONE=function(idx){
  console.log('clone: '+bingkai[idx].menu.id);
  
  bingkai[idx].status=5;//5-CLONE
  
  const tiket=JSON.parse(JSON.stringify(bingkai[idx]));
  tiket.parent=idx;
  tiket.baru=true;
  
  antrian.push(tiket);
  Menu.klik(antrian.length-1);
}
//eof: 751;785;
