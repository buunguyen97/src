import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sabu030Service, Sabu030VO} from './sabu030.service';

@Component({
  selector: 'app-sabu030',
  templateUrl: './sabu030.component.html',
  styleUrls: ['./sabu030.component.scss']
})
export class Sabu030Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu030Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupOrdCancelClick = this.popupOrdCancelClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.isExptOk = this.isExptOk.bind(this);
    this.setOrdQty = this.setOrdQty.bind(this);
    this.setOrdPr = this.setOrdPr.bind(this);
    this.onValueChangedPurCd = this.onValueChangedPurCd.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  dsCustCd = []; // 거래처
  dsMonyUnit = []; // 화폐
  filteredWhCd = [];
  dsCopyWhCd = [];
  dsWrkStat = []; // 작업상태
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsWhCd = []; // 창고
  dsCustCdAll = []; // 전체거래처
  dsPtrnCd = [];

  dsOrdStopReson = []; // 작업상태

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sabu030VO = {} as Sabu030VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = '';
  popupFormData: Sabu030VO;

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  changes = [];
  key = 'ord_no';

  searchList = [];

  // Grid State
  GRID_STATE_KEY = 'sabu_sabu030_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 결재상태
    this.dsWrkStat = [{cd: "4", nm: this.utilService.convert1('sales.final_sign', '최종결재', 'Final Sign')}];

    // 취소사유(임시)
    this.codeService.getCode(this.G_TENANT, 'ORDSTOPRESON').subscribe(result => {
      this.dsOrdStopReson = result.data;
    });

    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 전체 품목
    // this.bizService.getItem(this.G_TENANT, '', '', '2', '', '').subscribe(result => {
    //   this.dsItemCd = result.data;
    // });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(
      result => {
        this.dsItemCd = result.data;
        // this.dsFullitemCd = result.data;
      });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', '', '', '', 'Y', '').subscribe(result => {
      this.dsCustCdAll = result.data;
    });

    // 창고
    // this.bizService.getWh(this.G_TENANT).subscribe(result => {
    //   this.dsWhCd = result.data;
    // });

    // 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });

    // 매입처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });
  }

  // 그리드 후 처리 함수
  ngAfterViewInit(): void {
    // 팝업 그리드 초기화
    this.entityStoreItemGrid = new ArrayStore(
      {
        data: [], key: this.key
      }
    );

    this.dsItemGrid = new DataSource({
      store: this.entityStoreItemGrid
    });

    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('ptrn_cd').option('value', this.utilService.getCompany());
    this.mainFormData.ptrn_cd = this.utilService.getCompany();
  }

  /**
   *  초기화 메소드 END
   */

  /**
   *  조회 메소드 START
   */
  // 메인 그리드 조회
  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.mainList(this.mainFormData);
      this.searchList = result.data;

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStoreMainGrid = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.dsMainGrid = new DataSource({
          store: this.entityStoreMainGrid
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {

    if (this.popupFormData.ord_no) {
      // Service의 get 함수 생성
      const result = await this.service.detailList(this.popupFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.consItemList,
            key: 'ord_seq'
          }
        );
        this.dsItemGrid = new DataSource({
          store: this.entityStoreItemGrid
        });
        this.popupGrid.focusedRowKey = null;
      }
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        let today: string = this.gridUtil.getToday().replace(/-/gi, '');
        let consDt: string = this.popupForm.instance.getEditor('cons_dt').option('value').replace(/-/gi, '');
        let ordDt: string = this.popupForm.instance.getEditor('ord_dt').option('value').replace(/-/gi, '');

        // 취소 사유 선택 msg
        if (this.popupForm.instance.getEditor('ord_stop_reson').option('value') !== ('' || null)) {
          var msg = '취소사유 선택 시 저장이 불가합니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'If a reason for cancellation is selected, it cannot be saved.';
          }
          this.utilService.notify_error(msg);
          return;
        }

        // if (ordDt < today) {
        //   var msg = "발주일자는 당일 포함 이후만 가능합니다.";
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = "The order date is only available after including the same day.";
        //   }
        //   this.utilService.notify_error(msg);
        //   this.popupForm.instance.getEditor('ord_dt').focus();
        //   return;
        // }
        // if (ordDt < consDt) {
        //   var msg = "발주일자는 품의일자 포함 이후만 가능합니다.";
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = "The order date is only available after the date of purchase is included.";
        //   }
        //   this.utilService.notify_error(msg);
        //   this.popupForm.instance.getEditor('cons_dt').focus();
        //   return;
        // }

        const saveContent = this.popupFormData as Sabu030VO;
        let detailList;

        if (this.changes.length > 0) {
          detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
        } else {
          detailList = this.popupGrid.instance.getDataSource().items();
        }

        let ordChk = 'N';

        for (const items of detailList) {
          if (items.ord_qty > 0) {
            if (items.ord_pr <= 0) {
              var msg = '발주단가를 입력하세요.';
              if (this.utilService.getLanguage() !== 'ko') {
                msg = 'Enter the ordering unit price.';
              }
              this.utilService.notify_error(msg);
              return;
            }
            if (items.ord_qty > 0) {
              ordChk = 'Y';
            }
            if (items.ord_qty < items.min_ord_qty) {
              var msg = '최소발주수량 이상 입력하세요.';
              if (this.utilService.getLanguage() !== 'ko') {
                msg = 'Please enter more than the minimum order quantity.';
              }
              this.utilService.notify_error(msg);
              return;
            }
          }
        }

        if (ordChk === 'N') {
          var msg = '발주수량을 1개 이상 입력하세요.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Please enter 1 or more order quantity.';
          }
          this.utilService.notify_error(msg);
          return;
        }

        // 발주 확정 msg
        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.order_confirm', '발주확정', 'Confirm'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        saveContent.consItemList = detailList;
        saveContent["modifiedby"] = this.sessionUserId;

        /*        if(this.popupForm.instance.getEditor('ord_qty').option('value') == (undefined)) {
                saveContent["ord_qty"] = null;
                saveContent["ord_pr"] = this.popupForm.instance.getEditor('cons_pr').option('value');
                saveContent["ord_amt"] = null;
                saveContent["ord_vat_amt"] = null;
                }*/

        console.log(saveContent);

        result = await this.service.mainSave(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 발주 취소 클릭 이벤트
  async popupOrdCancelClick(e): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        // 취소 사유 선택 msg
        if (this.popupForm.instance.getEditor('ord_stop_reson').option('value') == ('' || null)) {
          var msg = "취소사유를 선택해 주세요.";
          if (this.utilService.getLanguage() != 'ko') {
            msg = "Please select a reason for cancellation.";
          }
          this.utilService.notify_error(msg);
          return;
        }

        // 발주 취소 msg
        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.order_cancel', '발주취소', 'Order Cancel'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        const saveContent = this.popupFormData as Sabu030VO;
        saveContent["modifiedby"] = this.sessionUserId;

        result = await this.service.ordCancelUpdate(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.showPopup('Edit', {...e.data});
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }

  // row별 Edit 제어
  onEditorPreparing(e, grid): void {
    if (e.dataField === "item_cd" && e.parentType === "dataRow") {
      e.editorOptions.disabled = e.row.data.ord_no ? true : false;
    }
  }

  // 검색영역 초기화 함수
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  /**
   *  이벤트 메소드 END
   */

  /**
   *  팝업 메소드 START
   */
  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화

    // 제품 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;

    this.popupVisible = true;

    console.log(this.popupFormData);

    this.onSearchPopup();
  }

  // 팝업 오픈시 이벤트
  popupShown(e): void {
    this.popupFormData.ptrn_cd = this.utilService.getCompany();

    if (this.popupMode === 'Edit') {
      this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);

      this.popupForm.instance.getEditor('ord_no').option('disabled', true);
      this.popupForm.instance.getEditor('cons_dt').option('disabled', true);
      this.popupForm.instance.getEditor('pur_cd').option('disabled', true);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
      this.popupForm.instance.getEditor('inp_sche_dt').option('disabled', true);
      this.popupForm.instance.getEditor('mony_unit').option('disabled', true);
      this.popupForm.instance.getEditor('std_rate').option('disabled', true);
      this.popupForm.instance.getEditor('cont_no').option('disabled', true);
      this.popupForm.instance.getEditor('dg_adr').option('disabled', true);
      this.popupForm.instance.getEditor('remark').option('disabled', true);
      // this.popupForm.instance.getEditor('ord_dt').option('disabled', true);

      const today: string = this.gridUtil.getToday().replace(/-/gi, '');
      //
      // if (this.popupForm.instance.getEditor('ord_dt').option('value') === ('' || null)) {
      this.popupForm.instance.getEditor('ord_dt').option('value', today);
      // }
    }
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // validation 체크
  isExptOk() {
    return true;
  }

  // 발주 수량
  setOrdQty(rowData: any, value: any, currentRowData: any): void {
    if (!this.isExptOk()) {
      rowData.ord_qty = 0;
      return;
    }
    rowData.ord_qty = (value < 0) ? 0 : value;

    rowData.ord_amt = currentRowData.cons_amt;
    rowData.ord_vat_amt = currentRowData.cons_vat_amt;

  }

  // 발주 단가
  setOrdPr(rowData: any, value: any, currentRowData: any): void {
    if (!this.isExptOk()) {
      rowData.ord_pr = 0;
      return;
    }
    rowData.ord_pr = (value < 0) ? 0 : value;

    rowData.ord_amt = value * currentRowData.ord_qty;

    if (currentRowData.std_pur_vat_rate) {
      rowData.ord_vat_amt = Math.floor((rowData.ord_amt * currentRowData.std_pur_vat_rate) / 10) * 10;
    }
  }

  // 발주 금액 표현식
  calcOrdAmt(rowData) {
    return rowData.ord_qty * rowData.ord_pr;
  }

  // 발주 VAT 표현식
  calcOrdVatAmt(rowData) {
    return Math.ceil(rowData.ord_qty * rowData.ord_pr * rowData.std_pur_vat_rate);
  }

  // grid edit 제어
  allowEditing(e) {
    return (this.popupFormData.wrk_stat === '4') ? true : false;
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
  }

  onValueChangedPurCd(e): void {
    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.mainForm.instance.getEditor('purCd').option('value'));

  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }
}
