import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RiInstructReportService, RiInstructReportVO} from './ri-instruct-report.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';

@Component({
  selector: 'app-ri-instruct-report',
  templateUrl: './ri-instruct-report.component.html',
  styleUrls: ['./ri-instruct-report.component.scss']
})
export class RiInstructReportComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;


  mainFormData: RiInstructReportVO = {} as RiInstructReportVO;

  // Global
  G_TENANT: any;
  changes = [];
  dsUser = [];

// ***** main ***** //
  // Form
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsLocId = [];
  dsOwnerId = [];
  dsRelocateSts = [];
  dsItemAdminId = [];
  dsItemId = [];
  locIdStorage = [];
  dsLocation = [];
  dsRelocateGroup = [];
  dsItem = [];

  // Grid
  mainGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  key = 'uid';
  dsActFlg = [];
  dsDamageFlg = [];
  dsInstructQty = [];

  // Grid Popup
  popupVisible = false;
  popupMode = '로케이션 이동지시 상세';
  popupData: RiInstructReportVO;
  popKey = 'uid';

  // grid
  dataSource: DataSource;
  popupDataSource: DataSource;
  entityStore: ArrayStore;
  popupEntityStore: ArrayStore;
  deleteRowList = [];

  // Grid State
  GRID_STATE_KEY = 'inv_riinstructreport';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  PAGE_PATH = '';

  constructor(
    public utilService: CommonUtilService,
    private service: RiInstructReportService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.G_TENANT = this.utilService.getTenant();
    this.onValueChangedWarehouseId = this.onValueChangedWarehouseId.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
  }

  ngOnInit(): void {
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 상태
    this.codeService.getCode(this.G_TENANT, 'RELOCATESTATUS').subscribe(result => {
      this.dsRelocateSts = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 이동지시그룹
    this.codeService.getCode(this.G_TENANT, 'LOCGROUP').subscribe(result => {
      this.dsRelocateGroup = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 로케이션
    this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.utilService.getCommonWarehouseId().toString()).subscribe(result => {
      this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  // search Form 초기화
  initForm(): void {

    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('relocateSts').option('value', '100');

    this.initCode();
    this.mainForm.instance.focus();
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      this.mainFormData.fromRelocateDate = document.getElementsByName('fromRelocateDate').item(1).getAttribute('value');
      this.mainFormData.toRelocateDate = document.getElementsByName('toRelocateDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.mainFormData.warehouseId.toString()).subscribe(locationResult => {
          // this.toLocId = locationResult.data;
        });
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });

        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      } else {
        return;
      }
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

  onValueChangedWarehouseId(e): void {
    if (e.value === null) {
      this.dsWarehouseId = null;
      return;
    }
    const findValue = this.dsWarehouseId.filter(code => code.uid === e.value);

    this.codeService.getLocation(this.G_TENANT, findValue[0].uid).subscribe(result => {
      this.dsLocation = result.data;
    });
  }

  // onValueChangedItemAdminId(e): void {
  //   if (!e.value) {
  //     this.dsItem = null;
  //     this.mainFormData.itemId = null;
  //     return;
  //   }
  //   const findValue = this.dsItemAdminId.filter(code => code.uid === e.value);
  //
  //   this.codeService.getItemWithItemAdminId(this.G_TENANT, findValue[0].uid).subscribe(result => {
  //     this.dsItem = result.data;
  //   });
  // }

  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('wi_riInstructCancel', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_riInstructCancel');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);

    // this.riInstructForm.instance.getEditor('relocateKey').option('value', '');

  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }

  popupShown(): void {
    // this.utilService.`getPopupGridHeight`(this.popupGrid, this.popup);
    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가

    this.onPopupSearch(this.popupData);
  }

  // 팝업 열기
  async onPopupOpen(e): Promise<void> {

    // if (e.element.id === 'Open') {
    //   this.onPopupInitData();
    // } else {
    //   this.popupData = e.data;
    //   await this.onPopupSearch(this.popupData);
    // }
    // this.popup.visible = true;

    this.onPopupInitData();
    this.popupData = e.data;

    if (this.popupEntityStore) {
      this.popupEntityStore.clear();
      await this.popupDataSource.reload();
    }

    this.popupVisible = true;
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    console.log(result);
    if (this.resultMsgCallback(result, 'PopupSearch')) {

      this.popupEntityStore = new ArrayStore(
        {
          data: result.data,
          key: this.popKey
        }
      );

      this.popupDataSource = new DataSource({
        store: this.popupEntityStore
      });

      this.popupGrid.instance.clearSelection();
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;

    } else {
      return;
    }
  }

  onPopupInitData(): void {
    this.popupData = Object.assign({
      tenant: this.G_TENANT,
      codeCategory: '',
      relocateBatchKey: this.key,
      relocateDate: this.mainFormData.relocateDate,
      relocateGroup: this.mainFormData.relocateGroup
    });
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();

    // 재조회
    this.onSearch();
  }

  onInitNewRowPopup(e): void {
    e.data.tenant = this.utilService.getTenant();
    e.data.codeCategoryId = this.popupData.uid;
  }

  async onViewReport(): Promise<void> {
    const selectList = await this.mainGrid.instance.getSelectedRowsData();
    const arrUid = new Array();

    console.log(arrUid);

    if (selectList.length > 0) {
      for (const selectRow of selectList) {
        arrUid.push(selectRow.uid);
      }
    }

    const reportFile = 'file=RiInstructReport.jrf';
    const reportOption = [
      {
        dataSet: 'DataSet0',
        node: 'data',
        path: '/report-service/report/riInstructReportHeader',
        apiParam: {
          uid: arrUid,
          tenant: this.G_TENANT
        }
      },
      {
        dataSet: 'DataSet1',
        node: 'data',
        path: '/report-service/report/riInstructReportData',
        apiParam: {
          uid: arrUid,
          tenant: this.G_TENANT
        }
      }
    ];

    this.utilService.openViewReport(reportFile, reportOption);
  }
}
