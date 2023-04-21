import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent, DxNumberBoxComponent,
  DxPopupComponent,
  DxTextBoxComponent
} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor020Service, Saor020VO} from './saor020.service';
import _ from 'lodash';
import {COMMONINITSTR} from '../../../shared/constants/commoninitstr';

@Component({
  selector: 'app-saor020',
  templateUrl: './saor020.component.html',
  styleUrls: ['./saor020.component.scss']
})
export class Saor020Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor020Service,
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
    this.onValueChangedOrdDt = this.onValueChangedOrdDt.bind(this);
    this.onSelectionChangedExptCd = this.onSelectionChangedExptCd.bind(this);
    this.onSelectionChangedPtrnCd = this.onSelectionChangedPtrnCd.bind(this);
    this.onSelectionChangedImptCd = this.onSelectionChangedImptCd.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.allowEditing = this.allowEditing.bind(this);

    this.onChangedCountry = this.onChangedCountry.bind(this);
    this.onChangedRentStDt = this.onChangedRentStDt.bind(this);
    this.popupShown = this.popupShown.bind(this);
    this.onSelectionChangedContNo = this.onSelectionChangedContNo.bind(this);
    this.onValueChangedSaWhCd = this.onValueChangedSaWhCd.bind(this);
    this.setSetItemYn = this.setSetItemYn.bind(this);
    this.setContRentalPeriodValue = this.setContRentalPeriodValue.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('rentEndDt', {static: false}) rentEndDt: DxDateBoxComponent;
  @ViewChild('contRentalPeriod', {static: false}) contRentalPeriod: DxNumberBoxComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;
  @ViewChild('address', {static: false}) address: DxButtonComponent;

  dsExptCd = []; // 거래처(수출사)
  dsMainPtrnCd = []; // 수출사-파트너사
  dsPtrnCd = []; // 수출사-파트너사
  dsCopyPtrnCd = []; // 수출사-파트너사
  dsMonyUnit = []; // 화폐
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsImptCd = []; // 수입사
  dsRtnPtrnCd = []; // 수입사-회수파트너사
  dsCopyRtnPtrnCd = []; // 수입사-회수파트너사
  dsWrkStat = []; // 작업상태
  dsSaWh = []; // 영업창고
  dsCopySaWh = []; // 수출사-파트너사
  dsCountry = []; // 국가
  dsContNo = []; // 계약 번호

  dsExptCdAll = []; // 전체수출사
  dsPtrnCdAll = []; // 전체파트너사
  dsImptCdAll = []; // 전체수입사

  dsYN = [];

  dsFullitemCd = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Saor020VO = {} as Saor020VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: Saor020VO;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

// 주문일자 변경시 - 계약번호 변경
  suspendOrdDtValueChagned = false;

  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  key = 'uid';
  popupKey = 'ord_seq';

  // Grid State
  GRID_STATE_KEY = 'saor_saor020_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  searchAddress = {
    getPacComp: () => {
      return document.getElementsByClassName('pac-container pac-logo');
      // return document.getElementsByName('corpAddress1');
    },
    initPacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      for (let i = 0; i < pacComp.length; i++) {
        if (pacComp.item(i)) {
          pacComp.item(i).remove();
        }
      }
    },
    showPacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: 9999;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    hidePacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: -1;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    getInputComp: () => {
      return document.getElementsByName('biz_adr1').item(0) as HTMLInputElement;
    },
    resetInput: () => {
      this.searchAddress.getInputComp().value = '';
    },
    setInputValue: (value: string) => {
      this.searchAddress.getInputComp().value = value;
    },
    getInputValue: () => {
      return this.searchAddress.getInputComp().value;
    }
  };

  // 거래처(수출사)선택시 - 파트너사 변경
  // 거래처(수출사)선택시 - 계약번호 변경
  suspendValueChagned = false;

  // 수입사 선택시 - 회수파트너사 변경
  suspendImptValueChagned = false;

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 작업상태
    this.codeService.getCode(this.G_TENANT, 'OUTSTAT').subscribe(result => {
      this.dsWrkStat = result.data;
    });

    // 수출사 - 파트너사
    this.bizService.getExptPtrn(this.G_TENANT, this.utilService.getCompany()).subscribe(result => {
      this.dsExptCd = result.data;
    });

    // 수출사
    // if (this.userGroup === '3') {
    //   this.service.getExptPtrn(this.G_TENANT, this.userCompany).subscribe(result => {
    //     this.dsExptCd = result.data;
    //   });
    // } else {
    //   this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
    //     this.dsExptCd = result.data;
    //   });
    // }

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsMainPtrnCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '3', '', '').subscribe(result => {
      this.dsItemCd = result.data;
      this.dsFullitemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
      this.dsImptCd = result.data;
    });

    // 수입사 - 파트너사
    this.bizService.getImptPtrn(this.G_TENANT).subscribe(result => {
      this.dsCopyRtnPtrnCd = result.data;
    });

    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => {
      this.dsExptCdAll = result.data;
    });

    // 전체파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => {
      this.dsPtrnCdAll = result.data;
    });

    // 전체수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', '', '', '').subscribe(result => {
      this.dsImptCdAll = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    }); // 사용여부
  }

  ngAfterViewInit(): void {
    // 팝업 그리드 초기화
    this.entityStoreItemGrid = new ArrayStore(
      {
        data: [], key: this.popupKey
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
    this.mainForm.instance.getEditor('wrkStat').option('value', '0'); // 상태
    // 공통 조회 조건 set
    this.fromOrdDate.value = this.gridUtil.addDate(this.gridUtil.getToday(), -7);
    this.toOrdDate.value = this.gridUtil.addDate(this.gridUtil.getToday(), 7);

    if (this.userGroup === '2') {
      this.mainForm.instance.getEditor('exptCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('exptCd').option('disabled', true);
    }
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

      this.mainFormData.fromOrdDate = (this.fromOrdDate.value as string);
      this.mainFormData.toOrdDate = (this.toOrdDate.value as string);
      this.mainFormData.ptrn_cd = this.utilService.getCompany();

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupFormData.uid) {

      // Service의 get 함수 생성
      const result = await this.service.detailList(this.popupFormData);

      if (this.popupFormData.cont_no) {
        // 수출사계약 품목 목록 조회.
        // tslint:disable-next-line:no-shadowed-variable
        this.bizService.exptContItemList(this.G_TENANT, this.popupFormData.cont_no).subscribe(result => {
          this.dsItemCd = result.data;
        });
      } else {
        this.dsItemCd = _.cloneDeep(this.dsFullitemCd);
      }

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.rentEndDt.value = this.popupFormData.rent_end_dt;

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
  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
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

        if (this.firstPopupData != lastPopupData) {
          formModified = 'Y';
        } else {
        }

        const today: string = this.gridUtil.getToday().replace(/-/gi, '');
        const ordDt: string = this.popupForm.instance.getEditor('ord_dt').option('value').replace(/-/gi, '');
        const dgReqDt: string = this.popupForm.instance.getEditor('dg_req_dt').option('value').replace(/-/gi, '');

        // if (this.popupMode === 'Add' && ordDt < today) {
        //   let msg = '주문일자는 당일 포함 이후만 가능합니다.';
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = 'Order date is available only after including on the same day..';
        //   }
        //   this.utilService.notify_error(msg);
        //   return;
        // }
        // if (dgReqDt < ordDt) {
        //   let msg = '납품요청일은 주문일자 포함 이후만 가능합니다.';
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = 'Delivery request date is only available after the order date is included.';
        //   }
        //   this.utilService.notify_error(msg);
        //   return;
        // }

        // const temp = this.changes;
        // for (const change of temp) {
        //
        //   if (change.type !== 'insert') {
        //     continue;
        //   }
        //   const data = await this.popupGrid.instance.byKey(change.key);
        //   if (!data.ord_amt) {
        //     change.data.ord_amt = data.ord_qty * data.ord_pr;
        //   }
        //
        //   if (!data.ord_vat_amt) {
        //     change.data.ord_vat_amt = change.data.ord_amt * 0.1;
        //
        //   }
        // }
        // this.changes = temp;

        const saveContent = this.popupFormData as Saor020VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

        for (const items of detailList) {
          if (items.operType !== 'remove') {
            if (items.item_cd === '') {
              const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item', '품목', 'Item'));
              this.utilService.notify_error(msg);
              return;
            }
            if (items.ord_qty <= 0) {
              const msg = this.utilService.convert1('requiredInputOrdQty', '주문수량을 1개 이상 입력하세요.');
              this.utilService.notify_error(msg);
              return;
            }
            if (items.ord_pr <= 0) {
              const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.ord_pr', '주문단가', 'Order Price'));
              this.utilService.notify_error(msg);
              return;
            }
          }
        }

        const indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid, 'item_cd');
        if (indexWhenDup > -1) {
          const msg = this.utilService.convert('cannotDuplicateData', this.utilService.convert1('sales.item', '품목', 'Item'));
          this.utilService.notify_error(msg);
          return;
        }

        if (formModified === 'N' && !this.popupGrid.instance.hasEditData()) {
          const msg = this.utilService.convert('noChangedData');
          this.utilService.notify_error(msg);
          return;
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        saveContent.ordItemList = detailList;

        // @ts-ignore
        saveContent.createdby = this.sessionUserId;
        // @ts-ignore
        saveContent.modifiedby = this.sessionUserId;
        // @ts-ignore
        saveContent.formModified = formModified;
        // @ts-ignore
        saveContent.language = this.utilService.getLanguage();
        saveContent.ord_gb = COMMONINITSTR.ORD_GB_RENTAL;

        result = await this.service.mainSave(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
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
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // row별 Edit 제어
  onEditorPreparing(e, grid): void {
    if (e.dataField === 'item_cd' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.uid ? true : false;
    }
  }

  // 주문일자 변경시 - 계약번호 변경
  onValueChangedOrdDt(e): void {
    if (this.popupFormData.ord_no) {
      return;
    }

    if (this.suspendOrdDtValueChagned) {
      this.suspendOrdDtValueChagned = false;
      return;
    }

    if (this.changes.length > 0) {
      this.suspendOrdDtValueChagned = true;
      this.popupForm.instance.getEditor('ord_dt').option('value', e.previousValue);
      this.bizService.alertCannotChangeValue('ord_dt');
      return;
    }

    if (this.popupMode === 'Add') {
      this.popupFormData.std_rate = 1;
      this.popupFormData.cont_no = null;
      this.dsItemCd = []; // 품목
      this.dsContNo = [];

      this.rentEndDt.value = null;
      this.popupFormData.rent_end_dt = null;
      this.setContRentalPeriodValue(null);
    }

    if (e.value) {
      this.fetchContNo(this.G_TENANT, '2', this.popupFormData.expt_cd, this.popupFormData.impt_cd, e.value);
    }
  }

  /**
   * 수출사 변경시
   */
  onSelectionChangedExptCd(e): void {
    console.log('====onSelectionChangedExptCd======');

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (!e || !e.event) {
      return;
    }
    if (this.changes.length > 0) {
      this.suspendValueChagned = true;
      this.popupForm.instance.getEditor('expt_cd').option('value', e.previousValue);
      this.bizService.alertCannotChangeValue('expt_cd', '2');
      return;
    }

    if (this.popupMode === 'Add') {
      // 거래처(수출사)선택시 - 파트너사 초기화
      this.popupFormData.std_rate = 1;
      this.popupFormData.cont_no = null;
      this.dsItemCd = []; // 품목
      this.dsContNo = [];

      this.popupFormData.impt_cd = null;
      this.popupFormData.rtn_ptrn_cd = null;
      this.dsRtnPtrnCd = [];

      this.rentEndDt.value = null;
      this.popupFormData.rent_end_dt = null;
      this.setContRentalPeriodValue(null);

      this.popupFormData.sa_chg_nm = null;
      this.popupFormData.sa_chg_tel_no = null;
      this.popupFormData.zip_no = null;
      this.popupFormData.biz_adr1 = null;
      this.popupFormData.biz_adr2 = null;
      this.popupFormData.eng_biz_adr1 = null;
      this.popupFormData.eng_biz_adr2 = null;
      this.popupFormData.country = null;
    }

    // 수출사 - 계약정보
    if (e && e.value) {
      this.fetchContNo(this.G_TENANT, '2', e.value, this.popupFormData.impt_cd, this.popupFormData.ord_dt);

      const filtered = this.dsExptCd.filter(el => el.expt_cd === e.value);
      if (filtered.length > 0) {
        this.popupFormData.sa_chg_nm = filtered[0].chg_nm;
        this.popupFormData.sa_chg_tel_no = filtered[0].chg_tel_no;
        this.popupFormData.zip_no = filtered[0].zip_no;
        this.popupFormData.biz_adr1 = filtered[0].biz_adr1;
        this.popupFormData.biz_adr2 = filtered[0].biz_adr2;
        this.popupFormData.eng_biz_adr1 = filtered[0].eng_biz_adr1;
        this.popupFormData.eng_biz_adr2 = filtered[0].eng_biz_adr2;
        this.popupFormData.country = filtered[0].country;
      }
    }
  }

  /**
   * 계약번호 조회
   */
  fetchContNo(tenant, contGb, exptCd, imptCd, date): void {

    // 계약번호 초기화
    this.dsContNo = [];

    // 수출사 - 계약정보
    this.bizService.getContNo(tenant, contGb, exptCd, imptCd, date).subscribe(result => {
      if (result.data) {
        this.dsContNo = result.data;
      }
    });
  }

  /**
   * 계약번호 변경시
   */
  onSelectionChangedContNo(e): void {
    this.changes = [];

    const filtered = this.dsContNo.filter(el => el.cont_no === e.value);
    if (filtered.length > 0) {
      this.popupFormData.mony_unit = filtered[0].mony_unit;
      this.popupFormData.std_rate = filtered[0].std_rate;
      this.popupFormData.cont_no = filtered[0].cont_no;
      this.dsItemCd = filtered[0].exptCondItem;
      this.popupFormData.impt_cd = filtered[0].impt_cd;

      // 렌탈기간
      if (Number.isInteger(Number(filtered[0].cont_rental_period))) {
        this.setContRentalPeriodValue(filtered[0].cont_rental_period);

        if (this.popupFormData.rent_st_dt) {
          this.rentEndDt.value = this.addDate(this.popupFormData.rent_st_dt, this.popupFormData.cont_rental_period);
          this.popupFormData.rent_end_dt = this.addDate(this.popupFormData.rent_st_dt, this.popupFormData.cont_rental_period);
        }
      } else {
        this.rentEndDt.value = null;
        this.popupFormData.rent_end_dt = null;
      }

    } else {
      if (this.popupMode === 'Add') {
        this.dsItemCd = [];

        this.popupFormData.impt_cd = null;
        this.popupFormData.rtn_ptrn_cd = null;
        this.dsRtnPtrnCd = [];


        this.rentEndDt.value = null;
        this.popupFormData.rent_end_dt = null;
        this.setContRentalPeriodValue(null);
      }

    }
  }

  addDate(date, days): any {
    if (!date) {
      return null;
    }
    const start = new Date(date);
    const addDate = new Date(start.setDate(start.getDate() + days));

    const mm = addDate.getMonth() + 1;
    const dd = addDate.getDate();

    return [addDate.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');
  }

  onChangedRentStDt(e): void {
    if (!isNaN(this.popupFormData.cont_rental_period)) {
      this.rentEndDt.value = this.addDate(this.popupFormData.rent_st_dt, this.popupFormData.cont_rental_period);
      this.popupFormData.rent_end_dt = this.addDate(this.popupFormData.rent_st_dt, this.popupFormData.cont_rental_period);
    }
  }

  onSelectionChangedImptCd(e): void {
    console.log('====onSelectionChangedImptCd======');

    if (this.suspendImptValueChagned) {
      this.suspendImptValueChagned = false;
      return;
    }

    if (!e) {
      return;
    }

    if (this.changes.length > 0) {
      this.suspendImptValueChagned = true;
      this.popupForm.instance.getEditor('impt_cd').option('value', e.previousValue);
      this.bizService.alertCannotChangeValue('impt_cd');
      return;
    }


    this.dsRtnPtrnCd = this.dsCopyRtnPtrnCd.filter(el => el.impt_cd === (e ? e.value : this.popupFormData.impt_cd));

    if (this.popupMode === 'Add') {
      this.popupFormData.rtn_ptrn_cd = null; // 수입사 선택시 - 회수파트너사 초기화

      if (this.dsRtnPtrnCd.length > 0) {
        this.popupFormData.rtn_ptrn_cd = this.dsRtnPtrnCd[0].cd;
      }
    }

    // 수출사 - 계약정보
    if (e && e.value) {
      this.fetchContNo(this.G_TENANT, '2', this.popupFormData.expt_cd, e.value, this.popupFormData.ord_dt);
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
  showPopup(popupMode, data):
    void {
    this.changes = [];  // 초기화
    this.entityStoreItemGrid = new ArrayStore({data: [], key: this.key});

    this.dsItemGrid = new DataSource({store: this.entityStoreItemGrid});

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.firstPopupData = JSON.stringify(this.popupFormData);
    this.popupMode = popupMode;

    this.popupVisible = true;
    if (this.popupMode === 'Add' && this.popupForm
    ) {
      this.popupForm.instance.resetValues();
    }

    this.onSearchPopup();
  }

  popupShown(e): void {
    this.dsRtnPtrnCd = this.dsCopyRtnPtrnCd.filter(el => el.impt_cd === this.popupFormData.impt_cd);

    this.deleteBtn.visible = true; // 삭제버튼
    this.saveBtn.visible = true; // 저장버튼

    this.popupForm.instance.getEditor('ord_dt').option('disabled', false);
    this.popupForm.instance.getEditor('country').option('disabled', true);
    this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
    this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);
    this.popupForm.instance.getEditor('dg_req_dt').option('disabled', false);
    this.popupForm.instance.getEditor('mony_unit').option('disabled', false);
    this.popupForm.instance.getEditor('std_rate').option('disabled', false);
    this.popupForm.instance.getEditor('sa_chg_nm').option('disabled', false);
    this.popupForm.instance.getEditor('cont_no').option('disabled', false);
    this.popupForm.instance.getEditor('remark').option('disabled', false);
    this.popupForm.instance.getEditor('rtn_ptrn_cd').option('disabled', false);
    this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', false);

    // this.popupForm.instance.getEditor('rent_end_dt').option('disabled', false);

    if (this.popupMode === 'Add') { // 신규
      this.popupForm.instance.resetValues();
      this.popupForm.instance.getEditor('ord_dt').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('dg_req_dt').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('rent_st_dt').option('disabled', false);

      if (this.userGroup === '2') {
        this.popupForm.instance.getEditor('expt_cd').option('value', this.userCompany);
        this.popupForm.instance.getEditor('expt_cd').option('disabled', true);
      }

      // 초기 focus
      this.popupForm.instance.getEditor('ord_dt').focus();
      this.deleteBtn.visible = false;
      this.popupFormData.ptrn_cd = this.utilService.getCompany();
      // 권한별 영업차고
      const data = {
        userId: this.utilService.getUserUid(),
        ptrn_cd: this.popupFormData.ptrn_cd,
      };
      this.bizService.getAuthWarehouseByUserId(data).then(r => {
        this.dsSaWh = r.data;
      });
    } else if (this.popupMode === 'Edit') { // 수정

      // 영업창고
      this.bizService.getSaWh(this.G_TENANT, this.popupFormData.ptrn_cd).subscribe(result => {
        this.dsSaWh = result.data;
      });

      this.popupForm.instance.getEditor('ord_dt').option('disabled', true);
      this.popupForm.instance.getEditor('expt_cd').option('disabled', true);

      this.popupForm.instance.getEditor('cont_no').option('disabled', true);
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
      this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', true);

      // 초기 focus
      // this.popupForm.instance.getEditor('ptrn_cd').focus();

      if (this.popupFormData.out_stat === '1') {
        this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
        this.popupForm.instance.getEditor('dg_req_dt').option('disabled', true);
        this.popupForm.instance.getEditor('mony_unit').option('disabled', true);
        this.popupForm.instance.getEditor('std_rate').option('disabled', true);
        this.popupForm.instance.getEditor('sa_chg_nm').option('disabled', true);
        this.popupForm.instance.getEditor('cont_no').option('disabled', true);
        this.popupForm.instance.getEditor('remark').option('disabled', true);
        this.popupForm.instance.getEditor('rtn_ptrn_cd').option('disabled', true);
        this.popupForm.instance.getEditor('rent_st_dt').option('disabled', true);
        // this.popupForm.instance.getEditor('rent_end_dt').option('disabled', true);

        this.deleteBtn.visible = false;
        this.saveBtn.visible = false;
      }

      this.bizService.getContNo(this.G_TENANT, '2', this.popupFormData.expt_cd, this.popupFormData.impt_cd, this.popupFormData.ord_dt).subscribe(result => {
        this.dsContNo = result.data;
        const filtered = this.dsContNo.filter(el => el.cont_no === this.popupFormData.cont_no);
        if (filtered.length > 0) {

          // 렌탈기간
          if (Number.isInteger(Number(filtered[0].cont_rental_period))) {
            this.setContRentalPeriodValue(filtered[0].cont_rental_period);
          }
        }
      });
    }

    this.popupForm.instance.getEditor('country').option('disabled', this.popupFormData.out_stat === '1');
    this.popupForm.instance.getEditor('zip_no').option('disabled', this.popupFormData.out_stat === '1');
    this.popupForm.instance.getEditor('biz_adr1').option('disabled', this.popupFormData.out_stat === '1');
    this.popupForm.instance.getEditor('biz_adr2').option('disabled', this.popupFormData.out_stat === '1');
    this.popupForm.instance.getEditor('eng_biz_adr1').option('disabled', this.popupFormData.out_stat === '1');
    this.popupForm.instance.getEditor('eng_biz_adr2').option('disabled', this.popupFormData.out_stat === '1');
    this.popupForm.instance.getEditor('sa_chg_nm').option('disabled', this.popupFormData.out_stat === '1');
    this.popupForm.instance.getEditor('sa_chg_tel_no').option('disabled', this.popupFormData.out_stat === '1');
    this.address.visible = this.popupFormData.out_stat !== '1';

    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // 세트 상품여부
  setSetItemYn(rowData: any): any {
    const filtered = this.dsFullitemCd.filter(el => el.item_cd === rowData.item_cd);
    rowData.set_item_yn = filtered.length > 0 ? filtered[0].set_item_yn : null;
    return filtered.length > 0 ? filtered[0].set_item_yn : null;
  }

  // 품목변경시 단가세팅
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    // rowData.bom = null; // BOM 초기화
    rowData.item_cd = value;

    // 세트상품 여부
    const filtered = this.dsFullitemCd.filter(el => el.item_cd === value);
    rowData.set_item_yn = filtered.length > 0 ? filtered[0].set_item_yn : null;

    // 가용재고
    rowData.ava_sto_qty = await this.calcAvaStoQty(rowData.item_cd);

    // 부가세율
    rowData.expt_vat = await this.bizService.getVat(this.popupFormData.cont_no, value);

    // 주문단가
    rowData.ord_pr = await this.bizService.getOrdPr(this.G_TENANT, this.popupFormData.cont_no, value);
  }

  /**
   * 가용재고 계산
   */
  async calcAvaStoQty(itemCd: string): Promise<number> {
    let result = 0;

    // 가용재고
    const ptrnCd = this.popupFormData.ptrn_cd;
    const saWhCd = this.popupFormData.sa_wh_cd;
    if (ptrnCd && saWhCd && itemCd
    ) {
      result = await this.bizService.getInvQty(this.popupFormData.ptrn_cd, this.popupFormData.sa_wh_cd, itemCd, this.G_TENANT, 'N');
    }
    return result;
  }

  onValueChangedSaWhCd(e): void {
    if (!e || !e.event) {
      return;
    }

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (this.changes.length > 0) {
      this.suspendValueChagned = true;
      this.popupForm.instance.getEditor('sa_wh_cd').option('value', e.previousValue);
      this.bizService.alertCannotChangeValue('sa_wh_cd');
      return;
    }
  }

// grid edit 제어
  allowEditing(e): boolean {
    return (this.popupFormData.out_stat === '1') ? false : true;
  }

// 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;

    // 재조회
    // this.onSearch();
  }

// 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));
      if (!await this.utilService.confirm(confirmMsg)
      ) {
        return;
      }

      const deleteContent = this.popupFormData as Saor020VO;
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
    if (!this.popupFormData.ord_dt) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.ord_dt', '주문일자', 'Order Date'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('ord_dt').focus();
      return;
    }
    if (!this.popupFormData.expt_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.expt_cd', '수출사', 'Exporter'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('expt_cd').focus();
      return;
    }
    if (!this.popupFormData.cont_no) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cont_no', '계약번호', 'Contract No'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('cont_no').focus();
      return;
    }
    if (!this.popupFormData.ptrn_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.ptrn_cd', '파트너사', 'Partner'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('ptrn_cd').focus();
      return;
    }

    if (!this.popupFormData.sa_wh_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.sales_wh_nm'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('sa_wh_cd').focus();
      return;
    }

    if (!this.popupFormData.impt_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.impt_cd', '수입사', 'Importer'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('impt_cd').focus();
      return;
    }

    if (this.popupFormData.out_stat !== '1') {  // 작업상태가 주문등록일때만 행추가 가능.
      this.popupGrid.instance.addRow().then(r => {
        const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
        this.setFocusRow(rowIdx, this.popupGrid);
      });
    }
  }

  onInitNewRow(e): void {
    e.data.item_cd = null;
    e.data.ord_qty = 0;
    e.data.ord_pr = 0;
    e.data.ord_vat_amt = 0;
    e.data.damageflg = 'N';
  }

// 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupFormData.out_stat !== '1') {  // 작업상태가 주문등록일때만 행삭제 가능.

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

// 주소변경시
//   comfirmAddress(): void {
  async comfirmAddress(): Promise<any> {
    const addr = this.searchAddress.getInputValue();

    if (this.popupFormData.country === 'KR') {

      // @ts-ignore
      naver.maps.Service.geocode({
        query: addr
      }, (status, response) => {

        // @ts-ignore
        if (status !== naver.maps.Service.Status.OK) {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }

        const result = response.v2; // 검색 결과의 컨테이너
        const items = result.addresses; // 검색 결과의 배열

        if (items.length === 1) {

          let zipCode = '';
          for (const addrElement of items[0].addressElements) {
            if (addrElement.types.includes('POSTAL_CODE')) {
              zipCode = addrElement.longName;
            }
          }

          if (!zipCode) {
            this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
            return;
          }

          this.searchAddress.setInputValue(items[0].roadAddress);  // 전체 주소
          this.popupFormData.eng_biz_adr1 = items[0].englishAddress; // 영문주소
          this.popupFormData.zip_no = zipCode;
          this.popupFormData.biz_adr1 = items[0].roadAddress;

        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    } else {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({
        address: addr,
      }, (results, status) => {
        if (status === 'OK') {
          if (results.length === 1) {

            let zipCode = '';
            for (const addrElement of results[0].address_components) {
              this.popupFormData.eng_biz_adr1 = results[0].formatted_address;
              if (addrElement.types.includes('postal_code')) {
                zipCode = addrElement.long_name;
              }
            }

            if (!zipCode) {
              this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
              return;
            }

            this.searchAddress.setInputValue(results[0].formatted_address);  // 전체 주소
            this.popupFormData.zip_no = zipCode; // 우편번호
            this.popupFormData.biz_adr1 = results[0].formatted_address;

          } else {
            this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
            return;
          }
        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    }
  }

  onChangedCountry(e): void {
    // this.changedCountrycd(e.value);

    // if (this.phoneChangeFlg2) {
    //   const findCode = this.dsCountry.find(el => el.code === this.popupFormData.countrycd);
    //   if (findCode) {
    //     this.popupForm.instance.getEditor('phone1').option('value', findCode.etcColumn1);
    //     // this.popupForm.instance.getEditor('corpPhone1').option('value', '+' + findCode.etcColumn1 + ')');
    //   }
    // }
    // this.phoneChangeFlg2 = true;
  }

// async changedCountrycd(country: string): Promise<void> {
//   if (this.countryFlg) {
//     this.searchWhAddress.resetInput();  // 주소 초기화
//     this.popupFormData.biz_adr2 = '';
//     this.popupFormData.eng_biz_adr1 = '';  // 영문주소
//     this.popupFormData.eng_biz_adr2 = '';
//     this.popupFormData.zip_no = ''; // 우편번호
//     this.popupFormData.sa_chg_nm = '';
//     this.popupFormData.sa_chg_tel_no = '';
//   }
//   this.countryFlg = true;
//
// }

  onSelectionChangedPtrnCd(e): void {
    console.log('====onSelectionChangedPtrnCd======');

    if (!e || !e.event) {
      return;
    }

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (this.changes.length > 0) {
      this.suspendValueChagned = true;
      this.popupForm.instance.getEditor('ptrn_cd').option('value', e.previousValue);
      this.bizService.alertCannotChangeValue('ptrn_cd');
      return;
    }

    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === (e ? e.value : this.popupFormData.ptrn_cd));

    if (this.popupMode === 'Add') {
      this.popupFormData.sa_wh_cd = null; // 거래처(수출사)선택시 - 창고초기화
    }

// 수출사 - 계약정보
    if (e && e.value) {
      this.bizService.getSaWh(this.G_TENANT, e.value).subscribe(result => {
        this.dsSaWh = result.data;
      });
    }
  }

  onHiding(e): void {
    this.changes = [];
    this.popupVisible = false;
  }

  onHidden(e): void {
    this.popupForm.instance.resetValues();
    this.setContRentalPeriodValue(null);
    this.rentEndDt.value = null;
  }

  /**
   *  팝업 메소드 END
   */

  setContRentalPeriodValue(val): void {
    this.popupFormData.cont_rental_period = Number(val);
    this.contRentalPeriod.value = Number(val);
    this.contRentalPeriod.format = '#,##0 day(s)';
  }
}
