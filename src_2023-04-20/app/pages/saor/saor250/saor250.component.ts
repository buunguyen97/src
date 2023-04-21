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
import {formData, Saor250Service, Saor250VO} from './saor250.service';
import {RcvCommonUtils} from '../../rcv/rcvCommonUtils';
import {COMMONINITSTR} from '../../../shared/constants/commoninitstr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-saor250',
  templateUrl: './saor250.component.html',
  styleUrls: ['./saor250.component.scss']
})
export class Saor250Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor250Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              private rcvUtil: RcvCommonUtils,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.invoiceSaveClick = this.invoiceSaveClick.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.searchPort = this.searchPort.bind(this);
    this.getPortExpt = this.getPortExpt.bind(this);
    this.getPortImpt = this.getPortImpt.bind(this);

    this.isExptOk = this.isExptOk.bind(this);

    this.onSelectionChangedExptCd = this.onSelectionChangedExptCd.bind(this);
    this.onSelectionChangedPtrnCd = this.onSelectionChangedPtrnCd.bind(this);
    this.onSelectionChangedImptCd = this.onSelectionChangedImptCd.bind(this);

    this.setItemGridData = this.setItemGridData.bind(this);
    this.execInvoiceProcess = this.execInvoiceProcess.bind(this);
    this.popupShown = this.popupShown.bind(this);

    this.onSerialUploadClick = this.onSerialUploadClick.bind(this);
    this.onSerialDeleteClick = this.onSerialDeleteClick.bind(this);
    this.onSerialCancelClick = this.onSerialCancelClick.bind(this);

    this.getContNo = this.getContNo.bind(this);
    this.setItemCdValue = this.setItemCdValue.bind(this);
    this.calcAvaStoQty = this.calcAvaStoQty.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.onSerialPopupClick = this.onSerialPopupClick.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('fromDate', {static: false}) fromDate: DxDateBoxComponent;
  @ViewChild('toDate', {static: false}) toDate: DxDateBoxComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('confirmBtn', {static: false}) confirmBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('serialPopup', {static: false}) serialPopup: DxPopupComponent;
  @ViewChild('tagGrid', {static: false}) tagGrid: DxDataGridComponent;

  dsWrkStat = []; // 작업상태
  dsExptCd = []; // 거래처(수출사)
  dsPtrnCd = []; // 파트너
  dsContNo = [];
  dsImptCd = []; // 수입사
  dsFullImptCd = [];  // 전체 수입사
  dsFullitemCd = [];

  dsWhCd = []; // 센터(창고마스터)

  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsCountry = [];      // 국가
  dsCopyPort = []; // 항구
  dsLoadPort = []; // 선적항
  dsArvlPort = []; // 도착항

  dsExptPort = [];
  dsImptPort = [];
  dsShipCompany = [];

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
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '3', '', '').subscribe(result => {
      this.dsFullitemCd = result.data;
    });

    this.bizService.getExptPtrn(this.G_TENANT, null).subscribe(result => {
      this.dsExptCd = result.data;
    });

    // this.bizService.getImptPtrn(this.G_TENANT, null).subscribe(result => {
    //   this.dsImptCd = result.data;
    // });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

    // 전체 품목
    // this.bizService.getItem(this.G_TENANT, '', '', '', '', '').subscribe(result => {
    //   this.dsItemCd = result.data;
    // });

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

    this.mainForm.instance.getEditor('wrkStat').option('value', '1');
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


  // 주문확정버튼 이벤트  ordconfirm
  async invoiceSaveClick(e): Promise<void> {
    this.onSave(e, 'ordConfirm');
  }

  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {
    this.onSave(e, 'invoiceReg');
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormData as any;
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

  async onSave(e, saveGb): Promise<void> {
    const exptCheck = this.bizService.getSaWhExptCheck(this.G_TENANT, e);
    const imptCheck = this.bizService.getSaWhImptCheck(this.G_TENANT, e);

    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) {
      return;
    }

    try {
      let result;

      const lastPopupData: string = JSON.stringify(this.popupFormData);
      let formModified = 'N';

      if (this.firstPopupData !== lastPopupData) {
        formModified = 'Y';
      }


      const saveContent = this.popupFormData; // as Saor250VO;
      const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

      const list = this.popupGrid.instance.getVisibleRows().map(el => {
        return el.data;
      });

      if (this.popupMode === 'Add') {
        if ((this.changes.length) === 0) {
          const msg = this.utilService.convert1('saor250.validItem', '품목을 추가하세요.');
          this.utilService.notify_error(msg);
          return;
        }

        for (const c of detailList) {
          if (!c.item_cd) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item', '품목', 'Item'));
            this.utilService.notify_error(msg);
            return;
          }
          if (!c.qty || c.qty <= 0) {
            const msg = this.utilService.convert1('saor250.validQty', '수량을 1개 이상 입력하세요.');
            this.utilService.notify_error(msg);
            return;
          }
        }

        // for (const items of detailList) {
        //   const out_qty: number = items.out_qty;
        //   const invoice_qty: number = items.invoice_qty;
        //
        //   if (out_qty < invoice_qty) {
        //     let msg = '출고수량을 초과할 수 없습니다.';
        //     if (this.utilService.getLanguage() !== 'ko') {
        //       msg = 'Forwarding quantity cannot be exceeded.';
        //     }
        //     this.utilService.notify_error(msg);
        //     return;
        //   }
        // }
        saveContent.ordItemList = detailList;
      } else {

        if ((list.length) === 0) {
          const msg = this.utilService.convert1('saor250.validItem', '품목을 추가하세요.');
          this.utilService.notify_error(msg);
          return;
        }

        for (const c of detailList) {
          if (c.operType === 'remove') {
            continue;
          } else if (c.operType === 'update') {
            if (!c.item_cd) {
              const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item', '품목', 'Item'));
              this.utilService.notify_error(msg);
              return;
            }

            if (c.qty && c.qty <= 0) {
              const msg = this.utilService.convert1('saor250.validQty', '수량을 1개 이상 입력하세요.');
              this.utilService.notify_error(msg);
              return;
            }
          } else {
            if (!c.item_cd) {
              const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item', '품목', 'Item'));
              this.utilService.notify_error(msg);
              return;
            }

            if (!c.qty || c.qty <= 0) {
              const msg = this.utilService.convert1('saor250.validQty', '수량을 1개 이상 입력하세요.');
              this.utilService.notify_error(msg);
              return;
            }
          }

        }

        saveContent.ordItemList = detailList;
      }

      const indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid, 'item_cd');
      if (indexWhenDup > -1) {
        const msg = this.utilService.convert('cannotDuplicateData', this.utilService.convert1('sales.item', '품목', 'Item'));
        this.utilService.notify_error(msg);
        return;
      }

      for (const l of list) {
        if (l.ava_sto_qty < l.qty) {
          const msg = this.utilService.convert1('saor250.validAvaQty', '가용재고가 충분하지 않습니다.');
          this.utilService.notify_error(msg);
          return;
        }
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


      saveContent.createdby = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;
      saveContent.formModified = formModified;
      saveContent.language = this.utilService.getLanguage();

      console.log(saveContent);

      if (this.popupMode === 'Add') {
        result = await this.service.mainSave(saveContent);
      } else {
        result = await this.service.mainUpdate(saveContent);
      }

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch (e) {
      this.utilService.notify_error('There was an error!');
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
  async showPopup(popupMode, data): Promise<any> {
    this.canChangePopupData = false;
    this.changes = [];  // 초기화

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    this.saveBtn.visible = true; // 저장버튼
    this.popupVisible = true;
    this.popupMode = popupMode;
    if (popupMode === 'Add') {
      this.deleteBtn.visible = false;
      this.confirmBtn.visible = false;
    } else {
      this.deleteBtn.visible = true;
      this.confirmBtn.visible = true;

      this.popupFormData = data;
      this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
      // 수출사에 따른 선적항만 콤보에 적용
      // this.dsExptPort = await this.searchPort(this.popupFormData.expt_country);

      // 수입사에 따른 도착항만 콤보에 적용
      // this.dsImptPort = await this.searchPort(this.popupFormData.impt_country);
      const detailList = await this.service.detailList({exportslip_cd: this.popupFormData.exportslip_cd});

      this.setItemGridData(detailList.data);
      this.onSearchPopup().then();
    }

  }

  popupShown(e): void {
    this.deleteBtn.visible = this.popupFormData.wrk_stat !== '9';
    this.saveBtn.visible = this.popupFormData.wrk_stat !== '9';

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

    if (this.popupMode === 'Add') {
      this.confirmBtn.visible = false;
      this.popupFormData.slipdate = this.gridUtil.getToday();
      this.popupFormData.wrk_stat = '1';
      this.popupFormData.ptrn_cd = this.utilService.getCompany();
      this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
      this.popupForm.instance.getEditor('impt_cd').option('disabled', false);
    } else {
      // this.confirmBtn.visible = true;
      this.confirmBtn.visible = this.popupFormData.wrk_stat !== '9';
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

      const exptFiltered = this.dsExptCd.filter(expt => expt.expt_cd === this.popupFormData.expt_cd);

      if (exptFiltered.length > 0) {
        this.popupFormData.salesWhCd = exptFiltered[0].sales_wh_cd;
      }

      this.getContNo();
    }
    this.canChangePopupData = true;

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

  /**
   *  팝업 메소드 END
   */
  isUploadButtonVisible(e): boolean {
    return e.row.data.serial_yn === RcvCommonUtils.FLAG_TRUE;
  }

  async onSerialPopupClick(e, rowIdx: any): Promise<void> {

    if (this.popupFormData.wrk_stat === '9') {
      return;
    }
    this.currItemCd = this.popupGrid.instance.cellValue(rowIdx, 'item_cd');
    this.currQty = this.popupGrid.instance.cellValue(rowIdx, 'qty');

    if (!Number.isInteger(this.currQty) || this.currQty <= 0) {
      const msg = this.utilService.convert('saor250.validQty');
      this.utilService.notify_error(msg);
      return;
    }

    if ((this.currItemCd === undefined) || (this.currItemCd === '')) {
      this.utilService.notify_error('Don\`t save data. Try after save it.');
      return;
    }

    const uid = this.popupGrid.instance.cellValue(rowIdx, 'uid');
    this.serialFormData.rowIdx = rowIdx;
    const sendData = {slipdetail_key: uid, exportslip_cd: this.popupFormData.exportslip_cd};
    try {

      const serialList = this.popupGrid.instance.cellValue(rowIdx, 'serialList');
      if (serialList) {
        this.serialEntityStore = new ArrayStore(
          {
            data: serialList,
            key: 'serial'
          }
        );

        this.serialDataSource = new DataSource({
          store: this.serialEntityStore
        });
        this.serialPopupVisible = true;
        return;
      } else {
        const result = await this.service.selectInvoiceSerial(sendData);

        if (result.success) {
          for (const key in result.data) {
            if (result.data.hasOwnProperty(key)) {
              result.data[key].item_cd = this.currItemCd;
              result.data[key].exportslip_cd = this.popupFormData.exportslip_cd;

            }
          }
          this.serialEntityStore = new ArrayStore(
            {
              data: result.data,
              key: 'serial'
            }
          );
          this.serialDataSource = new DataSource({
            store: this.serialEntityStore
          });

          this.utilService.notify_success('Search success');
          this.serialPopupVisible = true;
        } else {
          this.utilService.notify_error(result.msg);
        }
      }
    } catch (e) {
      this.utilService.notify_error('There was an error!');
    }
  }

  /**
   * 파트너 변경시
   */
  onSelectionChangedPtrnCd(e): void {
    console.log('====onSelectionChangedPtrnCd======');
    if (!e || !e.event) {
      return;
    }

    // if (this.changes.length > 0) {
    //   this.suspendValueChagned = true;
    //   this.popupForm.instance.getEditor('ptrn_cd').option('value', e.previousValue);
    //   this.bizService.alertCannotChangeValue('ptrn_cd');
    //   return;
    // }

    // this.dsSaWh = this.dsCopySaWh.filter(el => el.ptrn_cd === (e ? e.value : this.popupFormData.ptrn_cd));

    // if (this.popupMode === 'Add') {
    //   this.popupFormData.sa_wh_cd = null; // 거래처(수출사)선택시 - 창고초기화
    // }

    // 수출사 - 계약정보
    if (e && e.value) {
      // this.bizService.getSaWh(this.G_TENANT, e.value).subscribe(result => {
      //   this.dsSaWh = result.data;
      // });
    }
  }

  /**
   * 수출사 변경시
   */
  onSelectionChangedExptCd(e): void {
    console.log('====onSelectionChangedExptCd======');

    // console.log(e);
    // console.log(this.dsExptCd);

    // if (this.suspendValueChagned) {
    //   this.suspendValueChagned = false;
    //   return;
    // }
    if (!e || !e.event) {
      return;
    }

    // if (this.changes.length > 0) {
    //   this.suspendValueChagned = true;
    //   this.popupForm.instance.getEditor('expt_cd').option('value', e.previousValue);
    //   this.bizService.alertCannotChangeValue('expt_cd', '1');
    //   return;
    // }

    if (this.popupMode === 'Add') {
      this.changes = [];
      //   this.popupFormData.std_rate = 1;

      //   this.dsItemCd = []; // 품목
      this.popupFormData.expt_country = null;
      this.popupFormData.cont_no = null;
      this.dsContNo = [];
      this.dsItemCd = [];

      this.dsImptCd = [];
      this.popupFormData.impt_cd = null;

      // this.popupFormData.sa_chg_nm = null;
      // this.popupFormData.sa_chg_tel_no = null;
      // this.popupFormData.zip_no = null;
      // this.popupFormData.biz_adr1 = null;
      // this.popupFormData.biz_adr2 = null;
      // this.popupFormData.eng_biz_adr1 = null;
      // this.popupFormData.eng_biz_adr2 = null;
      // this.popupFormData.country = null;
    }

    // 수출사 - 계약정보
    if (e && e.value) {
      this.bizService.getSaWhExptCheck(this.G_TENANT, e.value).subscribe(result => {
        if (result && result.data) {
          this.exptCount = result.data[0];
          if (this.exptCount.count <= 0) {
            const msg = this.utilService.convert1('saor250.noExptSalesWarehouse', '수출사 지정 영업창고가 없습니다.');
            this.utilService.notify_error(msg);
            this.popupFormData.expt_cd = e.previousValue;
          } else {
            const exptFiltered = this.dsExptCd.filter(expt => expt.expt_cd === this.popupFormData.expt_cd);

            if (exptFiltered.length > 0) {
              this.popupFormData.expt_country = exptFiltered[0].country;
              this.popupFormData.salesWhCd = exptFiltered[0].sales_wh_cd;
            }

            // this.getContNo().then();
            const data = {
              expt_cd: this.popupFormData.expt_cd,
              dt: this.popupFormData.slipdate,
            };
            this.bizService.getImptCdListWithExptCd(data).then(r => {
              this.dsImptCd = r.data;
            });
          }
        }
      });


      // const filtered = this.dsExptCd.filter(el => el.expt_cd === e.value);
      // if (filtered.length > 0) {
      //   this.popupFormData.sa_chg_nm = filtered[0].chg_nm;
      //   this.popupFormData.sa_chg_tel_no = filtered[0].chg_tel_no;
      //   this.popupFormData.zip_no = filtered[0].zip_no;
      //   this.popupFormData.biz_adr1 = filtered[0].biz_adr1;
      //   this.popupFormData.biz_adr2 = filtered[0].biz_adr2;
      //   this.popupFormData.eng_biz_adr1 = filtered[0].eng_biz_adr1;
      //   this.popupFormData.eng_biz_adr2 = filtered[0].eng_biz_adr2;
      //   this.popupFormData.country = filtered[0].country;
      // }
    }
  }

  /**
   * 수입사 변경시
   */
  onSelectionChangedImptCd(e): void {
    console.log('====onSelectionChangedImptCd======');

    // if (this.suspendValueChagned) {
    //   this.suspendValueChagned = false;
    //   return;
    // }
    if (!e || !e.event) {
      return;
    }

    // if (this.changes.length > 0) {
    //   this.suspendValueChagned = true;
    //   this.popupForm.instance.getEditor('expt_cd').option('value', e.previousValue);
    //   this.bizService.alertCannotChangeValue('expt_cd', '1');
    //   return;
    // }

    if (this.popupMode === 'Add') {

      this.changes = [];

      //   this.popupFormData.std_rate = 1;

      //   this.dsItemCd = []; // 품목
      this.popupFormData.impt_country = null;
      this.popupFormData.cont_no = null;
      this.dsContNo = [];
      this.dsItemCd = [];

      // this.popupFormData.sa_chg_nm = null;
      // this.popupFormData.sa_chg_tel_no = null;
      // this.popupFormData.zip_no = null;
      // this.popupFormData.biz_adr1 = null;
      // this.popupFormData.biz_adr2 = null;
      // this.popupFormData.eng_biz_adr1 = null;
      // this.popupFormData.eng_biz_adr2 = null;
      // this.popupFormData.country = null;
    }

    // 수출사 - 계약정보
    if (e && e.value) {
      const imptFiltered = this.dsImptCd.filter(impt => impt.cd === this.popupFormData.impt_cd);
      if (imptFiltered.length > 0) {
        this.popupFormData.impt_country = imptFiltered[0].country;
      }

      this.getContNo();
    }
  }

  /**
   * 확정일 변경시
   */
  onSelectionChangedSlipDate(e): void {
    console.log('====onSelectionChangedSlipDate======');

    if (!e || !e.event) {
      return;
    }

    // if (this.changes.length > 0) {
    //   this.suspendValueChagned = true;
    //   this.popupForm.instance.getEditor('expt_cd').option('value', e.previousValue);
    //   this.bizService.alertCannotChangeValue('expt_cd', '1');
    //   return;
    // }

    if (this.popupMode === 'Add') {

      this.changes = [];
      //   this.popupFormData.std_rate = 1;

      //   this.dsItemCd = []; // 품목
      this.popupFormData.cont_no = null;
      this.dsContNo = [];
      this.dsItemCd = [];

      // this.popupFormData.sa_chg_nm = null;
      // this.popupFormData.sa_chg_tel_no = null;
      // this.popupFormData.zip_no = null;
      // this.popupFormData.biz_adr1 = null;
      // this.popupFormData.biz_adr2 = null;
      // this.popupFormData.eng_biz_adr1 = null;
      // this.popupFormData.eng_biz_adr2 = null;
      // this.popupFormData.country = null;
    }

    // 수출사 - 계약정보
    if (e && e.value) {
      this.getContNo();
    }
  }

  async getContNo(): Promise<void> {
    // this.changes = [];
    // this.dsItemCd = [];
    // this.setItemGridData([]);
    const res = await this.bizService.getContNoWithCustCdAndImptCd({
      expt_cd: this.popupFormData.expt_cd,
      impt_cd: this.popupFormData.impt_cd,
      dt: this.popupFormData.slipdate,
    });

    if (res.success) {
      if (res.data.length > 0) {
        // @ts-ignore
        this.popupFormData.cont_no = res.data[0].cont_no;
        // @ts-ignore
        this.dsItemCd = res.data[0].exptCondItem;
      }
    }

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

  async execInvoiceProcess(e): Promise<void> {
    if (!this.popupFormData.exportslip_cd) {
      return;
    }

    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_confirmation'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    const data = {
      exportslip_cd: this.popupFormData.exportslip_cd,
      modifiedby: Number(this.sessionUserId),
    };

    const res = await this.service.execInvoiceProcess(this.popupFormData);
    if (res.success) {
      this.popupVisible = false;
      this.utilService.notify_success('success');
      this.onSearch();
    } else {
      this.utilService.notify_error(res.msg);
    }
  }

  async onSerialUploadClick(): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      try {
        const sendData = await this.serialDataSource.store().load();

        // 예정수량 대비 체크
        if (this.currQty !== sendData.length) {
          // 예정수량과 시리얼수량이 일치하지 않습니다.
          const expectedQtyMsg = this.utilService.convert('rcvDetail.expectQty1');
          const tagQtyMsg = this.utilService.convert('rcvDetail.tagQty');
          const msg = this.utilService.convert('not_equal_values', expectedQtyMsg, tagQtyMsg);
          this.utilService.notify_error(msg);
          return;
        }

        this.serialDataSource.reload();
        this.popupGrid.instance.cellValue(this.serialFormData.rowIdx, 'serialList', sendData);
        this.popupGrid.instance.cellValue(this.serialFormData.rowIdx, 'tagQty', sendData.length);
        this.utilService.notify_success('Save success');
        this.onSerialPopupClear();
        this.serialPopupVisible = false;
        return;
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  onSerialCancelClick(): void {
    this.onSerialPopupClear();
    this.serialPopupVisible = false;
  }

  onSerialPopupClear(): void {
  }

  async onSerialDeleteClick(e): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      const result = await this.service.deleteInvoiceSerial({
        item_cd: this.currItemCd,
        exportslip_cd: this.popupFormData.exportslip_cd
      });
      try {
        if (result.success) {
          this.fileUploader.instance.reset();
          this.serialEntityStore.clear();
          await this.serialDataSource.reload();
          // this.subGrid.instance.cellValue(this.subGrid.focusedRowIndex, 'tagQty', 0);
          // this.subGrid.instance.saveEditData();
          this.utilService.notify_success('Delete success');
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  async onSerialFileUploader(fileUploader: DxFileUploaderComponent): Promise<void> {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = fileUploader.value[0];

    if (!file) {
      return;
    }

    let Sheet1 = [];
    reader.onload = (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      Sheet1 = mapData.Sheet1;
      const serialList = [];
      for (const key in Sheet1) {
        if (Sheet1.hasOwnProperty(key)) {
          if (!Sheet1[key].serial) {
            continue;
          }

          Sheet1[key].item_cd = this.currItemCd;
          Sheet1[key].exportslip_cd = this.popupFormData.exportslip_cd;
          serialList.push(Sheet1[key]);
        }
      }

      this.serialEntityStore = new ArrayStore(
        {
          data: serialList,
          key: 'serial'
        }
      );

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });

      this.serialDataSource.reload();
    };

    reader.readAsBinaryString(file);

    this.fileUploader.instance.reset();
  }

  onResetFileUploader(fileUploader: DxFileUploaderComponent): void {

    this.serialEntityStore.clear();
    this.serialDataSource.reload();

    fileUploader.instance.reset();

    // this.onSerialPopupClick(null, this.subGrid.focusedRowIndex);

    this.serialEntityStore = new ArrayStore(
      {data: [], key: 'serial'});

    this.serialDataSource = new DataSource({
      store: this.serialEntityStore
    });
  }

  onSerialPopupClosed(e): void {
    this.serialForm.instance.resetValues();
    this.serialEntityStore.clear();
    this.serialDataSource.reload();
  }

  onSerialPopupShown(e): void {
    const rowIdx = this.serialFormData.rowIdx;
    this.serialFormData.qty = this.popupGrid.instance.cellValue(rowIdx, 'qty');
    this.serialFormData.item_cd = this.popupGrid.instance.cellValue(rowIdx, 'item_cd');

    this.serialPopupVisible = true;

    this.utilService.setPopupGridHeight(this.serialPopup, this.serialForm, this.tagGrid);
    this.tagGrid.instance.repaint();
  }

  // 품목정보 업로드 팝업 툴바
  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('serialTemplete', '양식다운로드'),
        onClick: this.downloadExcel.bind(this)
      }
    });

    newToolbarItems.push({  // 자동생성
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('saor250.generateSerial', '자동생성'),
        onClick: this.generateSerial.bind(this)
      }
    });

    e.toolbarOptions.items = newToolbarItems;
  }

  async downloadExcel(): Promise<void> {
    this.utilService.downloadSerialExcel();
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.instance.deselectAll();
    grid.focusedRowIndex = index;
  }

  // 추가버튼 이벤트
  addClick(): void {
    if (!this.isExptOk()) {
      return;
    }
    // if (this.popupFormData.out_stat !== '0') {  // 작업상태가 주문등록일때만 행추가 가능.
    //   return;
    // }
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

    // if (!this.popupFormData.cont_no) {
    //   const msg = this.utilService.convert('com_select_obj', this.utilService.convert1('sales.cont_no', '계약번호', 'Contract No'));
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('cont_no').focus();
    //   return false;
    // }

    if (!this.popupFormData.ptrn_cd) {
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.ptrn_cd'));
      this.utilService.notify_error(msg);
      this.popupForm.instance.getEditor('ptrn_cd').focus();
      return false;
    }

    // if (!this.popupFormData.sa_wh_cd) {
    //   const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.sales_wh_nm'));
    //   this.utilService.notify_error(msg);
    //   this.popupForm.instance.getEditor('sa_wh_cd').focus();
    //   return false;
    // }

    return true;
  }

  // 품목변경시 단가세팅
  async setItemCdValue(rowData: any, value: any): Promise<void> {
    rowData.bom = null; // BOM 초기화
    rowData.item_cd = value;

    // 세트상품 여부
    const filtered = this.dsFullitemCd.filter(el => el.item_cd === value);
    rowData.spec_nm = filtered.length > 0 ? filtered[0].spec_nm : null;
    rowData.serial_yn = filtered.length > 0 ? filtered[0].serial_yn : null;

    // 가용재고
    rowData.ava_sto_qty = await this.calcAvaStoQty(rowData.item_cd);
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

  // grid edit 제어
  allowEditing(e): any {
    return (this.popupFormData.wrk_stat === '9') ? false : true;
  }

  /**
   * 시리얼 자동생성
   */
  async generateSerial(): Promise<void> {
    const data = {
      expt_cd: this.popupFormData.expt_cd,
      item_cd: this.serialFormData.item_cd,
      qty: this.serialFormData.qty,
    };
    const res = await this.service.selectNotUsingInvoiceSerial(data);
    if (res.success) {
      this.serialEntityStore.clear();
      this.serialDataSource.reload();
      this.fileUploader.instance.reset();

      this.serialEntityStore = new ArrayStore(
        {data: res.data, key: 'serial'});

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });
    } else {
      this.utilService.notify_error('There was an error!');
    }
  }
}
