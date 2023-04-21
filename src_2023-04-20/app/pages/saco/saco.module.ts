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
import { Saco010Component } from './saco010/saco010.component';
import { Saco020Component } from './saco020/saco020.component';
import { Saco030Component } from './saco030/saco030.component';
import { Saco040Component } from './saco040/saco040.component';
import { Saco050Component } from './saco050/saco050.component';
import { Saco060Component } from './saco060/saco060.component';

@NgModule({
  declarations: [
    Saco010Component,
    Saco020Component,
    Saco030Component,
    Saco040Component,
    Saco050Component,
    Saco060Component
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
export class SacoModule { }
