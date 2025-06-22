import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

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
  public _stringErrorMessage: string = '';
  public _booleanLoading: boolean = false;

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {}

  public onLogin(): void {
    this._stringErrorMessage = '';
    this._booleanLoading = true;

    this.loginService.login(this._stringUsername, this._stringPassword).subscribe({
      next: (token) => {
        console.log('Token:', token);

        // Simpan token, bisa ke localStorage atau service state
        if (this._booleanRememberMe) {
          localStorage.setItem('access_token', token);
        } else {
          sessionStorage.setItem('access_token', token);
        }

        this._booleanLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this._booleanLoading = false;
        this._stringErrorMessage = err.message;
        alert('Login gagal: ' + err.message);
      }
    });
  }

}
