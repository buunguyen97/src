import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WarehouseComponent} from './warehouse/warehouse.component';
import {AllocPriorityComponent} from './alloc-priority/alloc-priority.component';
import {ApplicationComponent} from './application/application.component';
import {CodeComponent} from './code/code.component';
import {CompanyComponent} from './company/company.component';
import {ItemComponent} from './item/item.component';
import {ItemadminComponent} from './itemadmin/itemadmin.component';
import {LocationComponent} from './location/location.component';
import {MenuComponent} from './menu/menu.component';
import {MfmessageComponent} from './mfmessage/mfmessage.component';
import {PgmauthorityComponent} from './pgmauthority/pgmauthority.component';
import {ReceiverequestComponent} from './receiverequest/receiverequest.component';
import {ReleaserequestComponent} from './releaserequest/releaserequest.component';
import {ReplenishPriorityComponent} from './replenish-priority/replenish-priority.component';
import {SlotPriorityComponent} from './slot-priority/slot-priority.component';
import {UserComponent} from './user/user.component';
import {SampleComponent} from './sample/sample.component';
import {
  DevExtremeModule,
  DxAccordionModule,
  DxButtonModule,
  DxDataGridModule,
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
import {TruckComponent} from './truck/truck.component';
import {ItemCategoryComponent} from './item-category/item-category.component';
import {BomComponent} from './bom/bom.component';
import {Code1Component} from './code1/code1.component';
import {MapviewComponent} from './mapview/mapview.component';
import {MmSerialComponent} from './mm-serial/mm-serial.component';
import {WhxItemComponent} from './whx-item/whx-item.component';
import {ItemAlporterComponent} from './itemAlporter/ItemAlporter.component';
import {CompanyAlporterComponent} from './company-alporter/company-alporter.component';
import {BomAdminComponent} from './bom-admin/bom-admin.component';
import {PtRouteComponent} from './pt-route/pt-route.component';
import {PtItemRouteComponent} from './pt-item-route/pt-item-route.component';
import {PtProdRqComponent} from './pt-prod-rq/pt-prod-rq.component';
import {PtProdRelComponent} from './pt-prod-rel/pt-prod-rel.component';
import {PtProdInvStatusComponent} from './pt-prod-inv-status/pt-prod-inv-status.component';
import { PtProdProgStatusComponent } from './pt-prod-prog-status/pt-prod-prog-status.component';
import { ProdTotComponent } from './prod-tot/prod-tot.component';
import { PtProdCostComponent } from './pt-prod-cost/pt-prod-cost.component';
import { PtProdMatCostComponent } from './pt-prod-mat-cost/pt-prod-mat-cost.component';
import { PtProdMatTotComponent } from './pt-prod-mat-tot/pt-prod-mat-tot.component';
import { PtProdMatCostProcessComponent } from './pt-prod-mat-cost-process/pt-prod-mat-cost-process.component';
import { CostStatusComponent } from './cost-status/cost-status.component';
import { CostStatementComponent } from './cost-statement/cost-statement.component';
import { PtItemCostComponent } from './pt-item-cost/pt-item-cost.component';
import { PtProdRelStatusComponent } from './pt-prod-rel-status/pt-prod-rel-status.component';
import { PtProdRqConfirmComponent } from './pt-prod-rq-confirm/pt-prod-rq-confirm.component';
import { InfMonitoringComponent } from './inf-monitoring/inf-monitoring.component';
import { ReportMngComponent } from './report-mng/report-mng.component';

@NgModule({
  declarations: [
    AllocPriorityComponent,
    ApplicationComponent,
    CodeComponent,
    CompanyComponent,
    ItemComponent,
    ItemadminComponent,
    LocationComponent,
    MenuComponent,
    MfmessageComponent,
    PgmauthorityComponent,
    ReceiverequestComponent,
    ReleaserequestComponent,
    ReplenishPriorityComponent,
    SampleComponent,
    SlotPriorityComponent,
    UserComponent,
    WarehouseComponent,
    TruckComponent,
    ItemCategoryComponent,
    BomComponent,
    Code1Component,
    MapviewComponent,
    MmSerialComponent,
    WhxItemComponent,
    ItemAlporterComponent,
    CompanyAlporterComponent,
    BomAdminComponent,
    PtRouteComponent,
    PtItemRouteComponent,
    PtProdRqComponent,
    PtProdRelComponent,
    PtProdInvStatusComponent,
    PtProdProgStatusComponent,
    ProdTotComponent,
    PtProdCostComponent,
    PtProdMatCostComponent,
    PtProdMatTotComponent,
    PtProdMatCostProcessComponent,
    CostStatusComponent,
    CostStatementComponent,
    PtItemCostComponent,
    PtProdRelStatusComponent,
    PtProdRqConfirmComponent,
    InfMonitoringComponent,
    ReportMngComponent
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
    DevExtremeModule
  ]
})
export class MmModule {
}
