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

let jkit = storageRead('jkit');

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
  const blacklist = jkit?.bl ? new Set(jkit.bl) : new Set();

  if(!h1){//404
    // update blacklist
    jkit.bl = Array.from(blacklist.add(id));
    storageWrite('jkit', jkit);
    newItems.shift(); 
    storageWrite('jkitNewItems', newItems);
    nextItem();
    return;
  }
  // genre:
  //   0: film
  //   1: series
  //   2: show
  //   3: documentary
  const isSeries = 
    document.querySelectorAll('.episode_list').length > 0 ? true:false;
  const isShow = 
    document.querySelector("span[property='v:genre']")?.innerText ==='真人秀';
  const isDoc = 
    document.querySelector("span[property='v:genre']")?.innerText ==='纪录片';
  let genre = 
    isSeries ? 1 :
      isShow ? 2 :
      isDoc ? 3 :
      0;

  let area;// which countries or areas the item is produced. 
  const htmlSnippet = document.querySelector('#info').innerHTML;
  htmlSnippet.replace(/(区:<\/span>)(.*<)/,(match,$1,$2)=>{
    area = $2.replace('<','').trim();
  });

  const people = jkit?.people ? jkit.people : {};
  //fetch directors
  const directors = [];
  [...document.querySelectorAll("a[rel='v:directedBy']")].map((item)=>{
    const directorId = item.getAttribute('href').split('/')[2];
    people[directorId] = item.innerText;
    directors.push(directorId);
  });
  // fetch editors
  const editors = [];
  [...document.querySelectorAll('.pl')].map((item, i)=>{
    if(item.innerText === '编剧'){
      [...item.nextElementSibling.querySelectorAll(['a'])].map((tagA)=>{
        let editorId = tagA.getAttribute('href').split('/')[2];
        editorId = editorId ? editorId : special[tagA.innerText];
        people[editorId] = tagA.innerText;
        editors.push(editorId);
      });
    }
    return;
  });

  jkit.items[id].genre = genre;
  jkit.items[id].area = area;
  jkit.people = people; // used for reference when new items found.
  jkit.items[id].directors = directors;
  jkit.items[id].editors = editors;

  storageWrite('jkit', jkit);
  newItems.shift();
  storageWrite('jkitNewItems', newItems);
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

function nextPage(){
  const nextBtn = document.querySelector('.next a');
  let nextPage;
  if (nextBtn !== null){
    nextPage = nextBtn.getAttribute('href'); 
    nextPage = `https://movie.douban.com${nextPage}`;
    navigate(nextPage);                
  } else {
    const latestJkit = storageRead('jkit');
    delete latestJkit.isReset
    const allNewItems = Object.keys(latestJkit.items);
    storageWrite('jkitNewItems', allNewItems);
    storageWrite('jkit', latestJkit);
    nextItem();
  }
}

function sortData(){
  const jkit = storageRead('jkit');
  const people = jkit.people;
  let directorCounts = {};
  let editorCounts = {};
  let genreCounts = [];
  let areaCounts = {}; 
  for(let [k, v] of Object.entries(jkit.items)){
    if(jkit.bl.includes(k)){
      continue;
    }
    v.directors.map((x)=>{
      if(x){
        directorCounts[x] = directorCounts[x] ? directorCounts[x] + 1 : 1;
      }
    });
    v.editors.map((x)=>{
      if(x){
        editorCounts[x] = editorCounts[x] ? editorCounts[x] + 1 : 1;
      }
    });
    v.area.split('/').map((x)=>{
      if(x){
        x = x.trim();
        areaCounts[x] = areaCounts[x] ? areaCounts[x]+1 : 1;
      }
    })
    genreCounts[v.genre] = genreCounts[v.genre] ? genreCounts[v.genre]+1 : 1;
  }
  // find the most counted areas.
  let mostCountedAreas=[];//[{count:1,name:'中国大陆'}]
  for(let [name, count] of Object.entries(areaCounts)){
    if(mostCountedAreas.length === 0){
      mostCountedAreas.unshift({
        name,
        count
      })
    } else {
      if(count > mostCountedAreas[0]?.count){
        mostCountedAreas.unshift({
          name,
          count
        })
      } else {
        if(mostCountedAreas[1]){// pos 1 has value
          if(count > mostCountedAreas[1]?.count){
            mostCountedAreas[2] = mostCountedAreas[1];
            mostCountedAreas[1]={
              name,
              count
            }
          } else { 
            if(mostCountedAreas[2]){
              if(count > mostCountedAreas[2]?.count){
                mostCountedAreas[2]={
                  name,
                  count
                }
              }
            } else {
              mostCountedAreas[2]={
                name,
                count
              }
            }
          }
        } else { // pos 1 has no value
          mostCountedAreas[1]={
            name,
            count
          }
        }
      }
    }
    mostCountedAreas.length = 3;
  }
  // find the most counted director and editor.
  let directorMostCounted;// type: id
  for(let [k, v] of Object.entries(directorCounts)){
    if(directorMostCounted){
      directorMostCounted = 
        directorCounts[k] > directorCounts[directorMostCounted] ?
        k :
        directorMostCounted;
    } else {
      directorMostCounted = k;
    }
  }
  let editorMostCounted;
  for(let [k, v] of Object.entries(editorCounts)){
    if(editorMostCounted){
      editorMostCounted = 
        editorCounts[k] > editorCounts[editorMostCounted] ?
        k :
        editorMostCounted;
    } else {
      editorMostCounted = k;
    }
  }
  const directorName = people[directorMostCounted];
  const timesDirectorMostCounted = directorCounts[directorMostCounted];
  const editorName = people[editorMostCounted];
  const timesEditorMostCounted = editorCounts[editorMostCounted];
  jkit.summary = {
    director:[directorName, timesDirectorMostCounted],
    editor:[editorName, timesEditorMostCounted],
    areas:mostCountedAreas,
    genreCounts
  }
  storageWrite('jkit', jkit);
  navigate('https://movie.douban.com/mine?status=collect');
}

function updateDom(){
  const jkit = storageRead('jkit');
  const summary = jkit.summary;   
  document.querySelector('.side-info').append(
    `
    ${summary.areas[0].name}(${summary.areas[0].count})
    ${summary.areas[1].name}(${summary.areas[1].count})
    ${summary.areas[2].name}(${summary.areas[2].count})
    ${summary.director[0]}(${summary.director[1]})
    ${summary.editor[0]}(${summary.editor[1]})
    电影(${summary.genreCounts[0]})
    电视剧(${summary.genreCounts[1]})
    真人秀(${summary.genreCounts[2]})
    纪录片(${summary.genreCounts[3]})
    `)
}

async function verifyData(){
  if(isListPage){
    await getItemsIds()
    .then(res =>{
      // when jkit is not existed, it will be reset mode.
      jkit = !jkit ? {'isReset':true} : jkit;
      // find new items 
      const items = jkit?.items ? jkit.items : {};
      const newItems = [];
      for(let k of Object.keys(res)){
        if(!(k in items)){// new item id
          newItems.push(k);
          items[k] = {};
        }
      }

      if(newItems.length>0){
        storageWrite('jkitNewItems', newItems);
        jkit.items = items;
        storageWrite('jkit',jkit); // insert new items into all-items-list.
        jkit.isReset ? nextPage() : nextItem();                               
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

if(weburl.includes('douban.com')){
  verifyData();
}

// close modal box of Zhihu
if (weburl.includes('zhihu.com')){
  document.querySelector('.Modal-closeButton').click();
}
