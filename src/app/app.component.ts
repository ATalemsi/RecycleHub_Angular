import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Store} from "@ngrx/store";
import {hydrateState, loadCollecteurs} from "./core/state/auth/auth.actions";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent  implements OnInit {
  constructor(private readonly store: Store) {}

  ngOnInit() {
    const hasInitialized = localStorage.getItem('appInitialized');

    if (!hasInitialized) {
      this.store.dispatch(loadCollecteurs());
      this.store.dispatch(hydrateState());
      localStorage.setItem('appInitialized', 'true');
    }
  }
}
