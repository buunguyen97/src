import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacl013Service, Sacl013VO} from './sacl013.service';

@Component({
  selector: 'app-sacl013',
  templateUrl: './sacl013.component.html',
  styleUrls: ['./sacl013.component.scss']
})
export class Sacl013Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sacl013Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.ordGbNm = this.ordGbNm.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.onSave = this.onSave.bind(this);
    // this.dsMainGrid = new ArrayStore({
    //  key: 'ID',
    //  data: service.getEmployees(),
    // });
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid1', {static: false}) mainGrid1: DxDataGridComponent;
  @ViewChild('mainGrid2', {static: false}) mainGrid2: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('fromSoDate', {static: false}) fromSoDate: DxDateBoxComponent;
  @ViewChild('toSoDate', {static: false}) toSoDate: DxDateBoxComponent;

  dsExptCd     = []; // 거래처(수출사)
  dsOrdGb      = []; // 주문구분
  dsClsYn      = []; // 마감구분

  dsUser       = []; // 사용자
  dsUnit       = []; // 단위

  fromMonth = this.utilService.getFormatMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()));
  toMonth = this.utilService.getFormatMonth(new Date());

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sacl013VO = {} as Sacl013VO;

  // main grid
  dsMainGrid: DataSource;

  // Grid
  mainGrid1DataSource: DataSource;
  mainGrid1EntityStore: ArrayStore;
  mainGrid2DataSource: DataSource;
  mainGrid2EntityStore: ArrayStore;
  mainGrid1key = 'uid';
  mainGrid2key = 'uid';
  // mainGrid2key = ['delay_start_dt', 'delay_end_dt', 'out_ord_no', 'out_ord_seq'];

  entityStoreMainGrid: ArrayStore;

  saveData: Sacl013VO;

  selectedRows: number[];
  selectedRowData: any;
  changes = [];
  subChanges = [];
  // key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sacl_sacl013_1';
  saveStateMain1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main1');
  loadStateMain1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main1');
  saveStateMain2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main2');
  loadStateMain2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main2');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
      {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
      // {cd:"3", nm:"견본,타계정"}
    ];

    this.dsClsYn = [{cd: 'Y', nm: this.utilService.convert1('sales.close', '마감', 'Close')},
      {cd: 'N', nm: this.utilService.convert1('sales.un_close', '미마감', 'UnClose')}];

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

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnit = result.data;
    });

    this.mainGrid1EntityStore = new ArrayStore(
      {
        data: [],
        key: this.mainGrid1key
      }
    );

    this.mainGrid1DataSource = new DataSource({
      store: this.mainGrid1EntityStore
    });

    this.mainGrid2EntityStore = new ArrayStore(
      {
        data: [],
        key: this.mainGrid2key
      }
    );

    this.mainGrid2DataSource = new DataSource({
      store: this.mainGrid2EntityStore
    });
  }

  ngAfterViewInit(): void {
    this.initForm();

    // this.utilService.getGridHeight(this.mainGrid1);
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.utilService.getGridHeight(this.mainGrid2);
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
      if (!!this.mainGrid2DataSource) {
        this.mainGrid2EntityStore.clear();
        this.mainGrid2DataSource.reload();
      }

      this.mainFormData.fromReqDate = document.getElementsByName('fromReqDate').item(1).getAttribute('value').replace(/-/gi, '');
      this.mainFormData.toReqDate = document.getElementsByName('toReqDate').item(1).getAttribute('value').replace(/-/gi, '');

      // console.log(this.mainFormData);

      const result = await this.service.mainList(this.mainFormData);

      // console.log(result);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid1.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainGrid1EntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.mainGrid1key,
          }
        );
        this.mainGrid1DataSource = new DataSource({
          store: this.mainGrid1EntityStore
        });
        this.mainGrid1.focusedRowKey = null;
        this.mainGrid1.paging.pageIndex = 0;

        const keys = this.mainGrid1.instance.getSelectedRowKeys();
        this.mainGrid1.instance.deselectRows(keys);
      }
    }
  }

  // 상세 그리드 조회
  async onDetailSearch(data): Promise<void> {
    const result = await this.service.detailList(data);

    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      this.mainGrid2.instance.cancelEditData();
      this.utilService.notify_success('search success');
      this.mainGrid2EntityStore = new ArrayStore(
        {
          data: result.data,
          key: this.mainGrid2key
        }
      );

      this.mainGrid2DataSource = new DataSource({
        store: this.mainGrid2EntityStore
      });
      this.mainGrid2.focusedRowKey = null;
      this.mainGrid2.paging.pageIndex = 0;
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 출고 데이터 수정
  async onSave(): Promise<void> {
    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl013VO;

      // console.log(this.subChanges);

      const detailList = this.bizService.collectGridData(this.subChanges, this.mainGrid2, this.G_TENANT);

      if ( !this.mainGrid2.instance.hasEditData() ) {
        //  변경된 데이터가 없습니다.
        const msg = this.utilService.convert('noChangedData');

        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.sales_dtl_list', '매출상세 리스트', 'Sales Detail List'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.gridList = detailList;
      saveContent.createdby  = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;

      result = await this.service.mainSave(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      }
      else {
        this.utilService.notify_success('Save success');
        this.onSearch();
      }
    } catch (e) {
      console.log(e);

      this.utilService.notify_error('There was an error!');
    }
  }

  // 매출마감 이벤트
  async onClsSales(): Promise<void> {

    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl013VO;
      // const detailList = this.bizService.collectGridData(this.changes, this.mainGrid1, this.G_TENANT);

      if ( !this.mainGrid1.instance.hasEditData() ) {
        //  변경된 데이터가 없습니다.
        const msg = this.utilService.convert('noChangedData');

        this.utilService.notify_error(msg);
        return;
      }

      const detailList = this.mainGrid1.instance.getSelectedRowsData();

      if (detailList.length === 0) {
        // 선택된 데이터가 없습니다.
        const msg = this.utilService.convert('com_msg_noselectData2', '');

        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.sale_close', '매출마감', 'Sales Close'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      await this.mainGrid1.instance.saveEditData();

      // saveContent.gridList = detailList;
      saveContent.gridList = this.mainGrid1.instance.getSelectedRowsData();

      saveContent.createdby  = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;


      result = await this.service.clsSales(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      }
      else {
        this.utilService.notify_success('Save success');
        // this.popupForm.instance.resetValues();
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }


  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }
  // 작업상태 표현식
  ordGbNm(rowData): string {
    let nm = '';
    if ( this.utilService.getLanguage() === 'ko' ) {
      if (      rowData.ord_gb === '1' ) { nm = '판매'; }
      else if ( rowData.ord_gb === '2' ) { nm = '렌탈'; }
    }
    else {
      if (      rowData.ord_gb === '1' ) { nm = 'Sale'; }
      else if ( rowData.ord_gb === '2' ) { nm = 'Rental'; }
    }

    return nm;
  }

  // grid edit 제어
  allowEditing(e): boolean {
    return !this.selectedRowData.sale_cls_yn;
  }

  // row별 Edit 제어
  onEditorPreparing(e): void {
    if (e.dataField === 'sale_cls_yn' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.invoice_cls_yn === 'Y' ? true : false;
    }

    // if (e.command === 'select' && e.parentType === 'dataRow') {
    //   e.editorOptions.disabled = e.row.data.invoice_cls_yn === 'Y' ? true : false;
    // }

    if (e.command === 'select') {
      console.log(e);

      if (e.parentType === 'dataRow' && e.row) {
        e.editorOptions.disabled = e.row.data.invoice_cls_yn === 'Y' ? true : false;
      } else if (e.parentType === 'headerRow') {
        console.log(e.value);
      }
    }
  }

  // 메인 그리드 로우 선택 함수
  onFocusedRowChanged(e): void {
    if (!!e.row) {
      this.selectedRowData = e.row.data;

      this.onDetailSearch(this.selectedRowData);
    }
  }

  selectAll(e): void {
    const visibleRows = this.mainGrid1.instance.getVisibleRows();

    for (const rows of visibleRows) {
      if (rows.data.sale_cls_yn !== e.value) {
        this.mainGrid1.instance.cellValue(rows.rowIndex, 'sale_cls_yn', e.value);
      }
      // this.mainGrid1.instance.byKey(rows.key).then(val => {
      //   val.sale_cls_yn = e.value;
      // });
    }
  }

  onSelectionChanged(e): void {
    // const selectedRowKey = e.currentSelectedRowKeys;
    //
    // for (const key of selectedRowKey) {
    //   this.mainGrid1.instance.byKey(key).then(val => {
    //     const saleClsYn = val.sale_cls_yn;
    //
    //     val.sale_cls_yn = !saleClsYn;
    //   });
    // }
    //
    // const deselectedRowKey = e.currentDeselectedRowKeys;
    //
    // for (const key of deselectedRowKey) {
    //   this.mainGrid1.instance.byKey(key).then(val => {
    //     const saleClsYn = val.sale_cls_yn;
    //
    //     val.sale_cls_yn = !saleClsYn;
    //   });
    // }
  }

  setOutOrdPrice(rowData: any, value: any, currentRowData: any): void {
    rowData.out_ord_pr = value;
    rowData.out_amt = value * currentRowData.rent_qty * currentRowData.delay_cnt;

    if (currentRowData.vat_rate) {
      rowData.out_vat_amt = Math.floor((rowData.out_amt * currentRowData.vat_rate) / 10) * 10;
    }
  }

  // setOutAmt(rowData: any, value: any, currentRowData: any): void {
  //   rowData.out_amt = value;
  //
  //   if (currentRowData.vat_rate) {
  //     rowData.out_vat_amt = Math.floor((rowData.out_amt * currentRowData.vat_rate) / 10) * 10;
  //   }
  // }

  // calcOrdVatAmt(rowData: any): number {
  //   const o = 10;
  //   const val = rowData.out_amt * rowData.vat_rate;
  //   const calc = isNaN(val) ? 0 : Math.floor(val / o) * o;
  //   (this as any).defaultSetCellValue(rowData, calc);
  //   return calc;
  // }
}
