import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {InvTagWhService, InvTagWhVO} from './inv-tag-wh.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-inv-tag-wh',
  templateUrl: './inv-tag-wh.component.html',
  styleUrls: ['./inv-tag-wh.component.scss']
})
export class InvTagWhComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: InvTagWhVO = {} as InvTagWhVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainKey = 'logicalKey';

  selectedRows: number[];
  // ***** main ***** //

  // ***** popup ***** //
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;
  popupMode = '재고조회(창고) 상세';
  popupKey = 'uid';
  // ***** popup ***** //

  dsLocGroup = [];
  // dsLocId = [];
  dsLocation = [];
  dsDamageFlg = [];
  dsItemId = [];
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  dsItem = [];
  dxDamageFlg = [];
  dsYN = [];
  dsUnitStyle = [];


  dsUser = []; // 사용자

  trafficFilter = [];

  itemIdStorage = [];

  GRID_STATE_KEY = 'wi_invtagwh';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  constructor(
    public utilService: CommonUtilService,
    private service: InvTagWhService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.G_TENANT = this.utilService.getTenant();
    // this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);

    this.trafficFilter = [
      {
        text: 'Y',
        value: ['isRed', '=', true]
      },
      {
        text: 'N',
        value: ['isRed', '=', false]
      }
    ];
  }

  // 화면 생성 된 후 호출
  ngOnInit(): void {
    this.initCode();
    this.inputDataSource([], 'main');
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

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;          // 시리얼여부
    rowData.unit = value;
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
    this.mainForm.instance.focus();
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  //
  // onValueChangedWarehouseId(e): void {
  //   if (e.value === null) {
  //     this.dsWarehouseId = null;
  //     return;
  //   }
  //   this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
  //     this.dsLocation = result.data;
  //   });
  // }

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


  // 그리드 툴바
  onToolbarPreparing(e, title): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));
    const searchPanelTemp = toolbarItems.find(item => item.name === 'searchPanel');
    searchPanelTemp.location = 'after';

    newToolbarItems.push(searchPanelTemp);
    e.toolbarOptions.items = newToolbarItems;

    newToolbarItems.push({
      location: 'before',
      template(): any {
        return `<h4 class="grid_title">${title}</h4>`;
      },
    });
  }

  inputDataSource(inputData, type): void {

    this[type + 'EntityStore'] = new ArrayStore({
        data: inputData,
        key: this[type + 'Key']
      }
    );

    this[type + 'DataSource'] = new DataSource({
      store: this[type + 'EntityStore']
    });
  }

  // 팝업
  onPopupOpen(e): void {
    this.onPopupSearch(e.data);
    this.popup.visible = true;
  }

  popupShown(): void {
    this.utilService.getPopupGridHeight(this.popupGrid, this.popup);
    this.popupGrid.instance.repaint();

  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.inputDataSource(result.data, 'popup');

      // 횡스크롤 제거
      this.gridUtil.fnScrollOption(this.popupGrid);
    }
  }

  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    // this.gridUtil.resetGridFilter(this.GRID_STATE_KEY + '_popup');
    this.onSearch();


    // resetGridFilter(gridStateKey: string): void {
    //   const data = JSON.parse(localStorage.getItem(gridStateKey));
    //   data.columns.map(el => el.filterValue = '');
    //   localStorage.setItem(gridStateKey, JSON.stringify(data));
    //   this.fnGridLoadState(gridStateKey);
    // }
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  onCellPrepared(e): void {
    if (e.rowType === 'header') {
      return;
    }
    if (e.rowType === 'data' && e.column.dataField === 'flag') {
      e.cellElement.style.color = ((e.data.minQty !== 0) && (e.data.minQty > e.data.totalQty1)) ? 'red' : 'green';
    }
  }
}

