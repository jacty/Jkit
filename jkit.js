
let items = {}; // for all pages.
let _items = {}; //for current page
let count = 0;
let obj = sessionStorage['x'];

// fetch old data.
if (!!obj){
    obj = JSON.parse(obj);
    items = obj['items'];
    count = obj['count'];
} else {
    obj = {};
}

function getId(url){
    return url.split('/')[4];
}

[...document.querySelectorAll('.title')].map((x)=>{       
    const url = x.getElementsByTagName('a')[0].getAttribute('href');
    const id = getId(url)
    let isBlacked;

    if (!!items[id]){// exist in old data;
        _items[id] = {"isBlacked":items[id].isBlacked};
    } else {
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
            updateDOM();
            a.remove();
        })
    }
})


function updateDOM(){
    // get count;
    let _count = 0; // for current page.
    for (let[k, v] of Object.entries(_items)){
        if(!items[k]){
            if (v.isBlacked){
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
        h1.innerText = text.split('/')[0]+'/'+count+')';
    } else {
        h1.innerText = text.split(')')[0]+'/'+ count +')';
    }

    items = Object.assign(items,_items);

    obj['items']= items;
    obj['count']= count;
    sessionStorage['x']=JSON.stringify(obj);
}

function updateData(id){
    items[id].isBlacked = true;
    _items[id].isBlacked = true;
    count = count - 1;
    obj['items']= items;
    obj['count']=count;
    sessionStorage['x']=JSON.stringify(obj);
    
    const h1 = document.querySelector('h1');
    let text = h1.innerText;
    if (text.includes('/')){
        h1.innerText = text.split('/')[0]+'/'+count+')';
    } else {
        h1.innerText = text.split(')')[0]+'/'+ count +')';
    }
}
updateDOM();