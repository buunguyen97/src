import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sabu010VO} from './sabu010.service';
import _ from 'lodash';
import {Sabu011Service} from './sabu011.service';

@Component({
  selector: 'app-sabu011',
  templateUrl: './sabu011.component.html',
  styleUrls: ['./sabu011.component.scss']
})
export class Sabu011Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu011Service,
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
    this.onSelectionChangedPurCd = this.onSelectionChangedPurCd.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.setConsQty = this.setConsQty.bind(this);
    this.setConsPr = this.setConsPr.bind(this);
    this.isExptOk = this.isExptOk.bind(this);
    this.setVatRateValue = this.setVatRateValue.bind(this);
    this.validateNumber = this.validateNumber.bind(this);
    this.setConsAmt = this.setConsAmt.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.onSelectionChangedContNo = this.onSelectionChangedContNo.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  dsCustCd = []; // 매입처
  dsMonyUnit = []; // 화폐
  dsWrkStat = []; // 작업상태
  dsAllItemCd = []; // 품목
  dsItemCd = []; // 품목
  dsFullitemCd = [];
  dsUser = []; // 사용자
  filteredWhCd = [];
  dsWhCd = []; // 창고
  dsCustCdAll = []; // 전체거래처
  dsWrkYN = []; // 결재여부
  dsPtrnCd = [];
  dsFilteredCustCd = [];
  dsDamageFlg = [];
  dsContNo = [];
  dsSaWh = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  searchList = [];

  mainFormData: Sabu010VO = {} as Sabu010VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: Sabu010VO;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  key = 'ord_no';

  // Grid State
  GRID_STATE_KEY = 'sabu_sabu011';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');


  // 거래처 선택시 - 계약번호 변경
  suspendValueChagned = false;

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 결재(작업)상태
    this.dsWrkStat = [{cd: '1', nm: this.utilService.convert1('sales.consult_reg', '품의등록', 'Consult Reg')},
      {cd: '2', nm: this.utilService.convert1('sales.1st_sign', '1차결재', '1st Sign')},
      {cd: '3', nm: this.utilService.convert1('sales.2nd_sign', '2차결재', '2nd Sign')},
      {cd: '4', nm: this.utilService.convert1('sales.final_sign', '최종결재', 'Final Sign')},
      {cd: '5', nm: this.utilService.convert1('sales.order', '발주', 'Order')},
      {cd: '8', nm: this.utilService.convert1('sales.order_cancel', '발주취소', 'Order Cancel')},
      {cd: '9', nm: this.utilService.convert1('sales.order_stop', '발주중지', 'Order Stop')},
      {cd: '-1', nm: this.utilService.convert1('sales.order_reject', '반려', 'Reject')}
    ];

    // 매입처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
      // this.dsFilteredCustCd = result.data.filter(el => el.cd = this.utilService.getCompany());
      // console.log(this.dsFilteredCustCd);

    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 품목(원부자재)
    // this.bizService.getItem(this.G_TENANT,'','Y','2','','').subscribe(result => { this.dsAllItemCd = result.data; });

    // 사용자
    this.codeService.getUserByCompany(this.G_TENANT, Number(this.utilService.getCompanyId())).subscribe(result => {
      this.dsUser = result.data;
      this.dsUser.unshift({uid: -1, display: '-'});
    });

    // 매입처
    this.bizService.getCust(this.G_TENANT, '', '', '', '', 'Y', '').subscribe(result => {
      this.dsCustCdAll = result.data;
    });

    // 권한별 영업창고
    const data = {
      userId: this.utilService.getUserUid(),
      ptrn_cd: this.utilService.getCompany(),
    };
    this.bizService.getAuthWarehouseByUserId(data).then(r => {
      this.dsSaWh = r.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(
      result => {
        this.dsItemCd = result.data;
        this.dsFullitemCd = result.data;
      });

    // 결재 여부
    this.dsWrkYN = [{cd: '1', nm: this.utilService.convert1('sales.sign', '결재', 'Sign')},
      {cd: '2', nm: this.utilService.convert1('sales.not_sign', '미결재', 'Not Sign')}
    ];

    // 매입처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
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

    // this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('ptrn_cd').option('value', this.utilService.getCompany());
    this.mainFormData.ptrn_cd = this.utilService.getCompany();
    this.mainForm.instance.getEditor('wrkStat').option('value', '1');

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

        const keys = this.mainGrid.instance.getSelectedRowKeys();
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
        // this.popupGrid.paging.pageIndex = 0;
      }

      // 거래처 품목(원부자재) ?
      // this.bizService.getCustItem(this.G_TENANT, this.popupFormData.pur_cd).subscribe(result => {
      //   this.dsItemCd = result.data;
      // });
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
    this.showPopup('Add', {wrk_stat: '1', approval1: -1, approval2: -1, approval3: -1, ...e.data});
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

        const lastPopupData: string = JSON.stringify(this.popupFormData);
        let formModified = 'N';

        if (this.firstPopupData !== lastPopupData) {
          formModified = 'Y';
        }

        const today: string = this.gridUtil.getToday().replace(/-/gi, '');
        const consDt: string = this.popupForm.instance.getEditor('cons_dt').option('value').replace(/-/gi, '');
        const inpScheDt: string = this.popupForm.instance.getEditor('inp_sche_dt').option('value').replace(/-/gi, '');

        // console.log(consDt);
        // if (this.popupMode === 'Add' && consDt < today) {
        //   let msg = '품의일자는 당일 포함 이후만 가능합니다.';
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = 'The item date is only available after the same day.';
        //   }
        //   this.utilService.notify_error(msg);
        //   this.popupForm.instance.getEditor('cons_dt').focus();
        //   return;
        // }
        // if (inpScheDt < consDt) {
        //   let msg = '입고예정일은 품의일자 포함 이후만 가능합니다.';
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = 'The expected delivery date is only available after the item date is included.';
        //   }
        //   this.utilService.notify_error(msg);
        //   this.popupForm.instance.getEditor('cons_dt').focus();
        //   return;
        // }

        const saveContent = this.popupFormData as Sabu010VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
        console.log(detailList);

        for (const items of detailList) {
          if (items.operType !== 'remove') {
            if (items.item_cd === '') {
              let msg = '품목은 필수입니다.';
              if (this.utilService.getLanguage() !== 'ko') {
                msg = 'Item is mandatory.';
              }
              this.utilService.notify_error(msg);
              return;
            }
            if (items.cons_qty <= 0) {
              let msg = '품의수량을 1개 이상 입력하세요.';
              if (this.utilService.getLanguage() !== 'ko') {
                msg = 'Please enter the quantity of one or more products.';
              }
              this.utilService.notify_error(msg);
              return;
            }
            if (items.cons_pr <= 0) {
              let msg = '품의단가를 입력하세요.';
              if (this.utilService.getLanguage() !== 'ko') {
                msg = 'Enter the unit price of the product.';
              }
              this.utilService.notify_error(msg);
              return;
            }
            if (items.cons_qty < items.min_ord_qty) {
              let msg = '최소발주수량 이상 입력하세요.';
              if (this.utilService.getLanguage() !== 'ko') {
                msg = 'Please enter more than the minimum order quantity.';
              }
              this.utilService.notify_error(msg);
              return;
            }

            // if (this.popupFormData.mony_unit === 'KRW' && (items.cons_qty * items.cons_pr) % 1 !== 0) {
            //   let msg = '금액은 소숫점 단위일 수 없습니다.';
            //   if (this.utilService.getLanguage() !== 'ko') {
            //     msg = 'Amounts cannot be decimal units.';
            //   }
            //   this.utilService.notify_error(msg);
            //   return;
            // }
          }
        }

        const indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid, 'item_cd');
        if (indexWhenDup > -1) {
          let msg = '품목이 중복됩니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Items are duplicates.';
          }
          this.utilService.notify_error(msg);
          return;
        }

        if (formModified === 'N' && !this.popupGrid.instance.hasEditData()) {
          let msg = '변경항목이 없습니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'There are no changes.';
          }
          this.utilService.notify_error(msg);
          return;
        }

        saveContent.consItemList = detailList;

        saveContent['createdby'] = this.sessionUserId;
        saveContent['modifiedby'] = this.sessionUserId;
        saveContent['formModified'] = formModified;
        //
        // console.log("==save saveContent >>>");  console.log(saveContent);
        // console.log("==save detailList >>>");  console.log(detailList);

        const approval1 = this.popupForm.instance.getEditor('approval1').option('value');
        const approval2 = this.popupForm.instance.getEditor('approval2').option('value');
        const approval3 = this.popupForm.instance.getEditor('approval3').option('value');

        saveContent['damageflg'] = 'N';

        if ((approval1 === -1) && (approval2 === -1) && (approval3 === -1)) {
          const confirmMsgChastity = this.utilService.convert1('confirmMsgChastity', '전결처리 하시겠습니까?');
          if (!await this.utilService.confirm(confirmMsgChastity)) {
            return;
          }
        } else {
          const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
          if (!await this.utilService.confirm(confirmMsg)) {
            return;
          }
        }

        console.log(saveContent);

        result = await this.service.mainSave(saveContent);

        if (!result.success) {
          if (result.msg === 'Sales.PurClosed') {
            const filtered = this.dsCustCd.filter(el => el.cd === this.popupFormData.pur_cd);
            const purNm = filtered.length > 0 ? filtered[0].display : '';
            const mon = this.popupFormData.cons_dt.substr(4, 2);
            const msg = this.utilService.convert(result.msg, purNm, mon);
            this.utilService.notify_error(msg);
          } else {
            this.utilService.notify_error(result.msg);
          }
          return;
        } else {
          this.utilService.notify_success('Save success');
          // this.popupForm.instance.resetValues();
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

    if (e.dataField === 'item_cd' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.ord_no ? true : false;
    }

    if (e.dataField === 'cons_pr') {
      e.editorOptions.disabled = this.popupFormData.cont_no ? true : false;
    }

    if (e.dataField === 'std_pur_vat_rate') {
      e.editorOptions.disabled = this.popupFormData.cont_no ? true : false;
    }
  }

  /**
   * 매입처 변경시
   */
  onSelectionChangedPurCd(e): void {
    console.log('====onSelectionChangedPurCd======');

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (!e || !e.event) {
      return;
    }

    // if (this.popupGrid.instance.getVisibleRows().length > 0) {
    if (this.changes.length > 0) {
      this.suspendValueChagned = true;
      this.popupForm.instance.getEditor('pur_cd').option('value', e.previousValue);
      let msg = '품목이 있는 경우 매입처를 변경할 수 없습니다.';
      if (this.utilService.getLanguage() !== 'ko') {
        msg = 'You cannot change the account if there is an item.';
      }
      this.utilService.notify_error(msg);
      return;
    }

    if (this.popupMode === 'Add') {
      this.popupFormData.cont_no = null;
      this.dsContNo = [];
    }

    // 거래처 - 계약정보
    if (e && e.value) {
      const inpScheDt = this.popupForm.instance.getEditor('inp_sche_dt').option('value').replace(/-/gi, '');
      this.bizService.getPurContNo(this.G_TENANT, e.value, inpScheDt).subscribe(result => {
        console.log(result.data);
        this.dsContNo = result.data;

        // if (result.data) {
        //   // this.popupFormData.mony_unit = result.data['mony_unit'];
        //   // this.popupFormData.std_rate = result.data['std_rate'];
        //   this.popupFormData.cont_no = result.data['cont_no'];
        // } else {
        //   // this.popupFormData.std_rate = 1;
        //   // this.popupFormData.cont_no = '';
        // }
      });

      // 거래처 품목(원부자재)
      // this.bizService.getCustItem(this.G_TENANT, e.value).subscribe(result => {
      //   this.dsItemCd = result.data;
      // });
      // this.popupFormData.std_rate = 1;
      // this.popupFormData.cont_no = '';
      // this.dsItemCd = _.cloneDeep(this.dsFullitemCd);
    } else {
      // this.popupFormData.std_rate = 1;
      // this.popupFormData.cont_no = '';
      // this.dsItemCd = _.cloneDeep(this.dsFullitemCd);
    }
  }

  onSelectionChangedContNo(e): void {
    this.changes = [];
    this.bizService.getPurContData(this.G_TENANT, e.value).subscribe(result => {

      if (result.data['contNo']) {
        this.popupFormData.mony_unit = result.data['contNo']['mony_unit'];
        this.popupFormData.std_rate = result.data['contNo']['std_rate'];
        this.popupFormData.cont_no = result.data['contNo']['cont_no'];
        if (result.data['purContItem'] && this.popupFormData.cont_no) {
          this.dsItemCd = result.data['purContItem'];
        } else {
          this.dsItemCd = _.cloneDeep(this.dsFullitemCd);
        }

        if (!result.data['contNo']['mony_unit']) {
          this.popupFormData.mony_unit = 'KRW';
        }

      } else if (this.popupFormData.ptrn_cd === 'O1000') {
        this.popupFormData.std_rate = 1;
        this.popupFormData.cont_no = '';
        this.popupFormData.mony_unit = 'KRW';
        this.dsItemCd = _.cloneDeep(this.dsFullitemCd);
      } else {
        this.popupFormData.std_rate = 1;
        this.popupFormData.cont_no = '';
        this.popupFormData.mony_unit = 'KRW';
        this.dsItemCd = [];
      }
    });

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

      this.bizService.getPurContNo(this.G_TENANT, this.popupFormData.pur_cd, this.popupFormData.inp_sche_dt).subscribe(result => {
        this.dsContNo = result.data;
      });

      if (this.popupFormData.wrk_stat === '1') {
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

    this.popupFormData.ptrn_cd = this.utilService.getCompany();
    this.popupForm.instance.getEditor('ptrn_cd').option('value', this.utilService.getCompany());

    // 권한별 영업창고
    const data = {
      userId: this.utilService.getUserUid(),
      ptrn_cd: this.popupFormData.ptrn_cd,
    };
    this.bizService.getAuthWarehouseByUserId(data).then(r => {
      this.dsSaWh = r.data;
    });

    this.popupForm.instance.getEditor('cons_dt').option('disabled', false);
    this.popupForm.instance.getEditor('pur_cd').option('disabled', false);
    this.popupForm.instance.getEditor('wh_cd').option('disabled', false);
    this.popupForm.instance.getEditor('inp_sche_dt').option('disabled', false);
    this.popupForm.instance.getEditor('mony_unit').option('disabled', false);
    this.popupForm.instance.getEditor('std_rate').option('disabled', false);
    this.popupForm.instance.getEditor('cont_no').option('disabled', false);
    this.popupForm.instance.getEditor('remark').option('disabled', false);
    this.popupForm.instance.getEditor('approval1').option('disabled', false);
    this.popupForm.instance.getEditor('approval2').option('disabled', false);
    this.popupForm.instance.getEditor('approval3').option('disabled', false);

    if (this.popupMode === 'Add') { // 신규
      this.popupFormData.std_rate = 1;
      this.popupForm.instance.getEditor('cons_dt').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('inp_sche_dt').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('mony_unit').option('value', 'KRW');
      this.popupForm.instance.getEditor('cont_no').option('disabled', false);

      // 미결재 상태
      this.popupForm.instance.getEditor('first_wrk').option('value', '2');
      this.popupForm.instance.getEditor('second_wrk').option('value', '2');
      this.popupForm.instance.getEditor('final_wrk').option('value', '2');

      // 초기 focus
      this.popupForm.instance.getEditor('cons_dt').focus();
    } else if (this.popupMode === 'Edit') { // 수정

      this.dsItemCd = this.dsFullitemCd;
      this.popupForm.instance.getEditor('cons_dt').option('disabled', true);
      this.popupForm.instance.getEditor('cont_no').option('disabled', true);
      this.popupForm.instance.getEditor('pur_cd').option('disabled', true);
      this.popupForm.instance.getEditor('inp_sche_dt').option('disabled', true);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
      this.popupForm.instance.getEditor('approval1').option('disabled', true);
      this.popupForm.instance.getEditor('approval2').option('disabled', true);
      this.popupForm.instance.getEditor('approval3').option('disabled', true);

      // if (this.popupFormData.wrk_stat !== '1') {
      //   this.popupForm.instance.getEditor('cons_dt').option('disabled', true);
      //   this.popupForm.instance.getEditor('pur_cd').option('disabled', true);
      //   this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
      //   this.popupForm.instance.getEditor('inp_sche_dt').option('disabled', true);
      //   this.popupForm.instance.getEditor('mony_unit').option('disabled', true);
      //   this.popupForm.instance.getEditor('std_rate').option('disabled', true);
      //   this.popupForm.instance.getEditor('cont_no').option('disabled', true);
      //   this.popupForm.instance.getEditor('remark').option('disabled', true);
      //   this.popupForm.instance.getEditor('approval1').option('disabled', true);
      //   this.popupForm.instance.getEditor('approval2').option('disabled', true);
      //   this.popupForm.instance.getEditor('approval3').option('disabled', true);
      // }
    }
// this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

// 품목변경시 단가세팅
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    rowData.item_cd = value;
    const result = await this.bizService.getPurPrVatRateZero(this.G_TENANT,
      this.popupFormData.pur_cd,
      value
    );

    rowData.cons_pr = result['pur_pr'];
    rowData.std_pur_vat_rate = Number((result['std_pur_vat_rate'] * 100).toFixed(0));
    rowData.min_ord_qty = result['min_ord_qty'];
    rowData.cons_qty = 0;
    rowData.cons_amt = 0;
    rowData.cons_vat_amt = 0;
  }

// 부가세율 변경시 부가율세팅
  async setVatRateValue(rowData: any, value: any): Promise<void> {
    // rowData.std_pur_vat_rate = value;
    //
    // rowData.cons_vat_amt = Number(rowData.cons_qty) * Number(rowData.cons_pr) * (Number(rowData.std_pur_vat_rate) / 100);
    //
    // console.log(rowData.cons_qty);
    // console.log(rowData.std_pur_vat_rate);
    //
    // console.log(rowData.cons_vat_amt);
  }

  setConsQty(rowData: any, value: any, currentRowData: any): void {
    if (!this.isExptOk()) {
      rowData.cons_qty = 0;
      return;
    }
    rowData.cons_qty = (value < 0) ? 0 : value;

    if (currentRowData.cons_pr) {
      rowData.cons_amt = Math.floor((value * currentRowData.cons_pr) + 0.5555);
    }

    if (currentRowData.std_pur_vat_rate) {
      rowData.cons_vat_amt = Math.floor((rowData.cons_amt * (currentRowData.std_pur_vat_rate / 100)) / 10) * 10;
    }

  }

  setConsPr(newData: any, value: any, currentRowData: any): void {
    if (!this.isExptOk()) {
      newData.cons_pr = 0;
      return;
    }
    newData.cons_pr = (value < 0) ? 0 : value;
    newData.cons_amt = Math.floor((value * currentRowData.cons_qty) + 0.5555);

    if (currentRowData.std_pur_vat_rate) {
      newData.cons_vat_amt = Math.floor((newData.cons_amt * (currentRowData.std_pur_vat_rate / 100)) / 10) * 10;
    }
  }

  setConsAmt(newData: any, value: any, currentRowData: any): void {
    if (!this.isExptOk()) {
      newData.cons_pr = 0;
      return;
    }
    newData.cons_amt = (value < 0) ? 0 : value;

    if (currentRowData.std_pur_vat_rate) {
      newData.cons_vat_amt = Math.floor((newData.cons_amt * (currentRowData.std_pur_vat_rate / 100)) / 10) * 10;
    }
  }

  isExptOk(): any {
    if (!this.popupFormData.cons_dt) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cons_dt', '품의일자', 'Consult Date'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('cons_dt').focus();
      return false;
    }
    if (!this.popupFormData.pur_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.pur_cd', '매입처', 'Account'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('pur_cd').focus();
      return false;
    }
    // if (!this.popupFormData.cont_no) {
    //   const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cont_no', '계약번호', 'Contract No'));
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('cont_no').focus();
    //   return false;
    // }
    return true;
  }

  validateNumber(e): any {
    return this.popupFormData.mony_unit === 'KRW' ? e.value % 1 === 0 : e.value;
  }

// VAT 표현식 (수정함-> 값 NaN나오는 부분 수정하고, add/edit 화면 구분하여 값 제대로 나오도록 함)
  calcConsVatAmt(newData, value, currentRowData): void {
    newData.std_pur_vat_rate = value;
    newData.cons_vat_amt = Math.floor(((currentRowData.cons_amt || 0) * (value / 100)) / 10) * 10;
  }

// grid edit 제어
  allowEditing(e): any {
    return (this.popupFormData.wrk_stat === '1') ? true : false;
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
      if (!await this.utilService.confirm(confirmMsg)
      ) {
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
        // this.popupForm.instance.resetValues();
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
    if (this.popupFormData.wrk_stat !== '1') {  // 작업상태가 품의등록일때만 행추가 가능.
      return;
    }
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.popupGrid.focusedRowIndex = rowIdx;
    });
  }

  onInitNewRow(e): void {
    e.data.item_cd = '';
    e.data.cons_qty = 0;
    e.data.cons_pr = 0;
  }

// 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupFormData.wrk_stat === '1') {  // 작업상태가 품의등록일때만 행삭제 가능.
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
