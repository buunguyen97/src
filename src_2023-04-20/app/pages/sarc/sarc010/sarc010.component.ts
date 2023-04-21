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
import {Sarc010Service, Sarc010VO, formData} from './sarc010.service';

@Component({
  selector: 'app-sarc010',
  templateUrl: './sarc010.component.html',
  styleUrls: ['./sarc010.component.scss']
})
export class Sarc010Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sarc010Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.onNew = this.onNew.bind(this);

    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.allowEditing = this.allowEditing.bind(this);

    this.onSelectionChangedWhCd = this.onSelectionChangedWhCd.bind(this);
    this.onSelectionChangedRtnPtrnCd = this.onSelectionChangedRtnPtrnCd.bind(this);

    this.onSelectionImptCd = this.onSelectionImptCd.bind(this);
    this.onSelectionExptCd = this.onSelectionExptCd.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.calcCurtQty = this.calcCurtQty.bind(this);
    // this.onSelectionChangedContNo = this.onSelectionChangedContNo.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromRtnOrdDate', {static: false}) fromRtnOrdDate: DxDateBoxComponent;
  @ViewChild('toRtnOrdDate', {static: false}) toRtnOrdDate: DxDateBoxComponent;

  @ViewChild('fromRentEndDate', {static: false}) fromRentEndDate: DxDateBoxComponent;
  @ViewChild('toRentEndDate', {static: false}) toRentEndDate: DxDateBoxComponent;
  @ViewChild('address', {static: false}) address: DxButtonComponent;

  dsOrdGb = [];  // 주문구분
  dsExptCd = []; // 거래처(수출사)
  dsPtrnCd = []; // 수출사
  dsImptCd = []; // 수입사
  // dsCopyRtnPtrnCd = []; // 수입사-회수파트너사
  dsRtnPtrnCd = []; // 수입사-회수파트너사
  dsGridWhCd = []; // 센터(창고마스터)
  dsWhCd = []; // 센터(창고마스터)
  dsCopyWhCd = []; // 센터(창고마스터)
  dsMonyUnit = []; // 화폐
  dsItemCd = []; // 품목
  dsOutItemIngStat = [];
  dsUser = []; // 사용자
  dsSaWh = []; // 영업창고
  dsCountry = [];
  dsCopySaWh = []; // 영업창고
  dsWh = [];
  dsContNo = [];
  dsFullitemCd = [];

  selectedRows: number[];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;
  imptCount: any;

  mainFormData: Sarc010VO = {} as Sarc010VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  dsSubGrid: DataSource;
  entityStoreSubGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = this.utilService.convert1('sales.rtn_ord', '회수요청', 'Return Order'); // "회수요청";
  popupFormData: formData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  deleteRowList = [];
  changes = [];
  subChanges = [];
  key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sarc_sarc010_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');
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
      return document.getElementsByName('rtn_adr1').item(0) as HTMLInputElement;
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

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 주문구분
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
      {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
      {cd: '3', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')}];

    this.dsOutItemIngStat = [{cd: '', nm: this.utilService.convert1('sales.all', '전체', 'ALL')},
      {cd: 'ING', nm: this.utilService.convert1('sales.incomplete', '미완료', 'Incomplete')},
      {cd: 'CMPL', nm: this.utilService.convert1('sales.complete', '완료', 'Complete')}];

    // 수출사
    if (this.userGroup === '3') {
      this.service.getExptPtrn(this.G_TENANT, this.userCompany).subscribe(result => {
        this.dsExptCd = result.data;
      });
    } else {
      this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
        this.dsExptCd = result.data;
      });
    }

    // getSaWhList
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopySaWh = result.data;
    });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    // 수입사
    // this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
    //   this.dsImptCd = result.data;
    // });

    // 수입사 - 파트너사
    if (this.utilService.getCompany() === 'O1000') {
      this.bizService.getImptPtrn(this.G_TENANT).subscribe(result => {
        this.dsImptCd = result.data;
      });
    } else {
      this.bizService.getImptPtrn(this.G_TENANT, this.utilService.getCompany()).subscribe(result => {
        this.dsImptCd = result.data;
      });
    }

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
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
      this.dsFullitemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 계약번호
    this.bizService.getContNo(this.G_TENANT, '2', '', '', '').subscribe(result => {
      this.dsContNo = result.data;
      // const filtered = this.dsContNo.filter(el => el.cont_no === this.popupFormData.cont_no);
      // if (filtered.length > 0) {
      //
      //   // 렌탈기간
      //   if (Number.isInteger(Number(filtered[0].cont_rental_period))) {
      //     this.popupFormData.cont_rental_period = Number(filtered[0].cont_rental_period);
      //     this.contRentalPeriod.value = filtered[0].cont_rental_period;
      //   }
      // }
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
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
    const rangeDate = this.utilService.getDateRange();

    this.fromRtnOrdDate.value = rangeDate.fromDate;
    this.toRtnOrdDate.value = rangeDate.toDate;
    // this.fromRentEndDate.value = rangeDate.fromDate;
    // this.toRentEndDate.value = rangeDate.toDate;

    if (this.userGroup === '2') {
      this.mainForm.instance.getEditor('exptCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('exptCd').option('disabled', true);
    }

    if (this.userGroup === '3') {
      this.mainForm.instance.getEditor('rtnPtrnCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('rtnPtrnCd').option('disabled', true);
    }
  }

  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromRtnOrdDate = document.getElementsByName('fromRtnOrdDate').item(1).getAttribute('value');
      this.mainFormData.toRtnOrdDate = document.getElementsByName('toRtnOrdDate').item(1).getAttribute('value');
      // this.mainFormData.fromOutDate = document.getElementsByName('fromRentEndDate').item(1).getAttribute('value');
      // this.mainFormData.toOutDate = document.getElementsByName('toRentEndDate').item(1).getAttribute('value');

      // Sub 그리드 비우기.
      if (!!this.dsSubGrid) {
        this.entityStoreSubGrid.clear();
        this.dsSubGrid.reload();
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

  // 조회
  // async onSearchSub(key: string, outOrdNo: string, tenant: string): Promise<void> {
  //   if (outOrdNo) {
  //     // Service의 get 함수 생성
  //     const result = await this.service.subList({uid: key, out_ord_no: outOrdNo, tenant});
  //
  //     // 조회 결과가 success이면 화면표시, 실패면 메시지 표시
  //
  //     if (!result.success) {
  //       this.utilService.notify_error(result.msg);
  //       return;
  //     } else {
  //       this.subGrid.instance.cancelEditData();
  //       this.utilService.notify_success('search success');
  //       // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
  //       this.entityStoreSubGrid = new ArrayStore(
  //         {
  //           data: result.data,
  //           key: this.key
  //         }
  //       );
  //       // ArrayStore - DataSource와 바인딩.
  //       // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
  //       this.dsSubGrid = new DataSource({
  //         store: this.entityStoreSubGrid
  //       });
  //       // 그리드 상태가 수시로 저장되어 포커스가 있을경우 해당 포커스로 강제 페이지 이동되기 때문에, 그리드의 포커스 없앰
  //       // 페이징번호도 강제로 1페이지로 Fix
  //       // 참고 : grid1은 HTML에서 그리드의 이름이 #grid1로 명시되어 있으며, Behind 상단에 @ViewChild에 DxDataGridComponent로 선언되어 있음.
  //       this.subGrid.focusedRowKey = null;
  //       this.subGrid.paging.pageIndex = 0;
  //     }
  //   }
  // }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupFormData.uid) {

      const para: any = this.popupFormData;
      para.popup_mode = this.popupMode;

      const result = await this.service.mainInfo(para);

      // this.bizService.getContNo(this.G_TENANT, '2', this.popupFormData.expt_cd, this.popupFormData.impt_cd, '').subscribe(r => {
      //   this.dsContNo = r.data;
      // });
      // this.popupFormData.cust_cont = result.data.info.cust_cont;

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        // 팝업 폼 데이터 세팅
        this.popupFormData = result.data.info;
        this.firstPopupData = JSON.stringify(this.popupFormData);

        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.rtnItemList,
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

    // this.dsRtnPtrnCd = this.dsRtnPtrnCd.filter(el => el.impt_cd === (this.popupFormData.impt_cd));
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 주문할당으로 팝업(POPUP) 띄우기  이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }


  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {
    let msg;
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '품목 목록을 추가하세요.'
      msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item_cd', '품목', 'Item'));  // '품목'
      this.utilService.notify_error(msg);
      return;
    }

    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) return;

    const saWhImptCheck = this.bizService.getSaWhImptCheck(this.G_TENANT, this.popupFormData.impt_cd).subscribe(async (r) => {
      this.imptCount = r.data[0];

      if (this.imptCount.count <= 0) {
        this.utilService.notify_error(this.utilService.convert1('sales.sarc010_imptSaWhNull', '수입사 지정 영업창고가 없습니다.', 'There is no importer-designated sales warehouse.'));
        return;
      }

      try {
        let result;
        // let sendResult;
        const lastPopupData: string = JSON.stringify(this.popupFormData);
        let formModified = 'N';

        if (this.firstPopupData !== lastPopupData) {
          formModified = 'Y';
          console.log('diff');
        } else {
          console.log('same');
        }

        const today: string = this.gridUtil.getToday().replace(/-/gi, '');
        // const outDt: string = this.popupForm.instance.getEditor('out_dt').option('value').replace(/-/gi, '');  // 출고일자
        const rtnOrdDt: string = this.popupForm.instance.getEditor('rtn_ord_dt').option('value').replace(/-/gi, ''); // 회수지시일자


        // const rtnScheDt: string = this.popupForm.instance.getEditor('rtn_sche_dt').option('value').replace(/-/gi, '');  // 회수예정일자
        // if (rtnScheDt < rtnOrdDt) {
        //   msg = '회수예정일은 회수지시일 포함 이후만 가능합니다.';
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = 'The scheduled collection date is only available after the order date is included.';
        //   }
        //   this.utilService.notify_error(msg);
        //   this.popupForm.instance.getEditor('rtn_ord_dt').focus();
        //   return;
        // }
        // if (this.popupMode === 'Add' && rtnOrdDt < outDt) {
        //   msg = '회수지시일은 출고일자 포함 이후만 가능합니다.';
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = 'Collection instruction date is only available after the out date is included.';
        //   }
        //   this.utilService.notify_error(msg);
        //   this.popupForm.instance.getEditor('rtn_ord_dt').focus();
        //   return;
        // }
        // if (this.popupMode === 'Add' && rtnOrdDt < today) {
        //   msg = '회수요청일은 당일 포함 이후만 가능합니다.';
        //   if (this.utilService.getLanguage() !== 'ko') {
        //     msg = 'Collection instruction date is only available after inclusion on the day.';
        //   }
        //   this.utilService.notify_error(msg);
        //   this.popupForm.instance.getEditor('rtn_ord_dt').focus();
        //   return;
        // }

        const saveContent = this.popupFormData as unknown as Sarc010VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

        /*for( const items of detailList ) {
          let outQty:number    = items.out_qty>>>0;
          let rtnOrdQty:number = (items.old_rtn_ord_qty>>>0) + (items.rtn_ord_qty>>>0);

          if( outQty > rtnOrdQty ) {
            var msg = "출고수량을 초과할 수 없습니다.";
             if( this.utilService.getLanguage()!='ko' ) {
                 msg = "Forwarding out quantity cannot be exceeded.";
             }
            this.utilService.notify_error(msg);
            return;
          }
        }*/
        // 회수지시수량
        let totRtnOrdQty = 0;
        for (const items of this.popupGrid.instance.getVisibleRows()) {
          // tslint:disable-next-line:no-bitwise
          totRtnOrdQty += items.data.rtn_ord_qty >>> 0;
        }

        if (totRtnOrdQty < 1) {
          msg = '회수요청수량을 1개 이상 입력하세요.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Please enter at least one quantity to indicate.';
          }
          this.utilService.notify_error(msg);
          return;
        }

        if (formModified === 'N' && !this.popupGrid.instance.hasEditData()) {
          msg = '변경항목이 없습니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'There are no changes.';
          }
          this.utilService.notify_error(msg);
          return;
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save')); // "저장"
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        saveContent.rtnItemList = detailList;

        saveContent["createdby"] = this.sessionUserId;
        saveContent["modifiedby"] = this.sessionUserId;
        saveContent["formModified"] = formModified;

        console.log(saveContent);
        result = await this.service.mainSave(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {

          // if( saveGb=="rtnModify" ) {
          //  // 물류 품목 송신 I/F
          //  sendResult = await this.bizService.sendApi({sendType:"outOrd", outOrdNo:this.popupFormData.out_ord_no});
          //
          //  if( !sendResult.success ) {
          //    this.utilService.notify_error(JSON.stringify(sendResult));
          //    //return;
          //  }
          //  else {
          //    console.log("I/F Success");
          //  }
          // }
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    });
  }


  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 회수파트너사변경시
  onSelectionChangedRtnPtrnCd(e): void {
    if (!e) return;
    // this.popupFormData.wh_cd = '';
    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === (e ? e.value : this.popupFormData.rtn_ptrn_cd));

    console.log(this.dsSaWh);
    if (this.dsSaWh.length > 0) {
      this.popupFormData.sa_wh_cd = this.dsSaWh[0].cd;
    } else {
      this.popupFormData.rtn_adr1 = '';
      this.popupFormData.rtn_adr2 = '';
      this.popupFormData.zip_no = '';
      this.popupFormData.countrycd = '';
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
    this.popupMode = popupMode;

    // 팝업 버튼 보이기 정리
    this.deleteBtn.visible = false; // 삭제버튼
    this.saveBtn.visible = false; // 저장버튼
    this.popupVisible = true;

    if (this.popupMode === 'Add') { // 주문할당
      this.deleteBtn.visible = false; // 삭제버튼
      this.saveBtn.visible = true; // 저장버튼

    } else { // 주문확정 'rtnModify'
      if (this.popupFormData.wrk_stat === '1') {
        this.deleteBtn.visible = true; // 삭제버튼
        this.saveBtn.visible = true; // 저장버튼
      }
    }

    if (this.popupMode === 'Add' && this.popupForm) {
      this.popupForm.instance.resetValues();
    }

    this.onSearchPopup();
  }

  popupShown(e): void {
    this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupFormData.rtn_ptrn_cd);
    this.popupForm.instance.getEditor('rtn_ord_no').option('disabled', true);
    this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', false);
    // this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
    // this.popupForm.instance.getEditor('rtn_sche_dt').option('disabled', false);
    // this.popupForm.instance.getEditor('rtn_ptrn_cd').option('disabled', false);
    this.popupForm.instance.getEditor('remark').option('disabled', false);

    if (this.popupMode === 'Add') { // 주문할당
      this.popupModeNm = this.utilService.convert1('sales.rtn_ord', '회수요청', 'Return Order'); // "회수지시";
      this.popupForm.instance.getEditor('rtn_ord_dt').option('value', this.gridUtil.getToday());
      // this.popupForm.instance.getEditor('rtn_sche_dt').option('value', this.gridUtil.getToday());

      // 초기 focus
      this.popupForm.instance.getEditor('rtn_ord_dt').focus();
    } else {
      this.popupModeNm = this.utilService.convert1('sales.rtn_ord_update', '회수요청수정', 'Return Order Update');
      this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', true);

      // 작업상태(1:회수지시,2:지시확정,3:회수)
      if (this.popupFormData.wrk_stat !== '0' && this.popupFormData.wrk_stat !== '1') {
        // this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
        // this.popupForm.instance.getEditor('rtn_sche_dt').option('disabled', true);
        this.popupForm.instance.getEditor('rtn_ptrn_cd').option('disabled', true);
        this.popupForm.instance.getEditor('remark').option('disabled', true);
      }

      this.bizService.getImptPtrn(this.G_TENANT, '', this.popupFormData.impt_cd).subscribe(result => {
        this.dsRtnPtrnCd = result.data;
      });
      // 초기 focus
      // this.popupForm.instance.getEditor('rtn_sche_dt').focus();
    }
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  // 작업상태 표현식  작업상태(1:회수지시,2:지시확정,3:회수)
  wrkStatNm(rowData): any {
    let nm = '';
    if (rowData.wrk_stat === '1') {
      nm = '회수지시';
    } else if (rowData.wrk_stat === '2') {
      nm = '지시확정';
    } else if (rowData.wrk_stat === '3') {
      nm = '회수';
    }

    return nm;
  }

  // grid edit 제어
  allowEditing(e): any {
    let bEdit = true;
    if (this.popupFormData.wrk_stat !== '0'
      && this.popupFormData.wrk_stat !== '1') {
      bEdit = false;
    }
    return bEdit;
  }

  // 추가버튼 이벤트
  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.popupGrid.focusedRowIndex = rowIdx;
    });
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {

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

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));  // "삭제"
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const deleteContent = this.popupFormData as unknown as Sarc010VO;
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

  // 창고변경시 가용재고를 위해 품목목록 재조회
  async onSelectionChangedWhCd(e): Promise<void> {
    if (e.value === null) {
      return;
    }

    // const findWarehouse = this.dsCopySaWh.filter(el => el.cd === e.value);
    // console.log(findWarehouse);
    // if (findWarehouse && findWarehouse.length > 0) {
    //   // this.popupFormData.countrycd = findWarehouse[0].countrycd; // 소문자 'kr'은 안나옴
    //   this.popupFormData.rtn_adr1 = findWarehouse[0].addresslocal1;
    //   this.popupFormData.rtn_adr2 = findWarehouse[0].addresslocal2;
    //   this.popupFormData.zip_no = findWarehouse[0].zip;
    //   this.popupFormData.countrycd = findWarehouse[0].countrycd;

      // if (!findWarehouse[0].pwh_cd) {
      //   const errorMsg = this.utilService.convert1('pwhcdNull', '물류창고가 없습니다.');
      //   this.utilService.notify_error(errorMsg);
      //   return;
      // }
    // } else {
    //   this.popupFormData.rtn_adr1 = '';
    //   this.popupFormData.rtn_adr2 = '';
    //   this.popupFormData.zip_no = '';
    //   this.popupFormData.countrycd = '';
    // }
  }

  // console.log('onSelectionChangedWhCd >>>>');
  // // console.log(e.event);
  // // if (!e.event) return;
  //
  // const para: any = this.popupFormData;
  // para.popup_mode = this.popupMode;
  //
  // const result = await this.service.getWhList(para);
  //
  // console.log(result);
  // if (!result.success) {
  //   this.utilService.notify_error(result.msg);
  //   return;
  // } else {
  //   this.popupGrid.instance.cancelEditData();
  //   this.utilService.notify_success('search success');
  //
  //   this.entityStoreItemGrid = new ArrayStore(
  //     {
  //       data: result.data,
  //       key: this.key
  //     }
  //   );
  //   // ArrayStore - DataSource와 바인딩.
  //   // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
  //   this.dsItemGrid = new DataSource({
  //     store: this.entityStoreItemGrid
  //   });
  // }


  onInitNewRow(e): void {
    // e.data.item_cd = "";
    // e.data.ord_qty = 0;
    // e.data.ord_pr = 0;
  }

  // 수입사 변경시
  onSelectionImptCd(e): void {
    if (e.value) {
      this.bizService.getImptPtrn(this.G_TENANT, '', e.value).subscribe(result => {
        this.dsRtnPtrnCd = result.data;
        if (result.data.length > 0) {
          this.popupFormData.rtn_ptrn_cd = result.data[0].cd;
        }
      });

      this.bizService.getItemExptImpt(this.G_TENANT, e.value, this.popupFormData.expt_cd).subscribe(result => {
        this.dsItemCd = result.data;
      });

      this.bizService.getExptImpt(this.G_TENANT, e.value).subscribe(result => {
        this.dsExptCd = result.data;
      });
      // this.bizService.getContNo(this.G_TENANT, '2', this.popupFormData.expt_cd, e.value, '').subscribe(result => {
      //   this.dsContNo = result.data;
      // });

      const filtered = this.dsImptCd.filter(el => el.impt_cd === e.value);
      if (filtered.length > 0) {
        console.log(filtered[0]);

        this.popupFormData.rtn_adr1 = filtered[0].wh_biz_adr1;
        this.popupFormData.rtn_adr2 = filtered[0].wh_biz_adr2;
        this.popupFormData.zip_no = filtered[0].wh_zip_no;
        this.popupFormData.countrycd = filtered[0].wh_country;

      }

    }
  }

  // 수출사 변경시
  onSelectionExptCd(e): void {

    if (this.popupForm.instance.getEditor('expt_cd').option('value')) {
      this.bizService.getItemExptImpt(this.G_TENANT, this.popupFormData.impt_cd, e.value).subscribe(result => {
        this.dsItemCd = result.data;
      });

      // this.bizService.getContNo(this.G_TENANT, '2', e.value, this.popupFormData.expt_cd, '').subscribe(result => {
      //   this.dsContNo = result.data;
      // });
    }
  }

  async setItemCdValue(rowData: any, value: any): Promise<void> {
    rowData.bom = null; // BOM 초기화
    rowData.item_cd = value;

    // 세트상품 여부
    const filtered = this.dsFullitemCd.filter(el => el.item_cd === value);
    rowData.set_item_yn = filtered.length > 0 ? filtered[0].set_item_yn : null;

    // 가용재고
    // rowData.curt_qty = await this.calcCurtQty(rowData.item_cd);
  }

  /**
   * 가용재고 계산
   */
  async calcCurtQty(itemCd: string): Promise<any> {
    let saWhImpt;
    let invQty = 0;

    // 가용재고
    const ptrnCd = this.popupFormData.impt_cd;
    const owner = this.popupFormData.expt_cd;
    const result = await this.bizService.getImptSaWh(this.G_TENANT, ptrnCd).toPromise();

    saWhImpt = result.data.length > 0 ? result.data[0].cd : 0;

    if (ptrnCd && saWhImpt && itemCd) {
      invQty = await this.bizService.getImptInvQty(ptrnCd, saWhImpt, itemCd, this.G_TENANT, 'N', owner);
    }

    return invQty;
  }


  // 주소변경시
  async comfirmAddress(): Promise<any> {
    const addr = this.searchAddress.getInputValue();

    if (this.popupFormData.countrycd === 'KR') {

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
          this.popupFormData.zip_no = zipCode;
          this.popupFormData.rtn_adr1 = items[0].roadAddress;
          this.popupFormData.rtn_adr2 = '';
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
            this.popupFormData.rtn_adr1 = results[0].formatted_address;
            this.popupFormData.rtn_adr2 = '';

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

  /**
   * 계약번호 변경시
   */
  // onSelectionChangedContNo(e): void {
  //
  //   this.changes = [];
  //   const filtered = this.dsContNo.filter(el => el.cont_no === e.value);
  //   if (filtered.length > 0) {
  //     this.popupFormData.rtn_ptrn_cd = filtered[0].rtn_ptrn_cd;
  //     this.dsItemCd = filtered[0].exptCondItem;
  //   } else {
  //     if (this.popupMode === 'Add') {
  //       this.dsItemCd = [];
  //     }
  //   }
  // }

  /**
   *  팝업 메소드 END
   */

}
