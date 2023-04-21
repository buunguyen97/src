import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {
  DxAccordionModule,
  DxButtonGroupModule,
  DxButtonModule,
  DxChartModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxLookupModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTreeViewModule
} from 'devextreme-angular';
import {SoComponent} from './so/so.component';
import {SoacceptComponent} from './soaccept/soaccept.component';
import {SoacceptcancelComponent} from './soacceptcancel/soacceptcancel.component';
import {SopickComponent} from './sopick/sopick.component';
import {SopickcancelComponent} from './sopickcancel/sopickcancel.component';
import {SoallocateComponent} from './soallocate/soallocate.component';
import {SoallocatecancelComponent} from './soallocatecancel/soallocatecancel.component';
import {SoconfirmedComponent} from './soconfirmed/soconfirmed.component';
import {SostatusComponent} from './sostatus/sostatus.component';
import {SopopupComponent} from './sopopup/sopopup.component';
import {SoconfirmedcancelComponent} from './soconfirmedcancel/soconfirmedcancel.component';
import {SodirectshipComponent} from './sodirectship/sodirectship.component';
import {PickStatusComponent} from './pick-status/pick-status.component';
import {ArrangeTruckComponent} from './arrange-truck/arrange-truck.component';
import {SoinspectComponent} from './soinspect/soinspect.component';
import {ArrangeTruckConfirmComponent} from './arrange-truck-confirm/arrange-truck-confirm.component';
import {DxoLookupModule} from 'devextreme-angular/ui/nested';
import {SoCommonUtils} from './soCommonUtils';
import {SoallocreportComponent} from './soallocreport/soallocreport.component';
import {SoReportComponent} from './so-report/so-report.component';

@NgModule({
  declarations: [
    SopopupComponent,
    SoComponent,
    SoacceptComponent,
    SoacceptcancelComponent,
    SopickComponent,
    SopickcancelComponent,
    SoallocateComponent,
    SoallocatecancelComponent,
    SoconfirmedComponent,
    SostatusComponent,
    SoconfirmedcancelComponent,
    SodirectshipComponent,
    PickStatusComponent,
    ArrangeTruckComponent,
    PickStatusComponent,
    SoinspectComponent,
    ArrangeTruckConfirmComponent,
    SoallocreportComponent,
    SoReportComponent
  ],
  imports: [
    CommonModule,
    DxPopupModule,
    DxButtonModule,
    DxAccordionModule,
    DxFormModule,
    DxDataGridModule,
    DxDropDownBoxModule,
    DxButtonGroupModule,
    DxSelectBoxModule,
    DxChartModule,
    DxTabPanelModule,
    DxLookupModule,
    DxoLookupModule,
    DxFileUploaderModule,
    DxTreeViewModule,
    DxDateBoxModule
  ],
  providers: [
    SoCommonUtils
  ]
})
export class SoModule {
}
