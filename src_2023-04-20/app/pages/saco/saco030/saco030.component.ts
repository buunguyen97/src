import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { DxAccordionComponent, DxDataGridComponent, DxFormComponent } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import { CommonCodeService } from 'src/app/shared/services/common-code.service';
import { CommonUtilService } from 'src/app/shared/services/common-util.service';
import { GridUtilService } from 'src/app/shared/services/grid-util.service';
import { Saco030Service, Saco030VO } from './saco030.service';

@Component({
  selector: 'app-saco030',
  templateUrl: './saco030.component.html',
  styleUrls: ['./saco030.component.scss']
})
export class Saco030Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid1', {static: false}) mainGrid1: DxDataGridComponent;
  @ViewChild('mainGrid2', {static: false}) mainGrid2: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  // Form
  mainFormData: Saco030VO = {} as Saco030VO;

  // Grid
  mainGrid1DataSource: DataSource;
  mainGrid1EntityStore: ArrayStore;
  mainGrid2DataSource: DataSource;
  mainGrid2EntityStore: ArrayStore;
  mainGrid1key = 'claim_no';
  mainGrid2key = 'depo_no';

  // DataSet
  dsExptCd     = []; // 수출사
  dsUser       = []; // 사용자
  dsCaY		   = []; // 년도
  dsCaM		   = []; // 월

  // summary
  searchList = [];

  fromMonth = this.utilService.getFormatMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()));
  toMonth = this.utilService.getFormatMonth(new Date());

  GRID_STATE_KEY = 'saca_saca010_1';
  saveStateMain1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main1');
  loadStateMain1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main1');
  saveStateMain2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main2');
  loadStateMain2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main2');

  constructor(public utilService: CommonUtilService,
              private service: Saco030Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private bizService: BizCodeService) {
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.ordGbNm = this.ordGbNm.bind(this);
  }

  /**
   *  초기화 메소드 START
   */

  // 화면 로딩 시 실행 함수
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();

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

  // 그리드 초기화 함수
  ngAfterViewInit(): void {
    this.initForm();
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.utilService.getGridHeight(this.mainGrid2);
  }

  // 공통 코드
  initCode(): void {

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

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
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

      this.mainFormData.fromClaimCaYM = document.getElementsByName('fromClaimCaYM').item(1).getAttribute('value').replace(/-/gi, '');
      this.mainFormData.toClaimCaYM = document.getElementsByName('toClaimCaYM').item(1).getAttribute('value').replace(/-/gi, '');

      const result = await this.service.mainList(this.mainFormData);
      this.searchList = result.data;

      if (this.resultMsgCallback(result, 'Search')) {

        this.mainGrid1EntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.mainGrid1key
          }
        );

        this.mainGrid1DataSource = new DataSource({
          store: this.mainGrid1EntityStore
        });
        this.mainGrid1.focusedRowKey = null;
        this.mainGrid1.paging.pageIndex = 0;
      } else {
        return;
      }
    }
  }

  // 상세 그리드 조회
  async onDetailSearch(data): Promise<void> {
    const result = await this.service.detailList(data);

    if (this.resultMsgCallback(result, 'DetailSearch')) {

      this.mainGrid2EntityStore = new ArrayStore(
        {
          data: result.data.consItemList,
          key: this.mainGrid2key
        }
      );

      this.mainGrid2DataSource = new DataSource({
        store: this.mainGrid2EntityStore
      });
      this.mainGrid2.focusedRowKey = null;
      this.mainGrid2.paging.pageIndex = 0;
    } else {
      return;
    }
  }

  // 결과 메세지 함수
  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */

  // 검색영역 초기화 함수
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 메인 그리드 로우 선택 함수
  onFocusedRowChanged(e): void {
    if (!!e.row) {
      this.onDetailSearch(e.row.data);
    }
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

  // 달력 년/월 표현식
  clsMon(rowData): any {
    const clsMon = rowData.cls_mon;
    const yy = clsMon.substring(0, 4);
    const mm = clsMon.substring(4, 6);
    const result = yy + '-' + mm;

    return result;
  }
 /**
  *  이벤트 메소드 END
  */
}
