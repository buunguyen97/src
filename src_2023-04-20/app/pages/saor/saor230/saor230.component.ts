import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFormComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {FormData} from '../saor040/saor040.service';
import {formData, Saor230Service, Saor230VO} from './saor230.service';

@Component({
  selector: 'app-saor230',
  templateUrl: './saor230.component.html',
  styleUrls: ['./saor230.component.scss']
})
export class Saor230Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor230Service,
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

    this.onSelectionChangedPtrnCd = this.onSelectionChangedPtrnCd.bind(this);
    this.onSelectionChangedWhCd = this.onSelectionChangedWhCd.bind(this);
    this.onSelectionChangedSaWhCd = this.onSelectionChangedSaWhCd.bind(this);
    this.setOutOrdQty = this.setOutOrdQty.bind(this);
    this.ordGbNm = this.ordGbNm.bind(this);
    this.wrkStatNm = this.wrkStatNm.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
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
  dsItemCd2 = [];
  dsRfr = []; // 반품사유
  dsRfs = []; // 보류사유
  dsCopySaWh = [];
  dsSaWh = [];


  // Global
  G_TENANT: any;
  sessionUserId: any;
  ownerId: any;
  userGroup: any;
  userCompany: any;
  exptCount: any;

  mainFormData: Saor230VO = {} as Saor230VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = '주문할당';  // 확정
  popupFormData: formData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  deleteRowList = [];
  changes = [];
  subChanges = [];
  key = 'uid';
  popupKey = 'item_cd';

  // Grid State
  GRID_STATE_KEY = 'saor_saor040_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  suspendValueChagned = true;

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {

    // 반품사유
    this.codeService.getCode(this.G_TENANT, 'BPCODE').subscribe(result => {
      this.dsRfr = result.data;
    });

    // 보류사유
    this.dsRfs = [{cd: '0', nm: this.utilService.convert1('sales.rfs_none', '없음', 'NONE')},
      {cd: '1', nm: this.utilService.convert1('sales.rfs_stay', '기한연장', 'Extension of time limit')},
      {cd: '2', nm: this.utilService.convert1('sales.rfs_option', '의견조율', 'Coordination of opinions')},
      {cd: '3', nm: this.utilService.convert1('sales.rfs_confirm', '반품확정', 'Return Confirmation')}
    ];

    // 주문구분
    this.dsOrdGb = [{cd: '4', nm: this.utilService.convert('sales.sale_return')},
      {cd: '5', nm: this.utilService.convert('sales.rent_return')},
      {cd: '6', nm: this.utilService.convert('sales.sample_return')}];

    this.dsWrkStat = [{cd: '1', nm: this.utilService.convert1('sales.ord_assign', '주문할당', 'Assign Order')},
      {cd: '2', nm: this.utilService.convert1('sales.out_ord', '출고지시', 'Out Order')},
      {cd: '3', nm: this.utilService.convert1('sales.out', '출고', 'Out')}];

    // 거래처 - 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopySaWh = result.data;
    });

    // 수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
      this.dsExptCd = result.data;
    });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

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

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', '', '', '', '').subscribe(result => {
      this.dsItemCd2 = result.data;
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
      this.ownerId = result.data[0].company;
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

    // this.utilService.getFoldable(this.mainForm, this.foldableBtn);

    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    // this.mainForm.instance.getEditor('fromOrdDate').option('value', this.gridUtil.getToday());
    // this.mainForm.instance.getEditor('toOrdDate').option('value', this.gridUtil.getToday());

    if (this.userGroup === '3') {
      this.mainForm.instance.getEditor('ptrnCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('ptrnCd').option('disabled', true);
    }
  }


  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      if (this.fromOrdDate && this.fromOrdDate.value) {
        this.mainFormData.fromOrdDate = this.fromOrdDate.value as string;
      } else {
        this.mainFormData.fromOrdDate = null;
      }
      if (this.toOrdDate && this.toOrdDate.value) {
        this.mainFormData.toOrdDate = this.toOrdDate.value as string;
      } else {
        this.mainFormData.toOrdDate = null;
      }

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

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    console.log('onSearchPopup >>> ');
    if (this.popupFormData.uid) {

      // Service의 get 함수 생성

      const para: any = this.popupFormData;
      para.popup_mode = this.popupMode;

      console.log(' popupFormData 222>>> ');
      console.log(this.popupFormData);

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
    // console.log(9999);  // xxxxXXXX
    // console.log(this.mainGrid.instance.getSelectedRowsData());

    const ordDatas: any = this.mainGrid.instance.getSelectedRowsData();

    if (ordDatas.length < 1) {
      // 주문 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.ord', '주문', 'Order'));
      this.utilService.notify_error(msg);
      return;
    }

    const ordData: any = ordDatas[0];
    if (ordData.out_item_full_yn === 'Y') {
      // 주문 목록을 선택하세요.
      const msg = this.utilService.convert1('saor230.allItemAssigned', '모든 품목이 할당되었습니다.');
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
    /*if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '품목 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item_cd', '품목', 'Item'));
      this.utilService.notify_error(msg);
      return;
    }*/

    console.log(this.popupFormData.expt_cd);
    // console.log(this.popupFormData.impt_cd);
    console.log(this.popupFormData.ptrn_cd);

    // const res = await this.bizService.getSaWhExptCheck(this.G_TENANT, this.popupFormData.expt_cd);
    //
    // console.log('res', res);
    //
    // this.bizService.getSaWhExptCheck(this.G_TENANT, this.popupFormData.expt_cd).subscribe(result => {
    //   console.log(result.data);
    //   // console.log(result.data[0]);
    //   this.exptCount = result.data[0];
    // });

    // console.log(this.exptCount.count);
    //
    // if (this.exptCount.count <= 0) {
    //   let msg = '수출사 지정 영업창고가 없습니다.';
    //   if (this.utilService.getLanguage() !== 'ko') {
    //     msg = 'There is no export company designated sales warehouse.';
    //   }
    //   this.utilService.notify_error(msg);
    //   return;
    // }

    const popData = this.popupForm.instance.validate();
    if (!popData.isValid) {
      return;
    }

    try {
      let result;
      let sendResult;

      const lastPopupData: string = JSON.stringify(this.popupFormData);
      let formModified = 'N';

      if (this.firstPopupData !== lastPopupData) {
        formModified = 'Y';
      } else {
      }

      const today: string = this.gridUtil.getToday().replace(/-/gi, '');
      const outOrdDt: string = this.popupForm.instance.getEditor('out_ord_dt').option('value').replace(/-/gi, '');

      const saveContent = this.popupFormData as Saor230VO;
      const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
      // const detailList = this.popupGrid.instance.getVisibleRows().map(el => el.data);

      // console.log(detailList2);

      // for (const items of detailList) {
      //   const ordQty: number = items.ord_qty;
      //   const avaStoQty: number = items.ava_sto_qty;
      //   const outOrdQty: number = items.out_ord_qty;
      // }
      // return;

      saveContent.ordItemList = detailList;

      saveContent.saveGb = saveGb;
      saveContent.createdby = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;
      saveContent.formModified = formModified;
      saveContent.language = this.utilService.getLanguage();

      console.log('==save saveContent >>>');
      console.log(saveContent);
      console.log('==save detailList >>>');
      // console.log(detailList[0].re_suspen);
      // console.log(detailList);

      if (detailList.length === 0) {
        const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.rfs'));
        this.utilService.notify_error(msg);
        return;
      }
      for (const detail of detailList) {
        if (detail.re_suspen == null) {
          const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.rfs'));
          this.utilService.notify_error(msg);
          return;
        }
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      result = await this.service.mainSave(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        console.log(result.data.outOrdNo);
        // if( saveGb=="ordConfirm" ) {
        // 물류 품목 송신 I/F
        // console.log(this.ownerId);
        sendResult = await this.bizService.sendApi({
          sendType: 'return',
          outOrdNo: result.data.outOrdNo,
          ownerId: this.ownerId
        });

        if (!sendResult.success && this.popupFormData.wh_cd == null) {
          this.utilService.notify_error(JSON.stringify(sendResult));
          // return;
        } else {
          console.log('I/F Success');
        }
        // }
        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }

      // if (detailList[0].re_suspen == null || detailList[0].re_suspen === 3) {
      //
      // } else {
      //   console.log('not undefined');
      //   result = await this.service.mainUpdate(saveContent);
      //   console.log(result);
      //   if (!result.success) {
      //     this.utilService.notify_error(result.msg);
      //     return;
      //   } else {
      //     this.utilService.notify_success('Save success');
      //     this.popupForm.instance.resetValues();
      //     this.popupVisible = false;
      //     this.onSearch();
      //   }
      // }
    } catch {
      this.utilService.notify_error('There was an error!');
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
    // console.log("showPopup >> ");
    // console.log("data >> ");
    // console.log(data);

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

    // 팝업 버튼 보이기 정리
    this.deleteBtn.visible = false; // 삭제버튼
    this.ordConfirmBtn.visible = false; // 주문할당
    this.saveBtn.visible = false; // 저장버튼
    this.popupVisible = true;

    console.log(this.popupMode);
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
    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);
    this.popupForm.instance.getEditor('out_ord_dt').option('disabled', false);
    this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', false);
    this.popupForm.instance.getEditor('wh_cd').option('disabled', true);

    if (this.popupMode === 'ordAssign') { // 주문할당
      this.popupModeNm = this.utilService.convert('/saor/saor230');
      this.popupForm.instance.getEditor('out_ord_dt').option('value', this.gridUtil.getToday());

      const rowCnt = this.popupGrid.instance.totalCount();
      // 보류 사유 초기값
      for (let i = 0; i < rowCnt; i++) {
        this.popupGrid.instance.cellValue(i, 're_suspen', '3');
      }

      // 창고 기본값
      this.service.getWh(this.popupFormData.sa_wh_cd, this.popupFormData.ptrn_cd).subscribe(result => {
        if (result.success && result.data) {
          this.popupFormData.wh_cd = result.data[0]?.wh_cd;
        }
      });

      // 초기 focus
      this.popupForm.instance.getEditor('out_ord_dt').focus();
    } else {
      this.popupModeNm = this.utilService.convert1('sales.ord', '주문', 'Order');
      this.popupForm.instance.getEditor('out_ord_dt').option('disabled', true);
      if (this.popupFormData.wrk_stat !== '0'
        && this.popupFormData.wrk_stat !== '1') {
      }
      // 초기 focus
    }
    /*
    if(    this.popupFormData.ord_gb == "1" ) {
      this.popupForm.instance.getEditor('depo_sche_dt').option('disabled', false);
    }
    else {
      this.popupForm.instance.getEditor('depo_sche_dt').option('disabled', true);
    }
    */

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    this.suspendValueChagned = false;
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  // 창고변경시 가용재고를 위해 품목목록 재조회
  async onSelectionChangedWhCd(e): Promise<void> {
    console.log('onSelectionChangedWhCd >>>>');
    if (!e.event) {
      return;
    }

    const para: any = this.popupFormData;
    para.popup_mode = this.popupMode;

    const result = await this.service.itemList(para);

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

    if (!this.popupFormData.wh_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.wh_cd', '창고', 'Warehouse'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('wh_cd').focus();
      rowData.out_ord_qty = 0;
      return;
    }
    rowData.out_ord_qty = value;
  }

  // 주문금액 표현식
  calcOutOrdAmt(rowData): number {
    return rowData.out_ord_qty * rowData.ord_pr;
  }

  // 주문구분명 표현식
  ordGbNm(rowData): string {
    let nm = '';
    if (this.utilService.getLanguage() === 'ko') {
      if (rowData.ord_gb === '1') {
        nm = '판매';
      } else if (rowData.ord_gb === '2') {
        nm = '렌탈';
      } else if (rowData.ord_gb === '3') {
        nm = '견본,타계정';
      } else if (rowData.ord_gb === '4') {
        nm = '판매반품';
      } else if (rowData.ord_gb === '5') {
        nm = '렌탈반품';
      } else if (rowData.ord_gb === '6') {
        nm = '견본,타계정반품';
      }
    } else {
      if (rowData.ord_gb === '1') {
        nm = 'Sale';
      } else if (rowData.ord_gb === '2') {
        nm = 'Rental';
      } else if (rowData.ord_gb === '3') {
        nm = 'Sample';
      } else if (rowData.ord_gb === '4') {
        nm = 'SaleReturn';
      } else if (rowData.ord_gb === '5') {
        nm = 'RentalReturn';
      } else if (rowData.ord_gb === '6') {
        nm = 'SampleReturn';
      }
    }
    return nm;
  }

  // 작업상태 표현식
  wrkStatNm(rowData): string {
    let nm = '';
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
  allowEditing(e): boolean {
    let bEdit = true;
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

      const deleteContent = this.popupFormData as Saor230VO;
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

  onSelectionChangedPtrnCd(e): void {
    console.log('====onSelectionChangedPtrnCd======');
    console.log(e.value);

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }
    if (!e || !e.event) {
      return;
    }

    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === (e ? e.value : this.popupFormData.ptrn_cd));

    if (this.popupMode === 'Add') {
      this.popupFormData.wh_cd = null; // 거래처(수출사)선택시 - 창고초기화
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

  onSelectionChangedSaWhCd(e): void {
    console.log('====onSelectionChangedSaWhCd======');

    if (!e || !e.event) {
      return;
    }

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    this.popupFormData.wh_cd = null; // 거래처(수출사)선택시 - 창고초기화

    // 수출사 - 계약정보
    if (e && e.value) {
      this.service.getWh(e.value, this.popupFormData.ptrn_cd).subscribe(result => {
        if (result.success && result.data) {
          this.popupFormData.wh_cd = result.data[0]?.wh_cd;
        }
      });
    }
  }


  /**
   *  팝업 메소드 END
   */
}
