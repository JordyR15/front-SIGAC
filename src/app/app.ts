import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',  // <-- Debe decir ./app.html
  styleUrl: './app.css'       // <-- Debe decir ./app.css
})
export class AppComponent {
  title = 'front-SIGAC';
}
