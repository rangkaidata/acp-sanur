/*
 * auth: budiono;
 * new : nov-18, 08:53, sat-2023; new;
 * edit: jul-21, 19:57, sun-2024; r9;
 * edit: sep-29, 09:42, sun-2024; r19; check_void_sum;
 * -----------------------------; happy new year 2025;
 * edit: oct-26, 20:44, sun-2025; #80
 */ 
 
'use strict';

class VendorCheckLook {
  
  constructor(bigBos){
    this.url='vendor_checks';
    this.title='Vendor Checks';
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
  
  getPaging(indek_parent,id_kolom){
    bingkai[indek_parent].id_kolom=id_kolom;
//    bingkai[indek_parent].baris=baris;

    var tiket=JSON.parse(JSON.stringify(bingkai[indek_parent]));
    tiket.parent=indek_parent;
    tiket.modul=this.url;
    tiket.menu.name=this.title;
    tiket.ukuran.lebar=60;
    tiket.ukuran.tinggi=40;
    tiket.bisa.ubah=0;
    tiket.letak.atas=0;
    tiket.look_up=true;
    tiket.pop_up=true;
    
    var newReg=new BingkaiSpesial(tiket);
    var indek=newReg.show();
    this.form.modePaging(indek);
  }

  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM vendor_check_void_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND void_no=''"
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
        query:"SELECT cash_account_id,"
          +" check_no,check_date,check_name,check_amount"
          +" FROM check_void_sum "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND void_no=''"
          +" ORDER BY cash_account_id,check_date,check_no"
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
      +TotalPagingLimit(indek)
      +'<table border=1 style="padding:10px;">'
        +'<th colspan="2">Date</th>'
        +'<th>Check NO.</th>'
        +'<th>Name</th>'
        +'<th>Amount</th>'
        +'<th>Select</th>';

    if (p.err.id===0){
      var x
      for (x in d){
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td align="left">'+tglWest(d[x].check_date)+'</td>'
          +'<td align="left">'+d[x].check_no+'</td>'
          +'<td align="left">'+xHTML(d[x].check_name)+'</td>'
          +'<td align="right">'+d[x].check_amount+'</td>'
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
    this.addSelectFn(indek,this.bigBos);
  }
  
  addSelectFn(indek,obj){
    var abc=this.bigBos;
    var n=document.getElementsByName('select_'+indek);
    var p=bingkai[indek].paket;
    var data=objectMany(p.fields,p.data);
    var indek_parent=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        abc.setCheck(indek_parent,data[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,cash_account_id,check_no,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM check_void_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND cash_account_id='"+cash_account_id+"'"
        +" AND check_no='"+check_no+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
}



// eof:  146;151;
