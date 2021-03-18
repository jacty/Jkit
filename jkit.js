const isListPage = 
    window.location.href.includes('grid') ||
    window.location.href.includes('mine?status=collect') &&
    (!window.location.href.includes('reset'));

const jkit = localStorage['jkit'] ? JSON.parse(localStorage['jkit']) : false;

let search = window.location.search;
let isReset = search.includes('reset');
let isGetItemsIds = search.includes('getItemsIds');
let isFetchItems = search.includes('_jkit');
let isSortData = search.includes('sortData') && isListPage;
if(isReset){
    reset();
} else if(isGetItemsIds){
    getItemsIds()
} else if (isFetchItems){
    fetchItems();
} else if (isListPage&&!isSortData){
    updateData()
} else if (isSortData){
    sortData();      
}

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

async function _getItemsIds(){
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

async function getItemsIds(){
    await _getItemsIds()
    .then((res)=>{

        const items = Object.assign(
                jkit.items,
                res
            )
        localStorage['jkit'] = JSON.stringify({items})
        
        // jump to next page
        const nextBtn = document.querySelector('.next a');
        let nextPage;
        if (nextBtn !== null){
            nextPage = nextBtn.getAttribute('href'); 
            nextPage = `https://movie.douban.com${nextPage}&getItemsIds`;
            navigate(nextPage);                
        } else {
            // ready to fetch items.
            // in the first run, global var jkit may lack of the last page of 
            // items.
            let jkit = JSON.parse(localStorage['jkit']);
            let keys = localStorage['_jkit'] ? 
                JSON.parse(localStorage['_jkit']) :
                Object.keys(jkit.items);
            let key = keys.shift();
            localStorage['_jkit'] = JSON.stringify(keys);
            const url = `https://movie.douban.com/subject/${key}?_jkit`;
            navigate(url); 
        }
    })
}

async function fetchItems(){
    const special = {
        '元奎':'1289150',
        'Daniel Wallace':'1041362',
    }
    const id = getIdFromUrl(window.location.href);
    const h1 = document.querySelector('h1');
    const isDrama = document.querySelectorAll('.episode_list').length > 0 ? true:false;
    const blacklist = jkit.bl ? new Set(jkit.bl) : new Set(); 
    if(!h1 || isDrama){//404
        blacklist.add(id);
        jkit.bl = Array.from(blacklist);
        localStorage['jkit'] = JSON.stringify(jkit);
        popTemp();
        return;
    }

    const people = jkit.people ? jkit.people : {};
    //fetch directors
    const directors = [];
    [...document.querySelectorAll("a[rel='v:directedBy']")].map((x)=>{
        const directorId = x.getAttribute('href').split('/')[2];
        people[directorId] = x.innerText;
        directors.push(directorId);
    });
    // fetch editors and IMDB
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
    localStorage['jkit'] = JSON.stringify(jkit);
    popTemp();
}

function popTemp(){
    const _jkit = localStorage['_jkit'];
    let keys;
    if (!_jkit){
        keys = [];
    } else {
        keys = JSON.parse(_jkit);
    }
    if(keys.length < 1){
        delete localStorage['_jkit'];
        sortData();
    }
    let key = keys.shift();
    localStorage['_jkit'] = JSON.stringify(keys);
    const url = `https://movie.douban.com/subject/${key}?_jkit`;
    navigate(url); 
}

// Reset all the data by crawling the movie pages.
async function reset(){  
    delete localStorage['jkit'];
    delete localStorage['_jkit'];
    if (!isListPage){
        const url = `https://movie.douban.com/mine?status=collect&reset`;
        navigate(url);
    }
    // get item ids from list
    await _getItemsIds()
    .then(
        res => {
            if(!jkit){
                localStorage['jkit'] = JSON.stringify({items:res});
            } else {
                const items = Object.assign(
                    jkit.items,
                    res
                )
                localStorage['jkit'] = JSON.stringify(items)
            }
            // jump to next page
            const nextBtn = document.querySelector('.next a');
            let nextPage;
            if (nextBtn !== null){
                nextPage = nextBtn.getAttribute('href'); 
                nextPage = `https://movie.douban.com${nextPage}&getItemsIds`;
                navigate(nextPage);                
            }
        }
    )
}

function sortData(){
    const jkit = JSON.parse(localStorage['jkit']);
    const people = jkit.people;
    let directors = {};
    let editors = {}; 
    for(let [k, v] of Object.entries(jkit.items)){
        if(jkit.bl.includes(k)){
            continue;
        }
        v.directors.map((x)=>{
            if(x){
                directors[x] = directors[x] ? directors[x] + 1 : 1;
            }
        });
        v.editors.map((x)=>{
            if(x){
                editors[x] = editors[x] ? editors[x] + 1 : 1;
            }
        });
    }

    let director;
    for(let [k, v] of Object.entries(directors)){
        if(director){
            director = 
                directors[k] > directors[director] ?
                k :
                director;
        } else {
            director = k;
        }
    }
    let editor;
    for(let [k, v] of Object.entries(editors)){
        if(editor){
            editor = 
                editors[k] > editors[editor] ?
                k :
                editor;
        } else {
            editor = k;
        }
    }
    const directorName = people[director];
    const directorCount = directors[director];
    const editorName = people[editor];
    const editorCount = editors[editor];
    jkit.director = [directorName,directorCount];
    jkit.editor = [editorName, editorCount];
    localStorage['jkit'] = JSON.stringify(jkit);
    navigate('https://movie.douban.com/mine?status=collect');
}

function updateDom(){
    const jkit = JSON.parse(localStorage['jkit']);
    const director = jkit.director;
    const editor = jkit.editor;
    document.querySelector('h1').append(` ${jkit.director[0]}(${jkit.director[1]}) ${jkit.editor[0]}(${jkit.editor[1]})`)
}

async function updateData(){
    await _getItemsIds()
    .then(
        res =>{
            const items = jkit.items;
            const _jkit = [];
            let hasUpdate = false;
            for(let [k,v] of Object.entries(res)){
                if(!items[k]){// new item id
                    jkit.items[k] = v;
                    hasUpdate = true;
                } else {// update item value
                    if(!items[k].directors){
                        hasUpdate = true;
                        _jkit.push(k);
                    }
                }
            }
            localStorage['jkit'] = JSON.stringify(jkit);
            if(_jkit.length>0){
                localStorage['_jkit'] = JSON.stringify(_jkit);
                popTemp()
            } 
            if (hasUpdate){
                sortData()
            } else {
                updateDom();
            }
        }
    )
}


