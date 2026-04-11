/*
 * auth: budiono
 * date: sep-11, 11:48, mon-2023; new: 251;
 * edit: sep-12, 12:07, tue-2023; 
 * edit: sep-19, 21:08, tue-2023;
 * edit: sep-25, 15:36, mon-2023; 
 * edit: sep-27, 13:46, wed-2023; account_begins;
 * edit: sep-28, 17:46, thu-2023; customer_begins;
 * edit: oct-04, 17:51, wed-2023; vendor_begins;
 * edit: oct-12, 09:43, thu-2023; 
 * edit: oct-27, 10:54, fri-2023; purchase_orders;
 * edit: nov-02, 11:10, thu-2023; receive_inventory;
 * edit: nov-16, 08:28, thu-2023; payments;
 * edit: nov-17, 06:47, fri-2023; vendor_checks;
 * edit: dec-01, 14:00, fri-2023; quotes;
 * edit: dec-02, 12:14, sat-2023; sales_orders;
 * edit: dec-03, 07:26, sun-2023; invoices;
 * edit: dec-02, 10:11, mon-2023; receipts;
 * edit: dec-30, 22:15, sat-2023; 
 * edit: jan-05, 11:32, fri-2023; new concept with DOM;
 * -----------------------------; happy new year 2024;
 * edit: jan-09, 17:45, tue-2024; re-write with class;
 * edit: may-01, 20:05, wed-2024; mode-pop pertamax dgn basic sql;
 * edit: jun-26, 11:05, wed-2024; r3;
 * edit: sep-10, 16:46, tue-2024; r18;
 * edit: sep-25, 15:57, wed-2024; r19;
 */ 
 
'use strict';

class AccountLook {
  
  constructor(bigBos){
    this.url='account';
    this.title='Chart of Accounts';
    this.bigBos=bigBos;
    this.hideNew=true;
    this.hideExport=true;
    this.hideImport=true;
    this.hideMore=true;
    this.hideSelect=true;
    this.hideRefresh=true;
    this.hideHide=true;
    this.form=new ActionForm2(this);
    this.ac=-1;// ALL
  }
  
  accountClass(){
    if(this.ac==-1){
      return "";
    }else{
      var s=" AND class="+this.ac;
      if(this.ac==3) s+=" OR class=6 "// other income 
      if(this.ac==5) s+=" OR class=7 "// other expense
      return s;
    }
  }
  
  /*
   * @NAME : modePaging (form bentuk paging) 
   * @PARAM: indek_parent (indexs dari form)
   * @PARAM: id_kolom (id dari object) 
   * @PARAM: baris (id baris bila lebih dari satu object sama)
   * @PARAM: ac (account kelas dari chart)
   */ 
  
  getPaging(indek_parent,id_kolom,baris,ac){
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
    this.ac=ac;
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM accounts"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"      
        + this.accountClass()
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
        query:"SELECT account_id, name, class, "
          +" user_name, date_modified "
          +" FROM accounts"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          + this.accountClass()
          +" ORDER BY account_id"
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
      +'<b>[Class: '+array_account_class[this.ac] +']</b>'
      +content.message(indek)
      +totalPagingandLimit(indek)
      +'<table border=1 style="padding:10px;">'
        +'<th colspan="2">Account ID</th>'
        +'<th>Account Name</th>'
        +'<th>Account Class</th>'
        +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td>'+d[x].account_id+'</td>'
          +'<td>'+xHTML(d[x].name)+'</td>'
          +'<td align="center">'+array_account_class[d[x].class]
            +'</td>'
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
    //if(READ_PAGING) this.form.addPagingFn(indek); // here ...
    this.form.addPagingFn(indek);
    this.addSelectFn(indek,this.bigBos);
  }
  
  addSelectFn(indek,obj){
    const abc=this.bigBos;
    const n=document.getElementsByName('select_'+indek);
    const p=bingkai[indek].paket;
    const data=objectMany(p.fields,p.data);
    const indek_parent=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        abc.setAccount(indek_parent,data[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM accounts"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"      
        +" AND account_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
      +" FROM accounts "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
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
        query:"SELECT account_id, name, class, "
          +" user_name, date_modified "
          +" FROM accounts"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND account_id LIKE '%"+bingkai[indek].text_search+"%'"
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


// eof;202;124;184;188;228;
