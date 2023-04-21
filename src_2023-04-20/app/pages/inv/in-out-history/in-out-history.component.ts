import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {InOutHistoryDetailVO, InOutHistoryService, InOutHistoryVO} from './in-out-history.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-in-out-history',
  templateUrl: './in-out-history.component.html',
  styleUrls: ['./in-out-history.component.scss']
})
export class InOutHistoryComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  mainFormData: InOutHistoryVO = {} as InOutHistoryVO;

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
  dsDamageFlg = [];
  dsInstructQty = [];

  // Popup
  popupVisible = false;
  popupMode = '수불이력상세(현재고)';
  popupFormData: InOutHistoryVO;

  // popup grid
  popupGridDataSource: DataSource;
  popupEntityStore: ArrayStore;
  codeList: InOutHistoryDetailVO[];
  popKey = 'uid';

  dsCompanyId = [];
  dsInOutType = [];
  dsInventoryType = [];
  dsUnitStyle = [];


  // Changes
  popupChanges = [];
  // ***** popup ***** //

  // summary
  searchList = [];


  constructor(
    public utilService: CommonUtilService,
    private service: InOutHistoryService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService
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
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 출하금지여부 등
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

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 품목
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
    rowData.item = value;
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

  // 팝업
  // 생성시 초기데이터

  // 팝업 열기
  async onPopupOpen(e): Promise<void> {

    if (e.element.id === 'Open') {
      this.onPopupInitData();
    } else {
      this.popupFormData = e.data;
      this.popupFormData.fromActualDate = this.mainFormData.fromActualDate;
      this.popupFormData.toActualDate = this.mainFormData.toActualDate;
      await this.onPopupSearch(this.popupFormData);
    }
    this.popup.visible = true;
    // 횡스크롤 제거
    this.gridUtil.fnScrollOption(this.popupGrid);
    this.popupGrid.instance.repaint();
  }

  popupShown(): void {
    this.utilService.getPopupGridHeight(this.popupGrid, this.popup, 28);
    this.popupGrid.instance.repaint();

  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);
    if (this.resultMsgCallback(result, 'PopupSearch')) {
      // this.popupFormData = result.data;

      // try {
      //   this.popupFormData.isUsingSystemFlg = this.popupFormData.isUsingSystemFlg.toString();
      //   this.popupFormData.isEditPossibleFlg = this.popupFormData.isEditPossibleFlg.toString();
      // } catch (e) {
      //
      // }
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
      this.popupGrid.instance.repaint();

    } else {
      return;
    }

  }

  onPopupInitData(): void {
    this.popupFormData = Object.assign({
      tenant: this.G_TENANT,
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
    // this.popupForm.instance.resetValues();
    // this.popupForm.instance.getEditor('codeCategory').option('disabled', false);

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
    localStorage.setItem('wi_inOutHistory', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_inOutHistory');
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
    localStorage.setItem('wi_inOutHistory2', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadStateGrid2 = () => {

    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_inOutHistory2');
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
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
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
