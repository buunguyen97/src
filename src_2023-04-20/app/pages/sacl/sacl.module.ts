import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    DxAccordionModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule, DxDateBoxModule, DxFileUploaderModule,
    DxFormModule, DxMapModule, DxNumberBoxModule,
    DxPopupModule, DxRadioGroupModule, DxSliderModule, DxTabPanelModule,
    DxTreeListModule,
    DxTreeViewModule, DxValidatorModule
} from 'devextreme-angular';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {GoogleMapsModule} from '@angular/google-maps';
import { Sacl010Component } from './sacl010/sacl010.component';
import { Sacl020Component } from './sacl020/sacl020.component';
import { Sacl030Component } from './sacl030/sacl030.component';
import { Sacl040Component } from './sacl040/sacl040.component';
import { Sacl050Component } from './sacl050/sacl050.component';
import { Sacl060Component } from './sacl060/sacl060.component';
import { Sacl011Component } from './sacl011/sacl011.component';
import { Sacl012Component } from './sacl012/sacl012.component';
import { Sacl013Component } from './sacl013/sacl013.component';
import { Sacl031Component } from './sacl031/sacl031.component';
import { Sacl070Component } from './sacl070/sacl070.component';
import { Sacl080Component } from './sacl080/sacl080.component';

@NgModule({
  declarations: [
    Sacl010Component,
    Sacl020Component,
    Sacl030Component,
    Sacl040Component,
    Sacl050Component,
    Sacl060Component,
    Sacl011Component,
    Sacl012Component,
    Sacl013Component,
    Sacl031Component,
    Sacl070Component,
    Sacl080Component,
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
        DxCheckBoxModule,
        DxDateBoxModule,
        DxValidatorModule
    ]
})
export class SaclModule { }
