import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    DxAccordionModule,
    DxButtonModule,
    DxDataGridModule, DxDateBoxModule, DxFileUploaderModule,
    DxFormModule, DxMapModule, DxNumberBoxModule,
    DxPopupModule, DxRadioGroupModule, DxSliderModule, DxTabPanelModule,
    DxTreeListModule,
    DxTreeViewModule
} from 'devextreme-angular';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {GoogleMapsModule} from '@angular/google-maps';
import { Sarc010Component } from './sarc010/sarc010.component';
import { Sarc020Component } from './sarc020/sarc020.component';
import { Sarc030Component } from './sarc030/sarc030.component';
import { Sarc040Component } from './sarc040/sarc040.component';
import { Sarc050Component } from './sarc050/sarc050.component';
import { Sarc060Component } from './sarc060/sarc060.component';
import { Sarc070Component } from './sarc070/sarc070.component';
import { Sarc080Component } from './sarc080/sarc080.component';
import {Sarc031Component} from './sarc030/sarc031.component';

@NgModule({
  declarations: [
    Sarc010Component,
    Sarc020Component,
    Sarc030Component,
    Sarc031Component,
    Sarc040Component,
    Sarc050Component,
    Sarc060Component,
    Sarc070Component,
    Sarc080Component
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
        DxDateBoxModule
    ]
})
export class SarcModule { }
