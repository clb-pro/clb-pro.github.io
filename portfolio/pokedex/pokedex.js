"use strict";

// Define a class responsible for fetching Pokémon data
class PokemonService {

    constructor() {
        this.pokedex = new Pokedex.Pokedex();
        this.offset = 0;
        this.limit = 50;
        this.totalPokemons = null;
        this.pokemons = [];
    }

    async getPokemonsList() {
        try {
            var promises = []
            // get pokemon name list
            const responseList = await this.pokedex.getPokemonsList({ offset: this.offset, limit: this.limit });
            this.totalPokemons = responseList.count;

            // loop each pokemon to get its detail
            responseList.results.forEach(element => {
                var promise = this.pokedex.getPokemonByName(element.name)    
                promises.push(promise);
            });
            
            const responseDetails = await Promise.all(promises);

            // push the results to this.pokemons array
            this.pokemons = [...this.pokemons, ...responseDetails]

            return responseDetails;
        } catch (error) {
            console.error(error.message);
        }
    }

    isAllPokemonLoaded() {
        if (this.pokemons.length === this.totalPokemons) {
            return true;
        } else {
            return false;
        }
    }

    getTotalPokemons () {
        return this.totalPokemons;
    }

    getTotalLoadedPokemons () {
        return this.pokemons.length;
    }
    
    next() { 
        this.offset += this.limit; 
    }
}

// Define a class responsible for displaying Pokémon cards
class HtmlBuilder {

    constructor(container) {
        this.container = container;
    }
  
    generateBgColorByTypes(types) {
        class HtmlBuilder {
            constructor(container) {
                this.container = container;
            }
        
            generateBgColorByTypes(types) {
                const typeColors = {
                    normal: "#A8A878",
                    fire: "#F08030",
                    water: "#6890F0",
                    electric: "#F8D030",
                    grass: "#78C850",
                    ice: "#98D8D8",
                    fighting: "#C03028",
                    poison: "#A040A0",
                    ground: "#E0C068",
                    flying: "#A890F0",
                    psychic: "#F85888",
                    bug: "#A8B820",
                    rock: "#B8A038",
                    ghost: "#705898",
                    dragon: "#7038F8",
                    dark: "#705848",
                    steel: "#B8B8D0",
                    fairy: "#EE99AC"
                };
        
                let bgColor = "#ccc"; // Default color if type is not found in the typeColors object
                types.forEach(type => {
                    if (type.type.name in typeColors) {
                        bgColor = typeColors[type.type.name];
                        // Break the loop once a matching type is found
                        return;
                    }
                });
        
                return bgColor;
            }
        
            createCard(pokemon) {
                const bgColor = this.generateBgColorByTypes(pokemon.types);
                let card = document.createElement("div");
                card.classList.add("pokemon-card");
                card.style.backgroundColor = bgColor;
                card.innerHTML = `
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${pokemon.name}" class="pokemon-image">
                    <h3 class="pokemon-name">${pokemon.name}</h3>
                `;
                this.container.appendChild(card);
            }
        
            // ... (other methods)
        }        
         
    }

    createCard(pokemon) {
        let div = document.createElement("div");
        div.className=" border border-gray-200 rounded-lg shadow p-5";
        
        div.innerHTML = '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+pokemon.id+'.png" />'+pokemon.name;
        this.container.append(div); 
    }
  
    displayPokemonCards(pokemons) {
        this.container.scrollIntoView({ behavior: "smooth", block: "end" });
        pokemons.forEach(pokemon => this.createCard(pokemon))
    }
}
  
// initiate the app and fetch/display Pokémon cards
async function startApp() {
    const pokemonService = new PokemonService();
    const htmlBuilder = new HtmlBuilder(document.getElementById('content'));
    const nextBtn = document.getElementById('next');
    const loadedPokemonCount = document.getElementById('loaded-pokemons');
    const totalPokemonCount = document.getElementById('total-pokemons');
    
    const loadPokemons = async () => {
        const pokemons = await pokemonService.getPokemonsList();
        htmlBuilder.displayPokemonCards(pokemons);

        if (pokemonService.isAllPokemonLoaded()) {
            nextBtn.disabled = true;
        }
        loadedPokemonCount.textContent = pokemonService.getTotalLoadedPokemons();
        totalPokemonCount.textContent = pokemonService.getTotalPokemons();
    };
    
    // initial load
    try {
        loadPokemons();
    } catch (error) {
        console.error(error.message);
    }

    // implement the next button function
    // or you can implement a "infinite scrolling" like how facebook load the news feed
    nextBtn.addEventListener('click', async () => {
        pokemonService.next();
        loadPokemons();
    })
}
  
// Start the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", startApp);
  