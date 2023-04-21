import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacl040Service, Sacl040VO} from './sacl040.service';

@Component({
  selector: 'app-sacl040',
  templateUrl: './sacl040.component.html',
  styleUrls: ['./sacl040.component.scss']
})
export class Sacl040Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sacl040Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.ordGbNm = this.ordGbNm.bind(this);
    this.allowEditing = this.allowEditing.bind(this);

    // this.dsMainGrid = new ArrayStore({
    //  key: 'ID',
    //  data: service.getEmployees(),
    // });
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  dsExptCd     = []; // 거래처(수출사)
  dsOrdGb      = []; // 주문구분
  dsClsYn      = []; // 마감구분
  dsInvoiceFg  = []; // 발행구분

  dsUser       = []; // 사용자

  fromMonth = this.utilService.getFormatMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()));
  toMonth = this.utilService.getFormatMonth(new Date());

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sacl040VO = {} as Sacl040VO;

  // main grid
  dsMainGrid: DataSource;


    entityStoreMainGrid: ArrayStore;

  saveData: Sacl040VO;

  selectedRows: number[];
  changes = [];
  key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sacl_sacl040_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');

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

    this.dsInvoiceFg = [{cd: '0', nm: this.utilService.convert1('sales.invoice_type_tax', '정발행', 'Issuance of Tax Invoice')},
                        {cd: '1', nm: this.utilService.convert1('sales.invoice_type_reverse', '역발행', 'Reverse Issuance of Tax Invoice')}];

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
      this.mainFormData.fromClsYM = document.getElementsByName('fromClsYM').item(1).getAttribute('value').replace(/-/gi, '');
      this.mainFormData.toClsYM = document.getElementsByName('toClsYM').item(1).getAttribute('value').replace(/-/gi, '');

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
  // 저장버튼 이벤트
  async onSave(): Promise<void> {

    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl040VO;

      const selectedRows = this.mainGrid.instance.getSelectedRowsData();

      if ( selectedRows.length === 0 ) {
        let msg = '체크된 세금계산서가 없습니다.';
        if ( this.utilService.getLanguage() !== 'ko' ) {
            msg = 'There is no checked tax invoice.';
        }
        this.utilService.notify_error(msg);
        return;
      }

      const visibleRows = this.mainGrid.instance.getVisibleRows();
      const detailList = [];
      for ( const items of visibleRows ) {
        if ( items.isSelected ) {
          const invoice_type = items.data.invoice_type;

          if ( !invoice_type ) {
            let msg = '발행구분은 필수입력 항목입니다.';
            if ( this.utilService.getLanguage() !== 'ko' ) {
              msg = 'Tax Invoice Issuance type is a required entry.';
            }
            this.utilService.notify_error(msg);
            return;
          } else {
            if (items.data.invoice_type === '0') {
              const wrkDt = items.data.wrk_dt;
              if ( !wrkDt ) {
                let msg = '작성일자는 필수입력 항목입니다.';
                if ( this.utilService.getLanguage() !== 'ko' ) {
                  msg = 'Issue date is a required entry.';
                }
                this.utilService.notify_error(msg);
                return;
              }
            }
          }

          detailList.push(items.data);
        }
      }

      console.log(detailList);

      // tslint:disable-next-line:max-line-length
      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.invoice_close', '세금계산서마감', 'Invoice Close'));

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
  ordGbNm(rowData): any {
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
  allowEditing(e): any {
    return true;
  }

}
