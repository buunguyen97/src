import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacl020Service, Sacl020VO} from './sacl020.service';

@Component({
  selector: 'app-sacl020',
  templateUrl: './sacl020.component.html',
  styleUrls: ['./sacl020.component.scss']
})
export class Sacl020Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sacl020Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.allowEditing = this.allowEditing.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('mainGrid2', {static: false}) mainGrid2: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('fromDepoDate', {static: false}) fromDepoDate: DxDateBoxComponent;
  @ViewChild('toDepoDate', {static: false}) toDepoDate: DxDateBoxComponent;

  dsExptCd     = []; // 거래처(수출사)
  dsOrdGb      = []; // 주문구분
  dsClsYn      = []; // 마감여부

  dsUser       = []; // 사용자

  now = this.utilService.getFormatMonth(new Date());

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sacl020VO = {} as Sacl020VO;

  // main grid
  //   dsMainGrid: DataSource;
  //   entityStoreMainGrid: ArrayStore;

  // Grid
  mainGrid1DataSource: DataSource;
  mainGrid1EntityStore: ArrayStore;
  mainGrid2DataSource: DataSource;
  mainGrid2EntityStore: ArrayStore;
  mainGrid1key = 'uid';
  mainGrid2key = 'uid';

  saveData: Sacl020VO;

  selectedRows1: number[];
  selectedRows2: number[];
  changes = [];
  // key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sacl_sacl020_1';
  loadStateMain1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main1');
  saveStateMain1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main1');
  loadStateMain2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main2');
  saveStateMain2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main2');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
                    {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
                    // {cd:"3", nm:"견본,타계정"}
                    {cd: '4', nm: this.utilService.convert1('sales.sale_rtn', '판매반품', 'Sale Return')},
                    {cd: '5', nm: this.utilService.convert1('sales.rental_rtn', '렌탈반품', 'Rental Return')},
                    // {cd:"6", nm:"견본,타계정반품"}
                  ];

    this.dsClsYn = [{cd: 'Y', nm: this.utilService.convert1('sales.close', '마감', 'Close')},
                    {cd: 'N', nm: this.utilService.convert1('sales.un_close', '미마감', 'UnClose')}];

    // 수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => { this.dsExptCd = result.data; });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromDepoDate.value = rangeDate.fromDate;
    this.toDepoDate.value = rangeDate.toDate;

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
      this.mainFormData.clsMon = document.getElementsByName('clsYM').item(1).getAttribute('value').replace(/-/gi, '');
      this.mainFormData.fromDepoDate = document.getElementsByName('fromDepoDate').item(1).getAttribute('value');
      this.mainFormData.toDepoDate = document.getElementsByName('toDepoDate').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
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
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }

      const result2 = await this.service.mainList2(this.mainFormData);

      if (!result2.success) {
        this.utilService.notify_error(result2.msg);
        return;
      } else {
        this.mainGrid2.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainGrid2EntityStore = new ArrayStore(
          {
            data: result2.data,
            key: this.mainGrid2key,
          }
        );
        this.mainGrid2DataSource = new DataSource({
          store: this.mainGrid2EntityStore
        });
        this.mainGrid2.focusedRowKey = null;
        this.mainGrid2.paging.pageIndex = 0;

        const keys = this.mainGrid2.instance.getSelectedRowKeys();
        this.mainGrid2.instance.deselectRows(keys);
      }
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 채권마감 이벤트
  async onSave(): Promise<void> {

    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl020VO;
      // const detailList = this.bizService.collectGridData(this.changes, this.mainGrid, this.G_TENANT);

      // if ( !this.mainGrid.instance.hasEditData() ) {
      //   let msg = '변경항목이 없습니다.';
      //   if ( this.utilService.getLanguage() !== 'ko' ) {
      //       msg = 'There are no changes.';
      //   }
      //   this.utilService.notify_error(msg);
      //   return;
      // }

      const detailList1 = this.mainGrid.instance.getSelectedRowsData();

      if (detailList1.length === 0) {
        // 선택된 청구 데이터가 없습니다.
        const msg = this.utilService.convert('com_msg_noselectData2', this.utilService.convert1('sales.Claim', '청구', 'Claim'));

        this.utilService.notify_error(msg);
        return;
      }

      const detailList2 = this.mainGrid2.instance.getSelectedRowsData();

      if (detailList2.length === 0) {
        // 선택된 입금 데이터가 없습니다.
        const msg = this.utilService.convert('com_msg_noselectData2', this.utilService.convert1('sales.Depo', '입금', 'Deposit'));

        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.bond_close', '채권마감', 'Bond Close'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.gridList1 = detailList1;
      saveContent.gridList2 = detailList2;

      saveContent.createdby  = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;

      result = await this.service.mainSave(saveContent);

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

  // 마감취소 이벤트
  async onCancelSave(): Promise<void> {

    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl020VO;

      const detailList1 = this.mainGrid.instance.getSelectedRowsData();
      const detailList2 = this.mainGrid2.instance.getSelectedRowsData();

      if (detailList1.length === 0 && detailList2.length === 0) {
        // 선택된 청구&입금 데이터가 없습니다
        const msg = this.utilService.convert('com_msg_noselectData2', this.utilService.convert1('sales.Claim', '청구', 'Claim') + '&' + this.utilService.convert1('sales.Depo', '입금', 'Deposit'));

        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('sales.bond_close', '채권마감', 'Bond Close'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.gridList1 = detailList1;
      saveContent.gridList2 = detailList2;

      saveContent.createdby  = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;

      result = await this.service.mainDelete(saveContent);

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

  // 달력 년/월 표현식
  clsMon(rowData): any {
    const clsMon = rowData.cls_mon;
    const yy = clsMon.substring(0, 4);
    const mm = clsMon.substring(4, 6);
    const result = yy + '-' + mm;

    return result;
  }

  // grid edit 제어
  allowEditing(e): any {
    return true;
  }
}
