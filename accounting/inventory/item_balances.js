/*
 * name: budiono;
 * code: ...
 * path: /accounting/inventory/item_balances.js;
 * --------------------------------------------;
 * date: oct-02, 17:25, mon-2023; new;
 * edit: oct-15, 19:50, sun-2023; 
 * edit: oct-16, 10:03, mon-2023; 
 * edit: nov-24, 15:18, fri-2023; ribuan;
 * edit: dec-14, 17:08, thu-2023; re-check;
 * edit: dec-18, 12:07, mon-2023; add to_ref;
 * edit: dec-24, 19:07, sun-2023; costing_methods;
 * -----------------------------; happy new year 2024;
 * edit: jan-13, 10:13, sat-2024; re-view;
 * edit: oct-17, 14:21, thu-2024; #22;
 * edit: oct-21, 15:47, mon-2024; #23;
 * edit: oct-22, 12:11, thu-2024; #23; add search();
 * edit: mar-28, 14:46, fri-2025; #45; ctables;cstructure;
 * edit: apr-23, 17:56, wed-2025; #50; add total
 * edit: jun-18, 11:57, wed-2025; #61; sort;
 */ 

'use strict';

var ItemBalances={}

ItemBalances.url='item_balances';
ItemBalances.form=new ActionForm2(ItemBalances);

ItemBalances.show=(karcis)=>{
  karcis.modul=ItemBalances.url;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    ItemBalances.form.modePaging(indek);
  }else{
    show(baru);
  }
}

ItemBalances.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +",SUM(quantity) AS quantity"
    +",SUM(total_cost) AS total_cost"
    +" FROM item_balances"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND company_id='"+bingkai[indek].company.id+"'"
    //+" AND amount_due != 0" // NOT EQUAL
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].quantity=paket.data[0][1];
      bingkai[indek].total_cost=paket.data[0][2];
    }
    return callback()
  });
}

ItemBalances.readPaging=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek,()=>{ui.CLOSE();});  
  toolbar.search(indek,()=>{ItemBalances.form.modeSearch(indek)});
  toolbar.download(indek,()=>{ItemBalances.form.modeExport(indek)});
  toolbar.refresh(indek,()=>{ItemBalances.readPaging(indek)});
  toolbar.more(indek,()=>{Menu.more(indek)});

  bingkai[indek].metode=MODE_READ;
  ItemBalances.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT location_id,item_id,name,cost_method,"
        +" quantity,unit_cost,total_cost"
        +" FROM item_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        //+" AND amount_due != 0"
        +" ORDER BY item_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ItemBalances.readShow(indek);
    });
  })
}

ItemBalances.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var sub_quantity=0;
  var sub_total=0;
  var quantity=bingkai[indek].quantity;
  var total_cost=bingkai[indek].total_cost;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=0>'
    +'<tr>'
    +'<th colspan="3">Description</th>'
    +'<th>Item ID</th>'
    +'<th>Method</th>'
    +'<th>Quantity</th>'
    +'<th>Unit Cost</th>'
    +'<th>Total Cost</th>'  
    +'<th colspan="2">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      sub_quantity+=parseFloat(d[x].quantity);
      sub_total+=parseFloat(d[x].total_cost);
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].location_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+d[x].item_id+'</td>'
        +'<td align="left">'+array_cost_method[d[x].cost_method]+'</td>'
        
        +'<td align="right">'+(d[x].quantity)+'</td>'
        +'<td align="right">'+ribuan(d[x].unit_cost)+'</td>'
        +'<td align="right">'+ribuan(d[x].total_cost)+'</td>'
          
        +'<td align="center"><button type="button" id="btn_detail" '
          +' onclick="ItemBalances.formDetail(\''+indek+'\''
          +',\''+d[x].item_id+'\''
          +',\''+d[x].location_id+'\''
          +');"></button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='<tr>'
      +'<td colspan="4">&nbsp;</td>'
      +'<td>Subtotal:</td>'
      +'<td align="right">'+ribuan(sub_quantity)+'</td>'
      +'<td>&nbsp;</td>'
      +'<td align="right">'+ribuan(sub_total)+'</td>'
      +'<td colspan="2">&nbsp;</td>'
    +'</tr>'
    +'<tr>'
      +'<td colspan="4">&nbsp;</td>'
      +'<td>Total:</td>'
      +'<td align="right"><strong>'+ribuan(quantity)+'</strong></td>'
      +'<td>&nbsp;</td>'
      +'<td align="right"><strong>'+ribuan(total_cost)+'</strong></td>'
      +'<td colspan="2">&nbsp;</td>'
    +'</tr>'
  html+='</table></div>';
  
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ItemBalances.form.addPagingFn(indek);
}

ItemBalances.formDetail=(indek,item_id,location_id)=>{
  bingkai[indek].item_id=item_id;
  bingkai[indek].location_id=location_id;
  
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.refresh(indek,()=>{ItemBalances.readOne(indek);});
  toolbar.back(indek,()=>ItemBalances.readPaging(indek));
  ItemBalances.readOne(indek);
}

ItemBalances.readOne=(indek)=>{
  db.run(indek,{
    query:"SELECT location_id,item_id,"
      +" reference, date,"
      +" quantity,unit_cost,total_cost,table_name,onhand_no"
      +" FROM item_costing"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
      +" AND location_id='"+bingkai[indek].location_id+"'"
      //+" AND total_cost != 0"
      +" ORDER BY date,onhand_date,date_modified,reference"

  },(p)=>{
          
    var quantity=0;
    var subtotal=0;
    var d=objectMany(p.fields,p.data);
    var n=bingkai[indek].paging.offset;  

    var html='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
    
    html+='<table border=1>'
      +'<tr>'
      +'<th colspan="3">Item ID</th>'
      +'<th>Refernce #</th>'
      +'<th>Date</th>'
      +'<th>Quantity</th>'
      +'<th>Unit Cost</th>'
      +'<th>Total</th>'
      +'<th>Onhand</th>'
      +'<th>Source</th>'
      +'</tr>';
      
    if (p.err.id===0){
      var x;
      for (x in d) {
        subtotal+=Number(d[x].total_cost);
        quantity+=Number(d[x].quantity);
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td>'+d[x].location_id+'</td>'
          +'<td>'+d[x].item_id+'</td>'
          +'<td>'+d[x].reference+'</td>'
          +'<td>'+tglWest(d[x].date)+'</td>'
          +'<td align="right">'+(d[x].quantity)+'</td>'
          +'<td align="right">'+(d[x].unit_cost)+'</td>'
          +'<td align="right">'+(d[x].total_cost)+'</td>'
          +'<td align="left">'+d[x].onhand_no+'</td>'
          +'<td align="left">'+d[x].table_name+'</td>'
          +'</tr>';
      }
      html+='<tr>'
        +'<td colspan="5" align="right"><b>Subtotal</b></td>'
        +'<td align="right"><b>'+ribuan(quantity)+'</b></td>'
        +'<td>&nbsp;</td>'
        +'<td align="right"><b>'+ribuan(subtotal)+'</b></td>'
        +'<td>&nbsp;</td>'
        +'<td>&nbsp;</td>'
        +'</tr>'
    }
    html+='</table></div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek, p);
    statusbar.message(indek, p); 
  });
}

ItemBalances.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM item_balances "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ItemBalances.search=(indek)=>{
  ItemBalances.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT location_id,item_id,name,cost_method,"
        +" quantity,unit_cost,total_cost"
        +" FROM item_balances"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ItemBalances.readShow(indek);
    });
  });
}

ItemBalances.exportExecute=(indek)=>{
  var sql={
    "select": "location_id,item_id,name,cost_method,"
      +" quantity,unit_cost,total_cost",
    "from": "item_balances",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "order_by": "item_id",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'item_balances');
}




// eof: 221;201;253;271;
