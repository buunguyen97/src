/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : app-routing.module.ts
 * Author : jbh5310
 * Lastupdate : 2021-09-21 16:08:12
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  ChangePasswordFormComponent,
  CreateAccountFormComponent,
  LoginFormComponent,
  ResetPasswordFormComponent
} from './shared/components';
import {AuthGuardService} from './shared/services';
import {HomeComponent} from './pages/home/home.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {TasksComponent} from './pages/tasks/tasks.component';
import {DevExtremeModule, DxDataGridModule, DxFormModule} from 'devextreme-angular';
// import {ItemComponent} from './pages/wm/master/item/item.component';
// import {TenantComponent} from './pages/wm/master/tenant/tenant.component';
// import {LocationComponent} from './pages/wm/master/location/location.component';
// import {ReceiveComponent} from './pages/wm/receive/receive/receive.component';
import {CompanyComponent} from './pages/mm/company/company.component';
import {UserComponent} from './pages/mm/user/user.component';
import {WarehouseComponent} from './pages/mm/warehouse/warehouse.component';
import {LocationComponent} from './pages/mm/location/location.component';
import {ItemComponent} from './pages/mm/item/item.component';
import {ReleaserequestComponent} from './pages/mm/releaserequest/releaserequest.component';
import {ReceiverequestComponent} from './pages/mm/receiverequest/receiverequest.component';
import {CodeComponent} from './pages/mm/code/code.component';
import {ApplicationComponent} from './pages/mm/application/application.component';
import {SampleComponent} from './pages/mm/sample/sample.component';
import {MfmessageComponent} from './pages/mm/mfmessage/mfmessage.component';
import {ItemadminComponent} from './pages/mm/itemadmin/itemadmin.component';
import {MenuComponent} from './pages/mm/menu/menu.component';
import {RcvexpectedComponent} from './pages/rcv/rcvexpected/rcvexpected.component';
import {LocationStatusComponent} from './pages/inv/location-status/location-status.component';
import {PgmauthorityComponent} from './pages/mm/pgmauthority/pgmauthority.component';
import {SoComponent} from './pages/so/so/so.component';
import {RcvacceptComponent} from './pages/rcv/rcvaccept/rcvaccept.component';
import {SoacceptComponent} from './pages/so/soaccept/soaccept.component';
import {SoacceptcancelComponent} from './pages/so/soacceptcancel/soacceptcancel.component';
import {RcvacceptcancelComponent} from './pages/rcv/rcvacceptcancel/rcvacceptcancel.component';
import {SopickComponent} from './pages/so/sopick/sopick.component';
import {RcvprogressComponent} from './pages/rcv/rcvprogress/rcvprogress.component';
import {RcvmodifylocationComponent} from './pages/rcv/rcvmodifylocation/rcvmodifylocation.component';
import {PickStatusComponent} from './pages/so/pick-status/pick-status.component';
import {SopickcancelComponent} from './pages/so/sopickcancel/sopickcancel.component';
import {RcvapprovalComponent} from './pages/rcv/rcvapproval/rcvapproval.component';
import {RcvinstructComponent} from './pages/rcv/rcvinstruct/rcvinstruct.component';
import {InvTagWhComponent} from './pages/inv/inv-tag-wh/inv-tag-wh.component';
import {SoallocateComponent} from './pages/so/soallocate/soallocate.component';
import {SoallocatecancelComponent} from './pages/so/soallocatecancel/soallocatecancel.component';
import {InvTagWhLocationComponent} from './pages/inv/inv-tag-wh-location/inv-tag-wh-location.component';
import {SoconfirmedComponent} from './pages/so/soconfirmed/soconfirmed.component';
import {SostatusComponent} from './pages/so/sostatus/sostatus.component';
import {MoveLocationComponent} from './pages/inv/moveLocation/moveLocation.component';
import {RcvperformregistrationComponent} from './pages/rcv/rcvperformregistration/rcvperformregistration.component';
import {RcvinstructcancelComponent} from './pages/rcv/rcvinstructcancel/rcvinstructcancel.component';
import {SoconfirmedcancelComponent} from './pages/so/soconfirmedcancel/soconfirmedcancel.component';
import {RcvapprovalcancelComponent} from './pages/rcv/rcvapprovalcancel/rcvapprovalcancel.component';
import {RcvmodifyschdateComponent} from './pages/rcv/rcvmodifyschdate/rcvmodifyschdate.component';
import {RcvcompleteComponent} from './pages/rcv/rcvcomplete/rcvcomplete.component';
import {RiInstructComponent} from './pages/inv/ri-instruct/ri-instruct.component';
import {WarehousemoveComponent} from './pages/inv/warehousemove/warehousemove.component';
import {RcvdirectComponent} from './pages/rcv/rcvdirect/rcvdirect.component';
import {RiInstructCancelComponent} from './pages/inv/ri-instruct-cancel/ri-instruct-cancel.component';
import {SodirectshipComponent} from './pages/so/sodirectship/sodirectship.component';
import {RiInstructResultComponent} from './pages/inv/ri-instruct-result/ri-instruct-result.component';
import {InOutHistoryComponent} from './pages/inv/in-out-history/in-out-history.component';
import {InvadjustComponent} from './pages/inv/invadjust/invadjust.component';
import {InOutTranHistoryComponent} from './pages/inv/in-out-tran-history/in-out-tran-history.component';
import {SlotPriorityComponent} from './pages/mm/slot-priority/slot-priority.component';
import {WarehousemovelocComponent} from './pages/inv/warehousemoveloc/warehousemoveloc.component';
import {PhyinstructComponent} from './pages/inv/phyinstruct/phyinstruct.component';
import {PhyconfirmedComponent} from './pages/inv/phyconfirmed/phyconfirmed.component';
import {AllocPriorityComponent} from './pages/mm/alloc-priority/alloc-priority.component';
import {ReplenishPriorityComponent} from './pages/mm/replenish-priority/replenish-priority.component';
import {SeparateComponent} from './pages/inv/separate/separate.component';
import {ArrangeTruckComponent} from './pages/so/arrange-truck/arrange-truck.component';
import {SoinspectComponent} from './pages/so/soinspect/soinspect.component';
import {TruckComponent} from './pages/mm/truck/truck.component';
import {ArrangeTruckConfirmComponent} from './pages/so/arrange-truck-confirm/arrange-truck-confirm.component';
import {ItemCategoryComponent} from './pages/mm/item-category/item-category.component';
import {InvTagWhLocationLotComponent} from './pages/inv/inv-tag-wh-location-lot/inv-tag-wh-location-lot.component';
import {RcvproduceComponent} from './pages/rcv/rcvproduce/rcvproduce.component';
import {BomComponent} from './pages/mm/bom/bom.component';
import {MatinstructComponent} from './pages/inv/matinstruct/matinstruct.component';
import {Code1Component} from './pages/mm/code1/code1.component';
import {MapviewComponent} from './pages/mm/mapview/mapview.component';
import {MatconfirmedComponent} from './pages/inv/matconfirmed/matconfirmed.component';
import {RcvProduceStatusComponent} from './pages/rcv/rcvProduceStatus/rcv-produce-status.component';
import {Sasd010Component} from './pages/sasd/sasd010/sasd010.component';
import {Sasd020Component} from './pages/sasd/sasd020/sasd020.component';
import {Sasd030Component} from './pages/sasd/sasd030/sasd030.component';
import {Sasd040Component} from './pages/sasd/sasd040/sasd040.component';
import {Sasd050Component} from './pages/sasd/sasd050/sasd050.component';
import {Sacs010Component} from './pages/sacs/sacs010/sacs010.component';
import {Saor010Component} from './pages/saor/saor010/saor010.component';
import {Sarc010Component} from './pages/sarc/sarc010/sarc010.component';
import {Sarc020Component} from './pages/sarc/sarc020/sarc020.component';
import {Sacs020Component} from './pages/sacs/sacs020/sacs020.component';
import {Sacs030Component} from './pages/sacs/sacs030/sacs030.component';
import {Saor020Component} from './pages/saor/saor020/saor020.component';
import {Saor030Component} from './pages/saor/saor030/saor030.component';
import {Saor040Component} from './pages/saor/saor040/saor040.component';
import {Sacs040Component} from './pages/sacs/sacs040/sacs040.component';
import {Sacs050Component} from './pages/sacs/sacs050/sacs050.component';
import {Saor050Component} from './pages/saor/saor050/saor050.component';
import {Saor060Component} from './pages/saor/saor060/saor060.component';
import {Saor070Component} from './pages/saor/saor070/saor070.component';
import {Sarc030Component} from './pages/sarc/sarc030/sarc030.component';
import {Sarc040Component} from './pages/sarc/sarc040/sarc040.component';
import {Saco010Component} from './pages/saco/saco010/saco010.component';
import {Saco020Component} from './pages/saco/saco020/saco020.component';
import {Sacl010Component} from './pages/sacl/sacl010/sacl010.component';
import {Sacl011Component} from './pages/sacl/sacl011/sacl011.component';
import {Sacl012Component} from './pages/sacl/sacl012/sacl012.component';
import {Sacl013Component} from './pages/sacl/sacl013/sacl013.component';
import {Sacl020Component} from './pages/sacl/sacl020/sacl020.component';
import {Sabu010Component} from './pages/sabu/sabu010/sabu010.component';
import {Sabu020Component} from './pages/sabu/sabu020/sabu020.component';
import {Sast010Component} from './pages/sast/sast010/sast010.component';
import {Sabu030Component} from './pages/sabu/sabu030/sabu030.component';
import {Sabu040Component} from './pages/sabu/sabu040/sabu040.component';
import {Sabu050Component} from './pages/sabu/sabu050/sabu050.component';
import {Sabu060Component} from './pages/sabu/sabu060/sabu060.component';
import {Sabu070Component} from './pages/sabu/sabu070/sabu070.component';
import {Sabu080Component} from './pages/sabu/sabu080/sabu080.component';
import {Sabu090Component} from './pages/sabu/sabu090/sabu090.component';
import {Sabu110Component} from './pages/sabu/sabu110/sabu110.component';
import {Sabu120Component} from './pages/sabu/sabu120/sabu120.component';
import {Sarc050Component} from './pages/sarc/sarc050/sarc050.component';
import {Sarc060Component} from './pages/sarc/sarc060/sarc060.component';
import {Sarc070Component} from './pages/sarc/sarc070/sarc070.component';
import {Sarc080Component} from './pages/sarc/sarc080/sarc080.component';
import {Saor090Component} from './pages/saor/saor090/saor090.component';
import {Saor100Component} from './pages/saor/saor100/saor100.component';
import {Saor110Component} from './pages/saor/saor110/saor110.component';
import {Saor120Component} from './pages/saor/saor120/saor120.component';
import {Saor130Component} from './pages/saor/saor130/saor130.component';
import {Saor140Component} from './pages/saor/saor140/saor140.component';
import {Saor150Component} from './pages/saor/saor150/saor150.component';
import {Saor160Component} from './pages/saor/saor160/saor160.component';
import {Saor170Component} from './pages/saor/saor170/saor170.component';
import {Saor180Component} from './pages/saor/saor180/saor180.component';
import {Saor200Component} from './pages/saor/saor200/saor200.component';
import {Saor080Component} from './pages/saor/saor080/saor080.component';
import {Sacl030Component} from './pages/sacl/sacl030/sacl030.component';
import {Sacl031Component} from './pages/sacl/sacl031/sacl031.component';
import {Saca010Component} from './pages/saca/saca010/saca010.component';
import {Saca020Component} from './pages/saca/saca020/saca020.component';
import {Saco030Component} from './pages/saco/saco030/saco030.component';
import {Saco040Component} from './pages/saco/saco040/saco040.component';
import {Saco050Component} from './pages/saco/saco050/saco050.component';
import {Saco060Component} from './pages/saco/saco060/saco060.component';
import {Saca030Component} from './pages/saca/saca030/saca030.component';
import {Saor190Component} from './pages/saor/saor190/saor190.component';
import {Saca040Component} from './pages/saca/saca040/saca040.component';
import {Sast020Component} from './pages/sast/sast020/sast020.component';
import {Sast030Component} from './pages/sast/sast030/sast030.component';
import {Sast040Component} from './pages/sast/sast040/sast040.component';
import {Sast050Component} from './pages/sast/sast050/sast050.component';
import {Sast060Component} from './pages/sast/sast060/sast060.component';
import {Sast110Component} from './pages/sast/sast110/sast110.component';
import {Sacl040Component} from './pages/sacl/sacl040/sacl040.component';
import {Sacl060Component} from './pages/sacl/sacl060/sacl060.component';
import {SoallocreportComponent} from './pages/so/soallocreport/soallocreport.component';
import {SoReportComponent} from './pages/so/so-report/so-report.component';
import {RcvInspectComponent} from './pages/rcv/rcv-inspect/rcv-inspect.component';
import {RiInstructReportComponent} from './pages/inv/ri-instruct-report/ri-instruct-report.component';
import {QrpageComponent} from './shared/components/qrpage/qrpage.component';
import {RcvinstructReportComponent} from './pages/rcv/rcvinstruct-report/rcvinstruct-report.component';
import {PhyconfirmedReportComponent} from './pages/inv/phyconfirmed-report/phyconfirmed-report.component';
import {MmSerialComponent} from './pages/mm/mm-serial/mm-serial.component';
import {WhxItemComponent} from './pages/mm/whx-item/whx-item.component';
import {ItemAlporterComponent} from './pages/mm/itemAlporter/ItemAlporter.component';
import {CompanyAlporterComponent} from './pages/mm/company-alporter/company-alporter.component';
import {BomAdminComponent} from './pages/mm/bom-admin/bom-admin.component';
import {PtRouteComponent} from './pages/mm/pt-route/pt-route.component';
import {PtItemRouteComponent} from './pages/mm/pt-item-route/pt-item-route.component';
import {PtProdRqComponent} from './pages/mm/pt-prod-rq/pt-prod-rq.component';
import {PtProdRelComponent} from './pages/mm/pt-prod-rel/pt-prod-rel.component';
import {PtProdInvStatusComponent} from './pages/mm/pt-prod-inv-status/pt-prod-inv-status.component';
import {PtProdProgStatusComponent} from './pages/mm/pt-prod-prog-status/pt-prod-prog-status.component';
import {ProdTotComponent} from './pages/mm/prod-tot/prod-tot.component';
import {PtProdCostComponent} from './pages/mm/pt-prod-cost/pt-prod-cost.component';
import {PtProdMatCostComponent} from './pages/mm/pt-prod-mat-cost/pt-prod-mat-cost.component';
import {PtProdMatTotComponent} from './pages/mm/pt-prod-mat-tot/pt-prod-mat-tot.component';
import {PtProdMatCostProcessComponent} from './pages/mm/pt-prod-mat-cost-process/pt-prod-mat-cost-process.component';
import {PtItemCostComponent} from './pages/mm/pt-item-cost/pt-item-cost.component';
import {CostStatusComponent} from './pages/mm/cost-status/cost-status.component';
import {CostStatementComponent} from './pages/mm/cost-statement/cost-statement.component';
import {PtProdRelStatusComponent} from './pages/mm/pt-prod-rel-status/pt-prod-rel-status.component';
import {PtProdRqConfirmComponent} from './pages/mm/pt-prod-rq-confirm/pt-prod-rq-confirm.component';
import {Saor210Component} from './pages/saor/saor210/saor210.component';
import {LogicalWhMoveComponent} from './pages/inv/logical-wh-move/logical-wh-move.component';
import {LogicalWhMoveConfComponent} from './pages/inv/logical-wh-move-conf/logical-wh-move-conf.component';
import {LogicalWhMoveOutComponent} from './pages/inv/logical-wh-move-out/logical-wh-move-out.component';
import {LogicalWhMoveOutConfComponent} from './pages/inv/logical-wh-move-out-conf/logical-wh-move-out-conf.component';
import {Saor011Component} from './pages/saor/saor010/saor011.component';
import {Saor021Component} from './pages/saor/saor020/saor021.component';
import {Sacs060Component} from './pages/sacs/sacs060/sacs060.component';
import {Sacs070Component} from './pages/sacs/sacs070/sacs070.component';
import {Sacl050Component} from './pages/sacl/sacl050/sacl050.component';
import {Sast080Component} from './pages/sast/sast080/sast080.component';
import {Sast090Component} from './pages/sast/sast090/sast090.component';
import {Sast070Component} from './pages/sast/sast070/sast070.component';
import {Sabu011Component} from './pages/sabu/sabu010/sabu011.component';
import {InfMonitoringComponent} from './pages/mm/inf-monitoring/inf-monitoring.component';
import {Saor220Component} from './pages/saor/saor220/saor220.component';
import {Saor230Component} from './pages/saor/saor230/saor230.component';
import {Saor240Component} from './pages/saor/saor240/saor240.component';
import {Saor250Component} from './pages/saor/saor250/saor250.component';
import {Saor031Component} from './pages/saor/saor030/saor031.component';
import {ReportMngComponent} from './pages/mm/report-mng/report-mng.component';
import {InvadjustConfirmComponent} from './pages/inv/invadjust/invadjust-confirm.component';
import {Sast071Component} from './pages/sast/sast070/sast071.component';
import {Sast120Component} from './pages/sast/sast120/sast120.component';
import {Sacl070Component} from './pages/sacl/sacl070/sacl070.component';
import {Sacl080Component} from './pages/sacl/sacl080/sacl080.component';
import {Saor061Component} from './pages/saor/saor060/saor061.component';
import {Saca050Component} from './pages/saca/saca050/saca050.component';
import {Sarc031Component} from './pages/sarc/sarc030/sarc031.component';
import {Sabu081Component} from './pages/sabu/sabu080/sabu081.component';
import {Saor251Component} from './pages/saor/saor250/saor251.component';
import {Saor241Component} from './pages/saor/saor240/saor241.component';
import {Sast072Component} from './pages/sast/sast072/sast072.component';
import {RcvComponent} from './pages/rcv/rcv/rcv.component';
const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'reset-password',
    component: ResetPasswordFormComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'create-account',
    component: CreateAccountFormComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'change-password/:recoveryCode',
    component: ChangePasswordFormComponent,
    canActivate: [AuthGuardService]
  },
  // {
  //   path: 'wm/master/tenant',
  //   component: TenantComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'wm/master/warehouse',
  //   component: WarehouseComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'wm/master/location',
  //   component: LocationComponent,
  //   canActivate: [ AuthGuardService ]
  // },
  // {
  //   path: 'wm/master/user',
  //   component: UsersComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'wm/master/company',
  //   component: CompanyComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'wm/master/itemAdmin',
  //   component: ItemAdminComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'wm/master/item',
  //   component: ItemComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'wm/receive/receive',
  //   component: ReceiveComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'wm/receive/rcv-serial',
  //   component: RcvSerialComponent,
  //   canActivate: [AuthGuardService]
  // },
  {
    path: 'mm/company',
    component: CompanyComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/companyalporter',
    component: CompanyAlporterComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/user',
    component: UserComponent,
    canActivate: [AuthGuardService]
  },
  // {
  //   path: 'mm/profile',
  //   component: ProfileComponent,
  //   canActivate: [AuthGuardService]
  // },
  {
    path: 'mm/warehouse',
    component: WarehouseComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/location',
    component: LocationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/item',
    component: ItemComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/itemalporter',
    component: ItemAlporterComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/itemadmin',
    component: ItemadminComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/releaserequest/:param',
    component: ReleaserequestComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/receiverequest/:param',
    component: ReceiverequestComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/code',
    component: CodeComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/code1',
    component: Code1Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/app',
    component: ApplicationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/sample',
    component: SampleComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/mfmessage',
    component: MfmessageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/menu',
    component: MenuComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/infmonitoring',
    component: InfMonitoringComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/reportmng',
    component: ReportMngComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/bomadmin',
    component: BomAdminComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptroute',
    component: PtRouteComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptitemroute',
    component: PtItemRouteComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodrq',
    component: PtProdRqComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodrqconfirm',
    component: PtProdRqConfirmComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodrel',
    component: PtProdRelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodinvstatus',
    component: PtProdInvStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/prodtot/:param',
    component: ProdTotComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/prodtot',
    component: ProdTotComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodcost',
    component: PtProdCostComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodmattot',
    component: PtProdMatTotComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodmattot/:param',
    component: PtProdMatTotComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/prodmatcostprocess',
    component: PtProdMatCostProcessComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodrelstatus',
    component: PtProdRelStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/coststatus',
    component: CostStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/coststatement',
    component: CostStatementComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/slotpriority',
    component: SlotPriorityComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/replenishpriority',
    component: ReplenishPriorityComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/allocpriority',
    component: AllocPriorityComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvexpected',
    component: RcvexpectedComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/so',
    component: SoComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soaccept',
    component: SoacceptComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/arrangetruckconfirm',
    component: ArrangeTruckConfirmComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/pgmauthority',
    component: PgmauthorityComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvaccept',
    component: RcvacceptComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/locationStatus',
    component: LocationStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/warehousemove',
    component: WarehousemoveComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/riInstructCancel',
    component: RiInstructCancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/logicalWhMove',
    component: LogicalWhMoveComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/logicalWhMoveConf',
    component: LogicalWhMoveConfComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/logicalWhMoveOut',
    component: LogicalWhMoveOutComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/logicalWhMoveOutConf',
    component: LogicalWhMoveOutConfComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/riInstructReport',
    component: RiInstructReportComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/pickStatus',
    component: PickStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soallocreport',
    component: SoallocreportComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soacceptcancel',
    component: SoacceptcancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvacceptcancel',
    component: RcvacceptcancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/trrcvtagdetail',
    component: RcvprogressComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvmodifylocation',
    component: RcvmodifylocationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soallocate',
    component: SoallocateComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soallocatecancel',
    component: SoallocatecancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/sopick',
    component: SopickComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/sopickcancel',
    component: SopickcancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvinstruct',
    component: RcvinstructComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvinstructreport',
    component: RcvinstructReportComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvprogress',
    component: RcvprogressComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvmodifylocation',
    component: RcvmodifylocationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/invTagWh',
    component: InvTagWhComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/invTagWhLocation',
    component: InvTagWhLocationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/invTagWhLocationLot',
    component: InvTagWhLocationLotComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soconfirmed',
    component: SoconfirmedComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/arrangeTruck',
    component: ArrangeTruckComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soconfirmedcancel',
    component: SoconfirmedcancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/sostatus',
    component: SostatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/moveLocation',
    component: MoveLocationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/riInstruct',
    component: RiInstructComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/inOutHistory',
    component: InOutHistoryComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/riInstructResult',
    component: RiInstructResultComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/inOutTranHistory',
    component: InOutTranHistoryComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvperformregistration',
    component: RcvperformregistrationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvinstructcancel',
    component: RcvinstructcancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvcomplete',
    component: RcvcompleteComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvapprovalcancel',
    component: RcvapprovalcancelComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvapproval',
    component: RcvapprovalComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvmodifyschdate',
    component: RcvmodifyschdateComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/warehousemove',
    component: WarehousemoveComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/warehousemoveloc',
    component: WarehousemovelocComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvdirect',
    component: RcvdirectComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/sodirectship',
    component: SodirectshipComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/invadjust',
    component: InvadjustComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/invadjustconfirm',
    component: InvadjustConfirmComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/phyinstruct',
    component: PhyinstructComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/phyinstructreport',
    component: PhyconfirmedReportComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/phyconfirmed',
    component: PhyconfirmedComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inv/separate',
    component: SeparateComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/truck',
    component: TruckComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/whxitem',
    component: WhxItemComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soinspect',
    component: SoinspectComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'so/soreport',
    component: SoReportComponent,
    canActivate: [AuthGuardService]
  },
  /*영업 추가*/
  {
    path: 'sasd/sasd010',
    component: Sasd010Component,
    canActivate: [AuthGuardService]
  },

  {
    path: 'sasd/sasd020',
    component: Sasd020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sasd/sasd030',
    component: Sasd030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sasd/sasd040',
    component: Sasd040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sasd/sasd050',
    component: Sasd050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacs/sacs010',
    component: Sacs010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor010',
    component: Saor010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor011',
    component: Saor011Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc010',
    component: Sarc010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc020',
    component: Sarc020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacs/sacs020',
    component: Sacs020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacs/sacs030',
    component: Sacs030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor020',
    component: Saor020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor021',
    component: Saor021Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor030',
    component: Saor030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor031',
    component: Saor031Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor040',
    component: Saor040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor241',
    component: Saor241Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacs/sacs040',
    component: Sacs040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacs/sacs050',
    component: Sacs050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacs/sacs060',
    component: Sacs060Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacs/sacs070',
    component: Sacs070Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor050',
    component: Saor050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor060',
    component: Saor060Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor061',
    component: Saor061Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor070',
    component: Saor070Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc030',
    component: Sarc030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc031',
    component: Sarc031Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc040',
    component: Sarc040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saco/saco010',
    component: Saco010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saco/saco020',
    component: Saco020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl010',
    component: Sacl010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl011',
    component: Sacl011Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl012',
    component: Sacl012Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl013',
    component: Sacl013Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl020',
    component: Sacl020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu010',
    component: Sabu010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu011',
    component: Sabu011Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu020',
    component: Sabu020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast010',
    component: Sast010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu030',
    component: Sabu030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu040',
    component: Sabu040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu050',
    component: Sabu050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu060',
    component: Sabu060Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu070',
    component: Sabu070Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu080',
    component: Sabu080Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu081',
    component: Sabu081Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu090',
    component: Sabu090Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu110',
    component: Sabu110Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sabu/sabu120',
    component: Sabu120Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc050',
    component: Sarc050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc060',
    component: Sarc060Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc070',
    component: Sarc070Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sarc/sarc080',
    component: Sarc080Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor090',
    component: Saor090Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor100',
    component: Saor100Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor110',
    component: Saor110Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor120',
    component: Saor120Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor130',
    component: Saor130Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor140',
    component: Saor140Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor150',
    component: Saor150Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor160',
    component: Saor160Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor170',
    component: Saor170Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor180',
    component: Saor180Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor080',
    component: Saor080Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl030',
    component: Sacl030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl031',
    component: Sacl031Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saca/saca010',
    component: Saca010Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saca/saca020',
    component: Saca020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saco/saco030',
    component: Saco030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saco/saco040',
    component: Saco040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saco/saco050',
    component: Saco050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saco/saco060',
    component: Saco060Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saca/saca030',
    component: Saca030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor190',
    component: Saor190Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor200',
    component: Saor200Component,
    canActivate: [AuthGuardService]

  },
  {
    path: 'saor/saor210',
    component: Saor210Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor220',
    component: Saor220Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor230',
    component: Saor230Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor240',
    component: Saor240Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor250',
    component: Saor250Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saor/saor251',
    component: Saor251Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saca/saca040',
    component: Saca040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'saca/saca050',
    component: Saca050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast020',
    component: Sast020Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast030',
    component: Sast030Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast040',
    component: Sast040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast050',
    component: Sast050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast060',
    component: Sast060Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast070',
    component: Sast070Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast110',
    component: Sast110Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast071',
    component: Sast071Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast072',
    component: Sast072Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast080',
    component: Sast080Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast090',
    component: Sast090Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sast/sast120',
    component: Sast120Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl040',
    component: Sacl040Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl050',
    component: Sacl050Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl060',
    component: Sacl060Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl070',
    component: Sacl070Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sacl/sacl080',
    component: Sacl080Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/itemCategory',
    component: ItemCategoryComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/bom',
    component: BomComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'prod/rcvproduce',
    component: RcvproduceComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'prod/rcvproducestatus',
    component: RcvProduceStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvproduce',
    component: RcvproduceComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvproducestatus',
    component: RcvProduceStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'prod/matinstruct',
    component: MatinstructComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'prod/matconfirmed',
    component: MatconfirmedComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/mapview',
    component: MapviewComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcvInspect',
    component: RcvInspectComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mm/mmSerial',
    component: MmSerialComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptProdProgStatus',
    component: PtProdProgStatusComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodmatcost',
    component: PtProdMatCostComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptprodmatcost/:param',
    component: PtProdMatCostComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptitemcost',
    component: PtItemCostComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'pp/ptitemcost/:param',
    component: PtItemCostComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'qrpage',
    component: QrpageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'rcv/rcv',
    component: RcvComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: '**',
    redirectTo: 'home'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes), DxDataGridModule, DxFormModule, DevExtremeModule],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [HomeComponent, ProfileComponent, TasksComponent]
})
export class AppRoutingModule {
}
