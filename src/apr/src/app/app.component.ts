import { Component, OnInit } from '@angular/core';
import { Pokemon, PokemonService } from './pokemon.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'apr';

  public typeFilters: { [name: string]: FormControl } = {};
  public isBaby = new FormControl(false);
  public isLegendary = new FormControl(false);
  public isMythical = new FormControl(false);
  public generation = new FormControl(null);
  public useShinies = new FormControl(false);

  types: string[] = [];
  generations: string[] = [];

  constructor(public pokemonService: PokemonService) {

  }

  ngOnInit(): void {
    this.pokemonService.getRandomPokemonSet().finally(() => {    
      if (!this.types.length) {
        this.types = this.pokemonService.getPokemonTypes();
      }
      if (!this.generations.length) {      
        this.generations = this.pokemonService.getGenerations();
      }
      for (const type of this.types) {
        this.typeFilters[type] = new FormControl(false);
      }
    });
  }

  resetFilters(): void {
    for (const type of this.types) {
      this.typeFilters[type].setValue(false);
    }
  }

  displayGeneration(gen: string): string {
    let numeral = gen.substring(gen.indexOf('-') + 1).toUpperCase();
    return `Gen ${numeral}`;
  }

  public pkm: Pokemon | null = null;

  private timer = (ms: number) => new Promise(res => setTimeout(res, ms))

  async getRandomPokemon() {
    if (!this.types.length) {
      this.types = this.pokemonService.getPokemonTypes();
    }
    if (!this.generations.length) {      
      this.generations = this.pokemonService.getGenerations();
    }

    let selectedTypes: string[] = [];
    for (const type of this.types) {
      if (!!this.typeFilters[type].value) {
        selectedTypes.push(type);
      }
    }

    let set = await this.pokemonService.getRandomPokemonSet(selectedTypes,
      !!this.isBaby.value,
      !!this.isLegendary.value,
      !!this.isMythical.value,
      this.generation.value);
    for (var i = 0; i < 25; i++) {
      this.pkm = set[Math.floor(Math.random() * set.length)];
      await this.timer(100);
    }
  }
}
