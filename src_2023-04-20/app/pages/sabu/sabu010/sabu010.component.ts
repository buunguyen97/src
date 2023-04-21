import {Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sabu010Service, Sabu010VO} from './sabu010.service';

@Component({
  selector: 'app-sabu010',
  templateUrl: './sabu010.component.html',
  styleUrls: ['./sabu010.component.scss']
})
export class Sabu010Component implements OnInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu010Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.onSelectionChangedCustCd = this.onSelectionChangedCustCd.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.setConsQty = this.setConsQty.bind(this);
    this.setConsPr = this.setConsPr.bind(this);
    this.isExptOk = this.isExptOk.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  dsCustCd = []; // 거래처
  dsMonyUnit = []; // 화폐
  dsWrkStat = []; // 작업상태
  dsAllItemCd = []; // 품목
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsWhCd = []; // 창고
  dsCustCdAll = []; // 전체거래처

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sabu010VO = {} as Sabu010VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: Sabu010VO;
  firstPopupData = "";

  searchList = [];

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  key = 'ord_no';

  // Grid State
  GRID_STATE_KEY = 'sabu_sabu010_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 결재(작업)상태
    this.dsWrkStat = [
      {cd: "1", nm: this.utilService.convert1('sales.consult_reg', '품의등록', 'Consult Reg')},
      {cd: "2", nm: this.utilService.convert1('sales.1st_sign', '1차결재', '1st Sign')},
      {cd: "3", nm: this.utilService.convert1('sales.2nd_sign', '2차결재', '2nd Sign')},
      {cd: "4", nm: this.utilService.convert1('sales.final_sign', '최종결재', 'Final Sign')},
      {cd: "5", nm: this.utilService.convert1('sales.order', '발주', 'Order')},
      {cd: "8", nm: this.utilService.convert1('sales.order_cancel', '발주취소', 'Order Cancel')},
      {cd: "9", nm: this.utilService.convert1('sales.order_stop', '발주중지', 'Order Stop')}
    ];

    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 품목(원부자재)
    // this.bizService.getItem(this.G_TENANT,'','Y','2','','').subscribe(result => { this.dsAllItemCd = result.data; });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', '', '', '', 'Y', '').subscribe(result => {
      this.dsCustCdAll = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

  }

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

    //this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    //this.mainForm.instance.getEditor('fromOrdDate').option('value', this.gridUtil.getToday());
    //this.mainForm.instance.getEditor('toOrdDate').option('value', this.gridUtil.getToday());
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
      console.log("onSearchPopup");

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
        // this.popupGrid.paging.pageIndex = 0;
      }

      // 거래처 품목(원부자재)
      this.bizService.getCustItem(this.G_TENANT, this.popupFormData.pur_cd).subscribe(result => {
        this.dsItemCd = result.data;
      });
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {wrk_stat: "1", ...e.data});
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {

      // '품목 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item_cd', '품목', 'Item'));
      this.utilService.notify_error(msg);
      return;
    }

    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        let lastPopupData: string = JSON.stringify(this.popupFormData);
        let formModified: string = "N";

        //console.log(this.firstPopupData);
        //console.log(lastPopupData);

        if (this.firstPopupData != lastPopupData) {
          formModified = "Y";
          console.log('diff');
        } else {
          console.log('same');
        }

        let today: string = this.gridUtil.getToday().replace(/-/gi, "");
        let consDt: string = this.popupForm.instance.getEditor('cons_dt').option('value').replace(/-/gi, "");
        let inpScheDt: string = this.popupForm.instance.getEditor('inp_sche_dt').option('value').replace(/-/gi, "");

        console.log(consDt);
        /*if( this.popupMode === 'Add' && consDt < today ) {
          var msg = "품의일자는 당일 포함 이후만 가능합니다.";
          if( this.utilService.getLanguage()!='ko' ) {
              msg = "The item date is only available after the same day.";
          }
          this.utilService.notify_error(msg);
          this.popupForm.instance.getEditor('cons_dt').focus();
          return;
        }*/
        if (inpScheDt < consDt) {
          var msg = "입고예정일은 품의일자 포함 이후만 가능합니다.";
          if (this.utilService.getLanguage() != 'ko') {
            msg = "The expected delivery date is only available after the item date is included.";
          }
          this.utilService.notify_error(msg);
          this.popupForm.instance.getEditor('cons_dt').focus();
          return;
        }

        const temp = this.changes;
        for (const change of temp) {

          if (change.type !== 'insert') {
            continue;
          }
          const data = await this.popupGrid.instance.byKey(change.key);
          if (!data.cons_amt) {
            change.data.cons_amt = data.cons_qty * data.cons_pr;
          }

          if (!data.cons_vat_amt) {
            change.data.cons_vat_amt = change.data.cons_amt * 0.1;

          }
        }
        this.changes = temp;

        const saveContent = this.popupFormData as Sabu010VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
        console.log(detailList);

        for (const items of detailList) {
          if (items.operType != "remove") {
            if (items.item_cd == "") {
              var msg = "품목은 필수입니다.";
              if (this.utilService.getLanguage() != 'ko') {
                msg = "Item is mandatory.";
              }
              this.utilService.notify_error(msg);
              return;
            }
            if (items.cons_qty <= 0) {
              var msg = "품의수량을 1개 이상 입력하세요.";
              if (this.utilService.getLanguage() != 'ko') {
                msg = "Please enter the quantity of one or more products.";
              }
              this.utilService.notify_error(msg);
              return;
            }
            if (items.cons_pr <= 0) {
              var msg = "품의단가를 입력하세요.";
              if (this.utilService.getLanguage() != 'ko') {
                msg = "Enter the unit price of the product.";
              }
              this.utilService.notify_error(msg);
              return;
            }
            if (items.cons_qty < items.min_ord_qty) {
              var msg = "최소발주수량 이상 입력하세요.";
              if (this.utilService.getLanguage() != 'ko') {
                msg = "Please enter more than the minimum order quantity.";
              }
              this.utilService.notify_error(msg);
              return;
            }
          }
        }

        var indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid, "item_cd");
        if (indexWhenDup > -1) {
          var msg = "품목이 중복됩니다.";
          if (this.utilService.getLanguage() != 'ko') {
            msg = "Items are duplicates.";
          }
          this.utilService.notify_error(msg);
          return;
        }

        if (formModified == "N" && !this.popupGrid.instance.hasEditData()) {
          var msg = "변경항목이 없습니다.";
          if (this.utilService.getLanguage() != 'ko') {
            msg = "There are no changes.";
          }
          this.utilService.notify_error(msg);
          return;
        }

        saveContent.consItemList = detailList;

        saveContent["createdby"] = this.sessionUserId;
        saveContent["modifiedby"] = this.sessionUserId;
        saveContent["formModified"] = formModified;

        //console.log("==save saveContent >>>");  console.log(saveContent);
        //console.log("==save detailList >>>");  console.log(detailList);

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        result = await this.service.mainSave(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          //this.popupForm.instance.resetValues();
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
    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
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

  // 거래처 선택시 - 계약번호 변경
  suspendValueChagned = false;

  onSelectionChangedCustCd(e): void {
    console.log("====onSelectionChangedCustCd======");

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }
    if (!e) return;
    if (!e.event) return;

    if (this.popupGrid.instance.getVisibleRows().length > 0) {
      this.suspendValueChagned = true;
      this.popupForm.instance.getEditor('pur_cd').option('value', e.previousValue);
      var msg = "품목이 있는 경우 거래처를 변경할 수 없습니다.";
      if (this.utilService.getLanguage() != 'ko') {
        msg = "You cannot change the account if there is an item.";
      }
      this.utilService.notify_error(msg);
      return;
    }

    // 거래처 - 계약정보
    if (e) {
      if (e.value) {
        const inpScheDt = this.popupForm.instance.getEditor('inp_sche_dt').option('value');

        // this.bizService.getPurContNo(this.G_TENANT, e.value, inpScheDt).subscribe(result => {
        //   if (result.data) {
        //     this.popupFormData.mony_unit = result.data["mony_unit"];
        //     this.popupFormData.std_rate = result.data["std_rate"];
        //     this.popupFormData.cont_no = result.data["cont_no"];
        //   } else {
        //     this.popupFormData.std_rate = 1;
        //     this.popupFormData.cont_no = "";
        //   }
        // });

        // 거래처 품목(원부자재)
        this.bizService.getCustItem(this.G_TENANT, e.value).subscribe(result => {
          this.dsItemCd = result.data;
        });
      } else {
        this.popupFormData.std_rate = 1;
        this.popupFormData.cont_no = "";
      }
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
  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.firstPopupData = JSON.stringify(this.popupFormData);
    this.popupMode = popupMode;

    // 팝업 버튼 보이기 정리
    if (this.popupMode === 'Add') {
      this.deleteBtn.visible = false; // 삭제버튼
      this.saveBtn.visible = true; // 저장버튼
    } else {
      if (this.popupFormData.wrk_stat == "1") {
        this.deleteBtn.visible = true;
        this.saveBtn.visible = true;
      } else {
        this.deleteBtn.visible = false;
        this.saveBtn.visible = false;
      }
    }

    this.popupVisible = true;

    if (this.popupMode === 'Add' && this.popupForm) {
      this.popupForm.instance.resetValues();
    }

    this.onSearchPopup();
  }

  popupShown(e): void {

    this.popupForm.instance.getEditor('cons_dt').option('disabled', false);
    this.popupForm.instance.getEditor('pur_cd').option('disabled', false);
    this.popupForm.instance.getEditor('wh_cd').option('disabled', false);
    this.popupForm.instance.getEditor('inp_sche_dt').option('disabled', false);
    this.popupForm.instance.getEditor('mony_unit').option('disabled', false);
    this.popupForm.instance.getEditor('std_rate').option('disabled', false);
    this.popupForm.instance.getEditor('cont_no').option('disabled', false);
    this.popupForm.instance.getEditor('remark').option('disabled', false);

    if (this.popupMode === 'Add') { // 신규
      this.popupForm.instance.getEditor('cons_dt').option('value', this.gridUtil.getToday());

      // 초기 focus
      this.popupForm.instance.getEditor('cons_dt').focus();
    } else if (this.popupMode === 'Edit') { // 수정
      this.popupForm.instance.getEditor('cons_dt').option('disabled', true);
      this.popupForm.instance.getEditor('pur_cd').option('disabled', true);

      // 초기 focus

      if (this.popupFormData.wrk_stat != "1") {
        this.popupForm.instance.getEditor('cons_dt').option('disabled', true);
        this.popupForm.instance.getEditor('pur_cd').option('disabled', true);
        this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
        this.popupForm.instance.getEditor('inp_sche_dt').option('disabled', true);
        this.popupForm.instance.getEditor('mony_unit').option('disabled', true);
        this.popupForm.instance.getEditor('std_rate').option('disabled', true);
        this.popupForm.instance.getEditor('cont_no').option('disabled', true);
        this.popupForm.instance.getEditor('remark').option('disabled', true);
      }
    }
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // 품목변경시 단가세팅
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    rowData.item_cd = value;
    var result = await this.bizService.getPurPr(this.G_TENANT,
      this.popupFormData.pur_cd,
      value
    );
    rowData.cons_pr = result["pur_pr"];
    rowData.std_pur_vat_rate = result["std_pur_vat_rate"];
    rowData.min_ord_qty = result["min_ord_qty"];
  }

  setConsQty(rowData: any, value: any): void {
    if (!this.isExptOk()) {
      rowData.cons_qty = 0;
      return;
    }
    rowData.cons_qty = (value < 0) ? 0 : value;
  }

  setConsPr(rowData: any, value: any): void {
    if (!this.isExptOk()) {
      rowData.cons_pr = 0;
      return;
    }
    rowData.cons_pr = (value < 0) ? 0 : value;
  }

  isExptOk() {
    if (!this.popupFormData.cons_dt) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cons_dt', '품의일자', 'Consult Date'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('cons_dt').focus();
      return false;
    }
    if (!this.popupFormData.pur_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cust_cd', '거래처', 'Account'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('pur_cd').focus();
      return false;
    }
    if (!this.popupFormData.cont_no) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cont_no', '계약번호', 'Contract No'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('cont_no').focus();
      return false;
    }
    return true;
  }

  // 품의금액 표현식
  calcConsAmt(rowData) {
    return rowData.cons_qty * rowData.cons_pr;
  }

  // VAT 표현식
  calcConsVatAmt(rowData) {
    return Math.ceil(rowData.cons_qty * rowData.cons_pr * rowData.std_pur_vat_rate);
  }

  // grid edit 제어
  allowEditing(e) {
    return (this.popupFormData.wrk_stat == "1") ? true : false;
  }


  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    // this.popupForm.instance.resetValues();
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormData as Sabu010VO;
      console.log(deleteContent);
      const result = await this.service.mainDelete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        //this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 추가버튼 이벤트
  addClick(): void {
    if (!this.isExptOk()) {
      return;
    }
    if (this.popupFormData.wrk_stat != "1") {  // 작업상태가 품의등록일때만 행추가 가능.
      return;
    }
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.popupGrid.focusedRowIndex = rowIdx;
    });
  }

  onInitNewRow(e): void {
    e.data.item_cd = "";
    e.data.cons_qty = 0;
    e.data.cons_pr = 0;
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupFormData.wrk_stat == "1") {  // 작업상태가 품의등록일때만 행삭제 가능.
      const len = this.popupGrid.instance.getVisibleRows().length;
      if (len > 0) {
        let focusedIdx: number = this.popupGrid.focusedRowIndex;
        if (focusedIdx < 0) {
          focusedIdx = this.popupGrid.instance.getVisibleRows().length - 1;
          this.popupGrid.focusedRowIndex = focusedIdx;
        }

        this.popupGrid.instance.deleteRow(focusedIdx);
        this.entityStoreItemGrid.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

        // 삭제된 로우 위로 포커스
        this.popupGrid.focusedRowIndex = focusedIdx - 1;
      }
    }
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  /**
   *  팝업 메소드 END
   */

}
