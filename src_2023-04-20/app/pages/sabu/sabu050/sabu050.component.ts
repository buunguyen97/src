import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxAccordionComponent, DxDataGridComponent, DxDateBoxComponent, DxFormComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {Sabu050Service, Sabu050VO} from './sabu050.service';

@Component({
  selector: 'app-sabu050',
  templateUrl: './sabu050.component.html',
  styleUrls: ['./sabu050.component.scss']
})
export class Sabu050Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid1', {static: false}) mainGrid1: DxDataGridComponent;
  @ViewChild('mainGrid2', {static: false}) mainGrid2: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  // Form
  mainFormData: Sabu050VO = {} as Sabu050VO;
  // Grid
  mainGrid1DataSource: DataSource;
  mainGrid1EntityStore: ArrayStore;
  mainGrid2DataSource: DataSource;
  mainGrid2EntityStore: ArrayStore;
  mainGrid1key = 'ord_no';
  mainGrid2key = 'ord_seq';

  // DataSet
  dsCustCd = []; // 거래처
  dsMonyUnit = []; // 화폐
  dsWrkStat = []; // 작업상태
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsWhCd = []; // 창고
  dsUnitStyle = []; // 단위
  filteredWhCd = [];
  dsCopyWhCd = [];

  // summary
  searchList = [];

  GRID_STATE_KEY = 'sabu_sabu050_1';
  saveStateMain1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main1');
  loadStateMain1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main1');
  saveStateMain2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main2');
  loadStateMain2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main2');

  constructor(public utilService: CommonUtilService,
              private service: Sabu050Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private bizService: BizCodeService,) {
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
    this.onValueChangedPurCd = this.onValueChangedPurCd.bind(this);
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
    // 결재상태
    this.dsWrkStat = [{cd: '5', nm: this.utilService.convert1('sales.order', '발주', 'Order')},
      {cd: '9', nm: this.utilService.convert1('sales.order_stop', '발주중지', 'Order Stop')}
    ];

    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '2', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnitStyle = result.data;
    });

    // 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('fromOrdDate').option('value', this.bizService.getDay(7, '-'));
    // this.mainForm.instance.getEditor('toOrdDate').option('value', this.bizService.getDay(7, '+'));
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
      this.mainFormData.fromOrdDate = document.getElementsByName('fromOrdDate').item(1).getAttribute('value');
      this.mainFormData.toOrdDate = document.getElementsByName('toOrdDate').item(1).getAttribute('value');

      if (!!this.mainGrid2DataSource) {
        this.mainGrid2EntityStore.clear();
        this.mainGrid2DataSource.reload();
      }
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

  // 구매발주서 버튼 이벤트
  async onViewReportPurOrd(): Promise<void> {
    const selectList = await this.mainGrid1.instance.getSelectedRowsData();
    const arrOrdNo = new Array();

    if (selectList.length > 0) {
      for (const selectRow of selectList) {
        arrOrdNo.push(selectRow.ord_no);
      }
      const reportFile = 'file=purchaseOrder.jrf';
      const reportOption = [
        {
          dataSet: 'DataSet0', // report file안에 dataset 명
          node: 'data', // api response data node 명
          path: '/sales-service/report/purchaseOrderHeader', // api request url
          apiParam: { // api request Param
            ord_no: arrOrdNo
          }
        },
        {
          dataSet: 'DataSet1',
          node: 'data',
          path: '/sales-service/report/purchaseOrderData',
          apiParam: {
            ord_no: arrOrdNo
          }
        }
      ];
      this.utilService.openViewReport(reportFile, reportOption, false, 0, 'SL');
    } else {
      let msg = '체크된 발주번호가 없습니다.';
      if (this.utilService.getLanguage() !== 'ko') {
        msg = 'There is no checked order number.';
      }
      this.utilService.notify_error(msg);
      return;
    }
    console.log(arrOrdNo);
  }

  /**
   *  이벤트 메소드 END
   */

  onValueChangedPurCd(e): void {
    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.mainForm.instance.getEditor('purCd').option('value'));

  }

}
