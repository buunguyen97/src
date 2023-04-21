import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor080Service, Saor080VO, formData} from './saor080.service';

@Component({
  selector: 'app-saor080',
  templateUrl: './saor080.component.html',
  styleUrls: ['./saor080.component.scss']
})
export class Saor080Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor080Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.onSelectionChangedWhCd = this.onSelectionChangedWhCd.bind(this);
    this.setOutOrdQty = this.setOutOrdQty.bind(this);
    this.ordGbNm = this.ordGbNm.bind(this);
    this.saveFinal = this.saveFinal.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  dsOrdGb = []; // 주문구분
  dsExptCd = []; // 거래처(수출사)
  dsPtrnCd = []; // 수출사
  dsImptCd = []; // 수입사
  dsGridWhCd = []; // 센터(창고마스터)
  dsWhCd = []; // 센터(창고마스터)
  dsCopyWhCd = []; // 센터(창고마스터)
  dsMonyUnit = []; // 화폐
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsSaWh = []; // 영업창고
  dsCopySaWh = []; // 영업창고

  // Global
  G_TENANT: any;
  sessionUserId: any;
  ownerId: any;
  userGroup: any;
  userCompany: any;
  exptCount: any;

  mainFormData: Saor080VO = {} as Saor080VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'ordOut';
  popupModeNm = '일괄출고지시등록';  // 확정
  popupFormData: any; // formData;
  ordNoIn = '';
  selectedOrdNos: any;

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  changes = [];
  key = 'uid';

  // summary
  searchList = [];

  // Grid State
  GRID_STATE_KEY = 'saor_saor080_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 주문구분
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
      {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
      {cd: '3', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')}];

    if (this.userGroup === '3') {
      // 수출사
      this.service.getExptPtrn(this.G_TENANT, this.userCompany).subscribe(result => {
        this.dsExptCd = result.data;
      });
    } else {
      // 수출사
      this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
        this.dsExptCd = result.data;
      });
    }

    // 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopySaWh = result.data;
    });

    // 파트너사
    // this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
    //   this.dsPtrnCd = result.data;
    // });

    // 파트너사
    if (this.utilService.getCompany() === 'O1000') {
      this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
        this.dsPtrnCd = result.data;
      });
    } else {
      this.codeService.getRelatedCompany(this.utilService.getTenant(), Number(this.utilService.getCompanyId())).subscribe(r => {
        this.dsPtrnCd = r.data;
      });
    }

    // 수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
      this.dsImptCd = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsGridWhCd = result.data;
    });
    this.bizService.getPtrnWh(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', '', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.ownerId = result.data[0]["company"];
    });
  }

  ngAfterViewInit(): void {

    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    // 팝업 그리드 초기화
    this.entityStoreItemGrid = new ArrayStore(
      {
        data: [], key: this.key
      }
    );

    this.dsItemGrid = new DataSource({
      store: this.entityStoreItemGrid
    });

    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;
    this.mainFormData.dg_req_dt = rangeDate.toDate;

    this.mainFormData.ptrnCd = this.utilService.getCompany();
    this.mainFormData.ordGb = '1';  // 판매로 초기값 세팅

    if (this.userGroup === '3') {
      this.mainForm.instance.getEditor('ptrnCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('ptrnCd').option('disabled', true);
    }
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);

  }


  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromOrdDate = document.getElementsByName('fromOrdDate').item(1).getAttribute('value');
      this.mainFormData.toOrdDate = document.getElementsByName('toOrdDate').item(1).getAttribute('value');

      if(this.mainFormData.dg_req_dt)
        this.mainFormData.dg_req_dt = this.mainFormData.dg_req_dt.replace(/-/g, '');

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

        // this.mainGrid.focusedRowIndex = -1;

        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {

    let para: any = {tenant: this.G_TENANT, ...{ord_no_in: this.ordNoIn}};

    const result = await this.service.itemList(para);

    console.log('items result>>>>>>>>>>>>>>>>>>');
    console.log(result);

    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      this.popupGrid.instance.cancelEditData();
      this.utilService.notify_success('search success');

      // 파트너사에 따른 창고만 콤보에 적용
      this.dsWhCd = this.dsCopyWhCd.filter(el => el.cust_cd === this.popupFormData.ptrn_cd);

      this.entityStoreItemGrid = new ArrayStore(
        {
          data: result.data,
          key: this.key
        }
      );
      this.dsItemGrid = new DataSource({
        store: this.entityStoreItemGrid
      });
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;
    }

  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 주문할당으로 팝업(POPUP) 띄우기  이벤트
  async ordOutClick(e): Promise<void> {

    const ordDatas: any = this.mainGrid.instance.getSelectedRowsData();

    const ordNos = Array.from(new Set(ordDatas.map(({ptrn_cd}) => ptrn_cd)));

    if (ordDatas.length < 1) {
      // 주문 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.ord', '주문', 'Order'));
      this.utilService.notify_error(msg);
      return;
    }

    if (ordNos.length > 1) {
      let msg = '같은 파트너사만 선택 가능합니다.';
      if (this.utilService.getLanguage() !== 'ko') {
        msg = 'Only the same partner can be selected.';
      }
      this.utilService.notify_error(msg);
      return;
    }

    this.showPopup(ordDatas);
  }

  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {
    let msg;
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '품목 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item_cd', '품목', 'Item'));
      this.utilService.notify_error(msg);
      return;
    }

    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) return;

    try {
      let result;

      const today = this.gridUtil.getToday().replace(/-/gi, '');
      const outOrdDt = this.popupForm.instance.getEditor('out_ord_dt').option('value').replace(/-/gi, '');
      // let depoScheDt: string = this.popupForm.instance.getEditor('depo_sche_dt').option('value').replace(/-/gi, "");

      // if (outOrdDt < today) {
      //   msg = '출고지시일은 당일 포함 이후만 가능합니다.';
      //   if (this.utilService.getLanguage() !== 'ko') {
      //     msg = 'Out Instruction date is available only after including on the same day.';
      //   }
      //   this.utilService.notify_error(msg);
      //   this.popupForm.instance.getEditor('out_ord_dt').focus();
      //   return;
      // }
      // if (depoScheDt < outOrdDt) {
      //   var msg = '입금예정일은 출고지시일 포함 이후만 가능합니다.';
      //   if (this.utilService.getLanguage() !== 'ko') {
      //     msg = 'The scheduled deposit date is only possible after including the out Instruction date.';
      //   }
      //   this.utilService.notify_error(msg);
      //   this.popupForm.instance.getEditor('depo_sche_dt').focus();
      //   return;
      // }

      const saveContent = this.popupFormData as Saor080VO;
      let detailList;

      if (this.changes.length > 0) {
        detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
      } else {
        detailList = this.popupGrid.instance.getDataSource().items();
      }

      for (const items of detailList) {
        // tslint:disable-next-line:no-bitwise
        const ordQty = items.ord_qty >>> 0;
        // tslint:disable-next-line:no-bitwise
        const avaStoQty = items.ava_sto_qty >>> 0;
        // tslint:disable-next-line:no-bitwise
        const outOrdQty: number = items.out_ord_qty >>> 0;

        if (ordQty < outOrdQty) {
          msg = '주문수량을 초과할 수 없습니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Order quantity cannot be exceeded.';
          }
          this.utilService.notify_error(msg);
          return;
        }
        if (avaStoQty < outOrdQty) {
          msg = '가용재고수량을 초과할 수 없습니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Available stock quantity cannot be exceeded.';
          }
          this.utilService.notify_error(msg);
          return;
        }
      }

      // 출고지시수량
      let totOutOrdQty = 0;
      for (const items of this.popupGrid.instance.getVisibleRows()) {
        // tslint:disable-next-line:no-bitwise
        totOutOrdQty += items.data.out_ord_qty >>> 0;
      }

      if (totOutOrdQty < 1) {
        msg = '출고지시수량을 1개 이상 입력하세요.';
        if (this.utilService.getLanguage() !== 'ko') {
          msg = 'Please enter at least one quantity to indicate.';
        }
        this.utilService.notify_error(msg);
        return;
      }

      // if (!this.popupGrid.instance.hasEditData()) {
      //   var msg = '변경항목이 없습니다.';
      //   if (this.utilService.getLanguage() !== 'ko') {
      //     msg = 'There are no changes.';
      //   }
      //   this.utilService.notify_error(msg);
      //   return;
      // }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.itemList = detailList;
      saveContent["ord_no_in"] = this.ordNoIn;
      saveContent["createdby"] = this.sessionUserId;
      saveContent["modifiedby"] = this.sessionUserId;
      saveContent["language"] = this.utilService.getLanguage();

      saveContent.ownerId = this.ownerId;

      console.log(saveContent);

      result = await this.service.itemDvList(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        if (result.data.length > 0) {
          for (const data of result.data) {
            if (!data.pwh_cd) {
              // tslint:disable-next-line:no-shadowed-variable
              const confirmMsg = this.utilService.convert1('reConfirmExecute', '물류창고가 없는 영업창고가 존재합니다. 확정하시겠습니까?');
              if (!await this.utilService.confirm(confirmMsg)) {
                return;
              }
              break;
            }
          }
          this.saveFinal(saveContent);
        }
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async saveFinal(e): Promise<void> {
    console.log(e);
    try {
      let result;

      result = await this.service.mainSave(e);

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


  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    // console.log("onFocusedCellChanging   CELL Changing");
    // grid.focusedRowIndex = e.rowIndex;
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
  showPopup(data): void {
    this.changes = [];  // 초기화
    this.ordNoIn = '';

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    for (const items of data) {
      if (this.ordNoIn) this.ordNoIn += ', ';
      this.ordNoIn += "'" + items.ord_no + "'";
    }
    const ordNoForm: string = this.ordNoIn.replace(/'/gi, '');

    // 팝업 폼 데이터 세팅
    this.popupFormData = {tenant: this.G_TENANT, ord_no_in: ordNoForm, ptrn_cd: data[0].ptrn_cd};

    this.selectedOrdNos = data;

    this.popupVisible = true;

    this.onSearchPopup();
  }

  popupShown(e): void {
    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);

    this.popupForm.instance.getEditor('out_ord_dt').option('disabled', false);
    // this.popupForm.instance.getEditor('wh_cd').option('disabled', true);

    this.popupModeNm = this.utilService.convert1('sales.out_ord_bulk', '일괄출고지시등록', 'Bulk Out Order');

    this.popupForm.instance.getEditor('out_ord_dt').option('value', this.gridUtil.getToday());
    // 초기 focus
    this.popupForm.instance.getEditor('out_ord_dt').focus();

    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  // 창고변경시 가용재고를 위해 품목목록 재조회
  async onSelectionChangedWhCd(e): Promise<void> {
    console.log('onSelectionChangedWhCd >>>>');
    if (!e.event) return;

    // let para:any = this.popupFormData;

    const para: any = {tenant: this.G_TENANT, sa_wh_cd: this.popupFormData.sa_wh_cd, ...{ord_no_in: this.ordNoIn}};

    const result = await this.service.itemList(para);
    this.popupFormData.wh_cd = result.data[0]["wh_cd"];
    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      this.popupGrid.instance.cancelEditData();
      this.utilService.notify_success('search success');

      this.entityStoreItemGrid = new ArrayStore(
        {
          data: result.data,
          key: this.key
        }
      );
      // ArrayStore - DataSource와 바인딩.
      // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
      this.dsItemGrid = new DataSource({
        store: this.entityStoreItemGrid
      });
    }
  }

  setOutOrdQty(rowData: any, value: any): void {

    // if (!this.popupFormData.wh_cd) {
    //   const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.wh_cd', '창고', 'Warehouse'));
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('wh_cd').focus();
    //   rowData.out_ord_qty = 0;
    //   return;
    // }
    rowData.out_ord_qty = (value < 0) ? 0 : value;
  }

  // 주문구분명 표현식
  ordGbNm(rowData) {
    let nm: string = '';
    if (this.utilService.getLanguage() === 'ko') {
      if (rowData.ord_gb === '1') {
        nm = '판매';
      } else if (rowData.ord_gb === '2') {
        nm = '렌탈';
      } else if (rowData.ord_gb === '3') {
        nm = '견본,타계정';
      }
    } else {
      if (rowData.ord_gb === '1') {
        nm = 'Sale';
      } else if (rowData.ord_gb === '2') {
        nm = 'Rental';
      } else if (rowData.ord_gb === '3') {
        nm = 'Sample';
      }
    }
    return nm;
  }

  /* 영업창고 */
  suspendValueChagned = false;

  onSelectionChangedPtrnCd(e): void {
    console.log('====onSelectionChangedPtrnCd======');
    console.log(e.value);

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }
    if (!e) return;
    if (!e.event) return;

    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === (e ? e.value : this.popupFormData.ptrn_cd));

    if (this.popupMode === 'Add') {
      this.popupFormData.sa_wh_cd = null; // 거래처(수출사)선택시 - 창고초기화
    }

    // 수출사 - 계약정보
    if (e) {
      if (e.value) {
        this.bizService.getSaWh(this.G_TENANT, e.value).subscribe(result => {
          this.dsSaWh = result.data;
        });
      } else {
      }
    }
  }

  onInitNewRow(e): void {
    // e.data.item_cd = "";
    // e.data.ord_qty = 0;
    // e.data.ord_pr = 0;
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
