import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
import { UserService } from '../services/user_profile.service';
import { UserListResponse, UserModel, UserUpdateModel, UserCreateModel } from '../models/user.model';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
    selector: 'customers-app',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        DividerModule,
        IconField,
        InputIcon,
        ButtonModule,
        TableModule,
        InputTextModule,
        Tag,
        PopoverModule,
        BreadcrumbModule,
        DialogModule,
        PaginatorModule,
        DropdownModule,
        ConfirmDialogModule,
        ToastModule,
        CardModule
    ],
    templateUrl: './admin-management.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ConfirmationService, MessageService]
})
export class AdminManagementComponent {
    _listMenuItems: MenuItem[] = [];
    _defaultHomeMenu?: MenuItem;

    _searchQuery = '';
    tableData: UserModel[] = [];
    selectedRows: UserModel[] = [];

    selectedAdminProfile?: UserModel;
    _booleanShowDataDialog = false;
    _booleanShowCreateDialog = false;

    selectedRowData: UserModel | null = null;
    editMode = false;

    newUserData: UserCreateModel = {
        email: '',
        password: '',
        full_name: '',
        role: 'ADMIN'
    };

    _searchSubject = new Subject<string>();

    private _originalAdminProfile?: UserModel;

    constructor(
        private userService: UserService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) { }

    ngOnInit() {
        this._listMenuItems = [{ label: 'Customer Interactions' }];
        this._defaultHomeMenu = { icon: 'pi pi-home', routerLink: '/dashboard' };
        this.loadUserProfiles(false);

        this._searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(query => query.length === 0 || query.length >= 3)
        ).subscribe(() => {
            this.loadUserProfiles(false);
        });
    }

    private loadUserProfiles(showToast: boolean = true, offset: number = 0, limit: number = 10) {
        const query = this._searchQuery.trim();

        this.userService.getAllUserProfile(offset, limit, query).subscribe({
            next: (users: UserListResponse) => {
            this.tableData = users.data;
            this.cdr.markForCheck();

            console.log('[ADMIN][GET_USERS] Loaded users:', users);

            if (showToast) {
                this.messageService.add({
                severity: 'success',
                summary: 'Refreshed',
                detail: 'User data has been refreshed.'
                });
            }
            },
            error: (err) => {
            console.error('[ADMIN][GET_USERS] Error fetching users:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load admin profile.'
            });
            }
        });
    }

    refreshData() {
        this.loadUserProfiles(true);
    }

    displayPopover(event: Event, popover: any, rowData: UserModel | null) {
        if (!rowData) return;
        this.selectedRowData = rowData;
        popover.toggle(event);
    }

    showAdminProfileDetail(data: UserModel | null) {
        if (!data) return;
        this.selectedAdminProfile = { ...data };
        this._originalAdminProfile = { ...data };
        this._booleanShowDataDialog = true;
    }

    updateProfileAdmin() {
        if (!this.selectedAdminProfile || !this.selectedAdminProfile.id) {
            console.error('[ADMIN][UPDATE_USER] No selected admin profile or missing ID.');
            return;
        }

        const payload: UserUpdateModel = {
            email: this.selectedAdminProfile.email,
            full_name: this.selectedAdminProfile.full_name,
            is_active: this.selectedAdminProfile.is_active,
            role: this.selectedAdminProfile.role
        };

        this.userService.updateUserProfile(this.selectedAdminProfile.id, payload)
            .subscribe({
                next: (updatedUser: UserModel) => {
                    console.log('[ADMIN][UPDATE_USER] Success:', updatedUser);

                    const index = this.tableData.findIndex((u) => u.id === updatedUser.id);
                    if (index !== -1) {
                        this.tableData[index] = updatedUser;
                    }

                    this.cdr.markForCheck();
                    this._booleanShowDataDialog = false;
                    this.editMode = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Admin Profile updated successfully!'
                    });
                },
                error: (err) => {
                    console.error('[ADMIN][UPDATE_USER] Error updating user:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update admin profile.'
                    });
                }
            });
    }

    createUser() {
        if (!this.newUserData || !this.newUserData.email || !this.newUserData.password) {
            console.error('[ADMIN][CREATE_USER] Missing required fields.');
            return;
        }

        const payload: UserCreateModel = {
            email: this.newUserData.email,
            password: this.newUserData.password,
            full_name: this.newUserData.full_name,
            role: this.newUserData.role || 'ADMIN'
        };

        this.userService.createUser(payload).subscribe({
            next: (createdUser: UserModel) => {
                console.log('[ADMIN][CREATE_USER] Success:', createdUser);
                this.tableData = [...this.tableData, createdUser];
                this.cdr.markForCheck();
                this.closeCreateDialog();
                this._booleanShowCreateDialog = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Admin profile created successfully!'
                });
            },
            error: (err) => {
                console.error('[ADMIN][CREATE_USER] Error creating user:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create admin profile.'
                });
            }
        });
    }

    confirmCreateUser(event: Event) {
        const validationError = this.validateNewUserForm();
        if (validationError) {
            this.messageService.add({
                severity: 'error',
                summary: 'Field Mandatory',
                detail: validationError
            });
            return;
        }

        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Yakin ingin membuat admin baru?',
            header: 'Konfirmasi Buat Admin',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Buat',
            rejectLabel: 'Batal',
            acceptButtonProps: { severity: 'success' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: () => {
                this.createUser();
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Dibatalkan',
                    detail: 'Pembuatan admin dibatalkan.'
                });
            }
        });
    }

    deleteUser() {
        if (!this.selectedAdminProfile || !this.selectedAdminProfile.id) {
            console.error('[ADMIN][DELETE_USER] No selected admin profile or missing ID.');
            return;
        }

        this.userService.deleteUser(this.selectedAdminProfile.id).subscribe({
            next: () => {
                console.log('[ADMIN][DELETE_USER] Success:', this.selectedAdminProfile!.id);

                this.tableData = this.tableData.filter((u) => u.id !== this.selectedAdminProfile!.id);

                this.cdr.markForCheck();

                this._booleanShowDataDialog = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Admin profile deleted successfully!'
                });
            },
            error: (err) => {
                console.error('[ADMIN][DELETE_USER] Error deleting user:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete admin profile.'
                });
            }
        });
    }

    public confirmDeleteProfile(event: Event, data: UserModel | null) {
        if (!data || !data.id) {
            console.error('[ADMIN][DELETE_USER] No selected admin profile or missing ID.');
            return;
        }
        this.selectedAdminProfile = data;

        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Yakin ingin menghapus profil admin ini?',
            header: 'Konfirmasi Hapus',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Delete',
            rejectLabel: 'Batal',
            acceptButtonProps: { severity: 'danger' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: () => {
                this.deleteUser();
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Dibatalkan',
                    detail: 'Delete data canceled.'
                });
            }
        });
    }

    closeDialog() {
        this._booleanShowDataDialog = false;
        this.editMode = false;
    }

    public confirmSaveProfile(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Yakin ingin menyimpan perubahan profil admin?',
            header: 'Konfirmasi Simpan',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Simpan',
            rejectLabel: 'Batal',
            acceptButtonProps: { severity: 'success' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: () => {
                this.updateProfileAdmin();
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Dibatalkan',
                    detail: 'Perubahan tidak disimpan.'
                });
            }
        });
    }

    public resetProfile() {
        if (this._originalAdminProfile) {
            this.selectedAdminProfile = { ...this._originalAdminProfile };
            this.messageService.add({
                severity: 'info',
                summary: 'Reset',
                detail: 'Profil admin dikembalikan ke data awal.'
            });
            this.closeDialog()
        }
    }

    public confirmCancelUpdateProfile(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Yakin ingin membatalkan perubahan profil?',
            header: 'Konfirmasi Reset',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Reset',
            rejectLabel: 'Batal',
            acceptButtonProps: { severity: 'primary' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: () => this.resetProfile(),
            reject: () => { }
        });
    }

    public isProfileChanged(): boolean {
        return JSON.stringify(this.selectedAdminProfile) !== JSON.stringify(this._originalAdminProfile);
    }

    showCreateAdminDialog() {
        this.newUserData = {
            email: '',
            password: '',
            full_name: '',
            role: 'ADMIN'
        };
        this._booleanShowCreateDialog = true;
    }

    closeCreateDialog() {
        this._booleanShowCreateDialog = false;
    }

    private validateNewUserForm(): string | null {
        if (!this.newUserData.full_name || this.newUserData.full_name.trim() === '') {
            return 'Nama harus diisi.';
        }

        if (!this.newUserData.email || this.newUserData.email.trim() === '') {
            return 'Email harus diisi.';
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(this.newUserData.email)) {
            return 'Format email tidak valid.';
        }

        if (!this.newUserData.password || this.newUserData.password.length < 8) {
            return 'Password minimal 8 karakter.';
        }

        return null;
    }

}
