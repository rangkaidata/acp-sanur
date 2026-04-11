/*
 * name: budiono
 * date: sep-04, 15:08, mon-2023; new;82;
 * edit: aug-31, 15:56, sat-2024; r14;
 * -----------------------------; happy new year 2025;
 * edit: jan-02, 16:28, thu-2025; #32; properties;
 * edit: feb-14, 10:28, fri-2025; #40; new properties;
 * edit: mar-10, 15:50, mon-2025; #43; deep folder;
 * edit: mar-22, 17:02, sat-2025; #44; my_menu;
 * edit: aug-14, 17:38, thu-2025; #67; add page rows;
 */

'use strict';

var Setting={
  table_name:'setting',
  company_id:""
}

Setting.company=new CompanyLook(Setting);

Setting.show=(tiket)=>{
  tiket.modul=Setting.table_name;

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    getPath(indek,Setting.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        Setting.formUpdate(indek);
      });
    });
  }else{
    show(baru);
  }  
}

Setting.formUpdate=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  Setting.formEntry(indek);
  Setting.readOne(indek,()=>{
    toolbar.edit(indek,()=>{Setting.formEdit(indek);});
    toolbar.refresh(indek,()=>{Setting.formUpdate(indek);});
    Setting.view(indek,true);
  });  
}

Setting.formEdit=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Setting.formUpdate(indek);});
  toolbar.save(indek,()=>{Setting.saveExecute(indek);});
  toolbar.delet(indek,()=>{Setting.deleteExecute(indek);});
  toolbar.properties(indek,()=>{Setting.properties(indek);});
  Setting.view(indek,false);
};

Setting.formEntry=(indek)=>{
  var html='<div style="margin:1rem;">'
    +'<div id="msg_'+indek+'" style="margin:0.5rem;"></div>'
    +'<form autocomplete="off">'
    
    +'<ul>'
    +'<li><label>Timeout Login</label>'
      +'<select id="timeout_'+indek+'" '
      +' name="element_disabled_'+indek+'">';
        for(var i=0;i<array_expired_mode.length;i++){
          html+='<option>'+array_expired_mode[i]+'</option>';
        }
      html+='</select>'
    +'</li>'
    
    +'<li><label>Warn</label>'
      +'<label>'
      +'<input type="checkbox" '
      +' id="warn_'+indek+'"'
      +' name="element_disabled_'+indek+'">'
      +' Warn if out of stock'
      +'</label>'
      +'</li>'
      
    +'<li><label>User Option</label>'
      +'<label>'
      +'<input type ="checkbox" '
      +' id="max_layout_'+indek+'"'
      +' name="element_disabled_'+indek+'">'
      +' Maximize Layout'
      +'</label>'
      +'</li>'
    +'<li><label>&nbsp;</label>'
      +'<input type ="radio" '
        +' id="theme_1_'+indek+'" '
        +' name="theme_'+indek+'"> Theme 1'
      +'<input type ="radio" '
        +' id="theme_2_'+indek+'" '
        +' name="theme_'+indek+'"> Theme 2'
      +'<input type ="radio" '
        +' id="theme_3_'+indek+'" '
        +' name="theme_'+indek+'"> Theme 3'
      +'</li>'
      
    +'<li><label>Company ID</label>'
      +'<label>'
      +'<input type="text" '
      +' id="company_id_'+indek+'"'
      +' name="element_disabled_'+indek+'" >'
      
      +'<button type="button" '
        +' id="company_btn_'+indek+'"'
        +' name="element_disabled_'+indek+'"'
        +' onclick="Setting.company.getPaging(\''+indek+'\''
        +',\'company_id_'+indek+'\')"'
        +' class="btn_find">'
      +'</button>'
      +'</label>'
      +'</li>'
      
    +'<li><label>Page Rows</label>'
      +'<label>'
        +'<select id="page_rows_'+indek+'" '
        +' name="element_disabled_'+indek+'">'
          +getPageLimit(indek,0)
        +'</select>';
      +'</label>'
    +'</li>'
      
    +'</ul>'
    +'</form>'
    +'<p><label><i>&#10020 Relogin for these changes to take effect.</i>'
    +'</label></p>';
    +'</div>';

  content.html(indek,html);
  document.getElementById("timeout_"+indek).focus;
}

Setting.view=(indek,lock)=>{
  var a=document.getElementsByName('element_disabled_'+indek);
  var b=document.getElementsByName('theme_'+indek);
  var i;
  
  for(i=0;i<a.length;i++){
    document.getElementById( a[i].id ).disabled=lock;
  }
  
  for(i=0;i<b.length;i++){
    document.getElementById( b[i].id ).disabled=lock;
  }
}

Setting.readOne=(indek,eop)=>{
  db.execute(indek,{
    query:"SELECT * FROM setting"
  },(paket)=>{
    if (paket.count>0){
      const d=objectOne(paket.fields,paket.data);
      setEI('timeout_'+indek, parseInt(d.timeout_login));
      setEC('warn_'+indek, d.warn_out_of_stock);
      setEC('max_layout_'+indek, d.user_option.max_layout);
      setEV('company_id_'+indek, d.company_id);
      setEI('page_rows_'+indek, parseInt(d.page_rows));
      Setting.company_id=d.company_id;
    }
    message.none(indek);
    return eop();
  });
}

Setting.saveExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM setting "
  },(paket)=>{
    if(paket.count==0){
      Setting.createExecute(indek);
    }else{
      Setting.updateExecute(indek);
    }
    Setting.company_id=getEV('company_id_'+indek);
  });
}

Setting.createExecute=(indek)=>{
  var user_option=JSON.stringify({
    max_layout:getEC('max_layout_'+indek),
    theme:5,
  })

  db.execute(indek,{
    query:"INSERT INTO setting"
      +"(timeout_login,user_option,warn_out_of_stock"
      +",company_id,page_rows"
      +") VALUES"
      +"('"+getEI('timeout_'+indek)+"'"
      +",'"+user_option+"'"
      +",'"+getEC('warn_'+indek)+"'"
      +",'"+getEV('company_id_'+indek)+"'"
      +",'"+getEI('page_rows_'+indek)+"'"
      +")"
  },(p)=>{
    if(p.err.id==0) Setting.finalPath(indek);
  });
}

Setting.updateExecute=(indek)=>{
  var user_option=JSON.stringify({
    max_layout:getEC('max_layout_'+indek),
    theme:5,
  })
  db.execute(indek,{
    query:"UPDATE setting "
      +" SET timeout_login='"+getEI('timeout_'+indek)+"'"
      +",warn_out_of_stock='"+getEC('warn_'+indek)+"'"
      +",company_id='"+getEV('company_id_'+indek)+"'"
      +",user_option='"+user_option+"'"
      +",page_rows='"+getEI('page_rows_'+indek)+"'"
  },(p)=>{
    if(p.err.id==0) Setting.finalPath(indek);
  });
}

Setting.deleteExecute=(indek)=>{
  bingkai[indek].metode=MODE_DELETE
  db.execute(indek,{
    query:"DELETE FROM setting "
    +" where user_name='"+bingkai[indek].login.user_name+"'"
  },(p)=>{
    if(p.err.id==0) Setting.finalPath(indek);
  });
}

Setting.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM setting"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Setting.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Setting.formUpdate(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Setting.properties(indek);})
  }
}

Setting.setCompany=(indek,d)=>{
  setEV('company_id_'+indek,d.company_id);
}



// eof:82;199;187;219;
