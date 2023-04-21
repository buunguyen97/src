import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  DxAccordionModule,
  DxButtonModule,
  DxDataGridModule, DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxMapModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSliderModule,
  DxTabPanelModule,
  DxTreeListModule,
  DxTreeViewModule, DxValidatorModule
} from 'devextreme-angular';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {GoogleMapsModule} from '@angular/google-maps';
import {Sast010Component} from './sast010/sast010.component';
import {Sast020Component} from './sast020/sast020.component';
import {Sast030Component} from './sast030/sast030.component';
import {Sast040Component} from './sast040/sast040.component';
import {Sast050Component} from './sast050/sast050.component';
import {Sast060Component} from './sast060/sast060.component';
import {Sast090Component} from './sast090/sast090.component';
import {Sast080Component} from './sast080/sast080.component';
import {Sast070Component} from './sast070/sast070.component';
import {Sast071Component} from './sast070/sast071.component';
import {Sast110Component} from './sast110/sast110.component';
import {Sast120Component} from './sast120/sast120.component';
import {Sast072Component} from './sast072/sast072.component';

@NgModule({
  declarations: [
    Sast010Component,
    Sast020Component,
    Sast030Component,
    Sast040Component,
    Sast050Component,
    Sast060Component,
    Sast090Component,
    Sast080Component,
    Sast070Component,
    Sast071Component,
    Sast072Component,
    Sast110Component,
    Sast120Component
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
export class SastModule {
}
