import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {MatAdjustDetailVO, MatinstructService} from '../matinstruct/matinstruct.service';
import {MoveDetailVO} from '../warehousemove/warehousemove.service';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {BomService} from '../../mm/bom/bom.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {MatconfirmedService} from './matconfirmed.service';
import {SoCommonUtils} from '../../so/soCommonUtils';

@Component({
  selector: 'app-matconfirmed',
  templateUrl: './matconfirmed.component.html',
  styleUrls: ['./matconfirmed.component.scss']
})
export class MatconfirmedComponent implements OnInit, AfterViewInit {

  constructor(
    public utilService: CommonUtilService,
    private service: MatconfirmedService,
    private matinstructService: MatinstructService,
    private bomService: BomService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.procMatConfirmed = this.procMatConfirmed.bind(this);
    this.procReMatConfirmed = this.procReMatConfirmed.bind(this);
    this.onValueChangedAdjustQty = this.onValueChangedAdjustQty.bind(this);
    this.onOpenDamageReason = this.onOpenDamageReason.bind(this);
    this.damagePopupCancelClick = this.damagePopupCancelClick.bind(this);
    this.damagePopupSaveClick = this.damagePopupSaveClick.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('damageGrid', {static: false}) damageGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('damagePopup', {static: false}) damagePopup: DxPopupComponent;
  @ViewChild('damagePopupForm', {static: false}) damagePopupForm: DxFormComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

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
  popupKey = 'displayLotId';

  codeList: MoveDetailVO[];

  damageDataSource: DataSource;
  damageEntityStore: ArrayStore;

  // Changes
  dsWarehouse = [];
  dsOwner = [];
  dsProdSts = [];
  dsYN = [];
  dsUser = [];

  dsItemAdmin = [];
  dsItem = [];
  dsInstructItem = [];
  copyInstructItem = [];
  dsLocation = [];
  dsDamageReason = [];
  dsDamageFlg = [];

  shownFlag = false;
  damageReasonVisible = false;
  damagePopupData: any = {};
  changes = [];

  GRID_STATE_KEY = 'inv_matconfirmed';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  globalExpectQty2 = 0;

  infoData = {
    tenant: this.utilService.getTenant(),
    ownerId: this.utilService.getCommonOwnerId(),
    warehouseId: this.utilService.getCommonWarehouseId(),
    companyId: this.utilService.getCommonOwnerId(),
    logisticsId: this.utilService.getCommonWarehouseVO().logisticsId,
    itemAdminId: this.utilService.getCommonItemAdminId()
  };


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
    this.inputDataSource(this.codeList, 'popup', 'uid');
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

    // 불량사유
    this.codeService.getCode(this.G_TENANT, 'DAMAGEREASON').subscribe(r => {
      this.dsDamageReason = r.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  inputDataSource(inputData, type, uidKey): void {

    this[type + 'EntityStore'] = new ArrayStore({
        data: inputData,
        key: uidKey
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

      if (this.resultMsgCallback(result, 'Search')) {
        await this.inputDataSource(result.data, 'main', 'uid');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  onPopupOpen(e): void {
    this.inputDataSource([], 'popup', 'uid');
    this.popupMode = 'Edit';
    this.onPopupSearch(e.data);
    this.popup.visible = true;
  }

  initData(form): void {

    form.formData = {
      tenant: this.infoData.tenant,
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
    this.popupGrid.instance.cancelEditData();
    this.onSearch();
  }

  async onPopupSearch(data): Promise<void> {
    let result;
    let uidKey;

    uidKey = this.popupKey;
    result = await this.service.getDetail(data);

    // adjustDetailList uid
    if (this.resultMsgCallback(result, 'PopupSearch')) {
      const prodData = await result.data.adjustDetailList.filter(el => el.isProduct === 'Y');
      const matData = await result.data.adjustDetailList.filter(el => el.isProduct === 'N');
      const itemData = await this.dsItem.filter(el => prodData[0].itemId === el.uid);
      const formDataList = ['adjustKey', 'adjustDate', 'sts', 'warehouseId', 'otherRefNo3',
        'logisticsId', 'ownerId', 'companyId', 'adjustType'];

      this.popupFormData = prodData[0];
      this.popupFormData.isSerial = itemData[0].isSerial;

      formDataList.forEach(el => {

        if (el === 'otherRefNo3') {
          this.popupFormData.relocateId = Number(result.data[el]);
        } else {
          this.popupFormData[el] = result.data[el];
        }
      });
      const confirmedBtn = this.popup.toolbarItems[0];

      let opt = {};

      if (data.sts === '100') {
        opt = {
          text: this.utilService.convert1('phyconfirmed_confirmed', '생산실적'),
          type: 'normal',
          onClick: this.procMatConfirmed
        };
        confirmedBtn.visible = true;
        this.popupForm.instance.getEditor('adjustQty1').option('disabled', false);
        this.popupForm.instance.getEditor('remarks').option('disabled', false);
        this.popupGrid.editing.allowUpdating = true;
      } else if (data.sts === '500') {

        if (this.popupFormData.otherRefNo2 === '1') {

          opt = {
            text: this.utilService.convert1('phyconfirmed_redirect', '생산재지시'),
            type: 'normal',
            onClick: this.procReMatConfirmed
          };
          confirmedBtn.visible = true;
        } else {
          confirmedBtn.visible = false;
        }
        this.popupForm.instance.getEditor('adjustQty1').option('disabled', true);
        this.popupForm.instance.getEditor('remarks').option('disabled', true);
        this.popupGrid.editing.allowUpdating = false;
      }
      confirmedBtn.options = opt;

      this.popupFormData.adjustId = result.data.uid;
      this.inputDataSource(matData, 'popup', uidKey);
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;
    }
  }

  popupShown(): void {
    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
  }

  async procMatConfirmed(): Promise<void> {
    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('inv_btn_matinstruct'));
    const checkList = this.popupGrid.instance.getVisibleRows().filter(row => row.rowType === 'data');
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      const check = await this.checkMoveData(checkList);

      if (check) {
        return;
      }
      const rowList = checkList.map(move => move.data);
      const saveList = rowList.concat(this.popupFormData);
      const saveData = {master: this.popupFormData, detail: saveList};
      const result = await this.service.proc(saveData);

      if (this.resultMsgCallback(result, confirmMsg)) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  async checkMoveData(checkList): Promise<boolean> {
    const prodQty = this.popupFormData.adjustQty1;
    const itemTotal = new Map();
    const diffTotal = new Map();
    let checkFlg = false;
    let sumMatQty = 0;

    for (const checkRow of checkList) {
      const rowData = checkRow.data;
      const totalMatQty = rowData.visibleQty + rowData.expectQty2;

      sumMatQty += totalMatQty;

      if (totalMatQty > rowData.matLocQty) {
        this.utilService.notify_error('생성로케이션의 재고가 부족합니다. 로케이션 이동지시가 필요합니다.');
        // checkRow.rowIndex
        checkFlg = true;
        break;
      }
      const expectQty1 = rowData.bomQty * prodQty;

      console.log(expectQty1);

      itemTotal.set(rowData.itemId, !itemTotal.get(rowData.itemId) ?
        rowData.visibleQty : itemTotal.get(rowData.itemId) + (rowData.visibleQty));
      diffTotal.set(rowData.itemId, !diffTotal.get(rowData.itemId) ?
        expectQty1 : diffTotal.get(rowData.itemId) + 0);

      rowData.adjustQty1 = rowData.visibleQty * -1;
    }

    if (!checkFlg) {

      try {
        itemTotal.forEach((value, key) => {

          if (value !== diffTotal.get(key)) {
            this.utilService.notify_error('원자재 개수가 맞지 않습니다.');
            checkFlg = true;
            throw new Error();
          }
        });

        if (prodQty + sumMatQty === 0) {
          this.utilService.notify_error('실적수량이 0일 때 불량수량의 합이 0일 수 없습니다.');
          checkFlg = true;
          throw new Error();
        }
      } catch (e) {
      }
    }
    return checkFlg;
  }

  async procReMatConfirmed(): Promise<void> {
    const checkList = this.popupGrid.instance.getVisibleRows().filter(row => row.rowType === 'data');
    const reMatConfirmedQty = this.popupFormData.expectQty1 - this.popupFormData.adjustQty1;
    let reMoveLocFlg = SoCommonUtils.FLAG_FALSE;

    for (const checkRow of checkList) {
      const rowData = checkRow.data;
      const newExpectQty1 = rowData.bomQty * reMatConfirmedQty;

      if (newExpectQty1 > rowData.matLocQty) {
        rowData.moveQty = newExpectQty1 - rowData.matLocQty;
        rowData.moveFlg = SoCommonUtils.FLAG_TRUE;
        reMoveLocFlg = SoCommonUtils.FLAG_TRUE;
      } else if (newExpectQty1 < rowData.matLocQty) {
        rowData.moveQty = 0;
        rowData.moveFlg = SoCommonUtils.FLAG_FALSE;
      }
    }
    const msg = reMoveLocFlg === SoCommonUtils.FLAG_TRUE ?
      '로케이션에 재고가 부족 로케이션 이동을 하시겠습니까?' :
      this.utilService.convert('confirmExecute', this.utilService.convert('inv_btn_matinstruct'));

    if (!await this.utilService.confirm(msg)) {
      return;
    }
    const rowList = checkList.map(el => el.data);
    const saveData = {master: this.popupFormData, detail: rowList, reMoveLocFlg};
    const result = await this.service.reProc(saveData);

    if (this.resultMsgCallback(result, 'Move')) {
      this.onPopupClose();
      this.onSearch();
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

  onValueChangedAdjustQty(e): void {

    if (!!e.value) {

      if (e.value > this.popupFormData.expectQty1) {
        this.popupForm.instance.getEditor('adjustQty1').option('value', 0);
        this.utilService.notify_error(this.utilService.convert('so_valid_qtylt', this.utilService.convert('inv_matinstruct_adjustQty1'),
          this.utilService.convert('inv_matinstruct_expectQty1')));
      }
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initData(this.mainForm);
  }

  setReasonValue(rowData, value): void {
    rowData.reason = value;
    rowData.damageReason = value;
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async onOpenDamageReason(e, adjustDetailId): Promise<void> {
    this.damageReasonVisible = true;

    this.changes = [];
    this.inputDataSource([], 'damage', 'uid');

    const idx = this.popupGrid.instance.getRowIndexByKey(adjustDetailId);
    const itemId = this.popupGrid.instance.cellValue(idx, 'itemId');
    this.globalExpectQty2 = this.popupGrid.instance.cellValue(idx, 'expectQty2');  // 불량수량
    const itemResult = await this.service.findItemDetail({uid: itemId});

    if (itemResult.success) {
      this.damagePopupData = itemResult.data;
      this.damagePopupData.adjustDetailId = adjustDetailId;
    } else {
      this.utilService.notify_error(itemResult.msg);
      return;
    }

    const result = await this.service.getDamageReason({adjustDetailId});
    if (result.success) {
      this.inputDataSource(result.data, 'damage', 'uid');
    } else {
      this.utilService.notify_error(result.msg);
      return;
    }

    this.damageGrid.focusedRowKey = null;
    this.damageGrid.paging.pageIndex = 0;
  }

  damagePopupShown(e): void {
    this.damageGrid.instance.repaint();
  }

  async damagePopupSaveClick(e): Promise<void> {
    const columns = ['reason', 'qty'];    // required 컬럼 dataField 정의
    const messages = {reason: '불량사유', qty: '수량'};

    const tempData = this.collectGridData(this.changes);

    let chk = true;
    for (const item of tempData) {

      if (!item.key && !item.uid) {
        for (const col of columns) {
          if ((item[col] === undefined) || (item[col] === '')) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert(messages[col]));
            this.utilService.notify_error(msg);
            return;
          }
        }
      }

      this.damageGrid.instance.byKey(item.uid).then(
        (dataItem) => {
          for (const col of columns) {
            if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
              const msg = this.utilService.convert('com_valid_required', this.utilService.convert(messages[col]));
              this.utilService.notify_error(msg);
              chk = false;
              return;
            }
          }
        }
      );
    }

    if (!chk) {
      return;
    }


    await this.mainGrid.instance.saveEditData();

    await this.damageGrid.instance.saveEditData();
    const damageList = this.damageGrid.instance.getDataSource().items();

    let tot = 0;
    for (const d of damageList) {
      tot += Number(d.qty);
    }

    if (this.globalExpectQty2 !== tot) {
      this.utilService.notify_error(this.utilService.convert1('불량수량이 일치하지 않습니다.', '불량수량이 일치하지 않습니다.'));
      return;
    }

    const result = await this.service.saveDamageReason(tempData);

    if (result.success) {
      this.utilService.notify_success('save success');
    } else {
      this.utilService.notify_error(result.msg);
    }

    this.damagePopupCancelClick(null);
    await this.onSearch();
  }

  damagePopupCancelClick(e): void {
    this.damageReasonVisible = false;
    this.damagePopupForm.instance.resetValues();
  }

  addClick(): void {
    this.damageGrid.instance.addRow().then(r => {
      const rowIdx = this.damageGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.damageGrid);
    });
  }

  deleteClick(): void {
    if (this.damageGrid.focusedRowIndex > -1) {
      const focusedIdx = this.damageGrid.focusedRowIndex;
      this.damageGrid.instance.deleteRow(focusedIdx);
      this.damageEntityStore.push([{type: 'remove', key: this.damageGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.damageGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
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
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
              tenant: this.G_TENANT
            }, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  onInitNewRowDamage(e): void {
    e.data.adjustDetailId = this.damagePopupData.adjustDetailId;
  }
}
