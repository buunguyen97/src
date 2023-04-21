import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RcvexpectedComponent} from './rcvexpected/rcvexpected.component';
import {RcvacceptComponent} from './rcvaccept/rcvaccept.component';
import {
  DevExtremeModule,
  DxAccordionModule,
  DxButtonModule,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule
} from 'devextreme-angular';
import {RcvacceptcancelComponent} from './rcvacceptcancel/rcvacceptcancel.component';
import {RcvprogressComponent} from './rcvprogress/rcvprogress.component';
import {RcvmodifylocationComponent} from './rcvmodifylocation/rcvmodifylocation.component';
import {RcvcompleteComponent} from './rcvcomplete/rcvcomplete.component';
import {RcvinstructComponent} from './rcvinstruct/rcvinstruct.component';
import {RcvCommonUtils} from './rcvCommonUtils';
import {RcvperformregistrationComponent} from './rcvperformregistration/rcvperformregistration.component';
import {RcvinstructcancelComponent} from './rcvinstructcancel/rcvinstructcancel.component';
import {RcvapprovalcancelComponent} from './rcvapprovalcancel/rcvapprovalcancel.component';
import {RcvmodifyschdateComponent} from './rcvmodifyschdate/rcvmodifyschdate.component';
import {RcvapprovalComponent} from './rcvapproval/rcvapproval.component';
import {RcvdirectComponent} from './rcvdirect/rcvdirect.component';
import {RcvproduceComponent} from './rcvproduce/rcvproduce.component';
import {RcvProduceStatusComponent} from './rcvProduceStatus/rcv-produce-status.component';
import {RcvInspectComponent} from './rcv-inspect/rcv-inspect.component';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import { RcvinstructReportComponent } from './rcvinstruct-report/rcvinstruct-report.component';
import { RcvComponent } from './rcv/rcv.component';

@NgModule({
  declarations: [
    RcvexpectedComponent,
    RcvacceptComponent,
    RcvacceptcancelComponent,
    RcvprogressComponent,
    RcvmodifylocationComponent,
    RcvcompleteComponent,
    RcvinstructComponent,
    RcvperformregistrationComponent,
    RcvinstructcancelComponent,
    RcvapprovalcancelComponent,
    RcvmodifyschdateComponent,
    RcvapprovalComponent,
    RcvdirectComponent,
    RcvproduceComponent,
    RcvProduceStatusComponent,
    RcvInspectComponent,
    RcvinstructReportComponent,
    RcvComponent
  ],
  imports: [
    CommonModule,
    DxButtonModule,
    DxAccordionModule,
    DxFormModule,
    DxDataGridModule,
    DxPopupModule,
    DevExtremeModule,
    NgxQRCodeModule
  ],
  providers: [
    RcvCommonUtils
  ]
})
export class RcvModule {
}
