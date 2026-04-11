/*
 * auth: budiono
 * new : sep-11, 16:30, mon-2023; new;
 * edit: sep-19, 21:26, tue-2023;
 * edit: oct-27, 10:56, fri-2023; purchase_orders;
 * edit: nov-02, 11:12, thu-2023; receive_inventory;
 * edit: dec-01, 11:41, fri-2023; quotes;
 * edit: dec-02, 12:10, sat-2023; sales_orders;
 * edit: dec-03, 07:16, sun-2023; invoices;
 * -----------------------------; happy new year 2024;
 * edit: jan-02, 07:36, tue-2024; mringkas;
 * edit: jan-09, 10:43, tue-2024; re-write with class;
 * edit: jan-10, 15:51, wed-2024; test;
 * edit: jun-29, 08:33, sat-2024; r3;
 * edit: sep-11, 12:03, wed-2024; r18;
 */ 
 
 /* write once, re-write twice,  */

'use strict';

class ShipMethodLook{
  
  constructor(bigBos){
    this.url='ships';
    this.title='Ship Methods';
    this.bigBos=bigBos;
    this.hideNew=true;
    this.hideExport=true;
    this.hideImport=true;
    this.hideMore=true;
    this.hideSelect=true;
    this.hideRefresh=true;
    this.hideHide=true;
    this.form=new ActionForm2(this);
  }
  
  getPaging(indek_parent,id_kolom,baris){
    bingkai[indek_parent].id_kolom=id_kolom;
    bingkai[indek_parent].baris=baris;

    const tiket=JSON.parse(JSON.stringify(bingkai[indek_parent]));
    tiket.parent=indek_parent;
    tiket.modul=this.url;
    tiket.menu.name=this.title;
    tiket.ukuran.lebar=60;
    tiket.ukuran.tinggi=40;
    tiket.bisa.ubah=0;
    tiket.letak.atas=0;
    tiket.look_up=true;
    tiket.pop_up=true;

    const newReg=new BingkaiSpesial(tiket);
    const indek=newReg.show();    
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM ship_methods"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
    },(paket)=>{
      bingkai[indek].count=0;
      if(paket.err.id==0){
        bingkai[indek].count=paket.data[0][0];
      }
      return callback()
    });
  }

  readPaging(indek){
    bingkai[indek].metode=MODE_READ;
    this.count(indek,()=>{
      bijiPaging(indek);
      db.execute(indek,{
        query:"SELECT ship_id, name, "
          +" user_name,date_modified "
          +" FROM ship_methods "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" ORDER BY ship_id "
          +" LIMIT "+bingkai[indek].paging.limit
          +" OFFSET "+bingkai[indek].paging.offset
      },()=>{
        PAGING=true;
        this.readShow(indek);
      });
    })
  }
  
  readShow(indek){
    const p=bingkai[indek].paket;
    const d=objectMany(p.fields,p.data);
    var n=bingkai[indek].paging.offset;
    
    var html ='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
      +totalPagingandLimit(indek)
      +'<table border=1 style="padding:10px;">'
      +'<th colspan="2">Ship ID</th>'
      +'<th>Name</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].ship_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
            +' name="select_'+indek+'"'
            +' class="icon_select" >'
          +'</button>'
        +'</td>'
        +'</tr>';
      }
    }
    html+='</table></div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek,p);
    this.form.addPagingFn(indek);
    this.addSelectFn(indek);
  }
  
  addSelectFn(indek){
    const bigBos=this.bigBos;
    const n=document.getElementsByName('select_'+indek);
    const p=bingkai[indek].paket;
    const data=objectMany(p.fields,p.data);
    const indek_parent=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        bigBos.setShipMethod(indek_parent,data[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM ship_methods"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND ship_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
      +" FROM ship_methods "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ship_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
    },(paket)=>{
      bingkai[indek].count=0;
      if(paket.err.id==0 && paket.count>0){
        bingkai[indek].count=paket.data[0][0];
      }
      return callback()
    });
  }

  search=(indek)=>{
    this.countSearch(indek,()=>{
      bijiPaging(indek);
      db.execute(indek,{
        query:"SELECT ship_id,name,inactive,"
          +" user_name,date_modified "
          +" FROM ship_methods"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND ship_id LIKE '%"+bingkai[indek].text_search+"%'"
          +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
          +" LIMIT "+bingkai[indek].paging.limit
          +" OFFSET "+bingkai[indek].paging.offset
      },()=>{
        PAGING=false;
        bingkai[indek].metode=MODE_RESULT;
        this.readShow(indek);
      });
    });
  }
}



// eof:221;138;109;173;153;157;195;
