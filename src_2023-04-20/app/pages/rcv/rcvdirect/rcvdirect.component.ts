import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {RcvExpectedVO} from '../rcvexpected/rcvexpected.service';
import {RcvCommonUtils} from '../rcvCommonUtils';
import {isNaN} from 'lodash';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import * as XLSX from 'xlsx';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {RcvdirectService} from './rcvdirect.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {DxTreeViewComponent} from 'devextreme-angular/ui/tree-view';

@Component({
  selector: 'app-rcvdirect',
  templateUrl: './rcvdirect.component.html',
  styleUrls: ['./rcvdirect.component.scss']
})
export class RcvdirectComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupMainGrid', {static: false}) popupMainGrid: DxDataGridComponent;
  @ViewChild('popupSubGrid', {static: false}) popupSubGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('mainPopup', {static: false}) mainPopup: DxPopupComponent;
  @ViewChild(DxTreeViewComponent, {static: false}) treeView;

  @ViewChild('serialPopup', {static: false}) serialPopup: DxPopupComponent;
  @ViewChild('tagGrid', {static: false}) tagGrid: DxDataGridComponent;
  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;
  @ViewChild('fromReceiveDate', {static: false}) fromReceiveDate: DxDateBoxComponent;
  @ViewChild('toReceiveDate', {static: false}) toReceiveDate: DxDateBoxComponent;

  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsWarehouse = []; // 창고
  dsItemAdmin = []; // 품목관리사
  dsItemId = []; // 품목
  dsLocation = []; // 로케이션
  dsSupplier = []; // 공급처
  dsUser = []; // 사용자
  dsOwner = []; // 화주
  dsFilteredItemId = [];
  dsDamageFlg = [];

  // summary
  searchList = [];

  // Global
  G_TENANT: any;

  mainFormData: RcvExpectedVO = {} as RcvExpectedVO;

  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupData: RcvExpectedVO;

  // grid
  dataSource: DataSource;
  popupMainDataSource: DataSource;
  popupSubDataSource: DataSource;
  entityStore: ArrayStore;
  popupMainEntityStore: ArrayStore;
  popupSubEntityStore: ArrayStore;
  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  wholeChanges = [];
  key = 'uid';

  treeBoxValue = [RcvCommonUtils.STS_ACCEPTED, RcvCommonUtils.STS_RECEIVING];

  // serial
  serialPopupVisible = false;
  serialDataSource: DataSource;
  serialEntityStore: ArrayStore;
  serialFormData: any;

  currTenant: any;
  currRcvId: any;
  currRcvDetailId: any;
  currExpectQty: any;
  currentItemId: any;

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvdirect1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopupMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popupMain');
  saveStatePopupMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popupMain');
  loadStatePopupSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popupSub');
  saveStatePopupSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popupSub');

  loadStateTag = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_tag');
  saveStateTag = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_tag');

  popupMainGridSelectedIdx = -1;

  constructor(public utilService: CommonUtilService,
              private service: RcvdirectService,
              private rcvUtil: RcvCommonUtils,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.onSelectionChangedWarehouse = this.onSelectionChangedWarehouse.bind(this);
    this.onSerialUploadClick = this.onSerialUploadClick.bind(this);
    this.onSerialDeleteClick = this.onSerialDeleteClick.bind(this);
    this.onSerialCancelClick = this.onSerialCancelClick.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    // ArrayStore - DataSource와 바인딩.
    // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
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

    // 입고타입
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

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 사용자
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
    this.utilService.getGridHeight(this.mainGrid);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.initForm();
  }

  // 창고에 해당하는 로케이션
  onSelectedWarehouse(warehouseId: number): void {
    this.dsLocation = []; // 로케이션 코드 초기화
    if (warehouseId) {
      // 로케이션
      this.codeService.getLocation(this.G_TENANT, warehouseId).subscribe(result => {
        this.dsLocation = result.data;
      });
    }
  }

  async initPopupGrid(): Promise<void> {
    await this.initPopupMainGrid();
    await this.initPopupSubGrid();
  }

  async initPopupMainGrid(): Promise<void> {
    this.popupMainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupMainDataSource = new DataSource({
      store: this.popupMainEntityStore
    });
  }

  async initPopupSubGrid(): Promise<void> {
    this.changes = [];
    this.popupSubEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupSubDataSource = new DataSource({
      store: this.popupSubEntityStore
    });
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
    this.treeBoxValue = [RcvCommonUtils.STS_ACCEPTED, RcvCommonUtils.STS_RECEIVING];
    this.mainForm.instance.focus();
  }

  /**
   *  초기화 메소드 END
   */

  /**
   *  조회 메소드 START
   */
  // 조회
  async onSearch(): Promise<void> {
    await this.initPopupGrid();
    // 조회패널에 필수컬럼에 값 있는지 체크
    const data = this.mainForm.instance.validate();
    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromReceiveDate = document.getElementsByName('fromReceiveDate').item(1).getAttribute('value');
      this.mainFormData.toReceiveDate = document.getElementsByName('toReceiveDate').item(1).getAttribute('value');

      // Service의 get 함수 생성
      this.mainFormData.stsList = this.treeBoxValue;
      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        // ArrayStore - DataSource와 바인딩.
        // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async onSearchPopupMain(rcvId: number): Promise<void> {
    await this.initPopupGrid();

    if (rcvId) {
      const result = await this.service.getRcvDetail({rcvId, tenant: this.G_TENANT});

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupMainGrid.instance.cancelEditData();

        this.utilService.notify_success('search success');

        // // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        this.popupMainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.popupMainDataSource = new DataSource({
          store: this.popupMainEntityStore
        });

        this.popupMainGrid.focusedRowKey = null;
        this.popupMainGrid.paging.pageIndex = 0;
      }
    }
  }

  // willbedeleted(입력전용으로 변경)
  async onSearchPopupSub(rcvDetailId: number): Promise<void> {
    // await this.initPopupSubGrid();
    if (rcvDetailId) {
      const result = await this.service.getRcvTagDetail({rcvDetailId, tenant: this.G_TENANT, actFlg: 'Y'});
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupSubGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        this.popupSubEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.popupSubDataSource = new DataSource({
          store: this.popupSubEntityStore
        });
        this.popupSubGrid.focusedRowKey = null;
        this.popupSubGrid.paging.pageIndex = 0;
      }
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.showPopup('Edit', {...e.data});
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  // 입력 로우 필터
  onFocusedRowChanged(e): void {
    this.popupSubGrid.focusedRowKey = null;

    // 변경된 데이터 업데이트
    this.wholeChanges.forEach(el => {
      const keyfilter = this.changes.filter(l => {
        return l.key === el.key;
      });

      if (keyfilter.length > 0) {
        el.data = keyfilter[0].data;
      }
    });

    // 선택한 입고상세 정보 필터
    const filtered = this.wholeChanges.filter(el => {
      return el.data.rcvDetailId === e.row.key;
    });

    this.changes = filtered;
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  onSelectionChangedWarehouse(e): void {  // 센터코드
    const findValue = this.dsWarehouse.filter(code => code.uid === e.value);

    this.popupData.companyId = findValue.length > 0 ? findValue[0].logisticsId : null;
    this.popupData.logisticsId = findValue.length > 0 ? findValue[0].logisticsId : null;
  }

  addClick(e): void {
    const sts = this.mainGrid.instance.cellValue(this.mainGrid.focusedRowIndex, 'sts');
    if (sts !== RcvCommonUtils.STS_ACCEPTED && sts !== RcvCommonUtils.STS_INSTRUCTING) {
      this.utilService.notify_error(this.utilService.convert1('InvalidRcvSts', '유효한 입고상태가 아닙니다.'));
      return;
    }
    const mainGridIdx = this.popupMainGrid.focusedRowIndex;
    if (mainGridIdx < 0) {  // 선택된 로우가 없을 때
      return;
    }

    const itemId = this.popupMainGrid.instance.cellValue(mainGridIdx, 'itemId');
    const rcvDetailId = this.popupMainGrid.instance.cellValue(mainGridIdx, 'uid');

    let sum = 0;
    for (const change of this.changes) {  // 입력수량 검사
      sum += change.data.instructQty1;
    }

    this.popupSubGrid.instance.addRow().then(r => {
      const newRow = this.changes[this.changes.length - 1];
      newRow.data.rcvId = this.popupData.uid;
      newRow.data.rcvKey = this.popupData.rcvKey;
      newRow.data.rcvDetailId = rcvDetailId;
      newRow.data.itemId = itemId;
      newRow.data.unit = itemId;

      // 필터를 위한 전체 리스트
      this.wholeChanges.push(newRow);

      const rowIdx = this.popupSubGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupSubGrid);
    });
  }

  async deleteClick(e): Promise<void> {
    if (this.popupSubGrid.focusedRowIndex > -1) {
      // 현재 인덱스
      const focusedIdx = this.popupSubGrid.focusedRowIndex;
      const focusedKey = this.popupSubGrid.focusedRowKey;

      const selectedIdxQty = this.changes[this.popupSubGrid.focusedRowIndex].data.instructQty1;
      this.popupSubGrid.instance.deleteRow(focusedIdx);
      this.entityStore.push([{type: 'remove', key: focusedKey}]);
      const findIdx = this.wholeChanges.findIndex(el => el.key === focusedKey);
      this.wholeChanges.splice(findIdx, 1);

      const summ = this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'inputQty');
      this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'inputQty', summ - selectedIdxQty);

      // 삭제된 로우 위로 포커스
      this.popupSubGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  /**
   *  이벤트 메소드 END
   */

  /**
   *  팝업 메소드 START
   */

  // Popup 관련
  async showPopup(popupMode, data): Promise<void> {

    // 변경데이터 초기화
    this.changes = [];

    this.wholeChanges = [];
    this.onSelectedWarehouse(data.warehouseId); // 창고코드에 따른 로케이션 초기화

    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    // RCV KEY , 품목 코드
    this.popupMode = popupMode;

    if (this.popupMainEntityStore) {
      this.popupMainEntityStore.clear();
      await this.popupMainDataSource.reload();
    }

    if (this.popupSubEntityStore) {
      this.popupSubEntityStore.clear();
      await this.popupSubDataSource.reload();
    }

    this.popupVisible = true;
  }

  popupShown(e): void {
    // 팝업 그리드 사이즈 조정
    // this.utilService.setPopupGridHeight(this.mainPopup, this.popupForm, this.popupSubGrid);
    const tag = document.getElementsByClassName('dx-datagrid-total-footer');
    tag[1].setAttribute('style', tag[1].getAttribute('style') + ' visibility: hidden;');

    // 초기값
    if (this.popupMode === 'Add') {
      // 신규
    } else if (this.popupMode === 'Edit') {
    }

    this.popupMainGrid.instance.repaint();  // 스크롤 제거를 위해 refresh

    this.onSearchPopupMain(this.popupData.uid);
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  // 수량 입력시 입력수량 갱신
  onUpdateInputQty(e): void {

    if (e.value === 'instructQty1') {
      this.popupMainGridSelectedIdx = this.popupMainGrid.focusedRowIndex;
    }

    if (/*e.name === 'editing' && */e.previousValue === 'instructQty1') {
      const summ = this.popupSubGrid.instance.getTotalSummaryValue('instructQty1');
      const rcvDetailId = this.popupMainGrid.instance.cellValue(this.popupMainGridSelectedIdx, 'uid');
      this.popupMainGrid.instance.cellValue(this.popupMainGridSelectedIdx, 'inputQty', summ);

      this.popupSubGrid.instance.cellValue(this.popupSubGrid.focusedRowIndex, 'ownerId', this.mainFormData.ownerId);
      this.popupSubGrid.instance.cellValue(this.popupSubGrid.focusedRowIndex, 'rcvDetailId', rcvDetailId);

      // 변경된 데이터 업데이트
      this.wholeChanges.forEach(el => {
        const keyfilter = this.changes.filter(l => {
          return l.key === el.key;
        });

        if (keyfilter.length > 0) {
          el.data = keyfilter[0].data;
        }
      });

      // 선택한 입고상세 정보 필터
      const filtered = this.wholeChanges.filter(el => {
        return el.data.rcvDetailId === this.popupMainGrid.focusedRowKey;
      });

      this.changes = filtered;
      this.popupMainGridSelectedIdx = -1;
    }
  }

  async popupSaveClick(e): Promise<void> {

    // 변경된 데이터 업데이트
    this.wholeChanges.forEach(el => {
      const keyfilter = this.changes.filter(l => {
        return l.key === el.key;
      });

      if (keyfilter.length > 0) {
        el.data = keyfilter[0].data;
      }
    });

    const detailList = this.collectGridData(this.wholeChanges);

    // validation 체크
    for (const item of this.popupMainDataSource.items()) {

      const mainGridIdx = this.popupMainGrid.instance.getRowIndexByKey(item.uid);
      const expectQty1 = this.popupMainGrid.instance.cellValue(mainGridIdx, 'expectQty1');  // 예정수량
      const inputData = detailList.filter(el => el.rcvDetailId === item.uid);  // 입고상세 필터

      if (inputData.length === 0) { // 입력안한 상세 데이터는 continue
        await this.setFocusRow(mainGridIdx, this.popupMainGrid);
        const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('rcvDirect_list', '입고로케이션'));
        this.utilService.notify_error(msg);
        return;
      }
      const messages = {toLocId: 'rcvTagDetail.toLocId', instructQty1: 'rcvDirect_instructQty1'};
      const columns = ['toLocId', 'instructQty1'];    // required 컬럼 dataField 정의
      for (const data of inputData) {
        if (!data.key && !data.uid) {
          for (const col of columns) {
            if ((data[col] === undefined) || (data[col] === '')) {
              await this.setFocusRow(mainGridIdx, this.popupMainGrid);
              this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(messages[col])));
              return;
            }
          }
        }

        this.popupSubGrid.instance.byKey(data.key).then(
          (dataItem) => {
            for (const col of columns) {
              if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
                this.setFocusRow(mainGridIdx, this.popupMainGrid);
                this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(messages[col])));
                return;
              }
            }
          }
        );
      }

      let sum = 0;
      for (const data of inputData) {  // 입력수량 검사
        if (isNaN(data.instructQty1)) {
          // '입력 수량을 입력하세요.'
          await this.setFocusRow(mainGridIdx, this.popupMainGrid);
          const msg = this.utilService.convert('com_valid_required',
            this.utilService.convert(this.utilService.convert1('inputQty', '입력수량')));
          this.utilService.notify_error(msg);
          return;
        }
        sum += Number(data.instructQty1);
      }

      if (sum !== expectQty1) {
        // '입고예정수량과 입력 수량이 일치하지 않습니다.'
        await this.setFocusRow(mainGridIdx, this.popupMainGrid);
        const message = this.utilService.convert('not_equal_values',
          this.utilService.convert('rcvDetail.expectQty1'), this.utilService.convert1('inputQty', '입력수량'));
        this.utilService.notify_error(message);
        return;
      }
    }

    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      try {

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('/rcv/rcvdirect'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        const result = await this.service.procDirectReceive(detailList);
        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch (e) {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();

    // 재조회
    this.onSearch();
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === RcvCommonUtils.FLAG_TRUE;
  }

  async onSerialPopupClick(e, rowIdx: any): Promise<void> {
    this.currTenant = this.popupMainGrid.instance.cellValue(rowIdx, 'tenant');
    this.currRcvId = this.popupMainGrid.instance.cellValue(rowIdx, 'rcvId');
    this.currRcvDetailId = this.popupMainGrid.instance.cellValue(rowIdx, 'uid');

    if ((this.currRcvDetailId === undefined) || (this.currRcvDetailId === '')) {
      this.utilService.notify_error('Don\`t save data. Try after save it.');
      return;
    }

    const sendData = {tenant: this.currTenant, rcvId: this.currRcvId, rcvDetailId: this.currRcvDetailId};
    try {
      const result = await this.rcvUtil.getTag(sendData);

      if (result.success) {
        for (const key in result.data) {
          if (result.data.hasOwnProperty(key)) {
            result.data[key].tenant = this.currTenant;
            result.data[key].rcvId = this.currRcvId;
            result.data[key].rcvDetailId = this.currRcvDetailId;
          }
        }

        this.serialEntityStore = new ArrayStore(
          {
            data: result.data,
            key: 'serial'
          }
        );

        this.serialDataSource = new DataSource({
          store: this.serialEntityStore
        });
        this.utilService.notify_success('Search success');
        this.serialPopupVisible = true;
      } else {
        this.utilService.notify_error(result.msg);
      }
    } catch (e) {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 팝업 추가 부분
  onSerialPopupShown(e): void {
    const rowIdx = this.popupMainGrid.focusedRowIndex;
    this.currExpectQty = this.popupMainGrid.instance.cellValue(rowIdx, 'expectQty1');
    this.currentItemId = this.popupMainGrid.instance.cellValue(rowIdx, 'itemId');
    this.serialFormData.expectQty1 = this.popupMainGrid.instance.cellValue(rowIdx, 'expectQty1');
    this.serialFormData.itemId = this.popupMainGrid.instance.cellValue(rowIdx, 'itemId');

    this.serialPopupVisible = true;
    this.utilService.setPopupGridHeight(this.serialPopup, this.serialForm, this.tagGrid);
  }

  onSerialPopupClosed(e): void {
    this.serialForm.instance.resetValues();
    this.serialEntityStore.clear();
    this.serialDataSource.reload();
    this.fileUploader.instance.reset();
  }

  async onSerialDeleteClick(e): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      const result = await this.rcvUtil.deleteTag({
        tenant: this.currTenant,
        rcvId: this.currRcvId,
        rcvDetailId: this.currRcvDetailId
      });
      try {
        if (result.success) {
          this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'tagQty', 0);
          this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'receivedQty1', 0);

          this.fileUploader.instance.reset();
          this.serialEntityStore.clear();
          this.serialDataSource.reload();
          this.utilService.notify_success('Delete success');
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  async onSerialUploadClick(): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      try {
        const sendData =  await this.serialEntityStore.load();

        // 예정수량 대비 체크
        if (this.currExpectQty !== sendData.length) {
          // 예정수량과 시리얼수량이 일치하지 않습니다.
          const expectedQtyMsg = this.utilService.convert('rcvDetail.expectQty1');
          const tagQtyMsg = this.utilService.convert('rcvDetail.tagQty');
          const msg = this.utilService.convert('not_equal_values', expectedQtyMsg, tagQtyMsg);
          this.utilService.notify_error(msg);
          return;
        }

        const result = await this.rcvUtil.saveTag(sendData);
        if (result.success) {
          this.serialDataSource.reload();
          this.utilService.notify_success('Save success');
          this.onSerialPopupClear();
          this.serialPopupVisible = false;
          this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'receivedQty1', sendData.length);
          this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'tagQty', sendData.length);
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  onSerialCancelClick(): void {
    this.onSerialPopupClear();
    this.serialPopupVisible = false;
  }

  onSerialPopupClear(): void {
  }

  async onSerialFileUploader(fileUploader: DxFileUploaderComponent): Promise<void> {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = fileUploader.value[0];

    if (!file) {
      return;
    }

    let Sheet1 = [];
    reader.onload = (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      Sheet1 = mapData.Sheet1;
      const serialList = [];
      for (const key in Sheet1) {
        if (Sheet1.hasOwnProperty(key)) {
          if (!Sheet1[key].serial) {
            continue;
          }
          Sheet1[key].tenant = this.currTenant;
          Sheet1[key].rcvId = this.currRcvId;
          Sheet1[key].rcvDetailId = this.currRcvDetailId;
          serialList.push(Sheet1[key]);
        }
      }

      this.serialEntityStore = new ArrayStore(
        {
          data: Sheet1,
          key: 'serial'
        }
      );

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });

      this.serialDataSource.reload();
    };

    reader.readAsBinaryString(file);
  }

  onResetFileUploader(fileUploader: DxFileUploaderComponent): void {

    this.serialEntityStore.clear();
    this.serialDataSource.reload();

    fileUploader.instance.reset();

    // this.onSerialPopupClick(null, this.subGrid.focusedRowIndex);

    this.serialEntityStore = new ArrayStore(
      {data: [], key: 'serial'});

    this.serialDataSource = new DataSource({
      store: this.serialEntityStore
    });
  }

  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('serialTemplete', '양식다운로드'),
        onClick: this.downloadExcel.bind(this)
      }
    });

    e.toolbarOptions.items = newToolbarItems;
  }

  async downloadExcel(): Promise<void> {
    this.utilService.downloadSerialExcel();
  }

  /**
   *  팝업 메소드 END
   */

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

}
