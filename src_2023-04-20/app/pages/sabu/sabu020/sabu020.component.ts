import {Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sabu020Service, Sabu020VO} from './sabu020.service';

@Component({
  selector: 'app-sabu020',
  templateUrl: './sabu020.component.html',
  styleUrls: ['./sabu020.component.scss']
})
export class Sabu020Component implements OnInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu020Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = Number(this.utilService.getUserUid());
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.isExptOk = this.isExptOk.bind(this);
    this.setConsQty = this.setConsQty.bind(this);
    this.setConsPr = this.setConsPr.bind(this);
    this.onExcute = this.onExcute.bind(this);
    this.onReject = this.onReject.bind(this);
    this.onValueChangedPurCd = this.onValueChangedPurCd.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  dsCustCd = []; // 거래처
  filteredWhCd = [];
  dsPtrnCd = [];
  dsCopyWhCd = [];
  dsMonyUnit = []; // 화폐
  dsWrkStat = []; // 작업상태
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsWhCd = []; // 창고
  dsWrkYN = []; // 결재여부

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sabu020VO = {} as Sabu020VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = '';
  popupFormData: Sabu020VO;

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  changes = [];
  key = 'ord_no';

  searchList = [];

  // Grid State
  GRID_STATE_KEY = 'sabu_sabu020_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 결재상태
    this.dsWrkStat = [{cd: "1", nm: this.utilService.convert1('sales.consult_reg', '품의등록', 'Consult Reg')},
      {cd: "2", nm: this.utilService.convert1('sales.1st_sign', '1차결재', '1st Sign')},
      {cd: "3", nm: this.utilService.convert1('sales.2nd_sign', '2차결재', '2nd Sign')}
    ];

    // 결재 여부
    this.dsWrkYN = [{cd: "1", nm: this.utilService.convert1('sales.sign', '결재', 'Sign')},
      {cd: "2", nm: this.utilService.convert1('sales.not_sign', '미결재', 'Not Sign')}
    ];

    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 전체 품목
    // this.bizService.getItem(this.G_TENANT,'','','2','','').subscribe(result => { this.dsItemCd = result.data; });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(
      result => {
        this.dsItemCd = result.data;
        // this.dsFullitemCd = result.data;
      });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
      this.dsUser.unshift({uid: -1, display: '-'});
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

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
      this.mainFormData.fromOrdDate = document.getElementsByName('fromOrdDate').item(1).getAttribute('value');
      this.mainFormData.toOrdDate = document.getElementsByName('toOrdDate').item(1).getAttribute('value');

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

      console.log(result.data);

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

        const saveContent = this.popupFormData as Sabu020VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

        for (const items of detailList) {
          if (items.cons_qty <= 0) {
            var msg = '품의수량을 1개 이상 입력하세요.';
            if (this.utilService.getLanguage() !== 'ko') {
              msg = 'Please enter the quantity of one or more products.';
            }
            this.utilService.notify_error(msg);
            return;
          }
          if (items.cons_pr <= 0) {
            var msg = '품의단가를 입력하세요.';
            if (this.utilService.getLanguage() !== 'ko') {
              msg = 'Enter the unit price of the product.';
            }
            this.utilService.notify_error(msg);
            return;
          }
          if (items.cons_qty < items.min_ord_qty) {
            var msg = '최소발주수량 이상 입력하세요.';
            if (this.utilService.getLanguage() !== 'ko') {
              msg = 'Please enter more than the minimum order quantity.';
            }
            this.utilService.notify_error(msg);
            return;
          }
        }

        saveContent.consItemList = detailList;

        saveContent["createdby"] = this.sessionUserId;
        saveContent["modifiedby"] = this.sessionUserId;

        // 1차결재 유효성 검사
        if (this.popupFormData.wrk_stat === "1") {
          if (this.popupFormData.first_wrk === "2" && detailList.length <= 0) {
            var msg = "변경항목이 없습니다.";
            if (this.utilService.getLanguage() !== 'ko') {
              msg = "There are no changes.";
            }
            this.utilService.notify_error(msg);
            return;
          }
          saveContent["approval1"] = this.sessionUserId;
          if (this.popupFormData.first_wrk === "1") {
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.1st_sign', '1차결재', '1st Sign'));
            if (!await this.utilService.confirm(confirmMsg)) {
              return;
            }
          } else if (this.popupFormData.first_wrk === "2") {
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
            if (!await this.utilService.confirm(confirmMsg)) {
              return;
            }
          } else {
            var msg = "결재 여부를 선택해주세요.";
            if (this.utilService.getLanguage() != 'ko') {
              msg = "Please select whether to pay.";
            }
            this.utilService.notify_error(msg);
            return;
          }
        }

        // 2차결재 유효성 검사
        if (this.popupFormData.wrk_stat === "2") {
          if (this.popupFormData.second_wrk === "2" && detailList.length <= 0) {
            var msg = "변경항목이 없습니다.";
            if (this.utilService.getLanguage() != 'ko') {
              msg = "There are no changes.";
            }
            this.utilService.notify_error(msg);
            return;
          }
          saveContent["approval2"] = this.sessionUserId;
          if (this.popupFormData.second_wrk === "1") {
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.2nd_sign', '2차결재', '2nd Sign'));
            if (!await this.utilService.confirm(confirmMsg)) {
              return;
            }
          } else if (this.popupFormData.second_wrk === "2") {
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
            if (!await this.utilService.confirm(confirmMsg)) {
              return;
            }
          } else {
            var msg = "결재 여부를 선택해주세요.";
            if (this.utilService.getLanguage() != 'ko') {
              msg = "Please select whether to pay.";
            }
            this.utilService.notify_error(msg);
            return;
          }
        }

        // 최종결재 유효성 검사
        if (this.popupFormData.wrk_stat === "3") {
          if (this.popupFormData.final_wrk === "2" && detailList.length <= 0) {
            var msg = "변경항목이 없습니다.";
            if (this.utilService.getLanguage() != 'ko') {
              msg = "There are no changes.";
            }
            this.utilService.notify_error(msg);
            return;
          }
          saveContent["approval3"] = this.sessionUserId;
          if (this.popupFormData.final_wrk === "1") {
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.final_sign', '2최종결재', 'Final Sign'));
            if (!await this.utilService.confirm(confirmMsg)) {
              return;
            }
          } else if (this.popupFormData.final_wrk === "2") {
            const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
            if (!await this.utilService.confirm(confirmMsg)) {
              return;
            }
          } else {
            var msg = "결재 여부를 선택해주세요.";
            if (this.utilService.getLanguage() != 'ko') {
              msg = "Please select whether to pay.";
            }
            this.utilService.notify_error(msg);
            return;
          }
        }

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

    this.onSearchPopup();
  }

  // 팝업 오픈시 이벤트
  popupShown(e): void {
    this.popupFormData.ptrn_cd = this.utilService.getCompany();

    if (this.popupMode === 'Edit') {
      this.popupForm.instance.getEditor('ord_no').option('disabled', true);
      this.popupForm.instance.getEditor('cons_dt').option('disabled', true);
      this.popupForm.instance.getEditor('pur_cd').option('disabled', true);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
      this.popupForm.instance.getEditor('inp_sche_dt').option('disabled', true);
      this.popupForm.instance.getEditor('mony_unit').option('disabled', true);
      this.popupForm.instance.getEditor('std_rate').option('disabled', true);
      this.popupForm.instance.getEditor('cont_no').option('disabled', true);
      this.popupForm.instance.getEditor('remark').option('disabled', true);
      this.popupForm.instance.getEditor('first_wrk').option('disabled', true);
      this.popupForm.instance.getEditor('second_wrk').option('disabled', true);
      this.popupForm.instance.getEditor('final_wrk').option('disabled', true);

      this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);

      // this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.popupFormData.pur_cd);

      // 미결재 상태
      // this.popupForm.instance.getEditor('first_wrk').option('value', '2');
      // this.popupForm.instance.getEditor('second_wrk').option('value', '2');
      // this.popupForm.instance.getEditor('final_wrk').option('value', '2');

      // if (this.popupFormData.wrk_stat === "1") {
      //   // this.popupForm.instance.getEditor('first_wrk').option('disabled', false);
      // } else if (this.popupFormData.wrk_stat === "2") {
      //   // this.popupForm.instance.getEditor('second_wrk').option('disabled', false);
      //   this.popupForm.instance.getEditor('first_wrk').option('value', '1');
      // } else if (this.popupFormData.wrk_stat === "3") {
      //   // this.popupForm.instance.getEditor('final_wrk').option('disabled', false);
      //   this.popupForm.instance.getEditor('first_wrk').option('value', '1');
      //   this.popupForm.instance.getEditor('second_wrk').option('value', '1');
      // }
    }
    // this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    // this.utilService.getPopupGridHeight(this.popupGrid, this.popup);

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // validation 체크
  isExptOk(): any {
    return true;
  }

  // 수량
  setConsQty(rowData: any, value: any, currentRowData: any): void {
    if (!this.isExptOk()) {
      rowData.cons_qty = 0;
      return;
    }
    rowData.cons_qty = (value < 0) ? 0 : value;

    if (currentRowData.cons_pr) {
      rowData.cons_amt = value * currentRowData.cons_pr;
    }

    if (currentRowData.std_pur_vat_rate) {
      rowData.cons_vat_amt = Math.floor((rowData.cons_amt * (currentRowData.std_pur_vat_rate / 100)) / 10) * 10;
    }

  }

  // 단가
  setConsPr(newData: any, value: any, currentRowData: any): void {
    if (!this.isExptOk()) {
      newData.cons_pr = 0;
      return;
    }
    newData.cons_pr = (value < 0) ? 0 : value;

    newData.cons_amt = value * currentRowData.cons_qty;
    if (currentRowData.std_pur_vat_rate) {
      newData.cons_vat_amt = Math.floor((newData.cons_amt * (currentRowData.std_pur_vat_rate / 100)) / 10) * 10;
    }
  }

  // 품의금액 표현식
  calcConsAmt(rowData) {
    return rowData.cons_qty * rowData.cons_pr;
  }

  // VAT 표현식
  calcConsVatAmt(newData, value, currentRowData): void {

    newData.std_pur_vat_rate = value;
    newData.cons_vat_amt = Math.floor((currentRowData.cons_amt * (value / 100)) / 10) * 10;
  }

  // grid edit 제어
  allowEditing(e) {
    return (this.popupFormData.wrk_stat === '1', '2', '3') ? true : false;
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
  }


  async onExcute(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        const saveContent = this.popupFormData as Sabu020VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

        for (const items of detailList) {

          if (items.cons_qty <= 0) {
            var msg = '품의수량을 1개 이상 입력하세요.';
            if (this.utilService.getLanguage() !== 'ko') {
              msg = 'Please enter the quantity of one or more products.';
            }
            this.utilService.notify_error(msg);
            return;
          }
          if (items.cons_pr <= 0) {
            var msg = '품의단가를 입력하세요.';
            if (this.utilService.getLanguage() !== 'ko') {
              msg = 'Enter the unit price of the product.';
            }
            this.utilService.notify_error(msg);
            return;
          }
          if (items.cons_qty < items.min_ord_qty) {
            var msg = '최소발주수량 이상 입력하세요.';
            if (this.utilService.getLanguage() !== 'ko') {
              msg = 'Please enter more than the minimum order quantity.';
            }
            this.utilService.notify_error(msg);
            return;
          }
        }

        saveContent.consItemList = detailList;

        saveContent["createdby"] = this.sessionUserId;
        saveContent["modifiedby"] = this.sessionUserId;

        // 1차결재 유효성 검사
        if (this.popupFormData.wrk_stat === '1') {
          saveContent["approval1"] = this.sessionUserId;
          saveContent.first_wrk = '1';

          const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.1st_sign', '1차결재', '1st Sign'));
          if (!await this.utilService.confirm(confirmMsg)) {
            return;
          }
        }

        // 2차결재 유효성 검사
        if (this.popupFormData.wrk_stat === '2') {
          saveContent["approval2"] = this.sessionUserId;
          saveContent.second_wrk = '1';

          const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.2nd_sign', '2차결재', '2nd Sign'));
          if (!await this.utilService.confirm(confirmMsg)) {
            return;
          }
        }

        // 최종결재 유효성 검사
        if (this.popupFormData.wrk_stat === '3') {
          saveContent["approval3"] = this.sessionUserId;
          saveContent.final_wrk = '1';

          const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('sales.final_sign', '2최종결재', 'Final Sign'));
          if (!await this.utilService.confirm(confirmMsg)) {
            return;
          }
        }

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

  async onReject(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        const saveContent = this.popupFormData as Sabu020VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

        saveContent.consItemList = detailList;

        saveContent["createdby"] = this.sessionUserId;
        saveContent["modifiedby"] = this.sessionUserId;

        // 1차결재 유효성 검사
        if (this.popupFormData.wrk_stat === '1') {
          saveContent["approval1"] = this.sessionUserId;
          saveContent.first_wrk = '1';
        } else if (this.popupFormData.wrk_stat === '2') {
          // 2차결재 유효성 검사
          saveContent["approval2"] = this.sessionUserId;
          saveContent.second_wrk = '1';
        } else if (this.popupFormData.wrk_stat === '3') {
          // 최종결재 유효성 검사
          saveContent["approval3"] = this.sessionUserId;
          saveContent.final_wrk = '1';
        }

        saveContent.isReject = 'Y';
        const confirmMsg = this.utilService.convert1('developing', '개발중입니다.');

        // if (!await this.utilService.confirm(confirmMsg)) {
        //   return;
        // }


        result = await this.service.mainSave(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Reject success');
          this.popupVisible = false;
          this.onSearch();
        }

      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
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
