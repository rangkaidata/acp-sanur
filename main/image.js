/*
 * name: budiono
 * date: sep-04, 14:07, mon-2023; new;56;
 * edit: nov-13, 22:20, wed-2024; #26; company_logo;
 * edit: nov-14, 22:26, thu-2024; #26; user_photo;
 */
  
'use strict';

function loadFileLogo(event,nomer){
  const output = document.getElementById('folder_image_'+nomer);
  output.src = URL.createObjectURL(event.target.files[0]);
  document.getElementById('company_logo_'+nomer).value=event.target.files[0].name;
}

function loadFilePhoto(event,nomer){
  const output = document.getElementById('folder_image_'+nomer);
  output.src = URL.createObjectURL(event.target.files[0]);
  document.getElementById('user_photo_'+nomer).value=event.target.files[0].name;
}

function noLogo(nomer){
  document.getElementById('folder_image_'+nomer).src=bingkai[0].server.url+"logo";
  document.getElementById('company_logo_'+nomer).value="";
}

function noPhoto(nomer){
  document.getElementById('folder_image_'+nomer).src=bingkai[0].server.url+"photo";
  document.getElementById('user_photo_'+nomer).value="";
}

function uploadLogo(indek){
  var form=document.getElementById('form_'+indek);
  var formData=new FormData(form);
  
  formData.append('login_id',bingkai[indek].login.id);
  formData.append('company_id',bingkai[indek].company_id);

//  fetch("http://localhost:8080/logo/upload", { 
  fetch(bingkai[indek].server.url+"logo/upload", { 
    method: "POST",
    body: formData,
  }).then((response)=>{
    
  }).catch((error)=>{
    
  });
}

function uploadPhoto(indek){
  var form=document.getElementById('form_'+indek);
  var formData=new FormData(form);
  
  formData.append('login_id',bingkai[indek].login.id);

//  fetch("http://localhost:8080/photo/upload", { 
  fetch(bingkai[indek].server.url+"photo/upload", { 
    method: "POST",
    body: formData,
  }).then((response)=>{
    
  }).catch((error)=>{
    
  });
}


// eof: nov-15, 11:13, fri-2024; #26; image
