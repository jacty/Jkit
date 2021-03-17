const isListPage = 
    window.location.href.includes('grid') ||
    window.location.href.includes('mine?status=collect');

const jkit = localStorage['jkit'] ? localStorage['jkit'] : false;

let search = window.location.search;
let isReset = search.includes('reset');
if(isReset){
    reset();
}

function navigate(url){
     setTimeout(
        window.location = url,
        Math.random()*10000
    )
}

// if (!jkit){
    // localStorage has been removed for reset
    // reset();
// } else {
//     if(window.location.search.includes('jkit')){
//         reset();
//     }
//     if(window.location.search.includes('_jkit')){
//         getItems();
//     }
//     if(window.location.search.includes('sortData')){
//         sortData();
//     }
//     if (isListPage){
//         updateDom()
//     }
// }

function getIdFromUrl(url){
    return url.split('/')[4];
}

// function popTemp(){
//     const _jkit = JSON.parse(localStorage['_jkit']);
//     const key = _jkit.shift();
//         if(!key){
//             delete localStorage['_jkit'];
//             window.location.href = 'https://movie.douban.com/mine?status=collect&sortData';
//             return;
//         }
//         localStorage['_jkit'] = JSON.stringify(_jkit);
//         setTimeout(
//             window.location = 
//                 `https://movie.douban.com/subject/${key}?_jkit`,
//             Math.random() * 10000
//         )
// }

async function getItemsIds(){
    let items = {};

    [...document.querySelectorAll('.item')].map((x)=>{
        const url = x.querySelector('.title a').getAttribute('href');
        const nameArray = x.querySelector('.title em').innerText.split('/');
        const name = nameArray.length > 1 ? nameArray[1].trim() : nameArray[0];
        const id = getIdFromUrl(url);
        items[id]={
            name,
        };
    });
    
    return items    
}

// async function getItems(res){
//     if (!!res){//initial start
//         const keys = Object.keys(res.items);
//         const key = keys.shift();
//         localStorage['_jkit'] = JSON.stringify(keys);
//         setTimeout(
//             window.location = 
//                 `https://movie.douban.com/subject/${key}?_jkit`,
//             Math.random() * 10000
//         )        
//     } else {
//         const jkit = JSON.parse(localStorage['jkit']);
//         const id = getIdFromUrl(window.location.href); 
//         //404 check
//         const h1 = document.querySelector('h1');
//         const isDrama = document.querySelectorAll('.episode_list').length > 0 ? true:false;
//         const blacklist = jkit.bl ? new Set(jkit.bl) : new Set(); 
//         if(!h1 || isDrama){//404
//             blacklist.add(id);
//             jkit.bl = Array.from(blacklist);
//             localStorage['jkit'] = JSON.stringify(jkit);
//             popTemp();
//         }
//         const people = jkit.people ? jkit.people : {};
//         //fetch directors
//         const directors = [];
//         [...document.querySelectorAll("a[rel='v:directedBy']")].map((x)=>{
//                 const directorId = x.getAttribute('href').split('/')[2];
//                 people[directorId] = x.innerText;
//                 directors.push(directorId);
//             });
//         //fetch editors and IMDB
//         const editors = [];
//         let imdb;
//         [...document.querySelectorAll('.pl')].map((x, i)=>{
//             if(x.innerText === '编剧'){
//                 [...x.nextElementSibling.querySelectorAll(['a'])].map((y)=>{
//                     const editorId = y.getAttribute('href').split('/')[2];
//                     people[editorId] = y.innerText;
//                     editors.push(editorId);
//                 });
//             }
//             if(x.innerText.includes('IMDB')){
//                 imdb = x.nextElementSibling.innerText;
//                 return;
//             }
//         });
//         jkit.people = people;
//         jkit.items[id].directors = directors;
//         jkit.items[id].editors = editors;
//         jkit.items[id].imdb = imdb;
//         localStorage['jkit'] = JSON.stringify(jkit);
//         popTemp();
//     }
// }

// Reset all the data by crawling the movie pages.
async function reset(){  
    localStorage['jkit'] = {};
    
    if (!isListPage){
        const url = `https://movie.douban.com/mine?status=collect&reset`;
        navigate(url);
    }
    // get item ids from list
    await getItemsIds()
    .then(
        res => {
            console.log('x',Object.keys(res));
            const len = Object.keys(res);

            // write into localStorage
            // if(!data){
//                 localStorage['jkit'] = JSON.stringify(res);
//             } else{
//                 res = Object.assign(
//                     JSON.parse(localStorage['jkit']),
//                     res
//                 )
//                 localStorage['jkit'] = JSON.stringify(res);
//             }
//             // jump to next page
//             const nextBtn = document.querySelector('.next a');
//             let nextPage;
//             if (nextBtn !== null){
//                 nextPage = nextBtn.getAttribute('href'); 
//                 nextPage = `https://movie.douban.com${nextPage}&jkit`;
                
//                 setTimeout(
//                     window.location = nextPage,
//                     Math.random()*10000
//                 )
                
//             } else {
//                 return res;
//             }
        }
    )
    // .then(
//         res =>{
//             if (res){
//                 return getItems(res);
//             }
//         }
//     ).catch(
//         e => {
//             console.error(e);
//             debugger;
//         }
//     );
}

// function sortData(){
//     const rightPage = window.location.href === 'https://movie.douban.com/mine?status=collect&sortData';
//     if(!rightPage){
//         window.location.href = 'https://movie.douban.com/mine?status=collect&sortData';
//     }
//     const jkit = JSON.parse(localStorage['jkit']);
//     const people = jkit.people;
//     let directors = {};
//     let editors = {}; 
//     for(let [k, v] of Object.entries(jkit.items)){
//         v.directors.map((x)=>{
//             directors[x] = directors[x] ? directors[x]+1 : 1;
//         });
//         v.editors.map((x)=>{
//             editors[x] = editors[x] ? editors[x] + 1 : 1;
//         })
//     }
//     let director;
//     for(let [k, v] of Object.entries(directors)){
//         if(director){
//             director = 
//                 directors[k] > directors[director] ?
//                 k :
//                 director;
//         } else {
//             director = k;
//         }
//     }
//     let editor;
//     for(let [k, v] of Object.entries(editors)){
//         if(editor){
//             editor = 
//                 editors[k] > editors[editor] ?
//                 k :
//                 editor;
//         } else {
//             editor = k;
//         }
//     }
//     const directorName = people[director];
//     const directorCount = directors[director];
//     const editorName = people[editor];
//     const editorCount = editors[editor];
//     jkit.director = [directorName,directorCount];
//     jkit.editor = [editorName, editorCount];
//     localStorage['jkit'] = JSON.stringify(jkit);
//     updateDom();
// }

// function updateDom(){
//     const jkit = JSON.parse(localStorage['jkit']);
//     const director = jkit.director;
//     const editor = jkit.editor;
//     document.querySelector('h1').append(` ${jkit.director[0]}(${jkit.director[1]}) ${jkit.editor[0]}(${jkit.editor[1]})`)
// }



