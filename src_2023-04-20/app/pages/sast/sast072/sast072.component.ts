import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sast070Service, Sast070VO} from '../sast070/sast070.service';
import {Sast072Service} from './sast072.service';

@Component({
  selector: 'app-sast072',
  templateUrl: '../sast072/sast072.component.html',
  styleUrls: ['../sast072/sast072.component.scss']
})
export class Sast072Component implements OnInit, AfterViewInit {

  constructor(
    public gridUtil: GridUtilService,
    public utilService: CommonUtilService,
    public bizService: BizCodeService,
    private service: Sast072Service,
    private codeService: CommonCodeService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();

    this.onPopupClose = this.onPopupClose.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.isAllowEditing = this.isAllowEditing.bind(this);
    this.onTargetCompany = this.onTargetCompany.bind(this);
    this.adjustCancel = this.adjustCancel.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('fromAdjustDate', {static: false}) fromAdjustDate: DxDateBoxComponent;
  @ViewChild('toAdjustDate', {static: false}) toAdjustDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // DataSet
  dsCaY = [];
  dsCaM = [];
  dsPtrn = [];
  dsSaWh = [];
  dsPwhCd = [];
  dsRfa = [];
  dsQtyCal = [];
  dsPrCal = [];
  dsItemCd = [];
  dsCompany = [];
  dsOwnerId = [];
  dsFilteredDept = [];
  dsCopySaWh = [];
  treeBoxValue = [];
  dsPtrnCd = [];
  dsYN = [];
  dsUser = [];
  dsOwner = [];

  now = this.utilService.getFormatMonth(new Date());

  sessionUserId: any;

  // 추가
  dsSts = [];
  dsPtrnGb = [];
  dsDamageFlg = [];

  // Global - Main
  mainFormData: Sast070VO = {} as Sast070VO;

  // Global - Main Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  // Global - Popup
  popupFormData: Sast070VO;
  popupMode = 'Add';
  popupData: Sast070VO;
  popupVisible = false;
  editGrid = false;

  deptFlg = true;

  // Global - Popup Grid
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  key = ['slip_no', 'item_cd'];
  key2 = 'item_cd';

  // Grid State
  GRID_STATE_KEY = 'sast_sast072';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  ngOnInit(): void {

    // // 화주
    // this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
    //   this.dsCompany = result.data;
    // });

    // 전체파트너사
    this.bizService.getCust(this.G_TENANT, '', '', '', '', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;

    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsPwhCd = result.data;
    });

    // 전체거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsOwner = result.data;
    });

    // 조정사유
    this.codeService.getCode(this.G_TENANT, 'ADJUSTREASON').subscribe(result => {
      this.dsRfa = result.data;
    });

    this.dsQtyCal = [{cd: '1', nm: '증가'}, {cd: '2', nm: '감소'}, {cd: '3', nm: 'NONE'}];
    this.dsPrCal = [{cd: '1', nm: '증가'}, {cd: '2', nm: '감소'}, {cd: '3', nm: 'NONE'}];

  }

  initCode(): void {

    // 거래처 - 영업창고
    this.service.sales_wh_AllList(this.G_TENANT, 'Y').subscribe(result => {
      this.dsSaWh = result.data;
      this.dsCopySaWh = result.data;
    });

    this.bizService.getItem(this.G_TENANT, '', 'Y', '4', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 상태
    this.codeService.getCode(this.G_TENANT, 'INVADJUSTSTATUS').subscribe(result => {
      this.dsSts = result.data;
    });

    // 조정상태구분
    this.codeService.getCode(this.G_TENANT, 'TARGETCOMPANY').subscribe(result => {
      this.dsPtrnGb = result.data;
    });

    // i/f여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

  }

  ngAfterViewInit(): void {
    this.popupEntityStore = new ArrayStore({
      data: [], key: this.key2
    });

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.initForm();
    this.initCode();

    this.utilService.getGridHeight(this.mainGrid);
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromAdjustDate.value = rangeDate.fromDate;
    this.toAdjustDate.value = rangeDate.toDate;
    this.mainForm.instance.getEditor('companyId').option('value', this.utilService.getCompany());

    // this.mainForm.instance.getEditor('sts').option('value', '500'); // 확정

  }

  // Main Grid Search
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromAdjustDate = document.getElementsByName('fromAdjustDate').item(1).getAttribute('value');
      this.mainFormData.toAdjustDate = document.getElementsByName('toAdjustDate').item(1).getAttribute('value');

      const result = await this.service.list(this.mainFormData);
      console.log(result.data);
      if (!result.success) {

        // Search Failed
        this.utilService.notify_error(result.msg);
        return;

      } else {
        // Search Success
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('Search Success');

        this.mainEntityStore = new ArrayStore({
          data: result.data
          , key: this.key
        });

        this.mainDataSource = new DataSource({
          store: this.mainEntityStore
        });

        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);

      }
    }
  }

  // Search Reset
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  async onNew(e): Promise<void> {
    this.onPopup('Add', {...e.data});
  }

  // Popup Open
  onPopup(popupMode, data): void {
    this.changes = [];
    this.popupEntityStore = new ArrayStore({
      data: [],
      key: this.key2
    });

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    // 품목 그리드 초기화
    if (!!this.popupDataSource) {
      this.popupEntityStore.clear();
      this.popupDataSource.reload();
    }

    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    this.popupMode = popupMode;

    if (popupMode === 'Edit') {
      this.popupVisible = true;
      this.onPopupSearch();
    } else {
      this.popupVisible = true;
    }
  }

  // 팝업모드
  popupShown(e): void {
    const dom = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div:nth-child(3) > div > div:nth-child(3)');
    const styleStr = ' visibility: hidden;';
    if (this.popupForm.instance.getEditor('targetcompany').option('value') === '0') {
      this.setStyle(dom, styleStr);
    }

    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    const disabledFlg = this.popupMode === 'Edit';

    // 영업창고 조회
    // this.popupData.ptrn_cd = this.utilService.getCompany();
    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupData.ptrn_cd);

    this.popupForm.instance.getEditor('slip_no').option('disabled', true);

    if (this.popupMode === 'Edit') {
      this.popupForm.instance.getEditor('mat_dt').option('disabled', true);
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
      this.popupForm.instance.getEditor('targetcompany').option('disabled', true);
      this.popupForm.instance.getEditor('isif').option('disabled', true);
      this.popupForm.instance.getEditor('remarks').option('disabled', true);

    }
    this.popupGrid.instance.repaint();  // Scroll Delete Refresh
  }

  // Popup Close
  onPopupClose(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  // Popup Close After Validation
  onPopupAfterClose(): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  // Popup Search
  async onPopupSearch(): Promise<void> {
    const result = await this.service.info(this.popupData);
    // Service의 get 함수 생성
    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      this.popupGrid.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.popupEntityStore = new ArrayStore({
        data: result.data.itemList,
        key: 'item_cd'
      });
      this.popupDataSource = new DataSource({
        store: this.popupEntityStore
      });
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;
    }
  }

  isAllowEditing(): boolean {
    return this.popupData.sts === '100';
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.onPopup('Edit', {...e.data});
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChangedPopupGrid(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  // 포커스 로우
  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // Item Option Setting
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    const result = await this.service.getItem(this.G_TENANT, value, this.popupForm.instance.getEditor('mat_dt').option('value'));
    rowData.item_cd = result[0].item_cd;
    rowData.item_nm = result[0].item_nm;
    rowData.spec_nm = result[0].spec_nm;
    rowData.sto_unit = result[0].sto_unit;
    rowData.avgprice = result[0].avgprice;
    rowData.amt = result[0].amt;
  }


  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }

  onTargetCompany(e): void {
    if (!e) {
      this.dsOwner = [];
      return;
    }
    const dom = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div:nth-child(3) > div > div:nth-child(3)');

    const styleStr = ' visibility: hidden;';
    if (e.value === '2') {  // 수입사
      this.removeStyle(dom, styleStr);

      this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
        this.dsOwner = result.data;
      });

    } else {
      this.setStyle(dom, styleStr);

      this.popupForm.instance.getEditor('owner').option('value', 'O1000');
    }
  }

  setStyle(tag, styleStr): void {
    if (tag) {
      const str = tag.getAttribute('style');
      if (!str.includes(styleStr)) {
        tag.setAttribute('style', tag.getAttribute('style') + styleStr);
      }
    }

  }

  removeStyle(tag, styleStr): void {
    if (!tag) {
      return;
    }
    const s = tag.getAttribute('style');
    tag.setAttribute('style', s.replace(new RegExp(styleStr, 'g'), ''));
  }

  async adjustCancel(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert1('Execute_adjustCancel', '재고조정확정을 취소하시겠습니까?');
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const result = await this.service.adjustCancel(this.popupFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }
}
