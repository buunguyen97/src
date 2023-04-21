import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor200Service, Saor200VO} from './saor200.service';
import {DxTreeViewComponent} from 'devextreme-angular/ui/tree-view';

@Component({
  selector: 'app-saor200',
  templateUrl: './saor200.component.html',
  styleUrls: ['./saor200.component.scss']
})
export class Saor200Component implements OnInit, AfterViewInit {

  constructor(
    public utilService: CommonUtilService,
    public gridUtil: GridUtilService,
    private service: Saor200Service,
    private codeService: CommonCodeService,
    private bizService: BizCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);

    this.popupCancelClick2 = this.popupCancelClick2.bind(this);
    this.popupSaveClick2 = this.popupSaveClick2.bind(this);
    this.onPopup2 = this.onPopup2.bind(this);
    this.popupShown2 = this.popupShown2.bind(this);

    this.onSelectionChangedExptCd = this.onSelectionChangedExptCd.bind(this);
    this.onSelectionChangedOrdNo = this.onSelectionChangedOrdNo.bind(this);
    this.onSelectionChangedPtrn = this.onSelectionChangedPtrn.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.setOrdPr = this.setOrdPr.bind(this);
    this.isExptOk = this.isExptOk.bind(this);
    this.getOrdNoList = this.getOrdNoList.bind(this);
    this.onSelectionChangedSaWhCd = this.onSelectionChangedSaWhCd.bind(this);
    this.showPopup2 = this.showPopup2.bind(this);
    this.onItemSearch2 = this.onItemSearch2.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popup2', {static: false}) popup2: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupGrid2', {static: false}) popupGrid2: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('subForm', {static: false}) subForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  @ViewChild('fromDate', {static: false}) fromDate: DxDateBoxComponent;
  @ViewChild('toDate', {static: false}) toDate: DxDateBoxComponent;
  @ViewChild('address', {static: false}) address: DxButtonComponent;
  @ViewChild(DxTreeViewComponent, {static: false}) treeView;

  dsExptCd = []; // 거래처(수출사)
  dsMainPtrnCd = []; // 수출사-파트너사
  dsPtrnCd = []; // 수출사-파트너사
  dsCopyPtrnCd = []; // 수출사-파트너사
  dsMonyUnit = []; // 화폐
  dsOutStat = []; // 주문단계
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsSaWh = []; // 영업창고
  dsCopySaWh = []; // 수출사 - 영업창고
  dsRfr = []; // 반품사유
  dsCountry = []; // 국가
  dsCopyOutNo = []; // 출고번호1
  dsOutNo = []; // 출고번호2
  dsCopyOrdNo = []; // 주문번호1
  dsOrdNo = []; // 주문번호2
  dsCountry2 = []; // 국가2
  dsWrkStat = []; // 작업상태

  dsExptCdAll = []; // 전체수출사
  dsPtrnCdAll = []; // 전체파트너사
  dsOrdGb = []; // 주문구분

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Saor200VO = {} as Saor200VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupVisible2 = false;
  popupMode = 'Add';
  popupFormData: Saor200VO;
  popupFormData2: { exptCd: string; ptrnCd: string; saWhCd: string; tenant: any };
  subFormData: { fromDate: string; exptCd: string; ordNo: string; ptrnCd: string; toDate: string; outOrdNo: string; tenant: any };
  firstPopupData = '';

  dsYN = [];

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  // popup detail grid2
  dsOrdGrid: DataSource;
  entityStoreOrdGrid: ArrayStore;

  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  key = 'uid';
  key2 = 'item_cd';
  key3 = 'ord_no';

  // Grid State
  GRID_STATE_KEY = 'saor_saor200_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  // 계약사 - 계약번호
  suspendValueChagned = false;
  treeBoxValue = ['4', '5', '6'];

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
      return document.getElementsByName('dg_adr1').item(0) as HTMLInputElement;
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

  ngOnInit(): void {
    // 작업상태
    this.codeService.getCode(this.G_TENANT, 'RTNSTAT').subscribe(result => {
      this.dsWrkStat = result.data;
    });

    // 반품사유
    this.codeService.getCode(this.G_TENANT, 'BPCODE').subscribe(result => {
      this.dsRfr = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    }); // 사용여부

    // 수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
      this.dsExptCd = result.data;
    });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsMainPtrnCd = result.data;
    });

    // 수출사 - 파트너사
    this.bizService.getExptPtrn(this.G_TENANT).subscribe(result => {
      this.dsCopyPtrnCd = result.data;
    });

    // 거래처 - 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopySaWh = result.data;
    });


    this.codeService.getCode(this.G_TENANT, 'RTNORDGB').subscribe(result => {
      this.dsOrdGb = result.data;
    });

    // this.dsOrdGb = [{cd: '4', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
    //   {cd: '5', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
    //   {cd: '6', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')}];

    // 거래처 - 주문번호
    // this.bizService.getOrdNo(this.G_TENANT).subscribe(result => { this.dsCopyOrdNo = result.data; });

    // 거래처 + 주문번호 - 출고번호
    // this.bizService.getOutNo(this.G_TENANT).subscribe(result => { this.dsCopyOutNo = result.data; });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '1', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => {
      this.dsExptCdAll = result.data;
    });

    // 전체파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => {
      this.dsPtrnCdAll = result.data;
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

    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {

    // 공통 조회 조건 set
    // this.mainForm.instance.getEditor('fromOrdDate').option('value', this.gridUtil.getToday());
    // this.mainForm.instance.getEditor('toOrdDate').option('value', this.gridUtil.getToday());

    this.mainForm.instance.getEditor('outStat').option('value', '0'); // 반품등록

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

      this.mainFormData.ordGbList = this.treeBoxValue;
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

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    // Service의 get 함수 생성
    // console.log("this.popupFormData");

    if (this.popupFormData.bp_code) {
      const result = await this.service.detailList(this.popupFormData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.ordItemList,
            key: this.key2
          }
        );
        this.dsItemGrid = new DataSource({
          store: this.entityStoreItemGrid
        });
        this.popupGrid.focusedRowKey = null;
        // this.popupGrid.paging.pageIndex = 0;
      }
    }


    // 수출사계약 품목 목록 조회.
    this.bizService.exptContItemList(this.G_TENANT, this.popupFormData.cont_no).subscribe(result => {
      this.dsItemCd = result.data;
    });
  }

  // 팝업 데이터 호출(수출사파트너사 정보)
  async onItemSearch2(): Promise<void> {
    this.popupFormData.ord_no = null;
    if (this.fromDate && this.fromDate.value) {
      this.subFormData.fromDate = this.fromDate.value as string;
    } else {
      this.subFormData.fromDate = null;
    }
    if (this.toDate && this.toDate.value) {
      this.subFormData.toDate = this.toDate.value as string;
    } else {
      this.subFormData.toDate = null;
    }

    const result = await this.getOrdNoList(this.subFormData.exptCd, this.subFormData.ptrnCd, this.subFormData.fromDate, this.subFormData.toDate, this.subFormData.ordNo, this.subFormData.outOrdNo);
    if (!result.success) {
      return;
    } else {
      this.popupGrid2.instance.cancelEditData();

      this.entityStoreOrdGrid = new ArrayStore({
        data: result.data,
        key: this.key3
      });
      this.dsOrdGrid = new DataSource({
        store: this.entityStoreOrdGrid
      });
      this.popupGrid2.focusedRowKey = null;
      this.popupGrid2.paging.pageIndex = 0;

      const keys = this.popupGrid2.instance.getSelectedRowKeys();
      this.popupGrid2.instance.deselectRows(keys);
    }
  }

  // // 팝업 데이터 호출(수출사파트너사 정보)
  // async onItemSearch3(): Promise<void> {
  //   const result = await this.service.gridInfo2Search(this.subFormData);
  //   if (!result.success) {
  //     return;
  //   } else {
  //     this.subFormData.exptCd = this.popupFormData.expt_cd;
  //     this.popupGrid2.instance.cancelEditData();
  //
  //     this.entityStoreOrdGrid = new ArrayStore({
  //       data: result.data,
  //       key: this.key3
  //     });
  //     this.dsOrdGrid = new DataSource({
  //       store: this.entityStoreOrdGrid
  //     });
  //     this.popupGrid2.focusedRowKey = null;
  //     this.popupGrid2.paging.pageIndex = 0;
  //
  //     const keys = this.popupGrid2.instance.getSelectedRowKeys();
  //     this.popupGrid2.instance.deselectRows(keys);
  //   }
  // }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {out_stat: '0', ...e.data});
  }

  /**
   * 계약 번호 조회 팝업 호출
   */
  async onPopup2(e): Promise<void> {
    if (this.popupMode === 'Add') {
      this.showPopup2({...e.data});
    }
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
        } else {
        }

        const bpDt: string = this.popupForm.instance.getEditor('bp_dt').option('value').replace(/-/gi, '');

        const saveContent = this.popupFormData as Saor200VO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

        // await this.popupGrid.instance.saveEditData();
        const list = this.popupGrid.instance.getVisibleRows().map(el => {
          return el.data;
        });

        let cnt = 0;
        for (const items of list) {
          cnt += items.ord_qty;
        }

        if (cnt === 0) {
          const msg = this.utilService.convert1('requiredInputOrdQty', '주문수량을 1개 이상 입력하세요.');
          this.utilService.notify_error(msg);
          return;
        }

        if (list.length <= 0) {
          const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.item_list'));
          this.utilService.notify_error(msg);
          return;
        }

        for (const l of list) {
          if (!l.rfr) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.rfr'));
            this.utilService.notify_error(msg);
            return;
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

        saveContent.ordItemList = list;
        saveContent.deleteItemList = detailList.filter(el => el.operType === 'remove');

        saveContent.createdby = this.sessionUserId;
        saveContent.modifiedby = this.sessionUserId;
        saveContent.formModified = formModified;
        saveContent.language = this.utilService.getLanguage();

        // console.log(saveContent);
        // console.log(this.popupMode);

        if (this.popupMode === 'Add') {
          console.log(' -- popupmode add start -- ');
          result = await this.service.mainInsert(saveContent);
        } else if (this.popupMode === 'Edit') {
          console.log(' -- popupmode edit start -- ');
          result = await this.service.mainSave(saveContent);
        }

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
    this.entityStoreItemGrid = new ArrayStore({data: [], key: this.key});
    this.dsItemGrid = new DataSource({store: this.entityStoreItemGrid});

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
      e.editorOptions.disabled = e.row.data.uid ? true : false;
    }
  }

  /**
   * 거래처 변경시
   */
  onSelectionChangedExptCd(e): void {
    console.log('====onSelectionChangedExptCd======');
    if (!e) {
      return;
    }

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (this.popupMode === 'Add') {
      this.dsPtrnCd = [];
      this.popupFormData.ptrn_cd = null;

      this.dsSaWh = [];
      this.popupFormData.sa_wh_cd = null;

      this.dsOrdNo = [];
      this.popupFormData.ord_no = null;

      this.dsOutNo = [];
      this.popupFormData.out_ord_no = null;
    }

    // 수출사 - 계약정보
    if (e && e.value) {
      this.dsPtrnCd = this.dsCopyPtrnCd.filter(el => el.expt_cd === e.value);
      this.bizService.appendAlpoterIntoTheDs(this.dsPtrnCd, 'cd', 'nm', 'display');

      // 파트너사
      if (this.dsPtrnCd.length > 0) {
        this.popupFormData.ptrn_cd = this.dsPtrnCd[0].cd;
      }
    }
  }

  /**
   * 파트너사 변경시
   */
  onSelectionChangedPtrn(e): void {
    console.log('====onSelectionChangedPtrn======');

    if (!e) {
      return;
    }

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (this.popupMode === 'Add') {

      this.popupFormData.sa_chg_nm = null;
      this.popupFormData.sa_chg_tel_no = null;

      this.dsSaWh = [];
      this.popupFormData.sa_wh_cd = null;

      this.dsOrdNo = [];
      this.popupFormData.ord_no = null;

      this.dsOutNo = [];
      this.popupFormData.out_ord_no = null;

      this.dsOrdNo = [];
      this.popupFormData.ord_no = null;

      this.dsOutNo = [];
      this.popupFormData.out_ord_no = null;
    }

    // 수출사 - 계약정보
    if (e && e.value) {
      // const filtered = this.dsPtrnCd.filter(el => el.prtn_cd === e.value);
      this.utilService.getCustInfo(e.value).subscribe(r => {
        if (r && r.data) {
          this.popupFormData.sa_chg_nm = r.data.wh_chg_nm;
          this.popupFormData.sa_chg_tel_no = r.data.wh_chg_tel_no;
        }
      });

      // 사용자별 영업창고
      this.bizService.getAuthWarehouseByUserId({userId: this.utilService.getUserUid(), ptrn_cd: e.value}).then(r => {
        this.dsSaWh = r.data;
      });

      this.getOrdNoList(this.popupFormData.expt_cd, this.popupFormData.ptrn_cd, null).then(r => {
        this.dsOrdNo = r.data;
      });
    }
  }

  /**
   * 영업창고 변경시
   */
  onSelectionChangedSaWhCd(e): void {
    console.log('====onSelectionChangedSaWhCd======');

    if (!e || !e.event) {
      return;
    }

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (this.popupMode === 'Add') {

    }

    // 수출사 - 계약정보
    if (e && e.value) {
    }
  }

  // 주문번호
  onSelectionChangedOrdNo(e): void {
    console.log('====onSelectionChangedOrdNo======');
    if (!e) {
      return;
    }

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (this.popupMode === 'Add') {
      this.dsOutNo = [];
      this.popupFormData.out_ord_no = null;

      this.entityStoreItemGrid = new ArrayStore({data: [], key: this.key2});
      this.dsItemGrid = new DataSource({store: this.entityStoreItemGrid});

      this.dsCountry2 = [];
      this.popupFormData.country = null;
      this.popupFormData.addr1 = null;
      this.popupFormData.addr2 = null;
      this.popupFormData.engAddr1 = null;
      this.popupFormData.engAddr2 = null;
      this.popupFormData.zipNo = null;

      this.popupFormData.ord_gb = null;

      this.popupFormData.dg_country = null;
      this.popupFormData.zip_no = null;
      this.popupFormData.dg_adr1 = null;
      this.popupFormData.dg_adr2 = null;
    }

    const ordNo = e.value || this.popupFormData.ord_no;
    // 수출사 - 계약정보
    if (e && ordNo) {
      const filtered = this.dsOrdNo.filter(el => el.cd === ordNo);
      this.popupFormData.ord_gb = filtered.length > 0 ? filtered[0].ord_gb : null;

      this.bizService.getOutNo(this.G_TENANT, ordNo).subscribe(result => {
        this.dsOutNo = result.data;
      });

      if (this.popupMode === 'Add') {
        this.onItemSearch(ordNo).then();
      }

      // 납품국가
      this.bizService.getCountry(this.G_TENANT, ordNo).subscribe(result => {
        this.popupFormData.country = result.data[0]?.cd;
        this.popupFormData.addr1 = result.data[0]?.dg_adr1;
        this.popupFormData.addr2 = result.data[0]?.dg_adr2;
        this.popupFormData.engAddr1 = result.data[0]?.eng_biz_adr1;
        this.popupFormData.engAddr2 = result.data[0]?.eng_biz_adr2;
        this.popupFormData.zipNo = result.data[0]?.zip_no;
      });

      this.bizService.getWhLocationWithOrdNo(this.G_TENANT, ordNo).subscribe(r => {
        if (r && r.data) {
          this.popupFormData.dg_country = r.data.countrycd;
          this.popupFormData.zip_no = r.data.zip;
          this.popupFormData.dg_adr1 = r.data.address1;
          this.popupFormData.dg_adr2 = r.data.address2;
        }
      });

      // const filtered = this.dsPtrnCd.filter(el => el.prtn_cd === e.value);
      this.utilService.getCustInfo(e.value).subscribe(r => {

      });
    }
  }

  /**
   * 주문번호 조회
   */
  async getOrdNoList(exptCd: string, ptrnCd: string, fromDate?: string, toDate?: string, ordNo?: string, outOrdNo?: string): Promise<any> {

    if (exptCd && ptrnCd) {
      const data = {
        expt_cd: exptCd,
        ptrn_cd: ptrnCd,
        fromDate,
        toDate,
        ordNo,
        outOrdNo
      };
      const res = await this.bizService.getOrdNoList(data);
      return res;
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
    if (this.popupMode === 'Add') { // 주문할당
      this.deleteBtn.visible = false; // 삭제버튼
      this.saveBtn.visible = true; // 저장버튼
    } else {
      if (this.popupFormData.out_stat === '0') {
        this.deleteBtn.visible = true;
        this.saveBtn.visible = true;
      } else {
        this.deleteBtn.visible = true;
        this.saveBtn.visible = true;
      }
    }

    this.popupVisible = true;

    if (this.popupMode === 'Add' && this.popupForm) {
      this.popupForm.instance.resetValues();
    }

    this.onSearchPopup();
  }

  showPopup2(data): void {

    if (!this.popupFormData.expt_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cust_cd', '거래처', 'Account'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('expt_cd').focus();
      return;
    }
    if (!this.popupFormData.ptrn_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.ptrn_cd'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('ptrn_cd').focus();
      return;
    }
    // if (!this.popupFormData.sa_wh_cd) {
    //   const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.sales_wh_nm'));
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('sa_wh_cd').focus();
    //   return;
    // }
    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    this.subFormData = {
      tenant: this.G_TENANT,
      exptCd: this.popupFormData.expt_cd,
      ptrnCd: this.popupFormData.ptrn_cd,
      // saWhCd: this.popupFormData.sa_wh_cd,
      fromDate: '',
      toDate: '',
      ordNo: '',
      outOrdNo: '',
    };


    this.popupVisible2 = true;

    this.onItemSearch2();
  }

  popupShown(e): void {
    // this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);

    this.saveBtn.visible = true;
    this.address.visible = true;

    this.popupForm.instance.getEditor('bp_dt').option('disabled', false);
    this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
    this.popupForm.instance.getEditor('ord_no').option('disabled', false);
    this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
    this.popupForm.instance.getEditor('remark').option('disabled', false);
    this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', false);

    this.popupForm.instance.getEditor('country').option('disabled', true);
    this.popupForm.instance.getEditor('addr1').option('disabled', true);
    this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);

    if (this.popupMode === 'Add') {
      this.deleteBtn.visible = false;

      this.popupForm.instance.getEditor('zip_no').option('disabled', false);
      this.popupForm.instance.getEditor('dg_adr1').option('disabled', false);
      this.popupForm.instance.getEditor('dg_adr2').option('disabled', false);
      this.popupForm.instance.getEditor('remark').option('disabled', false);
      this.popupForm.instance.getEditor('bp_cost1').option('disabled', false);
      this.popupForm.instance.getEditor('bp_cost2').option('disabled', false);
      this.popupForm.instance.getEditor('bp_cost3').option('disabled', false);

      this.popupForm.instance.getEditor('bp_cost1').option('value', 0);
      this.popupForm.instance.getEditor('bp_cost2').option('value', 0);
      this.popupForm.instance.getEditor('bp_cost3').option('value', 0);
    }
    if (this.popupMode === 'Edit') { // 수정
      this.deleteBtn.visible = true;
      this.bizService.getAuthWarehouseByUserId({
        userId: this.utilService.getUserUid(),
        ptrn_cd: this.popupFormData.ptrn_cd
      }).then(r => {
        this.dsSaWh = r.data;
      });

      this.dsPtrnCd = this.dsCopyPtrnCd.filter(el => el.expt_cd === this.popupFormData.expt_cd);
      this.bizService.appendAlpoterIntoTheDs(this.dsPtrnCd, 'cd', 'nm', 'display');

      this.getOrdNoList(this.popupFormData.expt_cd, this.popupFormData.ptrn_cd, null).then(r => {
        this.dsOrdNo = r.data;
      });

      this.bizService.getCountry(this.G_TENANT, this.popupFormData.ord_no).subscribe(result => {
        this.popupFormData.country = result.data[0]?.cd;
        this.popupFormData.addr1 = result.data[0]?.dg_adr1;
        this.popupFormData.addr2 = result.data[0]?.dg_adr2;
        this.popupFormData.engAddr1 = result.data[0]?.eng_biz_adr1;
        this.popupFormData.engAddr2 = result.data[0]?.eng_biz_adr2;
        this.popupFormData.zipNo = result.data[0]?.zip_no;
      });

      this.popupForm.instance.getEditor('bp_dt').option('disabled', true);
      this.popupForm.instance.getEditor('expt_cd').option('disabled', true);
      this.popupForm.instance.getEditor('ord_no').option('disabled', true);
      this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', true);

      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);

      this.dsPtrnCd = this.dsCopyPtrnCd.filter(el => el.expt_cd === this.popupFormData.expt_cd);

      if (this.popupFormData.out_stat === '1') {
        this.saveBtn.visible = false;
        this.deleteBtn.visible = false;
        this.address.visible = false;
        this.popupForm.instance.getEditor('zip_no').option('disabled', true);
        this.popupForm.instance.getEditor('dg_adr1').option('disabled', true);
        this.popupForm.instance.getEditor('dg_adr2').option('disabled', true);
        this.popupForm.instance.getEditor('remark').option('disabled', true);
        this.popupForm.instance.getEditor('bp_cost1').option('disabled', true);
        this.popupForm.instance.getEditor('bp_cost2').option('disabled', true);
        this.popupForm.instance.getEditor('bp_cost3').option('disabled', true);
      }
    } else {
      this.popupForm.instance.getEditor('bp_dt').option('value', this.gridUtil.getToday());
    }
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
  }

  popupHidden(e): void {
    this.popupGrid.focusedRowIndex = null;
    this.popupGrid.focusedRowKey = null;
  }

  popupShown2(e): void {
    // this.subForm.instance.getEditor('exptCd').option('disabled', true);

    this.popupGrid2.instance.repaint();  // 스크롤 제거를 위해 refresh
    // this.utilService.setPopupGridHeight(this.popup2, this.subForm, this.popupGrid2);
  }

  // 품목변경시 단가세팅
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    rowData.item_cd = value;

    const result = await this.bizService.getOrdPr(this.G_TENANT,
      this.popupFormData.cont_no,
      value);
    rowData.ord_pr = result.ord_pr;
  }

  setOrdPr(rowData: any, value: any): void {
    if (!this.isExptOk()) {
      rowData.ord_pr = 0;
      return;
    }
    rowData.ord_pr = (value < 0) ? 0 : value;
  }

  isExptOk(): boolean {
    // if (!this.popupFormData.bp_dt) {
    //   const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.ord_dt_c', '주문일자', 'Order Date'));
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('ord_dt').focus();
    //   return false;
    // }
    if (!this.popupFormData.expt_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cust_cd', '거래처', 'Account'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('expt_cd').focus();
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

  // grid edit 제어
  allowEditing(e): boolean {
    return (this.popupFormData.out_stat === '1') ? false : true;
  }


  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    // this.popupForm.instance.resetValues();
  }

  // 닫기클릭 이벤트

  popupCancelClick2(e): void {
    this.popupVisible2 = false;
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormData as Saor200VO;
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
  // addClick(): void {
  //   if (!this.isExptOk()) {
  //     return;
  //   }
  //   if (this.popupFormData.out_stat !== '0') {  // 작업상태가 주문등록일때만 행추가 가능.
  //     return;
  //   }
  //   this.popupGrid.instance.addRow().then(r => {
  //     const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
  //     this.popupGrid.focusedRowIndex = rowIdx;
  //   });
  // }

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

  async popupSaveClick2(e): Promise<void> {
    const ordDatas: any = this.popupGrid2.instance.getSelectedRowsData();

    if (ordDatas.length > 0) {
      this.popupFormData.ord_no = null;
      this.popupFormData.ord_no = ordDatas[0].ord_no;
      this.popupVisible2 = false;
    }
  }

  // 팝업 데이터 호출(수출사파트너사 정보)
  async onItemSearch(data): Promise<void> {

    const result = await this.service.gridInfo(data);

    if (!result.success) {
      return;
    } else {

      await this.popupGrid.instance.cancelEditData();

      this.entityStoreItemGrid = new ArrayStore({
        data: result.data,
        key: this.key2
      });
      this.dsItemGrid = new DataSource({
        store: this.entityStoreItemGrid
      });
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;

      const keys = this.popupGrid.instance.getSelectedRowKeys();
      this.popupGrid.instance.deselectRows(keys);
    }
  }

  // 주소변경시
  comfirmAddress(): void {
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
          this.popupFormData.dg_adr1 = items[0].roadAddress; // 국문주소
          this.popupFormData.eng_biz_adr1 = items[0].englishAddress; // 영문주소
          this.popupFormData.zip_no = zipCode;
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
              this.popupFormData.dg_adr1 = results[0].formatted_address; // 국문주소
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

  onOptionChanged(e): void {
    /**
     * recalculateWhileEditing 와 deleteRow를 같이 사용하면
     * 삭제된 행이 보이는 현상이 있으므로 refresh를 사용하여
     * 삭제된 행이 안보이게
     */
    if (e.fullName === 'editing.changes') {
      e.component.refresh();
    }
  }

  updateSelection(treeView): void {
    if (!treeView) {
      return;
    }

    treeView.unselectAll();

    if (this.treeBoxValue) {
      this.treeBoxValue.forEach(((value) => {
        treeView.selectItem(value);
      }));
    }
  }

  onDropDownBoxValueChanged(e): void {
    this.updateSelection(this.treeView && this.treeView.instance);
  }

  onTreeViewReady(e): void {
    this.updateSelection(e.component);
  }

  onTreeViewSelectionChanged(e): void {
    this.treeBoxValue = e.component.getSelectedNodeKeys();
  }


  /**
   *  팝업 메소드 END
   */
}
