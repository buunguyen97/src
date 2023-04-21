import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxFileUploaderComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {InvoiceUpVO, Saca040Service, Saca040VO} from './saca040.service';
import * as XLSX from 'xlsx';
import {Workbook} from 'exceljs';
import {exportDataGrid} from 'devextreme/excel_exporter';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-saca040',
  templateUrl: './saca040.component.html',
  styleUrls: ['./saca040.component.scss']
})
export class Saca040Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saca040Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
    this.onInvoiceDownloadClick = this.onInvoiceDownloadClick.bind(this);
    this.onInvoiceUpSaveClick = this.onInvoiceUpSaveClick.bind(this);

    this.trafficFilter = [
      {
        text: 'Y',
        value: ['isRed', '=', true]
      },
      {
        text: 'N',
        value: ['isRed', '=', false]
      }
    ];
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('invoiceResultGrid', {static: false}) invoiceResultGrid: DxDataGridComponent;
  @ViewChild('invoiceResultForm', {static: false}) invoiceResultForm: DxFormComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('downloadFileBtn', {static: false}) downloadFileBtn: DxButtonComponent;
  @ViewChild('deleteFileBtn', {static: false}) deleteFileBtn: DxButtonComponent;

  dsExptCd     = []; // 거래처(수출사)
  dsOrdGb      = []; // 주문구분
  dsInvoiceFg  = []; // 발행구분

  now = this.utilService.getFormatMonth(new Date());

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Saca040VO = {} as Saca040VO;

  // main grid
  dsMainGrid: DataSource;

  entityStoreMainGrid: ArrayStore;

  // 품목정보 업로드 popup설정
  invoiceUpPopupVisible = false;
  invoiceUpDataSource: DataSource;
  invoiceUpEntityStore: ArrayStore;
  invoiceUpFormData: any;
  invoiceUpSaveData: InvoiceUpVO;
  trafficFilter = [];
  currItemCd: any;

  saveData: Saca040VO;

  selectedRows: number[];
  key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'saca_saca040_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateBeginInv = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_upload');
  saveStateBeginInv = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_upload');

  exportNo = false;
  exportColumn = true;

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
                    {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
                    // {cd:"3", nm:"견본,타계정"}
                   ];

    this.dsInvoiceFg = [{cd: '0', nm: this.utilService.convert1('sales.invoice_type_tax', '정발행', 'Issuance of Tax Invoice')},
                        {cd: '1', nm: this.utilService.convert1('sales.invoice_type_reverse', '역발행', 'Reverse Issuance of Tax Invoice')}];

    // 수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => { this.dsExptCd = result.data; });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set

    if ( this.userGroup === '2' ) {
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

      // this.mainFormData["userId"]  = this.sessionUserId;

      this.mainFormData.clsYM = document.getElementsByName('clsYM').item(1).getAttribute('value').replace(/-/gi, '');

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

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 엑셀 다운로드
  async onInvoiceDownloadClick(e: any): Promise<void> {

    const dataGrid   = this.mainGrid.instance;

    const totalCount = dataGrid.totalCount();

    const ext = '.xlsx';
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const fnCustomizeCell = (options) => {
      const {gridCell, excelCell} = options;

    };

    // 엑셀 파일명
    let fileName = '';

    exportDataGrid({
      component: dataGrid,
      worksheet,
      autoFilterEnabled: false,
      customizeCell: fnCustomizeCell
    }).then((r) => {
      if (totalCount > 100) {
        worksheet.spliceColumns(4, 8);

        fileName = '2. 세금계산서등록양식(일반)_대량 ' + totalCount + '건';
      } else {
        fileName = '1. 세금계산서등록양식(일반) ' + totalCount + '건';
      }

      // 번호 컬럼 삭제
      worksheet.spliceColumns(1, 1);

      if (!fileName.endsWith(ext)) {
        fileName += ext;
      }

      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], {type: 'application/octet-stream'}), fileName);
      });
    });

    e.cancel = true;
  }

  async onInvoiceUploadClick(e): Promise<void> {
    this.invoiceUpPopupVisible = true;
  }

  onInvoiceUpPopupClose(e): void {
    this.invoiceResultForm.instance.resetValues();

    if (!!this.invoiceUpDataSource) {
      this.invoiceUpEntityStore.clear();
      this.invoiceUpDataSource.reload();
      this.fileUploader.instance.reset();
    }
  }

  // 업로드 저장
  async onInvoiceUpSaveClick(): Promise<void> {
    const dataItems = this.invoiceUpDataSource.items();
    console.log(dataItems);

    if ((dataItems !== undefined) && (dataItems.length > 0)) {
      try {

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));

        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        this.invoiceUpSaveData = {tenant: this.G_TENANT, ...this.invoiceUpSaveData};
        const saveContent = this.invoiceUpSaveData as InvoiceUpVO;
        saveContent.invoiceList = dataItems;
        saveContent.createdby = this.sessionUserId;
        saveContent.modifiedby = this.sessionUserId;

        const result = await this.service.saveInvoiceUp(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          await this.invoiceUpDataSource.reload();
          this.invoiceUpPopupVisible = false;
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  onInvoiceUpCancelClick(): void {
    this.invoiceUpPopupVisible = false;
  }

  // 액셀파일 업로더
  async onInvoiceUpFileUploader(fileUploader: DxFileUploaderComponent): Promise<void> {

    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = fileUploader.value[0];

    if (!file) {
      return;
    }

    let Sheet1 = [];
    reader.onload = async (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type : 'binary'});

      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];

        const range = XLSX.utils.decode_range(sheet['!ref']);
        range.s.r = 5;
        const newRange = XLSX.utils.encode_range(range);

        initial[name] = XLSX.utils.sheet_to_json(sheet, { range: newRange });
        return initial;
      }, {});

      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      Sheet1 = mapData.세금계산서;

      for (const key in Sheet1) {
        if (Sheet1.hasOwnProperty(key)) {
          // console.log(Sheet1[key]);

          Sheet1[key].wrk_dt = Sheet1[key].작성일자;
          Sheet1[key].supplier_biz_no = Sheet1[key].공급받는자사업자등록번호.toString();
          Sheet1[key].supplier_biz_nm = Sheet1[key].상호_1;
          Sheet1[key].invoice_tot_amt = Sheet1[key].합계금액;
          Sheet1[key].invoice_appr_no = Sheet1[key].승인번호;
        }
      }

      this.invoiceUpEntityStore = new ArrayStore({
        data: Sheet1,
        key: 'invoice_appr_no'
      });

      this.invoiceUpDataSource = new DataSource({
        store: this.invoiceUpEntityStore
      });
    };

    reader.readAsBinaryString(file);
  }

  onInvoiceUpResetFileUploader(fileUploader: DxFileUploaderComponent): void {

    this.invoiceUpEntityStore.clear();
    this.invoiceUpDataSource.reload();
    fileUploader.instance.reset();

    this.invoiceUpEntityStore = new ArrayStore(
      {data: [], key: 'invoice_appr_no'});

    this.invoiceUpDataSource = new DataSource({
      store: this.invoiceUpEntityStore
    });
  }

}
