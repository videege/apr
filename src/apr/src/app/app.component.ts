import { Component, OnInit } from '@angular/core';
import { Pokemon, PokemonService } from './pokemon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'apr';

  constructor(private pokemonService: PokemonService) {

  }

  ngOnInit(): void {
    this.pokemonService.getRandomPokemon();
  }

  public pkm: Pokemon | null = null;

  private timer = (ms: number) => new Promise(res => setTimeout(res, ms))

  async getRandomPokemon() {
    for (var i = 0; i < 25; i++) {
      this.pkm = await this.pokemonService.getRandomPokemon();
      await this.timer(100);
    }
  }
}
