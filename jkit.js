const isListPage = window.location.href.includes('people');

function getId(url){
    return url.split('/')[4];
}

if (isListPage){
    let items = {}; // for all list pages.
    let _items = {}; // for current list page;
    let top3 = []; // contains top 3 count obj [id,name,count]
    let count = 0;
    //index rating5:0,rating4:1,rating3:2,rating2:3,rating1:4:
    let ratings = [0,0,0,0,0]; 
    let obj = localStorage['jkit'];

    // fetch data from localStorage
    if (!!obj){
        obj = JSON.parse(obj);
        items = obj['items'] ? obj['items'] : items;
        count = obj['count'] ? obj['count'] : count;
        top3 = obj['top3'] ? obj['top3'] : top3;
        ratings = obj['ratings'] ? obj['ratings'] : ratings;
    } else {
        obj = {};
    }

    //load click event
    [...document.querySelectorAll('.title')].map((x)=>{
        const url = x.getElementsByTagName('a')[0].getAttribute('href');
        const id = getId(url);
        let isBlacked;

        if (!!items[id]){// Modify exists in storage;
            _items[id] = {"isBlacked": items[id].isBlacked,"directors":items[id].directors,"rating":items[id].rating};
        } else {// Add 
            _items[id] = {"isBlacked":false};
        }
        isBlacked = _items[id].isBlacked;

        if (isBlacked){
            return;
        } else {
            const a = document.createElement('a');
            a.innerText = 'X';
            x.append(a);
            a.addEventListener('click',()=>{
                _items[id].isBlacked = true;
                count = count - 1;
                updateCount();
                a.remove();
            })
        }
    })

    // load ratings

    loadRatings();


    function updateCount() {
        // get count;
        let _count = 0; //for current page.
        for (let[k, v] of Object.entries(_items)){
            if (!items[k]){
                if(v.isBlacked){
                    _count = _count - 1;
                } else {
                    _count = _count + 1;
                }
            }
        }

        count = count + _count;

        const h1 = document.querySelector('h1');
        let text = h1.innerText;
        if (text.includes('/')){
            h1.innerText = text.split('/')[0] + '/' + count + ')';
        } else {
            h1.innerText = text.split(')')[0] + '/' + count + ')';
        }

        items = Object.assign(items, _items);

        obj['items'] = items;
        obj['count'] = count;
        localStorage['jkit'] = JSON.stringify(obj);
    }

    updateCount();


    function loadRatings(){
        let innerHtml = ``;

        ratings.slice(0,2).map((x,i)=>{
            innerHtml += `<li><span class='rating${5-i}-t'></span>x${x}</li>`
        })

        top3.map((x,i)=>{
            innerHtml += `<li><a href='https://movie.douban.com/celebrity/${x[0]}/'>${x[1]}</a>(${x[2]})</li>`
        })
        const origin = document.querySelector('.jkit');
        if (!!origin){
            origin.remove();
        }
        const ul = document.createElement('ul');
        ul.setAttribute('class','jkit');
        ul.innerHTML = innerHtml;
        const ref = document.querySelector('.grid-16-8');
        document.querySelector('#content').insertBefore(ul,ref);
    }

    function updateRatings(){
        const directors = {}; // {id:[name,count]} 
        ratings = [0,0,0,0,0];
        top3 = [];
        for (let [k,v] of Object.entries(items)){
            if(v.rating){
                ratings[5 - v.rating] = ratings[5 - v.rating] + 1;
            }

            if(v.directors){
                v.directors.map((x)=>{
                    const id = Object.keys(x)[0];
                    if(directors[id]){
                        directors[id][1] = directors[id][1]+1;
                        const count = directors[id][1];
                        if(top3.length<3){
                            top3.push([id,x[id],count]);
                        } else {
                            const max = top3[0][2];
                            const mid = top3[1][2];
                            const min = top3[2][2];
                            const current = [id, x[id], count];
                            if (count> max){
                                top3[0] = current;
                            } else{
                                if(count > mid){
                                    top3[1] = current;
                                } else {
                                    if(count > min){
                                        top3[2] = current;
                                    }
                                }
                            }
                        }
                    } else {
                        directors[id] = [x[id],1];
                    }
                })
            }
        }

        loadRatings()
        
        obj['items'] = items;
        obj['count'] = count;
        obj['top3'] = top3;
        obj['ratings'] = ratings;
        localStorage['jkit'] = JSON.stringify(obj);
    }
}

const isFilmPage = window.location.href.includes('subject');
if(isFilmPage){
    let blockedList = ["1309046"];
    let storage = !!localStorage['jkit'] ? JSON.parse(localStorage['jkit']):false;
    let items = storage ? storage.items :[];
    let count = storage ? storage.count : undefined;

    let _items = !!localStorage['_jkit'] ? JSON.parse(localStorage['_jkit']):[];
    function handleStart(){
        if(!storage||!items){
            window.alert(`Jkit: ${!storage ? ' storage ' :' items '} is missing!`);
            return;
        }

        for(let[k,v] of Object.entries(items)){
            if(!v.isBlacked&&!v.directors&&!blockedList.includes(k)){
                _items.push(k)
            }
        }
        if(_items.length>0){
            const firstKey = _items.shift();
            localStorage['_jkit'] = JSON.stringify(_items);
            window.location = `https://movie.douban.com/subject/${firstKey}/`;
        }
    }

    if(_items.length>=0&&isFilmPage){

        const id = getId(window.location.href);

        //fetch directors
        const directors = [];
        [...document.querySelectorAll("a[rel='v:directedBy']")].map((x)=>{
                const item = {};
                const directorId = x.getAttribute('href').split('/')[2];
                item[directorId] = x.innerText
                directors.push(item);
            });    

        // fetch ratings
        let rating = document.querySelector('#n_rating').value;
        
        items[id] = {"isBlacked":false,"directors":directors,"rating":rating};
        localStorage['jkit'] = JSON.stringify({items,count});

        if(_items.length!==0){
            const firstKey = _items.shift();
            localStorage['_jkit'] = JSON.stringify(_items);
            setTimeout(
                window.location = `https://movie.douban.com/subject/${firstKey}/`,
                Math.random()*10000
            )
        } else {
            localStorage.removeItem('_jkit');
        }
    }
}
