import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, FormsModule, CheckboxModule, InputTextModule, PasswordModule, RippleModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public _booleanRememberMe: boolean = false;
  public _stringUsername: string = '';
  public _stringPassword: string = '';

  constructor(private router: Router) {
    // Inisialisasi jika diperlukan
  }

  ngOnInit(): void {
  }

  public onLogin(): void {
    // Logika untuk menangani login
    console.log('Username:', this._stringUsername);
    console.log('Password:', this._stringPassword);
    console.log('Remember Me:', this._booleanRememberMe);

    if (this._stringUsername === 'user' && this._stringPassword === 'password') {
      alert('Login Berhasil!');
      this.router.navigate(['/dashboard']); // Ganti dengan path dashboard Anda
    } else {
      alert('Username atau password salah!');
    }
  }
}
