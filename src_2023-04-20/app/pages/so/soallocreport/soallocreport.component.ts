import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import ArrayStore from 'devextreme/data/array_store';
import {SoCommonUtils} from '../soCommonUtils';
import {SoallocreportService} from './soallocreport.service';
import {DxTreeViewComponent} from 'devextreme-angular/ui/tree-view';
import {SoVO} from "../so/so.service";

@Component({
  selector: 'app-soallocreport',
  templateUrl: './soallocreport.component.html',
  styleUrls: ['./soallocreport.component.scss']
})
export class SoallocreportComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild(DxTreeViewComponent, {static: false}) treeView;
  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;


  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: SoVO = {} as SoVO;
  // Grid
  mainDataSource: DataSource;
  mainKey = 'uid';

  subDataSource: DataSource;
  subKey = 'uid';
  // ***** main ***** //

  // DataSet
  dsSoType = [];
  dsSoStatus = [];
  dsItemAdmin = [];
  dsItem = [];
  dsCompany = [];
  dsShipTo = [];
  dsUser = [];
  dsSTD = [];

  dsWarehouse = [];
  dsOwner = [];
  dsDamageFlg = [];

  // summary
  searchList = [];

  stsList = [SoCommonUtils.STS_ALLOCATING, SoCommonUtils.STS_ALLOCATED];

  GRID_STATE_KEY = 'so_soallocreport';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: SoallocreportService
  ) {
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  // 화면 생성 된 후 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
    this.inputDataSource([], 'main');
    this.inputDataSource([], 'sub');
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.utilService.getGridHeight(this.subGrid);

    this.initData(this.mainForm, 'main');
  }

  initCode(): void {

    // 화주
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, true, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 납품처
    this.codeService.getCompany(this.G_TENANT, null, null, true, null, null, null, null).subscribe(result => {
      this.dsShipTo = result.data;
    });

    // 출고유형
    this.codeService.getCode(this.G_TENANT, 'SOTYPE').subscribe(result => {
      this.dsSoType = result.data;
    });

    // 출고상태
    this.codeService.getCode(this.G_TENANT, 'SOSTATUS').subscribe(result => {
      this.dsSoStatus = result.data;
    });

    // 피킹유형, 피킹그룹, 피킹할당그룹
    this.codeService.getCode(this.G_TENANT, 'IFPARTNERGROUP').subscribe(result => {
      this.dsSTD = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItem = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  inputDataSource(inputData, type): void {

    this[type + 'DataSource'] = new DataSource({
      store: new ArrayStore({
        data: inputData,
        key: this[type + 'Key']
      })
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    const STSLIST = 'stsList';

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, true, null, true, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    if (data.isValid) {
      this.mainFormData[STSLIST] = this.stsList;
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

      if (this.resultMsgCallback(result, 'Search')) {
        this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  onFocusedRowChanged(e): void {

    if (!!e.row) {
      this.onDetailSearch(e.row.data);
    }
  }

  async onDetailSearch(data): Promise<void> {
    const result = await this.service.getDetail(data);

    if (this.resultMsgCallback(result, 'DetailSearch')) {
      this.inputDataSource(result.data.soDetailList, 'sub');
      this.subGrid.focusedRowKey = null;
      this.subGrid.paging.pageIndex = 0;
    }
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  onReset(): void {
    this.mainForm.instance.resetValues();
    this.initData(this.mainForm, 'main');
    this.stsList = [SoCommonUtils.STS_ALLOCATING, SoCommonUtils.STS_ALLOCATED];
  }

  initData(form, type): void {
    const rangeDate = this.utilService.getDateRange();
    let data;

    if (type === 'main') {
      this.fromShipSchDate.value = rangeDate.fromDate;
      this.toShipSchDate.value = rangeDate.toDate;
      data = {
        tenant: this.G_TENANT,
        sts: SoCommonUtils.STS_ACCEPTED,
        // fromShipSchDate: rangeDate.fromDate,
        // toShipSchDate: rangeDate.toDate,
        warehouseId: this.utilService.getCommonWarehouseId(),
        ownerId: this.utilService.getCommonOwnerId()
      };
      this.mainForm.instance.focus();
    } else {
      data = {
        delivSchDate: rangeDate.toDate,
        pickType: 'STD',
        pickGroup: 'STD',
        pickAllocGroup: 'STD',
        remarks: ''
      };
    }
    form.formData = data;
  }

  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  updateSelection(treeView): void {

    if (!treeView) {
      return;
    }
    treeView.unselectAll();

    if (this.stsList) {
      this.stsList.forEach(((value) => {
        treeView.selectItem(value);
      }));
    }
  }

  onTreeViewReady(e): void {
    this.updateSelection(e.component);
  }

  onDropDownBoxValueChanged(e): void {
    this.updateSelection(this.treeView && this.treeView.instance);
  }

  onTreeViewSelectionChanged(e): void {
    this.stsList = e.component.getSelectedNodeKeys();
  }

  async onViewReport(): Promise<void> {
    const selectList = await this.mainGrid.instance.getSelectedRowsData();
    console.log(selectList);
    const arrUid = new Array();
    const arrPickBatchId = new Array();

    if (selectList.length > 0) {
      for (const selectRow of selectList) {
        arrUid.push(selectRow.uid);
        arrPickBatchId.push(selectRow.pickBatchId);
      }
    }
    const reportFile = 'file=soAllocateReport.jrf';
    const reportOption = [
      {
        dataSet: 'DataSet0',
        node: 'data',
        path: '/report-service/report/soAllocateReportHeader',
        apiParam: {
          pickBatchId: arrPickBatchId,
          tenant: this.G_TENANT
        }
      },
      {
        dataSet: 'DataSet1',
        node: 'data',
        path: '/report-service/report/soAllocateReportData',
        apiParam: {
          soId: arrUid,
          pickBatchId: arrPickBatchId,
          tenant: this.G_TENANT
        }
      }
    ];

    this.utilService.openViewReport(reportFile, reportOption);
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

}
