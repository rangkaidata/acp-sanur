/*
 * name: budiono;
 * date: sep-11, 10:11, thu-2023; new;
 * edit: dec-01, 14:05, fri-2023; quotes;
 * edit: dec-02, 12:15, sat-2023; sales_orders;
 * edit: dec-03, 07:28, sun-2023; invoices;
 * edit: dec-04, 10:14, mon-2023; receipts;
 * -----------------------------; happy new year 2024;
 * edit: jan-09, 08:34, tue-2024; konsep dengan class;
 * edit: jan-10, 16:28, wed-2024; 
 * edit: jun-03, 19:15, mon-2024; Basic SQL;
 * edit: jul-03, 18:07, wed-2024; r5; add inactive=0;
 * edit: sep-30, 18:53, mon-2024; #19; 
 */ 
 
'use strict';

class SalesTaxLook{
  
  constructor(bigBos){
    this.url='sales_taxes';
    this.title='Sales Taxes';
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
        +" FROM sales_taxes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND inactive=0; "
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
        query:"SELECT"
          +" sales_tax_id, name, rate, "
          +" user_name,date_modified"
          +" FROM sales_taxes"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND inactive=0 "
          +" ORDER BY sales_tax_id"
          +" LIMIT "+bingkai[indek].paging.limit
          +" OFFSET "+bingkai[indek].paging.offset
      },()=>{
        PAGING=true;
        this.readShow(indek);
      });
    })
  }
  
  readShow(indek){
    var p=bingkai[indek].paket;
    var d=objectMany(p.fields,p.data);
    var n=bingkai[indek].paging.offset;
    
    var html ='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1 style="padding:10px;">'
      +'<th colspan="2">Sales Tax ID</th>'
      +'<th>Description</th>'
      +'<th>Rate</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      var x;
      for (x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td align="left">'+d[x].sales_tax_id+'</td>'
          +'<td align="left">'+xHTML(d[x].name)+'</td>'
          +'<td align="center">'+d[x].rate+'%</td>'
          +'<td align="center">'
            +'<button type="button" '
            +' name="select_'+indek+'" '
            +' class="icon_select" >'
            +'</button>'
          +'</td>'
        +'</tr>';
      }
    }

    html+='</table>'
    +'</div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek,p);
    this.form.addPagingFn(indek);
    this.addSelectFn(indek);
  }
  
  addSelectFn(indek){
    const bigBos=this.bigBos;
    const n=document.getElementsByName('select_'+indek);
    const r=bingkai[indek].paket;
    const d=objectMany(r.fields,r.data);
    const p=bingkai[indek].parent;
    
    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        bigBos.setSalesTax(p,d[this.dataset.i]);// here ...
         ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM sales_taxes "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND sales_tax_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }

  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
      +" FROM sales_taxes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND sales_tax_id LIKE '%"+bingkai[indek].text_search+"%'"
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
        query:"SELECT sales_tax_id,name,rate,"
          +" user_name,date_modified"
          +" FROM sales_taxes"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND sales_tax_id LIKE '%"+bingkai[indek].text_search+"%'"
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




// eof; 185;114;153;155;
