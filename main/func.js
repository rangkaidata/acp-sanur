/*
 * auth: budiono
 * edit: sep-04, 20:40, mon-2023; new;247;
 * edit: sep-05, 10:33, tue-2023; add;260;
 * edit: sep-11, 15:38, mon-2023; 
 * edit: sep-12, 13:11, tue-2023;
 * edit: sep-13, 14:52, wed-2023; 
 * edit: sep-27, 13:48, wed-2023;
 * edit: oct-12, 10:08, thu-2023; str10;
 * edit: dec-28, 11:31, thu-2023; selectAll();
 * edit: dec-28, 16:04, thu-2023; limitRows();
 * edit: dec-29, 08:03, fri-2023; addPagingFn();
 * -----------------------------; happy new year 2024;
 * edit: jan-09, 16:01, tue-2024; mode addPagingFn()->Form.js;
 * edit: feb-22, 11:43, thu-2024; date::muncul;date::ngumpet;
 * edit: mar-02, 15:59, sat-2024; pesanSalah untuk validasi client;
 * edit: mar-27, 15:28, wed-2024; convert Array ke Object;
 * edit: jun-14, 15:59, fri-2024; TotalPagingLimit();
 * -----------------------------; happy new year 2025;
 * edit: jan-07, 12:20, tue-2025; add disabled(id,val);
 * edit: frb-06, 13:09, thu-2025; #39; add directory;
 * edit: mar-13, 19:52, thu-2025; setPagingLimit();getPagingLimit();
 * edit: mar-22, 17:50, sat-2025; #44; my_menu;getPath
 * edit: sep-28, 14:27, sun-2025; #77 decimal_places;
 */

'use strict';

function pxRem(px) {// convert Pixel ToRem
  px=String(px).replace("px","");
  return Number(px) / parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function exist(tiket){
  var adaBerapa=0;
  var baru=-1;
  
  for(var x=1;x<bingkai.length;x++){
    //console.log('a: '+bingkai[x].menu.id+'/'+tiket.menu.id);
    if(bingkai[x].menu.id==tiket.menu.id){
      //console.log('b: '+bingkai[x].company.id+'/'+tiket.company.id);
      if(bingkai[x].company.id==tiket.company.id){
        //console.log('c: '+bingkai[x].closed+'/'+0)
        if(bingkai[x].closed==0){
          if(tiket.baru==true){
            adaBerapa++;
            bingkai[x].berapa=adaBerapa;
          }
          if(tiket.baru==false){
            baru=x;
            return x;
          }
        }
      }
    }
  }
  return -1;
}

function hitungKembar(tiket){// bingkai_double
  var total=0;
  for(var x=0;x<bingkai.length;x++){
    if(bingkai[x].menu.id==tiket.menu.id){
      if(bingkai[x].closed==0){
        total++;
      }
    }
  }
  if(total==0){return ''}
  return '-['+total+']';  
}

function remPx(rem){
  return (rem * parseFloat(getComputedStyle(document.documentElement).fontSize))+'px';
}

function naikKeAtas(){
  var abc=event.srcElement;
  var idku;
  var obj_id;
  if(abc.tagName=="INPUT"){
    return;// segala jenis input tidak sebabkan keatas
  }
  while(abc) {
    idku=abc.id;
    if(idku.substring(0,4)=='frm_'){
      obj_id=getID(abc);
      ui.zindek++;
      document.getElementById('frm_'+obj_id).style.zIndex=ui.zindek;
      return;
    }
    abc=abc.parentElement;
    if(abc==null) return;
  }  
}

function getID(obj){
  const a=obj.getAttribute('id');
  const b=a.split("_");
  return (b[b.length-1]);
}

function hapus_px(px){
  return String(px).replace("px","");
}

function tglSekarangUpdate(){
  var n99=new Date();
  var bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"
    , "Jul", "Agu", "Sep", "Okt", "Nop", "Des"];
  var hari99 = ["Minggu","Senin", "Selasa", "Rabu"
    , "Kamis", "Jumat", "Sabtu"];
  return hari99[n99.getDay()]
    +', '+bulan[parseInt(n99.getMonth())]
    +' '+n99.getDate()+' '+ n99.getHours()
    +':'+('0'+n99.getMinutes()).slice(-2);
}

function tglWest(tgl){
  if(tgl==undefined) return '';
  if(tgl=='')return '';
  var bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"
    , "Jul", "Agu", "Sep", "Okt", "Nop", "Des"];
  return bulan[parseInt(tgl.substr(5,2))-1]+'-'+tgl.substr(8,2)
    //+', '+tgl.substr(2,2) ;
    +', '+tgl.substr(0,4) ;
}

function tglEast(tgl){
  if(tgl==undefined) return '';
  if(tgl=='')return '';
  var bulan = ["01", "02", "03", "04", "05", "06"
    , "07", "08", "09", "10", "11", "12"];
  return tgl.substr(8,2) 
    +'/'+bulan[parseInt(tgl.substr(5,2))-1]
    +'/'+tgl.substr(2,2) ;
}

function tglEastFull(tgl){
  if(tgl==undefined) return '';
  if(tgl=='')return '';
  var bulan = ["01", "02", "03", "04", "05", "06"
    , "07", "08", "09", "10", "11", "12"];
  return tgl.substr(8,2) 
    +'/'+bulan[parseInt(tgl.substr(5,2))-1]
    +'/'+tgl.substr(0,4) ;
}

function remPxn(rem){
  return (rem * parseFloat(
    getComputedStyle(document.documentElement).fontSize)
  );
}

function show(indek){
  global.klik=false;
  if(bingkai[indek].closed==1){
    alert('This menu is dead');
  }
  else{
    ui.zindek++;
    ui.disabledAllTab();
    document.getElementById('app_recent_'+indek).disabled=true;
    ui.gantiJudul(indek);
    ui.bingkai_aktif(indek);
    
    if(bingkai[indek].status==3){
      document.getElementById('frm_'+indek).style.left='0px';  
    }else{
      document.getElementById('frm_'+indek).style.left=ui.rm(bingkai[indek].letak.kiri)+'px';  
    }
    document.getElementById('frm_'+indek).style.display='inline';
    document.getElementById("frm_"+indek).style.zIndex=ui.zindek;
  }
}

function setEV(id,val){
  console.log(id+': '+val);
  document.getElementById(id).value=val;
}

function getEV(id){
  //console.log(id);
  return document.getElementById(id).value;
}

function getiH(id){
  //console.log(id);
  return document.getElementById(id).innerHTML;
}

function setEC(id,val){
  if(String(val).toLowerCase()=="true") val=1;
  document.getElementById(id).checked=parseInt(val);
}

function getEC(id){
  console.log(id);
  return document.getElementById(id).checked;
}

function setEI(id,val){
  document.getElementById(id).selectedIndex=parseInt(val);
}

function getEI(id){
  return document.getElementById(id).selectedIndex;
}

function focus(id){
  document.getElementById(id).focus();
}

function disabled(id,val){
  document.getElementById(id).disabled=val;
}

function myTrim(x) {
  return x.replace(/^\s+|\s+$/gm,'');
}

function tglSekarang(){
  const n=new Date();
  const tglskrng=n.getFullYear()
    +"-"+("0"+parseInt(n.getMonth()+1)).slice(-2)
    +"-"+("0"+n.getDate()).slice(-2);
  return tglskrng;
}

function tglIna2(tgl){
  if(tgl=='')return '';
  var bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"
    , "Jul", "Agu", "Sep", "Okt", "Nop", "Des"];
  return tgl.substr(8,2)+'-'+bulan[parseInt(tgl.substr(5,2))-1]
    +'-'+tgl.substr(2,2) ;
}

function tglInt(tgl_int){
  if (tgl_int==undefined){
    return '';
  }
  tgl_int=Number(tgl_int);

  const dt=new Date(tgl_int);
  return dt.getDate()
    +'/'+(parseInt(dt.getMonth())+1)
    +'/'+dt.getFullYear()
    +' '+('0'+dt.getHours()).slice(-2)
    +':'+('0'+dt.getMinutes()).slice(-2)
    +':'+('0'+dt.getSeconds()).slice(-2);
}

function tglInt2(tgl_int){// digunakan untuk timestamp;
  if (tgl_int==undefined){
    return '';
  }
  tgl_int=Number(tgl_int);

  const dt=new Date(tgl_int);
  /*
  return dt.getDate()
    +'/'+(parseInt(dt.getMonth())+1)
    +'/'+dt.getFullYear();*/
    
  return dt.getFullYear()
    +' '+('0'+(parseInt(dt.getMonth())+1)).slice(-2)
    +' '+('0'+dt.getDate()).slice(-2);
}

function blokID(blok){
  if(blok==undefined || blok==''){
    return '';
  }

  var blokend = blok;
  var blokend3 = blokend.split("-");
  return blokend3[2];
}

function blokID2(blok){
  if(blok==undefined || blok==''){
    return '';
  }

  var blokend = blok;
  var blokend3 = blokend.split("-");
  var a99=Array.from(blokend3[2]);
  var r99='';
  for(var i=0;i<a99.length;i++){
    if(((i+1) % 8)==0){// modulus;
      if(i+1==a99.length){
        r99+=a99[i];
      }else{
        r99+=a99[i]+' - ';
      }
    }else{
      r99+=a99[i];
    }
  }
  return r99;
}

function downloadJSON(indek, paket, filename) {
  var html='<div style="padding:0 1rem 0 1rem;">'
    +'<h1>'+MODE_EXPORT+'</h1>'
    +'Silakan klik tombol berikut untuk mengunduh file.<br>'
    +'<p><a href="" id="export_'+indek+'">Download</a></p>'
    +'</div>';
  content.html(indek,html);
      
  // Create a blob
  var blob = new Blob([paket], { type:'application/json;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  document.getElementById('export_'+indek).href=url;
  
  const a=document.getElementById('export_'+indek)
  a.setAttribute('download', filename);
}

function progressBar(indek,oNomer,jml,oMsg){
  if (oNomer===jml){// end of progress
    document.getElementById("hasil_"+indek).innerHTML
    ='<button'
    +' id="btn_import_all_'+indek+'"'
    +' onclick="iii.importExecute('+indek+');">Import Data</button>'
    +'<br>'
    +'<p>[End] <b>'+jml+' rows.</b></p>'+oMsg;
    
    toolbar.wait(indek,END);
    statusbar.ready(indek);
  }
  else{// still on progress
    document.getElementById("hasil_"+indek).innerHTML
    ='<p><b>Please wait ... </b>['+oNomer+'/'+jml+']</p>'+oMsg;
    statusbar.html(indek,(oNomer+'/'+jml));
  }  
}

function progressBar2(indek,oNomer,jml,oMsg,jOk,jEr){
  if (oNomer===jml){// end of progress
    document.getElementById("hasil_"+indek).innerHTML
    ='<button'
    +' id="btn_import_all_'+indek+'"'
    +' onclick="iii.importExecute('+indek+');">Import Data</button>'
    +'<br>'
    +'<p>[End] <b style="color:blue;"><u>'+jml+'</u> rows.</b>'
    +' | <b style="color:green;"><u>'+jOk+'</u> OK.</b>'
    +' | <b style="color:red;"><u>'+jEr+'</u> Error.</b>'
    +'</p>'
    +oMsg;
    
    toolbar.wait(indek,END);
    statusbar.ready(indek);
  }
  else{// still on progress
    document.getElementById("hasil_"+indek).innerHTML
    ='<p><b>Please wait ... </b>['+oNomer+'/'+jml+']</p>'+oMsg;
    statusbar.html(indek,(oNomer+'/'+jml));
  }  
}

function tHTML(str){
  if (typeof(str) == "string") {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
  }
  return str;
}

function encodeKutip(str){// ubah kutip ke kode
  if (typeof(str) == "string") {
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
  }
  return str;
}

function decodeKutip(s){// membaca kode sandi kutip
  var txt=document.createElement('span');
  txt.innerHTML=s;
  return txt.innerHTML;
}

function xHTML(str){
  if (typeof(str) == "string") {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
  }
  return str;
}

function akses(i){
  let st="No Access";
  switch(Number(i)){
    case 0:st="No Access";break;
    case 1:st="Can Read";break;
    case 2:st="Can Create";break;
    case 3:st="Can Edit";break;
    case 4:st="Can Export";break;
  }
  return st;
}

function nmKolom(str){
  for(var i=0;i<data_fields.length;i++){
    if(data_fields[i][0]==str){
      return data_fields[i][1];
    }
  }
  return str+'?';
}

function getDataAccountClass(indek){
  var isi='';
  for(var i=0;i<array_account_class.length;i++){
    isi+="<option value="+i+">"+array_account_class[i]+'</option>'
  }
  return isi;
}

function getDataCostType(indek){
  var isi='';
  for(var i=0;i<array_cost_type.length;i++){
    isi+="<option value="+i+">"+array_cost_type[i]+'</option>'
  }
  return isi;
}

function getDataLocationType(indek){
  var isi='';
  for(var i=0;i<array_location_type.length;i++){
    isi+="<option value="+i+">"+array_location_type[i]+'</option>'
  }
  return isi;
}

function getCostMethod(indek){
  var isi='';
  for(var i=0;i<array_cost_method.length;i++){
    isi+="<option value="+i+">"+array_cost_method[i]+'</option>'
  }
  return isi;
}

function getItemClass(indek){
  var isi='';
  for(var i=0;i<default_item_class.length;i++){
    isi+="<option value="+i+">"+default_item_class[i]+'</option>'
  }
  return isi;
}

function getDataTermsType(indek){
  var isi='';
  for(var i=0;i<default_terms.length;i++){
    isi+="<option value="+i+">"+default_terms[i]+'</option>'
  }
  return isi;
}

function getDataPayFrequency(indek,pilih){
  var isi='';
  for(var i=0;i<array_pay_frequency.length;i++){
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_pay_frequency[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_pay_frequency[i]+'</option>'
    }
  }
  return isi;
}

function getDataFieldType(indek,pilih){
  var isi='';
  for(var i=0;i<array_field_type.length;i++){
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_field_type[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_field_type[i]+'</option>'
    }
  }
  return isi;
}

function getFormula(indek, pilih){
  var isi='';
  for(var i=0;i<array_formula.length;i++){
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_formula[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_formula[i]+'</option>'
    }
  }
  return isi;
}

function getEmployeeClass(indek){
  var isi='';
  for(var i=0;i<array_employee_class.length;i++){
    isi+="<option value="+i+">"+array_employee_class[i]+'</option>'
  }
  return isi;
}

function getPageLimit(indek,pilih){
  var isi='';
  for(var i=0;i<array_page_limit.length;i++){
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_page_limit[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_page_limit[i]+'</option>'
    }
  }
  return isi;
}

function getEmployeeFillingStatus(indek){
  var isi='';
  for(var i=0;i<array_employee_filling_status.length;i++){
    isi+="<option value="+i+">"
      +array_employee_filling_status[i]+'</option>'
  }
  return isi;  
}

function getEmployeePayMethod(indek){
  var isi='';
  for(var i=0;i<array_employee_pay_method.length;i++){
    isi+="<option value="+i+">"+array_employee_pay_method[i]+'</option>'
  }
  return isi;  
}

function getPayrollFieldClass(indek){
  var isi='';
  for(var i=0;i<array_payroll_field_class.length;i++){
    isi+="<option value="+i+">"+array_payroll_field_class[i]+'</option>'
  }
  return isi;
}

function binerToBool(n){
  if(Number(n)==0){
    return '';
  }else{
    return 'Yes';
  }
}

function setEO(id,val){
  document.getElementById(id).open=val;
}

function setEH(o,v){
  document.getElementById(o).innerHTML=v;
}

function setiH(o,v){
  console.log(o);
  document.getElementById(o).innerHTML=v;
}

function setDisplay(id,v){
  document.getElementById(id).style.display=v;
}

function formatSerebuan(num) {
  var balikin='&nbsp;';
  if (num===undefined){return balikin}
  if (num===null){return balikin}
  if (num===0){return balikin}
  if (num==='0'){return balikin}
  if (num==='0.00'){return balikin}
  if (num===''){return balikin}
  if (num<0){
      // bila nilai minus, menggunakan tanda kurung.
      /* 
      num = parseFloat(num)*-1;
    return "("+num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')+")";
    */
    num = parseFloat(num);
    return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); 
  }else{
      num = parseFloat(num);
    return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
}

function getDataUserLevel(indek,pilih){
  var isi='';
  for(var i=0;i<array_user_level.length;i++){
    isi+="<option value="+i+">"+array_user_level[i]+'</option>'
  }
  return isi;
}

function resetCode(blok){
  if(blok==undefined || blok==''){
    return '';
  }

  var blokend = blok;
  var blokend3 = blokend.split("-");
  return blokend3[1];
}

function str10(str){
  str=(str).replaceAll('\n',' ');
  str=str.slice(0,10);
  
  if(str.length>9)str+='...';
  return str;
}

function strN(str,n){
  n=parseInt(n);
  str=(str).replaceAll('\n',' ');
  str=str.slice(0,n);
  
  if(str.length>(n-1))str+='...';
  return str;
}

function str50(str){
  str=(str).replaceAll('\n',' ');
  str=str.slice(0,50);
  
  if(str.length>49)str+='...';
  return str;
}

const firstLine=0;
const newLine=1;
const comma=2;
const newLineBefore=3;
const spaceBefore=4;

function toAddress(data){
  return gabung(data.name,newLine)
    +gabung(data.street_1,newLine)
    +gabung(data.street_2,newLine)
    +gabung(data.city,firstLine)
    +gabung(data.state,comma)
    +gabung(data.zip,comma)
    +gabung(data.country,spaceBefore);
}

function gabung(str,tipe){
  if(String(str).length>0){
    if(tipe==firstLine)return str;
    if(tipe==newLine) return str+"\n";
    if(tipe==comma) return ", "+str;
    if(tipe==newLineBefore) return "\n"+str;
    if(tipe==spaceBefore) return " "+str;
  }else{
    return ""
  } 
}

function ribuan(num) {
  var balikin='&nbsp;';
  if (num===undefined){return balikin}
  if (num===null){return balikin}
  if (num===0){return balikin}
  if (num===0.00){return balikin}
  if (num==='0'){return balikin}
  if (num==='0.00'){return balikin}
  if (num===''){return balikin}
  if (Number(num)===0){return balikin}
  if (num<0){
      // bila nilai minus, menggunakan tanda kurung.
      /* 
      num = parseFloat(num)*-1;
    return "("+num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')+")";
    */
    num = parseFloat(num);
    return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); 
  }else{
      num = parseFloat(num);
    return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
}

function ribuan0(num) {
  var balikin='0.00';
  if (num===undefined){return balikin}
  if (num===null){return balikin}
  if (num===0){return balikin}
  if (num===0.00){return balikin}
  if (num==='0'){return balikin}
  if (num==='0.00'){return balikin}
  if (num===''){return balikin}
  if (Number(num)===0){return balikin}
  if (num<0){
      // bila nilai minus, menggunakan tanda kurung.
      /* 
      num = parseFloat(num)*-1;
    return "("+num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')+")";
    */
    num = parseFloat(num);
    return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); 
  }else{
      num = parseFloat(num);
    return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
}

function datePlusOne(dt){
  const bcd=new Date(dt);
  bcd.setDate(bcd.getDate()+1);

  return String(bcd.getFullYear())
    +'-'+String("0"+(bcd.getMonth()+1)).slice(-2)
    +'-'+String('0'+bcd.getDate()).slice(-2);
}

function checkAll(indek){
  
  const e=document.getElementsByName('checked_'+indek);
  const c=e.length;// count
  
  document.getElementsByName('checked_'+indek).checked=true;
  
  for(var i=0;i<c;i++){
    if(document.getElementById('check_all_'+indek).checked==true){
      e[i].checked=true;
    }else{
      e[i].checked=false;
    }
  }
}

function limitRows(indek,s){
  return 'Page rows: '
    +'<select id="page_limit_'+indek+'">'
    +getPageLimit(indek,s)
    +'</select>';
}
/*
function pagingAndLimit(indek){
  const d=bingkai[indek].paket;
  var html='';

  if (d.err.id===0){
    html+='<p>Total: '+d.count+' rows</p>'
    if (READ_PAGING && d.count>0){
      const i=bingkai[indek].paging.select;
      html+='<div style="position:relative;width:100%;">'
      +'<div style="position:absolute;'
      +'display:inline-block;'
      +'text-align:right;width:100%;">'+limitRows(indek,i)+'</div>'
      +'<div style="position:relative;display:inline-block;">';
      
      if (d.paging.first!=""){
        html+= '<input type="button"'
        +' id="btn_first_'+indek+'"'
        +' value="|<">';
      }
      for (var x in d.paging.pages){
        if (d.paging.pages[x].current_page=="yes"){
          html+='<input type="button" disabled'
          +' name="btn_number_'+indek+'"'
          +' value="'+d.paging.pages[x].page+'">';
        } else {
          html+='<input type="button" '
          +' name="btn_number_'+indek+'"'
          +' value="'+d.paging.pages[x].page+'">';
        }
      }
      if (d.paging.last!=""){
        html+= '<input type="button"'
        +' id="btn_last_'+indek+'"'
        +' value=">|">';
      }
      html+='</div></div>';// here
    }
  }
  return html;
}*/

function getDataRecordBy(indek){
  var isi='';
  for(var i=0;i<array_record_by.length;i++){
    isi+="<option value="+i+">"+array_record_by[i]+'</option>'
  }
  return isi;
}

function getDataTicketType(indek,pilih){
  var isi='';
  for(var i=0;i<array_ticket_type.length;i++){
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_ticket_type[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_ticket_type[i]+'</option>'
    }
  }
  return isi;
}

function getDataCustomerBy(indek, pilih){
  var isi='';
  for(var i=0;i<array_customer_by.length;i++){
    //isi+="<option value="+i+">"+array_customer_by[i]+'</option>'
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_customer_by[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_customer_by[i]+'</option>'
    }
  }
  return isi;
}

function getDataPayLevel(indek, pilih){
  var isi='';
  for(var i=0;i<array_pay_level.length;i++){
    //isi+="<option value="+i+">"+array_pay_level[i]+'</option>'
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_pay_level[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_pay_level[i]+'</option>'
    }
  }
  return isi;
}

function getDataBillingType(indek,pilih){
  var isi='';
  for(var i=0;i<array_billing_type.length;i++){
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_billing_type[i]+'</option>'
    }else{
      isi+="<option value="+i+">"+array_billing_type[i]+'</option>'
    }
  }
  return isi;
}

function getDataBillingStatus(indek, pilih){
  var isi='';
  for(var i=0;i<array_billing_status.length;i++){
    //isi+="<option value="+i+">"+array_billing_status[i]+'</option>'
    if(pilih==i){
      isi+='<option value="+i+" selected="selected">'
        +array_billing_status[i]+'</option>'
    }else{
      isi+="<option value="+i+">"
        +array_billing_status[i]
        +'</option>'
    }
  }
  return isi;
}

function getTimeOption(indek){
  var isi='';
  for(var i=0;i<array_time_option.length;i++){
    isi+="<option value="+i+">"+array_time_option[i]+'</option>'
  }
  return isi;  
}

function getDirectory(indek){
  var isi='';
  for(var i=0;i<array_directory.length;i++){
    isi+="<option value="+i+">"+array_directory[i]+'</option>'
  }
  return isi;  
}

function getDecimalPlaces(indek){
  var isi='';
  for(var i=0;i<array_decimal_places.length;i++){
    isi+="<option value="+i+">"+array_decimal_places[i]+'</option>'
  }
  return isi;  
}

function getDecimal(indek){
  return Number(bingkai[indek].company.decimal_places);
}

function fTime(tm){
  var s, a, b;
  if(tm==undefined){
    tm="00:00";
  }
  if(tm.match(':')){
    s=String(tm).split(':');
    if(s.length>0) a=digit2(s[0]);
    if(s.length>1) b=digit2(s[1]);
    tm=a+':'+b;
  }
  
  let isi=/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/
  if(tm.match(isi)){
    return tm;
  }else{
    return '00:00';
  }
}

function digit2(a){
  return ('00'+a).slice(-2);
}

function fTgl(t1){
  var t=new Date(t1);
  return t.getFullYear()
    +'-'+digit2(t.getMonth()+1)
    +'-'+digit2(t.getDate());
}

function muncul(end_date,i,indek){
  document.getElementById(end_date+'_fake_'+i+'_'+indek).style.display="none";
  document.getElementById(end_date+'_'+i+'_'+indek).style.display="inline-block";
  document.getElementById(end_date+'_'+i+'_'+indek).focus();
}

function ngumpet(end_date,i,indek){
  document.getElementById(end_date+'_'+i+'_'+indek).style.display="none";
  document.getElementById(end_date+'_fake_'+i+'_'+indek).style.display="inline";
  setEV(end_date+'_fake_'+i+'_'+indek, tglIna2(getEV(end_date+'_'+i+'_'+indek)));
  
//  Budgets.setCell(indek,'end_date_'+i+'_'+indek);
}

function pesanSalah(indek,key,value){
  const paket={// local error;
    err:{
      id:3,
      msg:'test',
      key:key,
      value:value,
    },
    metode:'',
  }
  message.infoPaket(indek,paket);
}

function pesanSalah2(indek,id,key,value){
  const paket={// local error;
    err:{
      id:id,
      msg:'test',
      key:key,
      value:value,
    },
    metode:'',
  }
  message.infoPaket(indek,paket);
}

function pesanOK(indek,metode,key,value){
  const paket={// local error;
    err:{
      id:0,
      msg:'ok',
      key:key,
      value:value,
    },
    metode:metode,
  }
  message.infoPaket(indek,paket);
}

function totalPagingandLimit(indek){
  var d=bingkai[indek].biji;
  var c=bingkai[indek].count;
  var html='';

  html+='<p>Total: '+c+' rows</p>'
  if (c>0){
    const i=bingkai[indek].paging.select;
    html+='<div style="position:relative;width:100%;">'
    +'<div style="position:absolute;'
    +'display:inline-block;'
    +'text-align:right;width:100%;">'+limitRows(indek,i)+'</div>'
    +'<div style="position:relative;display:inline-block;">';
    
    if (d.first!=""){
      html+= '<input type="button"'
      +' id="btn_first_'+indek+'"'
      +' value="|<">';
    }
    for (var x in d.pages){
      if (d.pages[x].current_page=="yes"){
        html+='<input type="button" disabled'
        +' name="btn_number_'+indek+'"'
        +' value="'+d.pages[x].page+'">';
      } else {
        html+='<input type="button" '
        +' name="btn_number_'+indek+'"'
        +' value="'+d.pages[x].page+'">';
      }
    }
    if (d.last!=""){
      html+= '<input type="button"'
      +' id="btn_last_'+indek+'"'
      +' value=">|">';
    }
    html+='</div></div>';// here
  }

  return html;
}

function pagingLimit(indek){
  const d=bingkai[indek].biji;
  const c=bingkai[indek].count;
  var html='';

  html+='<p>Total: '+c+' rows</p>'
  if (c>0){
    const i=bingkai[indek].paging.select;
    html+='<div style="position:relative;width:100%;">'
    +'<div style="position:absolute;'
    +'display:inline-block;'
    +'text-align:right;width:100%;">'+limitRows(indek,i)+'</div>'
    +'<div style="position:relative;display:inline-block;">';
    
    if (d.first!=""){
      html+= '<input type="button"'
      +' id="btn_first_'+indek+'"'
      +' value="|<">';
    }
    for (var x in d.pages){
      if (d.pages[x].current_page=="yes"){
        html+='<input type="button" disabled'
        +' name="btn_number_'+indek+'"'
        +' value="'+d.pages[x].page+'">';
      } else {
        html+='<input type="button" '
        +' name="btn_number_'+indek+'"'
        +' value="'+d.pages[x].page+'">';
      }
    }
    if (d.last!=""){
      html+= '<input type="button"'
      +' id="btn_last_'+indek+'"'
      +' value=">|">';
    }
    html+='</div></div>';// here
  }

  return html;
}

function bijiPaging(indek){
  let itmPaging={};
  let count_=bingkai[indek].count;
  var page=bingkai[indek].paging.page;
  var limit=bingkai[indek].paging.limit;
  
  bingkai[indek].paging.offset=((page-1)*limit);

  // first
  if(page>1){
    itmPaging.first=1;
  }else{
    itmPaging.first='';
  }

  let total_pages=Math.ceil(count_/limit);
  let range=2;
  let initial_num=page-range;
  let condition_limit_num=(parseInt(page)+parseInt(range))+1;
  let page_count=0;
  let pagesx={};
  
  itmPaging.pages=[];
  for(let x=initial_num;x<condition_limit_num;x++){
    if(x>0 && (x<=total_pages)){
      pagesx={};
      pagesx.page=x;
      if(x==page){
        pagesx.current_page="yes";
      }else{
        pagesx.current_page="no";
      }
      pagesx.total_pages=total_pages;
      itmPaging.pages.push(pagesx);
    }
  }
  itmPaging.last='';
  if(page<total_pages){
    itmPaging.last=total_pages;
  }
  itmPaging.total=total_pages;
  bingkai[indek].biji=itmPaging;
  return;
}

//function AOGet(f,r){
function objectOne(f,r){
  // AOGet=Array to Object GetOne
  var new_obj={};
  var new_arr=[];
  var i,j;
  
  for(j=0;j<r.length;j++){
    new_obj={};
    for(i=0;i<f.length;i++){
      new_obj[f[i]]=r[j][i];
    }
    new_arr.push(new_obj);
  }
  
  return new_arr[0];
}

//function AOAll(f,r){
function objectMany(f,r){
  // ATOOne=Array To Object ALL
  var new_obj={};
  var new_arr=[];
  
  for(var j=0;j<r.length;j++){
    new_obj={};
    for(var i=0;i<f.length;i++){
      new_obj[f[i]]=r[j][i];
    }
    new_arr.push(new_obj);
  }
  return new_arr;  
}

function loginDuration(tgl_login){
  var currentDate = new Date();
  var tgl=Number(tgl_login);
  var loginDate=new Date(tgl);
  currentDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  
  const durasi=Math.abs((currentDate.getTime()-loginDate.getTime()));
  const durasi_day=Math.floor((durasi/1000)/60/60/24);
  const durasi_hour=Math.floor((durasi/1000)/60/60%24);
  const durasi_minute=Math.floor((durasi/1000)/60%60);
  const durasi_second=Math.floor((durasi/1000)%60);
  
  let drs=durasi_day+'d '
    +durasi_hour+'h '
    +durasi_minute+'m '
    +durasi_second+'s';
    
  return drs;
}

function TotalPagingLimit(indek){
  const d=bingkai[indek].biji;
  const c=bingkai[indek].count;
  var html='';

  html+='<p>Total: '+c+' rows</p>'
  if (c>0){
    const i=bingkai[indek].paging.select;
    html+='<div style="position:relative;width:100%;">'
    +'<div style="position:absolute;'
    +'display:inline-block;'
    +'text-align:right;width:100%;">'+limitRows(indek,i)+'</div>'
    +'<div style="position:relative;display:inline-block;">';
    
    if (d.first!=""){
      html+= '<input type="button"'
      +' id="btn_first_'+indek+'"'
      +' value="|<">';
    }
    for (var x in d.pages){
      if (d.pages[x].current_page=="yes"){
        html+='<input type="button" disabled'
        +' name="btn_number_'+indek+'"'
        +' value="'+d.pages[x].page+'">';
      } else {
        html+='<input type="button" '
        +' name="btn_number_'+indek+'"'
        +' value="'+d.pages[x].page+'">';
      }
    }
    if (d.last!=""){
      html+= '<input type="button"'
      +' id="btn_last_'+indek+'"'
      +' value=">|">';
    }
    html+='</div></div>';// here
  }

  return html;
}
/*
function path(indek,berkas,callback){
  
  var f=berkas.folder+'/'+berkas.name;

  if(berkas.folder=="/"){
    return callback();// folder==root;
  }
  
  db.run(indek,{// find path
    query:"SELECT path"
      +" FROM files"
      +" WHERE path='"+f+"'"
  },(p1)=>{
    if(p1.count>0){
      // path terdaftar;
      return callback(p1);
    }else{
      // path tidak terdaftar;
      pesanSalah2(indek,7,['file'],[f]);
    }
  });  
}*/

function pecahPath(indek,berkas,callback){
  //split
  var s=String(berkas).split("/");
  var p="";// parent
  var n="";// name
  for(var t=0;t<s.length;t++){
    if(t===(s.length-1)){
      n=s[t];
    }else{
      p+="/"+s[t];
    }
  }

  if(p=="/") p="";
  
  return callback({
    "parent":p,
    "name":n,
  });
}

function dir(indek,berkas,callback){
  pecahPath(indek,berkas,(h)=>{
    db.run(indek,{
      query:"SELECT name"
        +" FROM folders"
        +" WHERE parent='"+h.parent+"'"
        +" AND name='"+h.name+"'"
    },(p)=>{
      if(p.count>0){ // exist 1
        return callback(1);
      }else{ // not exist 0
        return callback(0);
      }
    })
  });
}

function mkdir(indek,berkas,callback){
  dir(indek,berkas,(p)=>{
    if (p==0){// folder not exist, create it!!; (0) OK!
      pecahPath(indek,berkas,(p2)=>{
        db.run(indek,{
          query:"INSERT INTO folders("
            +"parent,name)"
            +" VALUES ("
            +"'"+p2.parent+"',"
            +"'"+p2.name+"')"
        },(p3)=>{
          if(p3.err.id==0){
            return callback(0);
          }else{
            return callback(-1);
            //pesanSalah2(indek,7,['folder'],[p3.parent]);// (-1) ERR!
          }
        });
      });
    }else{ // folder exist;
      return callback(1);// already exist (1) FAILED!!!
    }
  });
}

function setPagingLimit(indek){
  let ada=0;
  
  for(let x=0;x<paging_limit.length;x++){
    if(paging_limit[x].menu_id==bingkai[indek].menu.id){
      paging_limit[x].limit=bingkai[indek].paging.limit;
      paging_limit[x].select=bingkai[indek].paging.select;
      ada=1;
    }
  }
  if(ada==0){
    paging_limit.push({
      "menu_id":bingkai[indek].menu.id,
      "limit":bingkai[indek].paging.limit,
      "select":bingkai[indek].paging.select
    });
  }
}

function getPagingLimit(indek){
  for(let x=0;x<paging_limit.length;x++){
    if(paging_limit[x].menu_id==bingkai[indek].menu.id){
      bingkai[indek].paging.limit=paging_limit[x].limit;
      bingkai[indek].paging.select=paging_limit[x].select;
    }
  }
}
/*
function getPath_(indek,menu_id,callback){
  var folder="";
  db.run(indek,{
    query:"SELECT data_folder "
      //+" FROM my_menu_detail"
      +" FROM path"
      +" WHERE menu_id='"+menu_id+"'"
  },(p)=>{
    if(p.count>0){
      return callback({"folder":p.data[0]})
    }else{
      db.run(indek,{
        query:"SELECT data_folder"
          +" FROM menu"
          +" WHERE menu_id='"+menu_id+"'"
      },(p)=>{
        if(p.count>0){
          return callback({"folder":p.data[0]})
        }
      });
    }
  });
}
*/
function getPath(indek,menu_id,callback){
  var folder="";
  db.run(indek,{
    query:"SELECT path "
      +" FROM path"
      +" WHERE table_name='"+menu_id+"'"
  },(p)=>{
    if(p.count>0){
      return callback({"folder":p.data[0]})
    }else{
      return callback({"folder":String('/').concat(menu_id) })
    }
  });
}

function getCompanyID(indek){
  if(bingkai[indek].company.id==""){
    db.run(indek,{
      query:"SELECT company_id"
        +" FROM setting"
    },(h)=>{
      if(h.count>0){
        var d=objectOne(h.fields,h.data);
        if(d.company_id!=""){
          bingkai[indek].company.id=d.company_id;
        }
      }
    });
  }else{
    // console.log('isntalled');
    // nothing to-do
  }
}

function getPath2(indek,callback){
  var menu_id=bingkai[indek].menu.id;
  var folder="";
  db.run(indek,{
    query:"SELECT path "
      +" FROM path"
      +" WHERE table_name='"+menu_id+"'"
  },(p)=>{
    if(p.count>0){
      return callback({"folder":p.data[0]})
    }else{
      return callback({
        "folder": String('/').concat(menu_id) 
      })
    }
  });
}
/*
function getPath0(indek,callback){
  var menu_id=bingkai[indek].menu.id;
  var folder="";
  db.run(indek,{
    query:"SELECT path "
      +" FROM path"
      +" WHERE table_name='"+menu_id+"'"
  },(p)=>{
    if(p.count>0){
      return callback({"folder":p.data[0]})
    }else{
      return callback({
        "folder": String('/').concat(menu_id) 
      })
    }
  });
}
*/
function createFolder(indek,callback){
  // ini paling clean, agar folder jadi makin sepesifik (khusus);
  getCompanyID(indek);// ini untuk defaults;
  getPath2(indek,(h)=>{
    mkdir(indek,h.folder,(h2)=>{
      return callback(h2);
    });
  });
}
/*
function getPath3(indek,menu_id,callback){
//  var menu_id=bingkai[indek].modul;
  var folder="";
  db.run(indek,{
    query:"SELECT data_folder "
      +" FROM my_menu_detail"
      +" WHERE menu_id='"+menu_id+"'"
  },(p)=>{
    if(p.count>0){
      return callback({"folder":p.data[0]})
    }else{
      db.run(indek,{
        query:"SELECT data_folder"
          +" FROM menu"
          +" WHERE menu_id='"+menu_id+"'"
      },(p)=>{
        if(p.count>0){
          return callback({"folder":p.data[0]})
        }
      });
    }
  });
}
*/
function dateDiff(date1, date2){
  const timeDiff=Math.abs(date2.getTime() - date1.getTime() );
  const daysDiff=Math.ceil(timeDiff / (1000*60*60*24));
  const hoursDiff=Math.ceil(timeDiff / (1000*60*60));
  const minutesDiff=Math.ceil(timeDiff / (1000*60));
  const secondsDiff=Math.ceil(timeDiff / (1000));

  return {
    days: daysDiff,
    hours: hoursDiff,
    minutes: minutesDiff,
    seconds: secondsDiff,
  }
}

function getFrequencyWeek(indek,a){
  var w=1;
  switch(a){
    case 0: w=1; break;
    case 1: w=2; break;
    case 2: w=2; break;
    case 3: w=4; break;
    case 4: w=2; break;
  }
  return w;
}

function dateRealShow(indek,name){
  document.getElementById(name+'_fake_'+indek).style.display="none";
  document.getElementById(name+'_'+indek).style.display="inline";
  document.getElementById(name+'_'+indek).focus();
}

function dateFakeShow(indek,name){
  document.getElementById(name+'_'+indek).style.display="none";
  document.getElementById(name+'_fake_'+indek).style.display="inline";
  document.getElementById(name+'_fake_'+indek).value=
  tglWest(document.getElementById(name+'_'+indek).value);
}

function getMenuType(indek){
  var isi='';
  for(var i=0;i<array_menu_type.length;i++){
    isi+="<option value="+i+">"+array_menu_type[i]+'</option>'
  }
  return isi;  
}

function getMenuAccess(indek){
  var isi='';
  for(var i=0;i<array_menu_access.length;i++){
    isi+="<option value="+i+">"+array_menu_access[i]+'</option>'
  }
  return isi;  
}

function getMenuGroup(indek){
  var isi='';
  for(var i=0;i<array_menu_group.length;i++){
    isi+="<option value="+i+">"+array_menu_group[i]+'</option>'
  }
  return isi;  
}

class stdDesimal{
  constructor(indek){
    this.indek=indek;
    this.decimal_places=bingkai[indek].company.decimal_places
  }
  keInt(n){
    var c=10**this.decimal_places;
    //return (n*c); => kalo tanpa fix 1.132 jadi 1.1319999;
    //return (n*c); => kalo tanpa fix 1.1319 jadi 1.1318;
    return (n*c).toFixed(0);
    
  }
  keDes(n){
    return (n/(10**this.decimal_places));
  }
}

function getRptDefault(indek,callback){
  
  function getDefault(indek,hasil){
    var sql="SELECT period_id"
      +" FROM account_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      var d=JSON.parse(h);
      if(d.rows.length>0){
        if(bingkai[indek].rpt.filter.period_id==""){
          bingkai[indek].rpt.filter.period_id=d.rows[0][0];
        }
      }
      return hasil();
    });
  }

  function getPeriod(indek,hasil){// replace 
    var sql="SELECT period_id,start_date,end_date"
      +" FROM period"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND period_id='"+bingkai[indek].rpt.filter.period_id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      var d=JSON.parse(h);
      if(d.rows.length>0){
        // mode date;
        if(bingkai[indek].rpt.filter.date==""){
          bingkai[indek].rpt.filter.date=d.rows[0][2];
        }
        // mode range;
        if(bingkai[indek].rpt.filter.from==""){
          bingkai[indek].rpt.filter.from=d.rows[0][1];
          
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=d.rows[0][2];
        }
      }
      return hasil();
    });
  }  
  
  function getCompany(indek,hasil){// default 1
    var sql="SELECT company_id,name,start_date"
      +" FROM company"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
    DownloadEmpat.run(indek,sql,(h)=>{
      bingkai[indek].rpt.company=h;
      var d=JSON.parse(h);
      if(d.rows.length>0){
        // mode date
        if(bingkai[indek].rpt.filter.date==""){
          bingkai[indek].rpt.filter.date=tglSekarang();
        }
        // mode range;
        if(bingkai[indek].rpt.filter.from==""){
          bingkai[indek].rpt.filter.from=d.rows[0][2];
        }
        if(bingkai[indek].rpt.filter.to==""){
          bingkai[indek].rpt.filter.to=tglSekarang();
        }
      }
      return hasil();
    });
  }
  
  var html='<h1>Please wait... loading data</h1>'
    +'<div id="layar_'+indek+'"></div>'
    +'<div id="msg_'+indek+'"></div>';
  content.html(indek,html);
  
  getDefault(indek,()=>{
    getPeriod(indek,()=>{
      getCompany(indek,()=>{
        return callback();
      });
    });
  })
  
}

function renderLine(indek,L){
  var cv=document.getElementById("cv_"+indek);
  var ctx=cv.getContext("2d");
  var i=0;

  for(i=1;i<L.length;i++){
    ctx.beginPath();
    ctx.moveTo(L[i],0);
    ctx.lineTo(L[i],45);
    ctx.strokeStyle="grey";
    ctx.stroke();
  }
  
  ctx.beginPath();
  ctx.rect(0,0,L[L.length-1],25); // x,y,width,height
  ctx.strokeStyle="grey";
  ctx.stroke();

}

function renderLine2(indek,L){
  var cv=document.getElementById("cv_"+indek);
  var ctx=cv.getContext("2d");
  var i=0;

  for(i=1;i<L.length;i++){
    ctx.beginPath();
    ctx.moveTo(L[i],0);
    ctx.lineTo(L[i],70);
    ctx.strokeStyle="red";
    ctx.stroke();
  }
  
  ctx.beginPath();
  ctx.rect(0,0,L[L.length-1],50); // x,y,width,height
  ctx.strokeStyle="blue";
  ctx.stroke();

}

function textToHex(str) {
  return str.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(' ');
}

function hexToText(hex){
  var cleanHex=hex.replace(/\s+/g, '');
  var str='';
  
  for(var i=0;i<cleanHex.length; i+=2) {
    var charCode=parseInt(cleanHex.substr(i,2), 16);
    
    str+=String.fromCharCode(charCode);
  }
  return str;
}

function copy_data(indek,name,paket){
  bingkai[indek].copy_data={
    fields: paket.fields,
    rows: paket.data,
    name: name,
  }
}

function setCursor(indek,val){// lokasi kursor;
  var k=0;

  if(bingkai[indek].offset==undefined) {
    bingkai[indek].offset=0;
  } else{
    k=bingkai[indek].offset;
  }
  
  k+=val;
  if(k<0) {
    k=0; //stop-min: kursor ada di titik-awal
  }
  if(k==Number(bingkai[indek].count)) {
    k-=1; //stop-max: di titik-akhir
  }
  bingkai[indek].offset=k;
}


//console.log(textToHex("text ini di convert");

// eof: 247;260;541;606;1121;1142;1183;1231;1251;1336;
