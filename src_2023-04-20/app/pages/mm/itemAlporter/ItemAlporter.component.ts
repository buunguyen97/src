import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {Sasd030VO} from '../../sasd/sasd030/sasd030.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {BizCodeService} from '../../../shared/services/biz-code.service';
import {ItemAlporterService} from './ItemAlporter.service';

@Component({
  selector: 'app-item1',
  templateUrl: './ItemAlporter.component.html',
  styleUrls: ['./ItemAlporter.component.scss']
})
export class ItemAlporterComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;

  // 변수설정
  G_TENANT: any;
  mainCount: any;
  sessionUid: any;
  autocomplete: any;

  // main설정
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainFormData: Sasd030VO = {} as Sasd030VO;
  key = 'uid';

  // popup설정
  popupMode = 'Add';
  popupFormData: any = {};
  firstPopupData = '';

  dsITEM = [];
  dsYN = [];
  dsSTOUNIT = [];
  dsPRODGB = [];
  dsITEMGROP = [];
  dsITEMGB = [];
  dsITEMTP = [];
  dsUSER = [];
  dsActFlg = [];
  dsSetItemFlg = [];
  // dsACCOUNTSYS = [];
  dsItemCategory1Id = [];
  dsItemCategory2Id = [];
  dsItemCategory3Id = [];
  dsInvType = [];
  dsItemType = [];
  dsUnitStyle = [];
  dsCutYn = [];
  dsUser = [];

  dsSearchItemCategory2Id = [];
  dsSearchItemCategory3Id = [];
  dsPopupItemCategory2Id = [];
  dsPopupItemCategory3Id = [];

  categoryChangeFlg = true;

  GRID_STATE_KEY = 'mm_item1';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  // 의존성 주입
  constructor(
    public gridUtil: GridUtilService,
    public utilService: CommonUtilService,
    private service: ItemAlporterService,
    private codeService: CommonCodeService,
    private bizService: BizCodeService
  ) {
  }

  // HTML 동작 완료후 호출
  ngAfterViewInit(): void {
    this.initCode();
    this.mainForm.instance.focus();
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  // 바인딩 값을 읽을수 있다고 보장하는 상황에서 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.onSearchCategory1Changed = this.onSearchCategory1Changed.bind(this);
    this.onSearchCategory2Changed = this.onSearchCategory2Changed.bind(this);
    this.onPopupCategory1Changed = this.onPopupCategory1Changed.bind(this);
    this.onPopupCategory2Changed = this.onPopupCategory2Changed.bind(this);
    this.onPopupSave = this.onPopupSave.bind(this);
    this.onPopupClose = this.onPopupClose.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);

    this.onLwhChanged = this.onLwhChanged.bind(this);

    this.mainEntityStore = new ArrayStore({
      data: [],
      key: this.key
    });

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  initCode(): void {
    // 사용여부(영업)
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });
    // 세트상품여부
    this.codeService.getCode(this.G_TENANT, 'SETITEMFLG').subscribe(result => {
      this.dsSetItemFlg = result.data;
    });
    this.bizService.getItem(this.G_TENANT, 'Y', '', '', '', '').subscribe(result => {
      this.dsITEM = result.data;
    });
    // 생산구분
    this.codeService.getCode(this.G_TENANT, 'PRODGB').subscribe(result => {
      this.dsPRODGB = result.data;
    });
    // CALUNIT
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsSTOUNIT = result.data;
    });
    // 품목군
    this.codeService.getCode(this.G_TENANT, 'ITEMGROUP').subscribe(result => {
      this.dsITEMGROP = result.data;
    });
    // 품목구분
    this.codeService.getCode(this.G_TENANT, 'ITEMGB').subscribe(result => {
      this.dsITEMGB = result.data;
    });
    // 품목유형
    this.codeService.getCode(this.G_TENANT, 'ITEMTP').subscribe(result => {
      this.dsITEMTP = result.data;
    });
    // 유저정보
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUSER = result.data;
    });
    // 폼목카테고리1
    this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => {
      this.dsItemCategory1Id = result.data;
    });
    // 폼목카테고리2
    this.codeService.getItemCategory2(this.G_TENANT).subscribe(result => {
      this.dsItemCategory2Id = result.data;
    });
    // 폼목카테고리3
    this.codeService.getItemCategory3(this.G_TENANT).subscribe(result => {
      this.dsItemCategory3Id = result.data;
    });
    // 재고단위
    this.codeService.getCode(this.G_TENANT, 'INVTYPE').subscribe(result => {
      this.dsInvType = result.data;
    });
    // // 회계처리시스템
    // this.codeService.getCode(this.G_TENANT, 'ACCOUNTSYS').subscribe(result => {
    //   this.dsACCOUNTSYS = result.data;
    // });

    // 단위123유형
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnitStyle = result.data;
    });
    // 절단여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsCutYn = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  // 팝업에서 딱 한번 실행될 함수 모음
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});

    console.log(this.popupFormData);
  }

  // 팝업 오픈 후
  onPopupAfterOpen(): void {
    // this.popupForm.instance.getEditor('itemTypecd').option('disabled', true);
    this.sessionUid = this.utilService.getUserUid();
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('length3').option('value', '0');
      this.popupForm.instance.getEditor('width3').option('value', '0');
      this.popupForm.instance.getEditor('height3').option('value', '0');
      this.popupForm.instance.getEditor('grossWeight3').option('value', '0');
      this.popupForm.instance.getEditor('loadWeight1').option('value', '0');
      this.popupForm.instance.getEditor('loadWeight2').option('value', '0');

      this.popupForm.instance.getEditor('makeLossRank').option('value', '0');
      this.popupForm.instance.getEditor('itemSetFlg').option('value', 'N');
      this.popupForm.instance.getEditor('isSerial').option('value', 'N');
      this.popupForm.instance.getEditor('actFlg').option('value', 'Y');
      this.popupForm.instance.getEditor('p_Qty').option('value', '0');
      this.popupForm.instance.getEditor('p_Height').option('value', '0');
      this.popupForm.instance.getEditor('p_Odd').option('value', '0');

      this.popupForm.instance.getEditor('cutYn').option('value', 'N');

    }
    if (this.popupMode === 'Edit') {
      // this.deleteBtn.visible = true;
    }
    this.categoryChangeFlg = true;
  }

  // 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      // @ts-ignore
      this.mainFormData.tenant = this.G_TENANT;
      const ITEMADMINID = 'itemAdminId';
      this.mainFormData[ITEMADMINID] = this.utilService.getCommonItemAdminId();

      const result = await this.service.get(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    } else {
      alert('not allowed');
    }
  }

  //
  //     if (this.resultMsgCallback(result, 'Search')) {
  //       this.mainEntityStore = new ArrayStore({
  //         data: result.data,
  //         key: this.key
  //       });
  //       this.mainGridDataSource = new DataSource({
  //         store: this.mainEntityStore
  //       });
  //       this.mainGrid.focusedRowKey = null;
  //       this.mainGrid.paging.pageIndex = 0;
  //
  //       const keys = this.mainGrid.instance.getSelectedRowKeys();
  //       this.mainGrid.instance.deselectRows(keys);
  //     } else {
  //       return;
  //     }
  //   }
  // }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.findItemFull(data);
    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;

      this.firstPopupData = JSON.stringify(this.popupFormData);
    } else {
      return;
    }
  }

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;
    if (e.element.id === 'Open') {
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.popupMode = 'Edit';
      this.categoryChangeFlg = false;
      this.dsPopupItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.data.itemCategory1Id);
      this.dsPopupItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.data.itemCategory2Id);
      this.onPopupSearch(e.data).then(
        () => this.popupForm.instance.getEditor('itemTypecd').focus()
      );
    }
  }


  // 팝업창 저장
  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      this.popupFormData.itemAdminId = this.utilService.getCommonItemAdminId();
      try {
        let result;
        if (this.popupMode === 'Add') {
          result = await this.service.save(this.popupFormData);
        } else {

          result = await this.service.update(this.popupFormData);
        }

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');

          this.popup.visible = false;
          this.onSearch();
          this.popupForm.instance.resetValues();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 팝업을 닫은 후
  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
  }

  // // 실제 저장기능
  // async execSave(): Promise<boolean> {
  //   try {
  //     const lastPopupData: string = JSON.stringify(this.popupFormData);
  //     if (this.firstPopupData === lastPopupData) {
  //       this.utilService.notify_error('변경항목이 없습니다.');
  //       return;
  //     }
  //
  //     let result;
  //
  //     this.popupFormData.createdby = this.sessionUid;
  //     this.popupFormData.modifiedby = this.sessionUid;
  //
  //     // let resultCount;
  //
  //     // resultCount = await this.service.mainValidation(this.popupFormData);
  //     // this.mainCount = resultCount.data;
  //
  //     if (this.mainCount.count === 1 && this.popupMode === 'Add') {
  //       const msg = '중복된 제품코드입니다.';
  //       this.utilService.notify_error(msg);
  //       return;
  //     }
  //     const confirmMsg = this.utilService.convert('confirmExecute', '저장');
  //     if (!await this.utilService.confirm(confirmMsg)) {
  //       return;
  //     }
  //     if (this.popupMode === 'Add') { // popupMode가 Add로 들어오면
  //       result = await this.service.save(this.popupFormData); // 서비스의 세이브로
  //     } else {
  //       result = await this.service.update(this.popupFormData); // 그외엔 업데이트로
  //     }
  //
  //     if (this.resultMsgCallback(result, 'Save')) {
  //       // 물류 제품 송신 I/F
  //       const vo = {
  //         sendType: 'item'
  //       };
  //
  //       const apiResult = await this.bizService.sendApi(vo);
  //
  //       if (!apiResult.success) {
  //         this.utilService.notify_error(JSON.stringify(apiResult));
  //         // return;
  //       } else {
  //         console.log('I/F Success');
  //       }
  //
  //       this.popupFormData = result.data;
  //       return true;
  //     } else {
  //       return false;
  //     }
  //
  //   } catch {
  //     this.utilService.notify_error('There was an error!');
  //     return false;
  //   }
  //   return false;
  // }

  async popupDeleteClick(e): Promise<void> {
    try {
      const result = await this.service.delete(this.popupFormData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popup.visible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.mainForm.instance.focus();
  }

  initForm(): void {
    this.mainForm.instance.getEditor('actFlg').option('value', 'Y');

    this.mainForm.instance.focus();
  }

  onSearchCategory1Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory2Id').option('value', null);
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);

    this.dsSearchItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.value);
  }

  onSearchCategory2Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);
    this.dsSearchItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.value);
  }

  onPopupCategory1Changed(e): void {
    if (!this.categoryChangeFlg) {
      return;
    }
    this.popupForm.instance.getEditor('itemCategory2Id').option('value', null);
    this.popupForm.instance.getEditor('itemCategory3Id').option('value', null);

    this.dsPopupItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.value);
  }

  onPopupCategory2Changed(e): void {
    if (!this.categoryChangeFlg) {
      return;
    }
    this.popupForm.instance.getEditor('itemCategory3Id').option('value', null);
    this.dsPopupItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.value);
  }

  onLwhChanged(e): void {
    if (this.popupForm) {
      const specNm = this.popupForm.instance.getEditor('length3').option('value') + 'X' +
        this.popupForm.instance.getEditor('width3').option('value') + 'X' + this.popupForm.instance.getEditor('height3').option('value');
      const itemCbm = this.popupForm.instance.getEditor('length3').option('value') / 1000
        * this.popupForm.instance.getEditor('width3').option('value') / 1000
        * this.popupForm.instance.getEditor('height3').option('value') / 1000;
      this.popupForm.instance.getEditor('spec').option('value', specNm);
      this.popupForm.instance.getEditor('cbm').option('value', Math.trunc(itemCbm * 1000) / 1000);
    }
  }

  // 규격 표현식
  async initSpec(): Promise<void> {
    const input = document.getElementsByName('spec').item(0) as HTMLInputElement;
    this.mainFormData.spec_nm = input.value;
    input.addEventListener('change', () => {
    });
  }

  // 메세지라인 함수
  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }
}
