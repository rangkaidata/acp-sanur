/*
 * auth: budiono;
 * date: dec-03, 11:56, sun-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-21, 20:05, sun-2024; re-write from function to class;
 * edit: aug-20, 21:25, tue-2024; r13; 
 * edit: oct-05, 21:55, sat-2024; #20;
 * -----------------------------; happy new year 2025;
 * edit: nov-08, 15:57, sat-2025; #80;
 */ 
 
'use strict';

class InvoiceLook{
  
  constructor(mother){
    this.mother=mother;
    this.url='invoices';
    this.title='Invoices';
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
    tiket.ukuran.lebar=50;
    tiket.ukuran.tinggi=30;
    tiket.bisa.ubah=0;
    // tiket.letak.atas=0;
    tiket.look_up=true;
    tiket.pop_up=true;

    const newReg=new BingkaiSpesial(tiket);
    const indek=newReg.show();    
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM invoice_void_sum"
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
        query:"SELECT"
          +" customer_id,"
          +" invoice_no,invoice_date AS date,invoice_amount AS total,"
          +" void_no"
          +" FROM invoice_void_sum"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" ORDER BY invoice_date,invoice_no"
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
      +pagingLimit(indek)
      +'<table border=1 style="padding:10px;">'
        +'<th colspan="2">Date</th>'
        +'<th>Invoice #</th>'
        +'<th>Customer ID</th>'
        +'<th>Amount</th>'
        +'<th>Select</th>';

    if(p.err.id===0){
      var x;
      for(x in d){
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].invoice_no+'</td>'
        +'<td align="left">'+d[x].customer_id+'</td>'
        +'<td align="right">'+d[x].total+'</td>'
          +'<td align="center">'
            +'<button type="button" '
              +' name="select_'+indek+'"'
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
    var m=this.mother;
    var n=document.getElementsByName('select_'+indek);
    var r=bingkai[indek].paket;
    var d=objectMany(r.fields,r.data);
    var p=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setInvoice(p,d[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM invoice_void_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND invoice_no='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
}


// eof: 152;
