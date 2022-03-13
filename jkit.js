const weburl = window.location.href;
const search = window.location.search;

const isListPage = weburl.includes('collect')&&weburl.includes('douban');
/*helper functions start*/
function storageRead(name){
  const storage = localStorage[name] ? JSON.parse(localStorage[name]) : null;
  return storage;
}

function storageWrite(name, value){
  localStorage[name] = JSON.stringify(value);
}

const jkit = storageRead('jkit');

function navigate(url){
  try{
    setTimeout(
      window.location = url,
      Math.random()*10000
    )
  } catch{
    debugger;
  }
}

function getIdFromUrl(url){
  return url.split('/')[4];
}
/*helper funcitons end*/
async function getItemsIds(){
  let items = {};

  [...document.querySelectorAll('.item')].map((item)=>{
    const url = item.querySelector('.title a').getAttribute('href');
    const id = getIdFromUrl(url);
    items[id]={};
  });
    
  return items    
}

async function fetchItems(){
  const newItems = storageRead('jkitNewItems');
  const special = {
    '元奎':'1289150',
    'Daniel Wallace':'1041362',
  }
  const id = getIdFromUrl(window.location.href);
  const h1 = document.querySelector('h1');

  if(!h1){//404
    if(jkit){
      jkit.bl = Array.from(blacklist.add(id));
    } else {
      // extreme situation that the first item is 404.
      jkit = {
        'bl':[id]
      };
    } 
    storageWrite('jkit', jkit);
    newItems.shift(); 
    storageWrite('jkitNewItems', newItems);
    nextItem();
    return;
  }

  const isDrama = document.querySelectorAll('.episode_list').length > 0 ? true:false;
  const isShow = 
    document.querySelector("span[property='v:genre']").innerText ==='真人秀';
  const htmlSnippet = document.querySelector('#info').innerHTML;
  let area;// which countries or areas the item is produced.
  htmlSnippet.replace(/(区:<\/span>)(.*<)/,(match,$1,$2)=>{
    area = $2.replace('<','').trim();
  });

  const blacklist = jkit?.bl ? new Set(jkit.bl) : new Set(); 


    const people = jkit.people ? jkit.people : {};
    //fetch directors
    const directors = [];
    [...document.querySelectorAll("a[rel='v:directedBy']")].map((x)=>{
        const directorId = x.getAttribute('href').split('/')[2];
        people[directorId] = x.innerText;
        directors.push(directorId);
    });
    // fetch editors
    const editors = [];
    [...document.querySelectorAll('.pl')].map((x, i)=>{
        if(x.innerText === '编剧'){
            [...x.nextElementSibling.querySelectorAll(['a'])].map((y)=>{
            let editorId = y.getAttribute('href').split('/')[2];
            editorId = editorId ? editorId : special[y.innerText];
            people[editorId] = y.innerText;
            editors.push(editorId);
            });
        }
        return;
    });

    jkit.people = people;
    jkit.items[id].directors = directors;
    jkit.items[id].editors = editors;
    storageWrite('jkit', jkit);

    _jkit.shift();
    storageWrite('_jkit', _jkit);
    nextItem()
}

function nextItem(){
  const newItems = storageRead('jkitNewItems');
  if(newItems && newItems.length>0){
    const key = newItems[0];
    const url = `https://movie.douban.com/subject/${key}`;
    navigate(url);        
  } else {
    delete localStorage['jkitNewItems'];
    sortData();
  } 
}

// function nextPage(){
//     const nextBtn = document.querySelector('.next a');
//     let nextPage;
//     if (nextBtn !== null){
//         nextPage = nextBtn.getAttribute('href'); 
//         nextPage = `https://movie.douban.com${nextPage}`;
//         navigate(nextPage);                
//     } else {
//         const latestJkit = storageRead('jkit');
//         latestJkit.isReset = false;
//         const keys = Object.keys(latestJkit.items);
//         storageWrite('_jkit', keys);
//         storageWrite('jkit', latestJkit);
//         nextItem();
//     }
// }

async function reset(){  
  delete localStorage['_jkit'];
  const url = `https://movie.douban.com/mine?status=collect`;
  if (weburl.includes('douban') && weburl!==url){
    navigate(url);
    return;
  }
  console.error('reset');
  return;
    // get item ids from list
    await getItemsIds()
    .then(
        res => {
            storageWrite('jkit',{items:res,isReset:true});
            // jump to next page
            nextPage()
        }
    )
}

// function sortData(){
//     const jkit = storageRead('jkit');
//     const people = jkit.people;
//     let directors = {};
//     let editors = {}; 
//     for(let [k, v] of Object.entries(jkit.items)){
//         if(jkit.bl.includes(k)){
//             continue;
//         }
//         v.directors.map((x)=>{
//             if(x){
//                 directors[x] = directors[x] ? directors[x] + 1 : 1;
//             }
//         });
//         v.editors.map((x)=>{
//             if(x){
//                 editors[x] = editors[x] ? editors[x] + 1 : 1;
//             }
//         });
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
//     storageWrite('jkit', jkit);
//     navigate('https://movie.douban.com/mine?status=collect');
// }

// function updateDom(){
//     const jkit = storageRead('jkit');
//     const director = jkit.director;
//     const editor = jkit.editor;
//     document.querySelector('h1').append(` ${jkit.director[0]}(${jkit.director[1]}) ${jkit.editor[0]}(${jkit.editor[1]})`)
// }

async function verifyData(){
  if(isListPage){
    await getItemsIds()
    .then(res =>{
      // find new items 
      const items = jkit?.items ? jkit.items : {};
      const newItems = [];
      for(let k of Object.keys(res)){
        if(!(k in items)){// new item id
          newItems.push(k);
        }
      }

      if(newItems.length>0){
        storageWrite('jkitNewItems', newItems);
        jkit?.isReset ? nextPage() : nextItem();                               
      } else {
        updateDom();
      } 
    });
  } else {
    // item page. 
    // Situations:
    //   1. Navigate to item page without visiting list page: 
    //        newItems = null; // newItems is collected in list page.
    //   2. Navigate to item page after visiting list page:
    //      2.1 There are new items collected:
    //        newItems = {};
    //      2.2 There has no new items collected:
    //        newItems = null;
    const newItems = storageRead('jkitNewItems');
    if(newItems?.length>0){// There are new items collected
      const key = newItems[0];
      const curId = getIdFromUrl(weburl);// id of current page
      if(curId !== key){
        const url = `https://movie.douban.com/subject/${key}`;
        navigate(url)
      } else {
        await fetchItems()
      }
    }
  }
}


/*reset button fixed on aside of people page*/
if(weburl.includes('douban.com/people')){
  let dom = document.querySelector('.side-info');
  dom.innerHTML += `<a class='btnReset'>[Reset]</a>`
  document.querySelector('.btnReset').addEventListener('click', ()=>{
    reset();
  })
}

if(weburl.includes('douban.com')){
  verifyData();
}

// close modal box of Zhihu
if (weburl.includes('zhihu.com')){
  document.querySelector('.Modal-closeButton').click();
}
