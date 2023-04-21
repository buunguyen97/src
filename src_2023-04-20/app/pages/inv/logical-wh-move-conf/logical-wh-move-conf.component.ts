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
import {LogicalWhMoveConfService, LogicalWhMoveConfVO} from './logical-wh-move-conf.service';

@Component({
  selector: 'app-logical-wh-move-conf',
  templateUrl: './logical-wh-move-conf.component.html',
  styleUrls: ['./logical-wh-move-conf.component.scss']
})
export class LogicalWhMoveConfComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;
  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  mainFormData: LogicalWhMoveConfVO = {} as LogicalWhMoveConfVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: LogicalWhMoveConfVO = {} as LogicalWhMoveConfVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  key = 'uid';
  selectedRows: number[];
  changes = [];

  popupKey = 'uid';
  popupVisible = false;
  popupMode = 'Add';
  popupData: LogicalWhMoveConfVO = {} as LogicalWhMoveConfVO;

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
  dsDamageFlg = [];

  owner: any;

  GRID_STATE_KEY = 'logicalwhmoveconf';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  currentCompany = '';

  constructor(
    public utilService: CommonUtilService,
    private service: LogicalWhMoveConfService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.popupCancelClick = this.popupCancelClick.bind(this);

    // this.onValueChangedToWarehouse = this.onValueChangedToWarehouse.bind(this);

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
    // this.mainForm.instance.getEditor('moveType').option('value', 'INNER');
    this.mainForm.instance.getEditor('sts').option('value', '500');

    const rangeDate = this.utilService.getDateRange();

    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;
    this.fromRcvSchDate.value = rangeDate.fromDate;
    this.toRcvSchDate.value = rangeDate.toDate;

    this.mainForm.instance.focus();
  }

  initCode(): void {
    // 창고
    this.codeService.getSalesWarehouse(this.currentCompany).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      // this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
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

    // // 품목관리사
    // this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
    //   this.dsItemAdmin = result.data;
    // });

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
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    await this.mainGrid.instance.deselectAll();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromCompanyId = this.currentCompany;
      this.mainFormData.toCompanyId = this.currentCompany;

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

  async onExcute(): Promise<void> {
    // const selectList = await this.mainGrid.instance.getSelectedRowsData();
    const gridList = this.popupGrid.instance.getDataSource().items();

    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('phyinstruct_button_instruct'));

    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      const saveContent = this.popupData as LogicalWhMoveConfVO;

      saveContent.tenant = this.G_TENANT;
      saveContent.companyId = 1;
      saveContent.moveKey = this.popupForm.instance.getEditor('moveKey').option('value');
      saveContent.fromLogicalWhId = this.popupForm.instance.getEditor('fromLogicalWhId').option('value');
      saveContent.toLogicalWhId = this.popupForm.instance.getEditor('toLogicalWhId').option('value');

      saveContent.ownerId = this.utilService.getCommonOwnerId();
      saveContent.moveType = 'INNER';
      saveContent.logicalWhMoveConfDetailList = gridList;
      saveContent.owner = this.owner;

      console.log(saveContent);

      const result = await this.service.execute(saveContent);

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

  popupShown(e): void {
    this.popupGrid.instance.deselectAll();

    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

    this.changeDisabled(this.popupData.sts);
  }

  changeDisabled(sts): void {

    const confirmedBtn = this.popup.toolbarItems[0];
    confirmedBtn.options = {
      text: this.utilService.convert1('logicalwhmoveoutconf_msg_confirmed', '승인'),
      type: 'normal',
      onClick: this.onExcute.bind(this)
    };

    if (sts === '500') {
      confirmedBtn.visible = true;
    } else {
      confirmedBtn.visible = false;

    }

    this.popupGrid.focusedRowKey = null;
    this.popupGrid.paging.pageIndex = 0;
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
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

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        console.log(this.dsItemId);
        console.log(result.data);

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.logicalWhMoveConfDetailList,
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

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
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

  onValueChangedToWarehouse(e): void {
    if (!e.value) {
      this.mainForm.formData.toWarehouseId = e.value;
      this.mainForm.formData.toLogisticsId = e.value;
      this.dsToLoc = [];
    } else {
      const data = this.dsWarehouse.filter(el => el.uid === e.value);

      this.mainForm.formData.toWarehouseId = e.value;
      this.mainForm.formData.toLogisticsId = data[0].logisticsId;
      this.mainForm.formData.toLatitude = data[0].latitude;
      this.mainForm.formData.toLongitude = data[0].longitude;

      this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
        this.dsToLoc = result.data;
      });
    }
  }

}
