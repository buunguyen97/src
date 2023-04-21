import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {MoveLocationService, MoveLocationVO} from './moveLocation.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-relocate',
  templateUrl: './moveLocation.component.html',
  styleUrls: ['./moveLocation.component.scss']
})
export class MoveLocationComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;
  changes = [];

  // ***** main ***** //
  // Form
  mainFormData: MoveLocationVO = {} as MoveLocationVO;
  dsLocGroup = [];
  dsLocationId = [];
  dsSubLocationId = [];
  dsDamageFlg = [];
  dsItemId = [];
  dsSpec = [];
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  locIdStorage = [];
  dsItem = [];
  dsOwner = [];
  dsUser = [];


  // Grid
  mainGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  key = 'logicalKey';
  dsActFlg = [];
  dsLocId = [];
  dsRcvkey = [];
  dsLocation = [];

  // ***** main ***** //
  dxDamageFlg = [];
  dsYN = [];

  PAGE_PATH = '';

  constructor(
    public utilService: CommonUtilService,
    private service: MoveLocationService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.G_TENANT = this.utilService.getTenant();
    // this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);
    this.modifyMoveLocation = this.modifyMoveLocation.bind(this);
    this.setToLocId = this.setToLocId.bind(this);
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
      this.dsOwner = result.data;
    });

    // 조회조건 로케이션
    this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.utilService.getCommonWarehouseId().toString()).subscribe(result => {
      this.dsLocationId = result.data;
      // this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocId = result.data;
      this.locIdStorage = [...result.data];
    });

    // 회사
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 불용여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
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

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  // 로케이션 선택시 로케이션코드, 로케이션명 컬럼 입력
  setToLocId(rowData: any, value: any): void {

    console.log(value);
    rowData.toLocId = value;
    rowData.toLocIdCode = value;
    rowData.toLocName = value;

  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {

      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {

        this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.mainFormData.warehouseId.toString()).subscribe(locationResult => {
          this.dsSubLocationId = locationResult.data;
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

        // 횡스크롤 제거
        // this.gridUtil.fnScrollOption(this.mainGrid);
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

  // onValueChangedWarehouseId(e): void {
  //   if (e.value === null) {
  //     this.dsWarehouseId = null;
  //     return;
  //   }
  //   this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
  //     this.dsLocationId = result.data;
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

  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('wi_relocation', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_relocation');
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

  // 재고 이동
  async modifyMoveLocation(): Promise<void> {
    // const dataList = this.mainGrid.instance.getSelectedRowsData();

    const changes = this.collectGridData(this.changes);
    if (changes.length > 0) {

      const confirmMsg = this.utilService.convert('confirmMoveLocation', this.utilService.convert1('confirmMoveLocation', '재고이동을 하시겠습니까?'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      this.mainGrid.instance.saveEditData();

      const result = await this.service.modifyMoveLocation(this.mainGrid.instance.getSelectedRowsData());
      if (result.success) {
        await this.onSearch();
        await this.mainGrid.instance.deselectAll();
      } else {
        this.utilService.notify_error(result.msg);
      }
    } else {
      this.utilService.notify_error('로케이션 변경할 재고 목록을 선택하세요.');
      return;
    }

  }

  collectGridData(changes: any): any[] {
    const gridList = [];

    // tslint:disable-next-line:forin
    for (const rowIndex in changes) {

      // tslint:disable-next-line:radix
      const uid = this.mainGrid.instance.cellValue(parseInt(rowIndex), 'uid');

      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid}, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
    this.initCode();
    this.mainForm.instance.focus();
  }
}
