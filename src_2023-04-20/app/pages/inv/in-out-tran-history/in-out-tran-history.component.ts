import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {InOutTranHistoryDetailVO, InOutTranHistoryService, InOutTranHistoryVO} from './in-out-tran-history.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-in-out-tran-history',
  templateUrl: './in-out-tran-history.component.html',
  styleUrls: ['./in-out-tran-history.component.scss']
})
export class InOutTranHistoryComponent implements OnInit, AfterViewInit {

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  mainFormData: InOutTranHistoryVO = {} as InOutTranHistoryVO;

  // Global
  G_TENANT: any;
  changes = [];
  dsUser = [];

// ***** main ***** //
  // Form
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsLocId = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  dsItem = [];
  dsItemId = [];
  locIdStorage = [];

  // Grid
  mainGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  key = 'uid';
  dsActFlg = [];
  dsInstructQty = [];

  // Popup
  popupVisible = false;
  popupMode = '입출고 진행상황 리스트 상세';
  popupFormData: InOutTranHistoryVO = {} as InOutTranHistoryVO;

  // popup grid
  popupGridDataSource: DataSource;
  popupEntityStore: ArrayStore;
  codeList: InOutTranHistoryDetailVO[];
  popKey = 'uid';

  dsCompanyId = [];
  dsInOutType = [];
  dsInventoryType = [];
  dsUnitStyle = [];
  dsDamageFlg = [];

  // Changes
  popupChanges = [];
  // ***** popup ***** //


  // summary
  searchList = [];

  constructor(
    public utilService: CommonUtilService,
    private service: InOutTranHistoryService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
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

    this.popupEntityStore = new ArrayStore(
      {
        data: this.codeList,
        key: this.popKey
      }
    );

    this.popupGridDataSource = new DataSource({
      store: this.popupEntityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.utilService.getPopupGridHeight(this.popupGrid, this.popup);
    this.initForm();
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 로케이션코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsCompanyId = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 입출력타입
    this.codeService.getCode(this.G_TENANT, 'HISTORYINOUTTYPE').subscribe(result => {
      this.dsInOutType = result.data;
    });

    // 재고단위
    this.codeService.getCode(this.G_TENANT, 'HISTORYINVTYPE').subscribe(result => {
      this.dsInventoryType = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    // this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      this.mainFormData.fromActualDate = document.getElementsByName('fromActualDate').item(1).getAttribute('value');
      this.mainFormData.toActualDate = document.getElementsByName('toActualDate').item(1).getAttribute('value');

      console.log(this.mainFormData);
      const result = await this.service.get(this.mainFormData);

      this.searchList = result.data;
      if (this.resultMsgCallback(result, 'Search')) {
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

  // 팝업
  // 생성시 초기데이터

  // 팝업 열기
  onPopupOpen(e): void {
    if (e.element.id === 'Open') {
      this.onPopupInitData();
    } else {
      this.popupFormData = e.data;
      this.popupFormData.fromActualDate = this.mainFormData.fromActualDate;
      this.popupFormData.toActualDate = this.mainFormData.toActualDate;
      this.onPopupSearch(this.popupFormData);

      console.log(this.popupFormData);
    }
    this.popup.visible = true;
  }

  popupShown(): void {
    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);
    if (this.resultMsgCallback(result, 'PopupSearch')) {

      this.popupEntityStore = new ArrayStore(
        {
          data: result.data,
          key: this.popKey
        }
      );

      this.popupGridDataSource = new DataSource({
        store: this.popupEntityStore
      });
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;

      // 횡스크롤 제거
      this.gridUtil.fnScrollOption(this.popupGrid);
    } else {
      return;
    }
  }

  onPopupInitData(): void {
    this.popupFormData = Object.assign({
      tenant: this.G_TENANT,
      inOutType: this.dsInOutType,
      codeCategory: '',
      name: '',
      isUsingSystemFlg: '1',
      isEditPossibleFlg: '0'
    });
  }

  onInitNewRowPopup(e): void {
    e.data.tenant = this.utilService.getTenant();
    e.data.codeCategoryId = this.popupFormData.uid;
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {

    if (!!this.popupGridDataSource) {
      this.popupEntityStore.clear();
      this.popupGridDataSource.reload();
      this.popupGrid.instance.cancelEditData();
    }
    // this.onSearch();
  }

  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('wi_inOutTranHistory', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_inOutTranHistory');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 그리드 상태 저장
  saveStateGrid2 = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('wi_inOutTranHistory2', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadStateGrid2 = () => {

    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_inOutTranHistory2');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  /**
   * datagrid summary start
   */
  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  /**
   * datagrid summary end
   */
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }
}
