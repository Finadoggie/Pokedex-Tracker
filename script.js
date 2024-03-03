// Create dex selection dropdown
fetch('https://pokeapi.co/api/v2/pokedex/?limit=40')
    .then((response) => { return response.json(); })
    .then((data) => { 
        data.results.forEach(dex => {
            let option = makeElement('option');
            option.append(dex.name);
            option.value = dex.name;
            document.getElementById('dexes').append(option);
        }); 
        // console.log(document.getElementById('dexes'));
    })

async function generatePokemon(){
    let ex = document.getElementsByClassName("exampletxt");
    for(let i = 0; i < ex.length; i++) ex.item(i).style.setProperty('display', 'none');
    
    document.getElementById('mons').innerHTML = "";
    document.getElementById('searchButton').style.setProperty('visibility', 'hidden');
    let loadingText = document.getElementById('loading');

    loadingText.style.setProperty('display', 'block');
    loadingText.innerHTML = "Loading Pokédex...";
    
    let dexData = await fetchDex(document.getElementById('dexes').selectedOptions[0].value);
    // console.log(dexData.pokemon_entries[0]);
    console.log("check1");
    
    let cards = [];
    
    loadingText.innerHTML = `Loading Pokémon...`;
    
    let promises = [];
    for (let i = 0; i < dexData.pokemon_entries.length; i++) {
        
        let dexEntry = dexData.pokemon_entries[i];
        let id = dexEntry.pokemon_species.url.substring(42, dexEntry.pokemon_species.url.length-1);
        const p = fetchPokemonFromDex(id)
            .then((data) => { return buildPokemonStruct(data, dexEntry.entry_number); })
            .then((struct) => {
                return buildPokemonElement(struct);
            });
        promises.push(p);
    };
    Promise.all(promises).then(cards => {
        cards.forEach((card) => { 
            document.getElementById('mons').append(card); 
        });
        loadingText.style.setProperty('display', 'none');
        document.getElementById('searchButton').style.setProperty('visibility', 'visible');
    });
    
    
    // console.log('end');
    // document.getElementById('searchButton').style.setProperty('visibility', 'visible');
    // loadingText.innerHTML = ``;
    // loadingText.style.setProperty('display', 'none');
}

async function fetchDex(dex){
    return fetch(`https://pokeapi.co/api/v2/pokedex/${dex}`)
        .then((response) => { return response.json(); })
}

async function fetchPokemonFromDex(id){
    return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then((response) => {
            return response.json();
        });
}

async function buildPokemonStruct(pokemon, id){
    if(!(localStorage.getItem(pokemon.name)) || localStorage.getItem(pokemon.name) === "red" || localStorage.getItem(pokemon.name) === "yellow" || localStorage.getItem(pokemon.name) === "green") {
        localStorage.setItem(pokemon.name, "uncaught");
    }
    return {
        name: pokemon.species.name,
        idLocal: id,
        idNational: pokemon.id,
        image: pokemon.sprites.front_default,
        status: localStorage.getItem(pokemon.name)
    };
}

function buildPokemonElement(pokemon){
    // Main card
    let textContainer = makeElement('div', 'nameContainer');
    let name = makeElement('p', 'name', pokemon.name[0].toUpperCase() + pokemon.name.substring(1));
    let idContainer = makeElement('div', 'idContainer');
    let idLocal = makeElement('p', 'id', pokemon.idLocal);
    let idNational = makeElement('p', 'id', pokemon.idNational);
    idContainer.append(idLocal);
    idContainer.append(idNational);
    textContainer.append(name);
    
    let imageContainer = makeElement();
    let image = makeElement('img');
    image.src = pokemon.image;
    imageContainer.append(image);
    
    let portrait = makeElement('div', 'portrait');
    portrait.append(textContainer);
    portrait.append(imageContainer);

    // Hover overlay
    let header = makeElement('p', 'statusHeader', 'Set status');
    let uncaught = makeElement('button', 'uncaughtButton', 'Uncaught');
    let inProgress = makeElement('button', 'inProgressButton', 'In Progress');
    let caught = makeElement('button', 'caughtButton', 'Caught');

    let hoverOverlay = makeElement('div', 'cardHoverOverlay');
    hoverOverlay.append(header);
    hoverOverlay.append(uncaught);
    hoverOverlay.append(inProgress);
    hoverOverlay.append(caught);

    // Put it all together
    let card = makeElement('div', 'card');
    card.append(idContainer);
    card.append(hoverOverlay);
    card.append(portrait);
    card.id = pokemon.name;
    card.classList.add(pokemon.status);

    uncaught.onclick = () => recolorButton(pokemon, card, "uncaught");
    inProgress.onclick = () => recolorButton(pokemon, card, "in-progress");
    caught.onclick = () => recolorButton(pokemon, card, "caught");

    // document.getElementById('mons').append(card);
    return card;
}

function recolorButton(pokemon, card, color) {
    card.classList.remove(localStorage.getItem(pokemon.name));
    card.classList.add(color);
    localStorage.setItem(pokemon.name, color);
}

function display(){
    let show = document.getElementById("shown").selectedOptions[0].value;

    if(show !== "all"){
        let ex = document.getElementsByClassName('card');
        for(let i = 0; i < ex.length; i++) ex.item(i).style.setProperty('display', 'none');
        
        ex = document.getElementsByClassName(show);
        for(let i = 0; i < ex.length; i++) ex.item(i).style.setProperty('display', 'block');
    }else{
        let ex = document.getElementsByClassName('card');
        for(let i = 0; i < ex.length; i++) ex.item(i).style.setProperty('display', 'block');
    }
    // document.styleSheets[show].style.setProperty('display', 'block');
}

function makeElement(type = 'div', newClass, inner = ''){
    let newElement = document.createElement(type);
    if(newClass){
        newElement.classList.add(newClass);
    }
    newElement.innerHTML = inner;
    return newElement;
}
