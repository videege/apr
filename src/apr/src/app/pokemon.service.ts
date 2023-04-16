import { Injectable } from '@angular/core';
import { NamedAPIResource, PokemonClient } from 'pokenode-ts';

export interface Pokemon {
  isMythical: boolean;
  isBaby: boolean;
  isLegendary: boolean;
  generation: string;
  name: string;
  picture: string | null;
  shinyPicture: string | null;
  imageData: string | ArrayBuffer | null;
  shinyImageData: string | ArrayBuffer | null;
  types: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private api = new PokemonClient();

  constructor() { }

  pokemon: Pokemon[] = [];

  public loadProgress = 0;

  private names: string[] = [];

  async loadPokemonData() {
    if (!this.pokemon.length && this.loadProgress === 0) {
      let ls = localStorage.getItem('pokemon');
      if (ls) {
        this.pokemon = JSON.parse(ls);
        this.loadProgress = 100;
        return;
      }

      await this.api.listPokemonSpecies(0, 2000)
        .then((response) => {
          this.names = response.results.map(x => x.name);
          this.loadPokemon();
        });
    }
  }

  async loadPokemon() {
    let pokeCount = this.names.length;
    for await (const name of this.names) {
      await this.api.getPokemonByName(name)
        .then((pokemon) => {
          this.pokemon.push({
            name: name,
            picture: pokemon.sprites.front_default,
            shinyPicture: pokemon.sprites.front_shiny,
            imageData: null,
            shinyImageData: null,
            types: pokemon.types.map(x => x.type.name),
            isBaby: false,
            isLegendary: false,
            isMythical: false,
            generation: ''
          });
          this.loadProgress += (1.0 / pokeCount) * 100 / 3;
        }, (error) => {
          console.log(error);
        });
    }
    this.loadPokemonSpeciesData();
  }

  async getBase64ImageFromUrl(imageUrl: string) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }

  async loadPokemonSpeciesData() {
    let pokeCount = this.names.length;
    for await (const pokemon of this.pokemon) {
      await this.api.getPokemonSpeciesByName(pokemon.name)
        .then((species) => {
          pokemon.isMythical = species.is_mythical;
          pokemon.isBaby = species.is_baby;
          pokemon.isLegendary = species.is_legendary;
          pokemon.generation = species.generation.name;
        }, (error) => {
          console.log(error);
        });
      this.loadProgress += (1.0 / pokeCount) * 100 / 3;
    }

    this.loadPokemonImages();
  }

  async loadPokemonImages() {
    let pokeCount = this.names.length;
    for await (const pokemon of this.pokemon) {
      if (pokemon.picture)
        await this.getBase64ImageFromUrl(<string>pokemon.picture)
          .then((response) => {
            pokemon.imageData = <any>response;
            this.loadProgress += (1.0 / pokeCount) * 100 / 3;
          }, (error) => {
            console.log(error);
          });
      if (pokemon.shinyPicture)
        await this.getBase64ImageFromUrl(<string>pokemon.shinyPicture)
          .then((response) => {
            pokemon.shinyImageData = <any>response;
          }, (error) => {
            console.log(error);
          });
    }
    this.loadProgress = 100;
    localStorage.setItem('pokemon', JSON.stringify(this.pokemon));
  }

  async getRandomPokemonSet(types: string[] = [],
    babiesOnly: boolean = false,
    legendaryOnly: boolean = false,
    mythicalOnly: boolean = false,
    generation: string | null = null): Promise<Pokemon[]> {
    await this.loadPokemonData();
    
    let set = types.length > 0
      ? this.pokemon.filter(x => {
        return x.types.filter(t => types.includes(t)).length > 0;
      })
      : this.pokemon;
    if (babiesOnly)
      set = set.filter(x => x.isBaby);
    if (legendaryOnly)
      set = set.filter(x => x.isLegendary);
    if (mythicalOnly)
      set = set.filter(x => x.isMythical);

    if (generation) 
      set = set.filter(x => x.generation === generation);

    return set;
  }

  getPokemonTypes(): string[] {
    let types: string[] = [];
    for (const pokemon of this.pokemon) {
      for (const type of pokemon.types) {
        if (!types.includes(type))
          types.push(type);
      }

    }
    return types;
  }

  getGenerations(): string[] {
    let generations: string[] = [];
    for (const pokemon of this.pokemon) {
      if (!generations.includes(pokemon.generation))
        generations.push(pokemon.generation);
    }
    return generations;
  }
}
