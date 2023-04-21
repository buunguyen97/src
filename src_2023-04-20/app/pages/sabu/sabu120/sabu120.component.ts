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
import {formData, Sabu120Service, Sabu120VO} from './sabu120.service';

@Component({
  selector: 'app-sabu120',
  templateUrl: './sabu120.component.html',
  styleUrls: ['./sabu120.component.scss']
})
export class Sabu120Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu120Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.onValueChangedPurCd = this.onValueChangedPurCd.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('confirmBtn', {static: false}) confirmBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromRtnDate', {static: false}) fromRtnDate: DxDateBoxComponent;
  @ViewChild('toRtnDate', {static: false}) toRtnDate: DxDateBoxComponent;

  @ViewChild('fromInpDate', {static: false}) fromInpDate: DxDateBoxComponent;
  @ViewChild('toInpDate', {static: false}) toInpDate: DxDateBoxComponent;

  dsCustCd = []; // 거래처
  dsMonyUnit = []; // 화폐
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsWhCd = []; // 창고
  filteredWhCd = [];
  dsCopyWhCd = [];

  dsPurRtnReason = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;
  ownerId: any;

  mainFormData: Sabu120VO = {} as Sabu120VO;
  popSearchFormData: Sabu120VO = {} as Sabu120VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupMode = 'Add';
  popupModeNm = this.utilService.convert1('sales.pur_rtn', '매입반품', 'Pur Return'); // "회수지시";
  popupFormData: formData;
  searchFormData: formData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  deleteRowList = [];
  changes = [];
  subChanges = [];
  key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sabu_sabu120_1';
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

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.ownerId = result.data[0].company;
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

        if (data.pur_rtn_no === undefined || data.pur_rtn_no === '') {
          this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', false);
          this.popupForm.instance.getEditor('rtn_ord_dt').option('value', this.gridUtil.getToday());

        } else {
          this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', true);
        }

        this.popupForm.instance.getEditor('remarks').focus();

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
  async rtnConfirmClick(e): Promise<void> {
    const confirmDatas: any = this.mainGrid.instance.getSelectedRowsData();

    if (confirmDatas.length < 1) {
      // 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.pur_rtn', '매입반품', 'Pur Return'));
      this.utilService.notify_error(msg);
      return;
    }

    const confirmData: any = confirmDatas[0];

    this.showPopup('rtnConfirm', {...confirmData});
  }

  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) {
      return;
    }

    try {
      const saveContent = this.popupFormData as any;
      // const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
      const detailList = this.popupGrid.instance.getDataSource().items();

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_confirmation'));  // "저장"

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.rtnItemList = detailList;
      saveContent.modifiedby = this.sessionUserId;
      saveContent.ownerId = this.ownerId;

      console.log(saveContent);

      const result = await this.service.mainSave(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
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
    this.showPopup('rtnConfirm', {...e.data});
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
    this.popup.visible = true;

    this.onSearchPopup(data).then();
  }

  popupShown(e): void {
    this.popupModeNm = this.utilService.convert1('sales.pur_rtn', '매입반품', 'Pur Recall');
    this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', true);
    // 초기 focus
    this.popupForm.instance.getEditor('remarks').focus();

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

  onInitNewRow(e): void {
    // e.data.pur_rtn_reason = '0';
  }

  onValueChangedPurCd(e): void {
    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.mainForm.instance.getEditor('purCd').option('value'));
  }
}
