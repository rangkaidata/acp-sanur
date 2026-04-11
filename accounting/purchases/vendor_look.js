/*
 * auth: budiono;
 * path: folder/purchases/vendor_look.js;
 * date: sep-11, 16:17, mon-2023; new;
 * edit: sep-20, 10:37, wed-2023;
 * edit: sep-27, 15:10, wed-2023; vendor_begins;
 * edit: oct-26, 09:37, thu-2023; purchase_orders;
 * edit: nov-16, 08:27, thu-2023; payments;
 * edit: nov-17, 06:46, fri-2023; vendor_checks;
 * edit: nov-18, 15:23, sat-2023; vendor_credits;
 * -----------------------------; happy new year 2024;
 * edit: jan-05, 21:37, fri-2024; 
 * edit: jan-10, 12:31, wed-2024; re-write with class
 * edit: may-25, 20:34, sat-2024; BasicSQL;
 * edit: sep-13, 11:43, fri-2024; r19;
 * edit: sep-25, 21:15, wed-2024; r19; search;
 */ 
 
'use strict';

class VendorLook {

  constructor(bigBos){
    this.url='vendors';
    this.title='Vendors';
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
    tiket.paging.page=1;

    const newReg=new BingkaiSpesial(tiket);
    const indek=newReg.show();
    // bingkai[indek].paging.page=1;
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM vendors"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND inactive=0 "
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
        query:"SELECT vendor_id, name, phone,"
          +" user_name,date_modified"
          +" FROM vendors"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND inactive=0 "
          +" ORDER BY vendor_id"
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
      +'<th colspan="2">Vendor ID</th>'
      +'<th>Name</th>'
      +'<th>Telephone</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d){
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].vendor_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+xHTML(d[x].phone)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' name="select_'+indek+'" '
          +' class="icon_select" >'
          +'</button></td>'
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
    const d=objectMany(p.fields,p.data);
    const indek_parent=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        bigBos.setVendor(indek_parent,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM vendors "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
      +" FROM vendors "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
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
        query:"SELECT vendor_id, name, phone,"
          +" user_name,date_modified"
          +" FROM vendors"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
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

// eof: 183;113;153;155;161;200;
