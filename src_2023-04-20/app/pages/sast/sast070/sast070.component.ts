import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sast070Service, Sast070VO} from './sast070.service';

@Component({
  selector: 'app-sast070',
  templateUrl: './sast070.component.html',
  styleUrls: ['./sast070.component.scss']
})
export class Sast070Component implements OnInit, AfterViewInit {

  constructor(
    public gridUtil: GridUtilService,
    public utilService: CommonUtilService,
    public bizService: BizCodeService,
    private service: Sast070Service,
    private codeService: CommonCodeService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();

    this.onPopupSave = this.onPopupSave.bind(this);
    this.onPopupClose = this.onPopupClose.bind(this);
    this.onPopupDelete = this.onPopupDelete.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.onWhCdChanged = this.onWhCdChanged.bind(this);
    this.isAllowEditing = this.isAllowEditing.bind(this);
    this.onTargetCompany = this.onTargetCompany.bind(this);
    this.onPtrnCdChanged = this.onPtrnCdChanged.bind(this);
    this.setStyle = this.setStyle.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('closeBtn', {static: false}) closeBtn: DxButtonComponent;

  @ViewChild('fromAdjustDate', {static: false}) fromAdjustDate: DxDateBoxComponent;
  @ViewChild('toAdjustDate', {static: false}) toAdjustDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // DataSet
  dsCaY = [];
  dsCaM = [];
  dsPtrn = [];
  dsSaWh = [];
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
  dsPwhCd = [];
  dsFilteredPwhCd = [];
  dsDamageFlg = [];

  sessionUserId: any;

  // 추가
  dsSts = [];
  dsPtrnGb = [];
  dsOwner = [];

  // Global - Main
  mainFormData: Sast070VO = {} as Sast070VO;

  // Global - Main Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  // Global - Popup
  popupFormData: Sast070VO = {} as Sast070VO;
  popupMode = 'Add';
  popupData: Sast070VO = {} as Sast070VO;
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

  now = this.utilService.getFormatMonth(new Date());
  suspendValueChagned = false;

  // Grid State
  GRID_STATE_KEY = 'sast_sast070_1';
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

    // 전체거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsOwner = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsPwhCd = result.data;
    });

    // 조정사유
    this.codeService.getCode(this.G_TENANT, 'ADJUSTREASON').subscribe(result => {
      this.dsRfa = result.data;
    });

    // 사유
    // this.dsRfa = [{cd: '1', nm: '현재고 수량 조정'},
    //   // {cd: '2', nm: '현 평균단가 조정'},
    //   {cd: '3', nm: '현 평균단가, 수량조정'}
    //  ];

    this.dsQtyCal = [{cd: '1', nm: '증가'}, {cd: '2', nm: '감소'}, {cd: '3', nm: 'NONE'}];
    this.dsPrCal = [{cd: '1', nm: '증가'}, {cd: '2', nm: '감소'}, {cd: '3', nm: 'NONE'}];

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
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

    this.mainForm.instance.getEditor('sts').option('value', '100');
  }

  // Main Grid Search
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromAdjustDate = document.getElementsByName('fromAdjustDate').item(1).getAttribute('value');
      this.mainFormData.toAdjustDate = document.getElementsByName('toAdjustDate').item(1).getAttribute('value');
      // this.mainFormData.stoYm = document.getElementsByName('stoYm').item(1).getAttribute('value').replace(/-/gi, '');

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
    this.deleteBtn.visible = false;
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
      this.deleteBtn.visible = true;
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

    this.popupForm.instance.getEditor('slip_no').option('disabled', true);
    if (this.popupMode === 'Add') {
      this.popupData.sts = '100'; // 예정
      // this.popupForm.instance.getEditor('sts').option('value', '100');
      this.popupForm.instance.getEditor('mat_dt').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('mat_dt').option('disabled', false);
      // this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', false);
      this.popupForm.instance.getEditor('isif').option('value', 'N');
      this.popupForm.instance.getEditor('isif').option('disabled', false);
      this.popupForm.instance.getEditor('targetcompany').option('disabled', false);
      this.popupForm.instance.getEditor('remarks').option('disabled', false);

      this.popupData.ptrn_cd = this.utilService.getCompany();

      if (this.utilService.getCompany() === 'O1000') {
        this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);

      } else {
        this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
        // 영업창고 조회
        // this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupData.ptrn_cd);
      }
    }

    if (this.popupMode === 'Edit') {
      this.deleteBtn.visible = this.popupData.sts === '100';
      this.popupForm.instance.getEditor('mat_dt').option('disabled', true);
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', true);

      if (this.popupData.sts === '100') {
        this.popupForm.instance.getEditor('targetcompany').option('disabled', false);
        this.popupForm.instance.getEditor('isif').option('disabled', false);
        this.popupForm.instance.getEditor('remarks').option('disabled', false);
        // this.popupForm.instance.getEditor('owner').option('disabled', false);

      } else {
        this.popupForm.instance.getEditor('targetcompany').option('disabled', true);
        this.popupForm.instance.getEditor('isif').option('disabled', true);
        this.popupForm.instance.getEditor('remarks').option('disabled', true);
        // this.popupForm.instance.getEditor('owner').option('disabled', true);

      }

    }
    this.saveBtn.visible = this.popupData.sts === '100';

    this.popupGrid.instance.repaint();  // Scroll Delete Refresh
  }

  isAllowEditing(): boolean {
    return this.popupData.sts === '100';
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

  // 저장버튼 이벤트
  async onPopupSave(e): Promise<void> {

    const popData = this.popupForm.instance.validate();
    const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

    if (popData.isValid) {
      try {

        let result;
        const saveContent = this.popupData as Sast070VO;

        const indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid, 'item_cd');
        if (indexWhenDup > -1) {
          let msg = '품목이 중복됩니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Duplicate item(s).';
          }
          this.utilService.notify_error(msg);
          return;
        }

        for (const items of detailList) {
          if ((items.operType === 'insert') && !items.item_cd) {
            const errorMsg = this.utilService.convert1('gridvalidationerror_itemId', '품목을 선택해주세요.');
            this.utilService.notify_error(errorMsg);
            return;
          }

          if (!items.rfa) {
            const errorMsg = this.utilService.convert1('gridvalidationerror_rfa', '조정사유를 입력해주세요.');
            this.utilService.notify_error(errorMsg);
            return;
          }

          if (items.curt_qty === 0) {
            const errorMsg = this.utilService.convert1('gridvalidationerror_curt_qty', '재고수량을 입력해주세요.');
            this.utilService.notify_error(errorMsg);
            return;
          }
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }
        saveContent['createdby'] = this.sessionUserId;
        saveContent['modifiedby'] = this.sessionUserId;

        saveContent.itemList = detailList;

        console.log(saveContent);

        if (this.popupMode === 'Add') {
          console.log('Add!');
          result = await this.service.save(JSON.stringify(saveContent));
          if (!result.success) {
            this.utilService.notify_error(result.msg);
            return;
          } else {
            this.utilService.notify_success('Save success');
            this.popupForm.instance.resetValues();
            this.popupVisible = false;
            this.onSearch();
          }
        } else if (this.popupMode === 'Edit') {
          console.log('Edit!');
          result = await this.service.update(JSON.stringify(saveContent));
          if (!result.success) {
            this.utilService.notify_error(result.msg);
            return;
          } else {
            this.utilService.notify_success('Save success');
            this.popupForm.instance.resetValues();
            this.popupVisible = false;
            this.onSearch();
          }
        }

      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // Popup Delete Event
  async onPopupDelete(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupData as Sast070VO;
      const result = await this.service.delete(deleteContent);
      console.log(result);
      if (result.success) {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error');
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
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

  // 그리드 추가
  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  // 그리드 삭제
  async deleteClick(): Promise<void> {
    const len = this.popupGrid.instance.getVisibleRows().length;
    if (len > 0) {
      let focusedIdx: number = this.popupGrid.focusedRowIndex;
      if (focusedIdx < 0) {
        focusedIdx = this.popupGrid.instance.getVisibleRows().length - 1;
        this.popupGrid.focusedRowIndex = focusedIdx;
      }
      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);
      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  // onSelectionChangedPtrnCd(e): void {
  //   // console.log("============onSelectionChangedPtrnCd===============");
  //   if (this.suspendValueChagned) {
  //     this.suspendValueChagned = false;
  //     return;
  //   }
  //   if (!e) return;
  //   if (!e.event) return;
  //
  //   // this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === (e ? e.value : this.popupFormData.ptrn_cd));
  //
  //   // 파트너사 국가 - 파트너사명
  //   if (e) {
  //     if (e.value) {
  //       this.service.sales_wh_list(this.G_TENANT, 'Y', e.value).subscribe(result => {
  //         this.dsSaWh = result.data;
  //
  //         console.log(this.dsSaWh);
  //       });
  //     }
  //   }
  // }

  onInitNewRow(e): void {
    e.data.unit_price = 0;
    e.data.curt_qty = 0;

    e.data.damageflg = 'N';
  }

  // allowEditing(e) {
  // }

  // Item Option Setting
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    const result = await this.service.getItem(this.G_TENANT, value, this.popupForm.instance.getEditor('mat_dt').option('value'));

    console.log(result);
    rowData.item_cd = result[0].item_cd;
    rowData.item_nm = result[0].item_nm;
    rowData.spec_nm = result[0].spec_nm;
    rowData.sto_unit = result[0].sto_unit;
    rowData.avgprice = result[0].avgprice;
    rowData.amt = result[0].amt;
  }

  // 주문금액 표현식
  cal_qty_value(rowData): void {
    return rowData.sto_qty + rowData.aui_qty;
  }

  // VAT 표현식
  cal_pr_value(rowData): void {
    return rowData.avg_pr + rowData.aui_pr;
  }

  // row별 Edit 제어
  onEditorPreparing(e, grid): void {
    /*if (e.dataField === 'item_cd' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.item_cd ? true : false;
    }
    if (e.dataField === 'item_nm' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.item_cd ? true : false;
    }
    if (e.dataField === 'spec_nm' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.item_cd ? true : false;
    }
    if (e.dataField === 'base_unit' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.item_cd ? true : false;
    }
    if (e.dataField === 'avg_pr' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.avg_pr ? true : false;
    }
    if (e.dataField === 'sto_qty' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.sto_qty ? true : false;
    }*/
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }

  onValueChangedCompanyId(e): void {
    // console.log(this.deptFlg);
    // if (this.deptFlg) {
    //   // @ts-ignore
    //   this.treeBoxValue = '';
    // }
    // const selectedCompany = this.dsOwnerId.filter(el => el.uid === e.value);

  }

  onPtrnCdChanged(e): void {
    if (e) {
      const selectedCompany = this.dsPtrnCd.filter(el => el.cust_cd === e.value);

      this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupData.ptrn_cd);

    }
  }

  onWhCdChanged(e): void {
    if (e) {
      const selectedPwhCd = this.dsPwhCd.filter(el => el.cd === e.value);

      if (selectedPwhCd[0]) {
        this.popupForm.formData.pwh_cd = selectedPwhCd[0].pwh_cd;
      } else {
        this.popupForm.formData.pwh_cd = null;

      }
    }
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
}
