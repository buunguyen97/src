import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Sasd010Component} from './sasd010/sasd010.component';
import {Sasd020Component} from './sasd020/sasd020.component';

import {
    DxAccordionModule,
    DxButtonModule,
    DxDataGridModule, DxFileUploaderModule,
    DxFormModule, DxMapModule, DxNumberBoxModule,
    DxPopupModule, DxRadioGroupModule, DxSliderModule, DxTabPanelModule,
    DxTreeListModule, DxGalleryModule,
    DxTreeViewModule, DxDateBoxModule
} from 'devextreme-angular';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {GoogleMapsModule} from '@angular/google-maps';
import { Sasd030Component } from './sasd030/sasd030.component';
import { Sasd040Component } from './sasd040/sasd040.component';
import { Sasd050Component } from './sasd050/sasd050.component';

@NgModule({
  declarations: [
    Sasd010Component,
    Sasd020Component,
    Sasd030Component,
    Sasd040Component,
    Sasd050Component
  ],
    imports: [
        CommonModule,
        DxButtonModule,
        DxAccordionModule,
        DxFormModule,
        DxDataGridModule,
        DxPopupModule,
        DxTreeListModule,
        NgxQRCodeModule,
        DxTreeViewModule,
        DxMapModule,
        DxSliderModule,
        DxNumberBoxModule,
        DxRadioGroupModule,
        DxTabPanelModule,
        GoogleMapsModule,
        DxFileUploaderModule,
        DxGalleryModule,
        DxDateBoxModule
    ]
})
export class SasdModule { }
