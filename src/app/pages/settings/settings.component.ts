import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast'; 
import { MessageService } from 'primeng/api'; 
import { FieldsetModule } from 'primeng/fieldset';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, 
        CardModule,
        InputTextModule,
        ButtonModule,
        PasswordModule,
        DividerModule,
        InputSwitchModule,
        ToastModule,
        FieldsetModule,
        ConfirmDialogModule 
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    providers: [MessageService, ConfirmationService] 
})
export class SettingsComponent implements OnInit {

    username: string = 'JaneDoe';
    email: string = 'jane.doe@example.com';

    currentPassword: string = '';
    newPassword: string = '';
    confirmNewPassword: string = '';

    enableEmailNotifications: boolean = true;
    enablePushNotifications: boolean = false;
    notifyOnNewMessage: boolean = true;
    notifyOnTaskAssignment: boolean = true;

    constructor(
        private messageService: MessageService, 
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        console.log('Settings component initialized.');
    }

    saveAccountSettings() {
       
        console.log('Saving General Settings:', { username: this.username, email: this.email });
        
        this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Pengaturan Umum berhasil disimpan.'
        });
    }

    changePassword() {
        if (this.newPassword !== this.confirmNewPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Gagal',
                detail: 'Password baru dan konfirmasi password tidak cocok.'
            });
            return;
        }
        if (this.newPassword.length < 6) { 
            this.messageService.add({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Password baru minimal 6 karakter.'
            });
            return;
        }
        
        console.log('Changing password:', { currentPassword: this.currentPassword, newPassword: this.newPassword });
        this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Password berhasil diubah.'
        });
        
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
    }

    saveNotificationSettings() {
        
        console.log('Saving Notification Settings:', {
            enableEmailNotifications: this.enableEmailNotifications,
            enablePushNotifications: this.enablePushNotifications,
            notifyOnNewMessage: this.notifyOnNewMessage,
            notifyOnTaskAssignment: this.notifyOnTaskAssignment
        });
        this.messageService.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Pengaturan Notifikasi berhasil disimpan.'
        });
    }

    public confirmSaveAccountSettings(event: Event) {
        this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to save this account settings?',
        header: 'Confirm Save',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Save',
        rejectLabel: 'Cancel',
        acceptButtonProps: {
            severity: 'success'
        },
        rejectButtonProps: {
            severity: 'secondary',
            outlined: true
        },
        accept: () => {
            this.saveAccountSettings();
        },
        reject: () => {
            this.messageService.add({severity:'info', summary:'Cancelled', detail:'Prompt was not saved.'});
        }
        });
    }

    public confirmChangePassword(event: Event) {
        this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to change password?',
        header: 'Confirm Save',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Save',
        rejectLabel: 'Cancel',
        acceptButtonProps: {
            severity: 'success'
        },
        rejectButtonProps: {
            severity: 'secondary',
            outlined: true
        },
        accept: () => {
            this.changePassword();
        },
        reject: () => {
            this.messageService.add({severity:'info', summary:'Cancelled', detail:'Prompt was not saved.'});
        }
        });
    }

    public confirmSaveNotificationSettings(event: Event) {
        this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to save this notification settings?',
        header: 'Confirm Save',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Save',
        rejectLabel: 'Cancel',
        acceptButtonProps: {
            severity: 'success'
        },
        rejectButtonProps: {
            severity: 'secondary',
            outlined: true
        },
        accept: () => {
            this.saveNotificationSettings();
        },
        reject: () => {
            this.messageService.add({severity:'info', summary:'Cancelled', detail:'Prompt was not saved.'});
        }
        });
    }
}