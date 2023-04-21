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
  DxDateBoxComponent, DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {formData, Saor250VO} from './saor251.service';
import {RcvCommonUtils} from '../../rcv/rcvCommonUtils';
import {Saor251Service} from './saor251.service';

@Component({
  selector: 'app-saor251',
  templateUrl: './saor251.component.html',
  styleUrls: ['./saor251.component.scss']
})
export class Saor251Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor251Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              private rcvUtil: RcvCommonUtils,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.isExptOk = this.isExptOk.bind(this);
    this.searchPort = this.searchPort.bind(this);
    this.getPortExpt = this.getPortExpt.bind(this);
    this.getPortImpt = this.getPortImpt.bind(this);
    this.setItemGridData = this.setItemGridData.bind(this);
    this.popupShown = this.popupShown.bind(this);

    this.calcAvaStoQty = this.calcAvaStoQty.bind(this);
    this.invoiceCancel = this.invoiceCancel.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('fromDate', {static: false}) fromDate: DxDateBoxComponent;
  @ViewChild('toDate', {static: false}) toDate: DxDateBoxComponent;
  @ViewChild('confirmBtn', {static: false}) confirmBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  dsWrkStat = []; // 작업상태
  dsExptCd = []; // 거래처(수출사)
  dsPtrnCd = []; // 파트너
  dsContNo = [];
  dsImptCd = []; // 수입사
  dsFullImptCd = [];  // 전체 수입사
  dsFullitemCd = [];
  dsShipCompany = [];

  dsWhCd = []; // 센터(창고마스터)

  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsCountry = [];      // 국가
  dsCopyPort = []; // 항구
  dsLoadPort = []; // 선적항
  dsArvlPort = []; // 도착항

  dsExptPort = [];
  dsImptPort = [];


  // Global
  G_TENANT: any;
  sessionUserId: any;
  ownerId: any;
  userGroup: any;
  userCompany: any;
  exptCount: any;
  imptCount: any;

  serialFormData: any = {};

  mainFormData: Saor250VO = {} as Saor250VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = this.utilService.convert1('sales.invoice_reg', 'Invoice등록', 'Invoice Reg');
  popupFormData: formData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;
  serialDataSource: DataSource;
  deleteRowList = [];
  changes = [];
  subChanges = [];
  key = 'exportslip_cd';

  // serial
  serialPopupVisible: boolean;
  serialEntityStore: ArrayStore;
  currItemCd: any;
  currQty: any;

  // Grid State
  GRID_STATE_KEY = 'saor_saor250_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  loadStateTag = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_tag');
  saveStateTag = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_tag');

  canChangePopupData = false;

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 작업상태
    this.codeService.getCode(this.G_TENANT, 'WRKSTAT').subscribe(result => {
      this.dsWrkStat = result.data;
    });

    // this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
    //   this.dsFullExptCd = result.data;
    // });

    this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
      this.dsFullImptCd = result.data;
      console.log('this.dsFullImptCd', this.dsFullImptCd);
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '3', '', '').subscribe(result => {
      this.dsFullitemCd = result.data;
    });

    this.bizService.getExptPtrn(this.G_TENANT, null).subscribe(result => {
      this.dsExptCd = result.data;
    });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', '', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.ownerId = result.data[0].company;
    });

    // 선사코드
    this.codeService.getCode(this.G_TENANT, 'SHIPCOMPANY').subscribe(result => {
      this.dsShipCompany = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    // 팝업 그리드 초기화
    this.setItemGridData([]);
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set

    this.fromDate.value = this.bizService.getDay(7, '-');
    this.toDate.value = this.bizService.getDay(7, '+');
    this.mainFormData.fromDate = this.bizService.getDay(7, '-');
    this.mainFormData.toDate = this.bizService.getDay(7, '+');
  }

  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      if (this.fromDate && this.fromDate.value) {
        this.mainFormData.fromDate = this.fromDate.value as string;
      } else {
        this.mainFormData.fromDate = null;
      }
      if (this.toDate && this.toDate.value) {
        this.mainFormData.toDate = this.toDate.value as string;
      } else {
        this.mainFormData.toDate = null;
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
        const keys = this.mainGrid.instance.getSelectedRowKeys();
        await this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupFormData.uid) {

      // Service의 get 함수 생성
      const para: any = this.popupFormData;
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

        this.dsItemGrid = new DataSource({
          store: this.entityStoreItemGrid
        });

        // this.setItemGridData();
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
  async invoiceRegClick(e): Promise<void> {
    this.showPopup('Add', {});
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
  async showPopup(popupMode, data): Promise<any> {
    this.canChangePopupData = false;
    this.changes = [];  // 초기화

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    // this.saveBtn.visible = true; // 저장버튼
    this.popupVisible = true;
    this.popupMode = popupMode;

    this.confirmBtn.visible = true;

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    console.log(this.popupFormData);
    // 수출사에 따른 선적항만 콤보에 적용
    // this.dsExptPort = await this.searchPort(this.popupFormData.expt_country);

    // 수입사에 따른 도착항만 콤보에 적용
    // this.dsImptPort = await this.searchPort(this.popupFormData.impt_country);
    const detailList = await this.service.detailList({exportslip_cd: this.popupFormData.exportslip_cd});

    this.setItemGridData(detailList.data);
    this.onSearchPopup().then();
  }

  popupShown(e): void {
    this.popupForm.instance.getEditor('expt_port').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('etd').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('impt_port').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('eta').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('invoice').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('cert_export').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('bl_no').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('air_waybill').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('mmsi_imo').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('ship_nm').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('container_nm').option('disabled', this.popupFormData.wrk_stat === '9');
    this.popupForm.instance.getEditor('ship_company').option('disabled', this.popupFormData.wrk_stat === '9');

    this.popupForm.instance.getEditor('expt_country').option('disabled', true);
    this.popupForm.instance.getEditor('impt_country').option('disabled', true);
    // this.popupForm.instance.getEditor('slipdate').option('disabled', true);


    this.popupForm.instance.getEditor('expt_cd').option('disabled', true);
    this.popupForm.instance.getEditor('impt_cd').option('disabled', true);

    const data = {
      expt_cd: this.popupFormData.expt_cd,
      dt: this.popupFormData.slipdate,
    };
    this.bizService.getImptCdListWithExptCd(data).then(r => {
      this.dsImptCd = r.data;
    });

    this.searchPort(this.popupFormData.expt_country).then(r => {
      this.dsExptPort = r;
    });
    this.searchPort(this.popupFormData.impt_country).then(r => {
      this.dsImptPort = r;
    });

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
  }

  // 주문금액 표현식
  calcOutOrdAmt(rowData: any): number {
    return rowData.out_ord_qty * rowData.ord_pr;
  }

  setItemGridData(dataList): void {
    this.entityStoreItemGrid = new ArrayStore({data: dataList, key: 'uid'});
    this.dsItemGrid = new DataSource({store: this.entityStoreItemGrid});
  }

  popupHidden(e): void {
    this.popupForm.instance.resetValues();
    this.popupGrid.focusedRowKey = null;
    this.popupGrid.paging.pageIndex = 0;
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.instance.deselectAll();
    grid.focusedRowIndex = index;
  }

  onInitNewRow(e): void {
    e.data.item_cd = null;
    e.data.qty = 0;
    // e.data.ord_pr = 0;
    // e.data.ord_vat_amt = 0;
    // e.data.damageflg = 'N';
  }

  isExptOk(): boolean {
    if (!this.popupFormData.slipdate) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.slipdate', '확정일', 'Slip Date'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('ord_dt').focus();
      return false;
    }
    if (!this.popupFormData.expt_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.expt_cd'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('expt_cd').focus();
      return false;
    }

    if (!this.popupFormData.impt_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.impt_cd'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('expt_cd').focus();
      return false;
    }

    if (!this.popupFormData.ptrn_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.ptrn_cd'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('ptrn_cd').focus();
      return false;
    }

    return true;
  }

  /**
   * 가용재고 계산
   */
  async calcAvaStoQty(itemCd: string): Promise<number> {
    let result = 0;

    // 가용재고
    const ptrnCd = this.popupFormData.ptrn_cd;
    const saWhCd = this.popupFormData.salesWhCd;
    if (ptrnCd && saWhCd && itemCd) {
      result = await this.bizService.getExptInvQty(this.popupFormData.expt_cd, saWhCd, itemCd, this.G_TENANT, 'N', this.popupFormData.ptrn_cd);
    }
    return result;
  }

  async getPortExpt(e): Promise<any> {
    if (this.canChangePopupData) {
      this.dsExptPort = [];
      this.popupFormData.expt_port = null;
    }

    if (e && e.value) {
      this.dsExptPort = await this.searchPort(e.value);
    }
  }

  async getPortImpt(e): Promise<any> {
    if (this.canChangePopupData) {
      this.dsImptPort = [];
      this.popupFormData.impt_port = null;
    }

    if (e && e.value) {
      this.dsImptPort = await this.searchPort(e.value);
    }
  }

  async searchPort(country): Promise<any> {
    if (Boolean(country)) {
      const result = await this.service.searchPort({country});
      return result.data;
    }
  }

  async invoiceCancel(e): Promise<void> {
    const ordDatas: any = this.mainGrid.instance.getSelectedRowsData();

    try {
      if (ordDatas.length < 1) {
        // tslint:disable-next-line:no-shadowed-variable
        const msg = this.utilService.convert('com_select_obj', this.utilService.convert('/saor/saor250'));
        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert1('Execute_invoiceCancel', 'invoice확정을 취소하시겠습니까?');
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const result = await this.service.invoiceCancel(ordDatas);

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
}
