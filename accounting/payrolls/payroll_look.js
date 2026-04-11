/*
 * auth: budiono;
 * new : jan-07, 20:59, wed-2026; #87;
 */ 
 
'use strict';

class PayrollLook {
  
  constructor(mother){
    this.mother=mother;
    this.url='payroll_entry';
    this.title='Payroll Entry';
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
        +" FROM payroll_void_sum"
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
        query:"SELECT cash_account_id,payroll_no,payroll_date,"
          +"employee_name,payroll_amount,void_no"
          +" FROM payroll_void_sum "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND void_no = '' "
          +" ORDER BY payroll_date,payroll_no"
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
      +'<th>Payroll NO.</th>'
      +'<th>Payroll Name</th>'
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
        +'<td align="left">'+d[x].payroll_no+'</td>'
        +'<td align="left">'+xHTML(d[x].employee_name)+'</td>'
        +'<td align="right">'+d[x].payroll_amount+'</td>'
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
        m.setPayroll(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,payroll_no,cash_account_id,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM payroll_void_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND payroll_no='"+payroll_no+"'"
        +" AND cash_account_id='"+cash_account_id+"'"
        +" AND void_no = '' "
    },(paket)=>{
      return callBack(paket);
    });
  }
}


//eof : 154;101;129;149;
