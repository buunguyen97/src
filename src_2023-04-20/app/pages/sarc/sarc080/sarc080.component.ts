import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import { Sarc080Service, Sarc080VO } from './sarc080.service';

@Component({
  selector: 'app-sarc080',
  templateUrl: './sarc080.component.html',
  styleUrls: ['./sarc080.component.scss']
})
export class Sarc080Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sarc080Service,
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

  @ViewChild('fromRentEndDate', {static: false}) fromRentEndDate: DxDateBoxComponent;
  @ViewChild('toRentEndDate', {static: false}) toRentEndDate: DxDateBoxComponent;

  dsUser      = []; // 사용자
  dsItemCd    = []; // 품목
  dsUnitStyle  = []; // 단위
  dsPtrnCd   = []; // 파트너사
  dsImptCd = [];
  dsCountry = []; // 국가

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sarc080VO = {} as Sarc080VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  key = ['out_ord_no', 'item_cd'];

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    // 품목(원부자재)
    this.bizService.getItem(this.G_TENANT, '', 'Y', '2', '', '').subscribe(result => { this.dsItemCd = result.data; });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => { this.dsUnitStyle = result.data; });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => { this.dsPtrnCd = result.data; });

    // 수입사 - 파트너사
    if (this.utilService.getCompany() === 'O1000') {
      this.bizService.getImptPtrn(this.G_TENANT).subscribe(result => {
        this.dsImptCd = result.data;
      });
    } else {
      this.bizService.getImptPtrn(this.G_TENANT, this.utilService.getCompany()).subscribe(result => {
        this.dsImptCd = result.data;
      });
    }

    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => { this.dsCountry = result.data; });

  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    // this.fromRentEndDate.value = rangeDate.fromDate;
    // this.toRentEndDate.value = rangeDate.toDate;

    if ( this.userGroup === '3' ) {
      this.mainForm.instance.getEditor('rtnPtrnCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('rtnPtrnCd').option('disabled', true);
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
      this.mainFormData.fromRentEndDate = document.getElementsByName('fromRentEndDate').item(1).getAttribute('value');
      this.mainFormData.toRentEndDate = document.getElementsByName('toRentEndDate').item(1).getAttribute('value');

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

  // 회수예정량 표현식
  calcRtnScheQty(rowData): any {
    return rowData.out_qty - rowData.bp_qty - rowData.collection_qty;
  }
}
