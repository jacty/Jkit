


// let items = {}; // for all pages.
// let _items = {}; //for current page
// let count = 0;
// let obj = sessionStorage['x'];

// // fetch old data.
// if (!!obj){
//     obj = JSON.parse(obj);
//     items = obj['items'];
//     count = obj['count'];
// } else {
//     obj = {};
// }

// function getId(url){
//     return url.split('/')[4];
// }
// const isListPage = window.location.href.includes('people')

// if (isListPage){
//     [...document.querySelectorAll('.title')].map((x)=>{       
//     const url = x.getElementsByTagName('a')[0].getAttribute('href');
//     const id = getId(url)
//     let isBlacked;

//     if (!!items[id]){// exist in old data;
//         _items[id] = {"isBlacked":items[id].isBlacked};
//     } else {
//         _items[id] = {"isBlacked":false};
//     }    
//     isBlacked = _items[id].isBlacked;
//     if (isBlacked){
//         return;
//     } else {
//         const a = document.createElement('a');
//         a.innerText = 'X';
//         x.append(a);
//         a.addEventListener('click',()=>{
//             _items[id].isBlacked = true;
//             count = count - 1;
//             updateDOM();
//             a.remove();
//         })
//     }
// })
// }


// function updateDOM(){
//     // get count;
//     let _count = 0; // for current page.
//     for (let[k, v] of Object.entries(_items)){
//         if(!items[k]){
//             if (v.isBlacked){
//                 _count = _count - 1;
//             } else {
//                 _count = _count + 1;
//             }
//         }
//     }
    
//     count = count + _count;

//     const h1 = document.querySelector('h1');
//     let text = h1.innerText;
//     if (text.includes('/')){
//         h1.innerText = text.split('/')[0]+'/'+count+')';
//     } else {
//         h1.innerText = text.split(')')[0]+'/'+ count +')';
//     }

//     items = Object.assign(items,_items);

//     obj['items']= items;
//     obj['count']= count;
//     sessionStorage['x']=JSON.stringify(obj);
// }

// updateDOM();

// const starter = Object.keys(items)[0];
// const isStarter = window.location.href.includes(starter);
// let i = sessionStorage['i'] ? JSON.parse(sessionStorage['i']) : 0;
// const id = Object.keys(items)[i];
// const staff = [];

// if(isStarter){

//     [...document.querySelectorAll("a[rel='v:directedBy']")].map((x)=>{
//             const item = {};
//             const directorId = x.getAttribute('href').split('/')[2];
//             item[directorId] = x.innerText
//             staff.push(item);
//         });

//     items[id].directors = staff;
//     obj['items']= items;
//     sessionStorage['x']=JSON.stringify(obj);
    
//     window.location = 'https://movie.douban.com/subject/'+Object.keys(items)[i+1]+'/'

// } 
