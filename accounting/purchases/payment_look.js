/*
 * auth: budiono;
 * new : aug-18, 16:06, fri 2023; new
 * edit: nov-22, 12:47, wed-2023; add payment_amount;
 * -----------------------------; happy new year 2024;
 * edit: jan-19, 17:47, fri-2024; re-write w class;
 * edit: jul-18, 17:50, thu-2024; r9;
 * edit: aug-09, 11:16, thu-2024; r11;
 * edit: sep-28, 16:10, sat-2024; r19; payment_void_sum;
 * -----------------------------; happy new year 2025;
 * edit: oct-26, 11:42, sun-2025; #80; 
 */ 
 
'use strict';

class PaymentLook {
  
  constructor(mother){
    this.mother=mother;
    this.url='payments';
    this.title='Payments';
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
        +" FROM payment_void_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND void_no = '' "
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
        query:"SELECT payment_no,date,name,amount, "
          +" cash_account_id,void_no"
          +" FROM payment_void_sum "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND void_no = '' "
          +" ORDER BY date,payment_no"
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
    +TotalPagingLimit(indek)
    +'<table border=1 style="padding:10px;">'
      +'<th colspan="2">Date</th>'
      +'<th>Payment NO.</th>'
      +'<th>Payment Name</th>'
      +'<th>Amount</th>'
      +'<th>Void NO</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      var x;
      for (x in d){
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].payment_no+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].void_no+'</td>'
        +'<td align="center">'
            +'<button type="button" '
              +' name="select_'+indek+'"'
              +' class="icon_select" >'
            +'</button>'
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
    const m=this.mother;
    const n=document.getElementsByName('select_'+indek);
    const r=bingkai[indek].paket;
    const d=objectMany(r.fields,r.data);
    const p=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setPayment(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,payment_no,cash_account_id,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM payment_void_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND payment_no='"+payment_no+"'"
        +" AND cash_account_id='"+cash_account_id+"'"
        +" AND void_no = '' "
    },(paket)=>{
      return callBack(paket);
    });
  }
}


//eof : 154;101;129;149;
