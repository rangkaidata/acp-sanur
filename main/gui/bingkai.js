
/*
 * name: budiono
 * date: aug-31, 07:22, thu-2023; new;476;
 * edit: sep-04, 14:45, mon-2023; add;604;
 * edit: sep-17, 07:47, sun-2023; mod;xHTML;
 * edit: sep-25, 15:20, mon-2023; preview;
 * edit: dec-27, 21:17, wed-2023; select;
 * edit: mar-02, 11:33, sat-2024; add execute;
 * edit: mar-02, 14:53, sat-2024; letak.tengah [0=random;1=tengah;2=maksimal]
 * edit: nov-15, 22:26, fri-2024; add lock;
 * edit: dec-09, 20:49, mon-2024; #30; 
 * edit: dec-14, 15:13, sat-2024; #31; properties;
 * -----------------------------; happy new year 2025;
 * edit: apr-26, 20:36, sat-2025; #51; next
 * edit: apr-27, 16:27, sun-2025; #51; add restore button;
 * -----------------------------; happy new year 2026;
 * edit: jan-11, 11:37, sun-2026; 
 */ 

'use strict';

class BingkaiUtama{
  constructor(tiket){
    this.tiket=tiket;
  }
  show(){
    ui.zindek++;
    var indek=0;
    const berapa=hitungKembar(this.tiket);
    bingkai.push(JSON.parse(JSON.stringify(this.tiket)));
    indek=bingkai.length-1;    
          
    // set properti disini
    bingkai[indek].id=indek;
    bingkai[indek].parent=this.tiket.parent
    bingkai[indek].menu.id=this.tiket.menu.id;
    bingkai[indek].menu.name=this.tiket.menu.name;
    bingkai[indek].menu.type=this.tiket.menu.type;
    
    bingkai[indek].berapa=berapa;
    bingkai[indek].folder=this.tiket.folder;
    bingkai[indek].path=this.tiket.folder
      +'/'+bingkai[indek].menu.name
      +' '+berapa;
    bingkai[indek].nama=bingkai[indek].path;

    bingkai[indek].ukuran.lebar=this.tiket.ukuran.lebar;
    bingkai[indek].ukuran.tinggi=this.tiket.ukuran.tinggi;
    
    bingkai[indek].letak.kiri=this.tiket.letak.kiri;
    bingkai[indek].letak.atas=this.tiket.letak.atas;

    if(this.tiket.baru==true){
      bingkai[indek].letak.kiri+=1.5;
      bingkai[indek].letak.atas+=1.5;
      bingkai[indek].baru=false;
    }
        
    bingkai[indek].zindek=ui.zindek;
    bingkai[indek].closed=0;//open
    bingkai[indek].status=0;//open

    // create bingkai
    global.klik=false;
    const k=new PapanB(indek);
    k.show(this.tiket);
    
    ui.gantiJudul(indek);
    ui.tambahWindow(indek,bingkai[indek].path);
    // history after;
    bingkai[indek].folder=this.tiket.folder+'/'+ this.tiket.menu.name;
    
    return indek;
  }
}    

class PapanB{
  constructor(indek){
    this.indek=indek;
    this.nama=bingkai[indek].nama;
    
    this.tengah=bingkai[indek].letak.tengah;

    this.atas=bingkai[indek].letak.atas;
    this.kiri=bingkai[indek].letak.kiri;
    
    this.lebar=bingkai[indek].ukuran.lebar;
    this.tinggi=bingkai[indek].ukuran.tinggi;
    
    this.bisa_tutup=bingkai[indek].bisa.tutup;
    this.bisa_kecil=bingkai[indek].bisa.kecil;
    this.bisa_sedang=bingkai[indek].bisa.sedang;
    this.bisa_besar=bingkai[indek].bisa.besar;
    this.bisa_tambah=bingkai[indek].bisa.tambah;
    this.bisa_ubah=bingkai[indek].bisa.ubah;
    
    this.modal=bingkai[indek].modal;
    
    this.warna=bingkai[indek].warna;
    
    this.path=bingkai[indek].path;
    this.zindek=bingkai[indek].zindek;

    this.ada_statusbar=bingkai[indek].statusbar.ada;
    this.statusbar_tinggi=bingkai[indek].statusbar.tinggi;

    this.titlebar_tinggi=bingkai[indek].titlebar.tinggi;

    this.ada_toolbar=bingkai[indek].toolbar.ada;
    this.tinggi_toolbar=bingkai[indek].toolbar.tinggi;
    this.warna_toolbar=bingkai[indek].toolbar.warna;
    
    this.unit=bingkai[indek].unit;
    
    this.toolbar_button_tinggi=bingkai[indek].toolbar.button.tinggi;
    this.toolbar_button_atas=bingkai[indek].toolbar.button.atas;
    this.toolbar_button_kiri=bingkai[indek].toolbar.button.kiri;
  }
  rangkaiBackground(){
    const newBack=document.createElement("div");
    newBack.setAttribute("id","back_"+this.indek);
    newBack.style.left="0px";
    newBack.style.top="0px";
    newBack.style.height=screen.height+'px';
    newBack.style.width=screen.width+'px';
    newBack.style.backgroundColor="lightgray";
    newBack.style.opacity=0.7;
    newBack.style.zIndex=parseInt(this.zindek)+1;
    newBack.style.position="fixed";
    document.body.appendChild(newBack);
  }
  rangkaiBingkai(){    
    const newDiv = document.createElement("div");
    newDiv.className="jendela";
    newDiv.setAttribute("id","frm_"+this.indek);
    newDiv.style.position="fixed";
    newDiv.style.textAlign="center";
    newDiv.style.background=this.warna;
    newDiv.style.overflow="auto";
    newDiv.style.top=this.atas+this.unit;
    newDiv.style.left=this.kiri+this.unit;
    newDiv.style.width=this.lebar+this.unit;
    newDiv.style.height=this.tinggi+this.unit;
    
    newDiv.onclick=(event)=>ui_klik(event);
    newDiv.style.zIndex=parseInt(this.zindek)+1;
    newDiv.style.paddingTop=this.batas_atas;
    newDiv.style.border="1px solid #C0C0C0";
    newDiv.style.borderRadius="0.7rem";
    newDiv.style.boxShadow="0 5px 5px 0 rgba(0,0,0,0.2),0 1px 1px 0 rgba(0,0,0,0.19)";
    newDiv.style.transition= "0.6s";
    newDiv.innerHTML=this.nama;
    newDiv.addEventListener('mousedown',Drag.init, false);//listener
    document.body.appendChild(newDiv);
  }
  rangkaiTombol(){//merah
    const backTombol=document.createElement("div");
    backTombol.style.top="0.1rem"
    backTombol.style.left=remPx(0.1);
    backTombol.style.width="6rem";
    backTombol.style.height="1.2rem";
    backTombol.style.position="absolute";
    backTombol.style.borderRadius="1rem";
    backTombol.style.border="1px solid "+ui.warna.form;
    backTombol.style.display="block";
    backTombol.style.margin="1px";
    backTombol.style.backgroundColor=ui.warna.form;
    backTombol.style.textAlign="center";
    backTombol.style.float="left";
    backTombol.style.padding="0rem";
    backTombol.style.lineHeight="0";
    document.getElementById('frm_'+this.indek).appendChild(backTombol);
  }
  rangkaiTutup(){//merah
    const btnTutup=document.createElement("button");
    btnTutup.className='tombol';
    btnTutup.setAttribute("id","frm_btn_tutup_"+this.indek);
    btnTutup.style.top="0.3rem"
    btnTutup.style.left=remPx(0.5);
    btnTutup.style.width="0.835rem";
    btnTutup.style.height="0.835rem";
    btnTutup.style.position="absolute";
    btnTutup.style.borderRadius="1rem";
    btnTutup.style.border="1px solid #ff4233";
    btnTutup.style.display="block";
    btnTutup.style.margin="1px";
    btnTutup.style.backgroundColor="#FF5050";
    btnTutup.style.textAlign="center";
    btnTutup.style.float="left";
    btnTutup.style.padding="0rem";
    btnTutup.style.lineHeight="0";
    btnTutup.style.color="white";
    const show_icon_indek=this.indek;
    btnTutup.onmouseover=function(){ui.ikonOn(show_icon_indek);};
    btnTutup.onmouseout=function(){ui.ikonOff(show_icon_indek);};
    document.getElementById('frm_'+this.indek).appendChild(btnTutup);
  }
  rangkaiTutupPOP(){//merah
    const btnTutup=document.createElement("button");
    btnTutup.className='tombol';
    btnTutup.setAttribute("id","frm_btn_pop_tutup_"+this.indek);
    btnTutup.style.top="0.3rem"
    btnTutup.style.left=remPx(0.5);
    btnTutup.style.width="0.835rem";
    btnTutup.style.height="0.835rem";
    btnTutup.style.position="absolute";
    btnTutup.style.borderRadius="1rem";
    btnTutup.style.border="1px solid brown";
    btnTutup.style.display="block";
    btnTutup.style.margin="1px";
    btnTutup.style.backgroundColor="brown";
    btnTutup.style.textAlign="center";
    btnTutup.style.float="left";
    btnTutup.style.padding="0rem";
    btnTutup.style.lineHeight="0";
    btnTutup.style.color="white";
    const show_icon_indek=this.indek;
    btnTutup.onmouseover=function(){ui.ikonOn(show_icon_indek);};
    btnTutup.onmouseout=function(){ui.ikonOff(show_icon_indek);};
    document.getElementById('frm_'+this.indek).appendChild(btnTutup);
  }
  rangkaiKecil(){//kuning
    const buttonMin=document.createElement("button");
    buttonMin.className='tombol';
    buttonMin.setAttribute("id","frm_btn_mini_"+this.indek);
    buttonMin.style.top="0.3rem";
    buttonMin.style.left="2rem";
    buttonMin.style.width="0.835rem";
    buttonMin.style.height="0.835rem";
    buttonMin.style.position="absolute";
    buttonMin.style.borderRadius="1rem";
    buttonMin.style.border="1px solid gold";
    buttonMin.style.display="block";
    buttonMin.style.margin="1px";
    buttonMin.style.backgroundColor="#FFFF50";
    buttonMin.style.color="blue";
    buttonMin.style.padding="0rem";
    buttonMin.style.lineHeight="0";
    const show_icon_kecil=this.indek;
    buttonMin.onmouseover=function(){ui.ikonOn(show_icon_kecil);};
    buttonMin.onmouseout=function(){ui.ikonOff(show_icon_kecil);};
    document.getElementById('frm_'+this.indek).appendChild(buttonMin);
  }
  rangkaiBesar(){//hijau
    const btnMax=document.createElement("button");
    btnMax.setAttribute("id","frm_btn_maxi_"+this.indek);
    btnMax.className='tombol';
    btnMax.style.top="0.3rem";
    btnMax.style.left="3.5rem";
    btnMax.style.width="0.835rem";
    btnMax.style.height="0.835rem";
    btnMax.style.position="absolute";
    btnMax.style.borderRadius="1rem";
    btnMax.style.border="1px solid #50C878"; //#50C878
    btnMax.style.display="block";
    btnMax.style.margin="1px";
    btnMax.style.backgroundColor='#50D050';
    btnMax.style.color="#000";
    btnMax.style.padding="0";
    btnMax.style.lineHeight="0";
    const show_icon_besar=this.indek;
    btnMax.onmouseover=function(){ui.ikonOn(show_icon_besar);};
    btnMax.onmouseout=function(){ui.ikonOff(show_icon_besar);};
    document.getElementById('frm_'+this.indek).appendChild(btnMax);
  }
  rangkaiTambah(){// biru
    const btnTambah=document.createElement("button");
    btnTambah.className='tombol';
    btnTambah.setAttribute("id","frm_btn_add_"+this.indek);
    btnTambah.style.top="0.3rem";
    btnTambah.style.left='5rem';
    btnTambah.style.width="0.835rem";
    btnTambah.style.height="0.835rem";
    btnTambah.style.position="absolute";
    btnTambah.style.borderRadius="1rem";
    btnTambah.style.border="1px solid #00BFFF";
    btnTambah.style.display="block";
    btnTambah.style.margin="1px";
    btnTambah.style.backgroundColor='#85c1e9';
    btnTambah.style.color="#fff";
    btnTambah.style.padding="0";
    btnTambah.style.lineHeight="0";
    const show_icon_tambah=this.indek;
    btnTambah.onmouseover=function(){ui.ikonOn(show_icon_tambah);};
    btnTambah.onmouseout=function(){ui.ikonOff(show_icon_tambah);};
    document.getElementById('frm_'+this.indek).appendChild(btnTambah);
  }
  rangkaiSedang(){//abu-abu
    const btnRes=document.createElement("button");
    btnRes.setAttribute("id","frm_btn_rest_"+this.indek);
    btnRes.className='tombol';
    btnRes.style.top="0.3rem";
    btnRes.style.left="2rem";//rempx(3.5);
    btnRes.style.width="0.835rem";
    btnRes.style.height="0.835rem";
    btnRes.style.position="absolute";
    btnRes.style.borderRadius="1rem";
    btnRes.style.border="1px solid #C0C0C0"; //#00BFFF
    btnRes.style.display="block";
    btnRes.style.margin="1px";
    btnRes.style.backgroundColor="lightgrey";//#85c1e9
    btnRes.style.display="none";
    btnRes.style.color="green";
    btnRes.style.padding="0";
    btnRes.innerHTML="&#10064";
    const show_icon_sedang=this.indek;
    btnRes.onmouseover=function(){ui.ikonOn(show_icon_sedang);};
    btnRes.onmouseout=function(){ui.ikonOff(show_icon_sedang);};
    document.getElementById('frm_'+this.indek).appendChild(btnRes);
  }
  rangkaiUbah(){
    const btnResize=document.createElement("div");
    btnResize.className='tombol';
    btnResize.setAttribute("id","frm_btn_size_"+this.indek);
    btnResize.style.width=remPx(1);
    btnResize.style.height=remPx(1);
    btnResize.style.cursor="se-resize";
    btnResize.style.position="absolute";
    btnResize.style.right=remPx(0.2);
    btnResize.style.bottom=remPx(0.2);
    btnResize.style.border="1px solid grey";
    btnResize.style.borderRadius="10px";
    btnResize.style.backgroundColor="lightGray";
    btnResize.addEventListener('mousedown',Resize.init, false);
    document.getElementById('frm_'+this.indek).appendChild(btnResize);
  }
  rangkaiKonten(){
    const divkonten=document.createElement("div");
    divkonten.setAttribute("id","frm_konten_"+this.indek);
    divkonten.className="konten";
    divkonten.style.left=0;
    divkonten.style.top=remPx(4.3);
    divkonten.style.height=(this.tinggi-6)+this.unit;
    divkonten.style.width=(this.lebar-0.5)+this.unit;
    if (this.ada_toolbar==0){
      divkonten.style.top=(1.55)+this.unit
      divkonten.style.height=(this.tinggi-3.5)+this.unit;
    }
    divkonten.style.cursor="default";
    divkonten.style.position="absolute";
    divkonten.style.border="1px solid #ffff";
    divkonten.style.overflow="auto";
    divkonten.style.whiteSpace="nowrap";
    divkonten.style.textAlign="left";//this.isi_pinggir;
    divkonten.style.backgroundColor="white";
    document.getElementById('frm_'+this.indek).appendChild(divkonten);
  }
  rangkaiToolbar(){
    const toolBar=document.createElement("div");
    toolBar.setAttribute("id","frm_toolbar_"+this.indek);
    toolBar.style.position="absolute";
    toolBar.style.marginTop="0"+this.unit;
    toolBar.style.top=this.titlebar_tinggi;
    toolBar.style.height=this.tinggi_toolbar+this.unit;
    toolBar.style.width=(this.lebar-1)+this.unit;
    toolBar.style.borderRadius="1%";
    toolBar.style.border="1px solid red";
    toolBar.style.backgroundColor=this.warna_toolbar;
    toolBar.style.cursor="default";
    toolBar.style.textAlign="left";
    toolBar.style.border="0";
    toolBar.style.padding="0.45rem 0.5rem";
    toolBar.addEventListener('mousedown',Drag.init, false);//listener
    toolBar.className="toolbar";
    document.getElementById('frm_'+this.indek).appendChild(toolBar);
  }
  rangkaiStatusbar(){
    const divstatusbar=document.createElement("div");
    divstatusbar.setAttribute("id","frm_statusbar_"+this.indek);
    divstatusbar.style.cursor="default";
    divstatusbar.style.position="absolute";
    divstatusbar.style.left="0.5"+this.unit;
    divstatusbar.style.bottom="0.2rem";
    divstatusbar.style.border="0"+this.unit;
    divstatusbar.style.backgroundColor="transparent";
    divstatusbar.innerHTML='Status: '+this.path;
    divstatusbar.style.textAlign="left";
    document.getElementById('frm_'+this.indek).appendChild(divstatusbar);
  }
  
  rangkaiToolbarLeft(){
    const dv=document.createElement("div");
    dv.setAttribute("id","frm_toolbar_left_"+this.indek);
    dv.style.position="relative";
    dv.style.cursor="pointer";
    //dv.style.border="1px solid blue";
    dv.style.display="inline-block";
    dv.style.float="left";
    document.getElementById('frm_toolbar_'+this.indek).appendChild(dv);
    
    this.rangkaiToolbarHide();
    this.rangkaiToolbarBack();

    this.rangkaiToolbarClose();
    this.rangkaiToolbarCancel();
    this.rangkaiToolbarRefresh();
    this.rangkaiToolbarSearch();
    this.rangkaiToolbarNew();
    this.rangkaiToolbarRestore();
    this.rangkaiToolbarSave();
    this.rangkaiToolbarSaveAs();
    this.rangkaiToolbarCopy();
    this.rangkaiToolbarPaste();
    this.rangkaiToolbarDelete();
    this.rangkaiToolbarEdit();
    this.rangkaiToolbarExport();
    this.rangkaiToolbarImport();
    this.rangkaiToolbarSelect();
    this.rangkaiToolbarExecute();
    this.rangkaiToolbarPreview();
    this.rangkaiToolbarLock();
    this.rangkaiToolbarFilter();
    this.rangkaiToolbarPrint();
    this.rangkaiToolbarPrevious();
    this.rangkaiToolbarNext();
    this.rangkaiToolbarMore();
    this.rangkaiToolbarProperties();
  }
  
  rangkaiToolbarRight(){
    const btn=document.createElement("div");
    btn.setAttribute("id","frm_toolbar_title_"+this.indek);
    btn.style.position="relative";
    btn.style.cursor="pointer";
    btn.style.height=this.toolbar_button_tinggi+this.unit;
    btn.style.top=this.toolbar_button_atas+this.unit;
    btn.innerHTML='';
    btn.style.display="inline";
    btn.style.paddingright=0;
    //btn.style.border="1px solid red";
    btn.style.float="right";
    document.getElementById('frm_toolbar_'+this.indek).appendChild(btn);
  }

  rangkaiToolbarHide(){
    const toolbar_hide=document.createElement("button");
    toolbar_hide.setAttribute("id","frm_toolbar_hide_"+this.indek);
    toolbar_hide.classList.add('btn_hide');
    toolbar_hide.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_hide.style.top=this.toolbar_button_atas+this.unit;
    toolbar_hide.style.marginLeft=this.toolbar_button_kiri+this.unit;
    toolbar_hide.style.position="relative";
    toolbar_hide.style.display="none";
    toolbar_hide.style.cursor="pointer";
    //document.getElementById('frm_toolbar_'+this.indek).appendChild(toolbar_hide);
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_hide);
  }
  
  rangkaiToolbarClose(){
    const btn=document.createElement("button");
    btn.setAttribute("id","frm_toolbar_close_"+this.indek);
    btn.classList.add('btn_close');
    btn.style.height=this.toolbar_button_tinggi+this.unit;;
    btn.style.top=this.toolbar_button_atas+this.unit;
//    btn.style.marginLeft=this.toolbar_button_kiri+this.unit;
    btn.style.position="relative";
    btn.style.display="none";
    btn.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(btn);
  }

  rangkaiToolbarBack(){
    const toolbar_back=document.createElement("button");
    toolbar_back.setAttribute("id","frm_toolbar_back_"+this.indek);
    toolbar_back.classList.add('btn_back');
    toolbar_back.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_back.style.top=this.toolbar_button_atas+this.unit;
//    alert(toolbar_back.style.top);
//    toolbar_back.style.marginLeft=this.toolbar_button_kiri+this.unit;
    toolbar_back.style.position="relative";
    toolbar_back.style.display="none";
    toolbar_back.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_back);
  }
  
  rangkaiToolbarPrevious(){
    const toolbar_previous=document.createElement("button");
    toolbar_previous.setAttribute("id","frm_toolbar_previous_"+this.indek);
    toolbar_previous.classList.add('btn_previous');
    toolbar_previous.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_previous.style.top=this.toolbar_button_atas+this.unit;
    toolbar_previous.style.position="relative";
    toolbar_previous.style.display="none";
    toolbar_previous.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_previous);
  }

  rangkaiToolbarNext(){
    const toolbar_next=document.createElement("button");
    toolbar_next.setAttribute("id","frm_toolbar_next_"+this.indek);
    toolbar_next.classList.add('btn_next');
    toolbar_next.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_next.style.top=this.toolbar_button_atas+this.unit;
    toolbar_next.style.position="relative";
    toolbar_next.style.display="none";
    toolbar_next.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_next);
  }
  // 
  rangkaiToolbarRefresh(){
    const toolbar_refresh=document.createElement("button");
    toolbar_refresh.setAttribute("id","frm_toolbar_refresh_"+this.indek);
    toolbar_refresh.classList.add('btn_refresh');
    toolbar_refresh.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_refresh.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_refresh.style.marginLeft=this.toolbar_button_kiri+this.unit;
    toolbar_refresh.style.position="relative";
    toolbar_refresh.style.display="none";
    toolbar_refresh.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_refresh);
  }
  
  rangkaiToolbarNew(){
    const toolbar_new=document.createElement("button");
    toolbar_new.setAttribute("id","frm_toolbar_new_"+this.indek);
    toolbar_new.classList.add('btn_new');
    toolbar_new.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_new.style.top=this.toolbar_button_atas+this.unit;
//    alert(toolbar_new.style.top);
//    toolbar_new.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_new.style.position="relative";
    toolbar_new.style.display="none";
    toolbar_new.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_new);
  }
  
  rangkaiToolbarRestore(){
    const toolbar_restore=document.createElement("button");
    toolbar_restore.setAttribute("id","frm_toolbar_restore_"+this.indek);
    toolbar_restore.classList.add('btn_restore');
    toolbar_restore.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_restore.style.top=this.toolbar_button_atas+this.unit;
    toolbar_restore.style.position="relative";
    toolbar_restore.style.display="none";
    toolbar_restore.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_restore);
  }

  rangkaiToolbarSearch(){
    const toolbar_search=document.createElement("button");
    toolbar_search.setAttribute("id","frm_toolbar_search_"+this.indek);
    toolbar_search.classList.add('btn_search');
    toolbar_search.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_search.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_search.style.marginLeft=this.toolbar_button_kiri+this.unit;
    toolbar_search.style.position="relative";
    toolbar_search.style.display="none";
    toolbar_search.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_search);
  }
  
  rangkaiToolbarMore(){
    const toolbar_more=document.createElement("button");
    toolbar_more.setAttribute("id","frm_toolbar_more_"+this.indek);
    toolbar_more.classList.add('btn_more');
    toolbar_more.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_more.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_more.style.marginLeft=this.toolbar_button_kiri+this.unit;
    toolbar_more.style.position="relative";
    toolbar_more.style.display="none";
    toolbar_more.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_more);
  }
  
  rangkaiToolbarSave(){
    const toolbar_save=document.createElement("button");
    toolbar_save.setAttribute("id","frm_toolbar_save_"+this.indek);
    toolbar_save.classList.add('btn_save');
    toolbar_save.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_save.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_save.style.marginLeft=this.toolbar_button_kiri+this.unit;
    toolbar_save.style.position="relative";
    toolbar_save.style.display="none";
    toolbar_save.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_save);
  }
  
  rangkaiToolbarSaveAs(){
    const btn=document.createElement("button");
    btn.setAttribute("id","frm_toolbar_saveas_"+this.indek);
    btn.classList.add('btn_save_as');
    btn.style.height=this.toolbar_button_tinggi+this.unit;
    btn.style.top=Number(this.toolbar_button_atas)+Number(this.unit);
    //btn.style.marginLeft=this.toolbar_button_kiri+this.unit;
    btn.style.position="relative";
    btn.style.display="none";
    btn.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(btn);
  }
  
  rangkaiToolbarDelete(){
    const toolbar_del=document.createElement("button");
    toolbar_del.setAttribute("id","frm_toolbar_delete_"+this.indek);
    toolbar_del.classList.add('btn_delete');
    toolbar_del.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_del.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_del.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_del.style.position="relative";
    toolbar_del.style.display="none";
    toolbar_del.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_del);
  }
  
  rangkaiToolbarExport(){
    const toolbar_export=document.createElement("button");
    toolbar_export.setAttribute("id","frm_toolbar_export_"+this.indek);
    toolbar_export.classList.add('btn_export');
    toolbar_export.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_export.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_export.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_export.style.position="relative";
    toolbar_export.style.display="none";
    toolbar_export.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_export);
  }

  rangkaiToolbarImport(){
    const toolbar_import=document.createElement("button");
    toolbar_import.setAttribute("id","frm_toolbar_import_"+this.indek);
    toolbar_import.classList.add('btn_import');
    toolbar_import.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_import.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_import.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_import.style.position="relative";
    toolbar_import.style.display="none";
    toolbar_import.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_import);
  }
  
  rangkaiToolbarEdit(){
    const toolbar_edit=document.createElement("button");
    toolbar_edit.setAttribute("id","frm_toolbar_edit_"+this.indek);
    toolbar_edit.classList.add('btn_edit');
    toolbar_edit.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_edit.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_edit.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_edit.style.position="relative";
    toolbar_edit.style.display="none";
    toolbar_edit.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_edit);
  }
  
  rangkaiToolbarCancel(){
    const toolbar_cancel=document.createElement("button");
    toolbar_cancel.setAttribute("id","frm_toolbar_cancel_"+this.indek);
    toolbar_cancel.classList.add('btn_cancel');
    toolbar_cancel.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_cancel.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_cancel.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_cancel.style.position="relative";
    toolbar_cancel.style.display="none";
    toolbar_cancel.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_cancel);
  }

  rangkaiToolbarPreview(){
    const toolbar_preview=document.createElement("button");
    toolbar_preview.setAttribute("id","frm_toolbar_preview_"+this.indek);
    toolbar_preview.classList.add('btn_preview');
    toolbar_preview.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_preview.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_preview.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_preview.style.position="relative";
    toolbar_preview.style.display="none";
    toolbar_preview.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_preview);
  }

  rangkaiToolbarSelect(){
    const toolbar_select=document.createElement("button");
    toolbar_select.setAttribute("id","frm_toolbar_select_"+this.indek);
    toolbar_select.classList.add('btn_select');
    toolbar_select.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_select.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_select.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_select.style.position="relative";
    toolbar_select.style.display="none";
    toolbar_select.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_select);
  }
  
  rangkaiToolbarExecute(){
    const toolbar_execute=document.createElement("button");
    toolbar_execute.setAttribute("id","frm_toolbar_execute_"+this.indek);
    toolbar_execute.classList.add('btn_execute');
    toolbar_execute.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_execute.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_execute.style.marginleft=this.toolbar_button_kiri+this.unit;
    toolbar_execute.style.position="relative";
    toolbar_execute.style.display="none";
    toolbar_execute.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_execute);
  }
  
  rangkaiToolbarFilter(){
    const toolbar_filter=document.createElement("button");
    toolbar_filter.setAttribute("id","frm_toolbar_filter_"+this.indek);
    toolbar_filter.classList.add('btn_filter');
    toolbar_filter.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_filter.style.top=this.toolbar_button_atas+this.unit;
    toolbar_filter.style.position="relative";
    toolbar_filter.style.display="none";
    toolbar_filter.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_filter);
  }
  
  rangkaiToolbarPrint(){
    const toolbar_print=document.createElement("button");
    toolbar_print.setAttribute("id","frm_toolbar_print_"+this.indek);
    toolbar_print.classList.add('btn_print');
    toolbar_print.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_print.style.top=this.toolbar_button_atas+this.unit;
    toolbar_print.style.position="relative";
    toolbar_print.style.display="none";
    toolbar_print.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_print);
  }
  
  rangkaiToolbarCopy(){
    const toolbar_copy=document.createElement("button");
    toolbar_copy.setAttribute("id","frm_toolbar_copy_"+this.indek);
    toolbar_copy.classList.add('btn_copy');
    toolbar_copy.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_copy.style.top=this.toolbar_button_atas+this.unit;
//    toolbar_save.style.marginLeft=this.toolbar_button_kiri+this.unit;
    toolbar_copy.style.position="relative";
    toolbar_copy.style.display="none";
    toolbar_copy.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_copy);
  }
  
  rangkaiToolbarPaste(){
    const toolbar_paste=document.createElement("button");
    toolbar_paste.setAttribute("id","frm_toolbar_paste_"+this.indek);
    toolbar_paste.classList.add('btn_paste');
    toolbar_paste.style.height=this.toolbar_button_tinggi+this.unit;
    toolbar_paste.style.top=this.toolbar_button_atas+this.unit;
    toolbar_paste.style.position="relative";
    toolbar_paste.style.display="none";
    toolbar_paste.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(toolbar_paste);
  }
  
  rangkaiToolbarLock(){
    const btn=document.createElement("button");
    btn.setAttribute("id","frm_toolbar_lock_"+this.indek);
    btn.classList.add('btn_lock');
    btn.style.height=this.toolbar_button_tinggi+this.unit;
    btn.style.top=this.toolbar_button_atas+this.unit;
//    btn.style.marginleft=this.toolbar_button_kiri+this.unit;
    btn.style.position="relative";
    btn.style.display="none";
    btn.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(btn);
  }
  
  rangkaiToolbarProperties(){
    const btn=document.createElement("button");
    btn.setAttribute("id","frm_toolbar_properties_"+this.indek);
    btn.classList.add('btn_properties');
    btn.style.height=this.toolbar_button_tinggi+this.unit;
    btn.style.top=this.toolbar_button_atas+this.unit;
    btn.style.position="relative";
    btn.style.display="none";
    btn.style.cursor="pointer";
    document.getElementById('frm_toolbar_left_'+this.indek).appendChild(btn);
  }

  show(){
    if(this.modal==1)this.rangkaiBackground();
    
    if(this.tengah==0){// ALWAYS RANDOM;

    }
    
    if(this.tengah==1){// ALWAYS CENTER;
      ui.cekUkuranRem();
      this.kiri=(parseInt(layar.lebar)/2)-(parseInt(this.lebar)/2);
      if(this.atas==0){
        this.atas=ui.titlebar.tinggi;
        
      }else{
        this.atas=(parseInt(layar.tinggi)/2)-(parseInt(this.tinggi)/2);
      }
      bingkai[this.indek].letak.atas=this.atas;
      bingkai[this.indek].letak.kiri=this.kiri;
    }

    if(this.tengah==2){// ALWAYS MAXIMIZE;
      this.atas=(ui.titlebar.tinggi);
      this.kiri=0;
      
      bingkai[this.indek].letak.atas=this.atas;
      bingkai[this.indek].letak.kiri=this.kiri;
      
      this.lebar=(layar.lebar);      
      this.tinggi=(layar.tinggi)-(ui.titlebar.tinggi)-ui.pxRm((ui.dock.tinggi));
      
      bingkai[this.indek].ukuran.lebar=this.lebar;
      bingkai[this.indek].ukuran.tinggi=this.tinggi;
      bingkai[this.indek].status=3//MAXIMIZE LOCK
    }
    
    this.rangkaiBingkai();
    this.rangkaiKonten();
    if (this.ada_toolbar==1) {
      this.rangkaiToolbar();
      this.rangkaiToolbarLeft();
      this.rangkaiToolbarRight();
    }    
    
    if(this.ada_statusbar==1)this.rangkaiStatusbar();

    this.rangkaiTombol();
    if(this.bisa_tutup==1){
      if(this.modal==1){
        this.rangkaiTutupPOP();
      }else{
        this.rangkaiTutup();
      }
    }
    if(this.bisa_kecil==1)this.rangkaiKecil();
    if(this.bisa_besar==1)this.rangkaiBesar();
    if(this.bisa_sedang==1)this.rangkaiSedang();
    if(this.modal==0){
      if(this.bisa_tambah==1)this.rangkaiTambah();
    }
    if(this.bisa_ubah==1)this.rangkaiUbah();
  }
}

class BingkaiSpesial{
  constructor(tiket){
    this.tiket=tiket;
  }
  show(){
    ui.zindek++;

    bingkai.push(JSON.parse(JSON.stringify(this.tiket)));
    const indek=bingkai.length-1;    
    
    // set properti disini
    bingkai[indek].id=indek;
    bingkai[indek].parent=this.tiket.parent;
    bingkai[indek].nama=this.tiket.menu.name;
    bingkai[indek].menu.id=this.tiket.menu.id;
    bingkai[indek].menu.name=this.tiket.menu.name;
    bingkai[indek].menu.type=this.tiket.menu.type;
    
    bingkai[indek].ukuran.lebar=this.tiket.ukuran.lebar;
    bingkai[indek].ukuran.tinggi=this.tiket.ukuran.tinggi;
        
    bingkai[indek].zindek=ui.zindek;
    bingkai[indek].closed=0;//open
    bingkai[indek].status=0;//open
    
    bingkai[indek].modal=1;

    // create bingkai
    const k=new PapanB(indek);
    k.show(this.tiket);
    
    global.tabPasif=1;
    ui.modal=true;
    
    return indek;
  }
}// eof:476;604;669;
