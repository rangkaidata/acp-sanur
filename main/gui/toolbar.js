/*
 * auth: budiono
 * date: aug-31, 09:12, thu-2023; new; 13;
 * edit: sep-04, 21:52, mon-2023; add;126;
 * edit: sep-06, 21:14, wed-2023; 
 * edit: sep-25, 12:41, 
 * edit: dec-27, 21:21, wed-2023; add select button;
 * edit: nov-15, 22:32, fri-2024; add lock;
 * edit: dec-09, 14:49, mon-2024; add title+close button+saveas;
 * edit: dec-14, 15:17, sat-2024; add button properties;
 * edit: apr-26, 20:41, sat-2025; add next button
 * edit: apr-27, 16:29, sun-2025; add restore button;
 * edit: may-08, 14:59, thu-2025; add filter button;
 * edit: may-08, 16:10, thu-2025; add print button;
 * -----------------------------; happy new year 2026;
 * edit: mar-16, 14:14, wed-2026; #91; add prev,next;
 */

'use strict';

toolbar.hide=function(indek){
  document.getElementById("frm_toolbar_hide_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_hide_"+indek).onclick=function(){
    ui.hideMe(indek);
  }
}

toolbar.close=function(indek){
  document.getElementById("frm_toolbar_close_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_close_"+indek).onclick=function(){
    if(bingkai[indek].modal==0){// non modal==0;
      ui.CLOSE(indek);
      ui.updateHome();
    }else{// modal==1;
      ui.CLOSE_POP(indek);
    }
  }
}

toolbar.none=function(indek){// 1
  document.getElementById("frm_toolbar_hide_"+indek).style.display="none";
  document.getElementById("frm_toolbar_close_"+indek).style.display="none";
  document.getElementById("frm_toolbar_back_"+indek).style.display="none";
  document.getElementById("frm_toolbar_previous_"+indek).style.display="none";
  document.getElementById("frm_toolbar_next_"+indek).style.display="none";
  document.getElementById("frm_toolbar_refresh_"+indek).style.display="none";
  document.getElementById("frm_toolbar_new_"+indek).style.display="none";
  document.getElementById("frm_toolbar_restore_"+indek).style.display="none";
  document.getElementById("frm_toolbar_save_"+indek).style.display="none";
  document.getElementById("frm_toolbar_saveas_"+indek).style.display="none";
  document.getElementById("frm_toolbar_search_"+indek).style.display="none";
  document.getElementById("frm_toolbar_more_"+indek).style.display="none";
  document.getElementById("frm_toolbar_delete_"+indek).style.display="none";
  document.getElementById("frm_toolbar_export_"+indek).style.display="none";
  document.getElementById("frm_toolbar_import_"+indek).style.display="none";
  document.getElementById("frm_toolbar_select_"+indek).style.display="none";
  document.getElementById("frm_toolbar_edit_"+indek).style.display="none";
  document.getElementById("frm_toolbar_cancel_"+indek).style.display="none";    
  document.getElementById("frm_toolbar_execute_"+indek).style.display="none";
  document.getElementById("frm_toolbar_lock_"+indek).style.display="none";
  document.getElementById("frm_toolbar_filter_"+indek).style.display="none";
  document.getElementById("frm_toolbar_properties_"+indek).style.display="none";
  document.getElementById("frm_toolbar_preview_"+indek).style.display="none";
  document.getElementById("frm_toolbar_print_"+indek).style.display="none";
  document.getElementById("frm_toolbar_copy_"+indek).style.display="none";
  document.getElementById("frm_toolbar_paste_"+indek).style.display="none";
}

toolbar.refresh=function(indek,func){
  document.getElementById("frm_toolbar_refresh_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_refresh_"+indek).onclick=func;
}

toolbar.search=function(indek,func){
  document.getElementById("frm_toolbar_search_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_search_"+indek).onclick=func;
}

toolbar.wait=function(nomer,display){// 2
  document.getElementById("frm_toolbar_back_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_previous_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_next_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_refresh_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_new_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_restore_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_save_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_saveas_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_search_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_more_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_delete_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_export_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_import_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_select_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_edit_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_cancel_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_execute_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_lock_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_properties_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_print_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_filter_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_copy_"+nomer).disabled=display;
  document.getElementById("frm_toolbar_paste_"+nomer).disabled=display;
}

toolbar.neuu=function(indek,func){
  document.getElementById("frm_toolbar_new_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_new_"+indek).onclick=func;
}

toolbar.neuu.display=function(indek){
  document.getElementById("frm_toolbar_new_"+indek).style.display="inline";
}

toolbar.more=function(indek,func){
  document.getElementById("frm_toolbar_more_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_more_"+indek).onclick=func;
}

toolbar.copy=function(indek,func){
  document.getElementById("frm_toolbar_copy_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_copy_"+indek).onclick=func;
}

toolbar.paste=function(indek,func){
  document.getElementById("frm_toolbar_paste_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_paste_"+indek).onclick=func;
}

toolbar.back=function(indek,func){
  document.getElementById("frm_toolbar_back_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_back_"+indek).onclick=func;
}

toolbar.previous=function(indek,func){
  document.getElementById("frm_toolbar_previous_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_previous_"+indek).onclick=func;
}

toolbar.next=function(indek,func){
  document.getElementById("frm_toolbar_next_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_next_"+indek).onclick=func;
}

toolbar.filter=function(indek,func){
  document.getElementById("frm_toolbar_filter_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_filter_"+indek).onclick=func;
}

toolbar.save=function(indek,func){
  document.getElementById("frm_toolbar_save_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_save_"+indek).disabled=false;
  document.getElementById("frm_toolbar_save_"+indek).onclick=func;
}

toolbar.save.disabled=function(indek){
  document.getElementById("frm_toolbar_save_"+indek).disabled = true;
}

toolbar.save.none=function(indek){
  document.getElementById("frm_toolbar_save_"+indek).style.display="none";
}

toolbar.delet=function(indek,func){
  document.getElementById("frm_toolbar_delete_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_delete_"+indek).disabled=false;
  document.getElementById("frm_toolbar_delete_"+indek).onclick=func;
}

toolbar.delet.disabled=function(indek){
  document.getElementById("frm_toolbar_delete_"+indek).disabled=true;
}

//toolbar.next.disabled=function(indek){
  //document.getElementById("frm_toolbar_next_"+indek).disabled=true;
//}

toolbar.download=function(indek,func){
  document.getElementById("frm_toolbar_export_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_export_"+indek).disabled=false;
  document.getElementById("frm_toolbar_export_"+indek).onclick=func;
}

toolbar.upload=function(indek,func){
  document.getElementById("frm_toolbar_import_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_import_"+indek).disabled=false;
  document.getElementById("frm_toolbar_import_"+indek).onclick=func;
}

toolbar.select=function(indek,func){
  document.getElementById("frm_toolbar_select_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_select_"+indek).disabled=false;
  document.getElementById("frm_toolbar_select_"+indek).onclick=func;
}

toolbar.edit=function(indek,func){
  document.getElementById("frm_toolbar_edit_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_edit_"+indek).disabled=false;
  document.getElementById("frm_toolbar_edit_"+indek).onclick=func;
}

toolbar.cancel=function(indek,func){
  document.getElementById("frm_toolbar_cancel_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_cancel_"+indek).onclick=func;
}

toolbar.preview=function(indek,func){
  document.getElementById("frm_toolbar_preview_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_preview_"+indek).disabled=false;
  document.getElementById("frm_toolbar_preview_"+indek).onclick=func;
}

toolbar.execute=function(indek,func){
  document.getElementById("frm_toolbar_execute_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_execute_"+indek).onclick=func;
}

toolbar.lock=function(indek,func){
  document.getElementById("frm_toolbar_lock_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_lock_"+indek).onclick=func;
}

toolbar.saveas=function(indek,func){
  document.getElementById("frm_toolbar_saveas_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_saveas_"+indek).disabled=false;
  document.getElementById("frm_toolbar_saveas_"+indek).onclick=func;
}

toolbar.saveas.disabled=function(indek){
  document.getElementById("frm_toolbar_saveas_"+indek).disabled = true;
}

toolbar.properties=function(indek,func){
  document.getElementById("frm_toolbar_properties_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_properties_"+indek).onclick=func;
}

toolbar.restore=function(indek,func){
  document.getElementById("frm_toolbar_restore_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_restore_"+indek).onclick=func;
}

toolbar.print=function(indek,func){
  document.getElementById("frm_toolbar_print_"+indek).style.display="inline";
  document.getElementById("frm_toolbar_print_"+indek).onclick=func;
}

//----NONE----//

toolbar.saveas.none=function(indek){
  document.getElementById("frm_toolbar_saveas_"+indek).style.display="none";
}

toolbar.neuu.none=function(indek){
  document.getElementById("frm_toolbar_new_"+indek).style.display="none";
}

toolbar.properties.none=function(indek){
  document.getElementById("frm_toolbar_properties_"+indek).style.display="none";
}

toolbar.more.none=function(indek){
  document.getElementById("frm_toolbar_more_"+indek).style.display="none";
}

toolbar.close.none=function(indek){
  document.getElementById("frm_toolbar_close_"+indek).style.display="none";
}

// eof 13;126;
