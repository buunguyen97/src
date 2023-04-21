import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import { Sarc050Service, Sarc050VO } from './sarc050.service';

@Component({
  selector: 'app-sarc050',
  templateUrl: './sarc050.component.html',
  styleUrls: ['./sarc050.component.scss']
})
export class Sarc050Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sarc050Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('fromRtnDate', {static: false}) fromRtnDate: DxDateBoxComponent;
  @ViewChild('toRtnDate', {static: false}) toRtnDate: DxDateBoxComponent;

  dsUser      = []; // 사용자
  dsItemCd    = []; // 품목
  dsUnitStyle  = []; // 단위
  dsExptCd    = []; // 수출사
  dsPtrnCd    = []; // 파트너사

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sarc050VO = {} as Sarc050VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  key = ['rtn_ord_no'];

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    // 품목(원부자재)
    this.bizService.getItem(this.G_TENANT,'','Y','2','','').subscribe(result => { this.dsItemCd = result.data; });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => { this.dsUnitStyle = result.data; });

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

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => { this.dsPtrnCd = result.data; });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromRtnDate.value = rangeDate.fromDate;
    this.toRtnDate.value = rangeDate.toDate;
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
      this.mainFormData.fromRtnDate = document.getElementsByName('fromRtnDate').item(1).getAttribute('value');
      this.mainFormData.toRtnDate = document.getElementsByName('toRtnDate').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);

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
  /**
   *  이벤트 메소드 END
   */
}
