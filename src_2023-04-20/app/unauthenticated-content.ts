/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : unauthenticated-content.ts
 * Author : jbh5310
 * Lastupdate : 2021-02-14 03:21:03
 */

import {CommonModule} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {SingleCardModule} from 'src/app/layouts';

@Component({
  selector: 'app-unauthenticated-content',
  template: `
    <app-single-card [title]="title" [description]="description">
      <router-outlet></router-outlet>
    </app-single-card>
    <style>@-webkit-keyframes spin {
             0% {
               transform: rotate(0)
             }
             100% {
               transform: rotate(360deg)
             }
           }

    @-moz-keyframes spin {
      0% {
        -moz-transform: rotate(0)
      }
      100% {
        -moz-transform: rotate(360deg)
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0)
      }
      100% {
        transform: rotate(360deg)
      }
    }

    .spinner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1003;
      background: #000000;
      overflow: hidden
    }

    .spinner div:first-child {
      display: block;
      position: relative;
      left: 50%;
      top: 50%;
      width: 150px;
      height: 150px;
      margin: -75px 0 0 -75px;
      border-radius: 50%;
      box-shadow: 0 3px 3px 0 rgba(255, 56, 106, 1);
      transform: translate3d(0, 0, 0);
      animation: spin 2s linear infinite
    }

    .spinner div:first-child:after, .spinner div:first-child:before {
      content: '';
      position: absolute;
      border-radius: 50%
    }

    .spinner div:first-child:before {
      top: 5px;
      left: 5px;
      right: 5px;
      bottom: 5px;
      box-shadow: 0 3px 3px 0 rgb(255, 228, 32);
      -webkit-animation: spin 3s linear infinite;
      animation: spin 3s linear infinite
    }

    .spinner div:first-child:after {
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      box-shadow: 0 3px 3px 0 rgba(61, 175, 255, 1);
      animation: spin 1.5s linear infinite
    }</style>
    <div id="nb-global-spinner" class="spinner" style="display: block;">
      <div class="blob blob-0"></div>
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
      <div class="blob blob-5"></div>
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
  `]
})
export class UnauthenticatedContentComponent {

  constructor(private router: Router) {
  }

  get title(): string {
    const path = this.router.url.split('/')[1];
    switch (path) {
      case 'login-form':
        return 'Sign In';
      case 'reset-password':
        return 'Reset Password';
      case 'create-account':
        return 'Sign Up';
      case 'change-password':
        return 'Change Password';
    }
  }

  get description(): string {
    const path = this.router.url.split('/')[1];
    switch (path) {
      case 'reset-password':
        return 'Please enter the email address that you used to register, and we will send you a link to reset your password via Email.';
    }
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SingleCardModule,
  ],
  declarations: [UnauthenticatedContentComponent],
  exports: [UnauthenticatedContentComponent]
})
export class UnauthenticatedContentModule {
}
