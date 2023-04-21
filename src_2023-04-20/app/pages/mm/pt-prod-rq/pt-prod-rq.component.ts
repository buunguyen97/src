import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {PtProdRqService, PtProdRqVO} from './pt-prod-rq.service';

@Component({
  selector: 'app-pt-prod-rq',
  templateUrl: './pt-prod-rq.component.html',
  styleUrls: ['./pt-prod-rq.component.scss']
})
export class PtProdRqComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupGridInv', {static: false}) popupGridInv: DxDataGridComponent;

  @ViewChild('movePopup', {static: false}) popupMove: DxPopupComponent;
  @ViewChild('popupMoveForm', {static: false}) popupMoveForm: DxFormComponent;
  @ViewChild('popupMoveGrid', {static: false}) popupMoveGrid: DxDataGridComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('moveBtn', {static: false}) moveBtn: DxButtonComponent;

  @ViewChild('fromWorkDate', {static: false}) fromWorkDate: DxDateBoxComponent;
  @ViewChild('toWorkDate', {static: false}) toWorkDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;
// ***** main ***** //
  // Form
  mainFormData: PtProdRqVO = {} as PtProdRqVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: PtProdRqVO = {} as PtProdRqVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  popupInvDataSource: DataSource;
  popupInvEntityStore: ArrayStore;

  moveDataSource: DataSource;
  moveEntityStore: ArrayStore;

  key = 'uid';
  selectedRows: number[];

  moveKey = 'invUid';
  popupInvKey = 'path';

  dsUser = [];
  dsItemId = [];
  dsFullItemId = [];
  dsSpec = [];
  dsWarehouseId = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  dsMoveItemId = [];
  dsFilteredItemId = [];
  dsRout = [];
  dsRoutGb = [];
  dsUnitStyle = [];
  dsYN = [];
  dsActFlg = [];
  dsLocId = [];
  dsRevision = [];

  searchList = [];

  // Grid Popup
  popupKey = 'workSeq';
  changes = [];
  popupVisible = false;
  popupMode = 'Add';
  popupData: PtProdRqVO = {} as PtProdRqVO;

  popupMoveVisible = false;

  GRID_STATE_KEY = 'mm_ptprodrq';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  revisionUpdateCallFlg = false;
  itemSearchFlg = false;

  constructor(
    public utilService: CommonUtilService,
    public service: PtProdRqService,
    public codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.popupMoveSaveClick = this.popupMoveSaveClick.bind(this);
    this.popupMoveCancelClick = this.popupMoveCancelClick.bind(this);
    this.setRoutValue = this.setRoutValue.bind(this);
    this.onChangedItemId = this.onChangedItemId.bind(this);
    this.onChangedOrdQty = this.onChangedOrdQty.bind(this);
    this.setItemValue = this.setItemValue.bind(this);
    this.onSearchPopup = this.onSearchPopup.bind(this);
    this.fnPostSearchPopup = this.fnPostSearchPopup.bind(this);
    this.onChangedRevision = this.onChangedRevision.bind(this);
    this.fnSetPopupDataRevision = this.fnSetPopupDataRevision.bind(this);
  }

  ngOnInit(): void {
    this.initCode();
  }

  ngAfterViewInit(): void {
    // 팝업 그리드 초기화
    this.popupEntityStore = new ArrayStore({data: [], key: this.popupKey});
    this.popupDataSource = new DataSource({store: this.popupEntityStore});
    this.popupInvEntityStore = new ArrayStore({data: [], key: this.popupInvKey});
    this.popupInvDataSource = new DataSource({store: this.popupInvEntityStore});
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromWorkDate = document.getElementsByName('fromWorkDate').item(1).getAttribute('value');
      this.mainFormData.toWorkDate = document.getElementsByName('toWorkDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainEntityStore = new ArrayStore({data: result.data, key: this.key});
        this.mainDataSource = new DataSource({store: this.mainEntityStore});
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
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

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => this.dsWarehouseId = result.data);

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => this.dsOwnerId = result.data);

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => this.dsItemAdminId = result.data);

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsMoveItemId = result.data;
      this.dsFilteredItemId = this.dsMoveItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsFullItemId = result.data;
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 공정ID
    this.codeService.getRoute(this.G_TENANT).subscribe(result => this.dsRout = result.data);

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => this.dsUnitStyle = result.data);

    // 공정유형
    this.codeService.getCode(this.G_TENANT, 'ROUTGB').subscribe(result => this.dsRoutGb = result.data);

    // 지시마감
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => this.dsYN = result.data);

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => this.dsUser = result.data);
    // 로케이션코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => this.dsLocId = result.data);
    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => this.dsActFlg = result.data);
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromWorkDate.value = rangeDate.fromDate;
    this.toWorkDate.value = rangeDate.toDate;

    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.mainForm.instance.focus();
  }

  // 신규버튼 이벤트
  onNew(e): void {
    this.deleteBtn.visible = false;
    // 품목
    this.codeService.getItemByRoute(this.G_TENANT).subscribe(result => this.dsFullItemId = result.data);
    this.showPopup('생산지시', {...e.data}, 'N');
  }

  // 신규버튼 이벤트
  onCut(e): void {
    this.deleteBtn.visible = false;
    // 품목
    this.codeService.getCutItemByRoute(this.G_TENANT).subscribe(result => this.dsFullItemId = result.data);
    this.showPopup('절단지시', {...e.data}, 'Y');
  }

  async showPopup(popupMode, data, cutYn): Promise<void> {
    this.changes = [];  // 초기화
    this.popupData = data;

    this.popupData = {
      tenant: this.G_TENANT, ...this.popupData
    };

    this.popupData.cutYn = cutYn;

    this.popupData.itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
    this.popupData.warehouseId = this.mainForm.instance.getEditor('warehouseId').option('value');
    this.popupData.ownerId = this.mainForm.instance.getEditor('ownerId').option('value');
    this.popupData.companyId = this.mainForm.instance.getEditor('ownerId').option('value');
    this.popupData.logisticsId = this.utilService.getCommonWarehouseVO().logisticsId;
    this.popupData.groupOrdQty = data.groupOrdQty;

    if (popupMode === 'Edit') {
      this.popupMode = popupMode;
      this.deleteBtn.visible = true;
    } else {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
    }

    if (this.popupEntityStore) {
      this.popupEntityStore.clear();
      this.popupDataSource.reload();
    }

    if (this.popupInvEntityStore) {
      this.popupInvEntityStore.clear();
      this.popupInvDataSource.reload();
    }

    this.popupVisible = true;
  }

  // 조회 후처리
  async fnPostSearchPopup(result): Promise<void> {
    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      this.utilService.notify_success('search success');

      this.popupEntityStore = new ArrayStore({data: result.data.ptProdRqDetailList, key: this.popupKey});
      this.popupDataSource = new DataSource({store: this.popupEntityStore});

      result.data.ptProdRqInvDetailList.forEach(el => {

        let level = Number(el.level);

        while (level > 0) {
          if (level === Number(el.level)) {
            el.childItemName = '' + el.childItemName;
          }

          el.childItemName = '►' + el.childItemName;

          level--;
        }
        el.totalReQty = Number(el.totalReQty) * this.popupData.groupOrdQty;
      });
      this.utilService.notify_success('search success');

      this.popupInvEntityStore = new ArrayStore({data: result.data.ptProdRqInvDetailList, key: this.popupInvKey});
      this.popupInvDataSource = new DataSource({store: this.popupInvEntityStore});
      await this.popupGrid.instance.deselectAll();
      await this.popupGridInv.instance.deselectAll();
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(data, revision?): Promise<void> {
    let result;

    if (revision || revision >= 0) {// 선택된 리비전 조회
      this.popupData.revision = revision || this.popupData.revision;
      result = await this.service.getFull(this.popupData);
      console.log(result);
      await this.fnPostSearchPopup(result);

    } else {  // 선택된 리비전이 없을 경우 최신 리비전 조회
      this.dsRevision = [];
      await this.fnSetPopupDataRevision(null, true);
      await this.codeService.getItemRouteRevision(this.G_TENANT, this.popupData.groupItemId).subscribe(async (r) => {
        this.dsRevision = r.data;
        if (this.dsRevision.length > 0) {
          await this.fnSetPopupDataRevision(this.dsRevision[0].revision, true);
          // this.popupData.revision = this.dsRevision[0].revision;
        }

        result = await this.service.getFull(this.popupData);
        await this.fnPostSearchPopup(result);
      });
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.codeService.getItem(this.G_TENANT).subscribe(r => {
      this.dsFullItemId = r.data;
    });
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data}, null);
    // this.showPopup('Edit', {...e.data}, e.values[8]);

  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
  }

  onPopupAfterClose(): void {
    if (!!this.popupDataSource) {
      this.popupEntityStore.clear();
      this.popupGrid.instance.cancelEditData();
    }
    if (!!this.popupInvDataSource) {
      this.popupInvEntityStore.clear();
      this.popupGridInv.instance.cancelEditData();
    }
    this.popupForm.instance.resetValues();
    this.codeService.getItem(this.G_TENANT).subscribe(result => this.dsFullItemId = result.data);

    this.onSearch();
  }

  popupShown(e): void {
    this.popupGrid.instance.deselectAll();

    this.popupForm.instance.getEditor('prodKey').option('disabled', true);

    this.popupData.itemAdminId = this.utilService.getCommonItemAdminId();
    this.popupData.warehouseId = this.utilService.getCommonWarehouseId();
    this.popupData.logisticsId = this.utilService.getCommonWarehouseVO().logisticsId;
    this.popupData.ownerId = this.utilService.getCommonOwnerId();
    this.popupData.companyId = this.utilService.getCommonOwnerId();

    if (this.popupMode === 'Add') { // 신규
      this.itemSearchFlg = true;
      const date = this.utilService.getFormatDate(new Date());

      this.popupForm.instance.getEditor('workDate').option('disabled', false);
      this.popupForm.instance.getEditor('workDate').option('value', date);
      this.popupForm.instance.getEditor('groupItemId').option('disabled', false);
      this.popupForm.instance.getEditor('groupOrdQty').option('disabled', false);
      this.popupForm.instance.getEditor('revision').option('disabled', false);

    } else if (this.popupMode === 'Edit') { // 수정
      this.itemSearchFlg = false;

      // if (this.popupData.ordClose === 'Y') {
      //   this.revisionUpdateCallFlg = true;
      //   this.deleteBtn.visible = false;

      this.popupForm.instance.getEditor('workDate').option('disabled', true);
      this.popupForm.instance.getEditor('groupItemId').option('disabled', true);
      this.popupForm.instance.getEditor('revision').option('disabled', true);
      this.popupForm.instance.getEditor('groupOrdQty').option('disabled', true);

      // this.popupGrid.editing.allowUpdating = false;
      // } else {
      //   this.revisionUpdateCallFlg = false;
      //   this.itemSearchFlg = true;
      //   this.deleteBtn.visible = true;
      //   this.popupForm.instance.getEditor('groupItemId').option('disabled', false);
      //   this.popupForm.instance.getEditor('revision').option('disabled', false);
      //   this.popupForm.instance.getEditor('groupOrdQty').option('disabled', false);
      //
      //   this.popupGrid.editing.allowUpdating = true;
      // }


      // this.popupForm.instance.getEditor('groupOrdQty').option('disabled', true);
      // this.popupForm.instance.getEditor('revision').option('disabled', true);

      this.codeService.getItemRouteRevision(this.G_TENANT, this.popupData.groupItemId).subscribe(async (r) => {
        this.dsRevision = r.data;
        this.popupForm.instance.getEditor('groupItemId').option('disabled', true);

        this.onSearchPopup(this.popupData, this.popupData.revision);
      });
    }
    // this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  onEditingStart(e): void {
    e.cancel = e.data.ordClose === 'Y';
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  // 닫기클릭 이벤트
  popupMoveCancelClick(e): void {
    this.popupMoveVisible = false;
  }

  onPopupMoveAfterClose(): void {
    if (!!this.moveDataSource) {
      this.moveEntityStore.clear();
      this.popupMoveGrid.instance.cancelEditData();
    }
    this.popupMoveForm.instance.resetValues();
  }

  popupMoveShown(e): void {
    this.utilService.getPopupGridHeight(this.popupMoveGrid, this.popupMove);

    this.popupMoveGrid.instance.deselectAll();

  }

  // 재고이동버튼 이벤트
  async popupMoveSaveClick(e): Promise<void> {
    if (!await this.utilService.confirm('로케이션이동 지시 요청을 하시겠습니까?')) {
      return;
    }

    try {
      let result;
      const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
      const groupItemId = this.popupForm.instance.getEditor('groupItemId').option('value');

      const saveContent = this.popupData as PtProdRqVO;

      // const detailList = this.collectGridData(this.changes);
      const detailList = this.popupGrid.instance.getDataSource().items();
      const moveList = this.popupMoveGrid.instance.getDataSource().items();

      saveContent.ptProdRqDetailList = detailList;
      saveContent.moveList = moveList;

      saveContent.itemAdminId = itemAdminId;
      saveContent.groupItemId = groupItemId;

      result = await this.service.save(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popupMoveVisible = false;
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {
    const changes = this.collectGridData(this.changes);
    const popData = this.popupForm.instance.validate();

    if (!this.popupForm.instance.getEditor('groupOrdQty').option('value')) {
      this.utilService.notify_error(this.utilService.convert1('mm_ptprodrq_validationmessage', '필수값을 입력하세요.'));
      return;
    }

    const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('ptprodrq', '생산지시'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      let result;
      const warehouseId = this.mainForm.instance.getEditor('warehouseId').option('value');
      const ownerId = this.mainForm.instance.getEditor('ownerId').option('value');
      const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
      const groupItemId = this.popupForm.instance.getEditor('groupItemId').option('value');

      const saveContent = this.popupData as PtProdRqVO;

      // const detailList = this.collectGridData(this.changes);
      const detailList = this.popupGrid.instance.getDataSource().items();

      detailList.forEach(el => {
        const rowIdx = this.popupGrid.instance.getRowIndexByKey(el.uid);
        // const routId = this.popupGrid.instance.cellValue(rowIdx, 'routId');
        // const workSeq = this.popupGrid.instance.cellValue(rowIdx, 'workSeq');
        const routYn = this.popupGrid.instance.cellValue(rowIdx, 'routYn');
        const ordClose = this.popupGrid.instance.cellValue(rowIdx, 'ordClose');
        // const ordQty = this.popupGrid.instance.cellValue(rowIdx, 'ordQty');

        // el.routId = routId;
        // el.workSeq = workSeq;
        el.routYn = routYn;
        el.ordClose = ordClose;
        // el.ordQty = ordQty;
      });

      saveContent.ptProdRqDetailList = detailList;

      saveContent.itemAdminId = itemAdminId;
      saveContent.warehouseId = warehouseId;
      saveContent.ownerId = ownerId;
      saveContent.groupItemId = groupItemId;

      if (this.popupMode === 'Add') {
        result = await this.service.locMoveCheck(saveContent);
      } else {
        result = await this.service.save(saveContent);
      }

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        if (result.data) {
          if (result.data.moveList.length > 0) {
            if (!await this.utilService.confirm('생산 로케이션에 재고가 부족합니다<br>이동지시 요청 창으로 이동하시겠습니까?')) {
              return;
            }

            // 단위 값 셋팅
            result.data.moveList.forEach(el => {
              el.unit = el.itemId;
            });

            this.moveEntityStore = new ArrayStore(
              {
                data: result.data.moveList,
                key: this.moveKey
              }
            );
            this.moveDataSource = new DataSource({
              store: this.moveEntityStore
            });

            this.popupData.prodKey = result.data.prodKey;
            this.popupMoveVisible = true;

          }
        } else {
          this.utilService.notify_success('Save success');
          this.popupVisible = false;
          this.onSearch();
        }
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  async popupHidden(e): Promise<void> {
    this.popupData = null;
    this.dsRevision = [];
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('ptprodrq', '생산지시'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      this.popupData.ptProdRqDetailList = this.popupGrid.instance.getDataSource().items();

      const deleteContent = this.popupData as PtProdRqVO;

      const result = await this.service.delete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // changes -> savedata 변환
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

  // 그리드 Lookup filter 품목
  getFilteredItemId(options): any {
    return {
      store: this.dsFilteredItemId,
      filter: options.data ? ['itemAdminId', '=', options.data.itemAdminId] : null
    };
  }

  // 그리드 공정id 선택시
  setRoutValue(rowData: any, value: any): void {
    rowData.routId = value;
    rowData.workCt = this.dsRout.filter(el => el.uid === value)[0].workCt;        // 작업내용 가져오기
    rowData.routGb = this.dsRout.filter(el => el.uid === value)[0].routGb;    // 공정유형 가져오기
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  /**
   * 품목 변경시 목록 조회 이벤트
   */
  async onChangedItemId(e): Promise<void> {
    if (e.value && this.itemSearchFlg) {
      if (this.popupData.groupItemId !== this.popupData.oldItemId) {
        this.popupData.groupOrdQty = 0;
      }

      this.popupData.groupItemId = e.value;
      this.popupData.itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
      this.popupData.warehouseId = this.mainForm.instance.getEditor('warehouseId').option('value');
      this.popupData.ownerId = this.mainForm.instance.getEditor('ownerId').option('value');

      await this.onSearchPopup(this.popupData);
    } else {
      this.itemSearchFlg = !this.itemSearchFlg;
      return;
    }
  }

  async fnSetPopupDataRevision(revision, unbindEventFlg): Promise<void> {
    this.revisionUpdateCallFlg = unbindEventFlg;
    this.popupData.revision = revision;
  }

  /**
   * 리비전 변경시 목록 조회 이벤트
   */
  async onChangedRevision(e): Promise<void> {
    // 이벤트 종료 플래그가 없을 경우
    if ((e.value || e.value === 0) && !this.revisionUpdateCallFlg) {

      if (this.popupMode === 'Add') {
        this.popupData.groupOrdQty = 0;
      }
      this.popupData.itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
      this.popupData.warehouseId = this.mainForm.instance.getEditor('warehouseId').option('value');
      this.popupData.ownerId = this.mainForm.instance.getEditor('ownerId').option('value');

      await this.onSearchPopup(this.popupData, e.value);
    } else {
      this.revisionUpdateCallFlg = !this.revisionUpdateCallFlg;
      return;
    }
  }

  async onChangedOrdQty(e): Promise<void> {
    if (e.value) {
      this.popupData.groupOrdQty = e.value;

      const detailList = this.popupGrid.instance.getDataSource().items();

      detailList.forEach(el => {
        el.groupOrdQty = this.popupData.groupOrdQty;
        el.ordQty = el.sumQty * el.groupOrdQty;

      });

      await this.onSearchPopup(this.popupData, this.popupData.revision);

      this.popupEntityStore = new ArrayStore({data: detailList, key: this.key});
      this.popupDataSource = new DataSource({store: this.popupEntityStore});
    } else {
      return;
    }
  }

  async onViewReport(): Promise<void> {
    const selectList = await this.mainGrid.instance.getSelectedRowsData();
    const arrProdKey = new Array();

    if (selectList.length > 0) {
      for (const selectRow of selectList) {
        arrProdKey.push(selectRow.prodKey);
      }
    }

    const reportFile = 'file=ProcessMoveTableNew.jrf';
    const reportOption = [
      {
        dataSet: 'DataSet0',
        node: 'data',
        path: '/report-service/report/processMoveTableNew',
        apiParam: {
          tenant: this.G_TENANT,
          prodKey: arrProdKey
        }
      }
    ];

    await this.utilService.openViewReport(reportFile, reportOption);
  }
}
