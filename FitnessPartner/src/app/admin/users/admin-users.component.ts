import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  roles = ['user', 'admin'];
  loading = false;
  error: string | null = null;
  selectedUser: any = null;
  userDetails: any = null;

  constructor(  private usersService: UsersService,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.loadUsers();
    this.route.queryParams.subscribe(params => {
      const searchType = params['type'];
      const searchQuery = params['query'];

      this.loading = true;
      this.usersService.getUsers(searchType, searchQuery).subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          this.loading = false;
        }
      });
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    console.log('Fetching all users...');

    this.usersService.getAllUsers().pipe(
      tap(users => {
        console.log('Users data received:', users);
      }),
      catchError(err => {
        this.error = `Error loading users: ${err.message || 'Unknown error'}`;
        console.error('Failed to load users:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        console.log('Users loaded successfully, count:', users.length);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onRoleChange(userId: string, selectedRole: string): void {
    Swal.fire({
      title: 'Change Role?',
      text: `Are you sure you want to change this user's role to "${selectedRole}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.updateUserRole(userId, selectedRole);
      } else {
        this.loadUsers(); // Optional: revert UI selection
      }
    });
  }

  updateUserRole(userId: string, selectedRole: string): void {
    this.usersService.updateUserRoleByAdmin(userId, selectedRole).pipe(
      tap((updatedUser) => {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.role = updatedUser.role;
        }
        Swal.fire({
          icon: 'success',
          title: 'Role updated',
          text: `User role has been changed to "${updatedUser.role}".`,
          timer: 2000,
          showConfirmButton: false
        });
      }),
      catchError(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update user role.',
        });
        return throwError(() => err);
      })
    ).subscribe();
  }

  openUserDetails(user: any): void {
    // First, set the selected user to show the modal
    this.selectedUser = user;

    // Then, fetch detailed user information
    this.loading = true;
    this.usersService.getUserById(user.id).pipe(
      tap(userDetails => {
        console.log('User details received:', userDetails);
        this.selectedUser = userDetails;
      }),
      catchError(err => {
        console.error('Failed to load user details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load user details.',
        });
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  closeUserDetails(): void {
    this.selectedUser = null;
  }
  deleteUser(userId: string): void {
    Swal.fire({
      title: 'Delete User?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.usersService.deleteUser(userId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'User has been deleted.',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadUsers(); // Refresh the list
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete user.',
            });
          }
        });
      }
    });
  }

}
