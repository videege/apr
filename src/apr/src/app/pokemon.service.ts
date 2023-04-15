import { Injectable } from '@angular/core';
import { NamedAPIResource, PokemonClient } from 'pokenode-ts';

export interface Pokemon {
  name: string;
  picture: string | null;
  imageData: string | ArrayBuffer | null;
  types: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private api = new PokemonClient();

  constructor() { }

  pokemon: Pokemon[] = [];


  private names: string[] = [];

  async loadPokemonData() {
    if (!this.pokemon.length) {
      let ls = localStorage.getItem('pokemon');
      if (ls) {
        this.pokemon = JSON.parse(ls);
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
    for await (const name of this.names) {
      await this.api.getPokemonByName(name)
        .then((response) => {          
          this.pokemon.push({
            name: name,
            picture: response.sprites.front_default,
            imageData: null,
            types: response.types.map(x => x.type.name)
          });
        }, (error) => {
          console.log(error);
        });
    }
    this.loadPokemonImages();
    
  }

  async getBase64ImageFromUrl(imageUrl: string) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();
  
    return new Promise((resolve, reject) => {
      var reader  = new FileReader();
      reader.addEventListener("load", function () {
          resolve(reader.result);
      }, false);
  
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }

  async loadPokemonImages() {
    for await (const pokemon of this.pokemon) {
      await this.getBase64ImageFromUrl(<string>pokemon.picture)
        .then((response) => {          
          pokemon.imageData = <any>response;
        }, (error) => {
          console.log(error);
        });
    }
    localStorage.setItem('pokemon', JSON.stringify(this.pokemon));
  }

  async getRandomPokemon(): Promise<Pokemon> {
    await this.loadPokemonData();
    return this.pokemon[Math.floor(Math.random() * this.pokemon.length)];
  }
}
