import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  DxAccordionModule,
  DxButtonModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxMapModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSliderModule,
  DxTabPanelModule,
  DxTreeListModule,
  DxTreeViewModule
} from 'devextreme-angular';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {GoogleMapsModule} from '@angular/google-maps';
import {Sabu010Component} from './sabu010/sabu010.component';
import {Sabu020Component} from './sabu020/sabu020.component';
import {Sabu030Component} from './sabu030/sabu030.component';
import {Sabu040Component} from './sabu040/sabu040.component';
import {Sabu050Component} from './sabu050/sabu050.component';
import {Sabu060Component} from './sabu060/sabu060.component';
import {Sabu070Component} from './sabu070/sabu070.component';
import {Sabu080Component} from './sabu080/sabu080.component';
import {Sabu081Component} from './sabu080/sabu081.component';
import {Sabu090Component} from './sabu090/sabu090.component';
import {Sabu011Component} from './sabu010/sabu011.component';
import {Sabu110Component} from './sabu110/sabu110.component';
import { Sabu120Component } from './sabu120/sabu120.component';

@NgModule({
  declarations: [
    Sabu010Component,
    Sabu011Component,
    Sabu020Component,
    Sabu030Component,
    Sabu040Component,
    Sabu050Component,
    Sabu060Component,
    Sabu070Component,
    Sabu080Component,
    Sabu081Component,
    Sabu090Component,
    Sabu110Component,
    Sabu120Component
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
export class SabuModule {
}
