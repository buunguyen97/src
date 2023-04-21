import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacl030Service, Sacl030VO} from './sacl030.service';

@Component({
  selector: 'app-sacl030',
  templateUrl: './sacl030.component.html',
  styleUrls: ['./sacl030.component.scss']
})
export class Sacl030Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sacl030Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.allowEditing = this.allowEditing.bind(this);
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid1', {static: false}) mainGrid1: DxDataGridComponent;
  @ViewChild('mainGrid2', {static: false}) mainGrid2: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  dsActFlg     = []; // 사용여부
  dsCustCd     = []; // 거래처
  dsClsYn      = []; // 마감여부
  dsOrdGb      = []; // 주문구분

  dsUser       = []; // 사용자
  dsUnit       = []; // 단위

  now = this.utilService.getFormatMonth(new Date());

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sacl030VO = {} as Sacl030VO;

  // main grid
  dsMainGrid: DataSource;

  // Grid
  mainGrid1DataSource: DataSource;
  mainGrid1EntityStore: ArrayStore;
  mainGrid2DataSource: DataSource;
  mainGrid2EntityStore: ArrayStore;
  mainGrid1key = 'ord_no';
  mainGrid2key = 'uid';

  saveData: Sacl030VO;

  selectedRows: number[];
  selectedRowData: any;
  changes = [];
  subChanges = [];
  // key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sacl_sacl030_1';
  saveStateMain1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main1');
  loadStateMain1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main1');
  saveStateMain2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main2');
  loadStateMain2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main2');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    this.dsClsYn = [{cd: 'Y', nm: this.utilService.convert1('sales.close', '마감', 'Close')},
                    {cd: 'N', nm: this.utilService.convert1('sales.un_close', '미마감', 'UnClose')}];

    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.pur', '매입', 'Pur')},
                    {cd: '2', nm: this.utilService.convert1('sales.pur_rtn', '매입반품', 'Pur Recall')}];

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 수출사
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => { this.dsCustCd = result.data; });

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

      if (!!this.mainGrid2DataSource) {
        this.mainGrid2EntityStore.clear();
        this.mainGrid2DataSource.reload();
      }

      // this.mainFormData["userId"]  = this.sessionUserId;

      this.mainFormData.clsMon = document.getElementsByName('clsYM').item(1).getAttribute('value').replace(/-/gi, '');

      const result = await this.service.mainList(this.mainFormData);

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
      const saveContent = this.saveData as Sacl030VO;
      const detailList = this.bizService.collectGridData(this.subChanges, this.mainGrid2, this.G_TENANT);

      if ( !this.mainGrid2.instance.hasEditData() ) {
        //  변경된 데이터가 없습니다.
        const msg = this.utilService.convert('noChangedData');

        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.dtl_list', '상세 리스트', 'Detail List'));
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
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 매입마감 이벤트
  async onClsPur(): Promise<void> {

    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl030VO;
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

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.pur_close', '매입마감', 'Purchase Close'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      await this.mainGrid1.instance.saveEditData();

      // saveContent.gridList = detailList;
      saveContent.gridList = this.mainGrid1.instance.getSelectedRowsData();

      saveContent.createdby  = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;

      result = await this.service.clsPur(saveContent);

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

  // 매입마감 계산서정보 저장
  async onInvoiceSave(): Promise<void> {

    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl030VO;
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
      } else {
        for ( const items of detailList ) {
          if (items.pur_cls_yn_dp === 'N') {
            let msg = '계산서정보는 마감 후에 등록이 가능합니다.';
            if (this.utilService.getLanguage() !== 'ko') {
              msg = 'Invoice Info can be registered after the purchase close.';
            }
            this.utilService.notify_error(msg);
            return;
          }
        }
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.invoice_info', '계산서정보', 'Invoice Info'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      await this.mainGrid1.instance.saveEditData();

      // saveContent.gridList = detailList;
      saveContent.gridList = this.mainGrid1.instance.getSelectedRowsData();

      saveContent.createdby  = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;

      result = await this.service.clsInvoceSave(saveContent);

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

  // grid edit 제어
  allowEditing(e): boolean {
    return !this.selectedRowData.pur_cls_yn;
  }

  // row별 Edit 제어
  onEditorPreparing(e): void {
    if (e.dataField === 'invoice_yn' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.pur_cls_yn && e.row.data.pur_cls_yn_dp === 'Y' ? false : true;
    }

    if (e.dataField === 'wrk_dt' && e.parentType === 'dataRow'){
      e.editorOptions.disabled = e.row.data.pur_cls_yn && e.row.data.pur_cls_yn_dp === 'Y' ? false : true;
    }

    if (e.command === 'select') {
      if (e.parentType === 'dataRow' && e.row) {
      } else if (e.parentType === 'headerRow') {
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
      if (rows.data.pur_cls_yn !== e.value) {
        this.mainGrid1.instance.cellValue(rows.rowIndex, 'pur_cls_yn', e.value);
      }
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

  setPurClsYn(rowData: any, value: any): void {
    rowData.pur_cls_yn = value;

    if (!value) {
      rowData.invoice_yn = 'N';
      rowData.wrk_dt = null;
    }
  }

  setInpAmt(rowData: any, value: any, currentRowData: any): void {
    rowData.inp_amt = value;

    if (currentRowData.vat_rate) {
      rowData.inp_vat_amt = Math.floor((rowData.inp_amt * currentRowData.vat_rate) / 10) * 10;
    }
  }

  // calcOrdVatAmt(rowData: any): number {
  //   const o = 10;
  //   const val = rowData.inp_amt * rowData.vat_rate;
  //   const calc = isNaN(val) ? 0 : Math.floor(val / o) * o;
  //   (this as any).defaultSetCellValue(rowData, calc);
  //   return calc;
  // }
}
