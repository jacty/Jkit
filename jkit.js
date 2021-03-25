const weburl = window.location.href;
const search = window.location.search;

const isReset = weburl.endsWith('reset');
const isListPage = weburl.includes('collect') && (!isReset);
const isGetItemsIds = weburl.endsWith('getItemsIds');
const isSortData = weburl.endsWith('sortData') && isListPage;

function storageRead(name){
    const storage = localStorage[name] ? JSON.parse(localStorage[name]) : [];
    return storage;
}
function storageWrite(name, value){
    localStorage[name] = JSON.stringify(value);
}

const jkit = storageRead('jkit');

if(isReset){
    reset();
} else if(isGetItemsIds){
    getItemsIds()
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
        let nameArray;
        try{
            nameArray = x.querySelector('.title em').innerText.split('/');
        } catch{
           nameArray = x.querySelector('.title').innerText.split('/');
        } 
        let name = nameArray.length > 1 ? nameArray[1].trim() : nameArray[0];
        name = name.replace('[可播放]','');
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
        storageWrite('jkit',{items});
        
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
            let jkit = storageRead['jkit'];
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
        storageWrite('jkit', jkit);
        nextPage();
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
    storageWrite('jkit', jkit);
    let _jkit = storageRead('_jkit');
    _jkit.shift();
    storageWrite('_jkit', _jkit);
    nextPage()
}

function nextPage(){
    const _jkit = storageRead('_jkit');
    if(_jkit.length>0){
        const key = _jkit[0];
        const url = `https://movie.douban.com/subject/${key}`;
        navigate(url);        
    } else {
        delete localStorage['_jkit'];
        sortData();
    } 
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
                storageWrite('jkit',{items:res});
            } else {
                const items = Object.assign(
                    jkit.items,
                    res
                )
                storageWrite('jkit', items);
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
    const jkit = storageRead('jkit');
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
    storageWrite('jkit', jkit);
    navigate('https://movie.douban.com/mine?status=collect');
}

function updateDom(){
    const jkit = storageRead('jkit');
    const director = jkit.director;
    const editor = jkit.editor;
    document.querySelector('h1').append(` ${jkit.director[0]}(${jkit.director[1]}) ${jkit.editor[0]}(${jkit.editor[1]})`)
}

async function verifyData(){
    if(isListPage){
        await _getItemsIds()
        .then(
            res =>{
                const items = jkit.items;
                const _jkit = [];
                for(let [k,v] of Object.entries(res)){
                    const isNewItem = !(k in items);
                    if(isNewItem){// new item id
                        jkit.items[k] = v;
                        _jkit.push(k);
                    }
                }
                storageWrite('jkit', jkit);
                if(_jkit.length>0){
                    storageWrite('_jkit', _jkit);
                    nextPage()
                } 
            }
        )
    } else {
        const _jkit = storageRead('_jkit');
        if(_jkit.length>0){
            const key = _jkit[0];
            const curId = getIdFromUrl(weburl);
            if(curId !== key){
                const url = `https://movie.douban.com/subject/${key}`;
                navigate(url)
            } else {
                await fetchItems()
            }
        }
    }
}

verifyData();
