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
import {formData, Sabu110Service, Sabu110VO} from './sabu110.service';

@Component({
  selector: 'app-sabu110',
  templateUrl: './sabu110.component.html',
  styleUrls: ['./sabu110.component.scss']
})
export class Sabu110Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu110Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.subPopupSaveClick = this.subPopupSaveClick.bind(this);
    this.subPopupCancelClick = this.subPopupCancelClick.bind(this);

    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.onValueChangedPurCd = this.onValueChangedPurCd.bind(this);
    this.onSubPopup = this.onSubPopup.bind(this);
    this.onInpSearch = this.onInpSearch.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('inpGrid', {static: false}) inpGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('subPopup', {static: false}) subPopup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('subPopupForm', {static: false}) subPopupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('onSubButton', {static: false}) onSubButton: DxButtonComponent;

  @ViewChild('fromRtnDate', {static: false}) fromRtnDate: DxDateBoxComponent;
  @ViewChild('toRtnDate', {static: false}) toRtnDate: DxDateBoxComponent;

  @ViewChild('fromInpDate', {static: false}) fromInpDate: DxDateBoxComponent;
  @ViewChild('toInpDate', {static: false}) toInpDate: DxDateBoxComponent;

  dsCustCd = []; // 거래처
  dsMonyUnit = []; // 화폐
  dsItemCd = []; // 품목
  dsUnit = []; // 단위
  dsUser = []; // 사용자
  dsWhCd = []; // 창고
  filteredWhCd = [];
  dsCopyWhCd = [];

  dsPurRtnReason = [];

  dsPurStat = [];


  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;
  ownerId: any;

  mainFormData: Sabu110VO = {} as Sabu110VO;
  popSearchFormData: Sabu110VO = {} as Sabu110VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupMode = 'Add';
  popupModeNm = this.utilService.convert1('sales.pur_rtn', '매입반품', 'Pur Return'); // "회수지시";
  popupFormData: formData;
  emptyFormData: formData;
  searchFormData: formData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  deleteRowList = [];
  changes = [];
  subChanges = [];
  key = 'uid';

  // 매입 grid
  subPopupFormData: any;
  dsInpGrid: DataSource;
  entityStoreInpGrid: ArrayStore;
  // Grid State
  GRID_STATE_KEY = 'sabu_sabu110_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');

  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 주문구분
    this.dsPurRtnReason = [{cd: '0', nm: this.utilService.convert('sales.rfr_none')},
      {cd: '1', nm: this.utilService.convert('sales.rfr_pd')},
      {cd: '2', nm: this.utilService.convert('sales.rfr_simple_chage')},
      {cd: '3', nm: this.utilService.convert('sales.rfr_item_reord')}
    ];

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

    // 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnit = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.ownerId = result.data[0].company;
    });

    // 매입반품상태
    this.codeService.getCode(this.G_TENANT, 'PURRTNSTAT').subscribe(result => {
      this.dsPurStat = result.data;
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
    // this.utilService.getGridHeight(this.inpGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromRtnDate.value = rangeDate.fromDate;
    this.toRtnDate.value = rangeDate.toDate;

    this.mainFormData.purStat = '2';
  }

  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromRtnDate = document.getElementsByName('fromRtnDate').item(1).getAttribute('value');
      this.mainFormData.toRtnDate = document.getElementsByName('toRtnDate').item(1).getAttribute('value');

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
  async onSearchPopup(data): Promise<void> {
    // console.log("onSearchPopup >>> ");
    if (this.popupFormData.uid) {

      const result = await this.service.mainInfo(data);

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

        if (data.wrk_stat !== undefined && data.wrk_stat !== '2') {
          this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', true);
          this.popupForm.instance.getEditor('remarks').option('disabled', true);

          this.onSubButton.visible = false;
          this.deleteBtn.visible = false; // 삭제버튼
          this.saveBtn.visible = false; // 저장버튼
        } else {
          if (data.pur_rtn_no === undefined || data.pur_rtn_no === '') {
            this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', false);
            this.popupForm.instance.getEditor('rtn_ord_dt').option('value', this.gridUtil.getToday());
            this.deleteBtn.visible = false; // 삭제버튼

          } else {
            this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', true);
            this.deleteBtn.visible = true; // 삭제버튼
            this.onSubButton.visible = false;
          }

          this.saveBtn.visible = true; // 저장버튼

          this.popupForm.instance.getEditor('remarks').option('disabled', false);
          this.popupForm.instance.getEditor('remarks').focus();
        }

        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  onFocusedRowChanged(e, grid): void {
    this.changes = [];  // 초기화

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    if (e.rowIndex < 0 || !e.row) {
      return;
    } else {

      this.popupFormData = e.row.data;
      this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};

      this.onSearchPopup(e.row.data);
    }
  }


  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 팝업(POPUP) 띄우기  이벤트
  async rtnAddClick(e): Promise<void> {
    this.showPopup('rtnAdd', {...this.emptyFormData});
  }


  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '품목 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required',
        this.utilService.convert1('sales.pur_rtn_item_cd', '반품품목', 'Item'));  // '품목'
      this.utilService.notify_error(msg);
      return;
    }

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
        console.log('diff');
      } else {
        console.log('same');
      }

      const today: string = this.gridUtil.getToday().replace(/-/gi, '');
      const inpDt: string = this.popupForm.instance.getEditor('inp_dt').option('value').replace(/-/gi, '');
      const rtnOrdDt: string = this.popupForm.instance.getEditor('rtn_ord_dt').option('value').replace(/-/gi, '');  // 회수지시일자

      if (this.popupMode === 'rtnAdd' && rtnOrdDt < inpDt) {
        let msg = '반품일은 입고일자 포함 이후만 가능합니다.';
        if (this.utilService.getLanguage() !== 'ko') {
          msg = 'Recall date are only available after the incoming date is included.';
        }
        this.utilService.notify_error(msg);
        this.popupForm.instance.getEditor('rtn_ord_dt').focus();
        return;
      }

      const saveContent: any = this.popupFormData as unknown as Sabu110VO;
      const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

      for (const items of detailList) {
        const inpQty: number = items.inp_qty >>> 0;
        const rtnOrdQty: number = (items.old_rtn_ord_qty >>> 0) - (items.org_rtn_ord_qty >>> 0) + (items.rtn_ord_qty >>> 0);

        if (inpQty < rtnOrdQty) {
          let msg = '매입수량을 초과할 수 없습니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Purchase quantity cannot be exceeded.';
          }
          this.utilService.notify_error(msg);
          return;
        }
      }

      // 지시수량
      let totPurRtnQTy = 0;
      for (const items of this.popupGrid.instance.getVisibleRows()) {
        totPurRtnQTy += items.data.rtn_ord_qty >>> 0;

        if (items.data.rtn_ord_qty > 0 && !items.data.pur_rtn_reason) {
          const msg = this.utilService.convert1('sales.pur_rtn_reason_null', '반품사유를 선택하세요.');
          this.utilService.notify_error(msg);
          return;
        }
      }

      if (totPurRtnQTy < 1) {
        let msg = '반품수량을 1개 이상 입력하세요.';
        if (this.utilService.getLanguage() !== 'ko') {
          msg = 'Please enter at least one quantity to indicate.';
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

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));  // "저장"
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.rtnItemList = detailList;

      saveContent.createdby = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;
      saveContent.formModified = formModified;
      saveContent.ownerId = this.ownerId;

      console.log(saveContent);
      result = await this.service.mainSave(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        // 물류 품목 송신 I/F interface
        // sendResult = await this.bizService.sendApi({
        //   sendType: 'purRtnOrd',
        //   purRtnNo: this.popupFormData.pur_rtn_no,
        //   ownerId: this.ownerId
        // });
        //
        // if (!sendResult.success) {
        //   this.utilService.notify_error(JSON.stringify(sendResult));
        //   return;
        // } else {
        // }

        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popup.visible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }


  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('rtnModify', {...e.data});
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

  async onPopReset(): Promise<void> {
    // await this.popSearchForm.instance.resetValues();
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
      this.dsItemGrid.reload().then();
    }
    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;
    // 팝업 버튼 보이기 정리
    this.deleteBtn.visible = false; // 삭제버튼
    this.popup.visible = true;
    // this.onSubButton.visible = false;

    if (this.popupMode === 'rtnAdd') {

    } else {
      this.deleteBtn.visible = true; // 삭제버튼
      // this.onSubButton.visible = false;
      this.onSearchPopup(data).then();
    }
  }

  popupShown(e): void {

    if (this.popupMode === 'rtnAdd') {
      this.onSubButton.visible = true;
      this.saveBtn.visible = true; // 저장버튼

      this.popupModeNm = this.utilService.convert1('sales.pur_rtn', '매입반품', 'Pur Recall');
      this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', false);
      this.popupForm.instance.getEditor('rtn_ord_dt').option('value', this.gridUtil.getToday());

      this.popupForm.instance.getEditor('remarks').option('disabled', false);
    } else {
      this.popupModeNm = this.utilService.convert1('sales.pur_rtn_update', '매입반품수정', 'Pur Recall Update');
      this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', true);
      // 초기 focus
      this.popupForm.instance.getEditor('remarks').focus();
    }

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popup.visible = false;
    this.popupForm.instance.resetValues();
  }

  // grid edit 제어
  allowEditing(e): boolean {
    return true;
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));  // "삭제"
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const deleteContent = this.popupFormData as unknown as Sabu110VO;
      const result = await this.service.mainDelete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popup.visible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  onInitNewRow(e): void {
    // e.data.pur_rtn_reason = '0';
  }

  onValueChangedPurCd(e): void {
    this.mainForm.instance.getEditor('whCd').option('value', null);

    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.mainForm.instance.getEditor('purCd').option('value'));
  }

  setInpPr(rowData: any, value: any, currentRowData: any): void {
    rowData.inp_pr = value;
    rowData.rtn_ord_amt = value * currentRowData.rtn_ord_qty;

    if (currentRowData.std_pur_vat_rate) {
      rowData.rtn_ord_vat_amt = Math.floor((rowData.rtn_ord_amt * currentRowData.std_pur_vat_rate) / 10) * 10;
    }
  }

  setRtnQty(rowData: any, value: any, currentRowData: any): void {
    rowData.rtn_ord_qty = value;
    rowData.rtn_ord_amt = value * currentRowData.inp_pr;

    if (currentRowData.std_pur_vat_rate) {
      rowData.rtn_ord_vat_amt = Math.floor((rowData.rtn_ord_amt * currentRowData.std_pur_vat_rate) / 10) * 10;
    }
  }

  setRtnAmt(rowData: any, value: any, currentRowData: any): void {
    rowData.rtn_ord_amt = value;

    if (currentRowData.std_pur_vat_rate) {
      rowData.rtn_ord_vat_amt = Math.floor((rowData.rtn_ord_amt * currentRowData.std_pur_vat_rate) / 10) * 10;
    }
  }

  /**
   *  팝업 메소드 END
   */
  async onSubPopup(e): Promise<void> {
    this.showSubPopup({...e.data});
  }

  showSubPopup(data): void {
    this.changes = [];  // 초기화
    // 입고 그리드 초기화
    if (!!this.dsInpGrid) {
      this.entityStoreInpGrid.clear();
      this.dsInpGrid.reload().then();
    }
    this.subPopupFormData = data;
    this.subPopupFormData = {tenant: this.G_TENANT, ...this.subPopupFormData};
    // 팝업 버튼 보이기 정리
    this.subPopup.visible = true;
    this.subPopup.title = this.utilService.convert1('sales.pur_rtn_search', '매입반품 조회', 'Pur Return Search'); // "회수지시";
  }

  // search Form 초기화
  initSearchForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromInpDate.value = rangeDate.fromDate;
    this.toInpDate.value = rangeDate.toDate;

    this.subPopupForm.instance.getEditor('inpNoSch').option('value', '');
    this.subPopupForm.instance.getEditor('purCdSch').option('value', '');
    // this.subPopupForm.instance.getEditor('whCdSch').option('value', '');
    // this.subPopupForm.instance.getEditor('zipNoSch').option('value', '');
    this.subPopupForm.instance.getEditor('bizAdrSch').option('value', '');
  }

  subPopupShown(e): void {
    this.initSearchForm();
    this.subPopupForm.instance.getEditor('inpNoSch').focus();
    this.utilService.setPopupGridHeight(this.subPopup, this.subPopupForm, this.inpGrid);

    this.inpGrid.instance.repaint();
  }

  // 서브팝업 조회
  async onInpSearch(): Promise<void> {
    this.subPopupFormData.inpNoSch = this.subPopupForm.instance.getEditor('inpNoSch').option('text');
    this.subPopupFormData.purCdSch = this.subPopupForm.instance.getEditor('purCdSch').option('value');
    // this.subPopupFormData.whCdSch = this.subPopupForm.instance.getEditor('whCdSch').option('value');
    // this.subPopupFormData.zipNoSch = this.subPopupForm.instance.getEditor('zipNoSch').option('text');
    this.subPopupFormData.bizAdrSch = this.subPopupForm.instance.getEditor('bizAdrSch').option('text');

    const result = await this.service.inpList(this.subPopupFormData);

    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      this.inpGrid.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.entityStoreInpGrid = new ArrayStore(
        {
          data: result.data,
          key: this.key,
        }
      );
      this.dsInpGrid = new DataSource({
        store: this.entityStoreInpGrid
      });
      this.inpGrid.focusedRowKey = null;
      // this.inpGrid.paging.pageIndex = 0;
      // this.subPopupFormData = {tenant: this.G_TENANT, ...this.emptyFormData};
      // // this.mainGrid.focusedRowIndex = -1;
      //
      // const keys = this.inpGrid.instance.getSelectedRowKeys();
      // this.inpGrid.instance.deselectRows(keys);
    }

  }

  async subPopupSaveClick(e): Promise<void> {
    this.subPopup.visible = false;

    // const purDatas: any = this.inpGrid.instance.getSelectedRowsData();
    //
    // if (purDatas.length > 0) {
    //   // this.popupFormData.inp_no = ordDatas[0].inpNoSch;
    //   this.subPopup.visible = false;
    //
    // }
  }


  // 닫기클릭 이벤트
  subPopupCancelClick(e): void {
    this.subPopup.visible = false;
    this.subPopupForm.instance.resetValues();
  }
}
