
// let.js

// var buttons = document.querySelectorAll('button');
//
//
// for(let i = 0; i < buttons.length; i++){
//     var button = buttons[i];
//     button.innerText = i;
//     button.onclick = function(e){
//         console.log(i);
//     };
// }


// const.js

// console.log(PI);
// const PI = 3.14159;


// spread.js

let staticLanguages = ['C', 'C++', 'Java'];
let dynamicLanguages = ['JavaScript', 'PHP', 'Ruby'];


let languages = [...staticLanguages,"C#",...dynamicLanguages];

console.log(languages);