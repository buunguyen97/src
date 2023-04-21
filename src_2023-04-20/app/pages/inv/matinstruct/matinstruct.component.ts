import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {MoveDetailVO} from '../warehousemove/warehousemove.service';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {MatAdjustDetailVO, MatinstructService} from './matinstruct.service';
import {RiInstructVO} from '../ri-instruct/ri-instruct.service';
import {SoCommonUtils} from '../../so/soCommonUtils';

@Component({
  selector: 'app-matinstruct',
  templateUrl: './matinstruct.component.html',
  styleUrls: ['./matinstruct.component.scss']
})
export class MatinstructComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('moveBtn', {static: false}) moveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;


  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainKey = 'uid';
  // ***** main ***** //

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: MatAdjustDetailVO;
  // Grid
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;
  popupKey = 'itemId';

  codeList: MoveDetailVO[];

  // summary
  searchList = [];

  // Changes
  dsWarehouse = [];
  dsOwner = [];
  dsItemAdminId = [];
  dsProdSts = [];
  dsYN = [];
  dsUser = [];

  dsItemAdmin = [];
  dsItem = [];
  dsInstructItem = [];
  copyInstructItem = [];
  dsLocation = [];

  shownFlag = false;

  GRID_STATE_KEY = 'inv_matinstruct';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  infoData = {
    tenant: this.utilService.getTenant(),
    ownerId: this.utilService.getCommonOwnerId(),
    warehouseId: this.utilService.getCommonWarehouseId(),
    companyId: this.utilService.getCommonOwnerId(),
    logisticsId: this.utilService.getCommonWarehouseVO().logisticsId,
    itemAdminId: this.utilService.getCommonItemAdminId()
  };

  constructor(
    public utilService: CommonUtilService,
    private service: MatinstructService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);
    this.onValueChangedItem = this.onValueChangedItem.bind(this);
    this.onValueChangedQty = this.onValueChangedQty.bind(this);
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

    this.onPopupClose = this.onPopupClose.bind(this);
    this.onPopupSave = this.onPopupSave.bind(this);
    this.onPopupDelete = this.onPopupDelete.bind(this);
    this.onMoveLocation = this.onMoveLocation.bind(this);
  }

  // 화면 생성 된 후 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initData(this.mainForm);
    this.inputDataSource(this.codeList, 'popup');
  }

  initCode(): void {

    // 화주
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 상태
    this.codeService.getCode(this.G_TENANT, 'PRODSTATUS').subscribe(result => {
      this.dsProdSts = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItem = result.data;
      this.copyInstructItem = result.data.filter(el => el.itemSetFlg === 'Y');
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
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

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

      if (this.resultMsgCallback(result, 'Search')) {
        await this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  onShown(): void {

    if (!this.shownFlag) {
      this.changeDisabled(this.popupMode !== 'Add', this.popupMode !== 'Add' ? this.popupFormData.sts : '100');
      this.shownFlag = true;
    }
    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
  }

  onPopupOpen(e): void {
    this.inputDataSource([], 'popup');

    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data);
    }

    if (this.shownFlag) {
      this.changeDisabled(this.deleteBtn.visible, !e.data ? '100' : e.data.sts);
    }
    this.popup.visible = true;
  }

  onPopupInitData(): void {
    const date = this.utilService.getFormatDate(new Date());

    this.popupFormData = Object.assign({
      tenant: this.infoData.tenant,
      ownerId: this.infoData.ownerId,
      warehouseId: this.infoData.warehouseId,
      companyId: this.infoData.companyId,
      logisticsId: this.infoData.logisticsId,
      itemAdminId: this.infoData.itemAdminId,
      expectQty1: 0,

      sts: '100',
      isProduct: 'Y',
      adjustType: 'PROD',
      adjustDate: date,
      inoutDate: date
    });
    this.onValueChangedItemAdminId({value: this.popupFormData.itemAdminId});
  }

  initData(form): void {

    form.formData = {
      tenant: this.G_TENANT,
      sts: '100',
      warehouseId: this.infoData.warehouseId,
      ownerId: this.infoData.ownerId,
      itemAdminId: this.infoData.itemAdminId
    };
  }

  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.onSearch();
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getDetail(data);

    console.log(result);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      const prodData = result.data.adjustDetailList.filter(el => el.isProduct === 'Y');
      const matData = result.data.adjustDetailList.filter(el => el.isProduct === 'N');

      const formDataList = ['adjustKey', 'adjustDate', 'sts', 'warehouseId', 'otherRefNo3',
        'logisticsId', 'ownerId', 'companyId', 'adjustType', 'remarks'];

      this.popupFormData = prodData[0];

      formDataList.forEach(el => {

        if (el === 'otherRefNo3') {
          this.popupFormData.relocateId = Number(result.data[el]);
        } else {
          this.popupFormData[el] = result.data[el];
        }
      });
      this.inputDataSource(matData, 'popup');
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;
    }
  }

  changeDisabled(type, sts): void {
    const editorList = ['adjustDate', 'itemAdminId', 'itemId', 'expectQty1', 'remarks'];

    if (type) { // type Add, Edit

      if (sts === '100') {

        editorList.forEach(el => {
          // this.popupForm.instance.getEditor(el).option('disabled', el === 'itemId' || el === 'itemAdminId');
          this.popupForm.instance.getEditor(el).option('disabled', type);
        });
        this.saveBtn.visible = false;
        this.moveBtn.visible = false;
      } else {

        editorList.forEach(el => {
          this.popupForm.instance.getEditor(el).option('disabled', type);
        });
        this.saveBtn.visible = false;
        this.deleteBtn.visible = false;
        this.moveBtn.visible = false;
      }
    } else {

      editorList.forEach(el => {
        this.popupForm.instance.getEditor(el).option('disabled', type);
      });
      this.saveBtn.visible = true;
      this.moveBtn.visible = true;
    }
  }

  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      const checkList = this.popupGrid.instance.getVisibleRows();
      const checkData = await this.checkMoveData(checkList);

      if (checkData.checkFlg || checkData.moveFlg) {
        return;
      }

      // if (!this.popupFormData.relocateId) {
      // }
      const rowList = checkList.map(el => el.data);
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const saveList = rowList.concat(this.popupFormData);
      const saveData = {master: this.popupFormData, detail: saveList};
      const result = await this.service.save(saveData);

      if (this.resultMsgCallback(result, 'Save')) {
        this.onPopupClose();
      }
    }
  }

  async onMoveLocation(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      const checkList = this.popupGrid.instance.getVisibleRows();
      const checkData = await this.checkMoveData(checkList, 'invChkFlg');
      const rowList = this.popupGrid.instance.getVisibleRows().filter(el => el.data.moveFlg === SoCommonUtils.FLAG_TRUE)
        .map(move => move.data);

      if (rowList.length <= 0) {
        this.utilService.notify_error('생산로케이션에 재고가 존재합니다.');
        return;
      }

      if (checkData.checkFlg) { return; }

      if (!await this.utilService.confirm('로케이션이동 지시를 하시겠습니까?')) {
        return;
      }
      const saveData = {master: this.popupFormData, detail: rowList};
      const result = await this.service.move(saveData);

      if (this.resultMsgCallback(result, 'Move')) {

        checkList.map(el => el.data).forEach(change => {
          change.moveFlg = SoCommonUtils.FLAG_FALSE;
        });
        console.log(checkList);
        this.popupFormData.relocateId = result.data.uid;
      }
    }
  }

  async checkMoveData(checkList, col?): Promise<any> {
    let checkFlg = false;
    let moveFlg = false;

    for (const checkRow of checkList) {

      if (!col) {

        if (checkRow.data.invChkFlg === SoCommonUtils.FLAG_FALSE) {
          this.utilService.notify_error('수량이 초과하였습니다.');
          checkFlg = true;
          break;
        } else if (checkRow.data.moveFlg === SoCommonUtils.FLAG_TRUE) {
          this.utilService.notify_error('로케이션 이동지시가 필요합니다.');
          checkFlg = true;
          moveFlg = true;
          break;
        }
      } else {

        if (checkRow.data[col] === SoCommonUtils.FLAG_FALSE) {
          this.utilService.notify_error('수량이 초과하였습니다.');
          checkFlg = true;
          break;
        }
      }
    }
    return {checkFlg, moveFlg};
  }


  async onPopupDelete(): Promise<void> {
    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));

    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    const result = await this.service.delete({
      uid: this.popupFormData.adjustId, relocateId: this.popupFormData.relocateId});

    if (this.resultMsgCallback(result, 'Delete')) {
      this.onPopupClose();
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

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initData(this.mainForm);
  }

  onValueChangedItemAdminId(e): void {

    if (!e.value) {
      this.dsInstructItem = null;
      this.popupForm.formData.itemId = null;
      return;
    }
    const findValue = this.dsItemAdmin.filter(code => code.uid === e.value);
    this.dsInstructItem = this.copyInstructItem.filter(el => el.itemAdminId === findValue[0].uid);
  }

  async onValueChangedItem(e): Promise<void> {

    if (!e.value) {
      this.popupForm.formData.isSerial = null;
      await this.inputDataSource([], 'popup');
      return;
    }
    const itemData = this.dsInstructItem.filter(el => e.value === el.uid);
    this.popupForm.formData.isSerial = itemData[0].isSerial;

    if (!this.deleteBtn.visible) {
      const result = await this.service.getBom(this.popupFormData);
      this.inputDataSource(result.data, 'popup');
    }
  }

  async onValueChangedQty(e): Promise<void> {

    if (!e.value || !this.popupFormData.itemId) { return; }

    if (!this.deleteBtn.visible) {
      const result = await this.service.getBom(this.popupFormData);
      this.inputDataSource(result.data, 'popup');
    }
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  setItemAdminValue(rowData: any, value: any): void {
    rowData.itemAdminId = value;
    rowData.itemId = null;
    rowData.unit = null;
  }

  getFilteredItemId(options): any {
    return {
      store: this.dsItem,
      filter: options.data ? ['itemAdminId', '=', options.data.itemAdminId] : null
    };
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  async onViewReport(): Promise<void> {
    const selectList = await this.mainGrid.instance.getSelectedRowsData();
    const arrUid = new Array();

    if (selectList.length > 0) {
      for (const selectRow of selectList) {
        arrUid.push(selectRow.uid);
      }
    }
    const reportFile = 'file=ProcessMoveTable1.jrf';
    const reportOption = [
      {
        dataSet: 'DataSet0',
        node: 'data',
        path: '/report-service/report/processMoveTableHeader',
        apiParam: {
          tenant: this.G_TENANT,
          uid: arrUid
        }
      }
    ];

    this.utilService.openViewReport(reportFile, reportOption);
  }
}
