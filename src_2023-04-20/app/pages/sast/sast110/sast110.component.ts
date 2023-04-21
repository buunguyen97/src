import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sast110Service, Sast110VO} from './sast110.service';
import {HeaderComponent} from 'src/app/shared/components';

@Component({
  selector: 'app-sast110',
  templateUrl: './sast110.component.html',
  styleUrls: ['./sast110.component.scss']
})
export class Sast110Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sast110Service,
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

  @ViewChild('inOutYm', {static: false}) inOutYm: DxDateBoxComponent;

  dsSaWhCd = []; // 창고
  dsUser = []; // 사용자
  dsItemCd = [];
  dsCustGb = []; // 거래처구분
  dsItemCategory1Id = [];
  dsItemCategory2Id = [];
  dsItemCategory3Id = [];

  searchList = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sast110VO = {} as Sast110VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  key = ['wh_cd', 'item_cd'];

  now = this.utilService.getFormatMonth(new Date());

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    this.dsCustGb = [{cd: '2', nm: this.utilService.convert('sales.expt_cd')}
      , {cd: '4', nm: this.utilService.convert('sales.impt_cd')}
      , {cd: '3', nm: this.utilService.convert('sales.ptrn_cd')}];

    // 창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsSaWhCd = result.data;
      console.log(result.data);
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '3', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => {
      this.dsItemCategory1Id = result.data;
    });
    this.codeService.getItemCategory2(this.G_TENANT).subscribe(result => {
      this.dsItemCategory2Id = result.data;
    });
    this.codeService.getItemCategory3(this.G_TENANT).subscribe(result => {
      this.dsItemCategory3Id = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {

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
      this.mainFormData.inOutYm = document.getElementsByName('inOutYm').item(1).getAttribute('value');

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
            key: this.key,
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
