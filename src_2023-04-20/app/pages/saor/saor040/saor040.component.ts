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
import {FormData, Saor040Service, Saor040VO} from './saor040.service';

@Component({
  selector: 'app-saor040',
  templateUrl: './saor040.component.html',
  styleUrls: ['./saor040.component.scss']
})
export class Saor040Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor040Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.ordConfirmSaveClick = this.ordConfirmSaveClick.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);

    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.allowEditing = this.allowEditing.bind(this);

    this.onSelectionChangedWhCd = this.onSelectionChangedWhCd.bind(this);
    this.onSelectionChangedPtrnCd = this.onSelectionChangedPtrnCd.bind(this);
    this.setOutOrdQty = this.setOutOrdQty.bind(this);
    this.ordGbNm = this.ordGbNm.bind(this);
    this.wrkStatNm = this.wrkStatNm.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('ordConfirmBtn', {static: false}) ordConfirmBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  dsOrdGb = []; // 주문구분
  dsWrkStat = []; // 작업상태
  dsExptCd = []; // 거래처(수출사)
  dsCopyExptCd = [];
  dsPtrnCd = []; // 수출사
  dsImptCd = []; // 수입사
  dsGridWhCd = []; // 센터(창고마스터)
  dsWhCd = []; // 센터(창고마스터)
  dsCopyWhCd = []; // 센터(창고마스터)
  dsMonyUnit = []; // 화폐
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsCopyPort = []; // 항구
  dsLoadPort = []; // 선적항
  dsArvlPort = []; // 도착항
  dsSaWh = []; // 영업창고
  dsCopySaWh = [];


  // Global
  G_TENANT: any;
  sessionUserId: any;
  ownerId: any;
  userGroup: any;
  userCompany: any;
  exptCount: any;
  imptCount: any;

  mainFormData: Saor040VO = {} as Saor040VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = '주문할당';  // 확정
  popupFormData: FormData = {} as Saor040VO;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  deleteRowList = [];
  changes = [];
  subChanges = [];
  key = ['ord_no'];
  popupKey = 'item_cd';

  // Grid State
  GRID_STATE_KEY = 'saor_saor040_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // this.dsExptCd = this.dsCopyExptCd.filter(el => el.ptrnCd === this.mainFormData.ptrnCd);

    // 주문구분
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
      {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
      {cd: '3', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')}];

    this.dsWrkStat = [{cd: '1', nm: this.utilService.convert1('sales.ord_assign', '주문할당', 'Assign Order')},
      {cd: '2', nm: this.utilService.convert1('sales.out_ord', '출고지시', 'Out Order')},
      {cd: '3', nm: this.utilService.convert1('sales.out', '출고', 'Out')}];

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

    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopySaWh = result.data;
    });

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

    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => {
      this.dsCopyPort = result.data;
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
        data: [], key: this.popupKey
      }
    );

    this.dsItemGrid = new DataSource({
      store: this.entityStoreItemGrid
    });

    this.initForm();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;

    this.mainFormData.ptrnCd = this.utilService.getCompany();
    this.mainFormData.ordGb = '1';  // 판매로 초기값 세팅

    if (this.userGroup === '3') {
      this.mainForm.instance.getEditor('ptrnCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('ptrnCd').option('disabled', true);
    }
  }


  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromOrdDate = document.getElementsByName('fromOrdDate').item(1).getAttribute('value');
      this.mainFormData.toOrdDate = document.getElementsByName('toOrdDate').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);

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
    console.log('onSearchPopup >>> ');
    if (this.popupFormData.uid) {

      // Service의 get 함수 생성

      let para: any = this.popupFormData;
      para.popup_mode = this.popupMode;

      const result = await this.service.mainInfo(para);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        // 팝업 폼 데이터 세팅
        this.popupFormData = result.data.info;
        this.firstPopupData = JSON.stringify(this.popupFormData);

        // 파트너사에 따른 창고만 콤보에 적용
        this.dsWhCd = this.dsCopyWhCd.filter(el => el.cust_cd === this.popupFormData.ptrn_cd);

        // 수출사에 따른 선적항만 콤보에 적용
        this.dsLoadPort = this.dsCopyPort.filter(el => el.etcColumn1 === this.popupFormData.expt_country);

        // 수입사에 따른 도착항만 콤보에 적용
        this.dsArvlPort = this.dsCopyPort.filter(el => el.etcColumn1 === this.popupFormData.impt_country);


        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.ordItemList,
            key: this.popupKey
          }
        );
        this.dsItemGrid = new DataSource({
          store: this.entityStoreItemGrid
        });
        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 주문할당으로 팝업(POPUP) 띄우기  이벤트
  async ordAssignClick(e): Promise<void> {
    let ordDatas: any = this.mainGrid.instance.getSelectedRowsData();

    if (ordDatas.length < 1) {
      // 주문 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.ord', '주문', 'Order'));
      this.utilService.notify_error(msg);
      return;
    }

    let ordData: any = ordDatas[0];
    if (ordData.out_item_full_yn === 'Y') {
      // 주문 목록을 선택하세요.
      var msg = '모든 품목이 할당되었습니다.';
      if (this.utilService.getLanguage() !== 'ko') {
        msg = 'All items have been assigned.';
      }
      this.utilService.notify_error(msg);
      return;
    }

    this.showPopup('ordAssign', {...ordData});
  }


  // 주문확정버튼 이벤트  ordconfirm
  async ordConfirmSaveClick(e): Promise<void> {
    this.onSave(e, 'ordConfirm');
  }

  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {
    this.onSave(e, 'ordAssign');
  }

  async onSave(e, saveGb): Promise<void> {
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '품목 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item_cd', '품목', 'Item'));
      this.utilService.notify_error(msg);
      return;
    }

    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) return;

    let result;
    let sendResult;

    let lastPopupData: string = JSON.stringify(this.popupFormData);
    let formModified: string = 'N';

    if (this.firstPopupData !== lastPopupData) {
      formModified = 'Y';
    } else {
    }

    if (!this.popupFormData.wh_cd) {
      // tslint:disable-next-line:no-shadowed-variable
      const confirmMsg = this.utilService.convert('confirmWhNull', '파트너사의 물류창고가 없습니다. 확정하시겠습니까?');
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
    }

    // await this.bizService.getSaWhExptCheck(this.G_TENANT, this.popupFormData.expt_cd).subscribe(async result => {
    //     // console.log(result.data);
    //     // console.log(result.data[0]);
    //     this.exptCount = result.data[0];
    //   });

    // if(this.exptCount.count <= 0) {
    //   var msg = '수출사 지정 영업창고가 없습니다.';
    //   if( this.utilService.getLanguage() !== 'ko') {
    //     msg = 'There is no export company designated sales warehouse.';
    //   }
    //   this.utilService.notify_error(msg);
    //   return;
    // }

    let today: string = this.gridUtil.getToday().replace(/-/gi, '');
    let ordDt: string = this.popupForm.instance.getEditor('ord_dt').option('value').replace(/-/gi, '');
    let outOrdDt: string = this.popupForm.instance.getEditor('out_ord_dt').option('value').replace(/-/gi, '');

    // if (outOrdDt < ordDt) {
    //   var msg = '출고지시일은 주문일자 포함 이후만 가능합니다.';
    //   if (this.utilService.getLanguage() !== 'ko') {
    //     msg = 'Out Instruction date is only available after order date is included.';
    //   }
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('out_ord_dt').focus();
    //   return;
    // }
    //
    // if (this.popupMode === 'ordAssign' && outOrdDt < today) {
    //   var msg = '출고지시일은 당일 포함 이후만 가능합니다.';
    //   if (this.utilService.getLanguage() !== 'ko') {
    //     msg = 'Out Instruction date is available only after including on the same day.';
    //   }
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('out_ord_dt').focus();
    //   return;
    // }

    /*if( this.popupFormData.ord_gb=="1" ) {
    let depoScheDt: string = this.popupForm.instance.getEditor('depo_sche_dt').option('value').replace(/-/gi, "");
    if (depoScheDt < outOrdDt) {
      var msg = "입금예정일은 출고지시일 포함 이후만 가능합니다.";
      if (this.utilService.getLanguage() != 'ko') {
        msg = "The scheduled deposit date is only possible after including the out Instruction date.";
      }
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('depo_sche_dt').focus();
      return;
    }
    }*/


    const saveContent = this.popupFormData as Saor040VO;
    let detailList;

    if (this.changes.length > 0) {
      detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
    } else {
      detailList = this.popupGrid.instance.getDataSource().items();
    }

    for (const items of detailList) {
      let ordQty: number = items.ord_qty;
      let avaStoQty: number = items.ava_sto_qty;
      let outOrdQty: number = items.out_ord_qty;

      /*        if( ordQty < outOrdQty ) {
                var msg = "주문수량을 초과할 수 없습니다.";
                if( this.utilService.getLanguage()!='ko' ) {
                    msg = "Order quantity cannot be exceeded.";
                }
                this.utilService.notify_error(msg);
                return;
              } */
      if (avaStoQty < outOrdQty) {
        var msg = '가용재고수량을 초과할 수 없습니다.';
        if (this.utilService.getLanguage() !== 'ko') {
          msg = 'Available stock quantity cannot be exceeded.';
        }
        this.utilService.notify_error(msg);
        return;
      }
    }

    // 출고지시수량
    let totOutOrdQty: number = 0;
    for (const items of this.popupGrid.instance.getVisibleRows()) {
      totOutOrdQty += items.data.out_ord_qty;
    }

    if (totOutOrdQty < 1) {
      var msg = '출고지시수량을 1개 이상 입력하세요.';
      if (this.utilService.getLanguage() !== 'ko') {
        msg = 'Please enter at least one quantity to indicate.';
      }
      this.utilService.notify_error(msg);
      return;
    }

    if (saveGb === 'ordAssign' && formModified === 'N' && !this.popupGrid.instance.hasEditData()) {
      var msg = '변경항목이 없습니다.';
      if (this.utilService.getLanguage() !== 'ko') {
        msg = 'There are no changes.';
      }
      this.utilService.notify_error(msg);
      return;
    }

    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    saveContent.ordItemList = detailList;

    saveContent["saveGb"] = saveGb;
    saveContent["createdby"] = this.sessionUserId;
    saveContent["modifiedby"] = this.sessionUserId;
    saveContent["formModified"] = formModified;
    saveContent["language"] = this.utilService.getLanguage();
    saveContent["ownerId"] = this.ownerId;

    // console.log("==save saveContent >>>");  console.log(saveContent);
    // console.log("==save detailList >>>");  console.log(detailList);

    if (!saveContent.wh_cd) {
       saveContent.wh_cd = '';
    }
    console.log(saveContent);
    result = await this.service.mainSave(saveContent);

    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      // console.log(result.data["outOrdNo"]);
      // // if( saveGb=="ordConfirm" ) {
      // // 물류 품목 송신 I/F (물류창고 있으면)
      // if (this.popupFormData.wh_cd) {
      //   sendResult = await this.bizService.sendApi({
      //     sendType: 'outOrd',
      //     outOrdNo: result.data["outOrdNo"],
      //     ownerId: this.ownerId
      //   });
      //
      //   if (!sendResult.success && this.popupFormData.wh_cd == null) {
      //     this.utilService.notify_error(JSON.stringify(sendResult));
      //     // return;
      //   } else {
      //     console.log('I/F Success');
      //   }
      // }

      this.utilService.notify_success('Save success');
      this.popupForm.instance.resetValues();
      this.popupVisible = false;
      this.onSearch();
    }
  }


  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('ordConfirm', {...e.data});
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
  showPopup(popupMode, data): void {
    this.bizService.getPtrnWh(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });

    this.changes = [];  // 초기화

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;
    console.log(this.popupFormData);

    // 팝업 버튼 보이기 정리
    this.deleteBtn.visible = false; // 삭제버튼
    this.ordConfirmBtn.visible = false; // 주문할당
    this.saveBtn.visible = false; // 저장버튼
    this.popupVisible = true;

    if (this.popupMode === 'ordAssign') { // 주문할당
      this.saveBtn.visible = true; // 저장버튼
    } else { // 주문확정 'ordConfirm'
      if (this.popupFormData.wrk_stat === '1') {
        this.deleteBtn.visible = true; // 삭제버튼
        this.ordConfirmBtn.visible = true; // 주문할당
        this.saveBtn.visible = true; // 저장버튼
      }
    }
    this.onSearchPopup();
  }

  popupShown(e): void {
    this.dsWhCd = this.dsCopyWhCd.filter(el => el.cust_cd === this.popupFormData.ptrn_cd);
    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);

    console.log(this.dsSaWh);
    this.popupForm.instance.getEditor('out_ord_dt').option('disabled', false);
    this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
    this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', true);

    if (this.popupMode === 'ordAssign') { // 주문할당
      this.popupModeNm = this.utilService.convert1('sales.out_ord', '출고지시', 'Out Order');
      this.popupForm.instance.getEditor('out_ord_dt').option('value', this.gridUtil.getToday());

      // 초기 focus
      this.popupForm.instance.getEditor('out_ord_dt').focus();
    } else {
      this.popupModeNm = this.utilService.convert1('sales.ord', '주문', 'Order');
      this.popupForm.instance.getEditor('out_ord_dt').option('disabled', true);
      this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', true);
      if (this.popupFormData.wrk_stat !== '0'
        && this.popupFormData.wrk_stat !== '1') {
      }
      // 초기 focus
      this.popupForm.instance.getEditor('load_port').focus();
    }

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
    // console.log(e.event);
    // if (!e.event) return;

    let para: any = this.popupFormData;
    para.popup_mode = this.popupMode;

    const result = await this.service.itemList(para);
    if (result.data[0]) {
      this.popupFormData.wh_cd = result.data[0]["wh_cd"];
    }
    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      this.popupGrid.instance.cancelEditData();
      this.utilService.notify_success('search success');

      this.entityStoreItemGrid = new ArrayStore(
        {
          data: result.data,
          key: this.popupKey
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

    /*if (!this.popupFormData.wh_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.wh_cd', '창고', 'Warehouse'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('wh_cd').focus();
      rowData.out_ord_qty = 0;
      return;
    }*/
    rowData.out_ord_qty = value;
  }

  // 주문금액 표현식
  calcOutOrdAmt(rowData) {
    return rowData.out_ord_qty * rowData.ord_pr;
  }

  // 주문구분명 표현식
  ordGbNm(rowData) {
    let nm: string = "";
    if (this.utilService.getLanguage() == 'ko') {
      if (rowData.ord_gb == "1") {
        nm = '판매';
      } else if (rowData.ord_gb == "2") {
        nm = '렌탈';
      } else if (rowData.ord_gb == "3") {
        nm = '견본,타계정';
      } else if (rowData.ord_gb == "4") {
        nm = '판매반품';
      } else if (rowData.ord_gb == "5") {
        nm = '렌탈반품';
      } else if (rowData.ord_gb == "6") {
        nm = '견본,타계정반품';
      }
    } else {
      if (rowData.ord_gb == "1") {
        nm = 'Sale';
      } else if (rowData.ord_gb == "2") {
        nm = 'Rental';
      } else if (rowData.ord_gb == "3") {
        nm = 'Sample';
      } else if (rowData.ord_gb == "4") {
        nm = 'SaleReturn'
      } else if (rowData.ord_gb == "5") {
        nm = 'RentalReturn'
      } else if (rowData.ord_gb == "6") {
        nm = 'SampleReturn'
      }
    }
    return nm;
  }

  // 작업상태 표현식
  wrkStatNm(rowData) {
    let nm: string = '';
    if (this.utilService.getLanguage() === 'ko') {
      if (rowData.wrk_stat === '1') {
        nm = '주문할당';
      } else if (rowData.wrk_stat === '2') {
        nm = '출고지시';
      } else if (rowData.wrk_stat === '3') {
        nm = '출고';
      }
    } else {
      if (rowData.wrk_stat === '1') {
        nm = 'Assign Order';
      } else if (rowData.wrk_stat === '2') {
        nm = 'Out Order';
      } else if (rowData.wrk_stat === '3') {
        nm = 'Out';
      }
    }
    return nm;
  }

  // grid edit 제어
  allowEditing(e) {
    let bEdit: boolean = true;
    if (this.popupFormData.wrk_stat !== '0'
      && this.popupFormData.wrk_stat !== '1') {
      bEdit = false;
    }
    return bEdit;
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));  // "삭제"
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormData as Saor040VO;
      const result = await this.service.mainDelete(deleteContent);
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

  onInitNewRow(e): void {
    // e.data.item_cd = "";
    // e.data.ord_qty = 0;
    // e.data.ord_pr = 0;
  }

  // 계약사 - 계약번호
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

  /**
   *  팝업 메소드 END
   */

}

