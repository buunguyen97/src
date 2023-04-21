import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import { Saor190Service, Saor190VO } from './saor190.service';

@Component({
  selector: 'app-saor190',
  templateUrl: './saor190.component.html',
  styleUrls: ['./saor190.component.scss']
})
export class Saor190Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor190Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
    this.ordGbNm = this.ordGbNm.bind(this);

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('fromRentDt', {static: false}) fromRentDt: DxDateBoxComponent;
  @ViewChild('toRentDt', {static: false}) toRentDt: DxDateBoxComponent;

  dsOrdGb     = []; // 주문구분
  dsExptCd    = []; // 수출사
  dsPtrnCd    = []; // 파트너사
  dsMonyUnit  = []; // 화폐
  dsUser      = []; // 사용자
  dsImptCd    = []; // 수입사
  dsWhCd      = []; // 창고
  dsPort      = []; // 항구

  dsExptCdAll = []; // 전체수출사
  dsPtrnCdAll = []; // 전체파트너사
  dsImptCdAll = []; // 전체수입사

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Saor190VO = {} as Saor190VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  key = ['rent_dt', 'out_ord_no'];

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {

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

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => { this.dsPtrnCd = result.data; });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => { this.dsMonyUnit = result.data; });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    // 수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => { this.dsImptCd = result.data; });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => { this.dsWhCd = result.data; });

    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => { this.dsPort = result.data; });

    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => { this.dsExptCdAll = result.data; });

    // 전체파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => { this.dsPtrnCdAll = result.data; });

    // 전체수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', '', '', '').subscribe(result => { this.dsImptCdAll = result.data; });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromRentDt.value = rangeDate.fromDate;
    this.toRentDt.value = rangeDate.toDate;
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
      this.mainFormData.fromRentDt = document.getElementsByName('fromRentDt').item(1).getAttribute('value');
      this.mainFormData.toRentDt = document.getElementsByName('toRentDt').item(1).getAttribute('value');

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
