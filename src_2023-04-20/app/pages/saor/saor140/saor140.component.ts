import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {Saor140Service, Saor140VO} from './saor140.service';

@Component({
  selector: 'app-saor140',
  templateUrl: './saor140.component.html',
  styleUrls: ['./saor140.component.scss']
})

export class Saor140Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromOutDate', {static: false}) fromOutDate: DxDateBoxComponent;
  @ViewChild('toOutDate', {static: false}) toOutDate: DxDateBoxComponent;

  G_TENANT: any;
  key = 'out_ord_no';

  // Grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;
  dsSubGrid: DataSource;
  entityStoreSubGrid: ArrayStore;
  userGroup: any;

  mainFormData: Saor140VO = {} as Saor140VO;

  dsPort = []; // 항구
  dsUser = []; // 사용자
  dsUnit = []; // 단위
  dsOrdGb = []; // 주문구분
  dsExptCd = []; // 수출사
  userCompany: any;

  // Grid State
  GRID_STATE_KEY = 'saor_saor140_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');


  constructor(public utilService: CommonUtilService,
              public bizService: BizCodeService,
              private service: Saor140Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.ordGbNm = this.ordGbNm.bind(this);
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
  }

  ngOnInit(): void {

    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => {
      this.dsPort = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnit = result.data;
    });

    // 주문구분
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
      {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
      {cd: '3', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')}];

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
  }

  ngAfterViewInit(): void {
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기

    this.initForm();
    this.utilService.getGridHeight(this.subGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOutDate.value = rangeDate.fromDate;
    this.toOutDate.value = rangeDate.toDate;

  }

  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromOutDate = document.getElementsByName('fromOutDate').item(1).getAttribute('value');
      this.mainFormData.toOutDate = document.getElementsByName('toOutDate').item(1).getAttribute('value');

      // Sub 그리드 비우기.
      if (!!this.dsSubGrid) {
        this.entityStoreSubGrid.clear();
        this.dsSubGrid.reload();
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

        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);

        this.onSearchSub('', '', '');
      }
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  onFocusedRowChanged(e, grid): void {
    console.log("onFocusedRowChanged   ROW Changing");
    // grid.focusedRowIndex = e.rowIndex;

    if (e.row) {
      this.onSearchSub(e.row.key, e.row.data.out_ord_no, e.row.data.tenant);  // 상세조회
    }
  }

  // 조회
  async onSearchSub(key: string, outOrdNo: string, tenant: string): Promise<void> {
    if (outOrdNo) {
      // Service의 get 함수 생성
      const result = await this.service.subList({uid: key, out_ord_no: outOrdNo, tenant});

      // 조회 결과가 success이면 화면표시, 실패면 메시지 표시

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.subGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        this.entityStoreSubGrid = new ArrayStore(
          {
            data: result.data,
            key: 'item_cd'
          }
        );
        // ArrayStore - DataSource와 바인딩.
        // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
        this.dsSubGrid = new DataSource({
          store: this.entityStoreSubGrid
        });
        // 그리드 상태가 수시로 저장되어 포커스가 있을경우 해당 포커스로 강제 페이지 이동되기 때문에, 그리드의 포커스 없앰
        // 페이징번호도 강제로 1페이지로 Fix
        // 참고 : grid1은 HTML에서 그리드의 이름이 #grid1로 명시되어 있으며, Behind 상단에 @ViewChild에 DxDataGridComponent로 선언되어 있음.
        this.subGrid.focusedRowKey = null;
        this.subGrid.paging.pageIndex = 0;
      }
    }
  }

  // 작업상태 표현식
  ordGbNm(rowData): any {

    let nm = '';
    if (this.utilService.getLanguage() === 'ko') {
      if (rowData.ord_gb === '1') {
        nm = '판매';
      } else if (rowData.ord_gb === '2') {
        nm = '렌탈';
      } else if (rowData.ord_gb === '3') {
        nm = '견본,타계정';
      }
    } else {
      if (rowData.ord_gb === '1') {
        nm = 'Sale';
      } else if (rowData.ord_gb === '2') {
        nm = 'Rental';
      } else if (rowData.ord_gb === '3') {
        nm = 'Sample';
      }
    }
    return nm;
  }
}
