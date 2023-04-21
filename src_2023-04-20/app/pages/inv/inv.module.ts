import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LocationStatusComponent} from './location-status/location-status.component';
import {DevExtremeModule, DxAccordionModule, DxButtonModule, DxFormModule} from 'devextreme-angular';
import {InvTagWhComponent} from './inv-tag-wh/inv-tag-wh.component';
import {InvTagWhLocationComponent} from './inv-tag-wh-location/inv-tag-wh-location.component';
import {MoveLocationComponent} from './moveLocation/moveLocation.component';
import {RiInstructComponent} from './ri-instruct/ri-instruct.component';
import {WarehousemoveComponent} from './warehousemove/warehousemove.component';
import {RiInstructCancelComponent} from './ri-instruct-cancel/ri-instruct-cancel.component';
import {RiInstructResultComponent} from './ri-instruct-result/ri-instruct-result.component';
import {InvadjustComponent} from './invadjust/invadjust.component';
import {InOutHistoryComponent} from './in-out-history/in-out-history.component';
import {InOutTranHistoryComponent} from './in-out-tran-history/in-out-tran-history.component';
import {WarehousemovelocComponent} from './warehousemoveloc/warehousemoveloc.component';
import {PhyinstructComponent} from './phyinstruct/phyinstruct.component';
import {PhyconfirmedComponent} from './phyconfirmed/phyconfirmed.component';
import {SeparateComponent} from './separate/separate.component';
import {InvTagWhLocationLotComponent} from './inv-tag-wh-location-lot/inv-tag-wh-location-lot.component';
import {MatinstructComponent} from './matinstruct/matinstruct.component';
import {MatconfirmedComponent} from './matconfirmed/matconfirmed.component';
import {RiInstructReportComponent} from './ri-instruct-report/ri-instruct-report.component';
import {PhyconfirmedReportComponent} from './phyconfirmed-report/phyconfirmed-report.component';
import {LogicalWhMoveComponent} from './logical-wh-move/logical-wh-move.component';
import {LogicalWhMoveConfComponent} from './logical-wh-move-conf/logical-wh-move-conf.component';
import {LogicalWhMoveOutComponent} from './logical-wh-move-out/logical-wh-move-out.component';
import {LogicalWhMoveOutConfComponent} from './logical-wh-move-out-conf/logical-wh-move-out-conf.component';
import {InvadjustConfirmComponent} from './invadjust/invadjust-confirm.component';


@NgModule({
  declarations: [
    LocationStatusComponent,
    InvTagWhComponent,
    InvTagWhLocationComponent,
    MoveLocationComponent,
    RiInstructComponent,
    MoveLocationComponent,
    WarehousemoveComponent,
    RiInstructCancelComponent,
    RiInstructResultComponent,
    InvadjustComponent,
    RiInstructResultComponent,
    InOutHistoryComponent,
    InOutTranHistoryComponent,
    WarehousemovelocComponent,
    PhyinstructComponent,
    PhyconfirmedComponent,
    SeparateComponent,
    InvTagWhLocationLotComponent,
    MatinstructComponent,
    MatconfirmedComponent,
    RiInstructReportComponent,
    PhyconfirmedReportComponent,
    LogicalWhMoveComponent,
    LogicalWhMoveConfComponent,
    LogicalWhMoveOutComponent,
    LogicalWhMoveOutConfComponent,
    InvadjustConfirmComponent
  ],
  imports: [
    CommonModule,
    DxButtonModule,
    DxAccordionModule,
    DxFormModule,
    DevExtremeModule
  ]
})
export class InvModule {
}
