import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {ArrangeTruckConfirmService} from './arrange-truck-confirm.service';
import {SoCommonUtils} from '../soCommonUtils';
import {SoVO} from "../so/so.service";

@Component({
  selector: 'app-arrange-truck-confirm',
  templateUrl: './arrange-truck-confirm.component.html',
  styleUrls: ['./arrange-truck-confirm.component.scss']
})
export class ArrangeTruckConfirmComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  // @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;

  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: SoVO = {} as SoVO;

  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  selectedRows: number[];
  key = 'vehicleArrangeKey';
  subKey = 'uid';
  changes = [];
  dsUser = [];

  dsSts = [];
  dsCountry = [];
  dsSoType = [];
  dsItemAdminId = [];
  dsItem = [];
  dsVehicleType = [];

  subDataSource: DataSource;
  subEntityStore: ArrayStore;

  // ***** main ***** //

  // DataSet
  dsYN = [];

  dsShipTo = [];
  dsOwner = [];
  dsActFlg = [];
  dsWarehouse = [];
  dsFilteredItemId = [];

  dsMoveStatus = [];
  dsItemAdmin = [];
  dsItemId = [];
  dsCompany = [];
  dsVehicleKey = [];
  dsCarCapa = [];
  dsCarId = [];

  // summary
  searchList = [];

  PAGE_PATH = '';

  constructor(
    public utilService: CommonUtilService,
    private service: ArrangeTruckConfirmService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);
    this.saveClick = this.saveClick.bind(this);
    // this.deleteClick = this.deleteClick.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });

    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });

    this.initCode();
  }

// 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    // this.mainForm.instance.focus();
    this.utilService.fnAccordionExpandAll(this.acrdn);

    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.subGrid);

    this.initForm();
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 상태
    this.codeService.getCode(this.G_TENANT, 'SOSTATUS').subscribe(result => {
      this.dsSts = result.data;
    });

    // 출고유형
    this.codeService.getCode(this.G_TENANT, 'SOTYPE').subscribe(result => {
      this.dsSoType = result.data;
    });

    // 출고처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
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

    // 차량키
    this.codeService.getVehicle(this.G_TENANT).subscribe(result => {
      this.dsVehicleKey = result.data;
    });

    // 차종
    this.codeService.getCode(this.G_TENANT, 'CARCAPA').subscribe(result => {
      this.dsCarCapa = result.data;
    });
  }

  // search Form 초기화
  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('fromShipSchDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toShipSchDate').option('value', rangeDate.toDate);
    this.mainForm.instance.getEditor('sts').option('value', SoCommonUtils.STS_PICKED);

    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
    this.initCode();
  }

  async onSearch(): Promise<void> {
    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });

    // tslint:disable-next-line:no-shadowed-variable
    const data = this.mainForm.instance.validate();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');

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

  // 조회
  // tslint:disable-next-line:no-shadowed-variable
  async onSearchSub(data): Promise<void> {
    const result = await this.service.getArrangeTruckConrfirmDetail(data);

    this.subGrid.instance.cancelEditData();

    if (this.resultMsgCallback(result, 'DetailSearch')) {

      // this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.mainFormData.warehouseId.toString()).subscribe(locationResult => {
      //   this.dsVehicleId = locationResult.data;
      // });

      this.subEntityStore = new ArrayStore(
        {
          key: this.subKey,
          data: result.data
        }
      );
      this.subDataSource = new DataSource({
        store: this.subEntityStore
      });
      this.subGrid.focusedRowKey = null;
      this.subGrid.paging.pageIndex = 0;
    } else {
      return;
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

  onValueChangedItemAdminId(e): void {
    if (!e.value) {
      this.dsItemId = null;
      return;
    }
    const findValue = this.dsItemAdminId.filter(code => code.uid === e.value);

    this.codeService.getItemWithItemAdminId(this.G_TENANT, findValue[0].uid).subscribe(result => {
      this.dsItemId = result.data;
    });
  }

  async saveClick(): Promise<void> {
    if (this.changes.length > 0) {
      const msgStr = this.utilService.convert('com_btn_save');
      const confirmMsg = this.utilService.convert('confirmExecute', msgStr);

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      // const columns = ['messageKey'];
      const tempData = this.collectGridData(this.changes);

      if (tempData.length > 0) {
        this.subGrid.instance.saveEditData();
        const result = await this.service.save(tempData);
        if (result.success) {
          this.utilService.notify_success('save success');
        } else {
          this.utilService.notify_success('save failed');
        }

        const findRow = this.mainGrid.instance.byKey(this.mainGrid.focusedRowKey);

        findRow.then((selectedRow) => {
            this.onSearchSub(selectedRow);
          }
        );
      }
    } else {
      //  변경된 데이터가 없습니다.
      const msg = this.utilService.convert('noChangedData');
      this.utilService.notify_error(msg);
      return;
    }
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    // tslint:disable-next-line:forin
    for (const rowIndex in changes) {
      let findRow = null;
      this.subEntityStore.byKey(changes[rowIndex].key).then(
        (dataItem) => {
          findRow = dataItem;
        },
        (error) => {
        }
      );

      gridList.push(Object.assign(findRow, changes[rowIndex].data, {
        operType: changes[rowIndex].type,
        uid: changes[rowIndex].key,
        tenant: this.G_TENANT,
      }));
    }

    return gridList;
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
    if (e.data) {
      this.onSearchSub(e.data);
    }
  }

  // 그리드 상태 저장
  saveStateGrid1 = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('so_arrangetruckconfirm', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadStateGrid1 = () => {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line:no-shadowed-variable
      const data = localStorage.getItem('so_arrangetruckconfirm');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 그리드 상태 저장
  saveStateSub = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('so_arrangetruckconfirm2', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadStateSub = () => {
    return new Promise((resolve, reject) => {

      // tslint:disable-next-line:no-shadowed-variable
      const data = localStorage.getItem('so_arrangetruckconfirm2');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

}
