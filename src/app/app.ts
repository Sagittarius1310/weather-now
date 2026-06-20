import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '@core/components/header/header';
import { Search } from '@features/search/search';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Search],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('weather-now');
}
