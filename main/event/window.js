/*
 * auth: budiono
 * date: sep-04, 21:47, mon-2023; new;33;
 */ 

document.onkeydown=function (t) {
  if(global.tabPasif==1){
    if(t.which == 9){// no tab 
      console.log('no-tab');
      return false;
    }
  }
}

window.setInterval(updateJam,1000);

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  console.log('window.onclick');
  if(event.target.className!=='dropbtn'){
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      openDropdown.style.display="none";
      ui.menu_bar_show=false;
    }
  }
} 

window.addEventListener('resize',()=>{
  console.log('window.addEventListener');
  ui.cekUkuranRem();
});
// eof:33;
