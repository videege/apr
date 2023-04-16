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

  types: string[] = [];
  constructor(public pokemonService: PokemonService) {

  }

  ngOnInit(): void {
    this.pokemonService.getRandomPokemon().then(() => {
      this.types = this.pokemonService.getPokemonTypes();
      for (const type of this.types) {
        this.typeFilters[type] = new FormControl(false);
      }
    });
  }

  public pkm: Pokemon | null = null;

  private timer = (ms: number) => new Promise(res => setTimeout(res, ms))

  async getRandomPokemon() {
    let selectedTypes: string[] = [];
    for (const type of this.types) {
      if (!!this.typeFilters[type].value) {
        selectedTypes.push(type);
      }
    }
    for (var i = 0; i < 25; i++) {
      this.pkm = await this.pokemonService.getRandomPokemon(selectedTypes);
      await this.timer(100);
    }
  }
}
