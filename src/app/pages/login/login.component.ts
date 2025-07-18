import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, PasswordModule, RippleModule, ToastModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent {
  public _booleanRememberMe: boolean = false;
  public _stringUsername: string = '';
  public _stringPassword: string = '';
  public _stringErrorMessage: string = '';
  public _booleanLoading: boolean = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  public onLogin(): void {
    this._stringErrorMessage = '';

    if (!this._stringUsername) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email Required',
        detail: 'Please enter your email address.'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._stringUsername)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Email',
        detail: 'Please enter a valid email address.'
      });
      return;
    }

    if (!this._stringPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Password Required',
        detail: 'Please enter your password.'
      });
      return;
    }

    this._booleanLoading = true;

    this.loginService.login(this._stringUsername, this._stringPassword).subscribe({
      next: (tokens) => {
        const { access_token, refresh_token } = tokens;

        if (this._booleanRememberMe) {
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
        } else {
          sessionStorage.setItem('access_token', access_token);
          sessionStorage.setItem('refresh_token', refresh_token);
        }


        this._booleanLoading = false;
        this.router.navigate(['/dashboard']);
        
      },
      error: (err: Error) => {
        this._booleanLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err.message
        });
      }
    });
  }


}
