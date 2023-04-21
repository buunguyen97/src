import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sast060Service, Sast060VO} from './sast060.service';

@Component({
  selector: 'app-sast060',
  templateUrl: './sast060.component.html',
  styleUrls: ['./sast060.component.scss']
})

export class Sast060Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sast060Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('fromMatDt', {static: false}) fromMatDt: DxDateBoxComponent;
  @ViewChild('toMatDt', {static: false}) toMatDt: DxDateBoxComponent;

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sast060VO = {} as Sast060VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  dsITEMTP = [];
  dsMatY = [];
  dsMatM = [];
  dsITEMGROP = [];
  dsITEMGB = [];
  dsItemCategory1Id = [];
  dsItemCategory2Id = [];
  dsItemCategory3Id = [];
  dsCustCd = [];
  dsItemCd = [];
  dsDamageFlg = [];
  dsCustGb = [];

  searchList = [];

  now = this.utilService.getFormatMonth(new Date());

  key = ['item_cd', 'ptrn_cd', 'mat_dt', 'owner', 'wh_cd', 'lot_no'];

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {

  }

  initCode(): void {
    this.dsCustGb = [{cd: '2', nm: this.utilService.convert('sales.expt_cd')}
      , {cd: '4', nm: this.utilService.convert('sales.impt_cd')}
      , {cd: '3', nm: this.utilService.convert('sales.ptrn_cd')}];

    this.codeService.getCode(this.G_TENANT, 'ITEMTP').subscribe(result => {
      this.dsITEMTP = result.data;
    }); // 품목유형
    this.codeService.getCode(this.G_TENANT, 'ITEMGROUP').subscribe(result => {
      this.dsITEMGROP = result.data;
    }); // 품목군
    this.codeService.getCode(this.G_TENANT, 'ITEMGB').subscribe(result => {
      this.dsITEMGB = result.data;
    }); // 품목구분
    this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => {
      this.dsItemCategory1Id = result.data;
    }); // 폼목카테고리1
    this.codeService.getItemCategory2(this.G_TENANT).subscribe(result => {
      this.dsItemCategory2Id = result.data;
    }); // 폼목카테고리2
    this.codeService.getItemCategory3(this.G_TENANT).subscribe(result => {
      this.dsItemCategory3Id = result.data;
    }); // 폼목카테고리3

    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsCustCd = result.data;
    });
    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initForm();
    this.initCode();
    this.utilService.getGridHeight(this.mainGrid);

  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromMatDt.value = rangeDate.fromDate;
    this.toMatDt.value = rangeDate.toDate;
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
      // this.mainFormData.matYm = document.getElementsByName('matYm').item(1).getAttribute('value').replace(/-/gi, '');
      this.mainFormData.fromMatDt = document.getElementsByName('fromMatDt').item(1).getAttribute('value');
      this.mainFormData.toMatDt = document.getElementsByName('toMatDt').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);
      this.searchList = result.data;

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
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
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  /**
   *  이벤트 메소드 END
   */

}
