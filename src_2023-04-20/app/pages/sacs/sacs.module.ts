import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    DxAccordionModule,
    DxButtonModule,
    DxDataGridModule, DxFileUploaderModule,
    DxFormModule, DxMapModule, DxNumberBoxModule,
    DxPopupModule, DxRadioGroupModule, DxSliderModule, DxTabPanelModule,
    DxTreeListModule,
    DxTreeViewModule
} from 'devextreme-angular';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {GoogleMapsModule} from '@angular/google-maps';
import { Sacs010Component } from './sacs010/sacs010.component';
import { Sacs020Component } from './sacs020/sacs020.component';
import { Sacs030Component } from './sacs030/sacs030.component';
import { Sacs040Component } from './sacs040/sacs040.component';
import { Sacs050Component } from './sacs050/sacs050.component';
import { Sacs060Component } from './sacs060/sacs060.component';
import { Sacs070Component } from './sacs070/sacs070.component';

@NgModule({
  declarations: [
    Sacs010Component,
    Sacs020Component,
    Sacs030Component,
    Sacs040Component,
    Sacs050Component,
    Sacs060Component,
    Sacs070Component
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
        DxFileUploaderModule
    ]
})
export class SacsModule { }
