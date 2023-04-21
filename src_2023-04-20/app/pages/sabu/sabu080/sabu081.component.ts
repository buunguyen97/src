import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {FormData, Sabu081Service, Sabu080VO} from './sabu081.service';


@Component({
  selector: 'app-sabu081',
  templateUrl: './sabu081.component.html',
  styleUrls: ['./sabu081.component.scss']
})
export class Sabu081Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu081Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
    this.onValueChangedPurCd = this.onValueChangedPurCd.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.purCancel = this.purCancel.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('fromChkDate', {static: false}) fromChkDate: DxDateBoxComponent;
  @ViewChild('toChkDate', {static: false}) toChkDate: DxDateBoxComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  dsCustCd = []; // 거래처
  dsMonyUnit = []; // 화폐
  dsWrkStat = []; // 작업상태
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsWhCd = []; // 창고
  filteredWhCd = [];
  dsCopyWhCd = [];
  dsDamageFlg = [];
  dsPtrnCd = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sabu080VO = {} as Sabu080VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = this.utilService.convert('/sabu/sabu081');  // 구매발주확정
  popupFormData: FormData;

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  key = ['inp_no', 'item_cd'];
  key2 = 'uid';
  searchList = [];

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 작업상태
    this.dsWrkStat = [{
      cd: '1',
      nm: this.utilService.convert1('sales.incoming_inspection', '입고검사', 'Incoming Inspection')
    },
      {cd: '2', nm: this.utilService.convert1('sales.Incoming', '입고', 'Incoming')}
    ];

    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
    });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 품목(원부자재)
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

    // 매입처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromChkDate.value = rangeDate.fromDate;
    this.toChkDate.value = rangeDate.toDate;
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
      this.mainFormData.fromChkDate = document.getElementsByName('fromChkDate').item(1).getAttribute('value');
      this.mainFormData.toChkDate = document.getElementsByName('toChkDate').item(1).getAttribute('value');

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

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupFormData.inp_no) {
      const para: any = this.popupFormData;

      const result = await this.service.mainInfo(para);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        // 팝업 폼 데이터 세팅
        this.popupFormData = result.data.info;

        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.gridList,
            key: this.key2
          }
        );
        this.dsItemGrid = new DataSource({
          store: this.entityStoreItemGrid
        });
        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Modify', {...e.data});
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  /**
   *  이벤트 메소드 END
   */

  onValueChangedPurCd(e): void {
    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.mainForm.instance.getEditor('purCd').option('value'));
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  showPopup(popupMode, data): void {

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;

    this.popupVisible = true;

    this.onSearchPopup();
  }

  popupShown(e): void {
    this.popupFormData.ptrn_cd = this.utilService.getCompany();

    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);

    // this.popupForm.instance.getEditor('chk_dt').option('value', this.gridUtil.getToday());
    // this.popupForm.instance.getEditor('chk_dt').focus();

    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  async purCancel(e): Promise<void> {
    // const purData = this.mainGrid.instance.getSelectedRowsData();

    try {
      const confirmMsg = this.utilService.convert1('Execute_purcancel', '구매발주확정을 취소하시겠습니까?');
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const result = await this.service.purCancel(this.popupFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }

  }

}
