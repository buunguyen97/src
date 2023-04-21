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
import {LogicalWhMoveOutConfService, LogicalWhMoveOutConfVO} from './logical-wh-move-out-conf.service';

@Component({
  selector: 'app-logical-wh-move-out-conf',
  templateUrl: './logical-wh-move-out-conf.component.html',
  styleUrls: ['./logical-wh-move-out-conf.component.scss']
})
export class LogicalWhMoveOutConfComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('moveDate', {static: false}) moveDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  mainFormData: LogicalWhMoveOutConfVO = {} as LogicalWhMoveOutConfVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: LogicalWhMoveOutConfVO = {} as LogicalWhMoveOutConfVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  key = 'uid';
  selectedRows: number[];
  changes = [];

  popupKey = 'uid';
  popupVisible = false;
  popupMode = 'Add';
  popupData: LogicalWhMoveOutConfVO = {} as LogicalWhMoveOutConfVO;

  dsWarehouse = [];
  dsFilteredItemId = [];
  dsItemAdmin = [];
  dsCompany = [];
  dsItemId = [];
  dsUnitStyle = [];
  dsOwner = [];
  dsYN = [];
  dsUser = [];
  dsToLoc = [];
  dsTransLoc = [];
  dsFromLoc = [];
  dsMoveType = [];
  dsMoveStatus = [];
  dsCountry = [];
  dsToWarehouse = [];
  filteredToWarehouse = [];
  dsDamageFlg = [];

  currentCompany = '';
  owner: any;

  GRID_STATE_KEY = 'logicalwhmoveoutconf';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  constructor(
    public utilService: CommonUtilService,
    private service: LogicalWhMoveOutConfService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.popupSaveClick = this.popupSaveClick.bind(this);
    // this.onValueChangedWh = this.onValueChangedWh.bind(this);
    // this.onValueChangedWh2 = this.onValueChangedWh2.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.addClick = this.addClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.onValueChangedCompany = this.onValueChangedCompany.bind(this);
  }

  ngOnInit(): void {
    this.currentCompany = this.utilService.getCompany();
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initForm(): void {
    this.mainForm.instance.getEditor('sts').option('value', '500');
    // this.mainForm.instance.getEditor('moveType').option('value', 'OUTER');
    const rangeDate = this.utilService.getDateRange();
    this.moveDate.value = rangeDate.toDate;
    this.mainForm.instance.focus();
  }

  initCode(): void {
    // 창고
    this.codeService.getSalesWarehouse(this.currentCompany).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    this.codeService.getSalesWarehouse(null).subscribe(result => {
      this.dsToWarehouse = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // // 국가
    // this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
    //   this.dsCountry = result.data;
    // });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 이동유형
    this.codeService.getCode(this.G_TENANT, 'LOGICALWHMOVETYPE').subscribe(result => {
      this.dsMoveType = result.data;
    });

    // 이동상태
    this.codeService.getCode(this.G_TENANT, 'LOGICALWHMOVESTATUS').subscribe(result => {
      this.dsMoveStatus = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.owner = result.data[0]["company"];
    });

    // 국가
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    await this.mainGrid.instance.deselectAll();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      this.mainFormData.moveDate = document.getElementsByName('moveDate').item(1).getAttribute('value');
      this.mainFormData.moveType = 'OUTER';
      this.mainFormData.fromCompanyId = this.currentCompany;

      const result = await this.service.get(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.mainDataSource = new DataSource({
          store: this.mainEntityStore
        });

        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    // this.deleteBtn.visible = false;

    this.showPopup('Add', {...e.data});
  }

  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.popupKey
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.onSearchPopup();
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupData.uid) {
      const result = await this.service.getFull(this.popupData);

      console.log(result.data);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.logicalWhMoveOutConfDetailList,
            key: this.popupKey
          }
        );
        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });
        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  popupShown(e): void {
    this.popupGrid.instance.deselectAll();

    this.codeService.getSalesWarehouse(null).subscribe(result => {
      this.filteredToWarehouse = this.dsToWarehouse.filter(el => el.ptrn_cd === this.popupData.toCompanyId);
    });

    this.popupData.itemAdminId = this.utilService.getCommonItemAdminId();
    this.popupData.companyId = this.utilService.getCommonOwnerId();
    this.popupData.ownerId = this.utilService.getCommonOwnerId();

    this.changeDisabled(this.popupData.sts);

    this.popupData.moveDate = this.utilService.formatDate(new Date());

    const date = this.utilService.getFormatDate(new Date());

    if (this.popupMode === 'Add') { // 신규
      // this.popupForm.instance.getEditor('moveDate').option('disabled', false);
      this.popupForm.instance.getEditor('shipSchDate').option('value', date);
      this.popupForm.instance.getEditor('rcvSchDate').option('value', date);

      this.popupForm.instance.getEditor('sts').option('disabled', true);
      this.popupForm.instance.getEditor('sts').option('value', '500');
      // this.popupForm.instance.getEditor('moveType').option('disabled', true);
      // this.popupForm.instance.getEditor('moveType').option('value', 'OUTER');
      this.popupData.fromCompanyId = this.currentCompany;


    } else if (this.popupMode === 'Edit') { // 수정
      if (!this.popupForm.instance.getEditor('shipSchDate').option('value')) {
        this.popupForm.instance.getEditor('shipSchDate').option('value', date);
      }

      if (!this.popupForm.instance.getEditor('rcvSchDate').option('value')) {
        this.popupForm.instance.getEditor('rcvSchDate').option('value', date);
      }
    }

    // this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

    // 횡스크롤 제거
    this.gridUtil.fnScrollOption(this.popupGrid);
    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
  }

  changeDisabled(sts): void {

    const confirmedBtn = this.popup.toolbarItems[0];
    confirmedBtn.options = {
      text: this.utilService.convert1('logicalwhmoveoutconf_msg_confirmed', '승인'),
      type: 'normal',
      onClick: this.onExcute.bind(this)
    };

    if (sts === '500' || this.popupMode === 'Add') {
      confirmedBtn.visible = true;
    } else {
      confirmedBtn.visible = false;
    }

    this.popupGrid.focusedRowKey = null;
    this.popupGrid.paging.pageIndex = 0;
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {

    const detailList = this.collectGridData(this.changes);
    // await this.popupGrid.instance.saveEditData();

    const popData = this.popupForm.instance.validate();
    const gridList = this.popupGrid.instance.getDataSource().items();

    if (popData.isValid && (gridList.length > 0 || detailList.length > 0)) {

      if (detailList.length > 0) {
        for (const items of detailList) {
          if ((items.operType === 'insert') && !items.itemId) {
            const errorMsg = this.utilService.convert1('gridvalidationerror_itemId', '품목을 선택해주세요.');
            this.utilService.notify_error(errorMsg);
            return;
          }

          if (!items.moveQty) {
            const errorMsg = this.utilService.convert1('gridvalidationerror_moveQty', '수량을 입력해주세요.');
            this.utilService.notify_error(errorMsg);
            return;
          }
        }
      }

      console.log(popData);
      console.log(this.popupData);

      if (!this.popupData.fromWarehouseId || !this.popupData.toWarehouseId) {
        const errorMsg = this.utilService.convert1('pwhcdNull', '물류창고가 없습니다.');
        this.utilService.notify_error(errorMsg);
        return;
      }

      if (!this.popupData.fromCompanyId || !this.popupData.toCompanyId) {
        const errorMsg = this.utilService.convert1('companyIdSameError', '요청회사와 이동후회사가 같습니다.');
        this.utilService.notify_error(errorMsg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('/inv/logicalwhmoveoutsave', '창고이동(외부)'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      try {
        let result;
        // const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const saveContent = this.popupData as LogicalWhMoveOutConfVO;
        const moveDate = document.getElementsByName('moveDate').item(1).getAttribute('value');

        saveContent.moveDate = moveDate;
        saveContent.fromCompanyId = this.popupForm.instance.getEditor('fromCompanyId').option('value');
        saveContent.fromLogicalWhId = this.popupForm.instance.getEditor('fromLogicalWhId').option('value');

        saveContent.toCompanyId = this.popupForm.instance.getEditor('toCompanyId').option('value');
        saveContent.toLogicalWhId = this.popupForm.instance.getEditor('toLogicalWhId').option('value');
        saveContent.owner = this.owner;
        saveContent.moveType = 'OUTER';

        saveContent.logicalWhMoveOutConfDetailList = detailList;

        if (this.popupMode === 'Add') {

        } else {
          // saveContent.logicalWhMoveOutConfDetailList = gridList;
          saveContent.moveKey = this.popupForm.instance.getEditor('moveKey').option('value');
        }

        saveContent.tenant = this.G_TENANT;

        console.log(saveContent);
        result = await this.service.save(saveContent);

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

  async onExcute(e): Promise<void> {

    const popData = this.popupForm.instance.validate();
    const gridList = this.popupGrid.instance.getDataSource().items();
    const detailList = this.collectGridData(this.changes);

    if (popData.isValid && (gridList.length > 0 || detailList.length > 0)) {

      if (!this.popupData.fromWarehouseId || !this.popupData.toWarehouseId) {
        const errorMsg = this.utilService.convert1('pwhcdNull', '물류창고가 없습니다.');
        this.utilService.notify_error(errorMsg);
        return;
      }

      const confirmMsg = this.utilService.convert1('/inv/logicalwhmoveoutconfirmSave', '창고이동(외부)을 승인하시겠습니까?');
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      try {
        let result;
        // const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const saveContent = this.popupData as LogicalWhMoveOutConfVO;

        if (this.popupMode === 'Add') {
          saveContent.logicalWhMoveOutConfDetailList = detailList;
        } else {
          saveContent.logicalWhMoveOutConfDetailList = gridList;
          saveContent.moveKey = this.popupForm.instance.getEditor('moveKey').option('value');
        }

        saveContent.moveDate = this.popupForm.instance.getEditor('moveDate').option('value');
        saveContent.fromCompanyId = this.popupForm.instance.getEditor('fromCompanyId').option('value');
        saveContent.fromLogicalWhId = this.popupForm.instance.getEditor('fromLogicalWhId').option('value');
        saveContent.toCompanyId = this.popupForm.instance.getEditor('toCompanyId').option('value');
        saveContent.toLogicalWhId = this.popupForm.instance.getEditor('toLogicalWhId').option('value');

        saveContent.ownerId = this.utilService.getCommonOwnerId();
        saveContent.moveType = 'OUTER';
        saveContent.tenant = this.G_TENANT;
        saveContent.owner = this.owner;

        console.log(saveContent);

        result = await this.service.execute(saveContent);

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
    await this.initForm();
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  onValueChangedCompany(e): void {
    if (!e.value && e.popupMode === 'add') {
      this.popupFormData.toWarehouseId = null;
      this.dsWarehouse = [];
    } else {
      this.popupData.toWarehouseId = null;
      this.popupData.toCountrycd = null; // 소문자 'kr'은 안나옴
      this.popupData.toAddress1 = null;
      this.popupData.toAddress2 = null;
      this.popupData.toPhone1 = null;

      this.codeService.getSalesWarehouse(e.value).subscribe(result => {
        this.filteredToWarehouse = result.data;
      });
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
  }

  // 추가버튼 이벤트
  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
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

  selectionFromLogicalWhId = (e: any) => {
    if (e.value === null) {
      return;
    }
    const findWarehouse = this.dsWarehouse.filter(el => el.sales_wh_cd === e.value);
    if (findWarehouse && findWarehouse.length > 0) {
      this.popupData.fromWarehouseId = findWarehouse[0].pwh_cd;
      this.popupData.countrycd = findWarehouse[0].country; // 소문자 'kr'은 안나옴
      this.popupData.address1 = findWarehouse[0].address1;
      this.popupData.address2 = findWarehouse[0].address2;
      this.popupData.phone1 = findWarehouse[0].phone1;

      if (!findWarehouse[0].pwh_cd) {
        const errorMsg = this.utilService.convert1('pwhcdNull', '물류창고가 없습니다.');
        this.utilService.notify_error(errorMsg);
        return;
      }
    }
  }

  selectionToLogicalWhId = (e: any) => {
    if (e.value === null) {
      return;
    }
    const findWarehouse = this.dsToWarehouse.filter(el => el.sales_wh_cd === e.value);
    if (findWarehouse && findWarehouse.length > 0) {
      this.popupData.toWarehouseId = findWarehouse[0].pwh_cd;
      this.popupData.toCountrycd = findWarehouse[0].country; // 소문자 'kr'은 안나옴
      this.popupData.toAddress1 = findWarehouse[0].address1;
      this.popupData.toAddress2 = findWarehouse[0].address2;
      this.popupData.toPhone1 = findWarehouse[0].phone1;

      if (!findWarehouse[0].pwh_cd) {
        const errorMsg = this.utilService.convert1('pwhcdNull', '물류창고가 없습니다.');
        this.utilService.notify_error(errorMsg);
        return;
      }
    }
  }

  onInitNewRow(e): void {
    e.data.damageFlg = 'N';
  }

}
