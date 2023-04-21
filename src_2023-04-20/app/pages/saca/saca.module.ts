import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxAccordionModule,
  DxButtonModule,
  DxDataGridModule, DxDateBoxModule, DxFileUploaderModule,
  DxFormModule, DxMapModule, DxNumberBoxModule,
  DxPopupModule, DxRadioGroupModule, DxSliderModule, DxTabPanelModule,
  DxTreeListModule,
  DxTreeViewModule, DxValidatorModule
} from 'devextreme-angular';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {GoogleMapsModule} from '@angular/google-maps';
import { Saca010Component } from './saca010/saca010.component';
import { Saca020Component } from './saca020/saca020.component';
import { Saca030Component } from './saca030/saca030.component';
import { Saca040Component } from './saca040/saca040.component';
import { Saca050Component } from './saca050/saca050.component';

@NgModule({
  declarations: [
    Saca010Component,
    Saca020Component,
    Saca030Component,
    Saca040Component,
    Saca050Component
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
    DxDateBoxModule,
    DxValidatorModule
  ]
})
export class SacaModule { }
