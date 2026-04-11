/*
 * auth: budiono;
 * code: I2;
 * path: /accounting/sales/convert_quotes.js;
 * -----------------------------------------;
 * date: dec-01, 20:37, fri-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-20, 11:09, sat-2024; mringkas;
 * edit: jan-22, 11:19, mon-2024; add delete button;
 * edit: aug-11, 17:38, sun-2024; r13; 
 * edit: sep-30, 19:21, mon-2024; #19;
 * edit: oct-15, 16:01, tue-2024; #22; add convert_date;
 * edit: dec-02, 16:12, mon-2024; #27; locked();
 * edit: dec-30, 21:42, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 08:07, tue-2025; #41; file_id;
 * edit: mar-14, 16:23, fri-2025; #43; deep-folder;
 * edit: mar-27, 08:56, thu-2025; #45; ctables;cstructure;
 * edit: aug-15, 21:02, fri-2025; #68; add date obj;
 */ 

'use strict';

var ConvertQuotes={};

ConvertQuotes.table_name='converts';
ConvertQuotes.form=new ActionForm2(ConvertQuotes);
ConvertQuotes.quote=new QuoteLook(ConvertQuotes);

ConvertQuotes.show=(karcis)=>{
  karcis.modul=ConvertQuotes.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      ConvertQuotes.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

ConvertQuotes.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM converts"
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

ConvertQuotes.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ConvertQuotes.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT "
        +" quote_no,convert_no,date,amount,"
        +" customer_id,name,"
        +" modul_id,"
        +" user_name,date_modified"
        +" FROM converts"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,convert_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ConvertQuotes.readShow(indek);
    });
  })
}

ConvertQuotes.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table>'
    +'<tr>'
      +'<th colspan="2">Quote #</th>'
      +'<th>Convert to</th>'
      +'<th>Convert #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Customer Name</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].quote_no+'</td>'
        +'<td align="center">['+d[x].modul_id+']</td>'
        +'<td align="left">'+d[x].convert_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'
          +Number(d[x].amount).toFixed(2)+'</td>'
        +'<td align="left">'+d[x].name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="ConvertQuotes.formDelete(\''+indek+'\''
          +',\''+d[x].customer_id+'\''
          +',\''+d[x].convert_no+'\');">'
          +'</button>'
          +'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ConvertQuotes.form.addPagingFn(indek);
}

ConvertQuotes.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;

  var html='<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)

    +'<form autocomplete="off">'
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;">'
      
      +'<div>'      
        +'<ul>'
        +'<li><label>Customer ID:</label>'
          +'<input type="text" '
          +' id="customer_id_'+indek+'"'
          +'  size="9"'
          +' disabled>'
        +'</li>'

        +'<li><label>Quote No.:</label>'
          +'<input type="text"'
            +' id="quote_no_'+indek+'"'
            +' size="9"'
            +' disabled>'
          +'<button type="button" id="btn_find" '
            +' onclick="ConvertQuotes.quote.getPaging(\''+indek+'\''
            +',\'quote_no_'+indek+'\')">'
          +'</button>'
        +'</li>'
          
        +'<li><label>Date:</label>'
          +'<input type="text"'
            +' id="quote_date_'+indek+'"'
            +' size="9"'
            +' disabled>'
        +'</li>'

        +'<li><label>Amount:</label>'
          +'<input type="text"'
            +' id="quote_total_'+indek+'"'
            +' disabled'
            +' size="9"'
            +' style="text-align:center;">'
        +'</li>'
          
        +'</ul>'
      +'</div>'
      
      +'<div>'
        +'<ul>'
          +'<li><label><b>Convert to:</b></label></li>'
          +'<li><label>'
            +'<input type="radio" checked="check"'
              +' id="sales_order_'+indek+'"'
              +' value="sales_orders"'
              +' name="quote_convert_'+indek+'">Sales Order</label>'
          +'</li>'
          
          +'<li><label>'
            +'<input type="radio"'
              +' id="sales_invoice_'+indek+'"'
              +' value="invoices"'
              +' name="quote_convert_'+indek+'">Invoices</label>'
          +'</li>'
        
          +'<li><label>Convert No.:</label>'
            +'<input type="text"'
              +' id="convert_no_'+indek+'"'
              +' size="9">'
          +'</li>'
          
          +'<li><label>Date:</label>'
            +'<input type="date"'
              +' id="date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'date\')"'
              +' size="10">'
          +'</li>'

          +'<li><label>Note:</label>'
            +'<input type="text"'
              +' id="convert_note_'+indek+'"'
              +' size="20">'
          +'</li>'

        +'</ul>'
      +'</div>'

    +'</div>'
    +'</form>'
  +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('convert_no_'+indek).focus();
  
  setEV('date_'+indek,tglSekarang() );
  setEV('date_fake_'+indek,tglWest(tglSekarang()) );
}

ConvertQuotes.setQuote=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom, d.quote_no );
  setEV('customer_id_'+indek, d.customer_id );
  setEV('quote_date_'+indek, tglWest(d.date) );
  setEV('quote_total_'+indek, d.amount );
  
  setEV('convert_no_'+indek, d.quote_no+'c');
  setEV('convert_note_'+indek, 'add note for this convert.' );
}

ConvertQuotes.createExecute=(indek)=>{
  var radio=document.getElementsByName('quote_convert_'+indek);
  var quote_convert_no;
  var modul_id;
  
  for(var i=0;i<radio.length;i++){
    if(radio[i].checked){
      modul_id=radio[i].value;
    }
  }
   
  db.execute(indek,{
    query:"INSERT INTO converts"
      +"(admin_name,company_id,customer_id"
      +",quote_no,modul_id,convert_no,date,note"
      +") "
      +"VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('customer_id_'+indek)+"'"
      +",'"+getEV('quote_no_'+indek)+"'"
      +",'"+modul_id+"'"
      +",'"+getEV('convert_no_'+indek)+"'"
      +",'"+getEV('date_'+indek)+"'"
      +",'"+getEV('convert_note_'+indek)+"'"
      +")"
  });
}

ConvertQuotes.exportExecute=(indek)=>{
  var table_name=ConvertQuotes.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

ConvertQuotes.readOne=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT *"
      +" FROM converts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND convert_no='"+bingkai[indek].convert_no+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_id_'+indek, d.customer_id);
      setEV('quote_no_'+indek, d.quote_no);
      setEV('quote_date_'+indek, tglWest((d.quote_date))) ;
      setEV('quote_total_'+indek, d.amount);
      setEV('convert_no_'+indek, d.convert_no);
      setEV('date_'+indek, d.date);
      setEV('date_fake_'+indek, tglWest(d.date));
      setEV('convert_note_'+indek, d.note);
      
      if(d.modul_id=='invoices'){
        document.getElementById('sales_invoice_'+indek).checked=true;
      }else{
        document.getElementById('sales_order_'+indek).checked=true;
      }
      message.none(indek);
    }
    return callback();
  });
}

ConvertQuotes.formDelete=(indek,customer_id,convert_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].convert_no=convert_no;
  ConvertQuotes.form.modeDelete(indek);
}

ConvertQuotes.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM converts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND convert_no='"+bingkai[indek].convert_no+"'"
  },(p)=>{
    if(p.err.id==0) ConvertQuotes.deadPath(indek);
  });
}

ConvertQuotes.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO converts"
        +"(admin_name,company_id,customer_id"
        +",quote_no,modul_id,convert_no,note"
        +") "
        +"VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // customer_id
        +",'"+d[i][2]+"'" // qote_no
        +",'"+d[i][3]+"'" // modul_id
        +",'"+d[i][4]+"'" // convert_no
        +",'"+d[i][5]+"'" // note
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

ConvertQuotes.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT quote_no,convert_no,date,amount,"
      +" customer_id,name,"
      +" modul_id,"
      +" user_name,date_modified"
      +" FROM converts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,quote_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ConvertQuotes.selectShow(indek);
  });
}

ConvertQuotes.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border="1">'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
        +'</td>'
      +'<th colspan="2">Quote #</th>'
      +'<th>Convert to</th>'
      +'<th>Convert #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Customer Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'"'
        +' value="'+d[x].location_id+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].quote_no+'</td>'
      +'<td align="center">['+d[x].modul_id+']</td>'
      +'<td align="left">'+d[x].convert_no+'</td>'
      +'<td align="center">'+tglWest(tglInt2(d[x].date))+'</td>'
      +'<td align="right">'
        +Number(d[x].amount).toFixed(2)+'</td>'
      +'<td align="left">'+d[x].name+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

ConvertQuotes.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM converts"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id='"+d[i].customer_id+"'"
          +" AND convert_no='"+d[i].convert_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

ConvertQuotes.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,customer_id,convert_no,date_created"
      +" FROM converts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND convert_no='"+bingkai[indek].convert_no+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        ConvertQuotes.table_name,"/",
        d.company_id,"/",
        d.customer_id,"/",
        d.convert_no);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

ConvertQuotes.duplicate=(indek)=>{
  var id='copy_of '+getEV('convert_no_'+indek);
  setEV('convert_no_'+indek,id);
  focus('convert_no_'+indek);
}

ConvertQuotes.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ConvertQuotes.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ConvertQuotes.properties(indek);})
  }
}





// eof: 305;229;344;463;517;494;494;498;
