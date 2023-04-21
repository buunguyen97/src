import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvmodifylocationService} from './rcvmodifylocation.service';
import {RcvExpectedVO} from '../rcvexpected/rcvexpected.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../rcvCommonUtils';

@Component({
  selector: 'app-rcvmodifylocation',
  templateUrl: './rcvmodifylocation.component.html',
  styleUrls: ['./rcvmodifylocation.component.scss']
})
export class RcvmodifylocationComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;
  @ViewChild('fromReceiveDate', {static: false}) fromReceiveDate: DxDateBoxComponent;
  @ViewChild('toReceiveDate', {static: false}) toReceiveDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;
  ACT_FLG_SEARCH_VALUE = 'Y';
  ALLOWED_STS_CODE = RcvCommonUtils.STS_INSTRUCTED;

  mainFormData: RcvExpectedVO = {} as RcvExpectedVO;

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  key = 'uid';

  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsWarehouse = []; // 창고코드
  dsItemId = []; // 품목코드
  dsItemAdmin = []; // 품목관리사
  dsOwner = []; // 화주
  dsLocation = []; // 로케이션
  dsUser = []; // 사용자
  dsSupplier = []; // 공급처
  dsFilteredItemId = [];
  changes = [];
  dsDamageFlg = [];

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvmodifylocation1';
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              private service: RcvmodifylocationService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.getFilteredToLocId = this.getFilteredToLocId.bind(this);
  }

  ngOnInit(): void {
    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.dataSource = new DataSource({
      store: this.entityStore
    });

    // 입고상태
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    // 입고타입
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    // 센터(창고)
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 공급처
    this.codeService.getCompany(this.G_TENANT, null, null, null, true, null, null, null).subscribe(result => {
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

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;          // 시리얼여부
    rowData.unit = value;
  }


  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromReceiveDate = document.getElementsByName('fromReceiveDate').item(1).getAttribute('value');
      this.mainFormData.toReceiveDate = document.getElementsByName('toReceiveDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex, this.mainGrid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 로케이션 변경 (체크박스 버전)
  async modifyRcvLocation(): Promise<void> {


    const dataList = this.mainGrid.instance.getSelectedRowsData();
    const changes = this.collectGridData(this.changes);

    // 창고코드 SETTER
    for (const change of changes) {
      const filtered = this.dsLocation.filter(el => el.uid === change.toLocId);
      change.warehouseId = filtered.length > 0 ? filtered[0].warehouseId : null;
    }

    for (const data of dataList) {
      const filtered = changes.filter(el => el.uid === data.uid);

      console.log(filtered);

      // if (filtered[0].fromLocId === undefined) {
      //   const msg = this.utilService.convert('modifylocation_fromLocId', '현재 로케이션이 없어 변경이 불가능합니다.');
      //   this.utilService.notify_error(msg);
      //   return;
      // }

      if (filtered.length > 0) {
        data.toLocId = filtered[0].toLocId;
        data.warehouseId = filtered[0].warehouseId;
      } else {
        // 지시로케이션을 입력하세요.
        const msg = this.utilService.convert('com_valid_required', this.utilService.convert('rcvTagDetail.toLocId'));
        this.utilService.notify_error(msg);
        return;
      }
    }

    if (dataList.length > 0) {
      //
      // if (this.dsLocation === null) {
      //   const msg = this.utilService.convert('현재 로케이션이 없어 변경이 불가능합니다.');
      //   this.utilService.notify_error(msg);
      //   return;
      // }
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('modifyRcvLocation'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      await this.service.modifyRcvLocation(changes);
    } else {
      // 입고지시완료 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcvInstructList'));
      this.utilService.notify_error(msg);
      return;
    }

    await this.mainGrid.instance.deselectAll();
    await this.onSearch();
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
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
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  // 그리드 Lookup filter
  getFilteredToLocId(options): any {
    return {
      store: this.dsLocation,
      filter: options.data ? ['warehouseId', '=', this.mainFormData.warehouseId] : null
    };
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
    this.mainForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_INSTRUCTED);
    this.mainForm.instance.focus();
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
}
