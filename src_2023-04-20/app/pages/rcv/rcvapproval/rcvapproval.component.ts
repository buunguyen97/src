import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvapprovalService} from './rcvapproval.service';
import {RcvExpectedVO} from '../rcvexpected/rcvexpected.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../rcvCommonUtils';
import {DxTreeViewComponent} from 'devextreme-angular/ui/tree-view';

@Component({
  selector: 'app-rcvapproval',
  templateUrl: './rcvapproval.component.html',
  styleUrls: ['./rcvapproval.component.scss']
})
export class RcvapprovalComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild(DxTreeViewComponent, {static: false}) treeView;

  // Global
  G_TENANT: any;

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvapproval1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;
  @ViewChild('fromReceiveDate', {static: false}) fromReceiveDate: DxDateBoxComponent;
  @ViewChild('toReceiveDate', {static: false}) toReceiveDate: DxDateBoxComponent;

  ALLOWED_STS_CODE = RcvCommonUtils.STS_RECEIVED;   // 유효한 입고상태

  mainFormData: RcvExpectedVO = {} as RcvExpectedVO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  subDataSource: DataSource;
  subEntityStore: ArrayStore;
  key = 'uid';
  // summary
  searchList = [];

  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsWarehouse = []; // 창고코드
  dsItemId = []; // 품목코드
  dsItemAdmin = []; // 품목관리사
  dsLocation = []; // 로케이션
  dsSupplier = []; // 공급처
  dsUser = []; // 사용자
  dsOwner = []; // 화주
  dsFilteredItemId = [];
  dsDamageFlg = [];
  treeBoxValue = [RcvCommonUtils.STS_RECEIVED];

  constructor(public utilService: CommonUtilService,
              private service: RcvapprovalService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  ngOnInit(): void {
    this.initSubGrid();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.mainDataSource = new DataSource({
      store: this.mainEntityStore
    });

    // 입고상태
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    // 입고타입
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 공급처
    this.codeService.getCompany(this.G_TENANT, null, true, null, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }


  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.subGrid);
    this.initForm();
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  onFocusedRowChanged(e): void {
    if (e.row) {
      this.onSearchSub(e.row.key);  // 상세조회
    }
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async onSearch(): Promise<void> {

    this.initSubGrid();
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromReceiveDate = document.getElementsByName('fromReceiveDate').item(1).getAttribute('value');
      this.mainFormData.toReceiveDate = document.getElementsByName('toReceiveDate').item(1).getAttribute('value');

      this.mainFormData.stsList = this.treeBoxValue;
      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.mainDataSource = new DataSource({
          store: this.mainEntityStore
        });
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async onSearchSub(rcvId: number): Promise<void> {
    if (rcvId) {
      const result = await this.service.getRcvFull({uid: rcvId});
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.subGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.subEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.subDataSource = new DataSource({
          store: this.subEntityStore
        });
        this.subGrid.focusedRowKey = null;
        this.subGrid.paging.pageIndex = 0;
      }
    }
  }

  async executeRcvComplete(): Promise<void> {
    const dataList = this.mainGrid.instance.getSelectedRowsData();
    // const changes = this.collectGridData(this.changes);
    if (dataList.length > 0) {

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('executeRcvApproval'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const result = await this.service.executeRcvComplete(dataList);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      }

    } else {

      // 입고확정 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcvCompleteList'));
      this.utilService.notify_error(msg);
      return;
    }

    await this.mainGrid.instance.deselectAll();
    await this.onSearch();
  }

  async initSubGrid(): Promise<void> {
    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });
  }

  onSelectionChanged(e): void {
    const selectedRowKey = e.currentSelectedRowKeys;
    // 유효한 입고상태가 아닐 경우
    this.mainGrid.instance.byKey(selectedRowKey).then(val => {
      const sts = val.sts;
      if (sts !== this.ALLOWED_STS_CODE) {
        this.mainGrid.instance.deselectRows(selectedRowKey);
        return;
      }
    });

    const dataList = e.selectedRowsData;
    dataList.forEach(el => {
      if (el.sts !== this.ALLOWED_STS_CODE) {
        this.mainGrid.instance.deselectAll();
        return;
      }
    });
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromRcvSchDate.value = rangeDate.fromDate;
    this.toRcvSchDate.value = rangeDate.toDate;
    this.fromReceiveDate.value = '';
    this.toReceiveDate.value = '';

    // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toRcvSchDate').option('value', rangeDate.toDate);
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.treeBoxValue = [RcvCommonUtils.STS_RECEIVED];
    this.mainForm.instance.focus();
  }

  updateSelection(treeView): void {
    if (!treeView) {
      return;
    }

    treeView.unselectAll();

    if (this.treeBoxValue) {
      this.treeBoxValue.forEach(((value) => {
        treeView.selectItem(value);
      }));
    }
  }

  onDropDownBoxValueChanged(e): void {
    this.updateSelection(this.treeView && this.treeView.instance);
  }

  onTreeViewReady(e): void {
    this.updateSelection(e.component);
  }

  onTreeViewSelectionChanged(e): void {
    this.treeBoxValue = e.component.getSelectedNodeKeys();
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  async onViewReport(): Promise<void> {
    const selectList = await this.mainGrid.instance.getSelectedRowsData();
    const arrRcvId = new Array();
    if (selectList.length > 0) {
      for (const selectRow of selectList) {
        arrRcvId.push(selectRow.uid);
      }
    }
    const reportFile = 'file=rcvLabel.jrf';
    const reportOption = [
      {
        dataSet: 'DataSet0',
        node: 'data',
        path: '/report-service/report/findRcvLabelPost',
        apiParam: {
          rcvId: arrRcvId,
          tenant: this.G_TENANT,
        }
      }
    ];

    this.utilService.openViewReport(reportFile, reportOption);
  }
}
